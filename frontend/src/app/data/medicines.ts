export interface Medicine {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  photo: string;
  description: string;
  indication: string;
  dosage: string;
  ingredients: string[];
  benefits: string[];
}

export const medicines: Medicine[] = [
  {
    "id": 1,
    "name": "Actifed Tablet 4s",
    "category": "Flu & Pilek",
    "price": 25000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Actifed20Tablet204s",
    "description": "Meredakan hidung tersumbat, bersin-bersin, dan gejala flu.",
    "indication": "Indikasi: Meredakan hidung tersumbat, bersin-bersin, dan gejala flu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Actifed",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 2,
    "name": "Acyclovir Cream 5% 5g",
    "category": "Salep Kulit",
    "price": 9500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Acyclovir20Cream20520205g",
    "description": "Krim antivirus untuk herpes simpleks pada bibir dan kulit.",
    "indication": "Indikasi: Krim antivirus untuk herpes simpleks pada bibir dan kulit.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Acyclovir",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 3,
    "name": "Alkohol 70% 100ml",
    "category": "P3K",
    "price": 9000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Alkohol20702020100ml",
    "description": "Antiseptik untuk membersihkan luka dan sterilisasi alat.",
    "indication": "Indikasi: Antiseptik untuk membersihkan luka dan sterilisasi alat.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Alkohol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 4,
    "name": "Antangin JRG Cair 1 Sachet",
    "category": "Herbal",
    "price": 4500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antangin20JRG20Cair20120Sachet",
    "description": "Obat herbal alami untuk meredakan masuk angin dan mual.",
    "indication": "Indikasi: Obat herbal alami untuk meredakan masuk angin dan mual.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antangin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 5,
    "name": "Antangin Kids Sachet",
    "category": "Herbal",
    "price": 4000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antangin20Kids20Sachet",
    "description": "Obat herbal masuk angin khusus untuk anak-anak.",
    "indication": "Indikasi: Obat herbal masuk angin khusus untuk anak-anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antangin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 6,
    "name": "Antangin Permen Mint 1 Sachet",
    "category": "Herbal",
    "price": 3000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antangin20Permen20Mint20120Sachet",
    "description": "Permen herbal mint anti masuk angin.",
    "indication": "Indikasi: Permen herbal mint anti masuk angin.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antangin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 7,
    "name": "Antasida Doen Tablet 10s",
    "category": "Lambung",
    "price": 3500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antasida20Doen20Tablet2010s",
    "description": "Menetralkan asam lambung berlebih dan meredakan maag.",
    "indication": "Indikasi: Menetralkan asam lambung berlebih dan meredakan maag.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antasida",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 8,
    "name": "Antimo Anak Sirup 30ml",
    "category": "Mabuk Perjalanan",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antimo20Anak20Sirup2030ml",
    "description": "Sirup pencegah mabuk perjalanan khusus anak-anak.",
    "indication": "Indikasi: Sirup pencegah mabuk perjalanan khusus anak-anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antimo",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 9,
    "name": "Antimo Tablet 10s",
    "category": "Mabuk Perjalanan",
    "price": 11000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Antimo20Tablet2010s",
    "description": "Mencegah dan meredakan mabuk perjalanan.",
    "indication": "Indikasi: Mencegah dan meredakan mabuk perjalanan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Antimo",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 10,
    "name": "Avil 25mg Tablet 10s",
    "category": "Anti Alergi",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Avil2025mg20Tablet2010s",
    "description": "Meredakan gejala alergi seperti gatal, pilek alergi, dan biduran.",
    "indication": "Indikasi: Meredakan gejala alergi seperti gatal, pilek alergi, dan biduran.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Avil",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 11,
    "name": "Azaron Roll-On Stick",
    "category": "Anti Gatal",
    "price": 19000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Azaron20Roll-On20Stick",
    "description": "Meredakan gatal akibat gigitan serangga.",
    "indication": "Indikasi: Meredakan gatal akibat gigitan serangga.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Azaron",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 12,
    "name": "Balsem Geliga 20g",
    "category": "P3K",
    "price": 9000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Balsem20Geliga2020g",
    "description": "Balsem gosok pereda nyeri otot dan pegal-pegal.",
    "indication": "Indikasi: Balsem gosok pereda nyeri otot dan pegal-pegal.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Balsem",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 13,
    "name": "Benadryl Sirup 60ml",
    "category": "Obat Batuk",
    "price": 39000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Benadryl20Sirup2060ml",
    "description": "Sirup obat batuk dan pilek yang efektif untuk dewasa.",
    "indication": "Indikasi: Sirup obat batuk dan pilek yang efektif untuk dewasa.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Benadryl",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 14,
    "name": "Betadine Antiseptic 15ml",
    "category": "P3K",
    "price": 18000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Betadine20Antiseptic2015ml",
    "description": "Antiseptik untuk mencegah infeksi pada luka.",
    "indication": "Indikasi: Antiseptik untuk mencegah infeksi pada luka.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Betadine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 15,
    "name": "Betadine Wound Gel 10g",
    "category": "P3K",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Betadine20Wound20Gel2010g",
    "description": "Gel antiseptik untuk penyembuhan luka.",
    "indication": "Indikasi: Gel antiseptik untuk penyembuhan luka.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Betadine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 16,
    "name": "Bioplacenton Gel 15g",
    "category": "Salep Kulit",
    "price": 47000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Bioplacenton20Gel2015g",
    "description": "Gel untuk mempercepat penyembuhan luka bakar dan lecet.",
    "indication": "Indikasi: Gel untuk mempercepat penyembuhan luka bakar dan lecet.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Bioplacenton",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 17,
    "name": "Blackmores Fish Oil 1000mg 30s",
    "category": "Vitamin",
    "price": 125000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Blackmores20Fish20Oil201000mg2030s",
    "description": "Suplemen Omega-3 untuk kesehatan jantung dan otak.",
    "indication": "Indikasi: Suplemen Omega-3 untuk kesehatan jantung dan otak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Blackmores",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 18,
    "name": "Bodrex Extra 10 Tablet",
    "category": "Pereda Nyeri",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Bodrex20Extra201020Tablet",
    "description": "Meredakan sakit kepala dan nyeri badan dengan cepat.",
    "indication": "Indikasi: Meredakan sakit kepala dan nyeri badan dengan cepat.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Bodrex",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 19,
    "name": "Bodrex Migra 4 Kaplet",
    "category": "Pereda Nyeri",
    "price": 6000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Bodrex20Migra20420Kaplet",
    "description": "Khusus untuk meredakan sakit kepala sebelah (migrain).",
    "indication": "Indikasi: Khusus untuk meredakan sakit kepala sebelah (migrain).",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Bodrex",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 20,
    "name": "Bye Bye Fever Anak 1s",
    "category": "Anak",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Bye20Bye20Fever20Anak201s",
    "description": "Plester kompres gel pendingin penurun demam untuk anak.",
    "indication": "Indikasi: Plester kompres gel pendingin penurun demam untuk anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Bye",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 21,
    "name": "Caladine Lotion 60ml",
    "category": "Anti Gatal",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Caladine20Lotion2060ml",
    "description": "Losion pereda gatal dan ruam kulit dari calamine.",
    "indication": "Indikasi: Losion pereda gatal dan ruam kulit dari calamine.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Caladine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 22,
    "name": "Canesten Cream 5g",
    "category": "Salep Kulit",
    "price": 36000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Canesten20Cream205g",
    "description": "Krim antijamur untuk mengatasi infeksi jamur pada kulit.",
    "indication": "Indikasi: Krim antijamur untuk mengatasi infeksi jamur pada kulit.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Canesten",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 23,
    "name": "Cap Lang Minyak Kayu Putih 60ml",
    "category": "P3K",
    "price": 29000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Cap20Lang20Minyak20Kayu20Putih2060ml",
    "description": "Minyak kayu putih asli Cap Lang untuk pijat dan kesehatan.",
    "indication": "Indikasi: Minyak kayu putih asli Cap Lang untuk pijat dan kesehatan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Cap",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 24,
    "name": "Cataflam 25mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 18000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Cataflam2025mg20Tablet2010s",
    "description": "Meredakan nyeri akut seperti sakit gigi dan nyeri haid.",
    "indication": "Indikasi: Meredakan nyeri akut seperti sakit gigi dan nyeri haid.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Cataflam",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 25,
    "name": "CDR Effervescent 10 Tablet",
    "category": "Vitamin",
    "price": 60000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=CDR20Effervescent201020Tablet",
    "description": "Suplemen kalsium, vitamin D3, dan vitamin C dalam satu tablet.",
    "indication": "Indikasi: Suplemen kalsium, vitamin D3, dan vitamin C dalam satu tablet.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "CDR",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 26,
    "name": "Cetirizine 10mg Tablet 10s",
    "category": "Anti Alergi",
    "price": 8000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Cetirizine2010mg20Tablet2010s",
    "description": "Antihistamin yang tidak menyebabkan kantuk untuk alergi.",
    "indication": "Indikasi: Antihistamin yang tidak menyebabkan kantuk untuk alergi.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Cetirizine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 27,
    "name": "Chlorphenamine 4mg Tablet 10s",
    "category": "Anti Alergi",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Chlorphenamine204mg20Tablet2010s",
    "description": "Meredakan gejala alergi, pilek alergi, dan biduran.",
    "indication": "Indikasi: Meredakan gejala alergi, pilek alergi, dan biduran.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Chlorphenamine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 28,
    "name": "Combantrin 125mg Tablet 6s",
    "category": "Obat Cacing",
    "price": 29000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Combantrin20125mg20Tablet206s",
    "description": "Mengobati infeksi cacing gelang, cacing kremi, dan cacing tambang.",
    "indication": "Indikasi: Mengobati infeksi cacing gelang, cacing kremi, dan cacing tambang.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Combantrin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 29,
    "name": "Counterpain 15g",
    "category": "Salep Kulit",
    "price": 36000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Counterpain2015g",
    "description": "Krim pereda nyeri otot, sendi, dan pegal-linu.",
    "indication": "Indikasi: Krim pereda nyeri otot, sendi, dan pegal-linu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Counterpain",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 30,
    "name": "Curcuma Plus Sirup 100ml",
    "category": "Anak",
    "price": 47000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Curcuma20Plus20Sirup20100ml",
    "description": "Sirup suplemen nafsu makan dan kesehatan anak berbahan kunyit.",
    "indication": "Indikasi: Sirup suplemen nafsu makan dan kesehatan anak berbahan kunyit.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Curcuma",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 31,
    "name": "Daktarin Cream 5g",
    "category": "Salep Kulit",
    "price": 33000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Daktarin20Cream205g",
    "description": "Krim antijamur miconazole untuk infeksi jamur pada kulit.",
    "indication": "Indikasi: Krim antijamur miconazole untuk infeksi jamur pada kulit.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Daktarin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 32,
    "name": "Decolgen Forte 4 Tablet",
    "category": "Flu & Pilek",
    "price": 6000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Decolgen20Forte20420Tablet",
    "description": "Meredakan gejala flu dan pilek disertai demam.",
    "indication": "Indikasi: Meredakan gejala flu dan pilek disertai demam.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Decolgen",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 33,
    "name": "Dextrometorphan 15mg Tablet 10s",
    "category": "Obat Batuk",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Dextrometorphan2015mg20Tablet2010s",
    "description": "Menekan batuk kering (tidak berdahak) tanpa rasa kantuk.",
    "indication": "Indikasi: Menekan batuk kering (tidak berdahak) tanpa rasa kantuk.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Dextrometorphan",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 34,
    "name": "Diapet 10 Kapsul",
    "category": "Pencernaan",
    "price": 26000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Diapet201020Kapsul",
    "description": "Obat diare herbal dari daun jambu biji.",
    "indication": "Indikasi: Obat diare herbal dari daun jambu biji.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Diapet",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 35,
    "name": "Diapet NR 10 Kapsul",
    "category": "Pencernaan",
    "price": 29000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Diapet20NR201020Kapsul",
    "description": "Diapet dengan tambahan arang aktif untuk menyerap racun.",
    "indication": "Indikasi: Diapet dengan tambahan arang aktif untuk menyerap racun.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Diapet",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 36,
    "name": "Dolo Neurobion 5 Tablet",
    "category": "Pereda Nyeri",
    "price": 27000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Dolo20Neurobion20520Tablet",
    "description": "Kombinasi paracetamol dan Vitamin B untuk nyeri saraf.",
    "indication": "Indikasi: Kombinasi paracetamol dan Vitamin B untuk nyeri saraf.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Dolo",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 37,
    "name": "Dulcolax 5mg Tablet 6s",
    "category": "Pencernaan",
    "price": 19000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Dulcolax205mg20Tablet206s",
    "description": "Mengatasi sembelit (konstipasi) dengan aman.",
    "indication": "Indikasi: Mengatasi sembelit (konstipasi) dengan aman.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Dulcolax",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 38,
    "name": "Enervon C 30 Tablet",
    "category": "Vitamin",
    "price": 47000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Enervon20C203020Tablet",
    "description": "Multivitamin dengan Vitamin C 500mg dan B Kompleks.",
    "indication": "Indikasi: Multivitamin dengan Vitamin C 500mg dan B Kompleks.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Enervon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 39,
    "name": "Enervon C Sirup Anak 100ml",
    "category": "Anak",
    "price": 57000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Enervon20C20Sirup20Anak20100ml",
    "description": "Sirup multivitamin untuk tumbuh kembang anak.",
    "indication": "Indikasi: Sirup multivitamin untuk tumbuh kembang anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Enervon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 40,
    "name": "Entrostop 20 Tablet",
    "category": "Pencernaan",
    "price": 19000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Entrostop202020Tablet",
    "description": "Menghentikan diare dan menormalkan konsistensi feses.",
    "indication": "Indikasi: Menghentikan diare dan menormalkan konsistensi feses.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Entrostop",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 41,
    "name": "Erlamycetin Eye Drop 8ml",
    "category": "Mata",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Erlamycetin20Eye20Drop208ml",
    "description": "Obat tetes mata antibakteri untuk infeksi mata ringan.",
    "indication": "Indikasi: Obat tetes mata antibakteri untuk infeksi mata ringan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Erlamycetin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 42,
    "name": "Extra Joss Effervescent 10 Tablet",
    "category": "Vitamin",
    "price": 26000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Extra20Joss20Effervescent201020Tablet",
    "description": "Minuman energi bervitamin dalam bentuk tablet effervescent.",
    "indication": "Indikasi: Minuman energi bervitamin dalam bentuk tablet effervescent.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Extra",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 43,
    "name": "Eyemo Eye Drop 7.5ml",
    "category": "Mata",
    "price": 19000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Eyemo20Eye20Drop207.5ml",
    "description": "Meredakan mata merah, lelah, dan iritasi ringan.",
    "indication": "Indikasi: Meredakan mata merah, lelah, dan iritasi ringan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Eyemo",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 44,
    "name": "Feminax 4 Tablet",
    "category": "Pereda Nyeri",
    "price": 9000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Feminax20420Tablet",
    "description": "Pereda nyeri haid (dismenore) pada wanita.",
    "indication": "Indikasi: Pereda nyeri haid (dismenore) pada wanita.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Feminax",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 45,
    "name": "Folic Acid 400mcg Tablet 30s",
    "category": "Vitamin",
    "price": 16000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Folic20Acid20400mcg20Tablet2030s",
    "description": "Suplemen asam folat untuk ibu hamil dan kesehatan sel darah merah.",
    "indication": "Indikasi: Suplemen asam folat untuk ibu hamil dan kesehatan sel darah merah.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Folic",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 46,
    "name": "Freshcare Roll On 10ml",
    "category": "P3K",
    "price": 18000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Freshcare20Roll20On2010ml",
    "description": "Minyak angin aromatherapy roll-on yang menyegarkan.",
    "indication": "Indikasi: Minyak angin aromatherapy roll-on yang menyegarkan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Freshcare",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 47,
    "name": "Gardan 200mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 8000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Gardan20200mg20Tablet2010s",
    "description": "Ibuprofen 200mg untuk meredakan nyeri ringan hingga sedang.",
    "indication": "Indikasi: Ibuprofen 200mg untuk meredakan nyeri ringan hingga sedang.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Gardan",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 48,
    "name": "Gaviscon Antasida 10 Tablet",
    "category": "Lambung",
    "price": 47000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Gaviscon20Antasida201020Tablet",
    "description": "Membentuk lapisan pelindung di lambung dan meredakan GERD.",
    "indication": "Indikasi: Membentuk lapisan pelindung di lambung dan meredakan GERD.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Gaviscon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 49,
    "name": "Glyserin Boraks 30ml",
    "category": "P3K",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Glyserin20Boraks2030ml",
    "description": "Cairan pembersih mulut dan tenggorokan.",
    "indication": "Indikasi: Cairan pembersih mulut dan tenggorokan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Glyserin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 50,
    "name": "Hansaplast Plester 10s",
    "category": "P3K",
    "price": 6500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Hansaplast20Plester2010s",
    "description": "Plester luka serbaguna yang fleksibel dan tahan air.",
    "indication": "Indikasi: Plester luka serbaguna yang fleksibel dan tahan air.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Hansaplast",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 51,
    "name": "Hemaviton Action 10 Tablet",
    "category": "Vitamin",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Hemaviton20Action201020Tablet",
    "description": "Suplemen energi multivitamin untuk aktivitas sehari-hari.",
    "indication": "Indikasi: Suplemen energi multivitamin untuk aktivitas sehari-hari.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Hemaviton",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 52,
    "name": "Holisticare Ester C 30 Tablet",
    "category": "Vitamin",
    "price": 67000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Holisticare20Ester20C203020Tablet",
    "description": "Vitamin C non-asam yang aman bagi lambung sensitif.",
    "indication": "Indikasi: Vitamin C non-asam yang aman bagi lambung sensitif.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Holisticare",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 53,
    "name": "Hufagesic 500mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Hufagesic20500mg20Tablet2010s",
    "description": "Paracetamol generik penurun panas dan pereda nyeri.",
    "indication": "Indikasi: Paracetamol generik penurun panas dan pereda nyeri.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Hufagesic",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 54,
    "name": "Ibuprofen 200mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 6500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Ibuprofen20200mg20Tablet2010s",
    "description": "Meredakan nyeri dan demam, aman diminum setelah makan.",
    "indication": "Indikasi: Meredakan nyeri dan demam, aman diminum setelah makan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Ibuprofen",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 55,
    "name": "Ibuprofen 400mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 8000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Ibuprofen20400mg20Tablet2010s",
    "description": "Pereda nyeri sedang seperti sakit gigi dan nyeri otot.",
    "indication": "Indikasi: Pereda nyeri sedang seperti sakit gigi dan nyeri otot.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Ibuprofen",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 56,
    "name": "Imboost Force 10 Kaplet",
    "category": "Vitamin",
    "price": 87000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Imboost20Force201020Kaplet",
    "description": "Suplemen daya tahan tubuh ekstra dengan Echinacea dan Zinc.",
    "indication": "Indikasi: Suplemen daya tahan tubuh ekstra dengan Echinacea dan Zinc.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Imboost",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 57,
    "name": "Insto Regular 7.5ml",
    "category": "Mata",
    "price": 20000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Insto20Regular207.5ml",
    "description": "Meredakan mata merah akibat iritasi ringan.",
    "indication": "Indikasi: Meredakan mata merah akibat iritasi ringan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Insto",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 58,
    "name": "Intunal Forte 10 Kaplet",
    "category": "Flu & Pilek",
    "price": 6000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Intunal20Forte201020Kaplet",
    "description": "Meredakan flu berat disertai demam dan nyeri kepala.",
    "indication": "Indikasi: Meredakan flu berat disertai demam dan nyeri kepala.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Intunal",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 59,
    "name": "Inza 4 Tablet",
    "category": "Flu & Pilek",
    "price": 4500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Inza20420Tablet",
    "description": "Meredakan sakit kepala, demam, dan flu.",
    "indication": "Indikasi: Meredakan sakit kepala, demam, dan flu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Inza",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 60,
    "name": "Jesscool Koyo Demam Anak 1s",
    "category": "Anak",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Jesscool20Koyo20Demam20Anak201s",
    "description": "Koyo pendingin dahi untuk menurunkan demam anak.",
    "indication": "Indikasi: Koyo pendingin dahi untuk menurunkan demam anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Jesscool",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 61,
    "name": "Jesscool Koyo Dewasa 1s",
    "category": "Pereda Nyeri",
    "price": 10000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Jesscool20Koyo20Dewasa201s",
    "description": "Koyo pendingin untuk meredakan nyeri otot dan pegal.",
    "indication": "Indikasi: Koyo pendingin untuk meredakan nyeri otot dan pegal.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Jesscool",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 62,
    "name": "Kalpanax Cair 10ml",
    "category": "Salep Kulit",
    "price": 19000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Kalpanax20Cair2010ml",
    "description": "Obat cair antijamur untuk panu, kadas, dan kurap.",
    "indication": "Indikasi: Obat cair antijamur untuk panu, kadas, dan kurap.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Kalpanax",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 63,
    "name": "Kalpanax Salep 5g",
    "category": "Salep Kulit",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Kalpanax20Salep205g",
    "description": "Salep antijamur untuk panu, kadas, dan kurap.",
    "indication": "Indikasi: Salep antijamur untuk panu, kadas, dan kurap.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Kalpanax",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 64,
    "name": "Komix Herbal 1 Tube",
    "category": "Obat Batuk",
    "price": 3500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Komix20Herbal20120Tube",
    "description": "Obat batuk herbal dalam kemasan tube praktis.",
    "indication": "Indikasi: Obat batuk herbal dalam kemasan tube praktis.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Komix",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 65,
    "name": "Konidin 10 Tablet",
    "category": "Obat Batuk",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Konidin201020Tablet",
    "description": "Meredakan batuk kering dan iritasi tenggorokan.",
    "indication": "Indikasi: Meredakan batuk kering dan iritasi tenggorokan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Konidin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 66,
    "name": "Kool Fever Anak 1s",
    "category": "Anak",
    "price": 12000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Kool20Fever20Anak201s",
    "description": "Plester gel pendingin penurun demam untuk bayi dan anak.",
    "indication": "Indikasi: Plester gel pendingin penurun demam untuk bayi dan anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Kool",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 67,
    "name": "Lacto-B Junior Sachet 10s",
    "category": "Anak",
    "price": 37000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Lacto-B20Junior20Sachet2010s",
    "description": "Probiotik rasa buah untuk anak usia 1-12 tahun.",
    "indication": "Indikasi: Probiotik rasa buah untuk anak usia 1-12 tahun.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Lacto-B",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 68,
    "name": "Lacto-B Sachet 10s",
    "category": "Pencernaan",
    "price": 50000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Lacto-B20Sachet2010s",
    "description": "Probiotik untuk kesehatan pencernaan dan diare anak.",
    "indication": "Indikasi: Probiotik untuk kesehatan pencernaan dan diare anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Lacto-B",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 69,
    "name": "Lapifed Sirup 60ml",
    "category": "Flu & Pilek",
    "price": 36000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Lapifed20Sirup2060ml",
    "description": "Sirup pereda pilek dan hidung tersumbat untuk anak.",
    "indication": "Indikasi: Sirup pereda pilek dan hidung tersumbat untuk anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Lapifed",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 70,
    "name": "Loratadine 10mg Tablet 10s",
    "category": "Anti Alergi",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Loratadine2010mg20Tablet2010s",
    "description": "Obat alergi generasi kedua yang tidak menyebabkan kantuk.",
    "indication": "Indikasi: Obat alergi generasi kedua yang tidak menyebabkan kantuk.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Loratadine",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 71,
    "name": "Mediplast Corn Plaster",
    "category": "Salep Kulit",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Mediplast20Corn20Plaster",
    "description": "Plester pengobatan kapalan dan mata ikan.",
    "indication": "Indikasi: Plester pengobatan kapalan dan mata ikan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Mediplast",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 72,
    "name": "Minyak Tawon 60ml",
    "category": "P3K",
    "price": 16000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Minyak20Tawon2060ml",
    "description": "Minyak pijat tradisional untuk nyeri otot dan pegal.",
    "indication": "Indikasi: Minyak pijat tradisional untuk nyeri otot dan pegal.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Minyak",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 73,
    "name": "Mixagrip Batuk & Flu 4 Kaplet",
    "category": "Obat Batuk",
    "price": 4500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Mixagrip20Batuk202620Flu20420Kaplet",
    "description": "Meredakan batuk berdahak yang disertai gejala flu.",
    "indication": "Indikasi: Meredakan batuk berdahak yang disertai gejala flu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Mixagrip",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 74,
    "name": "Mixagrip Flu 4 Kaplet",
    "category": "Flu & Pilek",
    "price": 4000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Mixagrip20Flu20420Kaplet",
    "description": "Meredakan gejala flu, pilek, dan hidung tersumbat.",
    "indication": "Indikasi: Meredakan gejala flu, pilek, dan hidung tersumbat.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Mixagrip",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 75,
    "name": "Mylanta Cair 50ml",
    "category": "Lambung",
    "price": 22000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Mylanta20Cair2050ml",
    "description": "Antasida cair untuk meredakan nyeri lambung dan maag.",
    "indication": "Indikasi: Antasida cair untuk meredakan nyeri lambung dan maag.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Mylanta",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 76,
    "name": "Natur-E 100 IU 16 Kapsul",
    "category": "Vitamin",
    "price": 26000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Natur-E2010020IU201620Kapsul",
    "description": "Suplemen Vitamin E alami untuk kesehatan kulit dan antioksidan.",
    "indication": "Indikasi: Suplemen Vitamin E alami untuk kesehatan kulit dan antioksidan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Natur-E",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 77,
    "name": "Neozep Forte 4 Tablet",
    "category": "Flu & Pilek",
    "price": 6500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Neozep20Forte20420Tablet",
    "description": "Meredakan gejala flu dan pilek yang disertai bersin.",
    "indication": "Indikasi: Meredakan gejala flu dan pilek yang disertai bersin.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Neozep",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 78,
    "name": "Neurobion Forte 10 Tablet",
    "category": "Vitamin",
    "price": 49000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Neurobion20Forte201020Tablet",
    "description": "Vitamin B Kompleks (B1, B6, B12) untuk kesehatan saraf.",
    "indication": "Indikasi: Vitamin B Kompleks (B1, B6, B12) untuk kesehatan saraf.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Neurobion",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 79,
    "name": "Norit Arang Aktif 10 Tablet",
    "category": "Pencernaan",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Norit20Arang20Aktif201020Tablet",
    "description": "Arang aktif untuk menyerap racun dan mengatasi kembung.",
    "indication": "Indikasi: Arang aktif untuk menyerap racun dan mengatasi kembung.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Norit",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 80,
    "name": "OBH Combi Anak 60ml",
    "category": "Obat Batuk",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=OBH20Combi20Anak2060ml",
    "description": "Sirup obat batuk dan flu khusus untuk anak-anak.",
    "indication": "Indikasi: Sirup obat batuk dan flu khusus untuk anak-anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "OBH",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 81,
    "name": "OBH Combi Dewasa 100ml",
    "category": "Obat Batuk",
    "price": 39000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=OBH20Combi20Dewasa20100ml",
    "description": "Sirup obat batuk berdahak untuk orang dewasa.",
    "indication": "Indikasi: Sirup obat batuk berdahak untuk orang dewasa.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "OBH",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 82,
    "name": "OBH Combi Plus Flu 100ml",
    "category": "Obat Batuk",
    "price": 43000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=OBH20Combi20Plus20Flu20100ml",
    "description": "Sirup obat batuk dengan tambahan formula pereda flu.",
    "indication": "Indikasi: Sirup obat batuk dengan tambahan formula pereda flu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "OBH",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 83,
    "name": "Oralit Sachet 200ml",
    "category": "Pencernaan",
    "price": 2000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Oralit20Sachet20200ml",
    "description": "Larutan rehidrasi oral untuk mencegah dehidrasi saat diare.",
    "indication": "Indikasi: Larutan rehidrasi oral untuk mencegah dehidrasi saat diare.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Oralit",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 84,
    "name": "Oskadon 4 Tablet",
    "category": "Pereda Nyeri",
    "price": 3500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Oskadon20420Tablet",
    "description": "Meredakan sakit kepala dan pusing dengan cepat.",
    "indication": "Indikasi: Meredakan sakit kepala dan pusing dengan cepat.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Oskadon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 85,
    "name": "Panadol Anak Sirup 60ml",
    "category": "Anak",
    "price": 38000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Panadol20Anak20Sirup2060ml",
    "description": "Sirup paracetamol rasa stroberi untuk anak.",
    "indication": "Indikasi: Sirup paracetamol rasa stroberi untuk anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Panadol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 86,
    "name": "Panadol Extra 10 Kaplet",
    "category": "Pereda Nyeri",
    "price": 17000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Panadol20Extra201020Kaplet",
    "description": "Paracetamol + Kafein untuk meredakan sakit kepala lebih efektif.",
    "indication": "Indikasi: Paracetamol + Kafein untuk meredakan sakit kepala lebih efektif.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Panadol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 87,
    "name": "Paracetamol 500mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Paracetamol20500mg20Tablet2010s",
    "description": "Obat penurun panas dan pereda nyeri generik yang aman.",
    "indication": "Indikasi: Obat penurun panas dan pereda nyeri generik yang aman.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Paracetamol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 88,
    "name": "Paramex 4 Tablet",
    "category": "Pereda Nyeri",
    "price": 4000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Paramex20420Tablet",
    "description": "Meredakan sakit kepala dan nyeri ringan.",
    "indication": "Indikasi: Meredakan sakit kepala dan nyeri ringan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Paramex",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 89,
    "name": "Pediatric Zinkid Sachet 10s",
    "category": "Anak",
    "price": 32000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Pediatric20Zinkid20Sachet2010s",
    "description": "Suplemen Zinc sachet untuk diare pada anak.",
    "indication": "Indikasi: Suplemen Zinc sachet untuk diare pada anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Pediatric",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 90,
    "name": "Ponstan 500mg Tablet 10s",
    "category": "Pereda Nyeri",
    "price": 32000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Ponstan20500mg20Tablet2010s",
    "description": "Asam mefenamat untuk meredakan nyeri haid dan sakit gigi.",
    "indication": "Indikasi: Asam mefenamat untuk meredakan nyeri haid dan sakit gigi.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Ponstan",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 91,
    "name": "Promaag Cair 100ml",
    "category": "Lambung",
    "price": 25000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Promaag20Cair20100ml",
    "description": "Antasida cair dengan tambahan simethicone untuk kembung.",
    "indication": "Indikasi: Antasida cair dengan tambahan simethicone untuk kembung.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Promaag",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 92,
    "name": "Promag Tablet 10s",
    "category": "Lambung",
    "price": 12000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Promag20Tablet2010s",
    "description": "Meredakan nyeri akibat asam lambung berlebih dan maag.",
    "indication": "Indikasi: Meredakan nyeri akibat asam lambung berlebih dan maag.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Promag",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 93,
    "name": "Pyrantel Pamoate 125mg Tablet 6s",
    "category": "Obat Cacing",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Pyrantel20Pamoate20125mg20Tablet206s",
    "description": "Mengobati infeksi cacing kremi dan cacing gelang.",
    "indication": "Indikasi: Mengobati infeksi cacing kremi dan cacing gelang.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Pyrantel",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 94,
    "name": "Redoxon Triple Action 10 Tablet",
    "category": "Vitamin",
    "price": 64000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Redoxon20Triple20Action201020Tablet",
    "description": "Suplemen Vitamin C, D, dan Zinc untuk daya tahan tubuh.",
    "indication": "Indikasi: Suplemen Vitamin C, D, dan Zinc untuk daya tahan tubuh.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Redoxon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 95,
    "name": "Rohto Cool 7.5ml",
    "category": "Mata",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Rohto20Cool207.5ml",
    "description": "Obat tetes mata dengan sensasi dingin menyegarkan.",
    "indication": "Indikasi: Obat tetes mata dengan sensasi dingin menyegarkan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Rohto",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 96,
    "name": "Rohto Lycee 7.5ml",
    "category": "Mata",
    "price": 29000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Rohto20Lycee207.5ml",
    "description": "Obat tetes mata untuk meredakan mata lelah dan kering.",
    "indication": "Indikasi: Obat tetes mata untuk meredakan mata lelah dan kering.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Rohto",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 97,
    "name": "Salonpas Koyo 10s",
    "category": "Pereda Nyeri",
    "price": 10000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Salonpas20Koyo2010s",
    "description": "Koyo analgesik untuk nyeri otot dan pegal-pegal.",
    "indication": "Indikasi: Koyo analgesik untuk nyeri otot dan pegal-pegal.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Salonpas",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 98,
    "name": "Sangobion 10 Kapsul",
    "category": "Vitamin",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Sangobion201020Kapsul",
    "description": "Suplemen zat besi dan vitamin untuk cegah anemia.",
    "indication": "Indikasi: Suplemen zat besi dan vitamin untuk cegah anemia.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Sangobion",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 99,
    "name": "Sanmol Paracetamol 500mg 10 Tablet",
    "category": "Pereda Nyeri",
    "price": 5500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Sanmol20Paracetamol20500mg201020Tablet",
    "description": "Paracetamol untuk menurunkan demam dan meredakan nyeri.",
    "indication": "Indikasi: Paracetamol untuk menurunkan demam dan meredakan nyeri.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Sanmol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 100,
    "name": "Sanmol Sirup Anak 60ml",
    "category": "Anak",
    "price": 26000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Sanmol20Sirup20Anak2060ml",
    "description": "Sirup paracetamol untuk penurun panas anak.",
    "indication": "Indikasi: Sirup paracetamol untuk penurun panas anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Sanmol",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 101,
    "name": "Scott's Emulsion Original 200ml",
    "category": "Vitamin",
    "price": 67000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Scott27s20Emulsion20Original20200ml",
    "description": "Emulsi minyak ikan Cod kaya Omega-3 dan Vitamin D.",
    "indication": "Indikasi: Emulsi minyak ikan Cod kaya Omega-3 dan Vitamin D.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Scott's",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 102,
    "name": "Siladex Mucolytic 60ml",
    "category": "Obat Batuk",
    "price": 25000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Siladex20Mucolytic2060ml",
    "description": "Sirup pengencer dahak yang tidak menimbulkan kantuk.",
    "indication": "Indikasi: Sirup pengencer dahak yang tidak menimbulkan kantuk.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Siladex",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 103,
    "name": "Stimuno Forte 10 Kapsul",
    "category": "Vitamin",
    "price": 36000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Stimuno20Forte201020Kapsul",
    "description": "Suplemen Phyllanthus niruri untuk meningkatkan daya tahan tubuh.",
    "indication": "Indikasi: Suplemen Phyllanthus niruri untuk meningkatkan daya tahan tubuh.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Stimuno",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 104,
    "name": "Tempra Syrup Anak 60ml",
    "category": "Anak",
    "price": 57000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Tempra20Syrup20Anak2060ml",
    "description": "Sirup paracetamol rasa anggur untuk penurun panas anak.",
    "indication": "Indikasi: Sirup paracetamol rasa anggur untuk penurun panas anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Tempra",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 105,
    "name": "Tolak Angin Anak Sachet",
    "category": "Herbal",
    "price": 4500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Tolak20Angin20Anak20Sachet",
    "description": "Obat herbal masuk angin untuk anak dengan rasa yang disukai.",
    "indication": "Indikasi: Obat herbal masuk angin untuk anak dengan rasa yang disukai.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Tolak",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 106,
    "name": "Tolak Angin Cair 1 Sachet",
    "category": "Herbal",
    "price": 5000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Tolak20Angin20Cair20120Sachet",
    "description": "Obat herbal Sido Muncul untuk masuk angin dan mual.",
    "indication": "Indikasi: Obat herbal Sido Muncul untuk masuk angin dan mual.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Tolak",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 107,
    "name": "Transbroncho Sirup 60ml",
    "category": "Obat Batuk",
    "price": 27000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Transbroncho20Sirup2060ml",
    "description": "Sirup pengencer dahak untuk batuk berdahak kronis.",
    "indication": "Indikasi: Sirup pengencer dahak untuk batuk berdahak kronis.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Transbroncho",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 108,
    "name": "Ultraflu 4 Kaplet",
    "category": "Flu & Pilek",
    "price": 4500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Ultraflu20420Kaplet",
    "description": "Meredakan flu disertai demam, sakit kepala, dan nyeri.",
    "indication": "Indikasi: Meredakan flu disertai demam, sakit kepala, dan nyeri.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Ultraflu",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 109,
    "name": "Upixon Sirup 60ml",
    "category": "Obat Batuk",
    "price": 23000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Upixon20Sirup2060ml",
    "description": "Sirup pereda batuk berdahak yang aman untuk keluarga.",
    "indication": "Indikasi: Sirup pereda batuk berdahak yang aman untuk keluarga.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Upixon",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 110,
    "name": "Ventolin Inhaler 200 Dosis",
    "category": "Asma",
    "price": 65000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Ventolin20Inhaler2020020Dosis",
    "description": "Pelega saluran napas untuk penderita asma dan bronkospasme.",
    "indication": "Indikasi: Pelega saluran napas untuk penderita asma dan bronkospasme.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Ventolin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  },
  {
    "id": 111,
    "name": "Vicks Formula 44 60ml",
    "category": "Obat Batuk",
    "price": 43000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Vicks20Formula20442060ml",
    "description": "Sirup obat batuk tidak berdahak dengan sensasi hangat.",
    "indication": "Indikasi: Sirup obat batuk tidak berdahak dengan sensasi hangat.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Vicks",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 112,
    "name": "Vicks VapoRub 10g",
    "category": "P3K",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Vicks20VapoRub2010g",
    "description": "Balsam Vicks untuk melegakan pernapasan saat flu.",
    "indication": "Indikasi: Balsam Vicks untuk melegakan pernapasan saat flu.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Vicks",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 113,
    "name": "Vitacimin 500mg Tablet 10s",
    "category": "Vitamin",
    "price": 9000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Vitacimin20500mg20Tablet2010s",
    "description": "Vitamin C rasa lemon yang menyegarkan.",
    "indication": "Indikasi: Vitamin C rasa lemon yang menyegarkan.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Vitacimin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 114,
    "name": "Vitamin B Complex 30 Tablet",
    "category": "Vitamin",
    "price": 13000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Vitamin20B20Complex203020Tablet",
    "description": "Suplemen Vitamin B Kompleks untuk energi dan kesehatan saraf.",
    "indication": "Indikasi: Suplemen Vitamin B Kompleks untuk energi dan kesehatan saraf.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Vitamin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 115,
    "name": "Vitamin C 500mg Tablet 10s",
    "category": "Vitamin",
    "price": 8500,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Vitamin20C20500mg20Tablet2010s",
    "description": "Suplemen Vitamin C untuk daya tahan tubuh.",
    "indication": "Indikasi: Suplemen Vitamin C untuk daya tahan tubuh.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Vitamin",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 116,
    "name": "Wintogeno Cream 15g",
    "category": "P3K",
    "price": 16000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Wintogeno20Cream2015g",
    "description": "Krim balsam untuk menghangatkan dan meredakan nyeri otot.",
    "indication": "Indikasi: Krim balsam untuk menghangatkan dan meredakan nyeri otot.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Wintogeno",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 117,
    "name": "Woods Peppermint Antitussive 60ml",
    "category": "Obat Batuk",
    "price": 36000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Woods20Peppermint20Antitussive2060ml",
    "description": "Sirup obat batuk kering dengan sensasi peppermint.",
    "indication": "Indikasi: Sirup obat batuk kering dengan sensasi peppermint.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Woods",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 118,
    "name": "Zink Sirup Anak 60ml",
    "category": "Anak",
    "price": 33000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Zink20Sirup20Anak2060ml",
    "description": "Suplemen Zinc untuk mempercepat pemulihan diare anak.",
    "indication": "Indikasi: Suplemen Zinc untuk mempercepat pemulihan diare anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Zink",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 119,
    "name": "Zinkid Zinc 20mg Sirup 60ml",
    "category": "Anak",
    "price": 29000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Zinkid20Zinc2020mg20Sirup2060ml",
    "description": "Suplemen Zinc untuk mendukung pertumbuhan dan imunitas anak.",
    "indication": "Indikasi: Suplemen Zinc untuk mendukung pertumbuhan dan imunitas anak.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Zinkid",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif secara klinis",
      "Tersedia bebas di apotek Indonesia",
      "Harga terjangkau 2026"
    ]
  },
  {
    "id": 120,
    "name": "Zyrtec 10mg Tablet 10s",
    "category": "Anti Alergi",
    "price": 75000,
    "stock": 100,
    "image": "💊",
    "photo": "https://placehold.co/400x300/e0f2fe/0369a1?text=Zyrtec2010mg20Tablet2010s",
    "description": "Antihistamin cetirizine untuk alergi hidung dan biduran.",
    "indication": "Indikasi: Antihistamin cetirizine untuk alergi hidung dan biduran.",
    "dosage": "Sesuai petunjuk pada kemasan atau anjuran dokter/apoteker.",
    "ingredients": [
      "Zyrtec",
      "Bahan aktif terpilih",
      "Eksipien q.s."
    ],
    "benefits": [
      "Terbukti efektif",
      "Tersedia bebas di apotek Indonesia",
      "Harga wajar 2026"
    ]
  }
];
