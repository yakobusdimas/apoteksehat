import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, Mail, Eye, EyeOff, Shield, Truck, Heart, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ApotekLogo } from './ApotekLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        toast.success('Login berhasil!');
        navigate(result.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true });
      } else {
        toast.error(result.message || 'Email atau password salah');
      }
    } catch {
      toast.error('Gagal terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-page flex min-h-screen items-stretch">
      <div className="app-shell-wide grid min-h-screen gap-6 py-4 lg:grid-cols-[1.1fr_0.9fr] lg:py-6">

        {/* Left Panel */}
        <section className="relative hidden overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-gradient-to-br from-[#0f766e] via-[#0b5f59] to-[#102a2e] p-12 text-white lg:flex lg:flex-col lg:justify-between shadow-2xl">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-20 top-[-4rem] h-80 w-80 rounded-full bg-emerald-400/20 blur-[80px]" />
            <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-teal-400/20 blur-[80px]" />
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="login-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#login-dots)" />
            </svg>
          </div>


          <div className="relative z-10 flex items-center gap-3 animate-fade-down">
            <ApotekLogo size="md" onDark />
          </div>

          <div className="relative z-10 max-w-xl space-y-6 py-10 animate-slide-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Masuk ke akun Anda
            </div>
            <h2 className="max-w-lg text-[2.5rem] font-bold leading-[1.05] text-white">
              Belanja obat tanpa ribet, dengan tampilan yang <span className="text-emerald-300">tenang dan terarah.</span>
            </h2>
            <p className="max-w-md text-sm leading-7 text-white/80">
              Gunakan akun Anda untuk mengakses dashboard, konsultasi AI, checkout, dan pelacakan pesanan dalam satu alur yang rapi.
            </p>
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex items-center justify-center px-6 py-8 lg:py-0">
          <div className="w-full max-w-[420px] space-y-8 animate-fade-up">
            <div className="lg:hidden text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <ApotekLogo size="lg" variant="icon" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[color:var(--foreground)]">Apotek Sehat</h1>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">Masuk untuk melanjutkan ke dashboard</p>
            </div>

            <main id="main-content" className="card-premium p-8 md:p-10 border-0 shadow-2xl shadow-emerald-100/50 bg-white/80 backdrop-blur-xl">
              <div className="mb-8 space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">Selamat Datang</h2>
                <p className="text-sm text-[color:var(--muted-foreground)]">Gunakan email dan password terdaftar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted-foreground)]">Alamat Email</label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-11 h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted-foreground)]">Password</label>
                    <a href="/forgot-password" className="text-xs font-bold text-primary hover:text-emerald-700 transition-colors">Lupa password?</a>
                  </div>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <Input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="pl-11 pr-12 h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-sm font-medium text-[color:var(--muted-foreground)] cursor-pointer select-none">
                    Ingat saya selama 30 hari
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} size="lg" className="w-full h-12 text-base shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 transition-all rounded-xl mt-2">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 font-bold">Masuk Sekarang <span className="text-lg leading-none">→</span></span>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Belum punya akun?{' '}
                  <Link to="/register" className="font-bold text-primary hover:text-emerald-700 transition-colors">
                    Daftar gratis
                  </Link>
                </p>
              </div>
            </main>

            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Kembali ke beranda
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
