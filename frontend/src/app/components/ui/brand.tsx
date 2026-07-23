/**
 * Unified Brand System Components
 * Single source of truth for branding across the app
 */

import { cn } from './utils';
import { ApotekLogo } from '../ApotekLogo';

// Re-export ApotekLogo as AppLogo for backward compat
interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function AppLogo({ size = 'md', showText = true, className }: AppLogoProps) {
  return (
    <ApotekLogo
      size={size}
      variant={showText ? 'full' : 'icon'}
      className={className}
    />
  );
}

// Tagline Component
interface AppTaglineProps {
  variant?: 'default' | 'hero' | 'footer';
  className?: string;
}

export function AppTagline({ variant = 'default', className }: AppTaglineProps) {
  const taglines = {
    default: 'Solusi Kesehatan Digital Anda',
    hero: 'Belanja Obat Online, Mudah & Aman dengan AI',
    footer: 'Sistem Rekomendasi Obat Berbasis AI',
  };

  const styles = {
    default: 'text-emerald-600 text-sm',
    hero: 'text-emerald-50 text-xl md:text-2xl',
    footer: 'text-gray-400 text-sm',
  };

  return (
    <p className={cn(styles[variant], className)}>
      {taglines[variant]}
    </p>
  );
}

// Brand Badge
interface BrandBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function BrandBadge({ children, className }: BrandBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
      'bg-emerald-100 text-emerald-700 text-xs font-medium',
      className
    )}>
      {children}
    </span>
  );
}

// Stats Display
interface StatDisplayProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatDisplay({ value, label, icon, className }: StatDisplayProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
