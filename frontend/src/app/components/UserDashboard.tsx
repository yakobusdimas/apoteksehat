import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import {
  ShoppingCart, Search, LogOut, Heart, Package,
  Trash2, Plus, Minus, CreditCard, Home,
  Eye, ChevronDown, SortAsc, SortDesc, ArrowUpDown,
  MapPin, Phone, Mail, Clock, Filter, RefreshCw
} from 'lucide-react';
import { ApotekLogo } from './ApotekLogo';
import { useMedicines, Medicine } from '../context/MedicinesContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ordersAPI from '../services/ordersAPI';
import { toast } from 'sonner';
import FloatingChatbot from './FloatingChatbot';
import WelcomeBanner from './ui/WelcomeBanner';
import DashboardStats from './ui/DashboardStats';
import EmptyState from './ui/EmptyState';
import { GridSkeleton } from './ui/LoadingState';
import ProfileCompletionModal from './ProfileCompletionModal';
import ThemeToggle from './ThemeToggle';

const DEFAULT_CAT_META = { emoji: '💊', bg: 'bg-emerald-50', text: 'text-emerald-700', glow: 'rgba(16,185,129,0.12)' };
const categoryMeta: Record<string, { emoji: string; bg: string; text: string; glow: string }> = {
  'Nyeri & Demam':                 { emoji: '💊', bg: 'bg-blue-50',    text: 'text-blue-700',    glow: 'rgba(59,130,246,0.12)'  },
  'Obat Batuk':                    { emoji: '🤧', bg: 'bg-orange-50',  text: 'text-orange-700',  glow: 'rgba(249,115,22,0.12)'  },
  'Flu & Pilek':                   { emoji: '🌡️', bg: 'bg-purple-50',  text: 'text-purple-700',  glow: 'rgba(168,85,247,0.12)'  },
  'Lambung & Maag':                { emoji: '🛡', bg: 'bg-yellow-50',  text: 'text-yellow-700',  glow: 'rgba(234,179,8,0.12)'   },
  'Vitamin & Suplemen':            { emoji: '✨', bg: 'bg-emerald-50', text: 'text-emerald-700', glow: 'rgba(16,185,129,0.12)'  },
  'Pencernaan & Diare':            { emoji: '🍃', bg: 'bg-teal-50',    text: 'text-teal-700',    glow: 'rgba(20,184,166,0.12)'  },
  'Alergi & Gatal':                { emoji: '🌿', bg: 'bg-lime-50',    text: 'text-lime-700',    glow: 'rgba(101,163,13,0.12)'  },
  'Obat Kulit & Luka':             { emoji: '🩹', bg: 'bg-rose-50',    text: 'text-rose-700',    glow: 'rgba(244,63,94,0.12)'   },
  'Antijamur & Kulit':             { emoji: '🔬', bg: 'bg-red-50',     text: 'text-red-700',     glow: 'rgba(239,68,68,0.12)'   },
  'Obat Oles Nyeri':               { emoji: '🧴', bg: 'bg-amber-50',   text: 'text-amber-700',   glow: 'rgba(245,158,11,0.12)'  },
  'Mata & Telinga':                { emoji: '👁', bg: 'bg-sky-50',     text: 'text-sky-700',     glow: 'rgba(14,165,233,0.12)'  },
  'Mulut & Tenggorokan':           { emoji: '🫁', bg: 'bg-indigo-50',  text: 'text-indigo-700',  glow: 'rgba(99,102,241,0.12)'  },
  'Herbal & Tradisional':          { emoji: '🌱', bg: 'bg-green-50',   text: 'text-green-700',   glow: 'rgba(34,197,94,0.12)'   },
  'Perawatan Hidung & Pernapasan': { emoji: '💨', bg: 'bg-cyan-50',    text: 'text-cyan-700',    glow: 'rgba(6,182,212,0.12)'   },
};

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-az' | 'name-za';
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'default',    label: 'Default'          },
  { value: 'price-asc',  label: 'Harga Terendah'  },
  { value: 'price-desc', label: 'Harga Tertinggi' },
  { value: 'name-az',    label: 'Nama A–Z'         },
  { value: 'name-za',    label: 'Nama Z–A'         },
];

