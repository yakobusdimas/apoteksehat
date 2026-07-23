import csv
import random
import os

input_file = "indonesia_otc_medicines.csv"
output_file = "indonesia_otc_medicines_expanded.csv"

# More realistic suffixes based on category
suffixes = {
    "Nyeri & Demam": ["Forte", "Plus", "Extra", "Tablet", "Anak", "Sirup"],
    "Obat Batuk": ["Sirup", "Berdahak", "Kering", "Herbal", "Plus", "Anak"],
    "Flu & Pilek": ["Flu & Batuk", "Plus", "Extra", "Tablet", "Anak"],
    "Lambung": ["Cair", "Tablet Kunyah", "Forte", "Plus"],
    "Vitamin": ["C", "Complex", "Forte", "Plus", "Gummy", "Effervescent", "Anak"],
    "Pencernaan": ["Tablet", "Kapsul", "Herbal", "Sirup", "Anak"]
}

categories_data = {
    "Nyeri & Demam": {
        "brands": ["Sanmol", "Panadol", "Bodrex", "Paramex", "Oskadon", "Biogesic", "Sumagesic", "Dumin", "Proris", "Farsifen", "Pamol"],
        "composition": ["Paracetamol 500mg", "Ibuprofen 200mg", "Paracetamol 250mg, Ibuprofen 100mg", "Acetylsalicylic Acid 80mg", "Paracetamol; Caffeine", "Paracetamol; Propyphenazone; Caffeine"],
        "uses": ["Demam; nyeri ringan; sakit kepala", "Nyeri otot; pegal linu; sakit gigi", "Sakit kepala; migrain ringan", "Menurunkan panas dan meredakan nyeri"],
        "side_effects": ["Mual; ruam alergi jarang", "Iritasi lambung bila diminum sebelum makan", "Mengantuk pada sebagian orang", "Berdebar karena kafein"],
        "keywords": ["demam; panas; sakit kepala; pusing; nyeri badan; pegal", "sakit gigi; nyeri sendi; pegal linu", "migrain; pusing kepala; demam tinggi"],
        "note": "Gunakan sesuai aturan pakai. Hindari penggunaan berlebih.",
        "manufacturers": ["Kalbe", "Tempo Scan", "Sanbe", "GSK", "Bayer"]
    },
    "Obat Batuk": {
        "brands": ["Komix", "Woods", "Siladex", "Vicks", "OBH Combi", "Laserin", "Konidin", "Actifed", "Bisolvon", "Pimatra", "Mextril"],
        "composition": ["Dextromethorphan HBr; Diphenhydramine HCl", "Bromhexine HCl; Guaifenesin", "Herbal extract; Madu; Jahe", "Succus liquiritiae; Ammonium chloride"],
        "uses": ["Batuk kering; tenggorokan gatal", "Batuk berdahak; mengencerkan dahak", "Batuk ringan; melegakan tenggorokan", "Batuk alergi"],
        "side_effects": ["Mengantuk; mulut kering", "Mual ringan", "Tidak ada efek samping signifikan", "Pusing ringan"],
        "keywords": ["batuk; gatal; batuk kering; tidak berdahak", "batuk berdahak; banyak dahak; lendir kental", "tenggorokan gatal; batuk malam"],
        "note": "Dapat menyebabkan kantuk, hindari mengemudi. Banyak minum air putih hangat.",
        "manufacturers": ["Combiphar", "Konimex", "Kalbe", "Bintang Toedjoe"]
    },
    "Flu & Pilek": {
        "brands": ["Mixagrip", "Decolgen", "Neozep", "Procold", "Inza", "Sanaflu", "Ultraflu", "Rhinos", "Stop Cold", "Fludane", "Demacolin"],
        "composition": ["Paracetamol; Pseudoephedrine; Chlorpheniramine", "Paracetamol; Ephedrine HCl; CTM", "Phenylephrine HCl; Paracetamol"],
        "uses": ["Flu; pilek; hidung tersumbat; demam", "Bersin-bersin; hidung meler; sakit kepala", "Gejala flu dan batuk ringan"],
        "side_effects": ["Mengantuk berat; mulut kering", "Berdebar; tekanan darah naik", "Pusing; mual"],
        "keywords": ["flu; pilek; hidung tersumbat; bersin; meler; demam", "hidung mampet; meriang; pilek berat"],
        "note": "Bisa menyebabkan kantuk berat. Jangan diminum bersama obat flu lain.",
        "manufacturers": ["Medifarma", "Tempo Scan", "Bayer", "Kalbe"]
    },
    "Lambung": {
        "brands": ["Promag", "Mylanta", "Polysilane", "Waisan", "Antasida Doen", "Plantacid", "Gastrinal", "Magtral", "Gestamagh", "Neosanmag"],
        "composition": ["Aluminium Hydroxide; Magnesium Hydroxide", "Simethicone; Al(OH)3; Mg(OH)2", "Ranitidine 150mg", "Omeprazole 20mg", "Famotidine 10mg", "Magnesium Trisilicate"],
        "uses": ["Meredakan asam lambung; maag", "Perut kembung; begah; mual", "Nyeri ulu hati; dispepsia"],
        "side_effects": ["Sembelit ringan", "Diare ringan", "Tidak nyaman di perut jika dosis berlebih"],
        "keywords": ["maag; asam lambung; mual; perih ulu hati; kembung; begah", "sakit perut atas; begah; angin di perut"],
        "note": "Kunyah sebelum ditelan untuk tablet hisap/kunyah. Minum 30 menit sebelum makan.",
        "manufacturers": ["Kalbe", "Bayer", "Pharos", "Dexa Medica"]
    },
    "Vitamin": {
        "brands": ["Enervon C", "Vicee", "Vitacimin", "Imboost", "Stimuno", "Holisticare", "CDR", "Redoxon", "Zegavit", "Fatigon", "Renovit", "Hemaviton"],
        "composition": ["Vitamin C 500mg", "Multivitamin; Zinc; Echinacea", "Vitamin B Complex", "Vitamin D3 1000 IU; Calcium", "Vitamin C 1000mg", "B-Complex; Vitamin E"],
        "uses": ["Menjaga daya tahan tubuh", "Masa penyembuhan dari sakit", "Kesehatan saraf dan tulang", "Suplemen antioksidan"],
        "side_effects": ["Urin berwarna kuning terang", "Nyeri lambung bila minum sebelum makan (vit C)"],
        "keywords": ["lemas; mudah sakit; vitamin; daya tahan tubuh; imun; sariawan", "pegal linu; kesemutan; kurang gizi"],
        "note": "Baik diminum setelah makan.",
        "manufacturers": ["Kalbe", "Takeda", "Enseval", "Bayer"]
    },
    "Pencernaan": {
        "brands": ["Diatabs", "Entrostop", "Diapet", "Norit", "Dulcolax", "Microlax", "Tay Pin San", "Lodia", "Vegeta", "Guanistrep"],
        "composition": ["Attapulgite; Pectin", "Activated Charcoal (Karbon Aktif)", "Loperamide", "Ekstrak daun jambu biji", "Bisacodyl 5mg"],
        "uses": ["Meredakan diare tidak spesifik", "Mengatasi perut mulas dan mencret", "Keracunan makanan ringan", "Melancarkan buang air besar (BAB)"],
        "side_effects": ["Sembelit bila digunakan berlebih", "Feses berwarna gelap (karbon aktif)", "Mulas atau kram perut ringan"],
        "keywords": ["diare; mencret; mulas; BAB air; keracunan makanan", "sakit perut bawah; buang air terus", "sembelit; susah BAB"],
        "note": "Bila diare berlanjut > 2 hari, segera ke dokter. Jangan lupa minum oralit.",
        "manufacturers": ["Kalbe", "Bintang Toedjoe", "Sanbe", "Generic"]
    }
}

