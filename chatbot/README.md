# 🤖 Chatbot NLP Apotek

Sistem chatbot berbasis Natural Language Processing (NLP) untuk apotek dengan Bahasa Indonesia. Menggunakan TF-IDF + SVM dengan target akurasi minimum **0.9**.

## 📁 Struktur Folder

```
chatbot-nlp/
├── data/
│   ├── filter_medicines.py          # Script filter 200 obat dari CSV
│   ├── medicines_primary.json       # 200 obat terfilter (output)
│   ├── intents.json                 # Intent chatbot Bahasa Indonesia
│   └── synonyms_id.json             # Sinonim & mapping Bahasa Indonesia
├── model/
│   ├── train_model.py               # Script training NLP model
│   ├── chatbot_model.pkl            # Model terlatih (output)
│   └── model_metadata.json          # Metadata model (output)
├── api/
│   ├── chatbot_api.py               # Flask REST API
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── chatbot_widget.js            # Widget chatbot untuk web
│   └── chatbot_widget.css           # Styling widget
├── evaluate/
│   ├── evaluate_model.py            # Script evaluasi akurasi
│   ├── test_cases.json              # Test cases
│   └── evaluation_results.json      # Hasil evaluasi (output)
└── README.md                        # Dokumentasi ini
```

## 🚀 Cara Install & Setup

### 1. Install Python Dependencies

```bash
cd api
pip install -r requirements.txt
```

**Dependencies:**
- scikit-learn (ML library)
- pandas (Data processing)
- Sastrawi (Indonesian stemming)
- Flask (REST API)
- flask-cors (CORS support)

### 2. Generate Data Obat

Filter 200 obat paling relevan dari CSV:

```bash
cd data
python filter_medicines.py
```

Output: `medicines_primary.json` (200 obat)

### 3. Train Model NLP

Latih model dengan target akurasi ≥ 0.9:

```bash
cd model
python train_model.py
```

Output:
- `chatbot_model.pkl` (trained model)
- `model_metadata.json` (metadata)

Script akan menampilkan:
- Training accuracy
- Cross-validation accuracy
- Classification report
- Sample predictions

### 4. Evaluasi Model

Test akurasi model dengan 20 test cases:

```bash
cd evaluate
python evaluate_model.py
```

Output: `evaluation_results.json`

### 5. Run API Server

Jalankan Flask API di localhost:5000:

```bash
cd api
python chatbot_api.py
```

Server akan berjalan di: `http://localhost:5000`

**Endpoints:**
- `POST /api/chat` - Chat dengan bot
- `GET /api/health` - Health check
- `GET /api/medicines` - List semua obat

**Contoh Request:**

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "obat untuk sakit kepala"}'
```

**Response:**

```json
{
  "status": "success",
  "response": "Untuk sakit kepala, kami merekomendasikan: Paracetamol...",
  "intent": "tanya_obat",
  "confidence": 0.95,
  "data": [...]
}
```

## 🌐 Integrasi ke Website Apotek

### Tambahkan ke HTML

Edit file `index.html` di folder APOTEK utama:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Apotek</title>
  
  <!-- Chatbot Widget CSS -->
  <link rel="stylesheet" href="chatbot-nlp/frontend/chatbot_widget.css">
</head>
<body>
  
  <!-- Konten website apotek Anda -->
  
  <!-- Chatbot Widget JS -->
  <script src="chatbot-nlp/frontend/chatbot_widget.js"></script>
</body>
</html>
```

Widget akan otomatis muncul sebagai floating button di kanan bawah.

### Konfigurasi API URL

Jika API berjalan di server lain, edit `chatbot_widget.js`:

```javascript
// Default: localhost
window.apotekChatbot = new ApotekChatbot('http://localhost:5000');

// Production: ganti dengan URL server Anda
window.apotekChatbot = new ApotekChatbot('https://api.apotek-anda.com');
```

## 🎯 Fitur Chatbot

### Intent yang Didukung

