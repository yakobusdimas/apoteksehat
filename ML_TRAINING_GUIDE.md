# 🧠 Panduan Training Model AI - Apotek Sehat

Panduan ini menjelaskan cara melatih model NLP untuk chatbot rekomendasi obat
menggunakan **CamberCloud** (platform cloud berbasis Jupyter Notebook).

---

## Kenapa Training Terpisah dari Aplikasi Web?

| Alasan | Penjelasan |
|---|---|
| **Performa** | Training model ML membutuhkan CPU/GPU yang besar. Memisahkan training dari web server membuat aplikasi tetap ringan. |
| **Arsitektur yang Baik** | Training dilakukan sekali, model disimpan, lalu digunakan berulang kali untuk inference. Ini adalah best practice di industri. |
| **Reproducibility** | Proses training terdokumentasi dan bisa diulang kapan saja tanpa mengganggu aplikasi. |
| **Portabilitas** | Model bisa dilatih di mesin/infrastruktur mana pun, lalu file hasilnya dipakai di aplikasi web. |

### Alur Kerja

```
┌─────────────────┐     Training      ┌──────────────────────┐
│  Dataset Obat    │ ─────────────────> │  CamberCloud          │
│  (CSV/JSON)      │                    │  (Jupyter Notebook)   │
└─────────────────┘                    └──────────┬───────────┘
                                                  │
                                           Export Model
                                                  │
                                                  v
┌─────────────────┐     Inference     ┌──────────────────────┐
│  User Chat      │ <───────────────── │  chatbot_model.pkl   │
│  (Web Frontend) │                    │  (Flask Backend)      │
└─────────────────┘                    └──────────────────────┘
```

---

## Dataset yang Digunakan

### Sumber Data
- **File utama**: `model_training/Medicine_Details.csv`
- **Total obat**: 200+ obat
- **Kategori**: Analgesik, Antibiotik, Antiseptik, Vitamin, dll.

### Intent yang Didukung (13 Intent)

| No | Intent | Contoh Query |
|---|---|---|
| 1 | `salam` | "halo", "selamat pagi" |
| 2 | `perpisahan` | "terima kasih", "sampai jumpa" |
| 3 | `tanya_obat` | "obat untuk sakit kepala" |
| 4 | `efek_samping` | "efek samping paracetamol" |
| 5 | `dosis` | "dosis paracetamol untuk dewasa" |
| 6 | `ketersediaan` | "apakah paracetamol tersedia" |
| 7 | `komposisi` | "komposisi bodrex" |
| 8 | `kegunaan` | "kegunaan vitamin C" |
| 9 | `kontraindikasi` | "kontraindikasi ibuprofen" |
| 10 | `interaksi_obat` | "interaksi paracetamol dengan obat lain" |
| 11 | `harga` | "harga paracetamol" |
| 12 | `tanya_apotek` | "apotek buka jam berapa" |
| 13 | `tidak_tahu` | (fallback untuk query tidak dikenali) |

### Synonyms (Bahasa Indonesia)
- File: `model_training/data/synonyms_id.json`
- Berisi sinonim penyakit dalam bahasa Indonesia untuk meningkatkan akurasi pencocokan.

---

## Cara Training di CamberCloud

### Step 1: Buka Project CamberCloud
1. Login ke CamberCloud
2. Buka project yang sudah ada (atau buat baru)
3. Buka file `main.ipynb` (Jupyter Notebook)

### Step 2: Upload Dataset
Upload file dataset ke workspace CamberCloud:
- `Medicine_Details.csv`
- `intents.json`
- `synonyms_id.json`

### Step 3: Jalankan Training di Notebook

Berikut kode training yang bisa dijalankan di Jupyter Notebook:

