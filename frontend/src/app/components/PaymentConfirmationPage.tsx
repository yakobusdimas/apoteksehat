/**
 * PaymentConfirmationPage.tsx
 * Halaman yang tampil setelah user berhasil upload bukti pembayaran.
 * Menampilkan status "menunggu verifikasi admin".
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle, Clock, Package, ChevronRight, Home } from 'lucide-react';
import { ApotekLogo } from './ApotekLogo';

export function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order') || '-';
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animasi masuk
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  const steps = [
    { icon: CheckCircle, label: 'Bukti pembayaran diterima', done: true },
    { icon: Clock,        label: 'Verifikasi oleh admin (maks. 24 jam)', done: false, active: true },
    { icon: Package,      label: 'Pesanan diproses & dikirim', done: false },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)' }}
    >
      {/* Logo */}
      <div className="mb-8">
        <ApotekLogo size="lg" />
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-md rounded-3xl shadow-xl p-8 text-center transition-all duration-500 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ background: 'white' }}
      >
        {/* Animated check icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              <CheckCircle size={48} color="white" strokeWidth={2} />
            </div>
            <div
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center animate-bounce"
              style={{ background: '#facc15', border: '2px solid white' }}
            >
              <span className="text-xs font-bold text-amber-800">✓</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: '#15803d' }}>
          Bukti Pembayaran Terkirim!
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Nomor Pesanan:
        </p>
        <p className="font-bold text-lg mb-6" style={{ color: '#166534' }}>
          #{orderId}
        </p>

        {/* Progress steps */}
        <div className="space-y-3 mb-8 text-left">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done
                      ? 'bg-emerald-500'
                      : step.active
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-gray-200'
                  }`}
                >
                  <Icon size={16} color={step.done || step.active ? 'white' : '#9ca3af'} />
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.done
                      ? 'text-emerald-700'
                      : step.active
                      ? 'text-amber-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Admin kami akan memverifikasi pembayaran Anda dalam 1×24 jam.
          Anda akan menerima notifikasi setelah konfirmasi selesai.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/tracking/${orderId}`)}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            Lihat Status Pesanan <ChevronRight size={16} />
          </button>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold border transition-all hover:bg-gray-50 active:scale-95"
            style={{ color: '#374151', borderColor: '#e5e7eb' }}
          >
            <Home size={16} /> Kembali ke Beranda
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-center text-gray-400 max-w-xs">
        ⚕️ Apotek Sehat hadir untuk membantu kebutuhan obat Anda.
        Jika ada pertanyaan, hubungi admin melalui Live Chat.
      </p>
    </div>
  );
}

export default PaymentConfirmationPage;
