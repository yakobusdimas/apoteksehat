#!/usr/bin/env python3
"""
Augment intents data + benchmark 5 models to find best performer above 90%.
"""

import json
import re
import os
import sys
import time
import warnings
import random
warnings.filterwarnings('ignore')

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold, train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report

random.seed(42)
np.random.seed(42)

# Sastrawi
try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    stemmer = StemmerFactory().create_stemmer()
    SASTRAWI_OK = True
except ImportError:
    stemmer = None
    SASTRAWI_OK = False


def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    if SASTRAWI_OK:
        return stemmer.stem(' '.join(text.split()))
    return ' '.join(text.split())


# ── Data Augmentation ──────────────────────────────────────────────────────────
# Template-based augmentation for each class
AUGMENT_TEMPLATES = {
    "salam": [
        "halo selamat {waktu}", "selamat {waktu} dok", "siang dok",
        "hai juga", "hey", "halo jumpa lagi", "halo lagi",
        "selamat {waktu} apotek sehat", "halo admin", "pagi admin",
        "siang admin", "sore admin", "halo min", "pagi min", "siang min",
        "assalamualaikum dok", "halo dok", "permisi min",
        "mau tanya dok", "selamat datang", "hy juga",
        "halo hai", "hai halo", "selamat {waktu} semuanya",
    ],
    "perpisahan": [
        "makasih ya infonya", "oke makasih banyak", "goodbye",
        "dadah semoga sehat", "bye bye", "sampai jumpa lagi",
        "terima kasih atas bantuannya", "makasih dok", "terima kasih dok",
        "sudah dulu ya", "cukup terima kasih", "sudah cukup makasih",
        "ok sip makasih", "baik terima kasih bantuannya",
        "makasih infonya dok", "terima kasih infonya min",
        "selesai terima kasih", "udah makasih", "cukup ya makasih",
        "thanks bantuannya", "thank you dok", "noted makasih",
        "baik cukup sudah", "udah cukup terima kasih",
    ],
    "tanya_obat": [
        "saya butuh obat {keluhan}", "cari obat buat {keluhan}",
        "obat untuk {keluhan}", "rekomendasi untuk {keluhan}",
        "ada obat {keluhan} tidak", "obat apa yang cocok untuk {keluhan}",
        "mau beli obat {keluhan}", "saran obat {keluhan}",
        "obat paling bagus untuk {keluhan}", "kasih tahu obat untuk {keluhan}",
        "tolong rekomendasikan obat {keluhan}", "apa obat buat {keluhan}",
        "obat untuk mengobati {keluhan}", "butuh saran obat {keluhan}",
        "saya cari obat {keluhan}", "obat sakit {keluhan}",
        "obat buat anak {keluhan}", "obat untuk ibu hamil {keluhan}",
        "obat untuk dewasa {keluhan}", "perlu obat {keluhan}",
        "minta rekomendasi obat {keluhan}", "cari obat untuk {keluhan}",
        "rekomendasi obat buat {keluhan}", "tanya soal obat {keluhan}",
        "info obat {keluhan}", "butuh info obat {keluhan}",
    ],
    "efek_samping": [
        "apa efek samping dari {obat}", "efek samping minum {obat}",
        "{obat} efek sampingnya apa", "apakah {obat} aman",
        "bahaya minum {obat}", "efek negatif {obat}",
        "setelah minum {obat} jadi pusing", "efek samping obat {obat}",
        "apakah {obat} punya efek samping", "apa bahaya {obat}",
        "akibat minum {obat}", "resiko minum {obat}",
        "efek samping {obat} jangka panjang", "efek samping serius {obat}",
        "kontraindikasi {obat}", "apa efek buruk {obat}",
        "efek minum {obat} berlebihan", "overdosis {obat} gejalanya apa",
        "reaksi alergi {obat}", "efek {obat} pada lambung",
        "efek samping antibiotik", "apakah aman minum {obat} jangka panjang",
        "efek samping umum {obat}", "peringatan {obat}",
    ],
    "dosis": [
        "aturan pakai {obat}", "dosis {obat} untuk dewasa",
        "berapa dosis {obat}", "minum {obat} berapa kali sehari",
        "dosis {obat} untuk anak", "aturan minum {obat}",
        "berapa tablet {obat} sehari", "dosis tepat {obat}",
        "{obat} diminum berapa kali", "takaran {obat}",
        "dosis maksimal {obat}", "dosis {obat} untuk bayi",
        "dosis {obat} untuk lansia", "berapa ml {obat} untuk anak",
        "berapa sendok {obat}", "sehari minum {obat} berapa kali",
        "apa dosis {obat} yang benar", "panduan dosis {obat}",
        "takaran minum {obat}", "dosis awal {obat}",
        "dosis harian {obat}", "berapa banyak {obat} boleh diminum",
        "sebelum atau sesudah makan minum {obat}",
    ],
    "ketersediaan": [
        "apakah {obat} tersedia", "ada stok {obat}",
        "stok {obat} masih ada", "{obat} ready",
        "apakah {obat} masih ada", "ketersediaan {obat}",
        "cek stok {obat}", "apa {obat} tersedia di apotek",
        "ada tidak {obat}", "{obat} kosong atau ada",
        "stok terbaru {obat}", "apakah {obat} habis",
        "informasi stok {obat}", "cek ketersediaan {obat}",
        "apakah ada {obat}", "stok {obat} di apotek",
        "{obat} ready stock", "posisi stok {obat}",
        "barang {obat} ready", "apa ready {obat}",
        "masih ada {obat} tidak", "apakah {obat} tersedia di cabang",
        "ketersediaan stok {obat}",
    ],
    "komposisi": [
        "kandungan {obat}", "komposisi {obat} apa saja",
        "bahan aktif {obat}", "apa isi {obat}",
        "{obat} mengandung apa", "zat aktif {obat}",
        "kandungan utama {obat}", "bahan dalam {obat}",
        "komposisi lengkap {obat}", "apa saja isi {obat}",
        "bahan kimia {obat}", "senyawa aktif {obat}",
        "tiap tablet {obat} mengandung", "komposisi per tablet {obat}",
        "zat berkhasiat {obat}", "bahan alami {obat} apa",
        "kandungan nutrisi {obat}", "komposisi obat {obat}",
        "detail kandungan {obat}",
    ],
    "kegunaan": [
        "guna {obat}", "manfaat {obat}", "khasiat {obat}",
        "{obat} untuk penyakit apa", "fungsi {obat}",
        "indikasi {obat}", "kegunaan utama {obat}",
        "apa manfaat minum {obat}", "{obat} bagus untuk apa",
        "penyakit apa yang diobati {obat}", "kegunaan obat {obat}",
        "manfaat klinis {obat}", "indikasi medis {obat}",
        "untuk apa {obat} diminum", "tujuan penggunaan {obat}",
    ],
    "harga": [
        "harga {obat}", "berapa harga {obat}", "{obat} harganya berapa",
        "{obat} berapa", "biaya {obat}", "harga terbaru {obat}",
        "harga {obat} di apotek", "berapa biaya {obat}",
        "{obat} dijual berapa", "harga satuan {obat}",
        "harga {obat} per strip", "harga {obat} per box",
        "cek harga {obat}", "info harga {obat}",
        "apa harga {obat}", "harga retail {obat}",
        "harga murah {obat}", "ada diskon {obat}",
        "{obat} promo berapa",
    ],
    "tidak_tahu": [
        "saya tidak tahu mau tanya apa", "bingung mau tanya apa",
        "nggak tau mau nanya apa", "tidak tau harus bilang apa",
        "saya masih bingung", "malu nanya", "agak malu nanya",
        "saya kurang paham", "belum ngerti cara tanya",
        "apa ya saya lupa", "lupa mau tanya apa",
        "lupa mau nanya apa", "saya baru pertama kali tanya",
        "pertama kali pakai chatbot", "belum pernah konsultasi",
        "tidak tau harus mulai dari mana", "bingung harus nanya apa",
        "nggak tau harus tanya apa", "sebentar saya pikir dulu",
        "saya belum siap nanya", "tunggu saya ingat dulu",
        "saya cuma lihat lihat", "hanya ingin lihat dulu",
        "saya masih ragu", "mager nanya", "malas nanya",
    ],
    "darurat": [
        "saya butuh pertolongan", "tolong saya", "darurat",
        "butuh bantuan segera", "saya kecelakaan", "posisi darurat",
        "keracunan", "orang pingsan", "saya pingsan",
        "luka parah", "patah tulang", "luka bakar",
        "sesak napas parah", "tidak bisa bernapas",
        "nyeri dada", "serangan jantung", "stroke",
        "kejang kejang", "demam tinggi kejang",
        "muntah darah", "buang air besar darah",
        "alergi parah bengkak", "syok anafilaktik",
        "telat minum obat darurat", "overdosis obat darurat",
        "keracunan makanan", "luka tusuk", "luka tembak",
        "pendarahan hebat", "patah kaki",
        "kecelakaan lalu lintas", "orang jatuh",
        "bayi kejang", "anak kejang demam",
        "tidak sadarkan diri", "sesak napas akut",
        "keracunan obat", "minum racun",
        "alergi obat parah", "bengkak setelah minum obat",
        "gatal seluruh badan", "biduran parah",
        "demam sangat tinggi 40", "demam berhari hari",
        "luka infeksi parah", "bengkak bernanah",
        "sakit perut hebat", "perut keras",
    ],
    "jam_operasional": [
        "jam buka apotek", "apotek buka jam berapa",
        "sampai jam berapa buka", "apotek buka hari minggu",
        "hari libur buka", "jam tutup", "jam kerja apotek",
        "kapan apotek buka", "operasional apotek",
        "jadwal buka apotek", "jam berapa buka hari ini",
        "apakah buka sekarang", "buka 24 jam",
        "apotek 24 jam", "jam buka hari sabtu",
        "hari minggu buka tidak", "hari raya buka",
        "jam malam buka", "buka sampai jam berapa",
        "buka jam berapa tutup jam berapa",
        "jadwal lengkap jam buka", "info jam operasional",
        "jam buka cabang", "setiap hari buka",
        "hari senin buka jam berapa", "weekend buka",
        "hari libur nasional buka", "tanggal merah buka",
        "apakah hari ini buka", "buka tidak hari ini",
        "malem hari buka", "malam hari ada",
        "jam besuk apotek", "kapan bisa datang",
    ],
    "lokasi": [
        "alamat apotek", "dimana lokasi apotek",
        "apotek terdekat", "cabang terdekat",
        "letak apotek", "posisi apotek",
        "gmap apotek", "maps apotek",
        "bagaimana menuju apotek", "rute ke apotek",
        "lokasi apotek dimana", "apotek cabang",
        "alamat lengkap", "dimana alamatnya",
        "apakah ada di {kota}", "cabang di {kota}",
        "lokasi terdekat dari sini", "apotek dekat sini",
        "di daerah mana", "lokasi pusat",
        "cabang utama dimana", "alamat kantor pusat",
        "arah ke apotek", "petunjuk arah",
        "google maps apotek", "waze apotek",
        "navigasi ke apotek", "dekat stasiun",
        "dekat mall", "dekat rumah sakit",
        "apotek terdekat dari lokasi saya",
        "apakah ada di daerah sini",
        "alamat cabang terdekat lokasi",
    ],
}

