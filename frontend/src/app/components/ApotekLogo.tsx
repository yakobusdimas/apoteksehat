/**
 * ApotekLogo.tsx
 * Logo Apotek Sehat — dua varian:
 *  - 'full'  : icon + teks (default)
 *  - 'icon'  : hanya simbol Bowl of Hygieia
 *  - 'text'  : hanya teks
 *  - 'signboard' : gaya papan nama bold kuning-merah (untuk panel kiri)
 */

import React from 'react';

interface ApotekLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text' | 'signboard';
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
      <path
        d="M28 42c-4-2-6-6-3-9 2-2 6-2 9-4 3-2 3-5 1-7-1-1-3-2-5-2-4 0-6 3-7 5l-2-2c2-3 5-6 9-6 4 0 7 2 9 5 2 4 1 8-2 10-3 2-8 3-9 5-2 2-1 6 3 8l-2 2z"
        fill="white"
      />
      {/* Kepala Ular */}
      <path
        d="M24 16c-2 3 1 6 4 4 1-1 1-3-1-4-1 0-2-1-3 0z"
        fill="white"
      />
      {/* Mata ular */}
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

/**
 * Signboard variant — terinspirasi papan nama Apotek Sehat.
 * Bold, impactful, tapi tetap bersih (tidak alay, tidak animasi).
 */
function SignboardLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      {/* Ikon + Nama dalam satu baris */}
      <div className="flex items-center gap-4 mb-3">
        {/* Palang hijau kecil sebagai aksen */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            background: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          <HygieiaIcon size={40} />
        </div>
        {/* Teks samping ikon */}
        <div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              fontSize: '1.1rem',
              letterSpacing: '0.06em',
              lineHeight: 1,
              color: 'white',
              textTransform: 'uppercase',
            }}
          >
            Apotek Sehat
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              marginTop: 3,
            }}
          >
            Solusi Kesehatan Anda
          </div>
        </div>
      </div>

      {/* Teks besar bergaya papan nama */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(3rem, 8vw, 4.5rem)',
          lineHeight: 0.92,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            display: 'block',
            color: 'white',
            WebkitTextStroke: '2px rgba(255,255,255,0.15)',
          }}
        >
          APOTEK
        </span>
        <span
          style={{
            display: 'block',
            color: '#fbbf24',          /* amber-400 — mirip kuning papan nama */
            WebkitTextStroke: '1px #f59e0b',
          }}
        >
          SEHAT
        </span>
      </div>
    </div>
  );
}

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

  if (variant === 'signboard') return <SignboardLogo className={className} />;
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
