import csv
import json
import random
import re
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = Path(__file__).resolve().parent / "indonesia_otc_medicines.csv"
JSON_PATH = Path(__file__).resolve().parent / "medicines_primary.json"
PUBLIC_DIR = ROOT / "frontend" / "public" / "product-images"
PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

HEADER = [
    "name", "composition", "uses", "side_effects", "category", "manufacturer",
    "requires_prescription", "is_otc", "symptom_keywords", "recommendation_note", "image_url"
]

PALETTES = {
    "Nyeri & Demam": ("#10b981", "#d1fae5", "#064e3b", "💊"),
    "Obat Batuk": ("#0ea5e9", "#e0f2fe", "#075985", "🍯"),
    "Flu & Pilek": ("#8b5cf6", "#ede9fe", "#4c1d95", "🤧"),
    "Lambung": ("#f59e0b", "#fef3c7", "#78350f", "🛡"),
    "Vitamin": ("#f97316", "#ffedd5", "#7c2d12", "✨"),
    "Pencernaan": ("#14b8a6", "#ccfbf1", "#134e4a", "🌿"),
}

DATA = {
    "Nyeri & Demam": {
        "bases": [
            ("Paracetamol", "Paracetamol 500mg", "Demam; sakit kepala; nyeri ringan", "demam; panas; sakit kepala; nyeri badan; pegal", "Generic"),
            ("Sanmol", "Paracetamol 500mg", "Demam; nyeri ringan sampai sedang", "demam; panas; sakit kepala; nyeri", "Sanbe Farma"),
            ("Panadol", "Paracetamol 500mg", "Demam; sakit kepala; nyeri ringan", "demam; panas; sakit kepala; nyeri badan", "Haleon"),
            ("Bodrex", "Paracetamol; Caffeine", "Sakit kepala; nyeri ringan", "sakit kepala; pusing; nyeri ringan", "Tempo Scan"),
            ("Oskadon", "Paracetamol; Caffeine", "Sakit kepala; nyeri ringan", "sakit kepala; pusing; nyeri ringan", "Supra Ferbindo"),
            ("Paramex", "Paracetamol; Propyphenazone; Caffeine", "Sakit kepala; nyeri ringan", "sakit kepala; migrain ringan; pusing", "Konimex"),
            ("Proris", "Ibuprofen 100mg/5ml", "Demam dan nyeri pada anak", "demam anak; panas anak; nyeri", "Pharos"),
            ("Farsifen", "Ibuprofen 200mg", "Nyeri ringan sampai sedang; demam", "nyeri; sakit gigi; demam; pegal", "Ifars"),
            ("Biogesic", "Paracetamol 500mg", "Demam; nyeri ringan", "demam; panas; sakit kepala", "Kalbe"),
            ("Pamol", "Paracetamol 500mg", "Demam; nyeri ringan", "demam; sakit kepala; nyeri badan", "Interbat"),
        ],
        "forms": ["Tablet", "Kaplet", "Forte", "Sirup", "Drops", "Extra", "Plus"],
        "side": "Mual; ruam alergi jarang; gangguan hati bila overdosis",
        "note": "Gunakan sesuai aturan pakai. Hindari penggunaan berlebih dan jangan digabung dengan obat sejenis.",
    },
    "Obat Batuk": {
        "bases": [
            ("OBH Combi", "Succus liquiritiae; Ammonium chloride", "Batuk berdahak; membantu mengencerkan dahak", "batuk berdahak; dahak; tenggorokan berlendir", "Combiphar"),
            ("Woods", "Bromhexine HCl; Guaifenesin", "Batuk berdahak", "batuk berdahak; dahak kental; batuk produktif", "Kalbe"),
            ("Siladex", "Dextromethorphan HBr; Diphenhydramine HCl", "Batuk kering; batuk tidak berdahak", "batuk kering; batuk gatal; tenggorokan gatal", "Konimex"),
            ("Komix", "Dextromethorphan HBr; Guaifenesin", "Batuk ringan; batuk berdahak", "batuk; batuk berdahak; tenggorokan gatal", "Bintang Toedjoe"),
            ("Laserin", "Ekstrak herbal; Madu", "Batuk ringan; melegakan tenggorokan", "batuk ringan; serak; tenggorokan gatal", "Mecosin"),
            ("Bisolvon", "Bromhexine HCl", "Batuk berdahak; dahak kental", "batuk berdahak; dahak kental", "Sanofi"),
            ("Vicks Formula 44", "Dextromethorphan HBr", "Batuk kering; batuk malam hari", "batuk kering; batuk malam", "P&G"),
            ("Konidin", "Dextromethorphan HBr; Guaifenesin; CTM", "Batuk disertai flu ringan", "batuk; flu; tenggorokan gatal", "Konimex"),
        ],
        "forms": ["Sirup", "Berdahak", "Kering", "Herbal", "Anak", "Plus", "Sachet"],
        "side": "Mengantuk; mual; mulut kering; pusing ringan",
        "note": "Minum air cukup. Jika batuk lebih dari 3 hari atau disertai sesak, konsultasikan ke tenaga kesehatan.",
    },
    "Flu & Pilek": {
        "bases": [
            ("Mixagrip", "Paracetamol; Phenylephrine HCl; Chlorpheniramine", "Flu; pilek; demam; hidung tersumbat", "flu; pilek; hidung tersumbat; demam; bersin", "Tempo Scan"),
            ("Decolgen", "Paracetamol; Phenylpropanolamine; Chlorpheniramine", "Gejala flu; pilek; sakit kepala", "flu; pilek; bersin; hidung meler", "Medifarma"),
            ("Neozep", "Paracetamol; Phenylephrine HCl; Chlorpheniramine", "Flu; pilek; hidung tersumbat", "flu; pilek; hidung mampet; bersin", "Konimex"),
            ("Procold", "Paracetamol; Pseudoephedrine; Chlorpheniramine", "Flu; demam; hidung tersumbat", "flu; meriang; hidung tersumbat; sakit kepala", "Kalbe"),
            ("Inza", "Paracetamol; Phenylpropanolamine; Chlorpheniramine", "Flu; pilek; demam ringan", "flu; pilek; meriang; bersin", "Konimex"),
            ("Sanaflu", "Paracetamol; Phenylephrine; Chlorpheniramine", "Flu; pilek; sakit kepala", "flu; pilek; sakit kepala; demam", "Sanbe Farma"),
            ("Ultraflu", "Paracetamol; Phenylpropanolamine; CTM", "Gejala flu dan pilek", "flu; pilek; hidung tersumbat", "Henson Farma"),
        ],
        "forms": ["Tablet", "Kaplet", "Flu & Batuk", "Plus", "Extra", "Sirup"],
        "side": "Mengantuk; mulut kering; berdebar pada sebagian orang",
        "note": "Dapat menyebabkan mengantuk. Hindari digabung dengan obat flu lain yang memiliki kandungan sama.",
    },
    "Lambung": {
        "bases": [
            ("Promag", "Hydrotalcite; Magnesium Hydroxide; Simethicone", "Maag; perut kembung; nyeri ulu hati", "maag; asam lambung; kembung; perih ulu hati", "Kalbe"),
            ("Mylanta", "Aluminium Hydroxide; Magnesium Hydroxide; Simethicone", "Asam lambung; maag; kembung", "maag; mual; kembung; begah", "Johnson & Johnson"),
            ("Polysilane", "Dimethylpolysiloxane; Aluminium Hydroxide; Magnesium Hydroxide", "Maag; kembung; rasa penuh di lambung", "maag; asam lambung; begah; kembung", "Pharos"),
            ("Waisan", "Antasida; Sodium Bicarbonate", "Maag; perih lambung", "maag; perih ulu hati; asam lambung", "Bintang Toedjoe"),
            ("Antasida Doen", "Aluminium Hydroxide; Magnesium Hydroxide", "Maag; nyeri ulu hati", "maag; asam lambung; mual", "Generic"),
            ("Plantacid", "Aluminium Hydroxide; Magnesium Hydroxide; Simethicone", "Asam lambung; kembung", "asam lambung; kembung; begah", "Soho"),
        ],
        "forms": ["Tablet Kunyah", "Suspensi", "Cair", "Forte", "Plus", "Sachet"],
        "side": "Sembelit ringan; diare ringan; mual bila berlebihan",
        "note": "Gunakan setelah makan atau saat gejala muncul. Bila nyeri lambung menetap, konsultasikan ke dokter.",
    },
    "Vitamin": {
        "bases": [
            ("Enervon C", "Vitamin C; Vitamin B Complex; Niacinamide", "Menjaga daya tahan tubuh", "lemas; daya tahan tubuh; vitamin; imun", "Darya-Varia"),
            ("Vitacimin", "Vitamin C 500mg", "Suplemen vitamin C; sariawan ringan", "sariawan; vitamin c; daya tahan tubuh", "Takeda"),
            ("Vicee", "Vitamin C 500mg", "Suplemen vitamin C", "vitamin; sariawan; imun", "Kalbe"),
            ("Imboost", "Echinacea; Zinc; Vitamin C", "Membantu menjaga daya tahan tubuh", "imun; mudah sakit; daya tahan tubuh", "Soho"),
            ("Stimuno", "Ekstrak Phyllanthus niruri", "Membantu memelihara daya tahan tubuh", "imun; daya tahan tubuh; mudah sakit", "Dexa Medica"),
            ("CDR", "Calcium; Vitamin C; Vitamin D; Vitamin B6", "Kesehatan tulang dan daya tahan tubuh", "tulang; vitamin; kalsium; imun", "Bayer"),
            ("Redoxon", "Vitamin C; Zinc", "Suplemen vitamin C dan zinc", "vitamin c; zinc; daya tahan tubuh", "Bayer"),
            ("Fatigon", "Vitamin B Complex; Vitamin E; Mineral", "Membantu mengurangi lelah", "lemas; capek; pegal; vitamin", "Kalbe"),
            ("Renovit", "Multivitamin; Mineral", "Suplemen multivitamin harian", "vitamin; lemas; daya tahan tubuh", "Dexa Medica"),
        ],
        "forms": ["Tablet", "Kaplet", "Forte", "Plus", "Gummy", "Effervescent", "Anak"],
        "side": "Mual ringan; nyeri lambung bila diminum sebelum makan; urin kuning terang",
        "note": "Baik diminum setelah makan. Suplemen tidak menggantikan makanan bergizi.",
    },
    "Pencernaan": {
        "bases": [
            ("Entrostop", "Attapulgite; Pectin", "Diare tidak spesifik; perut mulas", "diare; mencret; mulas; BAB cair", "Kalbe"),
            ("Diatabs", "Attapulgite", "Membantu mengurangi frekuensi diare", "diare; mencret; BAB cair", "Medifarma"),
            ("Diapet", "Ekstrak daun jambu biji; Kunyit; Mojokeling", "Diare ringan; perut mulas", "diare; mencret; mulas", "Soho"),
            ("Norit", "Activated Charcoal", "Keracunan makanan ringan; perut tidak nyaman", "keracunan makanan; perut mulas; diare", "Erela"),
            ("Dulcolax", "Bisacodyl 5mg", "Sembelit; susah buang air besar", "sembelit; susah BAB; konstipasi", "Sanofi"),
            ("Microlax", "Sorbitol; Sodium Citrate; Sodium Lauryl Sulfoacetate", "Sembelit; membantu BAB", "sembelit; susah BAB", "Pharos"),
            ("Lodia", "Loperamide HCl", "Diare akut tertentu", "diare; BAB cair; mencret", "Sanbe Farma"),
        ],
        "forms": ["Tablet", "Kapsul", "Sirup", "Herbal", "Anak", "Sachet", "Gel"],
        "side": "Sembelit bila digunakan berlebih; mual; feses gelap pada karbon aktif",
        "note": "Cukupi cairan dan oralit. Bila diare berlanjut lebih dari 2 hari atau ada darah, segera periksa.",
    },
}

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:80]

