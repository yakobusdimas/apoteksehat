import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Pill, ArrowLeft, Truck, CreditCard, MapPin, Check, ShieldCheck, Package, X, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApotekLogo } from './ApotekLogo';
import ordersAPI from '../services/ordersAPI';
import paymentAPI from '@/app/services/paymentAPI';

interface Courier {
  id: string; name: string; service: string;
  price: number; estimatedTime: string; logo: string;
}
const couriers: Courier[] = [
  { id: 'gojek-instant', name: 'GoSend', service: 'Instant', price: 15000, estimatedTime: '15-30 Menit', logo: '🛵' },
  { id: 'gojek-sameday', name: 'GoSend', service: 'Same Day', price: 10000, estimatedTime: '3-6 Jam', logo: '🛵' },
  { id: 'grab-instant',  name: 'GrabExpress', service: 'Instant', price: 17000, estimatedTime: '15-30 Menit', logo: '🏍️' },
  { id: 'grab-sameday',  name: 'GrabExpress', service: 'Same Day', price: 12000, estimatedTime: '3-6 Jam', logo: '🏍️' },
];
const paymentMethods = [
  { id: 'qris-shopee', name: 'QRIS API (ShopeePay)', icon: '📱', description: 'Scan QR Code ini dengan e-Wallet atau M-Banking Anda.' },
];

