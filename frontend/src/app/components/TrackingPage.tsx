import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Pill, ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Receipt, ShieldCheck, Loader2 } from 'lucide-react';
import { ApotekLogo } from './ApotekLogo';
import ordersAPI from '../services/ordersAPI';
import paymentAPI from '../services/paymentAPI';
import { toast } from 'sonner';

interface TrackingStatus {
  status: string;
  description: string;
  timestamp: string;
  location: string;
  completed: boolean;
  current: boolean;
}

interface Order {
  orderId: string;
  items: any[];
  total: number;
  courier: any;
  payment: string;
  address: any;
  status: string;
  shippingCost?: number;
  paymentStatus?: string;
  paymentType?: string;
  paidAt?: string;
  createdAt: string;
}

export default function TrackingPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const buildHistory = (parsedOrder: Order): TrackingStatus[] => {
      const t = new Date(parsedOrder.createdAt || new Date().toISOString()).getTime();
      const courierName = parsedOrder.courier?.name || 'GoSend';
      const destination = parsedOrder.address?.city || parsedOrder.address?.detail || 'Alamat tujuan';
      const isCompleted = parsedOrder.status === 'completed' || parsedOrder.status === 'selesai' || parsedOrder.status === 'delivered';
      const isShipped = isCompleted || parsedOrder.status === 'shipped';

      return [
        {
          status: 'Pesanan Dibuat',
          description: 'Pesanan Anda telah berhasil dibuat.',
          timestamp: new Date(t).toISOString(),
          location: 'Sistem Apotek',
          completed: true, current: false
        },
        {
          status: 'Dikemas',
          description: 'Pesanan sedang disiapkan & dikemas oleh apoteker.',
          timestamp: new Date(t + 30 * 60000).toISOString(),
          location: 'Apotek Sehat, Pusat',
          completed: true, current: parsedOrder.status === 'processing' && !isCompleted
        },
        {
          status: 'Terkirim',
          description: `Paket diserahkan ke ${courierName}.`,
          timestamp: isShipped ? new Date(t + 120 * 60000).toISOString() : '',
          location: `${courierName} Hub`,
          completed: isShipped, current: parsedOrder.status === 'shipped' && !isCompleted
        },
        {
          status: 'Sampai Tujuan',
          description: isCompleted ? 'Paket telah berhasil diterima oleh pemesan.' : 'Paket dalam perjalanan ke alamat Anda.',
          timestamp: isCompleted ? new Date(t + 180 * 60000).toISOString() : '',
          location: destination,
          completed: isCompleted, current: isCompleted
        }
      ];
    };

    const loadOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      const cached = localStorage.getItem(`order_${orderId}`);
      let parsedOrder = cached ? JSON.parse(cached) : null;

      // Prioritas ambil dari backend
      try {
        const { order: backendOrder, error } = await ordersAPI.getByCode(orderId);
        if (backendOrder) {
          parsedOrder = backendOrder;
        } else if (error) {
          console.warn('Backend fetch failed:', error);
        }
      } catch (err) {
        console.warn('Backend fetch error:', err);
      }

      if (parsedOrder) {
        setOrder(parsedOrder);
        setTrackingHistory(buildHistory(parsedOrder));
      } else {
        // Fallback ke list orders jika backend tidak bisa diakses
        const { orders } = await ordersAPI.list();
        const found = orders.find(o => o.orderId === orderId || String(o.id) === String(orderId));
        if (found) {
          setOrder(found as unknown as Order);
          setTrackingHistory(buildHistory(found as unknown as Order));
        }
      }
      setIsLoading(false);
    };

    loadOrder();
  }, [orderId]);

  const handlePayNow = async () => {
    if (!order) return;
    toast.loading('Menyiapkan pembayaran...', { id: 'payment-loading' });
    try {
      const data = await paymentAPI.create({
        orderId: order.orderId,
        items: order.items,
        total: order.total,
        customer: order.address,
        courier: order.courier,
      });
      toast.dismiss('payment-loading');

      if (!data.success || !data.snapToken) {
        throw new Error(data.message || 'Gagal mendapatkan token pembayaran');
      }

      (window as any).snap.pay(data.snapToken, {
        onSuccess: function () {
          toast.success('Pembayaran berhasil!');
          const cached = JSON.parse(localStorage.getItem(`order_${order.orderId}`) || '{}');
          cached.paymentStatus = 'paid';
          localStorage.setItem(`order_${order.orderId}`, JSON.stringify(cached));
          window.location.reload();
        },
        onPending: function () {
          toast.info('Menunggu pembayaran Anda diselesaikan');
        },
        onError: function () {
          toast.error('Pembayaran gagal atau dibatalkan');
        },
        onClose: function () {
          toast.info('Anda menutup pop-up pembayaran');
        }
      });
    } catch (err: any) {
      toast.dismiss('payment-loading');
      toast.error(err.message || 'Gagal memproses pembayaran');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[color:var(--border)] shadow-xl p-8 text-center rounded-2xl">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-sm text-[color:var(--muted-foreground)] mb-6">Nomor pesanan <span className="font-mono text-primary font-bold">{orderId}</span> tidak ada dalam sistem.</p>
          <Button onClick={() => navigate('/user/dashboard')} className="w-full">Kembali ke Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-[color:var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/user/dashboard')} className="rounded-xl h-9 w-9" aria-label="Kembali ke dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <ApotekLogo size="sm" variant="icon" />
          <div>
            <h1 className="text-sm font-bold text-[color:var(--foreground)]">Pelacakan Pesanan</h1>
            <p className="text-[10px] text-emerald-600 font-medium font-mono uppercase tracking-widest">{orderId}</p>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Tracking Status Card */}
            <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4 bg-emerald-50/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[color:var(--foreground)]">Status Pengiriman</h2>
                    <p className="text-xs text-[color:var(--muted-foreground)]">Estimasi: <span className="font-bold text-primary">{order.courier?.estimatedTime || 'Diproses'}</span></p>
                  </div>
                </div>
                <Badge className={`border-0 font-bold px-3 py-1 ${
                  order.status === 'completed' || order.status === 'selesai' || order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                    : order.status === 'cancelled' || order.status === 'dibatalkan'
                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                }`}>
                  {order.status === 'completed' || order.status === 'selesai' || order.status === 'delivered'
                    ? 'Selesai'
                    : order.status === 'cancelled' || order.status === 'dibatalkan'
                    ? 'Dibatalkan'
                    : 'Dalam Proses'}
                </Badge>
              </div>
              <div className="p-6 md:p-8">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] md:before:ml-[23px] before:-translate-x-px md:before:translate-x-0 before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                  {trackingHistory.map((track, index) => {
                    const isDone = track.completed;
                    const isCurr = track.current;
                    const isWait = !isDone && !isCurr;

                    let Icon = CheckCircle2;
                    if (index === 0) Icon = Receipt;
                    else if (index === 1) Icon = Package;
                    else if (index === 2) Icon = Truck;
                    else if (index === 3) Icon = MapPin;

                    return (
                      <div key={index} className={`relative flex items-start gap-5 ${isWait ? 'opacity-50' : ''}`}>
                        {/* Dot */}
                        <div className={`relative z-10 flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm transition-colors ${
                          isCurr ? 'bg-primary text-white shadow-emerald-200/50' : 
                          isDone ? 'bg-emerald-100 text-primary' : 
                          'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${isCurr ? 'animate-pulse' : ''}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col pt-1.5 md:pt-2.5 pb-2 min-w-0">
                          <h4 className={`text-sm md:text-base font-bold leading-none ${isCurr ? 'text-primary' : 'text-[color:var(--foreground)]'}`}>
                            {track.status}
                          </h4>
                          <p className="mt-1.5 text-xs text-[color:var(--muted-foreground)] leading-5">
                            {track.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] md:text-xs text-[color:var(--muted-foreground)] font-medium">
                            {track.timestamp ? (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {new Date(track.timestamp).toLocaleString('id-ID', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-gray-300">
                                <Clock className="h-3.5 w-3.5" /> Menunggu...
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {track.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4 animate-fade-up delay-100">
              <div className="bg-white rounded-2xl border border-[color:var(--border)] p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-widest text-[color:var(--muted-foreground)] font-bold mb-1">Kurir Pengiriman</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{order.courier?.logo || '🚚'}</span>
                  <div>
                    <p className="font-bold text-[color:var(--foreground)]">{order.courier?.name || 'Kurir'}</p>
                    <p className="text-xs text-primary font-medium">{order.courier?.service || 'Pengiriman'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-[color:var(--border)] p-5">
                <p className="text-[10px] uppercase tracking-widest text-[color:var(--muted-foreground)] font-bold mb-2">Alamat Tujuan</p>
                <p className="font-bold text-[color:var(--foreground)] text-sm">{order.address?.name}</p>
                <p className="text-xs text-[color:var(--muted-foreground)] mb-1">{order.address?.phone}</p>
                <p className="text-xs text-[color:var(--muted-foreground)] leading-tight">
                  {order.address?.address || order.address?.detail}, {order.address?.city} <br/> {order.address?.postalCode}
                </p>
              </div>
            </div>

          </div>

          {/* Right column: Order Summary */}
          <div className="animate-fade-up delay-200">
            <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm sticky top-20 overflow-hidden">
              <div className="border-b border-[color:var(--border)] px-5 py-4 bg-gray-50/50">
                <h2 className="font-bold text-[color:var(--foreground)]">Detail Pesanan</h2>
              </div>
              <div className="p-5 space-y-4">

                {/* Items */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-[color:var(--border)] last:border-0 last:pb-0">
                      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="h-10 w-10 object-cover rounded-xl"
                            onError={e => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const parent = img.parentElement!;
                              parent.innerHTML = `<span class="text-2xl">${item.image || '💊'}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{item.image || '💊'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[color:var(--foreground)] truncate">{item.name}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">{item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 pt-3 border-t border-[color:var(--border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--muted-foreground)]">Subtotal</span>
                    <span className="font-medium">Rp {(order.total - (order.shippingCost || 0)).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--muted-foreground)]">Ongkir</span>
                    <span className="font-medium">Rp {(order.shippingCost || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-[color:var(--border)]">
                    <span>Total Bayar</span>
                    <span>Rp {order.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3 mt-4">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest">Metode Bayar</p>
                    <p className="text-sm text-blue-900 font-bold capitalize">{order.paymentType ? order.paymentType.replace(/_/g, ' ') : order.payment}</p>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate('/user/dashboard')}>
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