# Fill-in words for augmentation
KELUHAN = ["demam", "batuk", "pilek", "flu", "sakit kepala", "pusing", "mual", "migrain",
           "diare", "maag", "sakit perut", "alergi", "gatal", "infeksi", "nyeri sendi",
           "nyeri otot", "hipertensi", "darah tinggi", "diabetes", "gula darah",
           "kolesterol", "luka", "sariawan", "radang tenggorokan", "sesak napas"]
OBAT_NAMES = ["paracetamol", "amoxicillin", "ibuprofen", "aspirin", "omeprazole",
              "metformin", "amlodipine", "simvastatin", "cetirizine", "ranitidine",
              "prednisone", "diclofenac", "vitamin c", "sangobion", "promag",
              "mylanta", "antangin", "diapet", "obh combi", "mixagrip",
              "neuralgin", "sanmol", "panadol", "bodrex", "decolgen"]
KOTA = ["jakarta", "bandung", "surabaya", "yogyakarta", "semarang", "medan",
        "makassar", "palembang", "malang", "bekasi", "depok", "tangerang",
        "bogor", "solo", "balikpapan"]
WAKTU = ["pagi", "siang", "sore", "malam"]

# ── Load + Augment ─────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
intents_path = os.path.join(BASE, 'data', 'intents.json')