| Intent | Contoh Query |
|--------|--------------|
| **salam** | "halo", "selamat pagi" |
| **perpisahan** | "terima kasih", "bye" |
| **tanya_obat** | "obat untuk sakit kepala", "saya demam" |
| **efek_samping** | "efek samping paracetamol" |
| **dosis** | "berapa dosis ibuprofen" |
| **ketersediaan** | "ada amoxicillin?" |
| **komposisi** | "komposisi augmentin" |
| **kegunaan** | "kegunaan vitamin c" |
| **harga** | "harga paracetamol" |
| **jam_operasional** | "jam buka apotek" |
| **lokasi** | "lokasi apotek" |
| **darurat** | "darurat", "sesak napas" |

### Kategori Obat

- 🔥 **Nyeri & Demam** (149 obat)
- 🧴 **Kulit** (124 obat)
- 🫄 **Lambung & Pencernaan** (36 obat)
- ❤️ **Hipertensi** (33 obat)
- 🤧 **Batuk & Flu** (4 obat)
- 💊 **Vitamin & Suplemen** (3 obat)
- 🩺 **Diabetes** (1 obat)
- 📦 **Lainnya** (1 obat)

## 📊 Teknologi NLP

### Pipeline

```
Input Query (Indonesian)
    ↓
Preprocessing (lowercase, remove special chars, stemming)
    ↓
TF-IDF Vectorization (unigram + bigram)
    ↓
SVM Classifier (linear kernel)
    ↓
Intent Prediction + Confidence Score
    ↓
Response Generation
```

### Features
- **TF-IDF**: Term Frequency-Inverse Document Frequency
- **N-grams**: Unigram + Bigram (1-2 words)
- **Stemming**: Sastrawi (Bahasa Indonesia)
- **Classifier**: SVM dengan linear kernel
- **Confidence Threshold**: 0.9

### Akurasi

Target: **≥ 0.90** (90%)

Model dilatih dengan:
- Cross-validation (k=5)
- Train-test split (80%-20%)
- Classification report
- Confusion matrix

## 🔧 Troubleshooting

### Error: "No module named 'sklearn'"

```bash
pip install scikit-learn
```

### Error: "No module named 'Sastrawi'"

```bash
pip install Sastrawi
```

### API tidak bisa diakses dari browser

Pastikan Flask CORS enabled (sudah diatur di `chatbot_api.py`):

```python
from flask_cors import CORS
CORS(app)
```

### Model akurasi < 0.9

1. Tambah lebih banyak training patterns di `intents.json`
2. Expand synonyms di `synonyms_id.json`
3. Tune hyperparameters SVM di `train_model.py`:
   - Coba kernel berbeda: 'rbf', 'poly'
   - Adjust parameter C
   - Increase max_features di TF-IDF

### Widget tidak muncul

1. Pastikan path CSS & JS benar di HTML
2. Buka browser console (F12) untuk cek error
3. Pastikan API server berjalan

## 📝 Kustomisasi

### Tambah Intent Baru

Edit `data/intents.json`:

```json
{
  "tag": "resep_dokter",
  "patterns": [
    "butuh resep dokter",
    "apakah perlu resep",
    "obat resep"
  ],
  "responses": [
    "Obat ini memerlukan resep dokter. Silakan konsultasi terlebih dahulu."
  ]
}
```

Lalu retrain model:

```bash
cd model
python train_model.py
```

### Tambah Sinonim

Edit `data/synonyms_id.json`:

```json
"penyakit_synonyms": {
  "asma": ["asthma", "sesak", "napas pendek"]
}
```

### Edit Lokasi & Jam Operasional

Edit `data/intents.json`, cari intent `lokasi` dan `jam_operasional`, ganti response sesuai info apotek Anda.

## 📦 Deployment Production

### 1. Gunakan Production WSGI Server

Jangan gunakan Flask development server untuk production. Gunakan Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 chatbot_api:app
```

### 2. Setup HTTPS

Gunakan reverse proxy (Nginx) dengan SSL certificate.

### 3. Environment Variables

Set API URL sebagai environment variable:

```javascript
const API_URL = process.env.CHATBOT_API_URL || 'http://localhost:5000';
```

## 📄 License

MIT License - Bebas digunakan untuk keperluan komersial dan non-komersial.

## 🙋 Support

Jika ada pertanyaan atau issue, silakan hubungi apoteker atau developer.

---

**Dibuat dengan ❤️ untuk Apotek Indonesia**
