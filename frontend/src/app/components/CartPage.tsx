import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, CreditCard, Pill } from 'lucide-react';
import { ApotekLogo } from './ApotekLogo';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();

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
                <ShoppingCart className="h-5 w-5 text-primary" /> Keranjang Belanja
              </h1>
              <p className="text-sm text-[color:var(--muted-foreground)] mt-0.5">
                {totalItems} item dipilih
              </p>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Kosongkan
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-[color:var(--border)] text-center p-6 shadow-sm">
              <span className="text-6xl">🛒</span>
              <h2 className="font-bold text-lg text-[color:var(--foreground)]">Keranjang masih kosong</h2>
              <p className="text-sm text-[color:var(--muted-foreground)] max-w-sm">
                Anda belum menambahkan produk ke keranjang. Jelajahi katalog obat untuk mulai belanja.
              </p>
              <Button onClick={() => navigate('/user/dashboard')} className="mt-2 shadow-md shadow-emerald-200/50">
                Lihat Katalog Obat
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_340px] gap-6">
              {/* Cart Items List */}
              <div className="space-y-3">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white rounded-2xl border border-[color:var(--border)] p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-16 w-16 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 overflow-hidden border border-emerald-100/50">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-xl"
                          onError={e => {
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const parent = img.parentElement!;
                            parent.innerHTML = `<span class="text-3xl">${item.image || '💊'}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-3xl">{item.image || '💊'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-[color:var(--foreground)] truncate">{item.name}</p>
                      <p className="text-xs text-[color:var(--muted-foreground)] mb-1">{item.category}</p>
                      <p className="text-sm font-bold text-primary">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[color:var(--border)]">
                      <div className="flex items-center gap-2 border border-[color:var(--border)] rounded-xl p-1 bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-[color:var(--foreground)] hover:bg-gray-100 transition-colors shadow-xs"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-[color:var(--foreground)] hover:bg-gray-100 transition-colors shadow-xs"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-xl hover:bg-red-50 transition-colors"
                        aria-label="Hapus produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[color:var(--border)] p-5 shadow-sm space-y-4 sticky top-20">
                  <h2 className="font-bold text-[color:var(--foreground)] text-base border-b border-[color:var(--border)] pb-3">
                    Ringkasan Pesanan
                  </h2>

                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">Subtotal ({totalItems} item)</span>
                      <span className="font-semibold text-[color:var(--foreground)]">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-foreground)]">Ongkir</span>
                      <span className="text-xs text-emerald-600 font-semibold">Dihitung saat checkout</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-[color:var(--border)]">
                      <span>Total</span>
                      <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/checkout')}
                    className="w-full gap-2 py-6 text-base font-bold shadow-lg shadow-emerald-200/50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    <CreditCard className="h-5 w-5" /> Lanjut ke Pembayaran
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
