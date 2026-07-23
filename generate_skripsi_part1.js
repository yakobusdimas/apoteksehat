#!/usr/bin/env node
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak
} = require("docx");

// ============================================================
// HELPERS
// ============================================================
const bdr = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const bdrs = { top: bdr, bottom: bdr, left: bdr, right: bdr };
const cmargins = { top: 60, bottom: 60, left: 100, right: 100 };
const TNR = "Times New Roman";

function para(text, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: TNR, size: 24 }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") runs.push(new TextRun({ text: t, font: TNR, size: 24 }));
      else runs.push(new TextRun({ font: TNR, size: 24, ...t }));
    });
  }
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    indent: opts.indent ? { firstLine: 720 } : undefined,
    ...opts.paragraphOpts,
    children: runs,
  });
}

function h(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 160 },
    children: [new TextRun({ text, font: TNR, bold: true, size: level === HeadingLevel.HEADING_1 ? 28 : 26 })],
  });
}

function bullet(text, ref, level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 80, line: 360 },
    alignment: AlignmentType.JUSTIFIED,
    children: typeof text === "string"
      ? [new TextRun({ text, font: TNR, size: 24 })]
      : text.map(t => typeof t === "string" ? new TextRun({ text: t, font: TNR, size: 24 }) : new TextRun({ font: TNR, size: 24, ...t })),
  });
}

function empty() { return new Paragraph({ spacing: { after: 0 }, children: [] }); }
function pb()   { return new Paragraph({ children: [new PageBreak()] }); }

function cell(text, w, opts = {}) {
  return new TableCell({
    borders: bdrs, width: { size: w, type: WidthType.DXA }, margins: cmargins,
    shading: opts.sh ? { fill: opts.sh, type: ShadingType.CLEAR } : undefined,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: opts.left ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: { after: 40 },
      children: [new TextRun({ text, font: TNR, size: 20, bold: opts.b || false })] })]
  });
}

// ============================================================
// BUILD DOCUMENT
// ============================================================

// COVER
const coverChildren = [
  ...[...Array(4)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 }, children: [new TextRun({ text: "SKRIPSI", font: TNR, size: 32, bold: true })] }),
  empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240, line: 400 }, children: [new TextRun({ text: "RANCANG BANGUN SISTEM REKOMENDASI OBAT\nBERDASARKAN GEJALA PENGGUNA PADA APOTEK SEHAT\nBERBASIS WEB MENGGUNAKAN METODE\nNATURAL LANGUAGE PROCESSING", font: TNR, size: 28, bold: true })] }),
  ...[...Array(3)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Disusun Oleh:", font: TNR, size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Y. Dimas Agung Nugroho", font: TNR, size: 26, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "NIM: 4.33.22.1.26", font: TNR, size: 24 })] }),
  ...[...Array(4)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "PROGRAM STUDI TEKNOLOGI REKAYASA KOMPUTER", font: TNR, size: 24, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "JURUSAN TEKNIK ELEKTRO", font: TNR, size: 24, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "POLITEKNIK NEGERI SEMARANG", font: TNR, size: 24, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "2026", font: TNR, size: 24 })] }),
  pb()
];

