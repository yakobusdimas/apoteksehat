/**
 * MedicinesContext — global medicine state fetched from backend API.
 * Falls back to local data when API is unreachable.
 * Includes sessionStorage caching with 5-minute TTL to reduce redundant API calls.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { medicineAPI, Medicine as APIMedicine, MedicineListParams } from '../services/medicineAPI';

/** Medicine type used in the frontend (compatible with both static and API data) */
export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  photo: string;
  description: string;
  indication: string;
  dosage: string;
  ingredients: string[];
  benefits: string[];
  sideEffects?: string;
  expiry?: string;
  type?: string;
}

interface MedicinesContextType {
  medicines: Medicine[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  listMedicines: (params?: MedicineListParams) => Promise<{
    medicines: Medicine[];
    total: number;
    page: number;
    perPage: number;
    pages: number;
    error?: string;
  }>;
  searchMedicines: (q: string) => Promise<Medicine[]>;
  getMedicineById: (id: number) => Promise<Medicine | null>;
}

const MedicinesContext = createContext<MedicinesContextType | undefined>(undefined);

// ─── sessionStorage Cache ────────────────────────────────────────────────────

const CACHE_KEY = 'apotek_medicines_cache_v2';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

interface CacheEntry {
  medicines: Medicine[];
  categories: string[];
  fetchedAt: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.fetchedAt;
    if (age > CACHE_TTL_MS || !Array.isArray(entry.medicines) || entry.medicines.length === 0) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCache(medicines: Medicine[], categories: string[]) {
  try {
    const entry: CacheEntry = { medicines, categories, fetchedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage penuh atau tidak tersedia — fail silently
  }
}

function invalidateCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

// ─── Normalize ───────────────────────────────────────────────────────────────

/**
 * Normalize a backend medicine to the frontend Medicine shape.
 * Backend returns ingredients/benefits as strings; frontend expects string[].
 */
function normalizeMedicine(apiMed: APIMedicine): Medicine {
  return {
    id: apiMed.id,
    name: apiMed.name,
    category: apiMed.category,
    price: apiMed.price,
    stock: apiMed.stock,
    image: '💊',
    photo: apiMed.photo || `https://placehold.co/400x300/e0f2fe/0369a1?text=${encodeURIComponent(apiMed.name)}`,
    description: apiMed.description || '',
    indication: apiMed.indication || '',
    dosage: apiMed.dosage || '',
    ingredients: Array.isArray(apiMed.ingredients)
      ? apiMed.ingredients
      : typeof apiMed.ingredients === 'string' && apiMed.ingredients
        ? apiMed.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    benefits: Array.isArray(apiMed.benefits)
      ? apiMed.benefits
      : typeof apiMed.benefits === 'string' && apiMed.benefits
        ? apiMed.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
    sideEffects: apiMed.sideEffects || (apiMed as any).side_effects || '',
    expiry: (apiMed as any).expiry || '',
    type: (apiMed as any).type || '',
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function MedicinesProvider({ children }: { children: ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async (force = false) => {
    // Gunakan cache jika masih valid dan tidak dipaksa refetch
    if (!force) {
      const cached = readCache();
      if (cached) {
        setMedicines(cached.medicines);
        setCategories(cached.categories);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const [medsResult, catsResult] = await Promise.all([
        medicineAPI.list({ per_page: 1000 }),
        medicineAPI.categories(),
      ]);

      if (medsResult.error) {
        setError(medsResult.error);
        setMedicines([]);
      } else {
        const normalized = medsResult.medicines.map(normalizeMedicine);
        const cats = !catsResult.error ? catsResult.categories : [];
        setMedicines(normalized);
        setCategories(cats);
        // Simpan ke cache
        writeCache(normalized, cats);
      }

      if (!catsResult.error) {
        setCategories(catsResult.categories);
      }
    } catch (err) {
      setError('Gagal memuat data obat dari server.');
      setMedicines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // refetch publik — selalu paksa ke API dan perbarui cache
  const refetch = useCallback(async () => {
    invalidateCache();
    await fetchMedicines(true);
  }, [fetchMedicines]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const listMedicines = useCallback(async (params?: MedicineListParams) => {
    try {
      const result = await medicineAPI.list(params);
      return {
        medicines: result.medicines.map(normalizeMedicine),
        total: result.total,
        page: result.page,
        perPage: result.per_page,
        pages: result.pages,
        error: result.error,
      };
    } catch {
      return {
        medicines: [],
        total: 0,
        page: params?.page || 1,
        perPage: params?.per_page || 40,
        pages: 0,
        error: 'Gagal memuat data obat dari server.',
      };
    }
  }, []);

  const searchMedicines = useCallback(async (q: string): Promise<Medicine[]> => {
    if (!q.trim()) return medicines;
    try {
      const result = await medicineAPI.search(q);
      if (result.error) return [];
      return result.medicines.map(normalizeMedicine);
    } catch {
      return [];
    }
  }, [medicines]);

  const getMedicineById = useCallback(async (id: number): Promise<Medicine | null> => {
    // Try in-memory first, then cache, then API
    const inMemory = medicines.find(m => m.id === id);
    if (inMemory) return inMemory;

    try {
      const result = await medicineAPI.getById(id);
      if (result.error || !result.medicine) return null;
      return normalizeMedicine(result.medicine);
    } catch {
      return null;
    }
  }, [medicines]);

  return (
    <MedicinesContext.Provider value={{
      medicines,
      categories,
      isLoading,
      error,
      refetch,
      listMedicines,
      searchMedicines,
      getMedicineById,
    }}>
      {children}
    </MedicinesContext.Provider>
  );
}

export function useMedicines() {
  const context = useContext(MedicinesContext);
  if (!context) throw new Error('useMedicines must be used within MedicinesProvider');
  return context;
}