existing_names = set()
header = []
data_rows = []

if os.path.exists(input_file):
    with open(input_file, mode="r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        # Only keep the original first ~73 rows, or just parse everything and deduplicate.
        # Let's completely wipe the generated rows from before to fix the bad combinations.
        # We can tell a bad one if it's past row 73 or if we just keep original ones.
        for i, row in enumerate(reader):
            if row:
                if i < 73:  # Only keep original manually created rows
                    existing_names.add(row[0].strip().lower())
                    data_rows.append(row)

# Generate synthetic rows
target_count = 500
attempts = 0

while len(data_rows) < target_count and attempts < 3000:
    attempts += 1
    category = random.choice(list(categories_data.keys()))
    cat_data = categories_data[category]
    
    brand = random.choice(cat_data["brands"])
    suffix = random.choice(suffixes[category]) if random.random() > 0.4 else ""
    name = f"{brand} {suffix}".strip()
    
    # Generic format
    if random.random() > 0.8:
        comp = random.choice(cat_data["composition"])
        name = f"{comp.split(';')[0]} Generic"
    
    if name.lower() in existing_names:
        continue
        
    existing_names.add(name.lower())
    
    composition = random.choice(cat_data["composition"])
    uses = random.choice(cat_data["uses"])
    side_effects = random.choice(cat_data["side_effects"])
    manufacturer = random.choice(cat_data["manufacturers"])
    keywords = random.choice(cat_data["keywords"])
    note = cat_data["note"]
    
    row = [
        name,
        composition,
        uses,
        side_effects,
        category,
        manufacturer,
        "false",  # requires_prescription
        "true",   # is_otc
        keywords,
        note,
        ""        # image_url
    ]
    data_rows.append(row)

# Overwrite input file directly
with open(input_file, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    if header:
        writer.writerow(header)
    writer.writerows(data_rows)

print(f"Dataset successfully expanded and fixed. Total rows: {len(data_rows)}")