with open(intents_path, 'r', encoding='utf-8') as f:
    intents_data = json.load(f)

augmented_intents = []
for intent in intents_data['intents']:
    tag = intent['tag']
    patterns = list(intent['patterns'])  # copy original
    
    # Add augmented patterns
    if tag in AUGMENT_TEMPLATES:
        templates = AUGMENT_TEMPLATES[tag]
        for tmpl in templates:
            # Fill in placeholders
            sample = tmpl
            if "{keluhan}" in sample:
                for _ in range(5):
                    sample = tmpl.replace("{keluhan}", random.choice(KELUHAN))
                    patterns.append(sample)
            elif "{obat}" in sample:
                for _ in range(5):
                    sample = tmpl.replace("{obat}", random.choice(OBAT_NAMES))
                    patterns.append(sample)
            elif "{kota}" in sample:
                for _ in range(3):
                    sample = tmpl.replace("{kota}", random.choice(KOTA))
                    patterns.append(sample)
            elif "{waktu}" in sample:
                for _ in range(3):
                    sample = tmpl.replace("{waktu}", random.choice(WAKTU))
                    patterns.append(sample)
            else:
                patterns.append(tmpl)
    
    # Deduplicate
    seen = set()
    unique_patterns = []
    for p in patterns:
        pp = p.lower().strip()
        if pp not in seen:
            seen.add(pp)
            unique_patterns.append(p)
    
    augmented_intents.append({
        "tag": tag,
        "patterns": unique_patterns,
        "responses": intent["responses"]
    })