// PENGESAHAN
const pengesahanChildren = [
  ...[...Array(3)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "HALAMAN PENGESAHAN", font: TNR, size: 26, bold: true })] }),
  empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: "Skripsi ini diajukan oleh:", font: TNR, size: 24 })] }),
  empty(),
  para([{ text: "Nama", bold: true }, "          : Y. Dimas Agung Nugroho"], { alignment: AlignmentType.LEFT }),
  para([{ text: "NIM", bold: true }, "             : 4.33.22.1.26"], { alignment: AlignmentType.LEFT }),
  para([{ text: "Program Studi", bold: true }, " : Teknologi Rekayasa Komputer (D4)"], { alignment: AlignmentType.LEFT }),
  para([{ text: "Judul Skripsi", bold: true }, "  : Rancang Bangun Sistem Rekomendasi Obat Berdasarkan Gejala Pengguna pada Apotek Sehat Berbasis Web Menggunakan Metode Natural Language Processing"], { alignment: AlignmentType.LEFT }),
  ...[...Array(2)].map(() => empty()),
  para("Telah berhasil dipertahankan di hadapan Dewan Penguji dan diterima sebagai bagian persyaratan yang diperlukan untuk memperoleh gelar Sarjana Terapan Teknik pada Program Studi Teknologi Rekayasa Komputer, Jurusan Teknik Elektro, Politeknik Negeri Semarang.", { alignment: AlignmentType.LEFT }),
  ...[...Array(3)].map(() => empty()),
  para("Semarang,    Juli 2026", { alignment: AlignmentType.CENTER }),
  para("Menyetujui,", { alignment: AlignmentType.CENTER }),
  empty(), empty(),
  para("Dosen Pembimbing", { alignment: AlignmentType.CENTER }),
  ...[...Array(4)].map(() => empty()),
  para("________________________", { alignment: AlignmentType.CENTER }),
  para("NIP. ........................", { alignment: AlignmentType.CENTER }),
  empty(),
  para("Mengetahui,", { alignment: AlignmentType.CENTER }),
  para("Ketua Program Studi", { alignment: AlignmentType.CENTER }),
  para("Teknologi Rekayasa Komputer", { alignment: AlignmentType.CENTER }),
  ...[...Array(4)].map(() => empty()),
  para("________________________", { alignment: AlignmentType.CENTER }),
  para("NIP. ........................", { alignment: AlignmentType.CENTER }),
  pb()
];

// ABSTRAK
const abstrakChildren = [
  ...[...Array(2)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "ABSTRAK", font: TNR, size: 26, bold: true })] }),
  empty(),
  para("Perkembangan teknologi informasi dan kecerdasan buatan (Artificial Intelligence) membuka peluang untuk meningkatkan akses masyarakat terhadap layanan informasi obat secara digital. Banyak masyarakat yang masih mengalami kesulitan dalam menentukan obat yang tepat berdasarkan gejala penyakit ringan yang dialami, sehingga diperlukan sistem yang mampu memberikan rekomendasi obat secara otomatis dan dapat diakses melalui platform digital.", { indent: true }),
  para("Penelitian ini bertujuan untuk merancang dan membangun sistem rekomendasi obat berbasis web pada Apotek Sehat yang dilengkapi dengan chatbot berbasis Natural Language Processing (NLP). Sistem dikembangkan menggunakan React.js dengan TypeScript pada sisi frontend dan framework Flask dengan Python pada sisi backend API. Model NLP dibangun menggunakan algoritma TF-IDF (Term Frequency-Inverse Document Frequency) sebagai ekstraksi fitur dan Support Vector Machine (SVM) sebagai classifier untuk mengenali 13 jenis intent percakapan pengguna. Data obat yang digunakan mencakup 200+ obat bebas yang dikategorikan dalam 15 kategori dengan informasi meliputi nama, komposisi, indikasi, efek samping, dan harga.", { indent: true }),
  para("Pengembangan sistem menggunakan metode Waterfall dengan tahapan analisis kebutuhan, perancangan sistem, implementasi, pengujian, dan evaluasi. Pengujian model NLP menunjukkan akurasi sebesar 95% dari 20 kasus uji dengan rata-rata confidence score 0,78. Pengujian fungsionalitas sistem menggunakan metode Black Box Testing menunjukkan bahwa seluruh fitur sistem berjalan dengan baik, meliputi konsultasi chatbot AI, rekomendasi obat dengan pengurutan harga terendah, keranjang belanja, checkout dengan pilihan kurir (JNE, J&T, SiCepat), tracking pengiriman, serta dashboard admin untuk manajemen stok obat.", { indent: true }),
  para("Hasil penelitian ini berupa website Apotek Sehat yang menyediakan layanan informasi dan rekomendasi obat berbasis AI serta fitur e-commerce farmasi secara terintegrasi dalam satu platform. Sistem ini diharapkan dapat membantu masyarakat dalam memperoleh informasi obat secara cepat dan tepat serta membantu apotek dalam meningkatkan efisiensi pelayanan kepada pelanggan.", { indent: true }),
  empty(),
  para([{ text: "Kata Kunci: ", bold: true }, "Natural Language Processing, Chatbot, Sistem Rekomendasi Obat, TF-IDF, SVM, React.js, Flask, E-Commerce Apotek"]),
  pb(),

  ...[...Array(2)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "ABSTRACT", font: TNR, size: 26, bold: true })] }),
  empty(),
  para("The advancement of information technology and artificial intelligence (AI) opens opportunities to improve public access to digital drug information services. Many people still experience difficulties in determining the right medication based on mild disease symptoms, thus requiring a system capable of providing automatic drug recommendations accessible through digital platforms.", { indent: true }),
  para("This research aims to design and build a web-based drug recommendation system at Apotek Sehat equipped with a Natural Language Processing (NLP)-based chatbot. The system is developed using React.js with TypeScript on the frontend and Flask framework with Python on the backend API. The NLP model is built using the TF-IDF (Term Frequency-Inverse Document Frequency) algorithm for feature extraction and Support Vector Machine (SVM) as a classifier to recognize 13 types of user conversation intents. The drug data used includes 200+ over-the-counter medicines categorized into 15 categories with information covering name, composition, indications, side effects, and price.", { indent: true }),
  para("The system development uses the Waterfall method with stages of requirements analysis, system design, implementation, testing, and evaluation. NLP model testing shows an accuracy of 95% from 20 test cases with an average confidence score of 0.78. System functionality testing using the Black Box Testing method shows that all system features run well, including AI chatbot consultation, drug recommendations sorted by lowest price, shopping cart, checkout with courier options (JNE, J&T, SiCepat), delivery tracking, and admin dashboard for drug stock management.", { indent: true }),
  para("The result of this research is the Apotek Sehat website that provides AI-based drug information and recommendation services along with integrated pharmaceutical e-commerce features in one platform. This system is expected to help the public obtain drug information quickly and accurately and assist pharmacies in improving service efficiency to customers.", { indent: true }),
  empty(),
  para([{ text: "Keywords: ", bold: true }, "Natural Language Processing, Chatbot, Drug Recommendation System, TF-IDF, SVM, React.js, Flask, E-Commerce Pharmacy"]),
  pb()
];