def _split_title(text: str):
    words = text.split()
    first, second = [], []
    for word in words:
        target = first if len(' '.join(first + [word])) <= 18 else second
        target.append(word)
    return escape(' '.join(first)[:20]), escape(' '.join(second)[:18])


def svg_for(name, category, composition, manufacturer):
    primary, bg, dark, icon = PALETTES[category]
    title_1, title_2 = _split_title(name)
    subtitle = escape(composition[:38])
    maker = escape(manufacturer[:24])
    category_text = escape(category.upper())
    seed = sum(ord(c) for c in name)
    accent = ["#22c55e", "#06b6d4", "#f97316", "#a855f7", "#ef4444", "#0f766e"][seed % 6]
    is_liquid = any(k in name.lower() for k in ["sirup", "suspensi", "cair", "drops"])
    is_sachet = any(k in name.lower() for k in ["sachet", "herbal"])
    if is_liquid:
        pack = f'''
        <ellipse cx="300" cy="475" rx="92" ry="18" fill="#0f172a" opacity="0.13"/>
        <rect x="238" y="151" width="124" height="42" rx="14" fill="{dark}"/>
        <rect x="226" y="188" width="148" height="285" rx="34" fill="#ffffff" stroke="{primary}" stroke-width="6"/>
        <rect x="246" y="230" width="108" height="154" rx="22" fill="{bg}"/>
        <path d="M248 305 C278 270 318 342 354 286 L354 384 L248 384 Z" fill="{primary}" opacity="0.78"/>
        <circle cx="300" cy="337" r="33" fill="#fff" opacity="0.88"/>
        <text x="300" y="349" text-anchor="middle" font-size="38">{icon}</text>
        '''
    elif is_sachet:
        pack = f'''
        <ellipse cx="300" cy="474" rx="122" ry="18" fill="#0f172a" opacity="0.13"/>
        <path d="M173 155 L427 132 L445 456 L155 474 Z" fill="#fff" stroke="{primary}" stroke-width="7"/>
        <path d="M183 176 L420 155 L428 250 L176 265 Z" fill="{primary}"/>
        <path d="M176 335 C245 292 328 382 435 310 L441 456 L158 470 Z" fill="{bg}"/>
        <circle cx="305" cy="356" r="48" fill="#fff" opacity="0.9"/>
        <text x="305" y="372" text-anchor="middle" font-size="50">{icon}</text>
        '''
    else:
        pack = f'''
        <ellipse cx="300" cy="477" rx="142" ry="18" fill="#0f172a" opacity="0.13"/>
        <path d="M143 162 Q143 132 173 132 H421 Q457 132 457 168 V439 Q457 470 426 470 H174 Q143 470 143 439 Z" fill="#ffffff" stroke="{primary}" stroke-width="7"/>
        <path d="M146 164 Q146 135 175 135 H423 Q454 135 454 166 V229 H146 Z" fill="{primary}"/>
        <path d="M146 325 C210 283 281 379 356 321 C398 288 432 293 454 303 V442 Q454 467 426 467 H174 Q146 467 146 439 Z" fill="{bg}"/>
        <rect x="191" y="292" width="218" height="66" rx="18" fill="#fff" opacity="0.94"/>
        <g transform="translate(247 376)">
          <rect x="0" y="0" width="44" height="84" rx="22" fill="#ef4444" transform="rotate(45 22 42)"/>
          <path d="M22 0 a22 22 0 0 1 22 22 v20 h-44 v-20 a22 22 0 0 1 22-22" fill="#ffffff" opacity="0.82" transform="rotate(45 22 42)"/>
          <circle cx="92" cy="38" r="28" fill="{accent}" opacity="0.9"/>
        </g>
        '''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="{bg}"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.18"/></filter>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <circle cx="72" cy="498" r="150" fill="{primary}" opacity="0.10"/>
  <circle cx="532" cy="78" r="110" fill="{accent}" opacity="0.11"/>
  <g filter="url(#shadow)">{pack}</g>
  <text x="300" y="184" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" font-weight="800" fill="#ffffff">APOTEK SEHAT</text>
  <text x="300" y="221" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="#ffffff" opacity="0.92">{category_text}</text>
  <text x="300" y="276" text-anchor="middle" font-family="Arial, sans-serif" font-size="37" font-weight="900" fill="{dark}">{title_1}</text>
  <text x="300" y="314" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="{dark}">{title_2}</text>
  <text x="300" y="334" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="{primary}">{subtitle}</text>
  <text x="300" y="527" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#475569">{maker}</text>
