# 🚀 Quick Start Guide - Chatbot NLP Apotek

## ⚡ Setup Cepat (5 Langkah)

### Langkah 1: Install Python Dependencies
```powershell
cd C:\Users\yakob\OneDrive\Documents\APOTEK\chatbot-nlp\api
pip install -r requirements.txt
```

**Estimasi waktu**: 2-3 menit

**Yang diinstall**:
- scikit-learn (Machine Learning)
- pandas (Data processing)
- Sastrawi (Indonesian NLP)
- Flask + flask-cors (Web API)

---

### Langkah 2: Train Model NLP
```powershell
cd C:\Users\yakob\OneDrive\Documents\APOTEK\chatbot-nlp\model
python train_model.py
```

**Estimasi waktu**: 30-60 detik

**Output**:
- `chatbot_model.pkl` (trained model)
- `model_metadata.json`

**Yang ditampilkan**:
- Training accuracy
- Cross-validation score (target: ≥ 0.90)
- Classification report
- Sample predictions

---

### Langkah 3: Evaluasi Akurasi
```powershell
cd C:\Users\yakob\OneDrive\Documents\APOTEK\chatbot-nlp\evaluate
python evaluate_model.py
```

**Estimasi waktu**: 10-20 detik

**Output**: `evaluation_results.json`

**Cek apakah**:
- Accuracy ≥ 0.90? ✅
- Semua test cases pass? ✅

---

### Langkah 4: Run API Server
```powershell
cd C:\Users\yakob\OneDrive\Documents\APOTEK\chatbot-nlp\api
python chatbot_api.py
```

**Server akan berjalan di**: `http://localhost:5000`

**Biarkan terminal ini tetap terbuka!**

---

### Langkah 5: Integrasikan ke Website

Edit file `C:\Users\yakob\OneDrive\Documents\APOTEK\index.html`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Apotek Anda</title>
  
  <!-- Chatbot Widget CSS -->
  <link rel="stylesheet" href="chatbot-nlp/frontend/chatbot_widget.css">
</head>
<body>
  
  <!-- Konten website apotek Anda -->
  <h1>Selamat Datang di Apotek</h1>
  
  <!-- Chatbot Widget JS (di akhir body) -->
  <script src="chatbot-nlp/frontend/chatbot_widget.js"></script>
</body>
</html>
```

**Buka** `index.html` di browser, dan widget chatbot akan muncul di kanan bawah! 💬

---

## 🧪 Test Chatbot

Setelah widget muncul, coba tanya:

1. ✅ "halo"
2. ✅ "obat untuk sakit kepala"
3. ✅ "efek samping paracetamol"
4. ✅ "ada ibuprofen?"
5. ✅ "jam buka apotek"

---

## 🔧 Troubleshooting Cepat

### Error: "pip tidak dikenali"
**Solusi**: Install Python dari https://python.org (centang "Add to PATH")

### Error: "ModuleNotFoundError"
**Solusi**: 
```powershell
pip install scikit-learn pandas Sastrawi Flask flask-cors
```

### API tidak bisa diakses
**Solusi**: Pastikan `chatbot_api.py` masih running di terminal

### Widget tidak muncul
**Solusi**: 
1. Cek console browser (F12)
2. Pastikan path CSS/JS benar di HTML
3. Pastikan API server running

### Akurasi < 0.9
**Solusi**: Tambah patterns di `data/intents.json` lalu retrain

---

## 📂 File Penting

| File | Fungsi |
|------|--------|
| `data/medicines_primary.json` | 200 data obat |
| `data/intents.json` | Intent chatbot (edit ini untuk kustomisasi) |
| `model/chatbot_model.pkl` | Model terlatih |
| `api/chatbot_api.py` | Flask API server |
| `frontend/chatbot_widget.js` | Widget chatbot |

---

## ⚙️ Kustomisasi

### Edit Lokasi Apotek
File: `data/intents.json`
Cari: `"tag": "lokasi"`
Ganti response dengan alamat apotek Anda

### Edit Jam Operasional
File: `data/intents.json`
Cari: `"tag": "jam_operasional"`
Ganti response dengan jam buka apotek Anda

### Tambah Intent Baru
1. Edit `data/intents.json`
2. Tambah patterns & responses
3. Retrain: `python model/train_model.py`

---

## 🎯 Checklist Deployment

- [ ] Install dependencies
- [ ] Train model (akurasi ≥ 0.9)
- [ ] Evaluasi model (semua test pass)
- [ ] Run API server
- [ ] Integrasi widget ke website
- [ ] Edit lokasi & jam operasional
- [ ] Test semua intent
- [ ] Deploy ke production (optional)

---

**Selamat! Chatbot NLP Anda siap digunakan! 🎉**

Untuk dokumentasi lengkap, baca [README.md](README.md)
