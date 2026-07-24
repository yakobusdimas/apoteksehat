/**
 * Dashboard Stats Component
 * Quick overview stats for user dashboard
 */

import { Package, Heart, CreditCard, Award } from 'lucide-react';

interface DashboardStatsProps {
  totalOrders?: number;
  totalSpent?: number;
  totalFavorites?: number;
  rewardPoints?: number;
}

export default function DashboardStats({
  totalOrders = 0,
  totalSpent = 0,
  totalFavorites = 0,
  rewardPoints = 0,
}: DashboardStatsProps) {
  const stats = [
    {
      icon: <Package className="h-5 w-5" />,
      value: totalOrders,
      label: 'Total Pesanan',
      color: 'blue',
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      value: `Rp ${(totalSpent / 1000).toFixed(0)}K`,
      label: 'Total Belanja',
      color: 'emerald',
    },
    {
      icon: <Heart className="h-5 w-5" />,
      value: totalFavorites,
      label: 'Favorit',
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
