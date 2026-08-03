/**
 * Welcome Banner Component for User Dashboard
 * Personalized greeting with quick actions
 */

import { Button } from './button';
import { Bot, Package, Heart, Settings, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router';

interface WelcomeBannerProps {
  userName: string;
  onNavigateTab?: (tab: string) => void;
}

export default function WelcomeBanner({ userName, onNavigateTab }: WelcomeBannerProps) {
  const navigate = useNavigate();
  const quickActions = [
    { icon: ShoppingCart, label: 'Keranjang', onClick: () => navigate('/cart') },
    { icon: Package,      label: 'Pesanan',   onClick: () => navigate('/orders') },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 p-6 md:p-8 mb-6 shadow-lg">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Greeting */}
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">👋</span>
            <h2 className="text-2xl md:text-3xl font-bold">
              Selamat Datang, {userName}!
            </h2>
          </div>
          <p className="text-emerald-50 text-sm md:text-base">
            Senang melihat Anda kembali. Ada yang bisa kami bantu hari ini?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm transition-all hover:scale-105"
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
