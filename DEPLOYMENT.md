# 🚀 Deployment Guide - Apotek Sehat

Panduan lengkap untuk menjalankan dan men-deploy aplikasi Apotek Sehat dari nol.

---

## Prasyarat

| Kebutuhan | Versi Minimum | Keterangan |
|---|---|---|
| Node.js | 18+ | Untuk frontend React |
| npm | 9+ | Package manager |
| Python | 3.12 | Untuk backend Flask + ML |
| Git | 2.x | Version control |
| Docker Desktop (opsional) | 4.x | Untuk containerized deployment |

---

## Opsi 1: Setup Lokal (Tanpa Docker)

### Step 1: Clone / Salin Project

```bash
git clone <repo-url> APOTEK
cd APOTEK
```

Atau salin folder project ke lokasi yang diinginkan.

### Step 2: Install Frontend

```bash
cd frontend
npm install
cd ..
```

### Step 3: Setup Backend (Python venv)

```bash
cd backend

# Buat virtual environment
python -m venv .venv

# Aktifkan venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

cd ..
```

### Step 4: Siapkan Model AI

Pastikan file model sudah ada:
```
model_training/model/chatbot_model.pkl
```

Jika belum ada, lihat [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) untuk training model di CamberCloud.

### Step 5: Jalankan Backend

```bash
cd backend
python chatbot_api.py
```

Output yang diharapkan:
```
[*] Loading model and data...
[OK] Resources loaded successfully

============================================================
    CHATBOT API SERVER - APOTEK SEHAT
============================================================
  Environment : DEVELOPMENT
  Server      : http://localhost:5000
  Endpoint    : POST http://localhost:5000/api/chat
  Debug Mode  : True
============================================================
```

### Step 6: Jalankan Frontend (Terminal Baru)

```bash
cd frontend
npm run dev
```

Buka browser: **http://localhost:5173**

### Step 7: Verifikasi

1. Buka `http://localhost:5173` → Landing page
2. Buka `http://localhost:5000/api/health` → API health check
3. Login dengan kredensial demo (lihat README.md)
4. Coba chatbot: ketik "obat untuk demam"

---

## Opsi 2: Docker Compose

### Step 1: Pastikan Docker Desktop Berjalan

Buka Docker Desktop dan pastikan status "Engine running".

### Step 2: Build dan Jalankan

```bash
docker-compose up --build
```

### Step 3: Cek Status

```bash
# Lihat running containers
docker-compose ps

# Lihat logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Akses Aplikasi

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

### Step 5: Stop

```bash
docker-compose down
```

---

## Opsi 3: Mode Production (Tanpa Docker)

### Step 1: Build Frontend

```bash
cd frontend
npm run build
```

Hasil build ada di `frontend/dist/`.  
File ini bisa di-serve oleh web server (Nginx, Apache, Caddy).

### Step 2: Jalankan Backend dengan Waitress

```bash
cd backend

# Aktifkan venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Set environment untuk production
set FLASK_DEBUG=false       # Windows
# export FLASK_DEBUG=false  # Linux/Mac

set PORT=5000               # Windows
# export PORT=5000          # Linux/Mac

set CORS_ORIGINS=http://your-domain.com  # Windows
# export CORS_ORIGINS=http://your-domain.com  # Linux/Mac

# Jalankan dengan waitress (production WSGI)
waitress-serve --host=0.0.0.0 --port=5000 --call chatbot_api:app
```

### Step 3: Serve Frontend dengan Web Server

Contoh konfigurasi Nginx sederhana:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    root /path/to/APOTEK/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy ke backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Checklist Sebelum Presentasi / Deploy

- [ ] Model file ada di `model_training/model/chatbot_model.pkl`
- [ ] Backend bisa start tanpa error
- [ ] `/api/health` mengembalikan `model_loaded: true`
- [ ] Frontend bisa diakses di browser
- [ ] Login admin demo berfungsi
- [ ] Login user demo berfungsi
- [ ] Chatbot bisa memberi rekomendasi obat
- [ ] Test backend pass: `python -m pytest -q`
- [ ] Test frontend pass: `npm run test:run`
- [ ] `FLASK_DEBUG=false` untuk production
- [ ] CORS_ORIGINS sesuai domain
- [ ] Tidak ada secret/credential yang hardcode di kode

---

## Troubleshooting Deployment

### Backend crash: "Model file not found"
- Pastikan path model benar: `../model_training/model/chatbot_model.pkl`
- Jika jalankan dari root: gunakan absolute path atau sesuaikan relative path

### CORS error saat deploy
- Set `CORS_ORIGINS` ke domain frontend kamu
- Restart backend

### Frontend 404 saat refresh (SPA routing)
- Konfigurasi web server untuk fallback ke `index.html`
- Di Nginx: `try_files $uri $uri/ /index.html;`

### Chatbot lambat (>5 detik)
- Model mungkin terlalu besar atau resource server terbatas
- Pastikan menggunakan Waitress untuk production
- Gunakan server dengan minimal 1GB RAM

---

## File Terkait

- [README.md](./README.md) — Dokumentasi utama
- [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) — Panduan training model AI
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) — Checklist keamanan
- [DATA_PERSISTENCE.md](./DATA_PERSISTENCE.md) — Data persistence docs
