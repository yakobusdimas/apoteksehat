import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import {
  Search, ShoppingCart, Heart, Eye, User,
  Sparkles, ShieldCheck, Truck, Clock3, ArrowRight, MapPin, Pill
} from 'lucide-react';
import { useMedicines, Medicine } from '../context/MedicinesContext';
import { toast } from 'sonner';
import FloatingChatbot from './FloatingChatbot';
import MedicineDetailModal from './MedicineDetailModal';
import { GridSkeleton } from './ui/LoadingState';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import ThemeToggle from './ThemeToggle';
import { ApotekLogo } from './ApotekLogo';
import { Disclaimer } from './Disclaimer';

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string }> = {
  'Pereda Nyeri': { emoji: '💊', color: 'text-blue-700', bg: 'bg-blue-50' },
  'Antibiotik':   { emoji: '🔬', color: 'text-red-700',  bg: 'bg-red-50'  },
  'Obat Batuk':   { emoji: '🤧', color: 'text-orange-700', bg: 'bg-orange-50' },
  'Flu & Pilek':  { emoji: '🌡️', color: 'text-purple-700', bg: 'bg-purple-50' },
  'Lambung':      { emoji: '🫁', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  'Vitamin':      { emoji: '✨', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  'Pencernaan':   { emoji: '🍃', color: 'text-teal-700',  bg: 'bg-teal-50'  },
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { medicines, isLoading } = useMedicines();
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const categories = ['Semua', 'Pereda Nyeri', 'Antibiotik', 'Obat Batuk', 'Flu & Pilek', 'Lambung', 'Vitamin', 'Pencernaan'];

  const filteredMedicines = medicines.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    const matchesCat    = selectedCategory === 'Semua' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleAddToCart = () => {
    toast.info('Silakan login untuk menambahkan ke keranjang', {
      action: { label: 'Login', onClick: () => navigate('/login') }
    });
  };

  return (
    <div className="app-page">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header role="banner" className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-background/80 backdrop-blur-xl">
        <div className="app-shell-wide py-3">
          <div className="flex items-center gap-4">

            {/* Logo */}
            <div className="flex items-center shrink-0">
              <ApotekLogo size="sm" />
            </div>

            {/* Search — desktop */}
            <div className="hidden flex-1 items-center md:flex">
              <div className="relative w-full max-w-md mx-auto">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                <Input
                  type="text"
                  placeholder="Cari obat, kategori, atau kebutuhan Anda..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-11 rounded-xl border-[color:var(--border)] bg-input focus:bg-background"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden md:flex gap-2">
                <User className="h-4 w-4" /> Masuk
              </Button>
              <Button size="sm" onClick={() => navigate('/register')} className="shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30">
                Daftar Gratis
              </Button>
            </div>
          </div>

          {/* Search — mobile */}
          <div className="mt-3 flex gap-2 md:hidden">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
              <Input
                type="text"
                placeholder="Cari obat..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 bg-input"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => navigate('/login')} aria-label="Login">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* ── HERO SECTION ──────────────────────────────────────────── */}
        <section className="pt-12 pb-10 md:pt-16">
          <div className="app-shell-wide grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">

            {/* Left: copy */}
            <div className="space-y-7 animate-slide-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="section-eyebrow">
                  <Sparkles className="h-3 w-3" /> Didukung Rekomendasi AI
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  ✓ 100% Terpercaya
                </span>
              </div>

              <div className="space-y-4 max-w-2xl">
                <p className="app-eyebrow">Apotek digital yang terasa tenang & jelas</p>
                <h1 className="text-4xl font-bold leading-[1.02] tracking-tight text-[color:var(--foreground)] md:text-[3.5rem]">
                  Belanja obat lebih{' '}
                  <span className="text-gradient">rapi, cepat,</span>
                  <br className="hidden md:block" />
                  {' '}dan aman.
                </h1>
                <p className="app-prose max-w-lg text-base leading-7 md:text-lg">
                  Konsultasi obat, temukan produk yang sesuai, lalu lanjutkan ke checkout tanpa kebingungan.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="gap-2 shadow-xl shadow-emerald-300/40 hover:shadow-emerald-300/60 dark:shadow-emerald-900/30 transition-shadow"
                >
                  Mulai Belanja <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                  Masuk ke Akun
                </Button>
              </div>

              {/* Mini feature cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: 'Obat terjamin', sub: 'Distribusi resmi & jelas' },
                  { icon: Truck,       label: 'Pengiriman cepat', sub: 'Alur antar mudah dipantau' },
                  { icon: Clock3,      label: 'Buka 24/7', sub: 'Siap kapan pun Anda butuh' },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <div
                    key={label}
                    className="app-panel flex items-start gap-3 px-4 py-4 animate-fade-up hover-lift"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--secondary)] text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{label}</p>
                      <p className="mt-0.5 text-[11px] text-[color:var(--muted-foreground)] leading-5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product showcase card */}
            <div className="animate-slide-right">
              <div className="app-panel-strong overflow-hidden p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-[color:var(--border)] pb-4">
                  <div>
                    <p className="app-label">Sorotan produk</p>
                    <h3 className="mt-1 text-lg font-semibold">Katalog yang mudah dipindai</h3>
                  </div>
                  <Badge className="bg-[color:var(--secondary)] text-primary border-transparent">
                    100+ produk
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  {/* Apotek image — foto toko asli */}
                  <div className="overflow-hidden rounded-[1.25rem] border border-[color:var(--border)] bg-gradient-to-b from-emerald-50/60 to-white/80 dark:from-emerald-900/20 dark:to-background/50 relative">
                    <img
                      src="/apotek_exterior.jpg"
                      alt="Apotek Sehat Delanggu — Toko Kami"
                      loading="lazy"
                      className="h-56 w-full rounded-[1rem] object-cover"
                      onError={e => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        (img as HTMLImageElement).style.display = 'none';
                        const parent = (img as HTMLImageElement).parentElement!;
                        parent.innerHTML = '<div class="flex h-56 flex-col items-center justify-center gap-2 text-center p-4 bg-emerald-50"><span class="text-5xl text-emerald-300">🏪</span></div>';
                      }}
                    />
                    {/* Badge lokasi */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow">
                      <MapPin size={10} /> Delanggu, Klaten
                    </div>
                  </div>

                  {/* Feature mini-list */}
                  <div className="space-y-3">
                    {[
                      { label: 'Asisten Apotek', value: 'Konsultasi kebutuhan obat',       icon: '🩺' },
                      { label: 'Instan & Sameday', value: 'Dikirim dengan cepat',          icon: '📦' },
                      { label: 'Stok jelas',       value: 'Status produk terlihat real-time', icon: '✅' },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="rounded-[1.1rem] border border-[color:var(--border)] bg-card/90 p-3.5 hover-lift"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{item.icon}</span>
                          <p className="app-label">{item.label}</p>
                        </div>
                        <p className="text-xs leading-5 text-[color:var(--foreground)]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────────────── */}
        <FeaturesSection />

        {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
        <HowItWorksSection />

        {/* ── CATALOG ───────────────────────────────────────────────── */}
        <section className="py-10 pb-20">
          <div className="app-shell-wide space-y-6">

            {/* Section header + filter */}
            <div className="app-panel flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between animate-fade-up">
              <div>
                <span className="section-eyebrow mb-2 inline-flex">💊 Katalog Obat</span>
                <h2 className="mt-2 text-2xl font-semibold">Temukan produk dalam beberapa detik</h2>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  {filteredMedicines.length} produk ditemukan
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                        : 'border border-[color:var(--border)] bg-card text-[color:var(--muted-foreground)] hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="h-7 appearance-none rounded-full border border-[color:var(--border)] bg-card px-3 pr-7 text-xs font-semibold text-[color:var(--muted-foreground)] outline-none focus:border-primary/40"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[color:var(--muted-foreground)] text-[10px]">▾</div>
                </div>
              </div>
            </div>

            {/* Medicine cards grid */}
            {isLoading ? (
              <GridSkeleton count={8} />
            ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredMedicines.map((medicine, i) => {
                const catMeta = CATEGORY_META[medicine.category] || { emoji: '💊', color: 'text-primary', bg: 'bg-emerald-50' };
                return (
                  <Card
                    key={medicine.id}
                    className="group overflow-hidden border-[color:var(--border)] bg-card/95 hover-lift cursor-pointer"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    {/* Photo area */}
                    <div className={`relative h-48 overflow-hidden ${catMeta.bg}`}>
                      <img
                        src={medicine.photo}
                        alt={medicine.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement!;
                          parent.innerHTML = `<div class="flex h-full flex-col items-center justify-center gap-2"><span class="text-5xl">${medicine.image}</span><span class="text-xs font-medium text-gray-400">${medicine.category}</span></div>`;
                        }}
                      />

                      {/* Top overlay */}
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                        <button
                          className="rounded-full border border-white/70 bg-card/95 p-1.5 shadow-sm transition hover:scale-110"
                          onClick={e => { e.stopPropagation(); toast.success('Ditambahkan ke favorit', { icon: '❤️' }); }}
                        >
                          <Heart className="h-3.5 w-3.5 text-[color:var(--muted-foreground)]" />
                        </button>
                        <Badge className="bg-card/95 text-primary border-0 shadow-sm text-[10px]">
                          Stok {medicine.stock}
                        </Badge>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/8 dark:group-hover:bg-white/5">
                        <span className="rounded-full bg-card p-2 text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <Eye className="h-5 w-5" />
                        </span>
                      </div>
                    </div>

                    <CardHeader className="space-y-1 pb-2 pt-3">
                      <Badge
                        variant="secondary"
                        className={`w-fit border-0 text-[10px] font-bold ${catMeta.bg} ${catMeta.color}`}
                      >
                        {catMeta.emoji} {medicine.category}
                      </Badge>
                      <CardTitle className="text-[1rem] leading-snug">{medicine.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{medicine.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-end justify-between gap-3 border-t border-[color:var(--border)] pt-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">Harga</p>
                          <p className="text-lg font-bold text-primary">
                            Rp {medicine.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0 gap-1.5 shadow-md shadow-emerald-200/40 dark:shadow-emerald-900/30"
                          onClick={e => { e.stopPropagation(); handleAddToCart(); }}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Beli
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer aria-label="Footer" className="border-t border-[color:var(--border)] bg-[#102a2e] text-white dark:bg-[#070b14]">
        <div className="app-shell-wide py-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/15 dark:bg-white/5 dark:border-white/10">
                  <ApotekLogo size="sm" variant="icon" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Apotek Sehat</h3>
                  <p className="text-xs text-white/55">Solusi kesehatan digital yang terstruktur</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-white/65">
                Platform apotek digital dengan pengalaman yang bersih, rapi, dan mudah dipakai untuk belanja obat maupun konsultasi.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { value: '50K+', label: 'Pengguna' },
                  { value: '100+', label: 'Produk' },
                  { value: '4.9★', label: 'Rating' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/10 bg-white/8 p-3 text-center dark:bg-white/5">
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-white/55">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { title: 'Navigasi',  items: ['Katalog Obat', 'Keranjang', 'Riwayat Pesanan', 'Konsultasi'] },
                { title: 'Kategori', items: ['Pereda Nyeri', 'Antibiotik', 'Vitamin', 'Obat Batuk'] },
                { title: 'Kontak',   items: ['Jl. Raya 89, Delanggu, Klaten', '+62 815 8951 7885', 'Buka Setiap Hari'] },
              ].map(group => (
                <div key={group.title}>
                  <p className="app-label text-white/45 mb-4">{group.title}</p>
                  <ul className="space-y-2.5 text-sm text-white/65">
                    {group.items.map(item => <li key={item} className="hover:text-white/90 transition-colors cursor-default">{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6">
            <p className="text-xs text-white/40 text-center sm:text-left">
              ⚕️ <em>Apotek Sehat hanya memberikan rekomendasi awal berdasarkan gejala. Bukan pengganti dokter atau apoteker profesional. Jika gejala berlanjut, kunjungi tenaga medis terdekat.</em>
            </p>
            <div className="flex flex-col gap-1 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Apotek Sehat Delanggu. Jl. Raya 89, Delanggu, Klaten 57471.</p>
              <p>Tugas Akhir · Y. Dimas Agung Nugroho · Politeknik Negeri Semarang</p>
            </div>
          </div>
        </div>
      </footer>

      <FloatingChatbot isAuthenticated={false} />
      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        theme="green"
        isAuthenticated={false}
      />
    </div>
  );
}
