// ============================================================
// BAB V PENUTUP DAN DAFTAR PUSTAKA
// ============================================================
const bab5Children = [
  h("BAB V PENUTUP", HeadingLevel.HEADING_1),

  h("5.1 Kesimpulan", HeadingLevel.HEADING_2),
  para("Berdasarkan hasil perancangan, implementasi, dan pengujian yang telah dilakukan pada sistem Apotek Sehat, maka dapat diambil beberapa kesimpulan sebagai berikut:", { indent: true }),
  bullet("Website Apotek Sehat berhasil dirancang dan dibangun sebagai sistem informasi apotek berbasis web yang menyediakan fitur katalog obat, pencarian obat, detail obat, keranjang belanja, checkout, pilihan kurir, tracking pengiriman, dashboard user, dan dashboard admin.", "numbers"),
  bullet("Chatbot berbasis Natural Language Processing berhasil diimplementasikan menggunakan backend Flask dan model machine learning dengan pendekatan TF-IDF sebagai ekstraksi fitur serta Support Vector Machine (SVM) sebagai classifier intent. Chatbot mampu mengenali 13 jenis intent percakapan, seperti tanya_obat, dosis, efek_samping, komposisi, kegunaan, harga, darurat, jam_operasional, dan lokasi.", "numbers"),
  bullet("Sistem rekomendasi obat berhasil memberikan rekomendasi berdasarkan gejala yang dimasukkan pengguna melalui chatbot. Rekomendasi ditampilkan dalam bentuk kartu obat yang berisi nama obat, deskripsi, harga, dan stok. Sistem juga dirancang untuk menampilkan daftar obat dengan pengurutan harga dari termurah ke termahal agar pengguna dapat memilih obat sesuai kebutuhan dan kemampuan biaya.", "numbers"),
  bullet("Integrasi antara frontend React.js dan backend Flask berhasil berjalan melalui REST API. Endpoint utama yang digunakan meliputi /api/chat untuk komunikasi chatbot, /api/health untuk pengecekan status API, dan /api/medicines untuk mengambil daftar obat.", "numbers"),
  bullet("Berdasarkan hasil pengujian model NLP, sistem memperoleh akurasi sebesar 95% dari 20 data uji dengan rata-rata confidence score sebesar 0,779. Hasil tersebut menunjukkan bahwa model mampu mengenali intent pengguna dengan baik, meskipun masih terdapat beberapa query pendek yang memiliki confidence rendah.", "numbers"),
  bullet("Hasil Black Box Testing menunjukkan bahwa fitur utama sistem berjalan sesuai dengan kebutuhan, meliputi landing page, login user, login admin, chatbot AI, rekomendasi obat, detail obat, keranjang belanja, checkout, tracking pengiriman, dan manajemen stok admin.", "numbers"),

  h("5.2 Saran", HeadingLevel.HEADING_2),
  para("Berdasarkan hasil penelitian dan keterbatasan sistem yang telah dibangun, terdapat beberapa saran untuk pengembangan sistem lebih lanjut, yaitu:", { indent: true }),
  bullet("Dataset intent dan gejala perlu diperluas dengan variasi kalimat yang lebih banyak, termasuk typo, bahasa sehari-hari, singkatan, dan kombinasi gejala, agar confidence model NLP menjadi lebih stabil.", "numbers"),
  bullet("Data obat sebaiknya dipindahkan dari file statis JSON/TypeScript ke database relasional seperti MySQL atau PostgreSQL agar proses manajemen data obat, stok, harga, dan transaksi menjadi lebih dinamis.", "numbers"),
  bullet("Sistem pembayaran perlu diintegrasikan dengan payment gateway resmi seperti Midtrans, Xendit, atau layanan QRIS agar proses transaksi dapat berjalan secara nyata dan aman.", "numbers"),
  bullet("Fitur tracking pengiriman perlu diintegrasikan dengan API ekspedisi resmi agar nomor resi dan status pengiriman dapat diperbarui secara real-time.", "numbers"),
  bullet("Sistem rekomendasi obat perlu dilengkapi validasi keamanan tambahan, seperti peringatan penggunaan obat untuk ibu hamil, anak-anak, pasien dengan alergi tertentu, dan pasien dengan kondisi medis khusus.", "numbers"),
  bullet("Sistem sebaiknya menyediakan fitur konsultasi dengan apoteker agar rekomendasi obat dari chatbot tetap dapat divalidasi oleh tenaga kefarmasian, terutama pada kasus gejala yang kompleks atau berpotensi darurat.", "numbers"),
  bullet("Untuk pengembangan penelitian berikutnya, sistem dapat ditingkatkan menggunakan model NLP berbasis transformer atau embedding bahasa Indonesia, seperti IndoBERT, agar pemahaman semantik terhadap input pengguna menjadi lebih baik.", "numbers"),
  pb()
];