const steps = ['Alamat', 'Pengiriman', 'Pembayaran', 'Konfirmasi'];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();
  const { cart: globalCart, getTotalPrice, clearCart } = useCart();
  
  // Bug #12: Beli Sekarang bypasses cart
  const buyNowItem = location.state?.buyNowItem;
  const cart = buyNowItem ? [buyNowItem] : globalCart;
  const [selectedCourier,  setSelectedCourier]  = useState<Courier | null>(null);
  const [selectedPayment,  setSelectedPayment]  = useState('');
  const [currentStep,      setCurrentStep]      = useState(0);
  const [showQRISModal,    setShowQRISModal]    = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [shippingAddress, setShippingAddress]   = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    address:    user?.address    || '',
    city:       user?.city       || '',
    postalCode: user?.postalCode || '',
  });

  const subtotal     = buyNowItem ? buyNowItem.price * buyNowItem.quantity : getTotalPrice();
  const shippingCost = selectedCourier?.price || 0;
  const total        = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang masih kosong');
      return;
    }
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      toast.error('Mohon lengkapi alamat pengiriman');
      return;
    }
    if (!selectedCourier) {
      toast.error('Mohon pilih jasa pengiriman');
      return;
    }
    if (!selectedPayment) {
      toast.error('Mohon pilih metode pembayaran');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Membuat pesanan...', { id: 'payment-loading' });

    try {
      const addressDetail = [shippingAddress.address, shippingAddress.city, shippingAddress.postalCode]
        .filter(Boolean)
        .join(', ');

      const created = await ordersAPI.create({
        items: cart.map(item => ({
          medicineId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          photo: item.photo,
        })),
        address: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          detail: addressDetail,
        },
        courier: {
          name: selectedCourier.name,
          service: selectedCourier.service,
        },
      });

      if (created.error || !created.order) {
        throw new Error(created.error || 'Gagal membuat pesanan');
      }

      // Autofill future checkout: save the city/postal code to profile if different
      if (
        shippingAddress.city !== user?.city ||
        shippingAddress.postalCode !== user?.postalCode ||
        shippingAddress.address !== user?.address ||
        shippingAddress.phone !== user?.phone
      ) {
        updateProfile({
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        }).catch(err => console.error("Failed to update profile", err));
      }


      const orderId = created.order.orderId;
      const localOrder = {
        ...created.order,
        courier: selectedCourier,
        payment: selectedPayment,
        address: shippingAddress,
        status: 'processing',
      };
      localStorage.setItem(`order_${orderId}`, JSON.stringify(localOrder));
      toast.loading('Menyiapkan pembayaran...', { id: 'payment-loading' });

      const data = await paymentAPI.create({
        orderId,
        items: cart,
        total,
        customer: shippingAddress,
        courier: selectedCourier,
      });
      toast.dismiss('payment-loading');

      if (!data.success || !data.snapToken) {
        throw new Error(data.message || 'Gagal mendapatkan token pembayaran');
      }

      // Guard: script Midtrans Snap bisa gagal dimuat (adblocker / koneksi lambat)
      if (!(window as any).snap || typeof (window as any).snap.pay !== 'function') {
        throw new Error('Layanan pembayaran belum siap. Muat ulang halaman lalu coba lagi.');
      }

      (window as any).snap.pay(data.snapToken, {
        onSuccess: function (result: any) {
          const order = JSON.parse(localStorage.getItem(`order_${orderId}`) || '{}');
          order.status = 'processing';
          order.paymentDetails = result;
          localStorage.setItem(`order_${orderId}`, JSON.stringify(order));

          if (!buyNowItem) clearCart();
          toast.success('Pembayaran berhasil!');
          navigate(`/tracking/${orderId}`);
        },
        onPending: function () {
          if (!buyNowItem) clearCart();
          toast.info('Menunggu pembayaran Anda diselesaikan');
          navigate(`/tracking/${orderId}`);
        },
        onError: function () {
          toast.error('Pembayaran gagal atau dibatalkan');
        },
        onClose: function () {
          toast.info('Anda menutup pop-up pembayaran');
        }
      });
    } catch (error: any) {
      toast.dismiss('payment-loading');
      toast.error(error.message || 'Gagal memproses checkout');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const inputBase = "h-11 rounded-xl border-[color:var(--border)] bg-input text-sm focus:ring-2 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-[color:var(--background)]">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-[color:var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/user/dashboard')} className="rounded-xl h-9 w-9" aria-label="Kembali ke dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center">
            <ApotekLogo size="md" variant="icon" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[color:var(--foreground)]">Checkout</h1>
            <p className="text-[10px] text-emerald-600 font-medium">Selesaikan pesanan Anda</p>
          </div>

          {/* Stepper */}
          <div className="ml-auto hidden md:flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  i < currentStep ? 'bg-primary text-white' :
                  i === currentStep ? 'bg-primary/10 text-primary border-2 border-primary' :
                  'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
                }`}>
                  {i < currentStep ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${i <= currentStep ? 'text-primary' : 'text-[color:var(--muted-foreground)]'}`}>{step}</span>
                {i < steps.length - 1 && <div className={`h-px w-8 ${i < currentStep ? 'bg-primary' : 'bg-[color:var(--border)]'}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left column */}
          <div className="space-y-5">

            {/* Titik Jemput Otomatis (Apotek) */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-emerald-100/50 px-5 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Titik Jemput (Otomatis)</h2>
                </div>
              </div>
              <div className="px-5 py-4 flex gap-4">
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 dark:text-emerald-100">Apotek Sehat Delanggu (Pusat)</p>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                    Jl. Raya Delanggu Utara No. 182, Gatak, Kec. Delanggu, Kab. Klaten, Jawa Tengah 57471
                  </p>
                  <a href="https://maps.app.goo.gl/3Xz8mB4F8z" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2 hover:underline">
                    Lihat di Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-[color:var(--card)] rounded-2xl border border-[color:var(--border)] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[color:var(--foreground)]">Alamat Pengiriman</h2>
                  <p className="text-xs text-[color:var(--muted-foreground)]">Masukkan alamat tujuan pengiriman</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-name" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">Nama Lengkap</Label>
                    <Input id="checkout-name" className={inputBase} value={shippingAddress.name}
                      onChange={e => setShippingAddress({...shippingAddress, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-phone" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">Nomor Telepon</Label>
                    <Input id="checkout-phone" className={inputBase} placeholder="08xxxxxxxxxx" value={shippingAddress.phone}
                      onChange={e => setShippingAddress({...shippingAddress, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout-address" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">Alamat Lengkap</Label>
                  <Input id="checkout-address" className={inputBase} placeholder="Jalan, nomor rumah, RT/RW" value={shippingAddress.address}
                    onChange={e => setShippingAddress({...shippingAddress, address: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-city" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">Kota</Label>
                    <Input id="checkout-city" className={inputBase} value={shippingAddress.city}
                      onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout-postal" className="text-xs font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)]">Kode Pos</Label>
                    <Input id="checkout-postal" className={inputBase} value={shippingAddress.postalCode}
                      onChange={e => setShippingAddress({...shippingAddress, postalCode: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Courier */}
            <div className="bg-[color:var(--card)] rounded-2xl border border-[color:var(--border)] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[color:var(--foreground)]">Pilih Kurir</h2>
                  <p className="text-xs text-[color:var(--muted-foreground)]">Pilih jasa pengiriman yang Anda inginkan</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid md:grid-cols-2 gap-3">
                  {couriers.map(courier => (
                    <button
                      key={courier.id}
                      onClick={() => setSelectedCourier(courier)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                        selectedCourier?.id === courier.id
                          ? 'border-primary bg-emerald-50/60 shadow-sm shadow-emerald-200/50'
                          : 'border-[color:var(--border)] hover:border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{courier.logo}</span>
                          <div>
                            <p className="text-sm font-bold text-[color:var(--foreground)]">{courier.name}</p>
                            <Badge variant="secondary" className="text-[10px] font-bold border-0">{courier.service}</Badge>
                          </div>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedCourier?.id === courier.id
                            ? 'border-primary bg-primary'
                            : 'border-[color:var(--border)]'
                        }`}>
                          {selectedCourier?.id === courier.id && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[color:var(--muted-foreground)]">Estimasi {courier.estimatedTime}</span>
                        <span className="text-sm font-bold text-primary">Rp {courier.price.toLocaleString('id-ID')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[color:var(--card)] rounded-2xl border border-[color:var(--border)] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[color:var(--foreground)]">Metode Pembayaran</h2>
                  <p className="text-xs text-[color:var(--muted-foreground)]">Pilih cara pembayaran yang paling nyaman</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                      selectedPayment === method.id
                        ? 'border-primary bg-emerald-50/60 shadow-sm shadow-emerald-200/50'
                        : 'border-[color:var(--border)] hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{method.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-[color:var(--foreground)]">{method.name}</p>
                          <p className="text-xs text-[color:var(--muted-foreground)]">{method.description}</p>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPayment === method.id
                          ? 'border-primary bg-primary'
                          : 'border-[color:var(--border)]'
                      }`}>
                        {selectedPayment === method.id && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary ─────────────────────────────────────────── */}
          <div>
            <div className="bg-[color:var(--card)] rounded-2xl border border-[color:var(--border)] shadow-sm sticky top-20 overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-5 py-4">
                <h2 className="font-bold text-[color:var(--foreground)]">Ringkasan Pesanan</h2>
              </div>
              <div className="p-5 space-y-4">

                {/* Cart items */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-[color:var(--border)] last:border-0 last:pb-0">
                      <div className="text-2xl h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0">{item.image}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[color:var(--foreground)] truncate">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">{item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                      <p className="font-bold text-sm text-primary shrink-0">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 pt-3 border-t border-[color:var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--muted-foreground)]">Subtotal</span>
                    <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--muted-foreground)]">Ongkir</span>
                    <span className="font-semibold">{selectedCourier ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Pilih kurir'}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-[color:var(--border)]">
                    <span>Total</span>
                    <span>Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-2 rounded-xl bg-[color:var(--secondary)]/50 p-3">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-[color:var(--muted-foreground)]">Transaksi aman & terenkripsi</p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-emerald-200/50 gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Package className="h-5 w-5" />}
                  {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
