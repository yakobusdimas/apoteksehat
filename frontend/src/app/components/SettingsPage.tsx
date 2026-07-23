import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  User, Bell, MapPin, CreditCard, ChevronRight, ArrowLeft,
  Shield, Phone, Mail, Save, CheckCircle2, Lock, Eye, EyeOff, Sun, Moon
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPw, setShowPw] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      toast.error('Nomor HP dan alamat wajib diisi');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateProfile({ phone, address, city, postalCode: postalCode || undefined });
      if (result.success) {
        toast.success('Profil berhasil disimpan!');
      } else {
        toast.error(result.message || 'Gagal menyimpan profil');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }
    toast.info('Fitur ganti password akan segera tersedia');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar');
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil Saya' },
    { id: 'contact', icon: Phone, label: 'Kontak & Alamat' },
    { id: 'security', icon: Shield, label: 'Keamanan' },
    { id: 'notifications', icon: Bell, label: 'Notifikasi' },
    { id: 'preferences', icon: CreditCard, label: 'Preferensi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pengaturan Akun</h1>
              <p className="text-xs text-gray-500">Kelola profil dan keamanan akun Anda</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 w-full flex-1">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Badge className={`w-fit border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                </Badge>
              </CardContent>
            </Card>

            <nav className="space-y-1">
              {tabs.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                    activeTab === id
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  {activeTab === id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Profil Saya</h2>
                      <p className="text-xs text-gray-500">Informasi dasar akun Anda</p>
                    </div>
                  </div>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-1">Nama diambil dari akun Google</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                      <Input
                        value={email}
                        onChange={(e) => {}}
                        className="h-11"
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Contact & Address Tab */}
            {activeTab === 'contact' && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Kontak & Alamat</h2>
                      <p className="text-xs text-gray-500">Info untuk pengiriman pesanan</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Nomor HP <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="pl-10 h-11"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Format: 08xxxxxxxxxx atau +62xxxxxxxxxx</p>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Alamat Lengkap <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Jl. Contoh No. 123, RT/RW"
                          className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Kota <span className="text-gray-400">(opsional)</span>
                        </label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Jakarta Selatan"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Kode Pos <span className="text-gray-400">(opsional)</span>
                        </label>
                        <Input
                          id="postalCode"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="12345"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" disabled={isSaving} className="h-11 px-6 gap-2">
                        {isSaving ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Simpan Profil
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Keamanan</h2>
                      <p className="text-xs text-gray-500">Kelola password dan keamanan akun</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Password untuk akun lokal */}
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-bold text-amber-900 text-sm">Akun Google Terdeteksi</h3>
                          <p className="text-xs text-amber-700 mt-1">
                            Anda login menggunakan akun Google. Password di bawah hanya untuk fallback jika akun Google tidak bisa diakses.
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Password Baru
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="newPassword"
                            type={showPw ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 8 karakter"
                            className="pl-10 pr-10 h-11"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Konfirmasi Password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru"
                          className="h-11"
                        />
                      </div>

                      <Button type="submit" className="h-11 px-6 gap-2">
                        <Lock className="h-4 w-4" />
                        Atur Password
                      </Button>
                    </form>

                    <div className="pt-4 border-t">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">Lupa Password?</h4>
                      <p className="text-xs text-gray-500 mb-3">
                        Jika Anda lupa password, gunakan fitur reset password.
                      </p>
                      <Button variant="outline" size="sm" className="h-9 text-xs">
                        <Mail className="h-3.5 w-3.5" />
                        Reset Password via Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Notifikasi</h2>
                      <p className="text-xs text-gray-500">Atur preferensi notifikasi Anda</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Status Pesanan', desc: 'Notifikasi saat pesanan diproses/dikirim', defaultChecked: true },
                      { label: 'Promo & Diskon', desc: 'Info promo dan diskon terbaru', defaultChecked: false },
                      { label: 'Pengingat Obat', desc: 'Pengingat untuk minum obat', defaultChecked: false },
                      { label: 'Newsletter', desc: 'Tips kesehatan mingguan', defaultChecked: false },
                    ].map(({ label, desc, defaultChecked }) => (
                      <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium">
                      💡 Notifikasi email akan dikirim ke <strong>{email}</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Preferensi</h2>
                      <p className="text-xs text-gray-500">Personalisasi pengalaman Anda</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                          {theme === 'light' ? (
                            <Sun className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Moon className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">Tema {theme === 'light' ? 'Terang' : 'Gelap'}</p>
                          <p className="text-xs text-gray-500">Sesuaikan tampilan aplikasi sesuai kenyamanan Anda</p>
                        </div>
                      </div>
                      <Button
                        onClick={toggleTheme}
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        {theme === 'light' ? (
                          <>
                            <Sun className="h-4 w-4" />
                            Terang
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4" />
                            Gelap
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Language (placeholder) */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-gray-900">Bahasa</p>
                        <p className="text-xs text-gray-500">Bahasa Indonesia (coming soon)</p>
                      </div>
                      <Badge variant="outline" className="text-xs">ID</Badge>
                    </div>

                    {/* Timezone (placeholder) */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div>
                        <p className="font-bold text-sm text-gray-900">Zona Waktu</p>
                        <p className="text-xs text-gray-500">WIB (UTC+7) - Otomatis terdeteksi</p>
                      </div>
                      <Badge variant="outline" className="text-xs">WIB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
