import { X, ShoppingCart, Package, Clock, Tag, FlaskConical, Sparkles } from 'lucide-react';
import { Medicine } from '../context/MedicinesContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onAddToCart?: (medicine: Medicine) => void;
  onBuyNow?: (medicine: Medicine) => void;
  theme?: 'green' | 'blue';
  isAuthenticated?: boolean;
}

export default function MedicineDetailModal({
  medicine,
  onClose,
  onAddToCart,
  onBuyNow,
  theme = 'green',
  isAuthenticated = false
}: MedicineDetailModalProps) {
  if (!medicine) return null;

  const primaryColor = theme === 'blue'
    ? 'from-blue-600 to-blue-700'
    : 'from-emerald-500 to-emerald-600';

  const accentColor = theme === 'blue' ? 'text-blue-600' : 'text-emerald-600';
  const bgAccent = theme === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  const btnColor = theme === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-500 hover:bg-emerald-600';
  const badgeBg = theme === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className={`bg-gradient-to-r ${primaryColor} p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-all"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-1 shadow-lg w-24 h-24 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={medicine.photo}
                alt={medicine.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-5xl">${medicine.image}</span>`;
                }}
              />
            </div>
            <div>
              <Badge className={`${badgeBg} text-xs mb-2 border-0`}>{medicine.category}</Badge>
              <h2 className="text-2xl font-bold text-white leading-tight">{medicine.name}</h2>
              <p className="text-white/80 text-sm mt-1">{medicine.description}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Tag className={`h-4 w-4 ${accentColor}`} />
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Harga</span>
              </div>
              <p className={`text-2xl font-bold ${accentColor}`}>
                Rp {medicine.price.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Package className={`h-4 w-4 ${accentColor}`} />
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Stok</span>
              </div>
              <p className={`text-2xl font-bold ${medicine.stock < 50 ? 'text-orange-500' : accentColor}`}>
                {medicine.stock} unit
              </p>
            </div>
          </div>

          {/* Khasiat / Benefits */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className={`h-5 w-5 ${accentColor}`} />
              <h3 className="font-semibold text-gray-800">Khasiat & Manfaat</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {medicine.benefits.map((benefit, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm p-2.5 rounded-lg border ${bgAccent}`}>
                  <span className="text-base mt-0.5">✓</span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bahan-bahan / Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className={`h-5 w-5 ${accentColor}`} />
              <h3 className="font-semibold text-gray-800">Kandungan / Bahan</h3>
            </div>
            <div className="space-y-1.5">
              {medicine.ingredients.map((ingredient, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${theme === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    {i + 1}
                  </span>
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Indikasi & Dosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Indikasi</h4>
              <p className="text-sm text-gray-700">{medicine.indication}</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dosis</h4>
              </div>
              <p className="text-sm text-gray-700">{medicine.dosage}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-gray-100">
            {onAddToCart ? (
              isAuthenticated ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { onAddToCart(medicine); onClose(); }}
                    className={`flex-1 border-${theme === 'blue' ? 'blue' : 'emerald'}-200 text-${theme === 'blue' ? 'blue' : 'emerald'}-700 h-12 text-sm font-semibold`}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Keranjang
                  </Button>
                  <Button
                    onClick={() => { if (onBuyNow) { onBuyNow(medicine); } else { onAddToCart(medicine); } onClose(); }}
                    className={`flex-1 ${btnColor} text-white h-12 text-sm font-semibold`}
                  >
                    Beli Sekarang
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 mb-2">Login untuk menambahkan ke keranjang</p>
                  <Button variant="outline" onClick={onClose} className="border-gray-300">
                    Tutup
                  </Button>
                </div>
              )
            ) : (
              <Button variant="outline" onClick={onClose} className="w-full">
                Tutup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