# ── Prepare data ───────────────────────────────────────────────────────────────
X_raw, y_raw = [], []
for intent in augmented_intents:
    for pattern in intent['patterns']:
        X_raw.append(preprocess_text(pattern))
        y_raw.append(intent['tag'])

print("=" * 70)
print(f"  DATA AFTER AUGMENTATION")
print("=" * 70)
print(f"  Total samples: {len(X_raw)}")
print(f"  Classes: {len(set(y_raw))}")
for intent in augmented_intents:
    print(f"    {intent['tag']:<20} {len(intent['patterns']):>4} patterns")
print()

# ── Split ─────────────────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_raw, y_raw, test_size=0.2, random_state=42, stratify=y_raw
)

# ── TF-IDF ───────────────────────────────────────────────────────────────────
vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 3), min_df=1, max_df=0.95, sublinear_tf=True)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
X_full_vec = vectorizer.fit_transform(X_raw)

# ── Models ───────────────────────────────────────────────────────────────────
models = {
    'Logistic Regression': LogisticRegression(max_iter=3000, C=2.0, random_state=42),
    'SVM (Linear)': SVC(kernel='linear', C=2.0, probability=True, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42),
    'Naive Bayes': MultinomialNB(alpha=0.1),
    'MLP Neural Network': MLPClassifier(hidden_layer_sizes=(200, 100), max_iter=500, random_state=42,
                                         early_stopping=True, validation_fraction=0.1),
}

results = []

