/**
 * Empty State Component
 * Friendly empty states for cart, favorites, orders, etc.
 */

import { Button } from './button';
import { ShoppingCart, Heart, Package, Search } from 'lucide-react';

interface EmptyStateProps {
  variant: 'cart' | 'favorites' | 'orders' | 'search';
  onAction?: () => void;
  actionLabel?: string;
}

const emptyStateConfig = {
  cart: {
    icon: ShoppingCart,
    title: 'Keranjang Masih Kosong',
    description: 'Yuk mulai belanja obat yang Anda butuhkan',
    actionLabel: 'Belanja Sekarang',
    illustration: '🛒',
  },
  favorites: {
    icon: Heart,
    title: 'Belum Ada Favorit',
    description: 'Tandai obat favorit Anda dengan ♡',
    actionLabel: 'Lihat Katalog',
    illustration: '❤️',
  },
  orders: {
    icon: Package,
    title: 'Belum Ada Pesanan',
    description: 'Pesanan Anda akan muncul di sini',
    actionLabel: 'Mulai Belanja',
    illustration: '📦',
  },
  search: {
    icon: Search,
    title: 'Tidak Ada Hasil',
    description: 'Coba kata kunci lain atau ubah filter pencarian',
    actionLabel: 'Reset Pencarian',
    illustration: '🔍',
  },
};

export default function EmptyState({ variant, onAction, actionLabel }: EmptyStateProps) {
  const config = emptyStateConfig[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Illustration */}
      <div className="mb-6 relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
          <span className="text-6xl">{config.illustration}</span>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{config.description}</p>

      {/* Action Button */}
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  );
}
