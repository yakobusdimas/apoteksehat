# 🏥 Apotek Sehat - E-Commerce dengan AI Chatbot

Website e-commerce apotek dengan fitur **AI Chatbot berbasis NLP** untuk rekomendasi obat berdasarkan gejala pengguna. Dilengkapi **database server-side**, **JWT authentication**, dan **real-time admin dashboard**.

**Tugas Akhir - Y. Dimas Agung Nugroho (4.33.22.1.26)**  
Politeknik Negeri Semarang - 2026

---

## ✨ Fitur Unggulan

- **AI Chatbot**: Asisten virtual yang menganalisis gejala pengguna dan memberikan rekomendasi obat yang relevan.
- **Rekomendasi Cerdas (ML)**: Algoritma *Collaborative Filtering* untuk merekomendasikan obat pelengkap (misal: suplemen).
- **Deteksi Fraud (ML)**: *Anomaly Detection* dengan Isolation Forest mencegah penyalahgunaan atau pembelian dalam jumlah tidak wajar.
- **Prediksi Stok Obat (Forecasting)**: Membantu Admin memprediksi obat mana yang kemungkinan besar akan segera habis.
- **Mobile-First & PWA**: Desain antarmuka fleksibel dan dapat diinstal di smartphone (Progressive Web App).
- **Live Chat Apoteker**: Pengguna dapat beralih dari Chatbot AI ke percakapan langsung dengan apoteker di *Dashboard User*.
- **Admin Alert System**: Notifikasi otomatis apabila stok obat hampir habis.

---

## 🏗️ Arsitektur

```
Frontend (React + Vite) ──JWT──> Backend (Flask + Waitress)
                                     │
                              SQLAlchemy ORM
                                     │
                              SQLite Database
                         (User, Medicine, Order, AuditLog)
                                     │
Model Training (CamberCloud) ──.pkl──> NLP Inference (TF-IDF + SVM)
```

**Data flow:**
1. User register/login → JWT token disimpan di localStorage
2. Semua API request membawa JWT header → Backend validasi token
3. Order dibuat → Disimpan ke database → Admin bisa lihat real-time
4. Chatbot query → TF-IDF + SVM model → Rekomendasi obat

---

## 📦 Struktur Project

```
APOTEK/
├── frontend/                    # React App (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx          # Root component + ErrorBoundaries
│   │   │   ├── components/     # Page & UI components
│   │   │   ├── context/        # React Context (Auth, Cart)
│   │   │   ├── services/       # API service layer (auth, medicine, order, admin, chat)
│   │   │   ├── utils/          # Helper functions
│   │   │   └── types/          # TypeScript types
│   │   └── setupTests.ts       # Vitest setup
│   └── vite.config.ts          # Vite + Vitest config
│
├── backend/                     # Flask REST API
│   ├── app.py                  # Entry point (app factory)
│   ├── config.py               # Environment-based configuration
│   ├── models.py               # SQLAlchemy models (User, Medicine, Order, etc.)
│   ├── middleware.py             # JWT auth, rate limiting, logging, security headers
│   ├── seed.py                 # Database seeder
│   ├── conftest.py             # Pytest fixtures
│   ├── routes/
│   │   ├── auth.py             # POST /api/auth/register, /login, /profile
│   │   ├── medicines.py        # GET /api/medicines, /search, /categories
│   │   ├── orders.py           # POST/GET /api/orders, cancel
│   │   ├── admin.py            # Admin CRUD (users, orders, medicines, stats)
│   │   └── chat.py             # POST /api/chat (NLP chatbot)
│   ├── utils/
│   │   ├── validators.py       # Input validation (email, password, phone)
│   │   └── nlp.py              # Text preprocessing + model loader
│   ├── test_auth.py            # Auth endpoint tests
│   ├── test_orders.py          # Order endpoint tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── model_training/              # ML Training Data & Model
│   ├── model/chatbot_model.pkl # Trained model (~90% accuracy)
│   ├── data/
│   │   ├── intents.json         # 13 intent patterns
│   │   ├── medicines_primary.json # 200+ medicines
│   │   └── synonyms_id.json    # Indonesian synonyms
│   └── Medicine_Details.csv
│
├── docker-compose.yml
├── .env                         # Environment variables
├── DEPLOYMENT.md                # 📖 Deployment guide
├── ML_TRAINING_GUIDE.md         # 📖 ML training guide (CamberCloud)
├── SECURITY_CHECKLIST.md        # 📖 Security checklist
└── DATA_PERSISTENCE.md          # 📖 Data persistence docs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Docker Desktop (recommended for full setup)

### Step 1: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local values (no real secrets for local dev)
# Windows: notepad .env
# Linux/Mac: nano .env
```

