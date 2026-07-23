#!/usr/bin/env python3
"""
Standalone reseed script — langsung akses SQLite tanpa import full Flask app.
Aman dijalankan dengan python apapun tanpa flask_socketio.
"""

import csv
import os
import random
import sqlite3
import sys

# ── Cari file database SQLite ─────────────────────────────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))
DB_CANDIDATES = [
    os.path.join(BASE, 'backend', 'instance', 'apotek.db'),
    os.path.join(BASE, 'backend', 'instance', 'database.db'),
    os.path.join(BASE, 'backend', 'apotek.db'),
]

DB_PATH = None
for c in DB_CANDIDATES:
    if os.path.exists(c):
        DB_PATH = c
        break

if not DB_PATH:
    for root, dirs, files in os.walk(os.path.join(BASE, 'backend')):
        for f in files:
            if f.endswith('.db'):
                DB_PATH = os.path.join(root, f)
                break
        if DB_PATH:
            break

if not DB_PATH:
    print("[ERROR] Database SQLite tidak ditemukan!")
    sys.exit(1)

print(f"[OK] Database ditemukan: {DB_PATH}")

CSV_PATH = os.path.join(BASE, 'model_training', 'data', 'indonesia_otc_medicines.csv')
if not os.path.exists(CSV_PATH):
    print(f"[ERROR] CSV tidak ditemukan: {CSV_PATH}")
    sys.exit(1)

PRICE_RANGES = {
    "Nyeri & Demam":                 (6000, 35000),
    "Obat Batuk":                    (12000, 65000),
    "Flu & Pilek":                   (8000, 55000),
    "Lambung & Maag":                (6000, 55000),
    "Pencernaan & Diare":            (4000, 65000),
    "Vitamin & Suplemen":            (15000, 120000),
    "Alergi & Gatal":                (10000, 60000),
    "Obat Kulit & Luka":             (8000, 85000),
    "Antijamur & Kulit":             (15000, 80000),
    "Obat Oles Nyeri":               (10000, 55000),
    "Mata & Telinga":                (10000, 75000),
    "Mulut & Tenggorokan":           (8000, 65000),
    "Herbal & Tradisional":          (8000, 50000),
    "Perawatan Hidung & Pernapasan": (10000, 60000),
    "Lainnya":                       (8000, 90000),
}


def infer_type(name: str) -> str:
    lower = name.lower()
    if 'sirup' in lower or 'syrup' in lower:   return 'Sirup'
    if 'cream' in lower or 'lotion' in lower:  return 'Topikal'
    if 'gel' in lower:                          return 'Gel'
    if 'salep' in lower or 'ointment' in lower: return 'Salep'
    if 'spray' in lower:                        return 'Spray'
    if 'tetes' in lower or 'drop' in lower:    return 'Tetes'
    if 'sachet' in lower:                       return 'Sachet'
    if 'kapsul' in lower or 'capsul' in lower: return 'Kapsul'
    if 'tablet' in lower or 'tabs' in lower:   return 'Tablet'
    return 'Produk'


def main():
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()

    # Cek tabel
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='medicines'")
    if not cur.fetchone():
        print("[ERROR] Tabel 'medicines' belum ada. Jalankan backend dulu agar tabel dibuat.")
        conn.close()
        sys.exit(1)

    cur.execute("SELECT COUNT(*) FROM medicines")
    existing_count = cur.fetchone()[0]
    print(f"[INFO] {existing_count} obat saat ini di database.")

    # Baca kategori dari CSV
    csv_cats = set()
    all_rows = []
    with open(CSV_PATH, 'r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat = row.get('category', 'Lainnya').strip() or 'Lainnya'
            csv_cats.add(cat)
            all_rows.append(row)

    # Cek kategori di DB
    cur.execute("SELECT DISTINCT category FROM medicines")
    db_cats  = {row[0] for row in cur.fetchall()}
    missing  = csv_cats - db_cats
    force    = '--force' in sys.argv

    if existing_count > 0 and len(missing) < 3 and not force:
        print(f"[SKIP] Database sudah up-to-date ({existing_count} obat, {len(db_cats)} kategori).")
        print("       Gunakan --force untuk paksa reseed.")
        conn.close()
        return

    print(f"[!] Kategori baru di CSV: {missing or '(semua sudah ada)'}")
    print(f"[!] Menghapus {existing_count} data lama dan reseed dari CSV ({len(all_rows)} baris)...")

    cur.execute("DELETE FROM medicines")
    conn.commit()

    expiries = ['2026-12-31', '2027-06-30', '2028-03-15', '2028-12-31', '2029-01-15']
    count = 0

    for row in all_rows:
        name = row.get('name', '').strip()
        if not name:
            continue

        category    = row.get('category', 'Lainnya').strip() or 'Lainnya'
        low, high   = PRICE_RANGES.get(category, PRICE_RANGES['Lainnya'])
        composition = row.get('composition', '').strip()
        uses        = row.get('uses', '').strip()
        keywords    = row.get('symptom_keywords', '').strip()
        note        = row.get('recommendation_note', '').strip()
        raw_image  = row.get('image_url', '').strip() if 'image_url' in row else ''
        image_url  = raw_image  # kept blank intentionally — Admin will fill later
        side_fx     = row.get('side_effects', '').strip()

        price  = float(row.get('price', random.randint(low, high)))
        stock  = int(row.get('stock', random.randint(40, 300)))
        expiry = random.choice(expiries)
        m_type = infer_type(name)

        indication = f"{uses}; Gejala: {keywords}" if keywords else uses
        benefits   = '; '.join(filter(None, [uses, keywords, note]))
        dosage     = f"Sesuai aturan pakai pada kemasan. {note}".strip() if note \
                     else "Sesuai aturan pakai pada kemasan."

        cur.execute("""
            INSERT INTO medicines
              (name, category, price, stock, description, indication, dosage,
               ingredients, benefits, side_effects, expiry, type, photo, is_active, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (
            name, category, price, stock,
            composition, indication, dosage,
            composition, benefits, side_fx,
            expiry, m_type, image_url,
            '["otc","indonesia","chatbot-ready"]'
        ))
        count += 1

    conn.commit()
    conn.close()
    print(f"\n[OK] Berhasil seed {count} obat Indonesia OTC ke database!")
    print(f"[OK] Kategori ({len(csv_cats)}): {', '.join(sorted(csv_cats))}")


if __name__ == '__main__':
    main()
