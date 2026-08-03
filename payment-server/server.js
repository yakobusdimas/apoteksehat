/**
 * Payment Server - Apotek Sehat
 * Integrasi Midtrans Snap untuk QRIS, GoPay, ShopeePay, BCA Virtual Account
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');
const Database = require('better-sqlite3');

// Fail-fast if required env vars are missing
const requiredEnv = [
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'PAYMENT_WEBHOOK_SECRET',
  'FRONTEND_URL',
];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`[ERROR] Missing required environment variable: ${env}`);
    process.exit(1);
  }
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Midtrans Config ─────────────────────────────────────────────────────────
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION,
  serverKey: SERVER_KEY,
  clientKey: CLIENT_KEY,
});

console.log(`\n[Midtrans] Mode: ${IS_PRODUCTION ? '🔴 PRODUCTION' : '🟡 SANDBOX (Testing)'}`);
console.log(`[Backend]  Sync URL: ${BACKEND_API_URL}`);
console.log(`[Frontend] Callback URL: ${FRONTEND_URL}`);

// ─── SQLite Database ─────────────────────────────────────────────────────────
const DB_PATH = process.env.PAYMENT_DB_PATH || path.join(__dirname, 'payment.db');
const db = new Database(DB_PATH);

// Create table if not exists
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_orders (
      order_id TEXT PRIMARY KEY,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_type TEXT,
      snap_token TEXT,
      total INTEGER NOT NULL,
      customer_json TEXT NOT NULL,
      courier_json TEXT,
      items_json TEXT NOT NULL,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
  `);
  console.log(`[DB] SQLite database ready at ${DB_PATH}`);
};
initDb();

// Helper: serialize to JSON
const toJson = (obj) => JSON.stringify(obj);
const fromJson = (str) => JSON.parse(str);

// Helper: upsert order
const upsertOrder = (order) => {
  const stmt = db.prepare(`
    INSERT INTO payment_orders (
      order_id, payment_status, payment_type, snap_token, total, 
      customer_json, courier_json, items_json, paid_at, created_at, updated_at
    ) VALUES (
      @orderId, @paymentStatus, @paymentType, @snapToken, @total,
      @customerJson, @courierJson, @itemsJson, @paidAt, @createdAt, @updatedAt
    ) ON CONFLICT(order_id) DO UPDATE SET
      payment_status = excluded.payment_status,
      payment_type = excluded.payment_type,
      snap_token = excluded.snap_token,
      total = excluded.total,
      customer_json = excluded.customer_json,
      courier_json = excluded.courier_json,
      items_json = excluded.items_json,
      paid_at = excluded.paid_at,
      updated_at = excluded.updated_at
  `);
  stmt.run({
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    paymentType: order.paymentType || null,
    snapToken: order.snapToken,
    total: order.total,
    customerJson: toJson(order.customer),
    courierJson: order.courier ? toJson(order.courier) : null,
    itemsJson: toJson(order.items),
    paidAt: order.paidAt || null,
    createdAt: order.createdAt,
    updatedAt: new Date().toISOString(),
  });
};

// Helper: get order by ID
const getOrder = (orderId) => {
  const stmt = db.prepare('SELECT * FROM payment_orders WHERE order_id = ?');
  const row = stmt.get(orderId);
  if (!row) return null;
  return {
    ...row,
    customer: fromJson(row.customer_json),
    courier: row.courier_json ? fromJson(row.courier_json) : null,
    items: fromJson(row.items_json),
  };
};

// Helper: list all orders (for admin)
const listOrders = () => {
  const stmt = db.prepare('SELECT * FROM payment_orders ORDER BY created_at DESC');
  return stmt.all().map(row => ({
    ...row,
    customer: fromJson(row.customer_json),
    courier: row.courier_json ? fromJson(row.courier_json) : null,
    items: fromJson(row.items_json),
  }));
};

// One-time migration: import orders.json if exists
const migrateFromJson = () => {
  const jsonPath = path.join(__dirname, 'orders.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const orders = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      for (const [orderId, order] of Object.entries(orders)) {
        upsertOrder({
          orderId,
          paymentStatus: order.paymentStatus,
          paymentType: order.paymentType,
          snapToken: order.snapToken,
          total: order.total,
          customer: order.customer,
          courier: order.courier,
          items: order.items,
          paidAt: order.paidAt,
          createdAt: order.createdAt,
        });
      }
      fs.renameSync(jsonPath, jsonPath + '.bak');
      console.log(`[DB] Migrated ${Object.keys(orders).length} orders from orders.json`);
    } catch (err) {
      console.error('[DB] Migration failed:', err.message);
    }
  }
};
migrateFromJson();

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/config
 * Kirim client key ke frontend (aman karena bukan server key)
 */