### Step 2: Install Dependencies

```bash
# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate && pip install -r requirements.txt
# Linux/Mac: source .venv/bin/activate && pip install -r requirements.txt
cd ..
```

### Step 3: Docker Setup (Recommended)

```bash
# Build and start all services
# This will:
# - Pull PostgreSQL 16-alpine
# - Build backend, frontend, payment-server
# - Start all containers with healthchecks
# - Seed database automatically

docker compose build
docker compose up -d
```

**Access services:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Payment Server: `http://localhost:3001`
- Adminer (DB UI): `http://localhost:8080`
  - System: PostgreSQL
  - Server: `postgres`
  - Username: `apotek_user`
  - Password: `apotek_password_local`
  - Database: `apotek_db`

### Step 4: Manual Setup (Alternative)

```bash
# Backend
cd backend
python seed.py     # Create DB + seed data (first time only)
python app.py      # Start server

# Frontend
cd frontend
npm run dev
```

---

## 🤖 AI Chatbot

### Architecture
- **Training**: CamberCloud (Jupyter Notebook) → `chatbot_model.pkl`
- **Inference**: Flask backend → TF-IDF vectorizer + SVM classifier
- **13 intents**: salam, tanya_obat, efek_samping, dosis, komposisi, kegunaan, kontraindikasi, interaksi_obat, harga, ketersediaan, tanya_apotek, perpisahan, tidak_tahu

### How It Works
1. User types symptoms → Frontend sends to `/api/chat`
2. Backend preprocesses text (lowercase, stemming, normalization)
3. TF-IDF vectorizes → SVM predicts intent + confidence
4. If confidence > 0.9 → Response with medicine recommendations
5. If confidence < 0.9 → Fallback response

See [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) for training guide.

---

## 🔐 Authentication

### How It Works
1. User registers → Password hashed with bcrypt → Stored in SQLite
2. User logs in → Backend validates → Returns JWT token
3. Frontend stores JWT in localStorage → Sends with every API request
4. Backend validates JWT on each protected endpoint

### Demo Credentials
```
Admin:  admin@apoteksehat.com / admin123
User:   Register new account via /register
```

> ⚠️ These are demo-only credentials. See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md).

---

## 📝 API Reference

### Auth
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user baru |
| POST | `/api/auth/login` | ❌ | Login → JWT token |
| GET | `/api/auth/me` | ✅ JWT | Profil user saat ini |
| PUT | `/api/auth/profile` | ✅ JWT | Update profil |

### Medicines
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/medicines` | ✅ JWT | List obat (filter, pagination) |
| GET | `/api/medicines/search?q=` | ✅ JWT | Cari obat |
| GET | `/api/medicines/:id` | ✅ JWT | Detail obat |
| GET | `/api/medicines/categories` | ✅ JWT | List kategori |

### Orders
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/orders` | ✅ JWT | Buat pesanan |
| GET | `/api/orders` | ✅ JWT | List pesanan user |
| GET | `/api/orders/:id` | ✅ JWT | Detail pesanan |
| PUT | `/api/orders/:id/cancel` | ✅ JWT | Batalkan pesanan |

### Admin (admin only)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| POST/PUT/DELETE | `/api/admin/medicines` | CRUD medicines |

