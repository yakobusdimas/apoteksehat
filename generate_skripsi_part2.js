// ============================================================
// BAB II TINJAUAN KEPUSTAKAAN
// ============================================================
const bab2Children = [
  h("BAB II TINJAUAN KEPUSTAKAAN", HeadingLevel.HEADING_1),

  h("2.1 Tinjauan Teori", HeadingLevel.HEADING_2),

  h("2.1.1 Natural Language Processing (NLP)", HeadingLevel.HEADING_3),
  para("Natural Language Processing (NLP) adalah cabang dari kecerdasan buatan (Artificial Intelligence) yang berfokus pada interaksi antara komputer dan manusia menggunakan bahasa alami. NLP memungkinkan sistem komputer untuk membaca, memahami, dan memproses bahasa manusia dalam bentuk teks maupun suara. Menurut Jurafsky dan Martin (2023) dalam bukunya Speech and Language Processing, NLP mencakup berbagai tugas seperti text classification, named entity recognition, sentiment analysis, dan intent recognition yang menjadi dasar dalam pengembangan sistem chatbot modern.", { indent: true }),
  para("Dalam konteks pengembangan chatbot kesehatan, NLP berfungsi sebagai mesin inferensi utama yang mengekstraksi informasi entitas gejala dari teks tidak terstruktur (input user) dan mengubahnya menjadi kueri terstruktur yang dapat dipahami oleh sistem basis data rekomendasi obat. Proses NLP umumnya melibatkan beberapa tahapan preprocessing seperti tokenization, stopword removal, stemming, dan vectorization sebelum dilakukan klasifikasi intent (Setiawan et al., 2024).", { indent: true }),

  h("2.1.2 TF-IDF (Term Frequency-Inverse Document Frequency)", HeadingLevel.HEADING_3),
  para("TF-IDF adalah metode pembobotan kata yang digunakan dalam information retrieval dan text mining untuk mengukur seberapa penting sebuah kata dalam sebuah dokumen relatif terhadap kumpulan dokumen (corpus). Term Frequency (TF) mengukur frekuensi kemunculan kata dalam sebuah dokumen, sedangkan Inverse Document Frequency (IDF) mengukur seberapa jarang kata tersebut muncul di seluruh korpus dokumen. Semakin tinggi nilai TF-IDF suatu kata, semakin penting kata tersebut dalam merepresentasikan dokumen (Ramos, 2003).", { indent: true }),
  para("Dalam sistem rekomendasi obat, TF-IDF digunakan untuk mengubah input teks gejala dari pengguna menjadi representasi vektor numerik yang dapat diproses oleh algoritma machine learning. Metode ini telah terbukti efektif dalam menangkap karakteristik semantik dari teks berbahasa Indonesia, termasuk teks deskripsi gejala penyakit (Syaputri et al., 2025).", { indent: true }),

  h("2.1.3 Support Vector Machine (SVM)", HeadingLevel.HEADING_3),
  para("Support Vector Machine (SVM) adalah algoritma supervised learning yang digunakan untuk klasifikasi dan regresi. SVM bekerja dengan mencari hyperplane optimal yang memisahkan data dari kelas yang berbeda dengan margin maksimal. Dalam konteks NLP, SVM sering digunakan sebagai classifier untuk intent recognition karena kemampuannya menangani data berdimensi tinggi yang dihasilkan dari representasi TF-IDF. SVM juga dikenal memiliki performa yang baik pada dataset dengan jumlah sampel terbatas (Cortes & Vapnik, 1995; Joachims, 1998).", { indent: true }),
  para("Penggunaan SVM dalam sistem chatbot kesehatan telah menunjukkan hasil yang memuaskan. Firdaus et al. (2024) melaporkan bahwa kombinasi TF-IDF dan SVM mampu mencapai akurasi yang kompetitif dalam tugas ekstraksi informasi medis dari teks berbahasa Indonesia, bahkan mengungguli pendekatan berbasis BERT pada beberapa skenario spesifik.", { indent: true }),

  h("2.1.4 Sastrawi Stemming", HeadingLevel.HEADING_3),
  para("Sastrawi adalah library stemming untuk bahasa Indonesia yang dikembangkan berdasarkan algoritma Nazief-Adriani. Stemming adalah proses mengubah kata berimbuhan menjadi kata dasar. Dalam konteks NLP untuk chatbot berbahasa Indonesia, Sastrawi digunakan untuk mereduksi variasi morfologis kata sehingga kata-kata dengan imbuhan yang berbeda namun memiliki arti dasar yang sama dapat dikenali sebagai entitas yang serupa (Librian, 2015).", { indent: true }),

  h("2.1.5 Sistem Rekomendasi Obat", HeadingLevel.HEADING_3),
  para("Sistem rekomendasi merupakan sebuah program yang dirancang untuk memprediksi preferensi atau kecocokan suatu entitas bagi pengguna. Dalam konteks apotek, sistem rekomendasi bertugas memadankan (matching) gejala yang diidentifikasi dari pengguna melalui chatbot dengan data penyakit ringan dan komposisi obat-obatan bebas (OTC) yang relevan, sehingga memberikan saran intervensi swamedikasi yang aman dan efektif tanpa resep dokter (Aprilia et al., 2024).", { indent: true }),
  para("Sistem rekomendasi obat berbasis gejala umumnya menggunakan dua pendekatan utama: rule-based system dengan metode forward chaining seperti yang diterapkan oleh Aprilia et al. (2024) dan Yunita et al. (2024), serta pendekatan berbasis machine learning dengan NLP seperti yang diterapkan oleh Syaputri et al. (2025) menggunakan Word2Vec. Penelitian ini menggabungkan kedua pendekatan tersebut dengan menggunakan NLP untuk intent recognition dan rule-based matching untuk pemetaan gejala ke obat.", { indent: true }),

  h("2.1.6 React.js dan TypeScript", HeadingLevel.HEADING_3),
  para("React.js adalah library JavaScript open-source yang dikembangkan oleh Meta (Facebook) untuk membangun antarmuka pengguna (user interface) berbasis komponen. React menggunakan Virtual DOM untuk meningkatkan performa rendering dan menyediakan arsitektur component-based yang memudahkan pengembangan dan pemeliharaan aplikasi web berskala besar. TypeScript adalah superset dari JavaScript yang menambahkan static typing sehingga memudahkan deteksi bug pada saat pengembangan dan meningkatkan kualitas kode (React Documentation, 2024).", { indent: true }),
  para("Dalam pengembangan website Apotek Sehat, React.js dengan TypeScript dipilih karena kemampuannya dalam membangun Single Page Application (SPA) yang responsif, dukungan ekosistem yang luas (Tailwind CSS, Radix UI, React Router), serta kemudahan integrasi dengan REST API backend. Framework ini juga mendukung pengembangan aplikasi yang scalable dan mudah di-maintain (Ariyanto et al., 2024).", { indent: true }),

  h("2.1.7 Framework Flask", HeadingLevel.HEADING_3),
  para("Flask adalah micro web framework berbasis Python yang ringan dan fleksibel. Flask menyediakan fitur-fitur dasar yang diperlukan untuk membangun web application dan REST API tanpa memaksakan struktur tertentu, sehingga pengembang memiliki kebebasan dalam memilih komponen dan arsitektur yang sesuai dengan kebutuhan proyek. Flask sangat cocok untuk pengembangan API yang melayani model machine learning karena kemudahan integrasinya dengan library Python seperti scikit-learn, pandas, dan numpy (Grinberg, 2018).", { indent: true }),
  para("Dalam penelitian ini, Flask digunakan sebagai backend API server yang melayani endpoint chatbot (/api/chat), health check (/api/health), dan daftar obat (/api/medicines). Flask-CORS digunakan untuk mengaktifkan Cross-Origin Resource Sharing sehingga API dapat diakses dari frontend React.js yang berjalan pada port yang berbeda.", { indent: true }),

  h("2.1.8 E-Commerce Apotek", HeadingLevel.HEADING_3),
  para("E-commerce apotek adalah platform digital yang memungkinkan transaksi jual beli produk farmasi secara online. Berbeda dengan e-commerce pada umumnya, e-commerce apotek memiliki persyaratan regulasi yang lebih ketat terkait keamanan data kesehatan pengguna dan pembatasan penjualan obat-obatan tertentu yang memerlukan resep dokter. Sistem informasi apotek berbasis web telah banyak dikembangkan menggunakan berbagai framework, termasuk Laravel, React.js, dan framework lainnya (Bangsa, 2024; Simbolon & Komul, 2026).", { indent: true }),

  h("2.2 Penelitian Terdahulu", HeadingLevel.HEADING_2),
  para("Tinjauan terhadap penelitian terdahulu yang relevan memberikan landasan kontekstual dan State of the Art dari proyek ini. Berikut adalah ringkasan penelitian terdahulu dalam bentuk tabel perbandingan:", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 2000, 3000, 1760, 2000],
    rows: [
      new TableRow({ children: [
        cell("No", 600, { sh: "D9E2F3", b: true }),
        cell("Penulis/Tahun", 2000, { sh: "D9E2F3", b: true }),
        cell("Judul Penelitian", 3000, { sh: "D9E2F3", b: true }),
        cell("Metode", 1760, { sh: "D9E2F3", b: true }),
        cell("Hasil Penelitian", 2000, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [
        cell("1", 600), cell("Aprilia et al. (2024)", 2000, { left: true }),
        cell("Sistem Pakar Rekomendasi Obat Berdasarkan Gejala Penyakit Menular Umum", 3000, { left: true }),
        cell("Forward Chaining", 1760),
        cell("Sistem merekomendasikan obat berdasarkan gejala dengan aturan IF-THEN", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("2", 600), cell("Yunita et al. (2024)", 2000, { left: true }),
        cell("Sistem Pakar Rekomendasi Obat Batuk Non-Resep untuk Dewasa", 3000, { left: true }),
        cell("Forward Chaining", 1760),
        cell("Rekomendasi obat batuk bebas sesuai gejala dengan output terstruktur", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("3", 600), cell("Syaputri et al. (2025)", 2000, { left: true }),
        cell("Smart Health: Sistem Rekomendasi Obat Berdasarkan Gejala dengan Word2Vec", 3000, { left: true }),
        cell("NLP (Word2Vec)", 1760),
        cell("Sistem memahami gejala berbasis kemiripan semantik kata", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("4", 600), cell("Firdaus et al. (2024)", 2000, { left: true }),
        cell("Digital Assistant for Pharmacists Using Indonesian Language Based on Rules and AI", 3000, { left: true }),
        cell("Regex + Forward Chaining", 1760),
        cell("Chatbot farmasi dengan akurasi ekstraksi informasi 81,54%", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("5", 600), cell("Miko & Ramayanti (2026)", 2000, { left: true }),
        cell("Sistem Manajemen Data Obat dan Penjualan Obat dengan ChatBot-AI", 3000, { left: true }),
        cell("Knowledge-Based", 1760),
        cell("Sistem e-commerce apotek dengan rekomendasi berbasis pengetahuan", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("6", 600), cell("Simbolon & Komul (2026)", 2000, { left: true }),
        cell("Rancang Bangun Sistem Informasi Penjualan Obat Berbasis Website pada Apotek Filia", 3000, { left: true }),
        cell("Laravel + MySQL", 1760),
        cell("Sistem penjualan obat dengan keranjang belanja, checkout, dan manajemen stok", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("7", 600), cell("Setiawan et al. (2023)", 2000, { left: true }),
        cell("AI-Based Chatbot to Support Public Health Services in Indonesia", 3000, { left: true }),
        cell("Graph Master Matching", 1760),
        cell("Chatbot layanan kesehatan dengan rata-rata jawaban benar 93,1%", 2000, { left: true }),
      ]}),
    ]
  }),
  empty(),
  para("Berdasarkan kajian terhadap penelitian terdahulu, sebagian besar penelitian hanya berfokus pada salah satu aspek (misal: sistem informasi tanpa AI, atau sistem rekomendasi tanpa fitur e-commerce). Kebaruan (novelty) dari penelitian ini terletak pada integrasi sistem rekomendasi obat berbasis NLP (TF-IDF + SVM) dengan fitur e-commerce apotek secara lengkap (keranjang belanja, checkout, pilihan kurir, tracking pengiriman) dalam satu platform terpusat berbasis React.js dan Flask. Selain itu, penelitian ini mengimplementasikan pengurutan rekomendasi obat berdasarkan harga terendah secara otomatis, yang belum ditemukan pada penelitian-penelitian sebelumnya.", { indent: true }),

  h("2.3 Kerangka Konsep", HeadingLevel.HEADING_2),
  para("Kerangka konsep menggambarkan alur interaksi antara aktor (Pengguna dan Admin) dengan sistem utama website Apotek Sehat. Berikut adalah alur berjalannya konsep:", { indent: true }),
  bullet("Interaksi Pengguna (Front-end): Pengguna mengakses website melalui React.js frontend, melakukan registrasi/login, dan dapat berkonsultasi menggunakan Chatbot AI dengan menginputkan gejala secara bahasa natural.", "numbers"),
  bullet("Pemrosesan NLP (Back-end Flask API): Input teks pengguna dikirim ke Flask API endpoint /api/chat. Modul NLP melakukan preprocessing (lowercasing, punctuation removal), TF-IDF vectorization, kemudian SVM classifier memprediksi intent pengguna. Intent yang dikenali kemudian digunakan untuk mencocokkan (matching) gejala dengan database obat melalui pencarian kategori penyakit dan sinonim.", "numbers"),
  bullet("Rekomendasi dan Penyajian: Hasil rekomendasi obat disortir berdasarkan harga terendah (lowest to highest) dan dikembalikan ke frontend dalam format JSON. Pengguna melihat daftar rekomendasi obat beserta informasi harga, stok, dan deskripsi.", "numbers"),
  bullet("Keputusan dan Transaksi: Pengguna memilih obat yang direkomendasikan, menambahkannya ke keranjang (cart), lalu menuju tahapan checkout yang mencakup pengisian alamat pengiriman, pemilihan kurir (JNE, J&T, SiCepat), dan konfirmasi pembayaran.", "numbers"),
  bullet("Interaksi Admin: Admin atau pihak apoteker mengakses dashboard admin untuk memverifikasi transaksi, mengatur inventaris (stok obat), memperbarui status pengiriman, dan memonitor statistik penjualan.", "numbers"),
  pb()
];

console.log("Bab 2 ready.");