app.get('/api/config', (req, res) => {
  res.json({
    clientKey: CLIENT_KEY,
    isProduction: IS_PRODUCTION,
  });
});

/**
 * POST /api/payment/create
 * Buat transaksi Midtrans, kembalikan snap_token
 */
app.post(['/api/payment/create', '/payment/create', '/create'], async (req, res) => {
  try {
    const { orderId, items, customer, courier } = req.body;

    if (!orderId || !items || !customer) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    // Ambil harga produk dari database (simulasi)
    // Dalam implementasi nyata, ganti dengan query ke database produk
    let total = 0;
    const itemDetails = [];

    for (const item of items) {
      // Simulasi: Ambil harga dari database berdasarkan item.id
      // Contoh: const product = db.prepare('SELECT price FROM products WHERE id = ?').get(item.id);
      // Di sini kita asumsikan harga diambil dari database
      const price = item.price; // Ganti dengan harga dari database
      total += price * (item.quantity || 1);
      itemDetails.push({
        id: String(item.id || item.name),
        price: Math.round(price),
        quantity: item.quantity || 1,
        name: (item.name || 'Produk').substring(0, 50),
      });
    }

    // Tambah ongkir sebagai item
    if (courier) {
      total += courier.price || 0;
      itemDetails.push({
        id: 'shipping',
        price: Math.round(courier.price || 0),
        quantity: 1,
        name: `Ongkir ${courier.name} ${courier.service}`,
      });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(total),
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customer.name || 'Pelanggan',
        phone: customer.phone || '',
        email: customer.email || 'customer@apoteksehat.com',
        billing_address: {
          address: customer.address || '',
        },
      },
      callbacks: {
        finish: `${FRONTEND_URL}/tracking/${orderId}`
      }
    };

    const transaction = await snap.createTransaction(parameter);
    upsertOrder({
      orderId,
      paymentStatus: 'pending',
      snapToken: transaction.token,
      total: Math.round(total),
      customer,
      courier,
      items,
      createdAt: new Date().toISOString(),
    });

    console.log(`[+] Transaksi dibuat: ${orderId} | Total: Rp ${total.toLocaleString('id-ID')}`);

    res.json({
      success: true,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });

  } catch (error) {
    console.error('[ERROR] Create transaction:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal membuat transaksi',
    });
  }
});

/**
 * POST /api/payment/webhook
 * Terima notifikasi dari Midtrans setelah pembayaran
 */
