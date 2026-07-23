/**
 * Profile page — user info, allergies management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import {
  Pill, LogOut, ArrowLeft, User, AlertTriangle, Plus, X, Trash2, CheckCircle2, Loader2,
  MapPin, CreditCard, Bell, Shield, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { getProfile, updateAllergies } from '../services/profileAPI';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: string;
  allergies: string[];
  createdAt: string;
  totalOrders: number;
}

const MENU_ITEMS = [
  { icon: User,       label: 'Profil Saya',         active: true },
  { icon: AlertTriangle, label: 'Alergi & Obat Dilarang', active: false },
  { icon: MapPin,     label: 'Alamat Pengiriman',   active: false },
  { icon: CreditCard, label: 'Metode Pembayaran',   active: false },
  { icon: Smartphone, label: 'Koneksi & Integrasi', active: false },
  { icon: Shield,     label: 'Keamanan',            active: false },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAllergen, setNewAllergen] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const result = await getProfile();
    if (result.profile) {
      setProfile(result.profile);
    } else {
      toast.error(result.error || 'Gagal memuat profil');
    }
    setIsLoading(false);
  };

  const addAllergen = async () => {
    if (!newAllergen.trim()) return;
    if (profile?.allergies?.includes(newAllergen.trim())) {
      toast.warning('Alergi sudah ada di daftar');
      return;
    }

    setIsSaving(true);
    const currentAllergies = profile?.allergies || [];
    const updatedAllergies = [...currentAllergies, newAllergen.trim()];
    const result = await updateAllergies(updatedAllergies);

    if (result.success) {
      setProfile(prev => prev ? { ...prev, allergies: updatedAllergies } : null);
      setNewAllergen('');
      toast.success('Alergi berhasil ditambahkan');
    } else {
      toast.error(result.error || 'Gagal menyimpan alergi');
    }
    setIsSaving(false);
  };

  const removeAllergen = async (allergen: string) => {
    if (!profile) return;
    const updatedAllergies = profile.allergies.filter(a => a !== allergen);
    const result = await updateAllergies(updatedAllergies);

    if (result.success) {
      setProfile(prev => prev ? { ...prev, allergies: updatedAllergies } : null);
      toast.success('Alergi berhasil dihapus');
    } else {
      toast.error(result.error || 'Gagal menyimpan alergi');
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar');
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-[color:var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-9 w-9" aria-label="Kembali">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-200/50">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[color:var(--foreground)]">Profil Saya</h1>
              <p className="text-[10px] text-emerald-600 font-medium">Kelola data & alergi Anda</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-semibold gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-0">
              <div className="h-16 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="px-5 pb-5 pt-0">
                <div className="flex items-end gap-3 -mt-8 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-emerald-200/40 border-[3px] border-white flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 z-10">
                    <span className="text-emerald-700 font-bold text-xl">{initials}</span>
                  </div>
                  <div className="pb-1 min-w-0 flex-1">
                    <p className="font-bold text-[color:var(--foreground)] truncate">{user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)] truncate">{user?.email}</p>
                  </div>
                </div>
                <Badge
                  className={`w-fit border-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {user?.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                </Badge>
              </div>
            </div>

            {/* Navigation Menu */}
            <Card className="border-0 shadow-sm p-2">
              {MENU_ITEMS.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  disabled={!active}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all ${
                    active
                      ? 'bg-emerald-50/70 text-emerald-700 font-bold'
                      : 'text-[color:var(--muted-foreground)] hover:bg-gray-50 hover:text-[color:var(--foreground)] font-semibold cursor-not-allowed'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                    {label}
                  </span>
                </button>
              ))}
            </Card>
          </div>

          {/* ── RIGHT CONTENT ─────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Profile Information */}
            <Card className="border-0 shadow-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--border)] bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[color:var(--foreground)] text-lg">Informasi Pribadi</h2>
                    <p className="text-xs text-[color:var(--muted-foreground)]">Data akun Anda untuk transaksi dan pengiriman</p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <CardContent className="p-6 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </CardContent>
              ) : (
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-widest mb-1 block">Nama Lengkap</label>
                      <p className="font-semibold text-sm">{profile?.name || user?.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-widest mb-1 block">Email</label>
                      <p className="font-semibold text-sm">{profile?.email || user?.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-widest mb-1 block">No. Telepon</label>
                      <p className="font-semibold text-sm">{profile?.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--muted-foreground)] uppercase tracking-widest mb-1 block">Kota</label>
                      <p className="font-semibold text-sm">{profile?.city || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Allergy Management */}
            <Card className="border-0 shadow-lg">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[color:var(--border)] bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-200/50">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[color:var(--foreground)] text-lg">Alergi & Obat Dilarang</h2>
                    <p className="text-xs text-[color:var(--muted-foreground)]">Daftar komposisi/kandungan obat yang Anda alergi — chatbot akan menghindarkannya dari rekomendasi</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Add allergen */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik komposisi obat (mis: Paracetamol, Ibuprofen)..."
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAllergen()}
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <Button
                    onClick={addAllergen}
                    disabled={isSaving || !newAllergen.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </div>

                {/* Allergy chips */}
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : profile?.allergies && profile.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {profile.allergies.map((allergen, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3 hover:bg-red-100 transition-colors group">
                        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="font-semibold text-sm flex-1">{allergen}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAllergen(allergen)}
                          disabled={isSaving}
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="text-4xl mb-2">💊</div>
                    <p className="font-semibold text-[color:var(--foreground)]">Belum ada alergi yang terdaftar</p>
                    <p className="text-xs text-[color:var(--muted-foreground)] max-w-md mx-auto">
                      Tambahkan komposisi obat yang Anda alergi agar chatbot tidak merekomendasikan obat berbahaya untuk Anda.
                    </p>
                  </div>
                )}

                {/* Info box */}
                {profile?.allergies && profile.allergies.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Chatbot Aman Aktif</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Saat ini ada {profile.allergies.length} alergi terdeteksi. Chatbot akan otomatis memperingatkan jika merekomendasikan obat yang mengandung komponen Anda alergi.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
