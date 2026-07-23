// ============================================================
// BAB III METODE PENELITIAN
// ============================================================
const bab3Children = [
  h("BAB III METODE PENELITIAN", HeadingLevel.HEADING_1),

  h("3.1 Jenis Penelitian", HeadingLevel.HEADING_2),
  para("Jenis penelitian ini adalah penelitian terapan (applied research) dalam bidang rekayasa perangkat lunak dengan pendekatan Rancang Bangun (Research and Development/R&D). Metode pengembangan sistem (Software Development Life Cycle - SDLC) yang digunakan adalah metode Waterfall, yang menitikberatkan pada proses pengembangan secara linear dan terstruktur mulai dari analisis kebutuhan hingga tahapan pemeliharaan (maintenance). Metode Waterfall dipilih karena setiap tahapan harus diselesaikan secara berurutan sebelum melanjutkan ke tahapan berikutnya, sehingga memudahkan dalam perencanaan dan dokumentasi proyek (Pressman, 2014).", { indent: true }),
  para("Pendekatan R&D digunakan karena penelitian ini tidak hanya menghasilkan analisis teoritis, tetapi juga menghasilkan produk nyata berupa website Apotek Sehat dengan chatbot NLP yang dapat digunakan secara langsung. Tahapan dalam metode Waterfall meliputi: (1) Analisis Kebutuhan, (2) Perancangan Sistem, (3) Implementasi (Coding), (4) Pengujian, dan (5) Evaluasi/Pemeliharaan.", { indent: true }),

  h("3.2 Tempat dan Waktu Penelitian", HeadingLevel.HEADING_2),
  para("Penelitian ini beserta studi kasusnya diimplementasikan untuk kebutuhan layanan digital Apotek Sehat yang terletak di Jl. Raya Delanggu Utara No.69 Klaten. Waktu penelitian direncanakan berlangsung selama 5 bulan dari bulan Maret 2026 hingga Juli 2026.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 3600, 1200, 1200, 1200, 1200, 1200],
    rows: [
      new TableRow({ children: [
        cell("No", 600, { sh: "D9E2F3", b: true }),
        cell("Kegiatan", 3600, { sh: "D9E2F3", b: true }),
        cell("Maret", 1200, { sh: "D9E2F3", b: true }),
        cell("April", 1200, { sh: "D9E2F3", b: true }),
        cell("Mei", 1200, { sh: "D9E2F3", b: true }),
        cell("Juni", 1200, { sh: "D9E2F3", b: true }),
        cell("Juli", 1200, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [cell("1", 600), cell("Studi Literatur dan Observasi", 3600, { left: true }), cell("✓", 1200), cell("", 1200), cell("", 1200), cell("", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("2", 600), cell("Pengumpulan Data", 3600, { left: true }), cell("✓", 1200), cell("✓", 1200), cell("", 1200), cell("", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("3", 600), cell("Perancangan Sistem & UI/UX", 3600, { left: true }), cell("", 1200), cell("✓", 1200), cell("✓", 1200), cell("", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("4", 600), cell("Implementasi Frontend (React.js)", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("✓", 1200), cell("✓", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("5", 600), cell("Implementasi Backend API (Flask)", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("✓", 1200), cell("✓", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("6", 600), cell("Training Model NLP (TF-IDF + SVM)", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("✓", 1200), cell("✓", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("7", 600), cell("Integrasi Chatbot NLP", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("", 1200), cell("✓", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("8", 600), cell("Pengujian dan Evaluasi Sistem", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("", 1200), cell("✓", 1200), cell("", 1200)] }),
      new TableRow({ children: [cell("9", 600), cell("Penyusunan Laporan", 3600, { left: true }), cell("", 1200), cell("", 1200), cell("", 1200), cell("", 1200), cell("✓", 1200)] }),
    ]
  }),
  empty(),

  h("3.3 Metode Pengumpulan Data", HeadingLevel.HEADING_2),
  para("Teknik pengumpulan data yang digunakan dalam perancangan sistem ini mencakup:", { indent: true }),
  bullet([{ text: "Observasi: ", bold: true }, "Pengamatan langsung terhadap proses bisnis Apotek Sehat dalam melayani pasien swamedikasi. Observasi dilakukan untuk memahami alur kerja apotek, jenis obat yang sering dicari pelanggan, serta permasalahan yang dihadapi dalam pelayanan manual."], "numbers"),
  bullet([{ text: "Wawancara: ", bold: true }, "Wawancara dengan pemilik dan petugas Apotek Sehat untuk menggali informasi terkait kebutuhan sistem, katalog obat yang tersedia, serta proses transaksi yang selama ini berjalan."], "numbers"),
  bullet([{ text: "Studi Literatur: ", bold: true }, "Mengkaji referensi jurnal ilmiah, buku panduan farmakologi dasar untuk obat OTC, dokumentasi framework (React.js, Flask, scikit-learn), serta penelitian-penelitian terdahulu yang relevan dengan topik sistem rekomendasi obat dan chatbot NLP."], "numbers"),

  h("3.4 Tahapan Pengembangan Sistem", HeadingLevel.HEADING_2),
  para("Dengan menggunakan metode Waterfall, tahapan pengembangan sistem yang dilalui meliputi:", { indent: true }),

  h("3.4.1 Analisis Kebutuhan Sistem", HeadingLevel.HEADING_3),
  para("Tahap analisis kebutuhan bertujuan untuk mengidentifikasi kebutuhan fungsional dan non-fungsional dari sistem yang akan dikembangkan. Kebutuhan fungsional mencakup fitur-fitur seperti: sistem autentikasi pengguna (login/register), chatbot NLP untuk konsultasi gejala, sistem rekomendasi obat dengan pengurutan harga, keranjang belanja (shopping cart), proses checkout dengan pemilihan kurir, tracking pengiriman, manajemen stok obat oleh admin, dan riwayat transaksi. Kebutuhan non-fungsional mencakup: keamanan data, responsivitas antarmuka, performa API (< 1 detik response time), dan kompatibilitas lintas perangkat.", { indent: true }),

  h("3.4.2 Perancangan Sistem", HeadingLevel.HEADING_3),
  para("Tahap perancangan sistem meliputi: perancangan arsitektur sistem, perancangan Unified Modeling Language (UML) yang terdiri dari Use Case Diagram dan Activity Diagram, perancangan Entity Relationship Diagram (ERD) untuk basis data, perancangan antarmuka pengguna (UI/UX) menggunakan wireframe, serta perancangan alur kerja chatbot NLP.", { indent: true }),

  h("3.4.3 Implementasi Sistem", HeadingLevel.HEADING_3),
  para("Tahap implementasi merupakan realisasi dari rancangan sistem ke dalam bentuk kode program. Implementasi frontend dilakukan menggunakan React.js 18 dengan TypeScript, Vite sebagai build tool, Tailwind CSS v4 untuk styling, dan Radix UI serta Shadcn untuk komponen UI. Implementasi backend API dilakukan menggunakan Flask 3.0 dengan Python, menyediakan REST API endpoint untuk komunikasi chatbot. Model NLP diimplementasikan menggunakan scikit-learn dengan algoritma TF-IDF untuk vectorization dan SVM untuk klasifikasi intent. Library Sastrawi digunakan untuk stemming teks bahasa Indonesia.", { indent: true }),

  h("3.4.4 Pengujian Sistem", HeadingLevel.HEADING_3),
  para("Tahap pengujian sistem dilakukan dengan dua metode: (1) Pengujian model NLP menggunakan metrik akurasi, precision, recall, dan F1-score untuk mengevaluasi performa model SVM dalam mengenali intent pengguna; (2) Pengujian fungsionalitas sistem menggunakan metode Black Box Testing untuk mengevaluasi kesesuaian output sistem dengan input pengguna, memastikan seluruh fitur seperti keranjang belanja, checkout, dan tracking berjalan tanpa bug.", { indent: true }),

  h("3.4.5 Evaluasi dan Pemeliharaan", HeadingLevel.HEADING_3),
  para("Tahap evaluasi dan pemeliharaan meliputi peninjauan performa sistem secara keseluruhan, perbaikan bug minor yang ditemukan, penyesuaian antarmuka berdasarkan masukan pengguna, serta dokumentasi sistem untuk kemudahan pengembangan di masa mendatang.", { indent: true }),

  h("3.5 Cara Kerja Sistem", HeadingLevel.HEADING_2),
  para("Secara operasional, cara kerja sistem dijabarkan dalam 6 tahapan kronologis berikut:", { indent: true }),
  bullet("Tahap 1 - Akses Website: Pengguna mengakses website Apotek Sehat melalui peramban (browser) pada alamat URL yang telah disediakan. Sistem menampilkan Landing Page yang berisi katalog obat, fitur pencarian, dan tombol Chatbot AI.", "numbers"),
  bullet("Tahap 2 - Registrasi/Login: Pengguna melakukan registrasi akun baru atau login ke akun yang sudah ada. Setelah berhasil login, pengguna diarahkan ke Dashboard User dengan antarmuka bertema hijau yang menampilkan fitur-fitur eksklusif.", "numbers"),
  bullet("Tahap 3 - Konsultasi Chatbot AI: Pengguna membuka fitur Chatbot AI dengan mengklik tombol chatbot di pojok kanan bawah. Pengguna menginputkan gejala yang dialami dalam bahasa Indonesia natural. Backend Flask memproses input melalui pipeline NLP: preprocessing → TF-IDF vectorization → SVM intent classification → matching gejala dengan database obat. Hasil rekomendasi yang telah disortir berdasarkan harga terendah ditampilkan dalam chatbot.", "numbers"),
  bullet("Tahap 4 - Pemilihan Produk: Pengguna mengevaluasi rekomendasi obat yang ditampilkan, melihat detail obat (nama, komposisi, indikasi, efek samping, harga), kemudian memilih produk dan menambahkannya ke dalam keranjang belanja (Cart).", "numbers"),
  bullet("Tahap 5 - Checkout dan Pembayaran: Pengguna menuju halaman checkout, mengisi data pengiriman (nama, alamat, nomor telepon), memilih kurir pengiriman (JNE REG, JNE YES, J&T Regular, J&T Express, SiCepat REG, SiCepat BEST), dan melakukan konfirmasi pembayaran. Sistem menerapkan gratis ongkos kirim untuk pembelian di atas Rp100.000.", "numbers"),
  bullet("Tahap 6 - Tracking dan Pengiriman: Setelah pembayaran dikonfirmasi, admin apotek memproses pesanan melalui dashboard admin. Status pengiriman dapat dilacak oleh pengguna melalui halaman tracking dengan timeline: Pesanan Dibuat → Dikemas → Dikirim → Dalam Perjalanan → Sampai.", "numbers"),

  h("3.6 Rencana Anggaran Biaya (RAB)", HeadingLevel.HEADING_2),
  para("Berikut adalah proyeksi rancangan anggaran biaya (RAB) yang dibutuhkan untuk penelitian dan pengembangan sistem ini:", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 5000, 1760, 2000],
    rows: [
      new TableRow({ children: [
        cell("No", 600, { sh: "D9E2F3", b: true }),
        cell("Nama Kebutuhan", 5000, { sh: "D9E2F3", b: true }),
        cell("Volume/Satuan", 1760, { sh: "D9E2F3", b: true }),
        cell("Total Harga (Rp)", 2000, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [cell("1", 600), cell("Domain (.com/.id)", 5000, { left: true }), cell("1 Tahun", 1760), cell("100.000", 2000)] }),
      new TableRow({ children: [cell("2", 600), cell("Cloud Hosting/VPS", 5000, { left: true }), cell("1 Tahun", 1760), cell("400.000", 2000)] }),
      new TableRow({ children: [cell("3", 600), cell("Biaya Operasional (Cetak, Jilid, Internet)", 5000, { left: true }), cell("Paket", 1760), cell("350.000", 2000)] }),
      new TableRow({ children: [
        cell("", 600, { sh: "D9E2F3" }),
        cell("TOTAL BIAYA", 5000, { sh: "D9E2F3", b: true, left: true }),
        cell("", 1760, { sh: "D9E2F3" }),
        cell("850.000", 2000, { sh: "D9E2F3", b: true }),
      ]}),
    ]
  }),
  empty(),
  para("Total biaya yang dibutuhkan untuk pengembangan dan deployment sistem ini adalah sebesar Rp850.000 untuk tahun pertama operasional. Biaya tersebut mencakup pembelian domain, sewa cloud hosting/VPS, dan biaya operasional pendukung.", { indent: true }),
  pb()
];

console.log("Bab 3 ready.");
