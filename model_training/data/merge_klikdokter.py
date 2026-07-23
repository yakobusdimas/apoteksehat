"""
merge_klikdokter.py
===================
Menggabungkan data scraping KlikDokter ke dataset utama apotek.

Cara pakai:
  python merge_klikdokter.py

Output:
  - indonesia_otc_medicines.csv (diupdate)
  - medicines_primary.json (diupdate)
"""

import csv
import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).parent
KLIK_CSV  = BASE_DIR / "klikdokter_medicines.csv"
MAIN_CSV  = BASE_DIR / "indonesia_otc_medicines.csv"
MAIN_JSON = BASE_DIR / "medicines_primary.json"

# Harga perkiraan berdasarkan kategori (range Rp)
PRICE_RANGE = {
    "Nyeri & Demam":                   (5_000,  45_000),
    "Flu & Pilek":                     (8_000,  55_000),
    "Obat Batuk":                       (8_000,  50_000),
    "Lambung & Maag":                  (10_000, 65_000),
    "Pencernaan & Diare":              (8_000,  40_000),
    "Alergi & Gatal":                  (10_000, 55_000),
    "Antijamur & Kulit":               (12_000, 75_000),
    "Suplemen":                        (15_000, 125_000),
    "Herbal & Tradisional":            (8_000,  45_000),
    "Mata & Telinga":                  (12_000, 60_000),
    "Mulut & Tenggorokan":             (10_000, 45_000),
    "Perawatan Hidung & Pernapasan":   (10_000, 55_000),
    "Obat Oles Nyeri":                 (15_000, 65_000),
    "Obat Kulit & Luka":               (10_000, 60_000),
}


def load_existing_names(csv_path: Path) -> set:
    """Load nama obat yang sudah ada di dataset utama"""
    names = set()
    if not csv_path.exists():
        return names
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            names.add(row["name"].strip().lower())
    return names


def load_klikdokter(csv_path: Path) -> list[dict]:
    """Load data hasil scraping KlikDokter"""
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def generate_price(category: str) -> int:
    """Generate harga berdasarkan kategori"""
    low, high = PRICE_RANGE.get(category, (10_000, 50_000))
    # Bulatkan ke kelipatan 500
    price = random.randint(low // 500, high // 500) * 500
    return price


def generate_stock() -> int:
    """Generate stok antara 80-190"""
    return random.randint(80, 190)


def clean_text(text: str, maxlen: int = 300) -> str:
    if not text:
        return ""
    return " ".join(text.split())[:maxlen]


def merge():
    print("=" * 55)
    print("  MERGE KLIKDOKTER -> DATASET UTAMA")
    print("=" * 55)

    # Load data yang sudah ada
    existing_names = load_existing_names(MAIN_CSV)
    print(f"  Dataset utama saat ini: {len(existing_names)} obat")

    # Load scraping hasil
    klik_data = load_klikdokter(KLIK_CSV)
    print(f"  Data KlikDokter       : {len(klik_data)} obat")

    # Filter obat baru (tidak duplikat)
    new_meds = []
    for row in klik_data:
        name = row.get("name", "").strip()
        if not name:
            continue
        if name.lower() in existing_names:
            continue  # Skip duplikat

        uses      = clean_text(row.get("uses", ""))
        comp      = clean_text(row.get("composition", ""))
        side_eff  = clean_text(row.get("side_effects", "Konsultasikan dengan dokter"))
        category  = row.get("category", "Herbal & Tradisional")
        mfg       = clean_text(row.get("manufacturer", ""))
        keywords  = clean_text(row.get("symptom_keywords", ""))
        img_url   = row.get("image_url", "")

        # Skip jika tidak ada informasi sama sekali
        if not uses and not comp:
            continue

        new_meds.append({
            "name":                 name,
            "composition":          comp or "-",
            "uses":                 uses or name,
            "side_effects":         side_eff,
            "category":             category,
            "manufacturer":         mfg,
            "requires_prescription":"False",
            "is_otc":               "True",
            "symptom_keywords":     keywords,
            "recommendation_note":  "Sumber: KlikDokter",
            "price":                generate_price(category),
            "stock":                generate_stock(),
            "image_url":            img_url,
        })
        existing_names.add(name.lower())

    print(f"  Obat baru (unik)      : {len(new_meds)} obat")
    print(f"  Total setelah merge   : {len(existing_names)} obat")

    if not new_meds:
        print("\n[INFO] Tidak ada obat baru. Dataset sudah up-to-date.")
        return

    # Append ke CSV utama
    fieldnames = [
        "name", "composition", "uses", "side_effects", "category",
        "manufacturer", "requires_prescription", "is_otc",
        "symptom_keywords", "recommendation_note", "price", "stock", "image_url"
    ]

    with open(MAIN_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        for med in new_meds:
            writer.writerow({k: med.get(k, "") for k in fieldnames})

    print(f"\n[CSV] Berhasil menambah {len(new_meds)} obat ke {MAIN_CSV.name}")

    # Update JSON medicines_primary.json
    update_json(new_meds)

    print("\n[SELESAI] Langkah selanjutnya:")
    print("  1. docker exec apotek-backend python seed_indonesia_otc.py")
    print("  2. docker restart apotek-backend")


def update_json(new_meds: list[dict]):
    """Update medicines_primary.json dengan obat baru"""
    with open(MAIN_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    existing = data.get("medicines", [])
    existing_ids = {m["id"] for m in existing}
    next_id = max(existing_ids) + 1 if existing_ids else 1

    for med in new_meds:
        category = med.get("category", "Herbal & Tradisional")
        entry = {
            "id": next_id,
            "name": med["name"],
            "composition": med["composition"],
            "uses": med["uses"],
            "side_effects": med["side_effects"],
            "category": category,
            "manufacturer": med["manufacturer"],
            "requires_prescription": False,
            "is_otc": True,
            "symptom_keywords": med["symptom_keywords"],
            "recommendation_note": med["recommendation_note"],
            "price": int(med["price"]),
            "stock": int(med["stock"]),
            "photo": med.get("image_url", ""),
        }
        existing.append(entry)
        next_id += 1

    data["medicines"] = existing
    data["total"] = len(existing)

    with open(MAIN_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"[JSON] medicines_primary.json diupdate: {len(existing)} total obat")


if __name__ == "__main__":
    merge()