app.post('/api/payment/webhook', (req, res) => {
  try {
    // Validasi PAYMENT_WEBHOOK_SECRET
    if (!PAYMENT_WEBHOOK_SECRET) {
      console.error('[ERROR] PAYMENT_WEBHOOK_SECRET is not set!');
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = req.body;

    // Verifikasi signature untuk keamanan
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature_key))) {
      console.warn('[WARN] Invalid webhook signature for order:', order_id);
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // Validasi payload wajib
    if (!order_id || !status_code || !gross_amount || !transaction_status) {
      console.warn('[WARN] Incomplete webhook payload for order:', order_id);
      return res.status(400).json({ message: 'Incomplete payload' });
    }

    // Allowlist status yang valid
    const validStatuses = new Set(['settlement', 'capture', 'pending', 'cancel', 'expire', 'deny']);
    if (!validStatuses.has(transaction_status)) {
      console.warn('[WARN] Invalid transaction status:', transaction_status, 'for order:', order_id);
      return res.status(400).json({ message: 'Invalid transaction status' });
    }

    // Simpan data order ke SQLite
    const order = getOrder(order_id);
    if (!order) {
      console.warn(`[WARN] Order not found in DB: ${order_id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    let newStatus = order.paymentStatus;

    if (transaction_status === 'settlement' ||
       (transaction_status === 'capture' && fraud_status === 'accept')) {
      newStatus = 'paid';
      console.log(`[✓] Pembayaran BERHASIL: ${order_id} via ${payment_type}`);
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    } else if (transaction_status === 'cancel') {
      newStatus = 'cancelled';
    } else if (transaction_status === 'expire') {
      newStatus = 'expired';
    } else if (transaction_status === 'deny') {
      newStatus = 'failed';
    }

    // Simpan data order ke SQLite
    order.paymentStatus = newStatus;
    order.paymentType = payment_type;
    order.paidAt = newStatus === 'paid' ? new Date().toISOString() : null;
    upsertOrder(order);

    // Sync payment status ke backend Flask
    syncPaymentStatusToBackend(order_id, {
      paymentStatus: newStatus,
      paymentType: payment_type || '',
      paymentReference: transaction_status,
      paidAt: newStatus === 'paid' ? new Date().toISOString() : null,
    });

    res.status(200).json({ message: 'OK' });

  } catch (error) {
    console.error('[ERROR] Webhook:', error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Kirim update status pembayaran ke backend Flask.
 * Best-effort: gagal tidak membuat webhook gagal.
 */
function syncPaymentStatusToBackend(orderId, payload) {
  try {
    const bodyStr = JSON.stringify(payload);
    const url = new URL(`/api/orders/${orderId}/payment-status`, BACKEND_API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        ...(PAYMENT_WEBHOOK_SECRET ? { 'X-Payment-Secret': PAYMENT_WEBHOOK_SECRET } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[✓] Backend sync OK for ${orderId}: ${payload.paymentStatus}`);
        } else {
          console.warn(`[WARN] Backend sync non-2xx ${res.statusCode} for ${orderId}: ${data}`);
        }
      });
    });

    req.on('error', (err) => {
      console.warn(`[WARN] Backend sync failed for ${orderId}: ${err.message}`);
    });

    req.write(bodyStr);
    req.end();
  } catch (err) {
    console.warn(`[WARN] syncPaymentStatusToBackend error: ${err.message}`);
  }
}

/**
 * GET /api/payment/status/:orderId
 * Cek status pembayaran (dipakai frontend untuk polling)
 */
app.get('/api/payment/status/:orderId', (req, res) => {
  const order = getOrder(req.params.orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  }

  res.json({
    success: true,
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    paymentType: order.paymentType || null,
    paidAt: order.paidAt || null,
  });
});

/**
 * GET /api/orders
 * Daftar semua order (untuk Admin Dashboard)
 */
app.get('/api/orders', (req, res) => {
  const list = listOrders();
  res.json({ success: true, total: list.length, orders: list });
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: IS_PRODUCTION ? 'production' : 'sandbox' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('    PAYMENT SERVER - APOTEK SEHAT');
  console.log('='.repeat(60));
  console.log(`  Status  : ${IS_PRODUCTION ? '🔴 PRODUCTION (Uang Nyata!)' : '🟡 SANDBOX (Testing Gratis)'}`);
  console.log(`  Server  : http://localhost:${PORT}`);
  console.log(`  Webhook : http://localhost:${PORT}/api/payment/webhook`);
  console.log('='.repeat(60) + '\n');
});
