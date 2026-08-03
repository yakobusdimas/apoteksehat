#!/usr/bin/env python3
"""Perbandingan 4 model + bar chart gaya skripsi"""

import json, re, os, random, warnings, time
warnings.filterwarnings('ignore')
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

random.seed(42); np.random.seed(42)

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    stemmer = StemmerFactory().create_stemmer()
    SASTRAWI_OK = True
except ImportError:
    stemmer = None; SASTRAWI_OK = False

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    if SASTRAWI_OK: return stemmer.stem(' '.join(text.split()))
    return ' '.join(text.split())

# -- Augmentation (sama persis dengan confusion matrix script) --
TEMPLATES = {
    "salam": ["halo selamat {waktu}","selamat {waktu} dok","siang dok","hai juga","hey","halo jumpa lagi","selamat {waktu} apotek sehat","halo admin","pagi admin","siang admin","sore admin","halo min","pagi min","assalamualaikum dok","halo dok","permisi min","mau tanya dok","selamat datang","hy juga","halo hai","hai halo"],
    "perpisahan": ["makasih ya infonya","oke makasih banyak","goodbye","dadah semoga sehat","bye bye","sampai jumpa lagi","terima kasih atas bantuannya","makasih dok","terima kasih dok","sudah dulu ya","cukup terima kasih","sudah cukup makasih","ok sip makasih","baik terima kasih bantuannya","makasih infonya dok","terima kasih infonya min","selesai terima kasih","udah makasih","thanks bantuannya","thank you dok","noted makasih"],
    "tanya_obat": ["saya butuh obat {keluhan}","cari obat buat {keluhan}","obat untuk {keluhan}","rekomendasi untuk {keluhan}","ada obat {keluhan} tidak","obat apa yang cocok untuk {keluhan}","mau beli obat {keluhan}","saran obat {keluhan}","obat paling bagus untuk {keluhan}","kasih tahu obat untuk {keluhan}","tolong rekomendasikan obat {keluhan}","apa obat buat {keluhan}","obat untuk mengobati {keluhan}","butuh saran obat {keluhan}","saya cari obat {keluhan}","obat sakit {keluhan}","obat buat anak {keluhan}","perlu obat {keluhan}","minta rekomendasi obat {keluhan}","info obat {keluhan}","butuh info obat {keluhan}"],
    "efek_samping": ["apa efek samping dari {obat}","efek samping minum {obat}","{obat} efek sampingnya apa","apakah {obat} aman","bahaya minum {obat}","efek negatif {obat}","setelah minum {obat} jadi pusing","efek samping obat {obat}","apakah {obat} punya efek samping","apa bahaya {obat}","akibat minum {obat}","resiko minum {obat}","efek samping {obat} jangka panjang","kontraindikasi {obat}","apa efek buruk {obat}","efek minum {obat} berlebihan","reaksi alergi {obat}","efek samping antibiotik","efek samping umum {obat}","peringatan {obat}"],
    "dosis": ["aturan pakai {obat}","dosis {obat} untuk dewasa","berapa dosis {obat}","minum {obat} berapa kali sehari","dosis {obat} untuk anak","aturan minum {obat}","berapa tablet {obat} sehari","dosis tepat {obat}","{obat} diminum berapa kali","takaran {obat}","dosis maksimal {obat}","dosis {obat} untuk bayi","dosis {obat} untuk lansia","berapa ml {obat} untuk anak","berapa sendok {obat}","sehari minum {obat} berapa kali","panduan dosis {obat}","takaran minum {obat}","dosis harian {obat}","berapa banyak {obat} boleh diminum"],
    "ketersediaan": ["apakah {obat} tersedia","ada stok {obat}","stok {obat} masih ada","{obat} ready","apakah {obat} masih ada","ketersediaan {obat}","cek stok {obat}","apa {obat} tersedia di apotek","ada tidak {obat}","{obat} kosong atau ada","stok terbaru {obat}","apakah {obat} habis","informasi stok {obat}","cek ketersediaan {obat}","apakah ada {obat}","stok {obat} di apotek","{obat} ready stock","masih ada {obat} tidak","ketersediaan stok {obat}"],
    "komposisi": ["kandungan {obat}","komposisi {obat} apa saja","bahan aktif {obat}","apa isi {obat}","{obat} mengandung apa","zat aktif {obat}","kandungan utama {obat}","bahan dalam {obat}","komposisi lengkap {obat}","apa saja isi {obat}","bahan kimia {obat}","senyawa aktif {obat}","tiap tablet {obat} mengandung","komposisi per tablet {obat}","zat berkhasiat {obat}","kandungan nutrisi {obat}","komposisi obat {obat}","detail kandungan {obat}"],
    "kegunaan": ["guna {obat}","manfaat {obat}","khasiat {obat}","{obat} untuk penyakit apa","fungsi {obat}","indikasi {obat}","kegunaan utama {obat}","apa manfaat minum {obat}","{obat} bagus untuk apa","penyakit apa yang diobati {obat}","kegunaan obat {obat}","manfaat klinis {obat}","indikasi medis {obat}","untuk apa {obat} diminum","tujuan penggunaan {obat}"],
    "harga": ["harga {obat}","berapa harga {obat}","{obat} harganya berapa","{obat} berapa","biaya {obat}","harga terbaru {obat}","harga {obat} di apotek","berapa biaya {obat}","{obat} dijual berapa","harga satuan {obat}","harga {obat} per strip","harga {obat} per box","cek harga {obat}","info harga {obat}","apa harga {obat}","harga retail {obat}","harga murah {obat}","ada diskon {obat}","{obat} promo berapa"],
    "tidak_tahu": ["saya tidak tahu mau tanya apa","bingung mau tanya apa","nggak tau mau nanya apa","tidak tau harus bilang apa","saya masih bingung","malu nanya","agak malu nanya","saya kurang paham","belum ngerti cara tanya","apa ya saya lupa","lupa mau tanya apa","saya baru pertama kali tanya","pertama kali pakai chatbot","belum pernah konsultasi","tidak tau harus mulai dari mana","bingung harus nanya apa","sebentar saya pikir dulu","saya cuma lihat lihat","saya masih ragu","mager nanya","malas nanya"],
    "darurat": ["saya butuh pertolongan","tolong saya","darurat","butuh bantuan segera","saya kecelakaan","keracunan","orang pingsan","saya pingsan","luka parah","patah tulang","luka bakar","sesak napas parah","tidak bisa bernapas","nyeri dada","serangan jantung","stroke","kejang kejang","demam tinggi kejang","muntah darah","alergi parah bengkak","syok anafilaktik","overdosis obat darurat","keracunan makanan","luka tusuk","pendarahan hebat","kecelakaan lalu lintas","bayi kejang","anak kejang demam","tidak sadarkan diri","keracunan obat","minum racun","alergi obat parah","demam sangat tinggi 40","luka infeksi parah","sakit perut hebat"],
    "jam_operasional": ["jam buka apotek","apotek buka jam berapa","sampai jam berapa buka","apotek buka hari minggu","hari libur buka","jam tutup","jam kerja apotek","kapan apotek buka","operasional apotek","jadwal buka apotek","jam berapa buka hari ini","apakah buka sekarang","buka 24 jam","apotek 24 jam","jam buka hari sabtu","hari minggu buka tidak","hari raya buka","buka sampai jam berapa","jadwal lengkap jam buka","info jam operasional","jam buka cabang","setiap hari buka","weekend buka","hari libur nasional buka","tanggal merah buka","apakah hari ini buka","malem hari buka","malam hari ada"],
    "lokasi": ["alamat apotek","dimana lokasi apotek","apotek terdekat","cabang terdekat","letak apotek","posisi apotek","gmap apotek","maps apotek","bagaimana menuju apotek","rute ke apotek","lokasi apotek dimana","apotek cabang","alamat lengkap","dimana alamatnya","apakah ada di {kota}","cabang di {kota}","lokasi terdekat dari sini","apotek dekat sini","di daerah mana","lokasi pusat","cabang utama dimana","alamat kantor pusat","arah ke apotek","petunjuk arah","google maps apotek","navigasi ke apotek","dekat stasiun","dekat mall","dekat rumah sakit","apotek terdekat dari lokasi saya"],
}
KELUHAN = ["demam","batuk","pilek","flu","sakit kepala","pusing","mual","migrain","diare","maag","sakit perut","alergi","gatal","infeksi","nyeri sendi","nyeri otot","hipertensi","darah tinggi","diabetes","gula darah","kolesterol","luka","sariawan","radang tenggorokan","sesak napas"]
OBAT  = ["paracetamol","amoxicillin","ibuprofen","aspirin","omeprazole","metformin","amlodipine","simvastatin","cetirizine","ranitidine","prednisone","diclofenac","vitamin c","sangobion","promag","mylanta","antangin","diapet","obh combi","mixagrip","neuralgin","sanmol","panadol","bodrex","decolgen"]
KOTA  = ["jakarta","bandung","surabaya","yogyakarta","semarang","medan","makassar","palembang","malang","bekasi"]
WAKTU = ["pagi","siang","sore","malam"]

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(BASE,'data','intents.json'), 'r', encoding='utf-8') as f:
    intents_data = json.load(f)

