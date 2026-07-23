/**
 * ApotekLogo.tsx
 * Logo Apotek Sehat — SVG murni dengan simbol Bowl of Hygieia (ular melilit gelas).
 * Simbol farmasi universal + identitas merah-hijau khas Apotek Sehat.
 */

import React from 'react';

interface ApotekLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  onDark?: boolean;
}

/** SVG Logo Apotek Resmi Indonesia (Palang Hijau + Ular & Gelas Putih) */
function HygieiaIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background/Base Cross (Palang Hijau) */}
      <path
        d="M22 4h20v18h18v20H42v18H22V42H4V22h18V4z"
        fill="#16a34a"
        stroke="#15803d"
        strokeWidth="1"
      />

      {/* Gelas/Cawan Putih (White Cup) */}
      <path
        d="M27 46h10v-2h-3V28h5v-3H25v3h5v16h-3v2z"
        fill="white"
      />
      <path
        d="M23 25h18s0-6-9-6-9 6-9 6z"
        fill="white"
      />

      {/* Ular Putih (White Snake) melilit gelas */}
      {/* Badan ular melilit ke atas */}
      <path
        d="M28 42c-4-2-6-6-3-9 2-2 6-2 9-4 3-2 3-5 1-7-1-1-3-2-5-2-4 0-6 3-7 5l-2-2c2-3 5-6 9-6 4 0 7 2 9 5 2 4 1 8-2 10-3 2-8 3-9 5-2 2-1 6 3 8l-2 2z"
        fill="white"
      />
      {/* Kepala Ular */}
      <path
        d="M24 16c-2 3 1 6 4 4 1-1 1-3-1-4-1 0-2-1-3 0z"
        fill="white"
      />
      {/* Mata ular (hijau agar kontras) */}
      <circle cx="25" cy="17" r="0.8" fill="#16a34a" />
    </svg>
  );
}

const sizes = {
  sm:  { icon: 32, font: 'text-sm',   sub: 'text-[9px]',  gap: 'gap-1.5' },
  md:  { icon: 40, font: 'text-base', sub: 'text-[10px]', gap: 'gap-2' },
  lg:  { icon: 48, font: 'text-lg',   sub: 'text-xs',     gap: 'gap-2.5' },
  xl:  { icon: 64, font: 'text-2xl',  sub: 'text-sm',     gap: 'gap-3' },
};

export function ApotekLogo({ size = 'md', variant = 'full', className = '', onDark = false }: ApotekLogoProps) {
  const s = sizes[size];

  const TextBlock = () => (
    <div className="flex flex-col leading-none">
      <span
        className={`font-black tracking-wide ${s.font}`}
        style={onDark
          ? { color: 'white', WebkitTextStroke: '0.5px #15803d', letterSpacing: '0.04em', lineHeight: 1.1 }
          : { color: '#15803d', letterSpacing: '0.04em', lineHeight: 1.1 }
        }
      >
        APOTEK
      </span>
      <span
        className={`font-extrabold tracking-widest ${s.font}`}
        style={onDark
          ? { color: 'white', WebkitTextStroke: '0.5px #dc2626', letterSpacing: '0.08em', lineHeight: 1.1 }
          : { color: '#dc2626', letterSpacing: '0.08em', lineHeight: 1.1 }
        }
      >
        SEHAT
      </span>
      {size !== 'sm' && (
        <span
          className={`font-medium tracking-wider mt-0.5 ${s.sub}`}
          style={{ color: onDark ? 'rgba(255,255,255,0.7)' : '#6b7280' }}
        >
          Solusi Kesehatan Anda
        </span>
      )}
    </div>
  );

  if (variant === 'icon') return <HygieiaIcon size={s.icon} />;
  if (variant === 'text') return <TextBlock />;

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <HygieiaIcon size={s.icon} />
      <TextBlock />
    </div>
  );
}

export default ApotekLogo;

