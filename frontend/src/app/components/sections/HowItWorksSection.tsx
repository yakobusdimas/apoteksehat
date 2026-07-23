/**
 * HowItWorksSection — Redesigned
 * Premium timeline with numbered steps, consistent emerald palette
 */

import { UserPlus, MessageCircle, ShoppingBag, CreditCard, Package } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Daftar / Masuk',
    description: 'Buat akun gratis dalam 1 menit atau masuk ke akun Anda.',
    number: '01',
  },
  {
    icon: MessageCircle,
    title: 'Konsultasi AI',
    description: 'Chat dengan asisten AI untuk rekomendasi obat yang tepat.',
    number: '02',
  },
  {
    icon: ShoppingBag,
    title: 'Pilih Obat',
    description: 'Temukan dan tambahkan produk ke keranjang dengan mudah.',
    number: '03',
  },
  {
    icon: CreditCard,
    title: 'Checkout',
    description: 'Bayar aman dengan berbagai metode pembayaran.',
    number: '04',
  },
  {
    icon: Package,
    title: 'Terima Pesanan',
    description: 'Obat diantar langsung ke alamat rumah Anda.',
    number: '05',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-emerald-50 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-teal-50 blur-3xl" />
      </div>

      <div className="app-shell-wide">
        {/* Header */}
        <div className="mb-16 text-center animate-fade-up">
          <span className="section-eyebrow mb-4">⚡ Alur Belanja</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-4xl">
            Cara Belanja di <span className="text-gradient-emerald">Apotek Sehat</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[color:var(--muted-foreground)]">
            Proses belanja yang mudah dan cepat — dari konsultasi hingga obat tiba di tangan Anda.
          </p>
        </div>

        {/* Desktop: Horizontal Steps */}
        <div className="hidden md:block">
          <div className="relative grid grid-cols-5 gap-4">
            {/* Connection line */}
            <div className="absolute top-9 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-200 via-teal-300 to-emerald-200" />

            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === steps.length - 1;
              return (
                <div
                  key={step.number}
                  className="group flex flex-col items-center text-center animate-fade-up"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {/* Circle */}
                  <div className="relative z-10 mb-5">
                    <div className="h-[4.5rem] w-[4.5rem] rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200/60 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                      {i + 1}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[color:var(--foreground)] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-5 text-[color:var(--muted-foreground)] max-w-[120px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === steps.length - 1;
            return (
              <div
                key={step.number}
                className="flex gap-5 animate-fade-up"
                style={{ animationDelay: `${i * 0.10}s` }}
              >
                {/* Left: icon + line */}
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/50 z-10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {!isLast && (
                    <div className="mt-1 w-0.5 flex-1 min-h-[2rem] bg-gradient-to-b from-emerald-300 to-transparent" />
                  )}
                </div>

                {/* Right: content */}
                <div className="pb-8 pt-1 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-primary bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      {step.number}
                    </span>
                    <h3 className="font-semibold text-[color:var(--foreground)]">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
