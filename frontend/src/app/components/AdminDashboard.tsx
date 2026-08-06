import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useMedicines, Medicine } from '../context/MedicinesContext';
import adminAPI, { AdminStats } from '../services/adminAPI';
import { io, Socket } from 'socket.io-client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  LogOut, Package, ShoppingBag, TrendingUp, Users,
  Plus, Minus, Search, Edit, Save, X, LayoutDashboard,
  ArrowRight, UserCircle, ChevronRight,
  CheckCircle2, Clock, XCircle, UserCog, Trash2,
  Phone, Mail, MapPin, Calendar, Lock, Camera,
  Eye, Filter, Download, Printer, RefreshCw, Truck,
  Settings, ImagePlus, FlaskConical, Sparkles, ChevronDown, Loader2, AlertTriangle, MessageSquare,
  PanelLeftClose, PanelLeft, Menu
} from 'lucide-react';
import { toast } from 'sonner';
import MedicineDetailModal from './MedicineDetailModal';
import { ApotekLogo } from './ApotekLogo';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: string; name: string; email: string; phone: string;
  address: string; joinDate: string; totalOrders: number; totalSpend: number; status: 'Aktif' | 'Nonaktif';
}
interface AdminStaff {
  id: string; name: string; email: string; phone: string;
  role: 'Admin' | 'Kasir' | 'Apoteker'; status: 'Aktif' | 'Nonaktif'; joinDate: string;
}
interface Transaction {
  id: string; customerId: string; customerName: string; medicine: string;
  qty: number; total: number; status: 'Delivered' | 'Pending' | 'Cancelled'; date: string;
}
interface MedItem extends Medicine {
  expiry: string;
  type: string;
  customPhoto?: string; // user-uploaded or picked
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockTransactions: Transaction[] = [
  { id: 'TRS001', customerId: 'USR001', customerName: 'Ahmad Rizki', medicine: 'Paracetamol 500mg', qty: 3, total: 45000, status: 'Delivered', date: '2026-05-18' },
  { id: 'TRS002', customerId: 'USR002', customerName: 'Siti Nurhaliza', medicine: 'Amoxicillin 500mg', qty: 2, total: 50000, status: 'Pending', date: '2026-05-18' },
  { id: 'TRS003', customerId: 'USR003', customerName: 'Budi Santoso', medicine: 'OBH Combi Sirup', qty: 1, total: 18000, status: 'Cancelled', date: '2026-05-17' },
  { id: 'TRS004', customerId: 'USR001', customerName: 'Ahmad Rizki', medicine: 'Vitamin C 1000mg', qty: 2, total: 70000, status: 'Delivered', date: '2026-05-17' },
  { id: 'TRS005', customerId: 'USR004', customerName: 'Dewi Rahayu', medicine: 'Mixagrip Tablet', qty: 1, total: 12000, status: 'Pending', date: '2026-05-16' },
  { id: 'TRS006', customerId: 'USR005', customerName: 'Eko Prasetyo', medicine: 'Promag Tablet', qty: 3, total: 30000, status: 'Delivered', date: '2026-05-16' },
  { id: 'TRS007', customerId: 'USR002', customerName: 'Siti Nurhaliza', medicine: 'Bodrex Tablet', qty: 2, total: 14000, status: 'Delivered', date: '2026-05-15' },
  { id: 'TRS008', customerId: 'USR006', customerName: 'Rini Wulandari', medicine: 'Diapet NR', qty: 1, total: 9000, status: 'Pending', date: '2026-05-15' },
];

const mockCustomers: Customer[] = [
  { id: 'USR001', name: 'Ahmad Rizki', email: 'ahmad.rizki@email.com', phone: '+62 812-3456-7890', address: 'Jl. Sudirman No. 12, Jakarta', joinDate: '2026-01-15', totalOrders: 8, totalSpend: 285000, status: 'Aktif' },
  { id: 'USR002', name: 'Siti Nurhaliza', email: 'siti.nur@email.com', phone: '+62 813-2345-6789', address: 'Jl. Gatot Subroto No. 45, Bandung', joinDate: '2026-02-03', totalOrders: 5, totalSpend: 175000, status: 'Aktif' },
  { id: 'USR003', name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '+62 814-3456-7890', address: 'Jl. Thamrin No. 88, Semarang', joinDate: '2026-02-20', totalOrders: 3, totalSpend: 98000, status: 'Aktif' },
  { id: 'USR004', name: 'Dewi Rahayu', email: 'dewi.rahayu@email.com', phone: '+62 815-4567-8901', address: 'Jl. Ahmad Yani No. 23, Surabaya', joinDate: '2026-03-10', totalOrders: 2, totalSpend: 52000, status: 'Aktif' },
  { id: 'USR005', name: 'Eko Prasetyo', email: 'eko.prasetyo@email.com', phone: '+62 816-5678-9012', address: 'Jl. Diponegoro No. 56, Yogyakarta', joinDate: '2026-03-25', totalOrders: 6, totalSpend: 210000, status: 'Aktif' },
  { id: 'USR006', name: 'Rini Wulandari', email: 'rini.wulan@email.com', phone: '+62 817-6789-0123', address: 'Jl. Pahlawan No. 34, Malang', joinDate: '2026-04-05', totalOrders: 1, totalSpend: 9000, status: 'Nonaktif' },
  { id: 'USR007', name: 'Hendra Gunawan', email: 'hendra.g@email.com', phone: '+62 818-7890-1234', address: 'Jl. Merdeka No. 67, Medan', joinDate: '2026-04-15', totalOrders: 4, totalSpend: 145000, status: 'Aktif' },
  { id: 'USR008', name: 'Fitri Handayani', email: 'fitri.h@email.com', phone: '+62 819-8901-2345', address: 'Jl. Imam Bonjol No. 90, Makassar', joinDate: '2026-05-01', totalOrders: 2, totalSpend: 63000, status: 'Aktif' },
];

const mockAdmins: AdminStaff[] = [
  { id: 'ADM001', name: 'Admin 1', email: 'admin@gmail.com', phone: '+62 812-3456-7890', role: 'Admin', status: 'Aktif', joinDate: '2025-01-10' },
  { id: 'ADM002', name: 'Apoteker 1', email: 'apoteker1@gmail.com', phone: '+62 811-9876-5432', role: 'Apoteker', status: 'Aktif', joinDate: '2025-03-15' },
];

const typesList = ['Tablet', 'Kapsul', 'Sirup', 'Sachet', 'Salep', 'Tetes'];

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transaksi', label: 'Transaksi', icon: ShoppingBag },
  { id: 'obat', label: 'Daftar Obat', icon: Package },
  { id: 'customer', label: 'Customer', icon: Users },
  { id: 'admin', label: 'Kelola Admin', icon: UserCog },
];

