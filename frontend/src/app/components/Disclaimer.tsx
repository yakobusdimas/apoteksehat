/**
 * Disclaimer.tsx
 * Komponen disclaimer yang tampil di footer halaman dan chatbot
 */

import React from 'react';
import { AlertTriangle, Stethoscope } from 'lucide-react';

interface DisclaimerProps {
  variant?: 'footer' | 'chatbot' | 'banner';
  className?: string;
}

export function Disclaimer({ variant = 'footer', className = '' }: DisclaimerProps) {
  if (variant === 'chatbot') {
    return (
      <div
        className={`flex items-start gap-2 px-3 py-2 text-xs border-b ${className}`}
        style={{
          background: '#fffbeb',
          borderColor: '#fde68a',
          color: '#92400e',
        }}
      >
        <AlertTriangle size={13} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          <strong>Perhatian:</strong> Asisten ini hanya memberikan rekomendasi awal berdasarkan gejala,{' '}
          <strong>bukan pengganti dokter atau apoteker</strong>. Jika gejala berlanjut, segera kunjungi tenaga medis.
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${className}`}
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
          color: '#166534',
        }}
      >
        <Stethoscope size={18} className="flex-shrink-0 text-emerald-600" />
        <span>
          Apotek Sehat hanya memberikan rekomendasi obat berdasarkan gejala yang dilaporkan. 
          Selalu konsultasikan dengan dokter atau apoteker untuk diagnosis dan pengobatan yang tepat.
        </span>
      </div>
    );
  }

  // variant === 'footer'
  return (
    <footer
      className={`border-t py-6 px-4 mt-auto ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Stethoscope size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
            Disclaimer Medis
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Apotek Sehat hanya menyediakan informasi awal dan rekomendasi berdasarkan gejala pengguna.
            Layanan ini <strong>tidak menggantikan</strong> peran dokter maupun apoteker profesional.
            Jika gejala bersifat kronis atau darurat, segera kunjungi fasilitas medis terdekat.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Disclaimer;