### Chatbot
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/chat` | ✅ JWT | Chat + rekomendasi obat |
| GET | `/api/health` | ❌ | Health check |

### Machine Learning & Analytics (Admin)
| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/medicines/recommendations` | ✅ JWT | Rekomendasi Collaborative Filtering |
| POST | `/api/orders` (Include Fraud Check) | ✅ JWT | Isolation Forest Fraud Detection |
| GET | `/api/admin/forecasting` | ✅ JWT (Admin)| Time-series stok obat |

---

## 🧪 Testing & CI/CD

### Local Testing
```bash
# Backend (run from backend/)
python -m pytest test_auth.py test_orders.py -v

# Frontend (run from frontend/)
npm run test:run
```

### GitHub Actions (CI/CD)
Proyek ini sudah dilengkapi dengan CI/CD otomatis melalui **GitHub Actions**.
Setiap kali ada push atau pull request ke branch `main`, pipeline akan:
1. Menjalankan backend tests (`pytest`)
2. Menjalankan frontend tests (`vitest`)
3. Memastikan semua Docker image bisa di-build tanpa error.

Workflow file: `.github/workflows/ci.yml`

---

## 🗄️ Database Backup

Terdapat script bawaan untuk melakukan backup database PostgreSQL.

**Untuk Windows (PowerShell):**
```powershell
.\scripts\backup_db.ps1
```

**Untuk Linux/Mac (Bash):**
```bash
./scripts/backup_db.sh
```

File backup akan disimpan di folder `backups/` dalam format `.sql` (contoh: `apotek_db_2026-07-07_12-00-00.sql`).
*Tip: Anda bisa menggunakan Task Scheduler (Windows) atau Cron (Linux) untuk menjalankan script ini setiap hari.*

---

## 🔧 Environment Variables

All sensitive configuration is now in `.env` (ignored by git). See `.env.example` for template.

### Key Variables

| Variable | Purpose | Example |
|---|---|---|
| `POSTGRES_DB` | PostgreSQL database name | `apotek_db` |
| `POSTGRES_USER` | PostgreSQL username | `apotek_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `change-this-local-password` |
| `DATABASE_URL` | Full database connection URL | `postgresql://apotek_user:change-this@postgres:5432/apotek_db` |
| `SECRET_KEY` | Flask secret key (32+ chars) | `local-dev-secret-key-2026` |
| `JWT_SECRET_KEY` | JWT signing secret (32+ chars) | `local-dev-jwt-secret-2026` |
| `ADMIN_EMAIL` | Default admin email | `admin@apoteksehat.com` |
| `ADMIN_PASSWORD` | Default admin password (12+ chars) | `ApotekLocalAdmin2026!` |
| `PAYMENT_WEBHOOK_SECRET` | Payment webhook secret | `change-this-payment-secret` |
| `MIDTRANS_*` | Midtrans sandbox credentials | (from Midtrans dashboard) |

### Security Notes
- **Never commit `.env` to git**
- **Production must override all secrets**
- **Admin password must be 12+ characters**
- **Flask/JWT secrets must be 32+ characters**

### Docker Healthchecks
All services now have healthchecks:
- `postgres`: `pg_isready`
- `backend`: `/api/health` endpoint
- `payment-server`: `/health` endpoint
- `frontend`: port `5173` availability

Use `docker compose ps` to check service status.

---

## 📚 Dokumentasi

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment
- [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) — Panduan training model AI
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) — Checklist keamanan
- [DATA_PERSISTENCE.md](./DATA_PERSISTENCE.md) — Arsitektur data

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Flask 3, SQLAlchemy, Flask-Limiter, Waitress |
| Auth | JWT (PyJWT), bcrypt |
| Database | SQLite (migrasi ke PostgreSQL siap) |
| ML | scikit-learn, TF-IDF + SVM, Sastrawi |
| Testing | Vitest, Testing Library, pytest, Playwright |