const PER_PAGE = 12;

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { categories: apiCategories, listMedicines } = useMedicines();

  // ── Search & filter state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery]           = useState('');
  const [debouncedQuery, setDebouncedQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy]                     = useState<SortOption>('default');
  const [activeTab, setActiveTab]               = useState('catalog');
  const [favorites, setFavorites]               = useState<Set<number>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // ── API Orders state (Bug #8 fix) ──────────────────────────────
  const [apiOrders, setApiOrders]        = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [cancellingId, setCancellingId]   = useState<number | null>(null); // Bug #B

  // ── Catalog pagination state ───────────────────────────────────────
  const [catalogMedicines, setCatalogMedicines] = useState<Medicine[]>([]);
  const [catalogLoading, setCatalogLoading]     = useState(false);
  const [currentPage, setCurrentPage]           = useState(1);
  const [totalProducts, setTotalProducts]       = useState(0);
  const [totalPages, setTotalPages]             = useState(0);

  // ── Debounce search query 300ms ────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300);
  };

  // ── Derived categories (Semua + dynamic from API) ──────────────────
  const categoryOptions = useMemo(() => [
    'Semua',
    ...apiCategories.filter(Boolean),
  ], [apiCategories]);

  // ── Fetch catalog page whenever filter/page changes ───────────────
  const fetchCatalog = useCallback(async (page: number) => {
    setCatalogLoading(true);
    const params: { page: number; per_page: number; q?: string; category?: string } = { page, per_page: PER_PAGE };
    if (debouncedQuery.trim()) params.q = debouncedQuery.trim();
    if (selectedCategory !== 'Semua') params.category = selectedCategory;
    const result = await listMedicines(params);
    let items = result.medicines;
    // Client-side sort on current page
    switch (sortBy) {
      case 'price-asc':  items = [...items].sort((a, b) => a.price - b.price); break;
      case 'price-desc': items = [...items].sort((a, b) => b.price - a.price); break;
      case 'name-az':    items = [...items].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-za':    items = [...items].sort((a, b) => b.name.localeCompare(a.name)); break;
    }
    setCatalogMedicines(items);
    setTotalProducts(result.total);
    setTotalPages(result.pages);
    setCatalogLoading(false);
  }, [debouncedQuery, selectedCategory, sortBy, listMedicines]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedCategory, sortBy]);

  // Fetch catalog on page or filter change
  useEffect(() => {
    if (activeTab === 'catalog') fetchCatalog(currentPage);
  }, [currentPage, fetchCatalog, activeTab]);

  // ── Fetch orders from API (Bug #8 fix) ────────────────────────────
  const fetchApiOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const result = await api.get<{ status: string; orders: any[] }>('/api/orders');
      if (!result.error && result.data?.orders) {
        setApiOrders(result.data.orders);
      }
    } catch {
      // silently fail — user tidak perlu tahu jika pesanan gagal dimuat
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load orders ketika tab pesanan dibuka
  useEffect(() => {
    if (activeTab === 'orders') fetchApiOrders();
  }, [activeTab, fetchApiOrders]);

  // ── Bug #B fix: Cancel order handler ───────────────────────────────
  const handleCancelOrder = useCallback(async (orderId: number, orderCode: string) => {
    if (!window.confirm(`Batalkan pesanan ${orderCode}?\nStok akan dikembalikan otomatis.`)) return;
    setCancellingId(orderId);
    try {
      const result = await ordersAPI.cancel(orderId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Pesanan ${orderCode} berhasil dibatalkan.`);
        fetchApiOrders(); // refresh list
      }
    } catch {
      toast.error('Gagal membatalkan pesanan. Coba lagi.');
    } finally {
      setCancellingId(null);
    }
  }, [fetchApiOrders]);

  // Trigger profile completion modal on mount if profile is incomplete
  useEffect(() => {
    if (user && !user.phone?.trim() && !user.address?.trim()) {
      setShowCompletionModal(true);
    }
  }, [user]);

  // ── Orders helpers ───────────────────────────────────────
  const dashboardStats = {
    totalOrders:    apiOrders.length,
    totalSpent:     apiOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
    totalFavorites: favorites.size,
    rewardPoints:   apiOrders.length * 100,
  };

  // Pagination helpers
  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const endItem   = Math.min(currentPage * PER_PAGE, totalProducts);

  // Bug #11 fix: logout juga membersihkan cart agar tidak bocor ke user lain
  const handleLogout = () => { clearCart(); logout(); toast.success('Logout berhasil'); navigate('/'); };
  const handleCheckout  = () => { if (cart.length === 0) { toast.error('Keranjang masih kosong'); return; } navigate('/checkout'); };
  const handleAddToCart = (med: Medicine, e?: React.MouseEvent) => {
    e?.stopPropagation();
    addToCart(med);
    toast.success(`${med.name} ditambahkan`, { icon: '🛒' });
  };
  const handleBuyNow = (med: Medicine, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate('/checkout', { state: { buyNowItem: { ...med, quantity: 1 } } });
  };
  const toggleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Dihapus dari favorit'); }
      else              { next.add(id);    toast.success('Ditambahkan ke favorit', { icon: '❤️' }); }
      return next;
    });
  };

  const cartTotal  = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-[color:var(--border)] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center">
                <ApotekLogo size="md" variant="icon" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-[color:var(--foreground)] leading-tight">Apotek Sehat</p>
                <p className="text-[10px] font-medium text-emerald-600">Dashboard Pengguna</p>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
                <Input
                  placeholder="Cari obat, kategori, komposisi..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="pl-10 h-9 bg-[color:var(--secondary)]/60 border-[color:var(--border)] rounded-xl text-sm focus:bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/cart')}
                className="relative flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-3 py-2 rounded-xl text-sm transition-all border border-emerald-200/60"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:block">Keranjang</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in">
                    {totalItems}
                  </span>
                )}
              </button>

              <div className="hidden md:flex items-center gap-2.5 bg-[color:var(--secondary)]/60 rounded-xl px-3 py-2 border border-[color:var(--border)]">
                <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-[color:var(--muted-foreground)]">{user?.email}</p>
                </div>
              </div>

              <ThemeToggle />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-xl text-sm font-medium transition-all border border-transparent hover:border-red-100"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Keluar</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-3 md:hidden flex items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--muted-foreground)]" />
              <Input
                placeholder="Cari obat, kategori, komposisi..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="pl-10 h-10 bg-[color:var(--secondary)]/60 border-[color:var(--border)] rounded-xl text-sm focus:bg-white"
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main id="main-content" className="max-w-7xl mx-auto px-5 py-6 space-y-5 flex-1">

        <WelcomeBanner userName={user?.name || 'User'} onNavigateTab={setActiveTab} />

        {/* Delivery Address Banner */}
        <div className="bg-[#f2fae8] rounded-2xl border border-emerald-500 shadow-sm p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] bg-[#00923f] text-white shadow-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-black text-base">Kirim Obat 24 menit ke:</p>
              <p className="text-sm text-gray-800 truncate mt-0.5">
                {user?.address ? `${user.postalCode ? `${user.postalCode} ` : ''}${user.address}${user.city ? `, ${user.city}` : ''}` : 'Belum mengatur alamat pengiriman. Klik Ubah untuk menambahkan.'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-[#00923f] hover:bg-emerald-100 font-bold shrink-0 h-9 px-4 text-base"
            onClick={() => setShowCompletionModal(true)}
          >
            Ubah
          </Button>
        </div>


        {/* ── TABS ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 bg-white rounded-2xl p-1.5 shadow-sm border border-[color:var(--border)]">
          {[
            { id: 'catalog', label: 'Katalog Obat',     icon: <Home className="h-4 w-4" /> },
            { id: 'orders',  label: 'Riwayat Pesanan',  icon: <Package className="h-4 w-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'orders') {
                  navigate('/orders');
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-emerald-200/50'
                  : 'text-[color:var(--muted-foreground)] hover:bg-[color:var(--secondary)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>


        {/* ══ CATALOG TAB ══════════════════════════════════════════════ */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm px-4 md:px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-bold text-[color:var(--foreground)] text-base">Katalog Obat</h3>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-[color:var(--muted-foreground)] hidden md:block" />
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-[color:var(--secondary)]/50 border border-[color:var(--border)] rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/40 transition-colors h-9"
                  >
                    {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--muted-foreground)] pointer-events-none" />
                </div>
                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortOption)}
                    className="w-full appearance-none bg-[color:var(--secondary)]/50 border border-[color:var(--border)] rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/40 transition-colors h-9"
                  >
                    {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--muted-foreground)] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Summary row */}
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {totalProducts > 0
                  ? `Menampilkan ${startItem}–${endItem} dari ${totalProducts} produk`
                  : catalogLoading ? 'Memuat produk...' : 'Tidak ada produk ditemukan'}
              </p>
              {totalPages > 1 && (
                <p className="text-xs text-[color:var(--muted-foreground)]">Halaman {currentPage} dari {totalPages}</p>
              )}
            </div>

            {/* Medicine grid */}
            {catalogLoading ? (
              <GridSkeleton count={12} />
            ) : catalogMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[color:var(--border)]">
                <span className="text-6xl">🔍</span>
                <p className="font-semibold text-[color:var(--foreground)]">Produk tidak ditemukan</p>
                <p className="text-sm text-[color:var(--muted-foreground)]">Coba kata kunci lain atau ubah filter kategori</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {catalogMedicines.map(medicine => {
                  const meta = categoryMeta[medicine.category] || DEFAULT_CAT_META;
                  return (
                    <Card
                      key={medicine.id}
                      className="hover-lift transition-all cursor-pointer group overflow-hidden border-[color:var(--border)]"
                      onClick={() => navigate(`/medicine/${medicine.id}`)}
                    >
                      {/* Photo — lazy loaded */}
                      <div className={`relative h-44 overflow-hidden ${meta.bg}`}>
                        {medicine.photo ? (
                          <img
                            src={medicine.photo}
                            alt={medicine.name}
                            loading="lazy"
                            decoding="async"
                            width={400}
                            height={176}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement!;
                              parent.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center gap-2"><span class="text-5xl">${meta.emoji}</span><span class="text-xs text-gray-400 font-medium">${medicine.category}</span></div>`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <span className="text-5xl">{meta.emoji}</span>
                            <span className="text-xs text-gray-400 font-medium">{medicine.category}</span>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-primary rounded-full p-2 shadow-lg">
                            <Eye className="h-5 w-5" />
                          </span>
                        </div>

                        {/* Favorite & stock */}
                        <button
                          onClick={e => toggleFav(medicine.id, e)}
                          className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow hover:scale-110 transition-all z-10"
                        >
                          <Heart className={`h-3.5 w-3.5 ${favorites.has(medicine.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                        </button>
                        <Badge className="absolute top-2 right-2 bg-white/90 text-primary border-0 shadow-sm text-[10px] font-bold">
                          Stok: {medicine.stock}
                        </Badge>
                      </div>

                      <CardHeader className="pb-2 pt-3">
                        <Badge variant="secondary" className={`border-0 text-[10px] font-bold w-fit ${meta.bg} ${meta.text}`}>
                          {meta.emoji} {medicine.category}
                        </Badge>
                        <CardTitle className="text-sm font-semibold mt-1">{medicine.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">{medicine.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-end justify-between gap-3 border-t border-[color:var(--border)] pt-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-[color:var(--muted-foreground)]">Harga</p>
                            <p className="text-base font-bold text-primary">Rp {medicine.price.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex flex-col gap-1.5 shrink-0 ml-2">
                            <Button
                              size="sm"
                              className="w-full justify-start gap-1.5 text-[10px] h-7 px-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-none"
                              onClick={e => handleAddToCart(medicine, e)}
                            >
                              <ShoppingCart className="h-3 w-3" /> Keranjang
                            </Button>
                            <Button
                              size="sm"
                              className="w-full justify-center gap-1.5 text-[10px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200/40"
                              onClick={e => handleBuyNow(medicine, e)}
                            >
                              Beli Sekarang
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination control */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1 || catalogLoading}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </Button>

                {/* Page numbers (show max 5) */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={catalogLoading}
                        className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                          page === currentPage
                            ? 'bg-primary text-white shadow-md shadow-emerald-200/50'
                            : 'bg-white border border-[color:var(--border)] text-[color:var(--foreground)] hover:bg-[color:var(--secondary)]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages || catalogLoading}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl"
                >
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}


        {/* ══ CART TAB ═════════════════════════════════════════════════ */}
        {activeTab === 'cart' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm px-5 py-4">
              <h3 className="font-bold text-[color:var(--foreground)] text-base">Keranjang Belanja</h3>
              <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5">{totalItems} item dipilih</p>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[color:var(--border)]">
                <span className="text-6xl">🛒</span>
                <p className="font-semibold text-[color:var(--foreground)]">Keranjang masih kosong</p>
                <p className="text-sm text-[color:var(--muted-foreground)]">Tambahkan produk dari katalog</p>
                <Button onClick={() => setActiveTab('catalog')}>Lihat Katalog</Button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_340px] gap-5">
                {/* Cart items */}
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl border border-[color:var(--border)] p-4 shadow-sm">
                      <div className="h-16 w-16 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-xl"
                            onError={e => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const parent = img.parentElement!;
                              parent.innerHTML = `<span class="text-3xl">${item.image}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-3xl">{item.image}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[color:var(--foreground)] truncate">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)] mt-0.5">{item.category}</p>
                        <p className="text-primary font-bold text-sm mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-full border border-[color:var(--border)] flex items-center justify-center text-[color:var(--muted-foreground)] hover:border-primary hover:text-primary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-full border border-[color:var(--border)] flex items-center justify-center text-[color:var(--muted-foreground)] hover:border-primary hover:text-primary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => { removeFromCart(item.id); toast.success('Produk dihapus'); }}
                          className="h-7 w-7 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm p-5 h-fit sticky top-20">
                  <h4 className="font-bold text-[color:var(--foreground)] mb-4">Ringkasan Pesanan</h4>
                  <div className="space-y-2.5 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">Subtotal ({totalItems} item)</span>
                      <span className="font-semibold">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">Ongkir</span>
                      <span className="font-semibold text-emerald-600">Dihitung saat checkout</span>
                    </div>
                      {cartTotal >= 100000 && (
                        <p className="text-xs text-emerald-600 font-medium">
                          Bagus! Total keranjang Anda telah mencapai Rp 100.000.
                        </p>
                      )}
                  </div>
                  <div className="border-t border-[color:var(--border)] pt-3 mb-4">
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <Button onClick={handleCheckout} className="w-full gap-2 h-11 shadow-lg shadow-emerald-200/50">
                    <CreditCard className="h-4 w-4" />
                    Lanjut ke Pembayaran
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ORDERS TAB ══════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[color:var(--foreground)] text-base">Riwayat Pesanan</h3>
                <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5">{apiOrders.length} pesanan ditemukan</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApiOrders}
                disabled={ordersLoading}
                className="flex items-center gap-1.5 h-8 rounded-xl text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-2xl border border-[color:var(--border)]">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-[color:var(--muted-foreground)]">Memuat pesanan...</p>
              </div>
            ) : apiOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[color:var(--border)]">
                <span className="text-6xl">📦</span>
                <p className="font-semibold text-[color:var(--foreground)]">Belum ada riwayat pesanan</p>
                <p className="text-sm text-[color:var(--muted-foreground)]">Mulai belanja dan pesanan Anda akan muncul di sini</p>
                <Button onClick={() => setActiveTab('catalog')}>Mulai Belanja</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {apiOrders.map((order: any) => {
                  // Status badge config — covers all backend statuses including 'flagged'
                  const statusConfig: Record<string, { label: string; className: string }> = {
                    processing:  { label: '⏳ Diproses',    className: 'bg-blue-100 text-blue-700' },
                    flagged:     { label: '⚠️ Ditinjau',    className: 'bg-orange-100 text-orange-700' },
                    shipped:     { label: '🚚 Dikirim',     className: 'bg-purple-100 text-purple-700' },
                    delivered:   { label: '✅ Terkirim',    className: 'bg-teal-100 text-teal-700' },
                    completed:   { label: '✓ Selesai',      className: 'bg-emerald-100 text-emerald-700' },
                    cancelled:   { label: '✕ Dibatalkan',  className: 'bg-red-100 text-red-700' },
                  };
                  const paymentConfig: Record<string, { label: string; className: string }> = {
                    paid:      { label: '💳 Lunas',    className: 'bg-emerald-50 text-emerald-600' },
                    pending:   { label: '🕐 Belum Bayar', className: 'bg-yellow-50 text-yellow-600' },
                    failed:    { label: '✕ Gagal',     className: 'bg-red-50 text-red-600' },
                    cancelled: { label: '✕ Dibatalkan', className: 'bg-gray-100 text-gray-500' },
                    expired:   { label: '⏰ Expired',   className: 'bg-gray-100 text-gray-500' },
                  };
                  const st = statusConfig[order.status] || { label: order.status, className: 'bg-gray-100 text-gray-600' };
                  const pt = paymentConfig[order.paymentStatus] || { label: order.paymentStatus, className: 'bg-gray-100 text-gray-500' };
                  return (
                    <div key={order.orderId} className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border)] bg-gray-50/50">
                        <div>
                          <p className="text-xs font-bold text-primary">{order.orderId}</p>
                          <p className="text-[11px] text-[color:var(--muted-foreground)]">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.className}`}>{st.label}</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => navigate(`/tracking/${order.orderId}`)}>
                            Lacak
                          </Button>
                          {/* Bug #B fix: tombol Batalkan — hanya muncul jika pesanan masih bisa dibatalkan */}
                          {(order.status === 'processing' || order.status === 'flagged') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id, order.orderId)}
                            >
                              {cancellingId === order.id ? 'Membatalkan...' : '✕ Batalkan'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="px-5 py-3">
                        <div className="text-xs text-[color:var(--muted-foreground)] mb-3">
                          {order.items?.map((item: any) => `${item.name} ×${item.quantity}`).join(', ')}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-[color:var(--muted-foreground)]">{order.courier?.name} · {order.courier?.service}</p>
                          <p className="font-bold text-primary text-sm">Rp {(order.total || 0).toLocaleString('id-ID')}</p>
                        </div>
                        
                        {/* Mini Timeline */}
                        {order.status !== 'cancelled' && (
                          <div className="pt-3 border-t border-[color:var(--border)]">
                            <div className="flex items-center gap-1.5">
                              <div className={`flex-1 h-1.5 rounded-full ${['processing', 'flagged', 'shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                              <div className={`flex-1 h-1.5 rounded-full ${['shipped', 'delivered', 'completed'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                              <div className={`flex-1 h-1.5 rounded-full ${['delivered', 'completed'].includes(order.status) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                            </div>
                            <div className="flex justify-between mt-1.5 text-[10px] font-semibold text-[color:var(--muted-foreground)] px-0.5">
                              <span className={['processing', 'flagged', 'shipped', 'delivered', 'completed'].includes(order.status) ? 'text-emerald-600' : ''}>Diproses</span>
                              <span className={['shipped', 'delivered', 'completed'].includes(order.status) ? 'text-emerald-600 text-center' : 'text-center'}>Dikirim</span>
                              <span className={['delivered', 'completed'].includes(order.status) ? 'text-emerald-600 text-right' : 'text-right'}>Selesai</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
      {showCompletionModal && (
        <ProfileCompletionModal open={showCompletionModal} onClose={() => setShowCompletionModal(false)} />
      )}
      <FloatingChatbot isAuthenticated={true} />
    </div>
  );
}