X_raw, y_raw = [], []
for intent in intents_data['intents']:
    tag = intent['tag']
    patterns = list(intent['patterns'])
    if tag in TEMPLATES:
        for tmpl in TEMPLATES[tag]:
            if "{keluhan}" in tmpl:
                for _ in range(5): patterns.append(tmpl.replace("{keluhan}", random.choice(KELUHAN)))
            elif "{obat}" in tmpl:
                for _ in range(5): patterns.append(tmpl.replace("{obat}", random.choice(OBAT)))
            elif "{kota}" in tmpl:
                for _ in range(3): patterns.append(tmpl.replace("{kota}", random.choice(KOTA)))
            elif "{waktu}" in tmpl:
                for _ in range(3): patterns.append(tmpl.replace("{waktu}", random.choice(WAKTU)))
            else:
                patterns.append(tmpl)
    seen = set()
    for p in patterns:
        if p.lower().strip() not in seen:
            seen.add(p.lower().strip())
            X_raw.append(preprocess(p)); y_raw.append(tag)

X_train, X_test, y_train, y_test = train_test_split(X_raw, y_raw, test_size=0.2, random_state=42, stratify=y_raw)
vec = TfidfVectorizer(max_features=12000, ngram_range=(1,3), min_df=1, max_df=0.95, sublinear_tf=True)
Xtr = vec.fit_transform(X_train); Xte = vec.transform(X_test)

