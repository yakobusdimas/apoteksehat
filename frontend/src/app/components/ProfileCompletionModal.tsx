import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Phone, MapPin, User, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileCompletionModal({ open, onClose }: ProfileCompletionModalProps) {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^(.+62|62|0)[0-9]{9,13}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Format nomor telepon tidak valid (contoh: 081234567890)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
      });

      if (result.success) {
        toast.success('Profil berhasil dilengkapi! 🎉');
        onClose();
      } else {
        toast.error(result.message || 'Gagal memperbarui profil');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    toast.info('Anda bisa melengkapi profil nanti di Pengaturan', {
      icon: <Clock className="h-4 w-4" />,
      duration: 3000,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Lengkapi Profil Anda</h3>
                <p className="text-xs text-emerald-100">Agar checkout lebih cepat dan akurat</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="completion-phone" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="completion-phone"
                type="tel"
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                className={`pl-11 h-12 rounded-xl ${errors.phone ? 'border-red-300 bg-red-50' : 'bg-gray-50/50 border-gray-200 focus:bg-white'}`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="completion-address" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                id="completion-address"
                type="text"
                placeholder="Jl. Contoh No. 123, RT/RW"
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                className={`pl-11 h-12 rounded-xl ${errors.address ? 'border-red-300 bg-red-50' : 'bg-gray-50/50 border-gray-200 focus:bg-white'}`}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-600 font-medium">{errors.address}</p>
            )}
          </div>

          {/* City & Postal - Optional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="completion-city" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Kota <span className="text-gray-400 font-normal normal-case">(opsional)</span>
              </label>
              <Input
                id="completion-city"
                type="text"
                placeholder="Jakarta"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="completion-postal" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Kode Pos <span className="text-gray-400 font-normal normal-case">(opsional)</span>
              </label>
              <Input
                id="completion-postal"
                type="text"
                placeholder="12345"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="h-12 rounded-xl bg-gray-50/50 border-gray-200 focus:bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200/50 rounded-xl font-bold"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                Simpan Profil
              </span>
            )}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
          >
            Nanti Saja
          </Button>
        </div>
      </div>
    </div>
  );
}
