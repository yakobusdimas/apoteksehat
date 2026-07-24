import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { ApotekLogo } from './ApotekLogo';

const benefits = [
  'Checkout dan tracking pesanan lebih cepat',
  'Rekomendasi obat yang lebih relevan',
  'Akses dashboard pelanggan dan riwayat pesanan',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '',
    password: '', confirmPassword: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const address = formData.address.trim();

    if (!name || !email || !formData.password) {
      toast.error('Nama, email, dan password wajib diisi');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok!');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (!agreed) {
      toast.error('Setujui syarat & ketentuan terlebih dahulu');
      return;
    }
    setIsLoading(true);
    try {
      const result = await register({
        name,
        email,
        phone,
        address,
        password: formData.password,
      });
      if (result.success) {
        toast.success('Pendaftaran berhasil! Selamat datang di Apotek Sehat.');
        navigate('/user/dashboard');
      } else {
        toast.error(result.message || 'Pendaftaran gagal');
      }
    } catch {
      toast.error('Gagal terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "pl-11 h-11 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white transition-all text-sm";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-[color:var(--muted-foreground)] mb-1.5";
  const iconClass = "absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors";

  return (
    <div className="app-page flex min-h-screen items-center py-6">
      <div className="app-shell-wide grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left Panel */}
        <aside className="hidden overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-gradient-to-br from-[#102a2e] via-[#0f766e] to-[#0f766e] p-12 text-white lg:flex lg:flex-col lg:justify-between shadow-2xl relative">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-[100px] -translate-y-1/2 translate-x-1/3" />
          </div>

          <div className="space-y-8 relative z-10 animate-fade-down">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center">
                <ApotekLogo size="md" variant="icon" onDark />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Apotek Sehat</h1>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-emerald-200/80">Registrasi Akun</p>
              </div>
            </div>

            <div className="max-w-lg space-y-5 pt-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> Langkah Mudah
              </div>
              <h2 className="text-[2.5rem] font-bold leading-[1.05] text-white">
                Satu akun untuk <span className="text-emerald-300">semua kebutuhan</span> apotek Anda.
              </h2>

            </div>
          </div>


        </aside>

        {/* Right Panel */}
        <main id="main-content" className="flex items-center justify-center px-4">
          <div className="w-full max-w-[500px] animate-fade-up">
            <div className="mb-6 text-center lg:hidden">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <ApotekLogo size="md" />
              </div>
              <p className="mt-1 text-sm font-medium text-[color:var(--muted-foreground)]">Buat akun untuk memulai</p>
            </div>

            <div className="card-premium p-6 md:p-10 border-0 shadow-2xl shadow-emerald-100/50 bg-white/80 backdrop-blur-xl">
              <div className="mb-8 space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)]">Buat Akun Anda</h2>
                <p className="text-sm text-[color:var(--muted-foreground)]">Lengkapi data diri agar checkout dan tracking berjalan lancar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="reg-name" className={labelClass}>Nama Lengkap</label>
                    <div className="relative group">
                      <User className={iconClass} />
                      <Input id="reg-name" name="name" type="text" placeholder="Masukkan nama lengkap" value={formData.name} onChange={handleChange} className={inputClass} required />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="reg-email" className={labelClass}>Email</label>
                    <div className="relative group">
                      <Mail className={iconClass} />
                      <Input id="reg-email" name="email" type="email" placeholder="nama@email.com" value={formData.email} onChange={handleChange} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className={labelClass}>Nomor Telepon <span className="text-gray-400 font-normal normal-case">(opsional)</span></label>
                    <div className="relative group">
                      <Phone className={iconClass} />
                      <Input id="reg-phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" value={formData.phone} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-address" className={labelClass}>Alamat <span className="text-gray-400 font-normal normal-case">(opsional)</span></label>
                    <div className="relative group">
                      <MapPin className={iconClass} />
                      <Input id="reg-address" name="address" type="text" placeholder="Kota, Provinsi" value={formData.address} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative group">
                      <Lock className={iconClass} />
                      <Input name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} className={`${inputClass} pr-12`} required />
                      <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}>
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Konfirmasi Password</label>
                    <div className="relative group">
                      <Lock className={iconClass} />
                      <Input name="confirmPassword" type={showCPw ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className={`${inputClass} pr-12`} required />
                      <button type="button" tabIndex={-1} onClick={() => setShowCPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showCPw ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}>
                        {showCPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-4 mt-2">
                  <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded-md border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer" />
                  <label htmlFor="terms" className="text-sm leading-snug text-[color:var(--muted-foreground)] cursor-pointer select-none">
                    Saya setuju dengan <a href="#" className="font-bold text-primary hover:text-emerald-700">syarat & ketentuan</a> serta kebijakan privasi yang berlaku.
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} size="lg" className="w-full h-12 text-base shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 transition-all rounded-xl mt-4 font-bold">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Memproses...</span>
                  ) : 'Daftar Sekarang →'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm font-medium text-[color:var(--muted-foreground)]">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="font-bold text-primary hover:text-emerald-700 transition-colors">Masuk di sini</Link>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