models = {
    'Logistic\nRegression': LogisticRegression(C=10.0, solver='lbfgs', max_iter=3000, random_state=42),
    'SVM':                  SVC(kernel='linear', C=2.0, probability=True, random_state=42),
    'MLP Neural\nNetwork':  MLPClassifier(hidden_layer_sizes=(200,100), max_iter=500, random_state=42, early_stopping=True, validation_fraction=0.1),
    'Naive Bayes':          MultinomialNB(alpha=0.1),
}

results = {}
print("="*55)
print("  HASIL PERBANDINGAN MODEL")
print("="*55)
for name, mdl in models.items():
    mdl.fit(Xtr, y_train)
    yp = mdl.predict(Xte)
    acc = accuracy_score(y_test, yp)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, yp, average='weighted', zero_division=0)
    results[name] = {'acc': acc, 'prec': prec, 'rec': rec, 'f1': f1}
    label = name.replace('\n', ' ')
    print(f"  {label:<22}  Acc={acc*100:.2f}%  P={prec*100:.2f}%  R={rec*100:.2f}%  F1={f1*100:.2f}%")
print("="*55)

# -- Bar chart gaya skripsi --
model_names = list(results.keys())
acc_vals  = [results[m]['acc']*100  for m in model_names]
prec_vals = [results[m]['prec']*100 for m in model_names]
rec_vals  = [results[m]['rec']*100  for m in model_names]
f1_vals   = [results[m]['f1']*100   for m in model_names]

x = np.arange(len(model_names))
width = 0.18
fig, ax = plt.subplots(figsize=(13, 7))

bars_acc  = ax.bar(x - 1.5*width, acc_vals,  width, label='Accuracy',  color='#1f4e79', zorder=3)
bars_prec = ax.bar(x - 0.5*width, prec_vals, width, label='Precision', color='#2e75b6', zorder=3)
bars_rec  = ax.bar(x + 0.5*width, rec_vals,  width, label='Recall',    color='#70ad47', zorder=3)
bars_f1   = ax.bar(x + 1.5*width, f1_vals,   width, label='F1-Score',  color='#ed7d31', zorder=3)

# Anotasi nilai di atas bar
for bars in [bars_acc, bars_prec, bars_rec, bars_f1]:
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{h:.1f}%',
                    xy=(bar.get_x() + bar.get_width()/2, h),
                    xytext=(0, 4), textcoords='offset points',
                    ha='center', va='bottom', fontsize=8, fontweight='bold')

ax.set_ylim(60, 105)
ax.set_ylabel('Nilai (%)', fontsize=12)
ax.set_xlabel('Algoritma', fontsize=12)
ax.set_title('Perbandingan Model Klasifikasi Chatbot Apotek\n(Accuracy, Precision, Recall, F1-Score)', fontsize=13, fontweight='bold', pad=15)
ax.set_xticks(x)
ax.set_xticklabels(model_names, fontsize=11)
ax.legend(loc='lower right', fontsize=10)
ax.yaxis.grid(True, linestyle='--', alpha=0.7, zorder=0)
ax.set_axisbelow(True)
plt.tight_layout()

out_path = os.path.join(BASE, 'model', 'comparison_chart.png')
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"\nChart disimpan: {out_path}")