</svg>'''

def build_rows(target=500):
    rows = []
    names = set()
    category_order = ["Nyeri & Demam", "Obat Batuk", "Flu & Pilek", "Lambung", "Vitamin", "Pencernaan"]
    distribution = {
        "Nyeri & Demam": 90,
        "Obat Batuk": 80,
        "Flu & Pilek": 75,
        "Lambung": 75,
        "Vitamin": 95,
        "Pencernaan": 85,
    }
    for category in category_order:
        spec = DATA[category]
        needed = distribution[category]
        variant_no = 1
        while sum(1 for r in rows if r[4] == category) < needed:
            base = spec["bases"][variant_no % len(spec["bases"])]
            form = spec["forms"][(variant_no // len(spec["bases"])) % len(spec["forms"])]
            base_name, composition, uses, keywords, manufacturer = base
            # Avoid medically odd names such as child products with caffeine by switching composition where needed.
            name = f"{base_name} {form}".strip()
            if form in {"Forte", "Plus", "Extra"}:
                name = f"{base_name} {form} {variant_no:02d}" if name.lower() in names else name
            elif name.lower() in names:
                name = f"{base_name} {form} {variant_no:02d}"
            if "Anak" in name and ("Caffeine" in composition or "Propyphenazone" in composition):
                composition = "Paracetamol 120mg/5ml"
                uses = "Demam dan nyeri ringan pada anak"
                keywords = "demam anak; panas anak; nyeri anak"
            if name.lower() in names:
                variant_no += 1
                continue
            names.add(name.lower())
            slug = slugify(name)
            image_url = f"/product-images/{slug}.svg"
            (PUBLIC_DIR / f"{slug}.svg").write_text(svg_for(name, category, composition, manufacturer), encoding="utf-8")
            rows.append([
                name, composition, uses, spec["side"], category, manufacturer,
                "false", "true", keywords, spec["note"], image_url
            ])
            variant_no += 1
    random.Random(42).shuffle(rows)
    return rows[:target]

def main():
    rows = build_rows(500)
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADER)
        writer.writerows(rows)
    medicines = []
    for r in rows:
        medicines.append({
            "name": r[0],
            "kategori_id": [r[4]],
            "composition": r[1],
            "uses": r[2],
            "side_effects": r[3],
            "manufacturer": r[5],
            "image_url": r[10],
        })
    JSON_PATH.write_text(json.dumps({"medicines": medicines}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Rebuilt {len(rows)} rows")
    print(f"CSV: {CSV_PATH}")
    print(f"JSON: {JSON_PATH}")
    print(f"Images: {PUBLIC_DIR}")

if __name__ == "__main__":
    main()
