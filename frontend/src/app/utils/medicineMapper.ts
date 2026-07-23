/**
 * Utility to map medicine data from NLP API format to React app format
 */

import type { Medicine } from '../data/medicines';
import type { MedicineFromAPI } from '../types/chatbot';
import { medicines as existingMedicines } from '../data/medicines';

/**
 * Map a single medicine from API format to React format
 * Tries to find matching medicine in existing data by name (case-insensitive)
 * Falls back to creating a mapped version with default values
 */
export function mapMedicineFromAPI(apiMedicine: any, contextMedicines?: Medicine[]): Medicine {
  // Try to find existing medicine by name (case-insensitive match)
  const apiName = apiMedicine.name || '';
  const searchList = contextMedicines && contextMedicines.length > 0 ? contextMedicines : existingMedicines;
  const existingMedicine = searchList.find(
    m => m.name.toLowerCase().includes(apiName.toLowerCase()) ||
         apiName.toLowerCase().includes(m.name.toLowerCase())
  );

  // If found, return existing medicine (has correct price, stock, photos)
  if (existingMedicine) {
    return existingMedicine;
  }

  // Otherwise, create mapped medicine with dummy data
  // Generate price based on name length hash (consistent random)
  const priceHash = apiName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const dummyPrice = 5000 + (priceHash % 45000); // Range: Rp 5.000 - Rp 50.000
  const dummyStock = 50 + (priceHash % 150); // Range: 50 - 200

  return {
    id: (apiMedicine.id || 0) + 10000, // Offset to avoid ID collision
    name: apiName,
    category: apiMedicine.category || mapCategoryFromIndonesian(apiMedicine.kategori_id || []),
    price: apiMedicine.price || dummyPrice,
    stock: apiMedicine.stock || dummyStock,
    image: '💊',
    photo: apiMedicine.photo || apiMedicine.image_url || '',
    description: apiMedicine.description || (apiMedicine.uses ? apiMedicine.uses.substring(0, 100) + '...' : ''),
    indication: apiMedicine.indication || (apiMedicine.uses ? `Indikasi: ${apiMedicine.uses}` : ''),
    dosage: apiMedicine.dosage || 'Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.',
    ingredients: Array.isArray(apiMedicine.ingredients) ? apiMedicine.ingredients : 
                 (apiMedicine.composition ? [apiMedicine.composition.split(',')[0] || 'Bahan aktif', 'Eksipien q.s.'] : ['Bahan aktif', 'Eksipien q.s.']),
    benefits: Array.isArray(apiMedicine.benefits) ? apiMedicine.benefits : [
      'Terbukti efektif secara klinis',
      'Tersedia di apotek Indonesia',
      'Konsultasikan dengan apoteker'
    ]
  };
}

/**
 * Map array of medicines from API
 */
export function mapMedicinesFromAPI(apiMedicines: MedicineFromAPI[], contextMedicines?: Medicine[]): Medicine[] {
  return apiMedicines.map(m => mapMedicineFromAPI(m, contextMedicines));
}

/**
 * Map Indonesian category names to React app categories
 */
function mapCategoryFromIndonesian(kategoriId: string[]): string {
  if (!kategoriId || kategoriId.length === 0) return 'Obat Umum';

  const categoryMap: Record<string, string> = {
    'Nyeri & Demam': 'Pereda Nyeri',
    'Batuk & Flu': 'Obat Batuk',
    'Antibiotik': 'Antibiotik',
    'Lambung & Pencernaan': 'Lambung',
    'Alergi': 'Anti Alergi',
    'Vitamin & Suplemen': 'Vitamin',
    'Kulit': 'Salep Kulit',
    'Diabetes': 'Diabetes',
    'Hipertensi': 'Hipertensi',
    'Lainnya': 'Obat Umum'
  };

  // Return first matching category
  for (const cat of kategoriId) {
    if (categoryMap[cat]) {
      return categoryMap[cat];
    }
  }

  return kategoriId[0] || 'Obat Umum';
}

/**
 * Search medicines in existing data by name or indication
 */
export function searchMedicinesBySymptom(symptom: string): Medicine[] {
  const query = symptom.toLowerCase();
  
  return existingMedicines.filter(medicine => {
    const name = medicine.name.toLowerCase();
    const indication = medicine.indication.toLowerCase();
    const description = medicine.description.toLowerCase();
    const category = medicine.category.toLowerCase();
    
    return name.includes(query) || 
           indication.includes(query) || 
           description.includes(query) ||
           category.includes(query);
  }).sort((a, b) => a.price - b.price); // Sort by price ascending
}