print("=" * 70)
print("  MODEL BENCHMARK (AUGMENTED DATA)")
print("=" * 70)

for name, model in models.items():
    print(f"\n  >> {name}")
    
    t0 = time.time()
    model.fit(X_train_vec, y_train)
    train_time = time.time() - t0
    
    t0 = time.time()
    y_pred = model.predict(X_test_vec)
    infer_time = time.time() - t0
    
    acc = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='weighted', zero_division=0
    )
    
    # 5-Fold CV
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X_full_vec, y_raw, cv=cv, scoring='accuracy')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    results.append({
        'name': name,
        'accuracy': acc,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'cv_mean': cv_mean,
        'cv_std': cv_std,
        'train_time': train_time,
        'infer_time': infer_time,
    })
    
    print(f"    Accuracy      : {acc:.4f}")
    print(f"    Precision     : {precision:.4f}")
    print(f"    Recall        : {recall:.4f}")
    print(f"    F1-Score      : {f1:.4f}")
    print(f"    CV (5-fold)   : {cv_mean:.4f} +/- {cv_std:.4f}")
    print(f"    Train Time    : {train_time:.3f}s")

# ── Summary ────────────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("  SUMMARY - SORTED BY F1")
print("=" * 70)
print(f"  {'Rank':<5} {'Model':<25} {'Accuracy':<10} {'F1':<10} {'CV Score':<15} {'Train Time':<12}")
print(f"  {'-'*5} {'-'*25} {'-'*10} {'-'*10} {'-'*15} {'-'*12}")
results_sorted = sorted(results, key=lambda r: r['f1'], reverse=True)
for i, r in enumerate(results_sorted, 1):
    cv_str = f"{r['cv_mean']:.4f} +/- {r['cv_std']:.4f}"
    medal = "1st" if i == 1 else "2nd" if i == 2 else "3rd" if i == 3 else f"{i}th"
    print(f"  {medal:<5} {r['name']:<25} {r['accuracy']:<10.4f} {r['f1']:<10.4f} {cv_str:<15} {r['train_time']:<12.3f}")

best = results_sorted[0]
second = results_sorted[1]

print(f"\n  ** WINNER: {best['name']}")
print(f"     F1: {best['f1']:.4f} | Accuracy: {best['accuracy']:.4f} | CV: {best['cv_mean']:.4f} +/- {best['cv_std']:.4f}")
print(f"\n  ** RUNNER-UP: {second['name']}")
print(f"     F1: {second['f1']:.4f} | Accuracy: {second['accuracy']:.4f} | CV: {second['cv_mean']:.4f} +/- {second['cv_std']:.4f}")

# ── Per-class for winner ─────────────────────────────────────────────────────
print(f"\n" + "=" * 70)
print(f"  PER-CLASS REPORT - {best['name']}")
print("=" * 70)

# Retrain winner on full data for per-class report
best_model = list(models.values())[list(models.keys()).index(best['name'])]
best_model.fit(X_train_vec, y_train)
y_pred_best = best_model.predict(X_test_vec)
print(classification_report(y_test, y_pred_best, digits=4))

print(f"\n  ** Suggestion: Use {best['name']} for production chatbot")
if best['name'] != second['name']:
    print(f"     Runner-up: {second['name']} also good option")
print("=" * 70)

# ── Retrain best model on FULL data and save ──────────────────────────────────
print(f"\n  Retraining {best['name']} on full dataset and saving...")
final_model = list(models.values())[list(models.keys()).index(best['name'])]
final_model.fit(X_full_vec, y_raw)

model_dir = os.path.join(BASE, 'model')
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'chatbot_model.pkl')
vec_path = os.path.join(model_dir, 'vectorizer.pkl')

import pickle
with open(model_path, 'wb') as f:
    pickle.dump(final_model, f)
with open(vec_path, 'wb') as f:
    pickle.dump(vectorizer, f)

print(f"  Model saved to: {model_path}")
print(f"  Vectorizer saved to: {vec_path}")
print("  Done!\n")
