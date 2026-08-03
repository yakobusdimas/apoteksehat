import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { ApotekLogo } from './ApotekLogo';
import api from '../services/api';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiOrders, setApiOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<{ status: string; orders: any[] }>('/api/orders');
      if (!result.error && result.data?.orders) {
        setApiOrders(result.data.orders);
      }
    } catch {
      // Ignore API errors, fallback to empty/local
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-[color:var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/user/dashboard')}
              className="rounded-xl h-9 w-9"
              aria-label="Kembali ke dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <ApotekLogo size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[color:var(--muted-foreground)] hidden sm:inline">
              Halo, <strong className="text-[color:var(--foreground)]">{user?.name}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-6">

          {/* Title Banner */}
          <div className="bg-white rounded-2xl border border-[color:var(--border)] shadow-sm px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-[color:var(--foreground)] text-xl flex items-center gap-2.5">
                <Package className="h-5 w-5 text-primary" /> Riwayat Pesanan
              </h1>
              <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5">
                Pantau dan pelajari status pesanan obat Anda
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              className="text-xs gap-1.5 rounded-xl"
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[color:var(--border)] shadow-sm">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-[color:var(--muted-foreground)] font-medium">Memuat riwayat pesanan...</p>
            </div>
          ) : apiOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[color:var(--border)] text-center p-6 shadow-sm">
              <span className="text-6xl">📦</span>
              <h2 className="font-bold text-lg text-[color:var(--foreground)]">Belum ada riwayat pesanan</h2>
              <p className="text-sm text-[color:var(--muted-foreground)] max-w-sm">
                Anda belum pernah melakukan pemesanan obat. Pesanan yang telah diselesaikan akan tampil di sini.
              </p>
              <Button onClick={() => navigate('/user/dashboard')} className="mt-2 shadow-md shadow-emerald-200/50">
                Mulai Belanja Obat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiOrders.map(order => {
                const isCompleted = order.status === 'completed' || order.status === 'selesai' || order.status === 'delivered';
                const isCancelled = order.status === 'cancelled' || order.status === 'dibatalkan';

                return (
                  <div
                    key={order.id || order.orderId}
                    className="bg-white rounded-2xl border border-[color:var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Top Row: Order ID + Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--border)] pb-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-emerald-600" />
                        <span className="font-mono font-bold text-sm text-[color:var(--foreground)] uppercase">
                          {order.orderId || order.id}
                        </span>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                        </span>
                      </div>

                      <Badge className={`border-0 font-bold px-3 py-1 text-xs ${
                        isCompleted ? 'bg-emerald-100 text-emerald-700' :
                        isCancelled ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {isCompleted ? 'Selesai' : isCancelled ? 'Dibatalkan' : 'Diproses'}
                      </Badge>
                    </div>

                    {/* Middle Row: Items preview & Courier */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">
                          {order.items && order.items.length > 0
                            ? `${order.items[0].name || 'Obat'} ${order.items.length > 1 ? `+ ${order.items.length - 1} produk lainnya` : ''}`
                            : 'Pesanan Obat'}
                        </p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">
                          Kurir: <strong className="text-gray-700">{order.courier?.name || 'GoSend'}</strong> ({order.courier?.service || 'Same Day'})
                        </p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div>
                          <p className="text-[10px] text-[color:var(--muted-foreground)]">Total Belanja</p>
                          <p className="text-base font-bold text-primary">
                            Rp {(order.total || 0).toLocaleString('id-ID')}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => navigate(`/tracking/${order.orderId || order.id}`)}
                          className="gap-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          Lacak <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