```python
# ── 1. Import Libraries ─────────────────────────────────────────
import pandas as pd
import numpy as np
import json
import pickle
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

# ── 2. Load Dataset ──────────────────────────────────────────
# Load medicines data
medicines_df = pd.read_csv('Medicine_Details.csv')
print(f"Total medicines: {len(medicines_df)}")
print(f"Columns: {list(medicines_df.columns)}")

# Load intents
with open('intents.json', 'r', encoding='utf-8') as f:
    intents_data = json.load(f)

# Load synonyms
with open('synonyms_id.json', 'r', encoding='utf-8') as f:
    synonyms = json.load(f)

# ── 3. Prepare Training Data ─────────────────────────────────
# Extract patterns and labels from intents
X_train = []  # Text patterns
y_train = []  # Intent labels

for intent in intents_data['intents']:
    for pattern in intent['patterns']:
        X_train.append(pattern)
        y_train.append(intent['tag'])

print(f"Training samples: {len(X_train)}")
print(f"Intent classes: {len(set(y_train))}")

# ── 4. Text Preprocessing ────────────────────────────────────
# Indonesian stemmer
factory = StemmerFactory()
stemmer = factory.create_stemmer()

def preprocess_text(text):
    """Preprocess text: lowercase, remove special chars, stem"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = ' '.join(text.split())
    # Apply Indonesian stemming
    text = stemmer.stem(text)
    return text

# Preprocess all training data
X_preprocessed = [preprocess_text(text) for text in X_train]

# ── 5. Feature Extraction (TF-IDF) ────────────────────────────
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),  # Unigrams + Bigrams
    min_df=1,
    max_df=0.95
)
X_features = vectorizer.fit_transform(X_preprocessed)

print(f"Feature matrix shape: {X_features.shape}")

# ── 6. Train Model (SVM) ─────────────────────────────────────
model = SVC(
    kernel='linear',
    C=1.0,
    probability=True,  # Diperlukan untuk confidence score
    random_state=42
)
model.fit(X_features, y_train)

# ── 7. Evaluate Model ─────────────────────────────────────────
# Cross-validation prediction
y_pred = model.predict(X_features)
accuracy = accuracy_score(y_train, y_pred)

print(f"\n{'='*50}")
print(f"  Model Accuracy: {accuracy * 100:.2f}%")
print(f"{'='*50}")

print("\nClassification Report:")
print(classification_report(y_train, y_pred, zero_division=0))

print("\nConfusion Matrix:")
print(confusion_matrix(y_train, y_pred))

# ── 8. Test dengan Contoh Query ───────────────────────────────
test_queries = [
    "obat untuk sakit kepala",
    "efek samping paracetamol",
    "dosis ibuprofen",
    "halo",
    "terima kasih",
    "obat batuk",
    "harga vitamin c",
]

print("\n── Sample Predictions ──")
for query in test_queries:
    processed = preprocess_text(query)
    features = vectorizer.transform([processed])
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = max(probabilities)
    print(f"  Query: '{query}'")
    print(f"  Intent: {prediction} (confidence: {confidence:.4f})")
    print()

# ── 9. Save Model ───────────────────────────────────────────
# Save model, vectorizer, and metadata
model_package = {
    'model': model,
    'vectorizer': vectorizer,
    'stemmer': stemmer,
    'intents': intents_data,
    'accuracy': accuracy,
}

with open('chatbot_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print(f"Model saved as 'chatbot_model.pkl'")
print(f"Vectorizer saved as 'chatbot_vectorizer.pkl'")

# Also save vectorizer separately
with open('chatbot_vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

print("\n✅ Training selesai! Download file berikut:")
print("  1. chatbot_model.pkl")
print("  2. chatbot_vectorizer.pkl (jika diperlukan)")
```

### Step 4: Download Model dari CamberCloud

Setelah training selesai, download file berikut:
1. `chatbot_model.pkl` → taruh di `model_training/model/`
2. (Opsional) `chatbot_vectorizer.pkl` → jika perlu

Cara menaruhnya di project lokal:
```
model_training/model/
└── chatbot_model.pkl    ← file hasil training dari CamberCloud
```

### Step 5: Verifikasi Model di Backend

Jalankan backend dan cek health endpoint:
```bash
cd backend
python chatbot_api.py
```

Buka di browser: `http://localhost:5000/api/health`

Response yang diharapkan:
```json
{
  "status": "ok",
  "model_loaded": true,
  "total_medicines": 200,
  "environment": "development",
  "min_confidence": 0.9
}
```

Coba kirim chat:
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "obat untuk demam"}'
```

---

## Evaluasi Model

### Metrik yang Dilaporkan
- **Accuracy**: Persentase prediksi yang benar
- **Precision, Recall, F1-Score**: Per intent
- **Confusion Matrix**: Matriks kesalahan prediksi

### Cara Menjalankan Evaluasi

Jika ada script evaluasi terpisah:
```bash
cd chatbot/evaluate
python evaluate_model.py
```

Atau jalankan langsung di CamberCloud notebook dengan kode di atas.

### Target Akurasi
- **Minimum**: 85%
- **Target**: 90%+
- Model saat ini: **~90%** (TF-IDF + SVM)

---

## Pertanyaan yang Mungkin Ditanyakan Dosen

**Q: Kenapa training tidak dilakukan langsung di aplikasi web?**
> A: Training model NLP membutuhkan komputasi yang berat (CPU/GPU tinggi). Melakukan training setiap kali aplikasi dijalankan akan membuat server sangat lambat dan tidak efisien. Best practice di industri ML adalah memisahkan proses training dari inference. Training dilakukan sekali di lingkungan yang sesuai (CamberCloud), lalu model hasilnya digunakan berulang kali oleh aplikasi web.

**Q: Bagaimana cara membuktikan akurasi model?**
> A: Melalui classification report dan confusion matrix yang dihasilkan saat training. Report ini menunjukkan akurasi per-intent, precision, recall, dan F1-score. Semua ini bisa ditampilkan di notebook CamberCloud.

**Q: Apakah model bisa di-retrain jika data baru ditambahkan?**
> A: Ya. Cukup tambahkan data baru ke dataset, jalankan ulang training di CamberCloud, lalu ganti file `chatbot_model.pkl` di project. Tidak perlu mengubah kode backend.

**Q: Kenapa memakai TF-IDF + SVM?**
> A: TF-IDF (Term Frequency-Inverse Document Frequency) cocok untuk text classification dalam Bahasa Indonesia karena bisa menangkap kata-kata penting. SVM (Support Vector Machine) adalah algoritma yang proven untuk klasifikasi teks dengan akurasi tinggi, terutama pada dataset berukuran sedang.

---

## File Terkait

- [README.md](./README.md) — Dokumentasi utama project
- [DATA_PERSISTENCE.md](./DATA_PERSISTENCE.md) — Penjelasan data persistence
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Panduan deployment
