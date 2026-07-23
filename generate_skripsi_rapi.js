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
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [509, 1695, 2544, 1492, 1697],
    rows: [
      new TableRow({ children: [
        cell("No", 509, { sh: "D9E2F3", b: true }),
        cell("Penulis/Tahun", 1695, { sh: "D9E2F3", b: true }),
        cell("Judul Penelitian", 2544, { sh: "D9E2F3", b: true }),
        cell("Metode", 1492, { sh: "D9E2F3", b: true }),
        cell("Hasil Penelitian", 1697, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [
        cell("1", 509), cell("Aprilia et al. (2024)", 1695, { left: true }),
        cell("Sistem Pakar Rekomendasi Obat Berdasarkan Gejala Penyakit Menular Umum", 2544, { left: true }),
        cell("Forward Chaining", 1492),
        cell("Sistem merekomendasikan obat berdasarkan gejala dengan aturan IF-THEN", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("2", 509), cell("Yunita et al. (2024)", 1695, { left: true }),
        cell("Sistem Pakar Rekomendasi Obat Batuk Non-Resep untuk Dewasa", 2544, { left: true }),
        cell("Forward Chaining", 1492),
        cell("Rekomendasi obat batuk bebas sesuai gejala dengan output terstruktur", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("3", 509), cell("Syaputri et al. (2025)", 1695, { left: true }),
        cell("Smart Health: Sistem Rekomendasi Obat Berdasarkan Gejala dengan Word2Vec", 2544, { left: true }),
        cell("NLP (Word2Vec)", 1492),
        cell("Sistem memahami gejala berbasis kemiripan semantik kata", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("4", 509), cell("Firdaus et al. (2024)", 1695, { left: true }),
        cell("Digital Assistant for Pharmacists Using Indonesian Language Based on Rules and AI", 2544, { left: true }),
        cell("Regex + Forward Chaining", 1492),
        cell("Chatbot farmasi dengan akurasi ekstraksi informasi 81,54%", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("5", 509), cell("Miko & Ramayanti (2026)", 1695, { left: true }),
        cell("Sistem Manajemen Data Obat dan Penjualan Obat dengan ChatBot-AI", 2544, { left: true }),
        cell("Knowledge-Based", 1492),
        cell("Sistem e-commerce apotek dengan rekomendasi berbasis pengetahuan", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("6", 509), cell("Simbolon & Komul (2026)", 1695, { left: true }),
        cell("Rancang Bangun Sistem Informasi Penjualan Obat Berbasis Website pada Apotek Filia", 2544, { left: true }),
        cell("Laravel + MySQL", 1492),
        cell("Sistem penjualan obat dengan keranjang belanja, checkout, dan manajemen stok", 2000, { left: true }),
      ]}),
      new TableRow({ children: [
        cell("7", 509), cell("Setiawan et al. (2023)", 1695, { left: true }),
        cell("AI-Based Chatbot to Support Public Health Services in Indonesia", 2544, { left: true }),
        cell("Graph Master Matching", 1492),
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
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [509, 3052, 875, 875, 875, 875, 876],
    rows: [
      new TableRow({ children: [
        cell("No", 509, { sh: "D9E2F3", b: true }),
        cell("Kegiatan", 3052, { sh: "D9E2F3", b: true }),
        cell("Maret", 875, { sh: "D9E2F3", b: true }),
        cell("April", 875, { sh: "D9E2F3", b: true }),
        cell("Mei", 875, { sh: "D9E2F3", b: true }),
        cell("Juni", 875, { sh: "D9E2F3", b: true }),
        cell("Juli", 875, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [cell("1", 509), cell("Studi Literatur dan Observasi", 3052, { left: true }), cell("✓", 875), cell("", 875), cell("", 875), cell("", 875), cell("", 875)] }),
      new TableRow({ children: [cell("2", 509), cell("Pengumpulan Data", 3052, { left: true }), cell("✓", 875), cell("✓", 875), cell("", 875), cell("", 875), cell("", 875)] }),
      new TableRow({ children: [cell("3", 509), cell("Perancangan Sistem & UI/UX", 3052, { left: true }), cell("", 875), cell("✓", 875), cell("✓", 875), cell("", 875), cell("", 875)] }),
      new TableRow({ children: [cell("4", 509), cell("Implementasi Frontend (React.js)", 3052, { left: true }), cell("", 875), cell("", 875), cell("✓", 875), cell("✓", 875), cell("", 875)] }),
      new TableRow({ children: [cell("5", 509), cell("Implementasi Backend API (Flask)", 3052, { left: true }), cell("", 875), cell("", 875), cell("✓", 875), cell("✓", 875), cell("", 875)] }),
      new TableRow({ children: [cell("6", 509), cell("Training Model NLP (TF-IDF + SVM)", 3052, { left: true }), cell("", 875), cell("", 875), cell("✓", 875), cell("✓", 875), cell("", 875)] }),
      new TableRow({ children: [cell("7", 509), cell("Integrasi Chatbot NLP", 3052, { left: true }), cell("", 875), cell("", 875), cell("", 875), cell("✓", 875), cell("", 875)] }),
      new TableRow({ children: [cell("8", 600), cell("Pengujian dan Evaluasi Sistem", 3052, { left: true }), cell("", 875), cell("", 875), cell("", 875), cell("✓", 875), cell("", 875)] }),
      new TableRow({ children: [cell("9", 600), cell("Penyusunan Laporan", 3052, { left: true }), cell("", 875), cell("", 875), cell("", 875), cell("", 875), cell("✓", 875)] }),
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
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [509, 4239, 1492, 1697],
    rows: [
      new TableRow({ children: [
        cell("No", 509, { sh: "D9E2F3", b: true }),
        cell("Nama Kebutuhan", 4239, { sh: "D9E2F3", b: true }),
        cell("Volume/Satuan", 1760, { sh: "D9E2F3", b: true }),
        cell("Total Harga (Rp)", 2000, { sh: "D9E2F3", b: true }),
      ]}),
      new TableRow({ children: [cell("1", 509), cell("Domain (.com/.id)", 4239, { left: true }), cell("1 Tahun", 1760), cell("100.000", 2000)] }),
      new TableRow({ children: [cell("2", 509), cell("Cloud Hosting/VPS", 4239, { left: true }), cell("1 Tahun", 1760), cell("400.000", 2000)] }),
      new TableRow({ children: [cell("3", 509), cell("Biaya Operasional (Cetak, Jilid, Internet)", 4239, { left: true }), cell("Paket", 1760), cell("350.000", 2000)] }),
      new TableRow({ children: [
        cell("", 509, { sh: "D9E2F3" }),
        cell("TOTAL BIAYA", 4239, { sh: "D9E2F3", b: true, left: true }),
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
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [763, 2544, 4630],
    rows: [
      new TableRow({ children: [cell("Kode", 763, { sh: "D9E2F3", b: true }), cell("Kebutuhan", 2544, { sh: "D9E2F3", b: true }), cell("Deskripsi", 4630, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("KF-01", 763), cell("Autentikasi", 2544, { left: true }), cell("Sistem menyediakan fitur login admin dan login/register pengguna.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-02", 763), cell("Katalog Obat", 2544, { left: true }), cell("Sistem menampilkan daftar obat, kategori, harga, stok, gambar, deskripsi, indikasi, dan dosis.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-03", 763), cell("Pencarian dan Filter", 2544, { left: true }), cell("Sistem memungkinkan pengguna mencari obat berdasarkan nama dan memfilter berdasarkan kategori.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-04", 763), cell("Chatbot AI", 2544, { left: true }), cell("Sistem menerima input gejala pengguna dan memberikan respons berbasis intent NLP.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-05", 763), cell("Rekomendasi Obat", 2544, { left: true }), cell("Sistem menampilkan rekomendasi obat berdasarkan gejala dan mengurutkan obat dari harga termurah ke termahal.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-06", 763), cell("Keranjang Belanja", 2544, { left: true }), cell("Pengguna dapat menambahkan, mengubah jumlah, dan menghapus obat dari keranjang.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-07", 763), cell("Checkout", 2544, { left: true }), cell("Pengguna dapat mengisi alamat, memilih kurir, dan mengonfirmasi pembayaran.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-08", 763), cell("Tracking", 2544, { left: true }), cell("Pengguna dapat melihat status pengiriman secara bertahap.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KF-09", 763), cell("Dashboard Admin", 2544, { left: true }), cell("Admin dapat mengelola stok, melihat transaksi, dan memantau statistik penjualan.", 4630, { left: true })] }),
    ]
  }),
  empty(),

  h("4.1.3 Kebutuhan Non-Fungsional", HeadingLevel.HEADING_3),
  para("Kebutuhan non-fungsional menjelaskan kualitas sistem yang harus dipenuhi agar sistem nyaman, aman, dan efektif digunakan. Kebutuhan non-fungsional website Apotek Sehat ditunjukkan pada Tabel 4.2.", { indent: true }),
  empty(),
  new Table({
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [763, 2544, 4630],
    rows: [
      new TableRow({ children: [cell("Kode", 763, { sh: "D9E2F3", b: true }), cell("Kebutuhan", 2544, { sh: "D9E2F3", b: true }), cell("Deskripsi", 4630, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("KNF-01", 763), cell("Usability", 2544, { left: true }), cell("Antarmuka harus mudah digunakan oleh pengguna umum dengan desain responsif.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KNF-02", 763), cell("Performance", 2544, { left: true }), cell("API chatbot harus merespons dalam waktu wajar, dengan timeout 10 detik pada frontend.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KNF-03", 763), cell("Availability", 2544, { left: true }), cell("Sistem menyediakan indikator status API: Online, AI Sedang Berpikir, dan API Offline.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KNF-04", 763), cell("Maintainability", 2544, { left: true }), cell("Kode dipisahkan menjadi komponen, service, data, types, dan utilities agar mudah dipelihara.", 4630, { left: true })] }),
      new TableRow({ children: [cell("KNF-05", 763), cell("Portability", 2544, { left: true }), cell("Sistem dapat dijalankan melalui Docker Compose dengan service frontend dan backend.", 4630, { left: true })] }),
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
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [763, 1866, 5308],
    rows: [
      new TableRow({ children: [cell("No", 763, { sh: "D9E2F3", b: true }), cell("Intent", 1866, { sh: "D9E2F3", b: true }), cell("Contoh Pertanyaan", 5308, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 763), cell("salam", 1866, { left: true }), cell("halo, selamat pagi, mau tanya", 5308, { left: true })] }),
      new TableRow({ children: [cell("2", 763), cell("perpisahan", 1866, { left: true }), cell("terima kasih, sampai jumpa, cukup", 5308, { left: true })] }),
      new TableRow({ children: [cell("3", 763), cell("tanya_obat", 1866, { left: true }), cell("obat untuk sakit kepala, saya demam, obat batuk", 5308, { left: true })] }),
      new TableRow({ children: [cell("4", 763), cell("efek_samping", 1866, { left: true }), cell("efek samping paracetamol, apakah ibuprofen aman", 5308, { left: true })] }),
      new TableRow({ children: [cell("5", 763), cell("dosis", 1866, { left: true }), cell("berapa dosis amoxicillin, cara minum ibuprofen", 5308, { left: true })] }),
      new TableRow({ children: [cell("6", 763), cell("ketersediaan", 1866, { left: true }), cell("ada paracetamol, stok ibuprofen", 5308, { left: true })] }),
      new TableRow({ children: [cell("7", 763), cell("komposisi", 1866, { left: true }), cell("komposisi augmentin, kandungan obat", 5308, { left: true })] }),
      new TableRow({ children: [cell("8", 763), cell("kegunaan", 1866, { left: true }), cell("vitamin c untuk apa, kegunaan paracetamol", 5308, { left: true })] }),
      new TableRow({ children: [cell("9", 763), cell("harga", 1866, { left: true }), cell("harga paracetamol, berapa harga obat", 5308, { left: true })] }),
      new TableRow({ children: [cell("10", 763), cell("darurat", 1866, { left: true }), cell("sesak napas, pingsan, keracunan", 5308, { left: true })] }),
      new TableRow({ children: [cell("11", 763), cell("jam_operasional", 1866, { left: true }), cell("jam buka apotek, hari minggu buka", 5308, { left: true })] }),
      new TableRow({ children: [cell("12", 763), cell("lokasi", 1866, { left: true }), cell("lokasi apotek, alamat apotek", 5308, { left: true })] }),
      new TableRow({ children: [cell("13", 763), cell("tidak_tahu", 1866, { left: true }), cell("maksudnya apa, bingung", 5308, { left: true })] }),
    ]
  }),
  empty(),
  para("Pipeline model terdiri dari preprocessing teks, pembobotan kata dengan TF-IDF, dan klasifikasi intent dengan SVM. Jika intent yang terdeteksi adalah tanya_obat, backend mencari obat yang sesuai berdasarkan gejala pada atribut uses dan daftar sinonim penyakit. Hasil pencarian dibatasi menjadi lima kandidat teratas dan dikembalikan ke frontend dalam format JSON.", { indent: true }),

  h("4.3.4 Implementasi Katalog Obat", HeadingLevel.HEADING_3),
  para("Katalog obat pada frontend disimpan dalam file medicines.ts yang berisi struktur data Medicine dengan atribut id, name, category, price, stock, image, photo, description, indication, dosage, ingredients, dan benefits. Data obat yang tersedia mencakup berbagai kategori seperti Flu & Pilek, Obat Batuk, Pereda Nyeri, Lambung, Vitamin, Pencernaan, P3K, Anti Alergi, Anti Gatal, Mata, Anak, dan Salep Kulit.", { indent: true }),
  empty(),
  new Table({
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [594, 2883, 1866, 1102, 1492],
    rows: [
      new TableRow({ children: [cell("No", 594, { sh: "D9E2F3", b: true }), cell("Nama Obat", 2883, { sh: "D9E2F3", b: true }), cell("Kategori", 1866, { sh: "D9E2F3", b: true }), cell("Harga", 1102, { sh: "D9E2F3", b: true }), cell("Indikasi", 1760, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 594), cell("Paracetamol 500mg Tablet 10s", 2883, { left: true }), cell("Pereda Nyeri", 1866), cell("5.500", 1102), cell("Demam dan nyeri", 1760, { left: true })] }),
      new TableRow({ children: [cell("2", 594), cell("Komix Herbal 1 Tube", 2883, { left: true }), cell("Obat Batuk", 1866), cell("3.500", 1102), cell("Batuk", 1760, { left: true })] }),
      new TableRow({ children: [cell("3", 594), cell("Mixagrip Flu 4 Kaplet", 2883, { left: true }), cell("Flu & Pilek", 1866), cell("4.000", 1102), cell("Flu dan pilek", 1760, { left: true })] }),
      new TableRow({ children: [cell("4", 594), cell("Antasida Doen Tablet 10s", 2883, { left: true }), cell("Lambung", 1866), cell("3.500", 1102), cell("Maag", 1760, { left: true })] }),
      new TableRow({ children: [cell("5", 594), cell("Oralit Sachet 200ml", 2883, { left: true }), cell("Pencernaan", 1866), cell("2.000", 1102), cell("Diare", 1760, { left: true })] }),
      new TableRow({ children: [cell("6", 594), cell("Cetirizine 10mg Tablet 10s", 2883, { left: true }), cell("Anti Alergi", 1866), cell("8.000", 1102), cell("Alergi", 1760, { left: true })] }),
      new TableRow({ children: [cell("7", 594), cell("OBH Combi Dewasa 100ml", 2883, { left: true }), cell("Obat Batuk", 1866), cell("39.000", 1102), cell("Batuk berdahak", 1760, { left: true })] }),
    ]
  }),
  empty(),

  h("4.3.5 Implementasi Checkout dan Kurir", HeadingLevel.HEADING_3),
  para("Sistem checkout menyediakan pilihan kurir JNE, J&T, dan SiCepat. Setiap kurir memiliki layanan, biaya, dan estimasi pengiriman yang berbeda. Pengguna dapat memilih layanan sesuai kebutuhan kecepatan pengiriman dan biaya. Sistem juga menyediakan promo gratis ongkir untuk pembelian minimal Rp100.000.", { indent: true }),
  empty(),
  new Table({
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [1526, 2119, 2119, 2173],
    rows: [
      new TableRow({ children: [cell("Kurir", 1526, { sh: "D9E2F3", b: true }), cell("Layanan", 2119, { sh: "D9E2F3", b: true }), cell("Harga", 2119, { sh: "D9E2F3", b: true }), cell("Estimasi", 2173, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("JNE", 1526), cell("REG", 2119), cell("Rp15.000", 2119), cell("2-3 hari", 2173)] }),
      new TableRow({ children: [cell("JNE", 1526), cell("YES", 2119), cell("Rp25.000", 2119), cell("1-2 hari", 2173)] }),
      new TableRow({ children: [cell("J&T", 1526), cell("Regular", 2119), cell("Rp12.000", 2119), cell("2-4 hari", 2173)] }),
      new TableRow({ children: [cell("J&T", 1526), cell("Express", 2119), cell("Rp20.000", 2119), cell("1 hari", 2173)] }),
      new TableRow({ children: [cell("SiCepat", 1526), cell("REG", 2119), cell("Rp13.000", 2119), cell("2-3 hari", 2173)] }),
      new TableRow({ children: [cell("SiCepat", 1526), cell("BEST", 2119), cell("Rp18.000", 2119), cell("1-2 hari", 2173)] }),
    ]
  }),
  empty(),

  h("4.4 Pengujian Sistem", HeadingLevel.HEADING_2),
  h("4.4.1 Pengujian Model NLP", HeadingLevel.HEADING_3),
  para("Pengujian model NLP dilakukan menggunakan 20 data uji yang mencakup berbagai intent. Berdasarkan file evaluation_results.json pada project, model menghasilkan akurasi sebesar 0,95 atau 95% dengan rata-rata confidence score sebesar 0,779. Nilai meets_requirement bernilai true, sehingga model telah memenuhi target akurasi minimum yang ditentukan.", { indent: true }),
  empty(),
  new Table({
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [594, 2968, 1695, 1356, 1324],
    rows: [
      new TableRow({ children: [cell("No", 594, { sh: "D9E2F3", b: true }), cell("Query", 2968, { sh: "D9E2F3", b: true }), cell("Expected", 2000, { sh: "D9E2F3", b: true }), cell("Predicted", 1356, { sh: "D9E2F3", b: true }), cell("Confidence", 1324, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 594), cell("obat untuk sakit kepala", 2968, { left: true }), cell("tanya_obat", 2000), cell("tanya_obat", 1356), cell("0,9915", 1324)] }),
      new TableRow({ children: [cell("2", 594), cell("efek samping paracetamol", 2968, { left: true }), cell("efek_samping", 2000), cell("efek_samping", 1356), cell("0,9993", 1324)] }),
      new TableRow({ children: [cell("3", 594), cell("berapa dosis amoxicillin", 2968, { left: true }), cell("dosis", 2000), cell("dosis", 1356), cell("0,9953", 1324)] }),
      new TableRow({ children: [cell("4", 594), cell("komposisi augmentin", 2968, { left: true }), cell("komposisi", 2000), cell("komposisi", 1356), cell("0,9887", 1324)] }),
      new TableRow({ children: [cell("5", 594), cell("kegunaan vitamin c", 2968, { left: true }), cell("kegunaan", 2000), cell("kegunaan", 1356), cell("0,9598", 1324)] }),
      new TableRow({ children: [cell("6", 594), cell("jam buka apotek", 2968, { left: true }), cell("jam_operasional", 2000), cell("jam_operasional", 1356), cell("0,9745", 1324)] }),
      new TableRow({ children: [cell("7", 594), cell("harga paracetamol", 2968, { left: true }), cell("harga", 2000), cell("harga", 1356), cell("0,9834", 1324)] }),
      new TableRow({ children: [cell("8", 594), cell("cara minum ibuprofen", 2968, { left: true }), cell("dosis", 2000), cell("dosis", 1356), cell("0,9983", 1324)] }),
      new TableRow({ children: [cell("9", 594), cell("pusing kepala mau obat apa", 2968, { left: true }), cell("tanya_obat", 2000), cell("tanya_obat", 1356), cell("0,9805", 1324)] }),
      new TableRow({ children: [cell("", 594, { sh: "D9E2F3" }), cell("Akurasi keseluruhan", 2968, { sh: "D9E2F3", b: true, left: true }), cell("", 2000, { sh: "D9E2F3" }), cell("", 1356, { sh: "D9E2F3" }), cell("95%", 1324, { sh: "D9E2F3", b: true })] }),
    ]
  }),
  empty(),
  para("Hasil pengujian menunjukkan bahwa model mampu mengenali intent pengguna dengan baik pada pertanyaan yang memiliki pola jelas, seperti pertanyaan efek samping, dosis, komposisi, kegunaan, harga, dan jam operasional. Beberapa query dengan confidence rendah, seperti “saya demam” atau “obat batuk”, tetap terklasifikasi pada intent yang benar tetapi tidak selalu melewati threshold confidence 0,9. Hal ini menunjukkan bahwa sistem membutuhkan penambahan variasi data latih untuk gejala pendek agar confidence model meningkat.", { indent: true }),

  h("4.4.2 Black Box Testing", HeadingLevel.HEADING_3),
  para("Black Box Testing dilakukan untuk memastikan bahwa setiap fungsi sistem berjalan sesuai dengan input dan output yang diharapkan. Pengujian dilakukan tanpa melihat struktur kode internal, melainkan berdasarkan perilaku sistem dari sisi pengguna.", { indent: true }),
  empty(),
  new Table({
    width: { size: 7937, type: WidthType.DXA },
    columnWidths: [594, 2544, 2968, 1831],
    rows: [
      new TableRow({ children: [cell("No", 594, { sh: "D9E2F3", b: true }), cell("Fitur", 2544, { sh: "D9E2F3", b: true }), cell("Hasil yang Diharapkan", 2968, { sh: "D9E2F3", b: true }), cell("Status", 1831, { sh: "D9E2F3", b: true })] }),
      new TableRow({ children: [cell("1", 594), cell("Landing Page", 2544, { left: true }), cell("Katalog obat dan tombol chatbot tampil", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("2", 594), cell("Login User", 2544, { left: true }), cell("User masuk ke dashboard user", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("3", 594), cell("Login Admin", 2544, { left: true }), cell("Admin masuk ke dashboard admin", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("4", 594), cell("Chatbot AI", 2544, { left: true }), cell("Sistem memberi respons sesuai intent", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("5", 594), cell("Rekomendasi Obat", 2544, { left: true }), cell("Obat rekomendasi tampil dan dapat diklik", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("6", 594), cell("Detail Obat", 2544, { left: true }), cell("Informasi obat tampil lengkap", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("7", 594), cell("Keranjang", 2544, { left: true }), cell("Obat dapat ditambah dan dihapus", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("8", 594), cell("Checkout", 2544, { left: true }), cell("Alamat, kurir, dan pembayaran dapat diproses", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("9", 594), cell("Tracking", 2544, { left: true }), cell("Timeline pengiriman tampil", 2968, { left: true }), cell("Berhasil", 1831)] }),
      new TableRow({ children: [cell("10", 594), cell("Manajemen Stok", 2544, { left: true }), cell("Admin dapat mengubah stok obat", 2968, { left: true }), cell("Berhasil", 1831)] }),
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
          size: { width: 11906, height: 16838, orientation: "portrait" },
          margin: { top: 2268, right: 1701, bottom: 1701, left: 2268 },
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
  const out = "/sessions/cool-dazzling-fermi/mnt/APOTEK/SKRIPSI_Y_DIMAS_APOTEK_SEHAT_RAPI.docx";
  fs.writeFileSync(out, buffer);
  console.log("DONE", out, buffer.length);
});