const daftarPustakaChildren = [
  h("DAFTAR PUSTAKA", HeadingLevel.HEADING_1),
  para("Aprilia, S., Agustin, R., Marthalena, M., Pranatawijaya, V. H., & Priskila, R. (2024). Sistem pakar rekomendasi obat berdasarkan gejala penyakit menular umum di masyarakat menggunakan metode forward chaining. Jurnal Informatika dan Teknik Elektro Terapan, 12(2). https://doi.org/10.23960/jitet.v12i2.4258", { alignment: AlignmentType.LEFT }),
  para("Ariyanto, Y., Farhan, M., Rachmad, F., & Puspitasari, D. (2024). Laravel framework and native PHP: Comparison in the creation of REST API. Matrix: Jurnal Manajemen Teknologi dan Informatika.", { alignment: AlignmentType.LEFT }),
  para("Bangsa, U. H., Nurrizki, K. A., Sumantri, R. B. B., & Ariyanto, A. S. S. (2024). Sistem informasi penjualan dan pemesanan online berbasis web pada Apotek Dua Farma. METHOMIKA: Jurnal Manajemen Informatika & Komputerisasi Akuntansi, 8(2), 164–173. https://doi.org/10.46880/jmika.vol8no2.pp164-173", { alignment: AlignmentType.LEFT }),
  para("Butarbutar, J. M., Darmansah, D., & Amriza, R. N. S. (2022). Perancangan sistem informasi e-catalogue berbasis website menggunakan metode waterfall. Jurnal Sistem Komputer dan Informatika (JSON).", { alignment: AlignmentType.LEFT }),
  para("Cortes, C., & Vapnik, V. (1995). Support-vector networks. Machine Learning, 20, 273–297. https://doi.org/10.1007/BF00994018", { alignment: AlignmentType.LEFT }),
  para("Firdaus, F., Rajagede, R. A., Sari, A., Hanifah, S., & Perwitasari, D. A. (2024). Digital assistant for pharmacists using Indonesian language based on rules and artificial intelligence. International Journal of Engineering, 37(9C). https://doi.org/10.5829/ije.2024.37.09c.04", { alignment: AlignmentType.LEFT }),
  para("Grinberg, M. (2018). Flask web development: Developing web applications with Python (2nd ed.). O’Reilly Media.", { alignment: AlignmentType.LEFT }),
  para("Joachims, T. (1998). Text categorization with support vector machines: Learning with many relevant features. In European Conference on Machine Learning (ECML). Springer.", { alignment: AlignmentType.LEFT }),
  para("Jurafsky, D., & Martin, J. H. (2023). Speech and language processing: An introduction to natural language processing, computational linguistics, and speech recognition (3rd ed. draft). Stanford University.", { alignment: AlignmentType.LEFT }),
  para("Librian, A. (2015). Sastrawi: Indonesian stemmer. GitHub repository. https://github.com/sastrawi/sastrawi", { alignment: AlignmentType.LEFT }),
  para("Miko, M. Y. H., & Ramayanti, D. (2026). Sistem manajemen data obat dan penjualan obat dengan fitur ChatBot-AI berbasis algoritma knowledge-based recommendation. Jurnal Tera, 5(2), 96–115.", { alignment: AlignmentType.LEFT }),
  para("Mulyawan, M., Dana, R. D., Bahtiar, A., & Syed, I. (2024). Optimalisasi layanan kesehatan di puskesmas melalui pengembangan chatbot berbasis web menggunakan Flowise AI. Jurnal Teknologi Informasi dan Multimedia, 6(3). https://doi.org/10.35746/jtim.v6i3.617", { alignment: AlignmentType.LEFT }),
  para("Nisa, K., & Mahendra, R. (2024). Aplikasi kamus obat berbasis web sebagai media swamedikasi. UNISTEK, 11(1).", { alignment: AlignmentType.LEFT }),
  para("Pressman, R. S. (2014). Software engineering: A practitioner’s approach (8th ed.). McGraw-Hill Education.", { alignment: AlignmentType.LEFT }),
  para("Ramos, J. (2003). Using TF-IDF to determine word relevance in document queries. Proceedings of the First Instructional Conference on Machine Learning.", { alignment: AlignmentType.LEFT }),
  para("React Documentation. (2024). React: The library for web and native user interfaces. Meta Open Source. https://react.dev/", { alignment: AlignmentType.LEFT }),
  para("Setiawan, R., Iskandar, R., Madjid, N., & Kusumawardani, R. (2023). Artificial intelligence-based chatbot to support public health services in Indonesia. International Journal of Interactive Mobile Technologies, 17(19).", { alignment: AlignmentType.LEFT }),
  para("Setiawan, I. (2024). Sistem pakar diagnosis balita: Forward chaining dan fuzzy matching untuk validasi gejala. Competitive, 19(2). https://doi.org/10.36618/competitive.v19i2.4039", { alignment: AlignmentType.LEFT }),
  para("Simbolon, R. W., & Komul, T. M. P. (2026). Rancang bangun sistem informasi penjualan obat berbasis website pada Apotek Filia. IKRA-ITH Informatika: Jurnal Komputer dan Informatika, 10(1), 293–303. https://doi.org/10.37817/ikraith-informatika.v10i1.6340", { alignment: AlignmentType.LEFT }),
  para("Syaputri, R. W., Sari, R. P., & Mahawuni, K. W. (2025). Smart Health: Sistem rekomendasi obat berdasarkan gejala dengan pendekatan Word2Vec. Seminar Nasional Sains & Teknologi.", { alignment: AlignmentType.LEFT }),
  para("Yunita, F., Fitri, D., Dzikri, N. A., Arrosyid, M. H., & Fahmi, C. A. (2024). Sistem pakar rekomendasi obat batuk non-resep dokter untuk dewasa dengan menggunakan metode forward chaining. Jurnal SISKOM-KB (Sistem Komputer dan Kecerdasan Buatan), 8(1). https://doi.org/10.47970/siskom-kb.v8i1.703", { alignment: AlignmentType.LEFT }),
  pb()
];

