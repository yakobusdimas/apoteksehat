# 💾 Data Persistence - Apotek Sehat

Dokumentasi tentang bagaimana data disimpan, diakses, dan batasan persistensi data
dalam aplikasi Apotek Sehat.

---

## Arsitektur Data Saat Ini

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Browser)                         │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ localStorage      │  │ sessionStorage    │                    │
│  │                   │  │                   │                    │
│  │ • apotek_users_db │  │ • apotek_auth_user│ (if !remember)    │
│  │   (registered     │  │   (current session)                   │
│  │    users + pw)    │  │                   │                    │
│  │                   │  └──────────────────┘                    │
│  │ • apotek_auth_user│                                          │
│  │   (if remember)   │  ┌──────────────────┐                    │
│  │                   │  │ React State      │                    │
│  └──────────────────┘  │ • Cart items     │                    │
│                         │ • UI state       │                    │
│                         └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Flask Server)                      │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ JSON Files        │  │ Model File        │                    │
│  │                   │  │                   │                    │
│  │ • medicines_      │  │ • chatbot_model   │                    │
│  │   primary.json   │  │   .pkl            │                    │
│  │   (200+ obat)    │  │                   │                    │
│  │ • intents.json    │  └──────────────────┘                    │
│  │   (13 intents)   │                                          │
│  │ • synonyms_      │  ┌──────────────────┐                    │
│  │   id.json        │  │ In-Memory         │                    │
│  └──────────────────┘  │ • Model object    │                    │
│                         │ • Data objects    │                    │
│                         └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Lokasi Data Detail

### Frontend (Browser Storage)

| Key | Lokasi | Isi | Persisten? |
|---|---|---|---|
| `apotek_users_db` | localStorage | Daftar user terdaftar + password (plain text) | Ya (permanen sampai dihapus) |
| `apotek_auth_user` | localStorage/sessionStorage | Data user yang sedang login (tanpa password) | Ya (30 hari jika remember, sampai tab tutup jika tidak) |

**Catatan Penting:**
- Password tersimpan sebagai **plain text** di localStorage (ini demo only).
- Data hilang jika user membersihkan browser data.
- Data berbeda per browser/device.

### Backend (File System)

| File | Lokasi | Isi | Read-only? |
|---|---|---|---|
| `chatbot_model.pkl` | `model_training/model/` | Model NLP hasil training | Ya |
| `medicines_primary.json` | `model_training/data/` | Dataset 200+ obat | Ya |
| `intents.json` | `model_training/data/` | 13 intent + pattern | Ya |
| `synonyms_id.json` | `model_training/data/` | Sinonim penyakit | Ya |
| `Medicine_Details.csv` | `model_training/` | Dataset mentah | Ya |

**Catatan:**
- Semua file dibaca saat Flask server startup.
- Data di-load ke memory (RAM) dan tidak ditulis ulang.
- Tidak ada write operation ke file dari backend.

---

## Risiko dan Batasan

### 🟡 Batasan Demo (Diterima untuk Tugas Akhir)

1. **Data User Hilang Jika Browser Dibersihkan**
   - Semua user terdaftar tersimpan di localStorage browser.
   - Clear browser data = semua user hilang.
   - Data tidak sync antar browser/device.

2. **Password Tidak Aman**
   - Password disimpan plain text.
   - Bisa dilihat di DevTools → Application → localStorage.
   - Ini bukan praktik aman untuk production.

3. **Tidak Ada Multi-user Concurrent**
   - Data di localStorage bersifat per-browser.
   - Admin di browser A tidak bisa melihat user di browser B.

4. **Tidak Ada Audit Trail**
   - Tidak ada log siapa login kapan.
   - Tidak ada history perubahan data.

5. **Data Obat Statis**
   - Daftar obat tidak bisa diubah tanpa edit file JSON.
   - Tidak ada fitur CRUD obat dari admin dashboard (meskipun UI-nya ada).

6. **Tidak Ada Order Persistence**
   - Order/pesanan mungkin hanya tersimpan di state React.
   - Refresh page = data order hilang (tergantung implementasi).

### 🔴 Masalah Serius untuk Production

- Tidak ada database server-side
- Tidak ada enkripsi data sensitif
- Tidak ada backup mechanism
- Tidak ada data migration strategy
- Tidak ada concurrent access handling

---

## Rekomendasi untuk Production

### Database yang Direkomendasikan

#### Opsi 1: SQLite (Demo Offline / Small Scale)
```sql
-- Tabel minimal
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    password_hash TEXT NOT NULL,  -- bcrypt hash
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    composition TEXT,
    uses TEXT,
    side_effects TEXT,
    price REAL,
    stock INTEGER,
    image_url TEXT
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    total_price REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY,
    order_id TEXT REFERENCES orders(id),
    medicine_id INTEGER REFERENCES medicines(id),
    quantity INTEGER,
    price REAL
);

CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Opsi 2: PostgreSQL (Production / Multi-user)
- Gunakan SQLAlchemy sebagai ORM di Flask.
- Migrasi dengan Alembic.
- Hosting di cloud (Supabase, Neon, Railway).

### Migration Path

```
Step 1: Buat backend auth endpoint (/api/login, /api/register)
Step 2: Hash password dengan bcrypt
Step 3: Pindahkan user data dari localStorage ke database
Step 4: Tambah JWT/session auth
Step 5: Pindahkan medicine data ke database
Step 6: Tambah CRUD endpoint untuk admin
Step 7: Implementasi order system
Step 8: Tambah audit logging
```

---

## Kesimpulan

Untuk keperluan **tugas akhir / presentasi demo**, arsitektur data saat ini **cukup**:
- User bisa register, login, dan menggunakan fitur.
- Chatbot bisa memberikan rekomendasi obat.
- Data medicine lengkap dan terstruktur.

Untuk **production**, perlu migrasi ke database server-side. Lihat
[SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) untuk checklist lengkap.

---

## File Terkait

- [README.md](./README.md) — Dokumentasi utama
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) — Checklist keamanan
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment
- [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) — Training model guide
