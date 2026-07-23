// ============================================================
// BAB IV HASIL DAN PEMBAHASAN
// ============================================================
const bab4Children = [
  h("BAB IV HASIL DAN PEMBAHASAN", HeadingLevel.HEADING_1),

  h("4.1 Analisis Kebutuhan Sistem", HeadingLevel.HEADING_2),
  para("Analisis kebutuhan sistem dilakukan untuk mengidentifikasi fitur, aktor, data, serta batasan teknis yang diperlukan dalam pengembangan website Apotek Sehat. Berdasarkan hasil observasi terhadap project APOTEK yang telah dikembangkan, sistem terdiri atas dua bagian utama, yaitu frontend berbasis React.js dan TypeScript serta backend API berbasis Flask untuk layanan chatbot NLP. Sistem ini juga dilengkapi dengan data obat, model machine learning, dashboard user, dashboard admin, keranjang belanja, checkout, dan tracking pengiriman.", { indent: true }),

  h("4.1.1 Aktor Sistem", HeadingLevel.HEADING_3),
  para("Aktor yang berinteraksi dengan sistem Apotek Sehat terdiri atas tiga aktor utama, yaitu pengunjung, pengguna terdaftar, dan admin. Pengunjung dapat melihat landing page, katalog obat terbatas, dan tombol chatbot. Pengguna terdaftar dapat menggunakan chatbot AI secara penuh, melihat rekomendasi obat, memasukkan obat ke keranjang, checkout, dan melacak pengiriman. Admin dapat mengelola stok obat, memantau stok rendah, melihat riwayat pembelian, dan memantau statistik penjualan.", { indent: true }),

  h("4.1.2 Kebutuhan Fungsional", HeadingLevel.HEADING_3),
  para("Kebutuhan fungsional adalah layanan yang harus disediakan oleh sistem agar sistem dapat memenuhi kebutuhan pengguna. Kebutuhan fungsional website Apotek Sehat ditunjukkan pada Tabel 4.1.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [900, 3000, 5460],
    rows: [
      new TableRow({ children: [cell("Kode", 900, { sh: "D9E2F3", b: true }), cell("Kebutuhan", 3000, { sh: "D9E2F3", b: true }), cell("Deskripsi", 5460, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("KF-01", 900), cell("Autentikasi", 3000, { left: true }), cell("Sistem menyediakan fitur login admin dan login/register pengguna.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-02", 900), cell("Katalog Obat", 3000, { left: true }), cell("Sistem menampilkan daftar obat, kategori, harga, stok, gambar, deskripsi, indikasi, dan dosis.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-03", 900), cell("Pencarian dan Filter", 3000, { left: true }), cell("Sistem memungkinkan pengguna mencari obat berdasarkan nama dan memfilter berdasarkan kategori.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-04", 900), cell("Chatbot AI", 3000, { left: true }), cell("Sistem menerima input gejala pengguna dan memberikan respons berbasis intent NLP.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-05", 900), cell("Rekomendasi Obat", 3000, { left: true }), cell("Sistem menampilkan rekomendasi obat berdasarkan gejala dan mengurutkan obat dari harga termurah ke termahal.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-06", 900), cell("Keranjang Belanja", 3000, { left: true }), cell("Pengguna dapat menambahkan, mengubah jumlah, dan menghapus obat dari keranjang.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-07", 900), cell("Checkout", 3000, { left: true }), cell("Pengguna dapat mengisi alamat, memilih kurir, dan mengonfirmasi pembayaran.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-08", 900), cell("Tracking", 3000, { left: true }), cell("Pengguna dapat melihat status pengiriman secara bertahap.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KF-09", 900), cell("Dashboard Admin", 3000, { left: true }), cell("Admin dapat mengelola stok, melihat transaksi, dan memantau statistik penjualan.", 5460, { left: true })] }),
    ]
  }),
  empty(),

  h("4.1.3 Kebutuhan Non-Fungsional", HeadingLevel.HEADING_3),
  para("Kebutuhan non-fungsional menjelaskan kualitas sistem yang harus dipenuhi agar sistem nyaman, aman, dan efektif digunakan. Kebutuhan non-fungsional website Apotek Sehat ditunjukkan pada Tabel 4.2.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [900, 3000, 5460],
    rows: [
      new TableRow({ children: [cell("Kode", 900, { sh: "D9E2F3", b: true }), cell("Kebutuhan", 3000, { sh: "D9E2F3", b: true }), cell("Deskripsi", 5460, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("KNF-01", 900), cell("Usability", 3000, { left: true }), cell("Antarmuka harus mudah digunakan oleh pengguna umum dengan desain responsif.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KNF-02", 900), cell("Performance", 3000, { left: true }), cell("API chatbot harus merespons dalam waktu wajar, dengan timeout 10 detik pada frontend.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KNF-03", 900), cell("Availability", 3000, { left: true }), cell("Sistem menyediakan indikator status API: Online, AI Sedang Berpikir, dan API Offline.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KNF-04", 900), cell("Maintainability", 3000, { left: true }), cell("Kode dipisahkan menjadi komponen, service, data, types, dan utilities agar mudah dipelihara.", 5460, { left: true })] }),
      new TableRow({ children: [cell("KNF-05", 900), cell("Portability", 3000, { left: true }), cell("Sistem dapat dijalankan melalui Docker Compose dengan service frontend dan backend.", 5460, { left: true })] }),
    ]
  }),
  empty(),

  h("4.2 Perancangan Sistem", HeadingLevel.HEADING_2),
  h("4.2.1 Use Case Diagram", HeadingLevel.HEADING_3),
  para("Use Case Diagram menggambarkan hubungan antara aktor dengan fungsi-fungsi utama sistem. Pada sistem Apotek Sehat terdapat aktor Pengunjung, User, dan Admin. Pengunjung dapat melihat landing page, mencari obat, dan diarahkan untuk login ketika ingin menggunakan chatbot secara penuh. User dapat menggunakan chatbot, menerima rekomendasi obat, melihat detail obat, melakukan checkout, dan tracking pesanan. Admin dapat mengelola stok obat, memantau riwayat transaksi, dan melihat statistik penjualan.", { indent: true }),
  para("Gambar 4.1 Use Case Diagram Sistem Apotek Sehat", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan gambar use case diagram di sini: Pengunjung, User, Admin, Chatbot AI, Katalog Obat, Keranjang, Checkout, Tracking, Manajemen Stok]", { alignment: AlignmentType.CENTER }),

  h("4.2.2 Activity Diagram Konsultasi Chatbot", HeadingLevel.HEADING_3),
  para("Activity Diagram konsultasi chatbot dimulai saat user membuka tombol chatbot pada halaman website. Sistem mengecek status autentikasi dan koneksi API. Jika user belum login, sistem menampilkan pesan bahwa fitur konsultasi AI penuh membutuhkan login. Jika user sudah login, user dapat memasukkan gejala. Frontend mengirim pesan ke endpoint /api/chat. Backend melakukan preprocessing, prediksi intent, pengecekan confidence, pencarian obat, lalu mengembalikan response dan rekomendasi obat ke frontend.", { indent: true }),
  para("Gambar 4.2 Activity Diagram Alur Konsultasi Chatbot", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan gambar activity diagram chatbot di sini]", { alignment: AlignmentType.CENTER }),

  h("4.2.3 Activity Diagram Pembelian Obat", HeadingLevel.HEADING_3),
  para("Activity Diagram pembelian obat dimulai dari user memilih obat dari katalog atau rekomendasi chatbot. User melihat detail obat, memasukkan obat ke keranjang, mengatur jumlah pembelian, dan menuju halaman checkout. Pada halaman checkout, user mengisi alamat, memilih kurir, memilih metode pembayaran, lalu mengonfirmasi pesanan. Setelah pesanan dibuat, sistem menampilkan halaman tracking dengan timeline pengiriman.", { indent: true }),
  para("Gambar 4.3 Activity Diagram Alur Pembelian Obat", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan gambar activity diagram pembelian di sini]", { alignment: AlignmentType.CENTER }),

  h("4.2.4 Arsitektur Sistem", HeadingLevel.HEADING_3),
  para("Arsitektur sistem Apotek Sehat menggunakan pemisahan antara frontend dan backend. Frontend dibangun menggunakan React.js, TypeScript, Vite, Tailwind CSS, Radix UI, dan Shadcn UI. Backend chatbot dibangun menggunakan Flask, Flask-CORS, scikit-learn, pandas, numpy, dan Sastrawi. Komunikasi antara frontend dan backend dilakukan melalui REST API berbasis JSON. Endpoint utama yang digunakan adalah POST /api/chat untuk pengiriman pesan chatbot, GET /api/health untuk pengecekan status API, dan GET /api/medicines untuk mengambil daftar obat.", { indent: true }),
  para("Gambar 4.4 Arsitektur Sistem Apotek Sehat", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan gambar arsitektur sistem di sini: Browser/React Frontend → REST API Flask → Model NLP + Database JSON Obat]", { alignment: AlignmentType.CENTER }),

  h("4.2.5 Perancangan Basis Data", HeadingLevel.HEADING_3),
  para("Data utama pada sistem Apotek Sehat terdiri dari data pengguna, data admin, data obat, data keranjang, data pesanan, data detail pesanan, data pembayaran, data pengiriman, dan data chat. Pada implementasi project, data obat frontend disimpan dalam file TypeScript medicines.ts, sedangkan data backend NLP disimpan dalam medicines_primary.json, intents.json, dan synonyms_id.json. Untuk implementasi produksi, struktur data tersebut dapat dipindahkan ke database relasional seperti MySQL atau PostgreSQL.", { indent: true }),
  para("Gambar 4.5 Entity Relationship Diagram (ERD)", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan ERD di sini: Users, Medicines, Carts, Orders, OrderDetails, Payments, Shipments, ChatHistories]", { alignment: AlignmentType.CENTER }),

  h("4.3 Implementasi Sistem", HeadingLevel.HEADING_2),
  h("4.3.1 Implementasi Frontend", HeadingLevel.HEADING_3),
  para("Frontend website Apotek Sehat dikembangkan menggunakan React.js dan TypeScript. Struktur project frontend terdiri dari folder components, services, data, types, utils, styles, dan imports. Komponen utama yang digunakan antara lain LandingPage, LoginPage, RegisterPage, UserDashboard, AdminDashboard, CheckoutPage, TrackingPage, MedicineDetailPage, MedicineDetailModal, dan FloatingChatbot. Pendekatan component-based memudahkan pemeliharaan kode karena setiap fitur dipisahkan ke dalam komponen yang spesifik.", { indent: true }),
  para("Komponen FloatingChatbot menjadi bagian penting dalam sistem karena menghubungkan user dengan backend NLP. Komponen ini memiliki state untuk status buka/tutup chatbot, pesan input, status loading, status koneksi API, dan daftar percakapan. Ketika user mengirim pesan, komponen ini memanggil fungsi sendChatMessage pada service chatbotAPI.ts untuk mengirim request ke Flask API.", { indent: true }),
  para("Gambar 4.6 Tampilan Landing Page", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan screenshot landing page di sini]", { alignment: AlignmentType.CENTER }),
  para("Gambar 4.7 Tampilan Chatbot AI", { alignment: AlignmentType.CENTER }),
  para("[Tempatkan screenshot chatbot AI di sini]", { alignment: AlignmentType.CENTER }),

  h("4.3.2 Implementasi Backend API", HeadingLevel.HEADING_3),
  para("Backend chatbot dikembangkan menggunakan Flask. File utama backend adalah chatbot_api.py. Backend memuat model NLP dari file chatbot_model.pkl, data obat dari medicines_primary.json, data intent dari intents.json, dan sinonim penyakit dari synonyms_id.json. Backend menyediakan tiga endpoint utama, yaitu /api/chat, /api/health, dan /api/medicines. Endpoint /api/chat menerima pesan pengguna dalam format JSON, melakukan preprocessing, memprediksi intent, menghitung confidence score, dan mengembalikan response beserta data obat jika tersedia.", { indent: true }),
  para("Preprocessing dilakukan dengan mengubah teks menjadi huruf kecil, menghapus karakter non-alfanumerik, dan merapikan spasi. Setelah itu, model melakukan prediksi intent menggunakan pipeline TF-IDF dan SVM. Sistem menerapkan batas minimal confidence sebesar 0,9. Jika confidence di bawah nilai tersebut, sistem memberikan respons bahwa pertanyaan belum dipahami dan meminta pengguna mengulang pertanyaan dengan lebih spesifik.", { indent: true }),

  h("4.3.3 Implementasi Model NLP", HeadingLevel.HEADING_3),
  para("Model NLP pada sistem Apotek Sehat menggunakan pendekatan supervised learning. Dataset intent disimpan dalam file intents.json yang berisi 13 tag intent: salam, perpisahan, tanya_obat, efek_samping, dosis, ketersediaan, komposisi, kegunaan, harga, tidak_tahu, darurat, jam_operasional, dan lokasi. Setiap intent memiliki banyak pattern kalimat dalam bahasa Indonesia natural dan beberapa response template.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [900, 2200, 6260],
    rows: [
      new TableRow({ children: [cell("No", 900, { sh: "D9E2F3", b: true }), cell("Intent", 2200, { sh: "D9E2F3", b: true }), cell("Contoh Pertanyaan", 6260, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 900), cell("salam", 2200, { left: true }), cell("halo, selamat pagi, mau tanya", 6260, { left: true })] }),
      new TableRow({ children: [cell("2", 900), cell("perpisahan", 2200, { left: true }), cell("terima kasih, sampai jumpa, cukup", 6260, { left: true })] }),
      new TableRow({ children: [cell("3", 900), cell("tanya_obat", 2200, { left: true }), cell("obat untuk sakit kepala, saya demam, obat batuk", 6260, { left: true })] }),
      new TableRow({ children: [cell("4", 900), cell("efek_samping", 2200, { left: true }), cell("efek samping paracetamol, apakah ibuprofen aman", 6260, { left: true })] }),
      new TableRow({ children: [cell("5", 900), cell("dosis", 2200, { left: true }), cell("berapa dosis amoxicillin, cara minum ibuprofen", 6260, { left: true })] }),
      new TableRow({ children: [cell("6", 900), cell("ketersediaan", 2200, { left: true }), cell("ada paracetamol, stok ibuprofen", 6260, { left: true })] }),
      new TableRow({ children: [cell("7", 900), cell("komposisi", 2200, { left: true }), cell("komposisi augmentin, kandungan obat", 6260, { left: true })] }),
      new TableRow({ children: [cell("8", 900), cell("kegunaan", 2200, { left: true }), cell("vitamin c untuk apa, kegunaan paracetamol", 6260, { left: true })] }),
      new TableRow({ children: [cell("9", 900), cell("harga", 2200, { left: true }), cell("harga paracetamol, berapa harga obat", 6260, { left: true })] }),
      new TableRow({ children: [cell("10", 900), cell("darurat", 2200, { left: true }), cell("sesak napas, pingsan, keracunan", 6260, { left: true })] }),
      new TableRow({ children: [cell("11", 900), cell("jam_operasional", 2200, { left: true }), cell("jam buka apotek, hari minggu buka", 6260, { left: true })] }),
      new TableRow({ children: [cell("12", 900), cell("lokasi", 2200, { left: true }), cell("lokasi apotek, alamat apotek", 6260, { left: true })] }),
      new TableRow({ children: [cell("13", 900), cell("tidak_tahu", 2200, { left: true }), cell("maksudnya apa, bingung", 6260, { left: true })] }),
    ]
  }),
  empty(),
  para("Pipeline model terdiri dari preprocessing teks, pembobotan kata dengan TF-IDF, dan klasifikasi intent dengan SVM. Jika intent yang terdeteksi adalah tanya_obat, backend mencari obat yang sesuai berdasarkan gejala pada atribut uses dan daftar sinonim penyakit. Hasil pencarian dibatasi menjadi lima kandidat teratas dan dikembalikan ke frontend dalam format JSON.", { indent: true }),

  h("4.3.4 Implementasi Katalog Obat", HeadingLevel.HEADING_3),
  para("Katalog obat pada frontend disimpan dalam file medicines.ts yang berisi struktur data Medicine dengan atribut id, name, category, price, stock, image, photo, description, indication, dosage, ingredients, dan benefits. Data obat yang tersedia mencakup berbagai kategori seperti Flu & Pilek, Obat Batuk, Pereda Nyeri, Lambung, Vitamin, Pencernaan, P3K, Anti Alergi, Anti Gatal, Mata, Anak, dan Salep Kulit.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [700, 3400, 2200, 1300, 1760],
    rows: [
      new TableRow({ children: [cell("No", 700, { sh: "D9E2F3", b: true }), cell("Nama Obat", 3400, { sh: "D9E2F3", b: true }), cell("Kategori", 2200, { sh: "D9E2F3", b: true }), cell("Harga", 1300, { sh: "D9E2F3", b: true }), cell("Indikasi", 1760, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 700), cell("Paracetamol 500mg Tablet 10s", 3400, { left: true }), cell("Pereda Nyeri", 2200), cell("5.500", 1300), cell("Demam dan nyeri", 1760, { left: true })] }),
      new TableRow({ children: [cell("2", 700), cell("Komix Herbal 1 Tube", 3400, { left: true }), cell("Obat Batuk", 2200), cell("3.500", 1300), cell("Batuk", 1760, { left: true })] }),
      new TableRow({ children: [cell("3", 700), cell("Mixagrip Flu 4 Kaplet", 3400, { left: true }), cell("Flu & Pilek", 2200), cell("4.000", 1300), cell("Flu dan pilek", 1760, { left: true })] }),
      new TableRow({ children: [cell("4", 700), cell("Antasida Doen Tablet 10s", 3400, { left: true }), cell("Lambung", 2200), cell("3.500", 1300), cell("Maag", 1760, { left: true })] }),
      new TableRow({ children: [cell("5", 700), cell("Oralit Sachet 200ml", 3400, { left: true }), cell("Pencernaan", 2200), cell("2.000", 1300), cell("Diare", 1760, { left: true })] }),
      new TableRow({ children: [cell("6", 700), cell("Cetirizine 10mg Tablet 10s", 3400, { left: true }), cell("Anti Alergi", 2200), cell("8.000", 1300), cell("Alergi", 1760, { left: true })] }),
      new TableRow({ children: [cell("7", 700), cell("OBH Combi Dewasa 100ml", 3400, { left: true }), cell("Obat Batuk", 2200), cell("39.000", 1300), cell("Batuk berdahak", 1760, { left: true })] }),
    ]
  }),
  empty(),

  h("4.3.5 Implementasi Checkout dan Kurir", HeadingLevel.HEADING_3),
  para("Sistem checkout menyediakan pilihan kurir JNE, J&T, dan SiCepat. Setiap kurir memiliki layanan, biaya, dan estimasi pengiriman yang berbeda. Pengguna dapat memilih layanan sesuai kebutuhan kecepatan pengiriman dan biaya. Sistem juga menyediakan promo gratis ongkir untuk pembelian minimal Rp100.000.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 2500, 2500, 2560],
    rows: [
      new TableRow({ children: [cell("Kurir", 1800, { sh: "D9E2F3", b: true }), cell("Layanan", 2500, { sh: "D9E2F3", b: true }), cell("Harga", 2500, { sh: "D9E2F3", b: true }), cell("Estimasi", 2560, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("JNE", 1800), cell("REG", 2500), cell("Rp15.000", 2500), cell("2-3 hari", 2560)] }),
      new TableRow({ children: [cell("JNE", 1800), cell("YES", 2500), cell("Rp25.000", 2500), cell("1-2 hari", 2560)] }),
      new TableRow({ children: [cell("J&T", 1800), cell("Regular", 2500), cell("Rp12.000", 2500), cell("2-4 hari", 2560)] }),
      new TableRow({ children: [cell("J&T", 1800), cell("Express", 2500), cell("Rp20.000", 2500), cell("1 hari", 2560)] }),
      new TableRow({ children: [cell("SiCepat", 1800), cell("REG", 2500), cell("Rp13.000", 2500), cell("2-3 hari", 2560)] }),
      new TableRow({ children: [cell("SiCepat", 1800), cell("BEST", 2500), cell("Rp18.000", 2500), cell("1-2 hari", 2560)] }),
    ]
  }),
  empty(),

  h("4.4 Pengujian Sistem", HeadingLevel.HEADING_2),
  h("4.4.1 Pengujian Model NLP", HeadingLevel.HEADING_3),
  para("Pengujian model NLP dilakukan menggunakan 20 data uji yang mencakup berbagai intent. Berdasarkan file evaluation_results.json pada project, model menghasilkan akurasi sebesar 0,95 atau 95% dengan rata-rata confidence score sebesar 0,779. Nilai meets_requirement bernilai true, sehingga model telah memenuhi target akurasi minimum yang ditentukan.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [700, 3500, 2000, 1600, 1560],
    rows: [
      new TableRow({ children: [cell("No", 700, { sh: "D9E2F3", b: true }), cell("Query", 3500, { sh: "D9E2F3", b: true }), cell("Expected", 2000, { sh: "D9E2F3", b: true }), cell("Predicted", 1600, { sh: "D9E2F3", b: true }), cell("Confidence", 1560, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 700), cell("obat untuk sakit kepala", 3500, { left: true }), cell("tanya_obat", 2000), cell("tanya_obat", 1600), cell("0,9915", 1560)] }),
      new TableRow({ children: [cell("2", 700), cell("efek samping paracetamol", 3500, { left: true }), cell("efek_samping", 2000), cell("efek_samping", 1600), cell("0,9993", 1560)] }),
      new TableRow({ children: [cell("3", 700), cell("berapa dosis amoxicillin", 3500, { left: true }), cell("dosis", 2000), cell("dosis", 1600), cell("0,9953", 1560)] }),
      new TableRow({ children: [cell("4", 700), cell("komposisi augmentin", 3500, { left: true }), cell("komposisi", 2000), cell("komposisi", 1600), cell("0,9887", 1560)] }),
      new TableRow({ children: [cell("5", 700), cell("kegunaan vitamin c", 3500, { left: true }), cell("kegunaan", 2000), cell("kegunaan", 1600), cell("0,9598", 1560)] }),
      new TableRow({ children: [cell("6", 700), cell("jam buka apotek", 3500, { left: true }), cell("jam_operasional", 2000), cell("jam_operasional", 1600), cell("0,9745", 1560)] }),
      new TableRow({ children: [cell("7", 700), cell("harga paracetamol", 3500, { left: true }), cell("harga", 2000), cell("harga", 1600), cell("0,9834", 1560)] }),
      new TableRow({ children: [cell("8", 700), cell("cara minum ibuprofen", 3500, { left: true }), cell("dosis", 2000), cell("dosis", 1600), cell("0,9983", 1560)] }),
      new TableRow({ children: [cell("9", 700), cell("pusing kepala mau obat apa", 3500, { left: true }), cell("tanya_obat", 2000), cell("tanya_obat", 1600), cell("0,9805", 1560)] }),
      new TableRow({ children: [cell("", 700, { sh: "D9E2F3" }), cell("Akurasi keseluruhan", 3500, { sh: "D9E2F3", b: true, left: true }), cell("", 2000, { sh: "D9E2F3" }), cell("", 1600, { sh: "D9E2F3" }), cell("95%", 1560, { sh: "D9E2F3", b: true })] }),
    ]
  }),
  empty(),
  para("Hasil pengujian menunjukkan bahwa model mampu mengenali intent pengguna dengan baik pada pertanyaan yang memiliki pola jelas, seperti pertanyaan efek samping, dosis, komposisi, kegunaan, harga, dan jam operasional. Beberapa query dengan confidence rendah, seperti “saya demam” atau “obat batuk”, tetap terklasifikasi pada intent yang benar tetapi tidak selalu melewati threshold confidence 0,9. Hal ini menunjukkan bahwa sistem membutuhkan penambahan variasi data latih untuk gejala pendek agar confidence model meningkat.", { indent: true }),

  h("4.4.2 Black Box Testing", HeadingLevel.HEADING_3),
  para("Black Box Testing dilakukan untuk memastikan bahwa setiap fungsi sistem berjalan sesuai dengan input dan output yang diharapkan. Pengujian dilakukan tanpa melihat struktur kode internal, melainkan berdasarkan perilaku sistem dari sisi pengguna.", { indent: true }),
  empty(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [700, 3000, 3500, 2160],
    rows: [
      new TableRow({ children: [cell("No", 700, { sh: "D9E2F3", b: true }), cell("Fitur", 3000, { sh: "D9E2F3", b: true }), cell("Hasil yang Diharapkan", 3500, { sh: "D9E2F3", b: true }), cell("Status", 2160, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 700), cell("Landing Page", 3000, { left: true }), cell("Katalog obat dan tombol chatbot tampil", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("2", 700), cell("Login User", 3000, { left: true }), cell("User masuk ke dashboard user", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("3", 700), cell("Login Admin", 3000, { left: true }), cell("Admin masuk ke dashboard admin", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("4", 700), cell("Chatbot AI", 3000, { left: true }), cell("Sistem memberi respons sesuai intent", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("5", 700), cell("Rekomendasi Obat", 3000, { left: true }), cell("Obat rekomendasi tampil dan dapat diklik", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("6", 700), cell("Detail Obat", 3000, { left: true }), cell("Informasi obat tampil lengkap", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("7", 700), cell("Keranjang", 3000, { left: true }), cell("Obat dapat ditambah dan dihapus", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("8", 700), cell("Checkout", 3000, { left: true }), cell("Alamat, kurir, dan pembayaran dapat diproses", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("9", 700), cell("Tracking", 3000, { left: true }), cell("Timeline pengiriman tampil", 3500, { left: true }), cell("Berhasil", 2160)] }),
      new TableRow({ children: [cell("10", 700), cell("Manajemen Stok", 3000, { left: true }), cell("Admin dapat mengubah stok obat", 3500, { left: true }), cell("Berhasil", 2160)] }),
    ]
  }),
  empty(),

  h("4.5 Pembahasan", HeadingLevel.HEADING_2),
  para("Berdasarkan hasil implementasi dan pengujian, sistem Apotek Sehat berhasil memenuhi tujuan penelitian, yaitu menyediakan website apotek berbasis web dengan fitur rekomendasi obat menggunakan chatbot NLP. Integrasi antara React.js frontend dan Flask backend berjalan melalui REST API. Frontend mampu mengirim input pengguna ke API, menerima respons chatbot, dan menampilkan rekomendasi obat dalam bentuk kartu produk yang dapat diklik menuju halaman detail obat.", { indent: true }),
  para("Dari sisi model NLP, kombinasi TF-IDF dan SVM memberikan hasil yang baik untuk intent recognition, dengan akurasi pengujian sebesar 95%. Hasil ini sejalan dengan penelitian sebelumnya yang menyatakan bahwa pendekatan berbasis machine learning dan rule-based matching dapat digunakan secara efektif dalam chatbot kesehatan dan sistem rekomendasi obat (Firdaus et al., 2024; Aprilia et al., 2024). Namun, hasil evaluasi juga menunjukkan bahwa beberapa query pendek memiliki confidence rendah. Hal ini menjadi catatan bahwa dataset perlu diperluas dengan variasi input bahasa natural yang lebih banyak, terutama untuk gejala singkat seperti demam, batuk, flu, dan alergi.", { indent: true }),
  para("Dari sisi fitur e-commerce, sistem telah menyediakan alur lengkap mulai dari pencarian obat, detail obat, keranjang belanja, checkout, pemilihan kurir, hingga tracking pengiriman. Fitur ini menjadikan sistem tidak hanya sebagai chatbot rekomendasi, tetapi juga sebagai platform transaksi obat online yang terintegrasi. Integrasi ini menjadi keunggulan dibandingkan beberapa penelitian terdahulu yang umumnya hanya berfokus pada sistem pakar rekomendasi obat atau sistem informasi penjualan obat saja.", { indent: true }),
  para("Sistem juga memiliki keterbatasan. Pertama, sistem hanya memberikan rekomendasi awal untuk penyakit ringan dan tidak menggantikan diagnosis dokter. Kedua, data obat masih disimpan dalam file statis JSON/TypeScript sehingga pada implementasi produksi perlu dipindahkan ke database relasional. Ketiga, proses pembayaran dan tracking pengiriman masih bersifat simulasi dan belum terhubung dengan payment gateway atau API ekspedisi resmi. Keempat, model NLP membutuhkan perluasan dataset agar lebih tahan terhadap variasi bahasa, typo, dan kalimat percakapan yang lebih kompleks.", { indent: true }),
  pb()
];

console.log("Bab 4 ready.");