// KATA PENGANTAR
const kataPengantarChildren = [
  ...[...Array(2)].map(() => empty()),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "KATA PENGANTAR", font: TNR, size: 26, bold: true })] }),
  empty(),
  para("Puji syukur penulis panjatkan kepada Tuhan Yang Maha Esa atas berkat dan rahmat-Nya sehingga penulis dapat menyelesaikan skripsi yang berjudul “Rancang Bangun Sistem Rekomendasi Obat Berdasarkan Gejala Pengguna pada Apotek Sehat Berbasis Web Menggunakan Metode Natural Language Processing”. Skripsi ini disusun sebagai salah satu syarat untuk menyelesaikan pendidikan Diploma IV pada Program Studi Teknologi Rekayasa Komputer, Jurusan Teknik Elektro, Politeknik Negeri Semarang.", { indent: true }),
  para("Dalam penyusunan skripsi ini, penulis mendapatkan banyak bantuan, bimbingan, dan dukungan dari berbagai pihak. Oleh karena itu, pada kesempatan ini penulis ingin menyampaikan ucapan terima kasih yang sebesar-besarnya kepada:", { indent: true }),
  bullet("Orang tua dan keluarga penulis yang senantiasa memberikan doa, dukungan moral, dan materiil selama masa perkuliahan hingga penyelesaian skripsi ini.", "numbers"),
  bullet("Dosen Pembimbing yang telah meluangkan waktu, tenaga, dan pikiran dalam memberikan bimbingan serta arahan kepada penulis selama proses penyusunan skripsi.", "numbers"),
  bullet("Ketua Program Studi Teknologi Rekayasa Komputer beserta seluruh dosen dan staf Jurusan Teknik Elektro Politeknik Negeri Semarang yang telah memberikan ilmu dan bantuan selama masa perkuliahan.", "numbers"),
  bullet("Pihak Apotek Sehat yang telah memberikan izin serta data yang diperlukan dalam pelaksanaan penelitian ini.", "numbers"),
  bullet("Teman-teman seperjuangan Program Studi Teknologi Rekayasa Komputer angkatan 2022 yang telah memberikan motivasi dan bantuan selama perkuliahan dan penyusunan skripsi.", "numbers"),
  bullet("Semua pihak yang tidak dapat disebutkan satu per satu yang telah membantu kelancaran penyusunan skripsi ini.", "numbers"),
  empty(),
  para("Penulis menyadari bahwa skripsi ini masih memiliki banyak kekurangan dan jauh dari kata sempurna. Oleh karena itu, penulis mengharapkan kritik dan saran yang membangun demi perbaikan di masa yang akan datang. Semoga skripsi ini dapat bermanfaat bagi pembaca dan memberikan kontribusi bagi pengembangan ilmu pengetahuan di bidang teknologi informasi dan kesehatan.", { indent: true }),
  ...[...Array(3)].map(() => empty()),
  para("Semarang,    Juli 2026", { alignment: AlignmentType.RIGHT }),
  empty(), empty(),
  para("Y. Dimas Agung Nugroho", { alignment: AlignmentType.RIGHT }),
  para("NIM. 4.33.22.1.26", { alignment: AlignmentType.RIGHT }),
  pb()
];

