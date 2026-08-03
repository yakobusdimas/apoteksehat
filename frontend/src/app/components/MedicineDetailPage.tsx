import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Heart, Tag, FlaskConical, Sparkles, Info, Clock, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { useMedicines } from '../context/MedicinesContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import FloatingChatbot from './FloatingChatbot';
import { Pill } from 'lucide-react';
import type { Medicine } from '../context/MedicinesContext';

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Pereda Nyeri': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  'Antibiotik':   { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  'Obat Batuk':   { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200'  },
  'Flu & Pilek':  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
  'Lambung':      { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200'  },
  'Vitamin':      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Pencernaan':   { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200'    },
};

export default function MedicineDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { addToCart, getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { isAuthenticated } = useAuth();
  const { getMedicineById } = useMedicines();
  const [isFav, setIsFav] = useState(false);
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMedicineById(Number(id)).then((med) => {
      setMedicine(med);
      setLoading(false);
    });
  }, [id, getMedicineById]);

  /* ── Loading ──────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-500">Memuat detail obat...</p>
      </div>
    );
  }

  /* ── Not found ──────────────────────────────────────────────────────── */
  if (!medicine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Package className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600">Obat tidak ditemukan</h2>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-600 font-semibold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
      </div>
    );
  }

  const cs = categoryColors[medicine.category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  const handleAddToCart = () => {
    addToCart(medicine);
    toast.success(`${medicine.name} ditambahkan ke keranjang 🛒`);
  };
  const handleBuyNow = () => {
    navigate('/checkout', { state: { buyNowItem: { ...medicine, quantity: 1 } } });
  };

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center gap-4">

          {/* Back button — kiri atas */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors bg-gray-100 hover:bg-emerald-50 px-3 py-2 rounded-xl shrink-0">
            <ArrowLeft className="h-4 w-4" />Kembali
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400">
              Dashboard &rsaquo; Katalog &rsaquo; <span className="text-gray-600 font-medium">{medicine.name}</span>
            </p>
          </div>

          {/* Fav */}
          <button onClick={() => { setIsFav(v => !v); toast.success(isFav ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit ❤️'); }}
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}>
            <Heart className={`h-5 w-5 ${isFav ? 'fill-red-400' : ''}`} />
          </button>

          {/* Cart view button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.info('Silakan login untuk melihat keranjang', { action: { label: 'Login', onClick: () => navigate('/login') } });
                return;
              }
              navigate('/cart');
            }}
            className="relative flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-emerald-200 transition-all shrink-0 shadow-sm"
          >
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            <span>Keranjang</span>
            {cartCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── PAGE CONTENT ──────────────────────────────────────────── */}
      <main id="main-content" className="max-w-4xl mx-auto px-5 py-8 space-y-6">

        {/* ── HERO CARD ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="grid md:grid-cols-2">

            {/* Photo */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 h-72 md:h-auto flex items-center justify-center overflow-hidden">
              <img
                src={medicine.photo}
                alt={medicine.name}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const p = (e.target as HTMLImageElement).parentElement!;
                  p.innerHTML = `<div class="text-9xl text-center py-8">${medicine.image}</div>`;
                }}
              />
              <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Stok: {medicine.stock} unit
              </span>
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-between">
              <div>
                {/* Category */}
                <span className={`inline-flex items-center gap-1.5 ${cs.bg} ${cs.text} border ${cs.border} rounded-full px-3 py-1 text-xs font-semibold mb-4`}>
                  <Tag className="h-3 w-3" />{medicine.category}
                </span>

                {/* Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{medicine.name}</h1>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{medicine.description}</p>

                {/* Price */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Harga per unit</p>
                  <p className="text-4xl font-bold text-emerald-600">Rp {medicine.price.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* CTA */}
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-2xl text-base shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02]">
                <ShoppingCart className="h-5 w-5" />Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>

        {/* ── DETAIL SECTIONS ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Khasiat & Manfaat */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-emerald-100 p-2.5 rounded-xl">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Khasiat &amp; Manfaat</h2>
                <p className="text-xs text-gray-400">Kegunaan utama obat ini</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {medicine.benefits.map((benefit, i) => {
                const cleaned = benefit.replace(/\s*\(Perlu resep\)/gi, '').replace(/\s*perlu resep/gi, '').trim();
                if (!cleaned) return null;
                return (
                  <div key={i} className="flex items-start gap-2.5 bg-emerald-50 rounded-xl px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-emerald-800 font-medium">{cleaned}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Komposisi */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <FlaskConical className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Komposisi / Bahan</h2>
                <p className="text-xs text-gray-400">Kandungan zat aktif</p>
              </div>
            </div>
            <div className="space-y-2">
              {medicine.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{ing}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indikasi */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-orange-100 p-2.5 rounded-xl">
                <Info className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Indikasi</h2>
                <p className="text-xs text-gray-400">Kondisi yang dapat diobati</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-orange-50 rounded-2xl px-4 py-4 border border-orange-100">
              {medicine.indication.replace(/\s*\(Perlu resep\)/gi, '').replace(/\s*perlu resep/gi, '').trim()}
            </p>
          </div>

          {/* Saran Penggunaan */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Saran Penggunaan</h2>
                <p className="text-xs text-gray-400">Aturan pakai yang dianjurkan</p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-2xl px-4 py-4 border border-purple-100 mb-3">
              <p className="text-sm text-purple-800 font-medium leading-relaxed">
                {medicine.dosage.replace(/\s*\(Perlu resep\)/gi, '').replace(/\s*perlu resep/gi, '').trim()}
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100 flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Konsultasikan dengan apoteker sebelum penggunaan. Hentikan jika ada efek samping.</p>
            </div>
          </div>
        </div>

        {/* ── BOTTOM CTA ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-200">
          <div className="text-white">
            <p className="font-bold text-lg">{medicine.name}</p>
            <p className="text-emerald-100 text-sm">Stok tersisa: {medicine.stock} unit</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-white mr-4">
              <p className="text-xs text-emerald-100">Harga</p>
              <p className="text-2xl font-bold">Rp {medicine.price.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 bg-emerald-700/50 text-white font-bold px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-all text-sm">
                <ShoppingCart className="h-5 w-5" /> Keranjang
              </button>
              <button onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 bg-white text-emerald-600 font-bold px-6 py-3 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg text-sm">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>

      </main>

      <FloatingChatbot isAuthenticated={isAuthenticated} />
    </div>
  );
}
