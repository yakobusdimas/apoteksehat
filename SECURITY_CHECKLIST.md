# 🔒 Security Checklist - Apotek Sehat

Checklist keamanan untuk aplikasi Apotek Sehat.  
Gunakan sebagai panduan saat review code, presentasi, atau sebelum production deploy.

---

## Status Project: 🟡 Demo / Tugas Akhir

> [!IMPORTANT]
> Project ini dibuat untuk keperluan **tugas akhir / presentasi demo**.
> Beberapa item di bawah ini sengaja disederhanakan untuk demo.
> Untuk production, setiap item harus dipenuhi.

---

## ✅ Yang Sudah Diterapkan

### Input Validation
- [x] Backend: Validasi request body JSON di `/api/chat`
- [x] Backend: Validasi field `message` wajib dan berupa string
- [x] Backend: Trim whitespace dari pesan
- [x] Backend: Batas panjang pesan (max 500 karakter)
- [x] Frontend: Validasi email format
- [x] Frontend: Validasi password minimal 6 karakter
- [x] Frontend: Validasi konfirmasi password
- [x] Frontend: Trim input sebelum submit

### Error Handling
- [x] Backend: Response error konsisten (format JSON)
- [x] Backend: Tidak membocorkan stack trace di mode production
- [x] Backend: Resource check sebelum memproses request
- [x] Frontend: Try-catch pada API calls
- [x] Frontend: Timeout handler pada API calls

### CORS
- [x] Backend: CORS dikonfigurasi via environment variable
- [x] Backend: Origin spesifik, bukan wildcard `*`

### Configuration
- [x] Flask `debug=False` default (bukan True)
- [x] Semua konfigurasi bisa diatur via environment variables
- [x] Docker Compose mengirim env yang aman

### Session Management
- [x] Session expiry (30 hari untuk "remember me")
- [x] Corrupted session data ditangani (cleanup otomatis)
- [x] Password tidak disimpan dalam session object

---

## ⚠️ Batasan Demo (Perlu Perbaikan untuk Production)

### Authentication
- [ ] Auth masih client-side (localStorage)
- [ ] Password disimpan plain text di localStorage
- [ ] Tidak ada backend auth endpoint
- [ ] Tidak ada token-based auth (JWT/session)
- [ ] Admin password hardcoded (`admin`)

**Rekomendasi Production:**
- Implementasi backend auth dengan hashed password (bcrypt)
- Gunakan JWT atau server-side session
- Simpan password di database, bukan localStorage
- Rate limiting pada endpoint login

### Data Security
- [ ] Data user tersimpan di browser localStorage
- [ ] Tidak ada enkripsi data sensitif
- [ ] PII (email, phone, address) tersimpan tanpa enkripsi

**Rekomendasi Production:**
- Pindahkan semua data user ke database server-side
- Enkripsi PII di database
- Implementasi data retention policy

### Database
- [ ] Tidak ada database (data di JSON file + localStorage)
- [ ] Tidak ada audit trail
- [ ] Tidak ada backup mechanism

**Rekomendasi Production:**
- Gunakan SQLite untuk demo offline atau PostgreSQL untuk production
- Tambah tabel: users, medicines, orders, audit_logs
- Implementasi backup schedule

### API Security
- [ ] Tidak ada rate limiting
- [ ] Tidak ada API authentication
- [ ] Tidak ada request logging

**Rekomendasi Production:**
- Tambah rate limiting (flask-limiter)
- Tambah API key atau auth middleware
- Implementasi structured logging

### Frontend Security
- [ ] Belum ada CSP (Content Security Policy) headers
- [ ] Belum ada SRI (Subresource Integrity) untuk CDN
- [ ] Belum ada dependency audit otomatis

**Rekomendasi Production:**
- Tambah CSP headers di Nginx/web server
- Jalankan `npm audit` secara berkala
- Integrasi Dependabot atau Snyk

### Infrastructure
- [ ] Tidak ada HTTPS enforcement
- [ ] Tidak ada health monitoring
- [ ] Tidak ada auto-restart mechanism

**Rekomendasi Production:**
- Gunakan SSL/TLS certificate (Let's Encrypt)
- Tambah health check endpoint monitoring
- Gunakan process manager (systemd, PM2, Gunicorn)

---

## 📋 Quick Reference

### Environment Variables untuk Keamanan

| Variable | Default | Production Value |
|---|---|---|
| `FLASK_DEBUG` | `false` | `false` (WAJIB) |
| `CORS_ORIGINS` | `localhost:5173` | Domain production |
| `MIN_CONFIDENCE` | `0.9` | `0.9` (sesuaikan) |
| `MAX_MESSAGE_LENGTH` | `500` | `500` (sesuaikan) |

### Sebelum Presentasi

- [ ] `FLASK_DEBUG=false` (atau biarkan default)
- [ ] Tidak ada console.log di production build
- [ ] Demo credentials sudah diperjelas sebagai demo-only
- [ ] Tidak ada API key rahasia di source code

---

## File Terkait

- [README.md](./README.md) — Dokumentasi utama
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment
- [DATA_PERSISTENCE.md](./DATA_PERSISTENCE.md) — Data persistence docs
- [ML_TRAINING_GUIDE.md](./ML_TRAINING_GUIDE.md) — Training model guide