// DAFTAR ISI
const daftarIsiChildren = [
  empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "DAFTAR ISI", font: TNR, size: 26, bold: true })] }),
  empty(),
  new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
  pb()
];

// DAFTAR GAMBAR
const daftarGambarChildren = [
  empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "DAFTAR GAMBAR", font: TNR, size: 26, bold: true })] }),
  empty(),
  para("Gambar 2.1  Kerangka Konsep Sistem Apotek Sehat", { alignment: AlignmentType.LEFT }),
  para("Gambar 3.1  Metode Waterfall dalam Pengembangan Sistem", { alignment: AlignmentType.LEFT }),
  para("Gambar 3.2  Diagram Alir Cara Kerja Sistem", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.1  Use Case Diagram Sistem Apotek Sehat", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.2  Activity Diagram Alur Konsultasi Chatbot", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.3  Activity Diagram Alur Pembelian Obat", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.4  Arsitektur Sistem Apotek Sehat", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.5  Entity Relationship Diagram (ERD)", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.6  Tampilan Landing Page", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.7  Tampilan Chatbot AI", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.8  Tampilan Dashboard User", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.9  Tampilan Halaman Checkout", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.10 Tampilan Tracking Pengiriman", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.11 Tampilan Dashboard Admin", { alignment: AlignmentType.LEFT }),
  para("Gambar 4.12 Tampilan Detail Obat", { alignment: AlignmentType.LEFT }),
  pb()
];

// DAFTAR TABEL
const daftarTabelChildren = [
  empty(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "DAFTAR TABEL", font: TNR, size: 26, bold: true })] }),
  empty(),
  para("Tabel 2.1  Penelitian Terdahulu", { alignment: AlignmentType.LEFT }),
  para("Tabel 3.1  Jadwal Penelitian", { alignment: AlignmentType.LEFT }),
  para("Tabel 3.2  Rencana Anggaran Biaya", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.1  Kebutuhan Fungsional Sistem", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.2  Kebutuhan Non-Fungsional Sistem", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.3  Daftar Intent Chatbot", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.4  Katalog Obat Apotek Sehat", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.5  Pilihan Kurir Pengiriman", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.6  Hasil Pengujian Model NLP", { alignment: AlignmentType.LEFT }),
  para("Tabel 4.7  Hasil Black Box Testing", { alignment: AlignmentType.LEFT }),
  pb()
];

console.log("Part 1 (pre-content) ready. Generating full document...");