const lampiranChildren = [
  h("LAMPIRAN", HeadingLevel.HEADING_1),
  h("Lampiran 1. Struktur Project APOTEK", HeadingLevel.HEADING_2),
  para("Struktur project APOTEK terdiri dari folder backend, frontend, chatbot, model_training, guidelines, serta file konfigurasi seperti docker-compose.yml, package.json, dan README.md. Folder backend berisi file chatbot_api.py, Dockerfile, requirements.txt, start_api.bat, dan start_api.sh. Folder frontend berisi aplikasi React.js dengan komponen UI, service API, data obat, dan konfigurasi Vite. Folder model_training berisi dataset intent, data obat, sinonim bahasa Indonesia, model chatbot, dan file evaluasi model.", { indent: true }),
  h("Lampiran 2. Endpoint API", HeadingLevel.HEADING_2),
  para("Endpoint POST /api/chat digunakan untuk mengirim pesan pengguna ke chatbot dan menerima response AI. Endpoint GET /api/health digunakan untuk mengecek status API dan model. Endpoint GET /api/medicines digunakan untuk mengambil seluruh data obat dari backend.", { indent: true }),
  h("Lampiran 3. Catatan Penggunaan", HeadingLevel.HEADING_2),
  para("Untuk menjalankan sistem, backend Flask dijalankan pada port 5000, sedangkan frontend React.js dijalankan pada port 5173. Alternatif deployment dapat dilakukan menggunakan Docker Compose yang berisi service backend dan frontend.", { indent: true }),
];

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
const doc = new Document({
  creator: "Y. Dimas Agung Nugroho",
  title: "Skripsi Apotek Sehat",
  description: "Skripsi lengkap Bab 1 sampai Penutup",
  styles: {
    default: {
      document: { run: { font: TNR, size: 24 }, paragraph: { spacing: { line: 360 } } },
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: TNR, size: 28, bold: true }, paragraph: { spacing: { before: 360, after: 160 }, alignment: AlignmentType.CENTER } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: TNR, size: 26, bold: true }, paragraph: { spacing: { before: 240, after: 120 } } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: TNR, size: 24, bold: true }, paragraph: { spacing: { before: 200, after: 100 } } },
    ],
  },
  numbering: {
    config: [
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1)", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, right: 1134, bottom: 1134, left: 1701 },
          size: { orientation: "portrait" },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 22 })] })],
        }),
      },
      children: [
        ...coverChildren,
        ...pengesahanChildren,
        ...abstrakChildren,
        ...kataPengantarChildren,
        ...daftarIsiChildren,
        ...daftarGambarChildren,
        ...daftarTabelChildren,
        ...bab1Children,
        ...bab2Children,
        ...bab3Children,
        ...bab4Children,
        ...bab5Children,
        ...daftarPustakaChildren,
        ...lampiranChildren,
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = "/sessions/cool-dazzling-fermi/mnt/APOTEK/SKRIPSI_Y_DIMAS_APOTEK_SEHAT_BAB_1_SAMPAI_PENUTUP.docx";
  fs.writeFileSync(out, buffer);
  console.log("DONE", out, buffer.length);
});