const statusConfig = {
  Delivered: { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Delivered' },
  Pending: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
  Cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
};

const categoryColors: Record<string, string> = {
  'Pereda Nyeri': 'bg-emerald-100 text-emerald-700',
  'Antibiotik': 'bg-red-100 text-red-700',
  'Obat Batuk': 'bg-orange-100 text-orange-700',
  'Flu & Pilek': 'bg-teal-100 text-teal-700',
  'Lambung': 'bg-yellow-100 text-yellow-700',
  'Vitamin': 'bg-emerald-100 text-emerald-700',
  'Pencernaan': 'bg-teal-100 text-teal-700',
};


// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const emptyForm = {
  name: '', category: 'Pereda Nyeri', type: 'Tablet',
  price: '', stock: '', expiry: '',
  description: '', indication: '', dosage: '',
  ingredients: '', benefits: '',
  customPhoto: '',
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: TRANSAKSI
// ═══════════════════════════════════════════════════════════════════════════════
function TransaksiPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const statuses = ['Semua', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusLabels: Record<string, string> = {
    'Semua': 'Semua', processing: 'Diproses', shipped: 'Dikirim', delivered: 'Selesai', cancelled: 'Dibatalkan'
  };

  const loadOrders = async () => {
    setIsLoading(true);
    const result = await adminAPI.orders(filterStatus === 'Semua' ? undefined : filterStatus);
    if (result.error) toast.error(result.error);
    setOrders(result.orders);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.orderId?.toLowerCase().includes(q) ||
      o.address?.name?.toLowerCase().includes(q) ||
      o.items?.some((item: any) => item.name?.toLowerCase().includes(q));
    return matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);

  const handleStatusChange = async (orderId: number, status: string) => {
    const result = await adminAPI.updateOrderStatus(orderId, status);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Status pesanan diperbarui');
    loadOrders();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Manajemen Transaksi</h2>
          <p className="text-sm text-gray-500 mt-0.5">Total {orders.length} transaksi dari pelanggan</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Transaksi', value: orders.length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sedang Diproses', value: orders.filter(o => o.status === 'processing').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari ID pesanan, nama..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            {statuses.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{statusLabels[s]}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID Pesanan','Nama Customer','Produk','Total','Kurir','Status','Tanggal','Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.map((o: any) => (
                <tr key={o.id || o.orderId} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{o.orderId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{o.address?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{o.items?.map((i: any) => i.name).join(', ')}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">Rp {(o.total || 0).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{o.courier?.name} {o.courier?.service}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      o.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      o.status === 'shipped' ? 'bg-amber-100 text-amber-700' :
                      o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs">
                      {statuses.filter(s => s !== 'Semua').map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="py-10 flex justify-center text-emerald-600"><Loader2 className="h-6 w-6 animate-spin" /></div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{orders.length === 0 ? 'Belum ada transaksi masuk dari pelanggan' : 'Tidak ada transaksi ditemukan'}</p>
          </div>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} pesanan
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 text-xs">Sebelumnnya</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 text-xs">Selanjutnya</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: DAFTAR OBAT
// ═══════════════════════════════════════════════════════════════════════════════
function DaftarObatPage() {
  const { medicines: apiMedicines, refetch } = useMedicines();
  const items: MedItem[] = apiMedicines.map(m => ({ ...m, expiry: m.expiry || '', type: m.type || 'Tablet' }));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MedItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const filtered = items.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    `MED${String(m.id).padStart(3,'0')}`.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAdd = () => {
    setEditItem(null);
    setForm({ ...emptyForm });
    setPreviewUrl('');
    setShowForm(true);
  };

  const openEdit = (item: MedItem) => {
    setEditItem(item);
    const photoVal = item.photo || item.customPhoto || '';
    setForm({
      name: item.name, category: item.category, type: item.type,
      price: String(item.price), stock: String(item.stock), expiry: item.expiry,
      description: item.description, indication: item.indication, dosage: item.dosage,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : String(item.ingredients || ''),
      benefits: Array.isArray(item.benefits) ? item.benefits.join(', ') : String(item.benefits || ''),
      customPhoto: photoVal,
    });
    setPreviewUrl(photoVal);  // empty stays empty; user can upload or paste new
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress image to JPEG 82% quality (~50KB-90KB string)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewUrl(compressedBase64);
          setForm(f => ({ ...f, customPhoto: compressedBase64 }));
        } else {
          setPreviewUrl(rawBase64);
          setForm(f => ({ ...f, customPhoto: rawBase64 }));
        }
      };
      img.onerror = () => {
        setPreviewUrl(rawBase64);
        setForm(f => ({ ...f, customPhoto: rawBase64 }));
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error('Isi field wajib: Nama, Harga, Stok'); return; }
    // previewUrl is the authoritative photo source — always reflects what user sees/chose
    // form.customPhoto keeps the URL field in sync with previewUrl
    const photoToUse = previewUrl || '';
    const payload = {
      name: form.name,
      category: form.category,
      type: form.type,
      price: parseInt(form.price),
      stock: parseInt(form.stock),
      expiry: form.expiry,
      description: form.description,
      indication: form.indication,
      dosage: form.dosage,
      ingredients: form.ingredients,
      benefits: form.benefits,
      photo: photoToUse,
    };

    setIsSaving(true);
    const result = editItem
      ? await adminAPI.updateMedicine(editItem.id, payload)
      : await adminAPI.addMedicine(payload);

    if (result.error) {
      toast.error(result.error);
      setIsSaving(false);
      return;
    }

    await refetch();
    toast.success(editItem ? 'Data obat berhasil diperbarui' : 'Obat baru berhasil ditambahkan');
    setIsSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: number) => {
    const result = await adminAPI.deleteMedicine(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    await refetch();
    toast.success('Obat dihapus');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Daftar Obat</h2>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} jenis obat terdaftar</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Plus className="h-4 w-4" />Tambah Obat
        </Button>
      </div>

      {/* ─── FORM MODAL ───────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">{editItem ? 'Edit Data Obat' : 'Tambah Obat Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Tutup">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Gambar Obat ── */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-2">Gambar Obat</label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Pratinjau gambar obat"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/medicines/paracetamol.png';
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImagePlus className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-[10px]">Belum ada</p>
                      </div>
                    )}
                  </div>
                  {/* Buttons */}
                  <div className="flex-1 space-y-2">
                    <p className="text-xs text-gray-500">Upload foto obat dari komputer, tempel URL, atau pilih foto preset.</p>
                    <div className="flex flex-wrap gap-2">
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5 text-xs flex-shrink-0">
                        <Camera className="h-3.5 w-3.5" />Upload File
                      </Button>
                      {previewUrl || form.customPhoto ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setPreviewUrl('');
                            setForm(f => ({ ...f, customPhoto: '' }));
                            if (fileRef.current) fileRef.current.value = '';
                            toast.info('Gambar direset. Silakan isi URL baru atau upload foto.');
                          }}
                          className="gap-1 text-xs flex-shrink-0 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />Hapus Gambar
                        </Button>
                      ) : null}
                    </div>
                    <Input
                      placeholder="Atau tempel URL gambar (https://...)"
                      value={form.customPhoto}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm(f => ({ ...f, customPhoto: val }));
                        setPreviewUrl(val);
                      }}
                      className="h-8 text-xs w-full mt-1"
                    />
                    {/* Default photo grid */}
                    <div className="grid grid-cols-5 gap-1.5 mt-1">
                      {[
                        '/medicines/paracetamol.png',
                        '/medicines/amoxicillin.png',
                        '/medicines/obh_combi.png',
                        '/medicines/vitamin_c.png',
                        '/medicines/mixagrip.png',
                        '/medicines/antasida.png',
                        '/medicines/promag.png',
                        '/medicines/bodrex.png',
                        '/medicines/diapet.png',
                        '/medicines/komix.png',
                      ].map((p, i) => (
                        <button key={i} type="button"
                          onClick={() => { setPreviewUrl(p); setForm(f => ({ ...f, customPhoto: p })); }}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${previewUrl === p ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300'}`}
                        >
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">Klik salah satu foto default di atas atau upload sendiri</p>
                  </div>
                </div>
              </div>

              {/* ── Info Dasar ── */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Nama Obat <span className="text-red-500">*</span></label>
                  <Input placeholder="Contoh: Paracetamol 500mg" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
                  <Input type="number" placeholder="Contoh: 15000" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Stok <span className="text-red-500">*</span></label>
                  <Input type="number" placeholder="Contoh: 100" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {['Pereda Nyeri','Antibiotik','Obat Batuk','Flu & Pilek','Lambung','Vitamin','Pencernaan'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Jenis</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-9 focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    {typesList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tanggal Kadaluarsa</label>
                  <Input type="date" value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} className="h-9 text-sm" />
                </div>
              </div>

              {/* ── Deskripsi & Indikasi ── */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Deskripsi Obat</label>
                  <textarea rows={2} placeholder="Deskripsi singkat tentang obat ini..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Indikasi (Kegunaan)</label>
                  <textarea rows={2} placeholder="Contoh: Demam, sakit kepala, nyeri otot..."
                    value={form.indication} onChange={e => setForm(f => ({ ...f, indication: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Dosis & Aturan Pakai</label>
                  <Input placeholder="Contoh: 3x sehari 1 tablet setelah makan" value={form.dosage}
                    onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))} className="h-9 text-sm" />
                </div>
              </div>

              {/* ── Komposisi & Manfaat ── */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FlaskConical className="h-3.5 w-3.5 text-emerald-500" />
                    <label className="text-xs font-semibold text-gray-600">Komposisi / Kandungan</label>
                  </div>
                  <textarea rows={3}
                    placeholder="Pisahkan dengan koma. Contoh: Paracetamol 500mg, Kafein 50mg, Magnesium Stearat..."
                    value={form.ingredients} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  <p className="text-[10px] text-gray-400 mt-1">Pisahkan tiap kandungan dengan koma (,)</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <label className="text-xs font-semibold text-gray-600">Manfaat / Khasiat</label>
                  </div>
                  <textarea rows={3}
                    placeholder="Pisahkan dengan koma. Contoh: Menurunkan demam, Meredakan sakit kepala, Mengurangi nyeri..."
                    value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  <p className="text-[10px] text-gray-400 mt-1">Pisahkan tiap manfaat dengan koma (,)</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Save className="h-4 w-4 mr-1.5" />{editItem ? 'Simpan Perubahan' : 'Tambahkan Obat'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TABLE ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari nama obat, kategori, atau kode..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Kode','Nama Obat','Kategori','Jenis','Harga','Stok','Kadaluarsa','Aksi'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h==='Aksi'?'text-center':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedItems.map(med => {
                const code = `MED${String(med.id).padStart(3,'0')}`;
                const isExpired = new Date(med.expiry) < new Date();
                const catColor = categoryColors[med.category] || 'bg-gray-100 text-gray-600';
                const photo = med.photo || '';
                return (
                  <tr key={med.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0 flex items-center justify-center">
                          {photo ? (
                            <img src={photo} alt={med.name} className="w-full h-full object-cover"
                              onError={e => {
                                (e.target as HTMLImageElement).src = '/medicines/paracetamol.png';
                              }} />
                          ) : (
                            <span className="text-base">💊</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{med.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${catColor}`}>{med.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{med.type}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">Rp {med.price.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${med.stock < 30 ? 'text-red-500' : med.stock < 50 ? 'text-orange-500' : 'text-gray-800'}`}>{med.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-gray-600'}`}>{med.expiry}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(med)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(med.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Obat tidak ditemukan</p>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} obat
              </span>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-gray-500">Tampil:</label>
                <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 text-xs">Sebelumnya</Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${currentPage === pageNum ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {pageNum}
                  </button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 text-xs">Selanjutnya</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: CUSTOMER
// ═══════════════════════════════════════════════════════════════════════════════
function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    const result = await adminAPI.users();
    if (result.error) {
      toast.error(result.error);
      setCustomers([]);
    } else {
      setCustomers(result.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        address: [u.address, u.city, u.postalCode].filter(Boolean).join(', ') || '-',
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-',
        totalOrders: u.totalOrders || 0,
        totalSpend: u.totalSpend || 0,
        status: 'Aktif',
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteCustomer = async (id: string) => {
    const result = await adminAPI.deleteUser(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Customer dihapus');
    loadCustomers();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Data Customer</h2>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} customer terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCustomers} className="gap-1.5 text-xs"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="h-3.5 w-3.5" />Export</Button>
        </div>
      </div>

      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Detail Customer</h3>
              <button onClick={() => setViewCustomer(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-emerald-600 text-2xl font-bold">{viewCustomer.name.charAt(0)}</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">{viewCustomer.name}</h4>
                <p className="text-sm text-gray-500 font-mono">{viewCustomer.id}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">{viewCustomer.status}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { icon: <Mail className="h-4 w-4 text-emerald-400" />, label: 'Email', value: viewCustomer.email },
                { icon: <Phone className="h-4 w-4 text-emerald-400" />, label: 'Telepon', value: viewCustomer.phone },
                { icon: <MapPin className="h-4 w-4 text-emerald-400" />, label: 'Alamat', value: viewCustomer.address },
                { icon: <Calendar className="h-4 w-4 text-emerald-400" />, label: 'Bergabung', value: viewCustomer.joinDate },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  {f.icon}
                  <div>
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className="font-medium text-gray-700 mt-0.5">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{viewCustomer.totalOrders}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Pesanan</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-base font-bold text-emerald-700">Rp {viewCustomer.totalSpend.toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Belanja</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari nama, email, atau ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID Customer','Nama','Email','Telepon','Pesanan','Status','Aksi'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h==='Aksi'?'text-center':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        <span className="text-emerald-600 text-xs font-bold">{c.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                  <td className="px-4 py-3 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-medium">{c.totalOrders}x</span></td>
                  <td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{c.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewCustomer(c)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteCustomer(c.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="py-10 flex justify-center text-emerald-600"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: KELOLA ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
function KelolaAdminPage() {
  const [admins, setAdmins] = useState<AdminStaff[]>(mockAdmins);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'Kasir' as AdminStaff['role'] });

  const filtered = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string,string> = {
    Admin:'bg-teal-100 text-teal-700', Kasir:'bg-emerald-100 text-emerald-700', Apoteker:'bg-teal-100 text-teal-700'
  };

  const handleAdd = () => {
    if (!form.name || !form.email) { toast.error('Isi semua field'); return; }
    const newId = `ADM${String(admins.length+1).padStart(3,'0')}`;
    setAdmins([...admins, { id:newId, ...form, status:'Aktif', joinDate: new Date().toISOString().split('T')[0] }]);
    toast.success('Admin baru berhasil ditambahkan');
    setShowForm(false);
    setForm({ name:'', email:'', phone:'', role:'Kasir' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Kelola Pengguna Admin</h2>
          <p className="text-sm text-gray-500 mt-0.5">{admins.length} pengguna terdaftar</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Plus className="h-4 w-4" />Tambah Admin
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Tambah Admin Baru</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              {[{ label:'Nama Lengkap',key:'name',placeholder:'Contoh: Dr. Budi' },
                { label:'Email',key:'email',placeholder:'Contoh: budi@apotek.com' },
                { label:'Nomor Telepon',key:'phone',placeholder:'+62 812-xxxx' }
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">{f.label}</label>
                  <Input placeholder={f.placeholder} value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="h-9 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as AdminStaff['role'] })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {['Admin','Kasir','Apoteker'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Batal</Button>
              <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1.5" />Tambahkan
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari nama, email, atau role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID','Nama','Email','Telepon','Role','Status','Bergabung','Aksi'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h==='Aksi'?'text-center':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                        <span className="text-teal-600 text-xs font-bold">{a.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-emerald-600">{a.email}</td>
                  <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[a.role]||'bg-gray-100 text-gray-600'}`}>{a.role}</span></td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status==='Aktif'?'bg-emerald-100 text-emerald-700':'bg-gray-100 text-gray-500'}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{a.joinDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => { setAdmins(admins.filter(x=>x.id!==a.id)); toast.success('Admin dihapus'); }}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: PROFIL ADMIN
// ═══════════════════════════════════════════════════════════════════════════════
function ProfilAdminPage({ user }: { user: { name: string; email: string } | null }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@apoteksehat.com',
    phone: '+62 811-0000-0001',
    address: 'Jl. Kesehatan No. 1, Jakarta Pusat',
    joinDate: '1 Januari 2025',
  });
  const [passwords, setPasswords] = useState({ old:'', new1:'', new2:'' });

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Profil Admin</h2>
        <p className="text-sm text-gray-500 mt-0.5">Kelola informasi akun administrator</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-5">Profil Pengguna</h3>
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center">
              <UserCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50">
              <Camera className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-800">{profile.name}</h4>
            <p className="text-sm text-gray-500">Apoteker / Administrator</p>
            <button className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 border border-emerald-200 rounded-lg px-3 py-1 hover:bg-emerald-50">
              <Camera className="h-3 w-3" />Edit Foto
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { label:'Nama Lengkap', key:'name', icon:<UserCircle className="h-4 w-4 text-emerald-400" /> },
            { label:'Email', key:'email', icon:<Mail className="h-4 w-4 text-emerald-400" /> },
            { label:'Nomor Telepon', key:'phone', icon:<Phone className="h-4 w-4 text-emerald-400" /> },
            { label:'Alamat', key:'address', icon:<MapPin className="h-4 w-4 text-emerald-400" /> },
          ].map(f => (
            <div key={f.key}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">{f.icon}{f.label}</label>
              <div className="flex gap-2">
                <Input value={(profile as any)[f.key]} onChange={e => setProfile({...profile,[f.key]:e.target.value})} className="flex-1 h-10 text-sm" />
                <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg border border-gray-200"><Edit className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
              <Calendar className="h-4 w-4 text-emerald-400" />Tanggal Bergabung
            </label>
            <Input value={profile.joinDate} readOnly className="h-10 text-sm bg-gray-50 text-gray-500" />
          </div>
        </div>
        <Button onClick={() => toast.success('Profil berhasil diperbarui')} className="mt-5 bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Save className="h-4 w-4" />Simpan Perubahan
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="h-5 w-5 text-emerald-500" />
          <h3 className="text-base font-semibold text-gray-700">Keamanan</h3>
        </div>
        <div className="space-y-3">
          {[
            { label:'Password Lama', key:'old', placeholder:'Masukkan password lama' },
            { label:'Password Baru', key:'new1', placeholder:'Masukkan password baru' },
            { label:'Konfirmasi Password Baru', key:'new2', placeholder:'Konfirmasi password baru' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">{f.label}</label>
              <Input type="password" placeholder={f.placeholder} value={(passwords as any)[f.key]}
                onChange={e => setPasswords({...passwords,[f.key]:e.target.value})} className="h-10 text-sm" />
            </div>
          ))}
        </div>
        <Button onClick={() => {
          if (!passwords.new1 || passwords.new1 !== passwords.new2) { toast.error('Password tidak cocok'); return; }
          toast.success('Password berhasil diubah');
          setPasswords({ old:'', new1:'', new2:'' });
        }} className="mt-5 bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Lock className="h-4 w-4" />Update Password
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-PAGE: LIVE CHAT
// ═══════════════════════════════════════════════════════════════════════════════
function LiveChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const socket_url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!socketRef.current && user) {
      socketRef.current = io(socket_url, { transports: ['websocket', 'polling'] });
      
      socketRef.current.on('connect', () => {
        console.log('Admin connected to Live Chat server');
        socketRef.current?.emit('join_room', { room: 'admin_room', role: 'admin' });
      });

      socketRef.current.on('receive_message', (payload: any) => {
        setMessages(prev => [...prev, payload]);
        
        // Add to users list if it's a new user
        if (payload.sender === 'user' && payload.user_id) {
          setUsers(prev => {
            if (!prev.find(u => u.id === payload.user_id)) {
              return [...prev, { id: payload.user_id, lastMessage: payload.message, time: payload.timestamp }];
            }
            // Update last message
            return prev.map(u => u.id === payload.user_id ? { ...u, lastMessage: payload.message, time: payload.timestamp } : u);
          });
          
          // Auto select if no active room
          setActiveRoom(prev => prev ? prev : payload.user_id);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeRoom || !socketRef.current) return;
    
    const payload = {
      room: activeRoom,
      message: inputMessage,
      sender: 'admin',
      user_id: activeRoom,
      timestamp: new Date().toISOString()
    };
    
    socketRef.current.emit('send_message', payload);
    setMessages(prev => [...prev, payload]);
    setInputMessage('');
  };

  const filteredMessages = messages.filter(m => m.room === activeRoom);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden h-[calc(100vh-140px)]">
      {/* Sidebar Users */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" /> Antrean Chat
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Belum ada percakapan aktif.</div>
          ) : (
            users.map(u => (
              <div 
                key={u.id} 
                onClick={() => setActiveRoom(u.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeRoom === u.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-800 text-sm">User #{u.id}</span>
                  <span className="text-[10px] text-gray-400">{new Date(u.time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{u.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeRoom ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 h-10 w-10 rounded-full flex items-center justify-center font-bold">U</div>
                <div>
                  <h4 className="font-bold text-gray-800">User #{activeRoom}</h4>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
              {filteredMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender === 'admin' ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-bl-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <span className={`text-[10px] block mt-1 ${msg.sender === 'admin' ? 'text-emerald-100 text-right' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input 
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ketik balasan untuk User..." 
                  className="flex-1 bg-gray-50"
                />
                <Button onClick={handleSendMessage} className="bg-emerald-600 hover:bg-emerald-700">Kirim</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <p>Pilih percakapan untuk mulai merespons.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { medicines, refetch: refetchMedicines } = useMedicines();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Tab mapping from URL search param or route path
  const activeMenu = (() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;
    
    if (location.pathname.includes('/admin/transaksi') || location.pathname.includes('/admin/orders')) return 'transaksi';
    if (location.pathname.includes('/admin/obat') || location.pathname.includes('/admin/medicines')) return 'obat';
    if (location.pathname.includes('/admin/customer') || location.pathname.includes('/admin/customers')) return 'customer';
    if (location.pathname.includes('/admin/kelola-admin') || location.pathname.includes('/admin/admins')) return 'admin';
    if (location.pathname.includes('/admin/profil')) return 'profil';
    return 'dashboard';
  })();

  const handleMenuChange = (tabId: string) => {
    if (tabId === 'dashboard') {
      navigate('/admin/dashboard');
    } else {
      navigate(`/admin/dashboard?tab=${tabId}`);
    }
    setMobileSidebar(false);
  };

  const loadAdminSummary = async () => {
    const [statsResult, ordersResult] = await Promise.all([
      adminAPI.stats(),
      adminAPI.orders(),
    ]);
    if (statsResult.stats) setStats(statsResult.stats);
    if (ordersResult.orders) setRecentOrders(ordersResult.orders.slice(0, 5));
  };

  useEffect(() => {
    loadAdminSummary();
  }, []);

  const totalProducts = stats?.totalMedicines ?? medicines.length;
  const totalStock = medicines.reduce((sum, m) => sum + m.stock, 0);
  const lowStockMedicinesList = medicines.filter(m => m.stock < 50);
  const lowStockItems = lowStockMedicinesList.length;
  const totalRevenue = stats?.totalRevenue ?? 0;

  const handleLogout = () => { logout(); toast.success('Logout berhasil'); navigate('/'); };

  const handleSaveStock = async (id: number) => {
    const result = await adminAPI.updateMedicine(id, { stock: editStock });
    if (result.error) { toast.error(result.error); return; }
    await refetchMedicines();
    setEditingId(null); toast.success('Stok diperbarui');
  };
  const handleAddStock = async (id: number, amount: number) => {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;
    const nextStock = Math.max(0, medicine.stock + amount);
    const result = await adminAPI.updateMedicine(id, { stock: nextStock });
    if (result.error) { toast.error(result.error); return; }
    await refetchMedicines();
    toast.success(`Stok ${amount > 0 ? 'ditambah' : 'dikurangi'} ${Math.abs(amount)} unit`);
  };
  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard', transaksi: 'Manajemen Transaksi',
    obat: 'Daftar Obat', customer: 'Data Customer',
    admin: 'Kelola Admin', profil: 'Profil Admin',
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 shadow-xl transition-all duration-300 bg-gradient-to-b from-emerald-700 to-emerald-800 ${
        sidebarOpen ? 'w-44' : 'w-16'
      }`}>
        {/* Logo + toggle */}
        <div className="flex items-center justify-between px-3 pt-5 pb-4 border-b border-emerald-600/40">
          {sidebarOpen ? (
            <ApotekLogo size="sm" onDark />
          ) : (
            <ApotekLogo size="sm" variant="icon" onDark />
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-emerald-200 hover:text-white hover:bg-emerald-600/50 p-1.5 rounded-lg transition-all"
            title={sidebarOpen ? 'Ciutkan' : 'Perluas'}
          >
            <PanelLeftClose className={`h-4 w-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button key={item.id} onClick={() => handleMenuChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                  ${isActive ? 'bg-white text-emerald-700 shadow-md' : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'}`}
                title={!sidebarOpen ? item.label : undefined}>
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                {sidebarOpen && item.label}
              </button>
            );
          })}
        </nav>
        <div className="pb-4" />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileSidebar(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-56 bg-gradient-to-b from-emerald-700 to-emerald-800 shadow-2xl z-50">
            <div className="px-4 pt-5 pb-4 border-b border-emerald-600/40 flex items-center justify-between">
              <ApotekLogo size="sm" onDark />
              <button onClick={() => setMobileSidebar(false)} className="text-emerald-200 hover:text-white p-1.5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button key={item.id} onClick={() => handleMenuChange(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                      ${isActive ? 'bg-white text-emerald-700 shadow-md' : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'}`}>
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ─── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm relative">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebar(true)}
              className="md:hidden text-gray-600 hover:text-emerald-600 p-1"
              title="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">{pageTitles[activeMenu]}</h1>
              <p className="text-xs text-gray-400">Panel Administrasi Apotek Sehat</p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl px-3 py-2 transition-all"
            >
              <div className="bg-emerald-100 rounded-full w-8 h-8 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Administrator</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100 text-center bg-emerald-50">
                    <div className="bg-emerald-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                      <UserCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'admin@apoteksehat.com'}</p>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { handleMenuChange('profil'); setProfileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
                    >
                      <Settings className="h-4 w-4" />Setting Profil
                    </button>
                    <div className="border-t border-gray-100 mx-3" />
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── DASHBOARD ── */}
          {activeMenu === 'dashboard' && (
            <>
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl px-6 py-5 flex items-center justify-between text-white shadow-lg">
                <div>
                  <h2 className="text-xl font-bold">Selamat Datang, Admin! 👋</h2>
                  <p className="text-emerald-100 text-sm mt-1">Kelola stok obat dan pantau penjualan dengan mudah</p>
                </div>
                <div className="text-5xl opacity-80">⚕️</div>
              </div>

              {lowStockItems > 0 && (
                <div className="bg-red-50/90 border border-red-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2.5 rounded-xl text-red-600 shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-900 text-base">Perhatian: Stok Menipis!</h3>
                        <p className="text-xs text-red-700 mt-0.5">
                          Terdapat <span className="font-bold underline">{lowStockItems} obat</span> dengan sisa stok kurang dari batas aman (&lt; 50 unit).
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleMenuChange('obat')} className="bg-red-600 hover:bg-red-700 text-white shadow-sm text-xs font-semibold px-4 py-2 rounded-xl shrink-0">
                      Kelola Semua Stok Obat
                    </Button>
                  </div>

                  {/* Specific Low-Stock Medicines Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {lowStockMedicinesList.slice(0, 6).map(med => (
                      <div key={med.id} className="bg-white border border-red-200/80 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-red-400 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          {med.photo ? (
                            <img src={encodeURI(med.photo)} alt={med.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                              💊
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate" title={med.name}>{med.name}</p>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                              Sisa Stok: <span className="font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{med.stock} unit</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMenuChange('obat')}
                          className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xs transition-colors shrink-0"
                          title="Kelola Stok"
                        >
                          + Restok
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stat Cards – data nyata */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label:'Total Customer', value: String(stats?.totalUsers ?? 0), icon:<Users className="h-6 w-6"/>, bg:'from-teal-500 to-teal-600', onClick:()=>handleMenuChange('customer') },
                  { label:'Total Penjualan', value: String(stats?.totalOrders ?? 0), icon:<ShoppingBag className="h-6 w-6"/>, bg:'from-emerald-500 to-emerald-600', onClick:()=>handleMenuChange('transaksi') },
                  { label:'Total Pendapatan', value:`Rp ${(totalRevenue/1000).toFixed(0)}K`, icon:<TrendingUp className="h-6 w-6"/>, bg:'from-amber-500 to-orange-500', onClick:()=>{} },
                  { label:'Total Obat', value: String(totalProducts), icon:<Package className="h-6 w-6"/>, bg:'from-red-500 to-rose-600', onClick:()=>handleMenuChange('obat') },
                ].map(card => (
                  <div key={card.label} onClick={card.onClick}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-br ${card.bg} text-white p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform`}>{card.icon}</div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                        <p className="text-xl font-bold text-gray-800 mt-0.5">{card.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Side-by-side Tables – data nyata */}
              <div className="grid grid-cols-2 gap-5">
                {/* Transaksi */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Transaksi Terbaru</h3>
                    <button onClick={() => handleMenuChange('transaksi')} className="flex items-center gap-1 text-emerald-600 text-xs hover:underline font-medium">
                      See All <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {['ID','Nama Obat','ID Cust','Status','Total'].map(h => (
                          <th key={h} className={`px-3 py-2.5 text-gray-500 font-semibold text-left`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.slice(0,5).map(order => {
                        const statusMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
                          processing: { color: 'bg-blue-100 text-blue-700', label: 'Diproses', icon: <Clock className="h-3 w-3" /> },
                          shipped: { color: 'bg-amber-100 text-amber-700', label: 'Dikirim', icon: <Truck className="h-3 w-3" /> },
                          delivered: { color: 'bg-emerald-100 text-emerald-700', label: 'Selesai', icon: <CheckCircle2 className="h-3 w-3" /> },
                          cancelled: { color: 'bg-red-100 text-red-700', label: 'Batal', icon: <XCircle className="h-3 w-3" /> },
                        };
                        const s = statusMap[order.status] || statusMap.processing;
                        const products = order.items?.map((i: any) => i.name).join(', ') || '-';
                        return (
                          <tr key={order.id || order.orderId} className="hover:bg-emerald-50/40">
                            <td className="px-3 py-3 font-medium text-emerald-700">{order.orderId}</td>
                            <td className="px-3 py-3 text-gray-600 max-w-[90px] truncate">{products}</td>
                            <td className="px-3 py-3 text-gray-500 font-mono">{order.userId}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.color}`}>
                                {s.icon}{s.label}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-semibold text-gray-700">Rp {((order.total || 0)/1000).toFixed(0)}K</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Daftar Obat */}
                <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden ring-2 ring-emerald-100">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">Daftar Obat</h3>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                        <Input placeholder="Cari..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-7 h-7 text-xs w-28 border-gray-200" />
                      </div>
                    </div>
                    <button onClick={() => handleMenuChange('obat')} className="flex items-center gap-1 text-emerald-600 text-xs hover:underline font-medium">
                      See All <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        {['Kode','Nama','Stok','Harga','Aksi'].map(h => (
                          <th key={h} className={`px-3 py-2.5 text-gray-500 font-semibold ${h==='Aksi'?'text-center':'text-left'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredMedicines.slice(0,7).map(med => (
                        <tr key={med.id} className="hover:bg-emerald-50/40 cursor-pointer" onClick={() => setSelectedMedicine(med)}>
                          <td className="px-3 py-2.5 font-mono text-gray-500">MED{String(med.id).padStart(3,'0')}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <img src={med.photo} alt={med.name} className="w-6 h-6 rounded object-cover border border-gray-100"
                                onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                              <span className="font-medium text-gray-700 truncate max-w-[80px]">{med.name.split(' ').slice(0,2).join(' ')}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            {editingId === med.id ? (
                              <Input type="number" value={editStock}
                                onChange={e => setEditStock(parseInt(e.target.value)||0)}
                                className="w-14 h-6 text-xs px-1" onClick={e => e.stopPropagation()} />
                            ) : (
                              <span className={`font-medium ${med.stock<50?'text-orange-500':'text-gray-700'}`}>{med.stock}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-emerald-600 font-semibold whitespace-nowrap">Rp {(med.price/1000).toFixed(0)}.000</td>
                          <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              {editingId === med.id ? (
                                <>
                                  <button onClick={() => handleSaveStock(med.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X className="h-3.5 w-3.5"/></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingId(med.id); setEditStock(med.stock); }} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Edit className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => handleAddStock(med.id,10)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Plus className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => handleAddStock(med.id,-10)} disabled={med.stock<10} className="p-1 text-red-400 hover:bg-red-50 rounded disabled:opacity-40"><Minus className="h-3.5 w-3.5"/></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 border-t bg-emerald-50 flex items-center justify-between">
                    <span className="text-xs text-gray-600">Total: <span className="font-bold text-emerald-700">{totalProducts} jenis</span></span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">{totalStock} unit</span>
                  </div>
                </div>
              </div>

              {lowStockItems > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg"><Package className="h-5 w-5 text-orange-600"/></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-800">Peringatan Stok Rendah</p>
                    <p className="text-xs text-orange-600">{lowStockItems} obat memiliki stok di bawah 50 unit.</p>
                  </div>
                  <button onClick={() => handleMenuChange('obat')} className="flex items-center gap-1 text-orange-700 text-xs font-semibold hover:underline">
                    Lihat Detail <ChevronRight className="h-3.5 w-3.5"/>
                  </button>
                </div>
              )}
            </>
          )}

          {activeMenu === 'transaksi' && <TransaksiPage />}
          {activeMenu === 'obat' && <DaftarObatPage />}
          {activeMenu === 'customer' && <CustomerPage />}
          {activeMenu === 'admin' && <KelolaAdminPage />}
          {activeMenu === 'chat' && <LiveChatPage />}
          {activeMenu === 'profil' && <ProfilAdminPage user={user} />}

        </main>
      </div>

      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        theme="blue"
        isAuthenticated={true}
      />
    </div>
  );
}