// ============================================================
// BAB I PENDAHULUAN
// ============================================================
const bab1Children = [
  h("BAB I PENDAHULUAN", HeadingLevel.HEADING_1),

  h("1.1 Latar Belakang", HeadingLevel.HEADING_2),
  para("Perkembangan teknologi informasi telah membawa perubahan besar dalam berbagai sektor kehidupan, termasuk dalam bidang kesehatan. Pemanfaatan teknologi digital memungkinkan masyarakat memperoleh berbagai informasi kesehatan secara lebih cepat dan mudah melalui perangkat yang terhubung dengan jaringan internet. Sistem informasi berbasis web menjadi salah satu media yang banyak digunakan untuk menyediakan layanan kesehatan secara online karena mampu menjangkau pengguna secara luas serta memberikan akses informasi yang lebih efisien dibandingkan dengan layanan konvensional (Setiawan et al., 2023).", { indent: true }),
  para("Meskipun demikian, dalam kehidupan sehari-hari masih banyak masyarakat yang mengalami kesulitan dalam menentukan obat yang tepat berdasarkan gejala penyakit yang dialami. Penyakit ringan seperti demam, batuk, flu, sakit kepala, dan gangguan kesehatan ringan lainnya sering kali ditangani dengan obat bebas yang dapat diperoleh di apotek. Namun, keterbatasan pengetahuan masyarakat mengenai jenis obat serta kegunaannya sering menyebabkan kesalahan dalam pemilihan obat sehingga dapat menimbulkan risiko penggunaan obat yang tidak sesuai (Nisa & Mahendra, 2024).", { indent: true }),
  para("Pada umumnya masyarakat harus datang langsung ke apotek untuk menanyakan obat yang sesuai dengan gejala yang dirasakan. Proses ini terkadang kurang efisien karena membutuhkan waktu dan tenaga, terutama bagi masyarakat yang memiliki keterbatasan akses terhadap layanan kesehatan atau yang membutuhkan informasi obat dengan cepat. Selain itu, tidak semua apotek memiliki sistem informasi digital yang dapat membantu memberikan informasi obat secara cepat kepada masyarakat (Butarbutar et al., 2022).", { indent: true }),
  para("Perkembangan teknologi Artificial Intelligence (AI) memberikan peluang untuk mengatasi permasalahan tersebut melalui sistem yang mampu membantu pengguna dalam memperoleh informasi kesehatan secara otomatis. Artificial Intelligence merupakan teknologi yang memungkinkan komputer melakukan proses analisis data dan memberikan rekomendasi berdasarkan informasi yang diberikan oleh pengguna. Salah satu penerapan teknologi AI yang saat ini banyak digunakan dalam berbagai sistem informasi adalah chatbot, yaitu sistem yang mampu melakukan komunikasi dengan pengguna menggunakan bahasa alami melalui percakapan digital (Firdaus et al., 2024).", { indent: true }),
  para("Chatbot berbasis Artificial Intelligence dapat dimanfaatkan dalam sistem informasi kesehatan untuk membantu pengguna memperoleh informasi terkait gejala penyakit serta rekomendasi obat secara otomatis. Pengguna cukup memasukkan gejala yang dialami melalui sistem chatbot, kemudian sistem akan melakukan proses analisis berdasarkan basis data gejala dan obat yang tersedia untuk memberikan rekomendasi yang sesuai (Miko & Ramayanti, 2026).", { indent: true }),
  para("Selain penggunaan chatbot, sistem rekomendasi obat berdasarkan gejala juga dapat membantu meningkatkan kualitas layanan informasi kesehatan secara digital. Sistem rekomendasi bekerja dengan mencocokkan gejala yang dimasukkan oleh pengguna dengan data penyakit serta obat yang tersedia dalam basis data sistem sehingga pengguna dapat memperoleh rekomendasi obat yang relevan dengan kondisi yang dialami. Pendekatan ini telah banyak digunakan dalam berbagai sistem kesehatan digital untuk membantu pengguna memperoleh solusi awal terhadap permasalahan kesehatan ringan secara lebih efisien (Aprilia et al., 2024; Yunita et al., 2024).", { indent: true }),
  para("Untuk mendukung pengembangan sistem berbasis web yang terstruktur dan mudah dikelola, pemilihan teknologi yang tepat menjadi hal yang penting. React.js yang dikombinasikan dengan TypeScript merupakan framework frontend modern yang menyediakan arsitektur component-based sehingga memudahkan pengembangan antarmuka pengguna yang interaktif dan responsif. Sementara itu, framework Flask dengan Python digunakan sebagai backend API yang menyediakan endpoint untuk layanan chatbot AI dan manajemen data obat. Kombinasi kedua teknologi ini memungkinkan integrasi sistem NLP dengan antarmuka web modern secara efisien (Ariyanto et al., 2024; Simbolon & Komul, 2026).", { indent: true }),
  para("Oleh karena itu, penelitian ini bertujuan untuk merancang dan membangun website Apotek Sehat berbasis React.js dan Flask yang dilengkapi dengan sistem chatbot berbasis Natural Language Processing untuk memberikan rekomendasi obat berdasarkan gejala pengguna. Sistem ini diharapkan dapat membantu masyarakat memperoleh informasi obat dengan lebih cepat, mudah, dan efisien melalui layanan digital, serta membantu apotek dalam mengelola layanan informasi dan penjualan obat secara online.", { indent: true }),

  h("1.2 Rumusan Masalah", HeadingLevel.HEADING_2),
  para("Berdasarkan latar belakang yang telah dijelaskan, rumusan masalah dalam skripsi ini adalah sebagai berikut:", { indent: true }),
  bullet("Bagaimana merancang dan membangun website Apotek Sehat berbasis React.js dan Flask yang dapat digunakan pengguna untuk mencari informasi serta membeli obat secara online?", "numbers"),
  bullet("Bagaimana mengimplementasikan chatbot berbasis Natural Language Processing pada website Apotek Sehat untuk memberikan rekomendasi obat berdasarkan gejala yang dimasukkan oleh pengguna?", "numbers"),
  bullet("Bagaimana sistem dapat menampilkan daftar obat yang direkomendasikan oleh chatbot berdasarkan gejala pengguna dengan pengurutan harga secara otomatis dari harga terendah hingga harga tertinggi?", "numbers"),
  bullet("Bagaimana sistem website apotek dapat menyediakan proses transaksi pembelian obat secara online mulai dari penambahan obat ke keranjang, proses pembayaran, pemilihan jasa pengiriman, hingga proses tracking pengiriman obat kepada pengguna?", "numbers"),

  h("1.3 Batasan Masalah", HeadingLevel.HEADING_2),
  para("Dalam pembuatan skripsi ini, masalah yang akan dibahas terbatas pada beberapa faktor, antara lain:", { indent: true }),
  bullet("Sistem yang dikembangkan berupa website Apotek Sehat berbasis React.js dan Flask yang menyediakan informasi obat serta fitur pembelian obat secara online.", "numbers"),
  bullet("Sistem chatbot menggunakan model NLP dengan algoritma TF-IDF dan Support Vector Machine (SVM) untuk mengenali intent pengguna dan memberikan rekomendasi obat berdasarkan gejala.", "numbers"),
  bullet("Sistem hanya memberikan rekomendasi awal dan tidak menggantikan diagnosis dokter.", "numbers"),
  bullet("Rekomendasi obat yang diberikan oleh sistem hanya untuk penyakit ringan dan daftar obat ditampilkan dengan urutan harga dari termurah hingga termahal untuk obat yang diperjualbelikan secara bebas (OTC).", "numbers"),
  bullet("Sistem mensimulasikan proses transaksi pembelian obat mulai dari pemilihan obat, keranjang belanja, pembayaran, hingga tracking pengiriman obat kepada pengguna.", "numbers"),

  h("1.4 Tujuan Penelitian", HeadingLevel.HEADING_2),
  para("Tujuan dilakukannya penelitian ini adalah:", { indent: true }),
  bullet("Merancang dan membangun website Apotek Sehat berbasis React.js dan Flask yang dapat digunakan sebagai media informasi dan transaksi obat secara online oleh masyarakat umum.", "numbers"),
  bullet("Mengimplementasikan chatbot berbasis Natural Language Processing pada website Apotek Sehat untuk membantu pengguna melakukan konsultasi sederhana berdasarkan gejala yang dialami.", "numbers"),
  bullet("Mengembangkan sistem rekomendasi obat berdasarkan gejala pengguna yang dimasukkan melalui chatbot sehingga sistem dapat memberikan saran obat yang sesuai dengan pengurutan harga terendah.", "numbers"),
  bullet("Menghasilkan sistem informasi apotek yang dapat membantu pengguna memperoleh informasi obat serta melakukan pembelian obat secara cepat, mudah, dan efisien melalui website.", "numbers"),

  h("1.5 Manfaat Penelitian", HeadingLevel.HEADING_2),
  para("Manfaat penelitian ini adalah:", { indent: true }),
  h("1.5.1 Manfaat bagi Masyarakat", HeadingLevel.HEADING_3),
  para("Penelitian ini diharapkan dapat memberikan kemudahan bagi masyarakat dalam memperoleh informasi mengenai obat serta rekomendasi obat yang sesuai berdasarkan gejala yang dialami melalui website Apotek Sehat yang dilengkapi dengan chatbot berbasis Natural Language Processing. Dengan adanya sistem ini, masyarakat dapat memperoleh informasi kesehatan secara lebih cepat, mudah, dan praktis tanpa harus datang langsung ke apotek atau fasilitas kesehatan. Selain itu, sistem ini juga dapat membantu masyarakat dalam melakukan swamedikasi secara lebih tepat dengan memberikan informasi awal mengenai jenis obat yang sesuai dengan gejala penyakit ringan yang dialami (Nisa & Mahendra, 2024).", { indent: true }),

  h("1.5.2 Manfaat bagi Apotek", HeadingLevel.HEADING_3),
  para("Penelitian ini diharapkan dapat membantu Apotek Sehat dalam meningkatkan kualitas pelayanan kepada pelanggan melalui pemanfaatan teknologi digital berbasis website. Dengan adanya sistem rekomendasi obat yang dilengkapi chatbot NLP, apotek dapat memberikan layanan informasi obat secara lebih cepat, efisien, dan responsif kepada masyarakat. Selain itu, sistem ini juga membantu apotek dalam mengelola informasi obat secara lebih terstruktur, meningkatkan efisiensi operasional, dan memperluas jangkauan pelanggan melalui platform e-commerce (Simbolon & Komul, 2026; Butarbutar et al., 2022).", { indent: true }),

  h("1.5.3 Manfaat bagi Peneliti", HeadingLevel.HEADING_3),
  para("Penelitian ini diharapkan dapat menambah wawasan serta pengalaman peneliti dalam mengembangkan sistem informasi berbasis web menggunakan React.js dan Flask serta mengimplementasikan teknologi Natural Language Processing dalam bentuk chatbot. Selain itu, penelitian ini memberikan pengalaman dalam merancang dan mengembangkan sistem rekomendasi obat berbasis gejala yang dapat digunakan sebagai media informasi kesehatan bagi masyarakat. Melalui penelitian ini, peneliti juga dapat meningkatkan kemampuan dalam analisis sistem, perancangan database, pengembangan aplikasi web full-stack, serta penerapan teknologi AI dalam bidang kesehatan digital.", { indent: true }),

  h("1.6 Sistematika Penulisan", HeadingLevel.HEADING_2),
  para("Sistematika penulisan skripsi ini disusun sebagai berikut:", { indent: true }),
  para([{ text: "BAB I PENDAHULUAN", bold: true }, ", berisi latar belakang masalah, rumusan masalah, batasan masalah, tujuan penelitian, manfaat penelitian, dan sistematika penulisan."], { indent: true }),
  para([{ text: "BAB II TINJAUAN KEPUSTAKAAN", bold: true }, ", berisi tinjauan teori yang mendukung penelitian, penelitian terdahulu yang relevan, dan kerangka konsep penelitian."], { indent: true }),
  para([{ text: "BAB III METODE PENELITIAN", bold: true }, ", berisi jenis penelitian, tempat dan waktu penelitian, metode pengumpulan data, tahapan pengembangan sistem, cara kerja sistem, dan rencana anggaran biaya."], { indent: true }),
  para([{ text: "BAB IV HASIL DAN PEMBAHASAN", bold: true }, ", berisi analisis kebutuhan sistem, perancangan sistem (UML, ERD, arsitektur), implementasi sistem, pengujian sistem, dan pembahasan hasil."], { indent: true }),
  para([{ text: "BAB V PENUTUP", bold: true }, ", berisi kesimpulan dari hasil penelitian dan saran untuk pengembangan lebih lanjut."], { indent: true }),
  pb()
];

console.log("Bab 1 ready.");
