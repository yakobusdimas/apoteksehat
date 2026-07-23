/**
 * FeaturesSection — Redesigned
 * Consistent emerald/teal palette, premium cards, subtle animations
 */

import { Bot, Truck, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI Chatbot',
    description: 'Konsultasi gratis dengan asisten AI untuk rekomendasi obat yang tepat dan akurat.',
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    glow: 'rgba(15,118,110,0.18)',
    badge: 'AI Powered',
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    description: 'Same-day delivery dan Instant delivery menggunakan GoSend / GrabExpress untuk menjaga kualitas obat Anda.',
    bg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    glow: 'rgba(20,184,166,0.18)',
    badge: 'Same-Day',
  },
  {
    icon: Shield,
    title: 'Obat Original',
    description: '100% original dan terjamin kualitasnya dari distributor resmi berlisensi.',
    bg: 'bg-gradient-to-br from-cyan-500 to-sky-500',
    glow: 'rgba(6,182,212,0.18)',
    badge: 'Terverifikasi',
  },
  {
    icon: Clock,
    title: 'Layanan 24/7',
    description: 'Customer service siap membantu Anda kapan saja, bahkan di hari libur.',
    bg: 'bg-gradient-to-br from-sky-500 to-indigo-500',
    glow: 'rgba(14,165,233,0.18)',
    badge: 'Always On',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle bg blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      <div className="app-shell-wide">
        {/* Header */}
        <div className="mb-14 text-center animate-fade-up">
          <span className="section-eyebrow mb-4">✦ Keunggulan Kami</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-4xl">
            Kenapa Pilih <span className="text-gradient-emerald">Apotek Sehat?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[color:var(--muted-foreground)]">
            Platform belanja obat online dengan teknologi AI dan layanan profesional untuk kenyamanan Anda.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group card-premium hover-lift animate-fade-up p-6"
                style={{ animationDelay: `${i * 0.10}s` }}
              >
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.bg} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  style={{ boxShadow: `0 8px 24px ${f.glow}` }}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Badge */}
                <span className="mb-3 inline-block rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {f.badge}
                </span>

                <h3 className="mb-2 text-[1.05rem] font-semibold text-[color:var(--foreground)]">
                  {f.title}
                </h3>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {f.description}
                </p>

                {/* Bottom glow line on hover */}
                <div
                  className="mt-5 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, ${f.glow.replace('0.18','0.6')}, transparent)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
