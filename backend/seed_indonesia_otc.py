#!/usr/bin/env python3
"""Seed active web catalog from Indonesia OTC CSV.

This replaces the current medicines table with curated OTC Indonesia products,
while keeping users and orders untouched.
"""

import csv
import os
import random
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import db, Medicine

CSV_PATH = os.path.join(
    os.path.dirname(__file__), "..", "model_training", "data", "indonesia_otc_medicines.csv"
)
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "model_training", "data", "backups")

PRICE_RANGES = {
    "Nyeri & Demam": (6000, 35000),
    "Obat Batuk": (12000, 65000),
    "Flu & Pilek": (8000, 55000),
    "Vitamin": (15000, 120000),
    "Pencernaan": (4000, 65000),
    "Lambung": (6000, 55000),
    "Kulit": (8000, 85000),
    "Mata": (10000, 50000),
    "Tenggorokan": (8000, 60000),
    "Mulut": (10000, 65000),
    "Lainnya": (8000, 90000),
}


def infer_type(name: str) -> str:
    lower = name.lower()
    if "sirup" in lower or "syrup" in lower:
        return "Sirup"
    if "cream" in lower or "gel" in lower or "lotion" in lower:
        return "Topikal"
    if "spray" in lower:
        return "Spray"
    if "solution" in lower or "gargle" in lower:
        return "Cairan"
    if "sachet" in lower:
        return "Sachet"
    if "tablet" in lower or "tabs" in lower:
        return "Tablet"
    return "Produk"


def build_placeholder(name: str, category: str) -> str:
    label = name.replace(" ", "+")[:45]
    colors = {
        "Nyeri & Demam": "2563eb",
        "Obat Batuk": "ea580c",
        "Flu & Pilek": "7c3aed",
        "Vitamin": "059669",
        "Pencernaan": "0f766e",
        "Lambung": "ca8a04",
        "Kulit": "0891b2",
        "Mata": "0284c7",
        "Tenggorokan": "be123c",
        "Mulut": "9333ea",
    }
    bg = colors.get(category, "0f766e")
    return f"https://placehold.co/480x480/{bg}/ffffff?text={label}"


def backup_existing():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    path = os.path.join(BACKUP_DIR, f"medicines_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
    rows = Medicine.query.order_by(Medicine.id.asc()).all()
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "name", "category", "price", "stock", "description", "indication",
            "dosage", "ingredients", "benefits", "side_effects", "expiry", "type", "photo",
            "is_active", "tags"
        ])
        for med in rows:
            writer.writerow([
                med.id, med.name, med.category, med.price, med.stock, med.description,
                med.indication, med.dosage, med.ingredients, med.benefits, med.side_effects,
                med.expiry, med.type, med.photo, med.is_active, med.tags
            ])
    print(f"[OK] Backed up {len(rows)} existing medicines -> {path}")


def seed_otc_catalog():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(CSV_PATH)

    backup_existing()

    # UPSERT: update yang ada, insert yang baru
    # TIDAK DELETE agar FK constraint order_items tidak dilanggar
    existing = {m.name: m for m in db.session.query(Medicine).all()}

    count_updated  = 0
    count_inserted = 0
    expiries = ["2026-12-31", "2027-06-30", "2028-03-15", "2028-12-31"]

    with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").strip()
            if not name:
                continue

            category  = row.get("category", "Lainnya").strip() or "Lainnya"
            low, high = PRICE_RANGES.get(category, PRICE_RANGES["Lainnya"])
            uses      = row.get("uses", "").strip()
            keywords  = row.get("symptom_keywords", "").strip()
            note      = row.get("recommendation_note", "").strip()
            raw_image = row.get("image_url", "").strip() if "image_url" in row else ""
            image_url = raw_image if raw_image else build_placeholder(name, category)

            # Harga & stok DETERMINISTIC — selalu sama di semua environment
            name_hash = int(abs(hash(name)) % 10000)
            rng       = random.Random(name_hash)
            price     = float(row.get('price', rng.randint(low, high) // 1000 * 1000))
            stock     = int(row.get('stock', rng.randint(40, 250)))
            expiry    = expiries[name_hash % len(expiries)]

            if name in existing:
                # UPDATE — jaga FK order_items
                med          = existing[name]
                med.price    = price
                med.stock    = stock
                med.category = category
                med.expiry   = expiry
                med.description  = row.get("composition", "").strip()
                med.indication   = f"{uses}; Gejala terkait: {keywords}" if keywords else uses
                med.dosage       = f"Sesuai aturan pakai pada kemasan. {note}".strip() if note else "Sesuai aturan pakai pada kemasan."
                med.ingredients  = row.get("composition", "").strip()
                med.benefits     = f"{uses}; {keywords}; {note}".strip("; ")
                med.side_effects = row.get("side_effects", "").strip()
                med.type         = infer_type(name)
                # Update foto hanya jika belum ada foto asli
                if not med.photo or med.photo.startswith('https://placehold'):
                    med.photo = image_url
                med.is_active = True
                count_updated += 1
            else:
                # INSERT obat baru
                med              = Medicine()
                med.name         = name
                med.category     = category
                med.price        = price
                med.stock        = stock
                med.description  = row.get("composition", "").strip()
                med.indication   = f"{uses}; Gejala terkait: {keywords}" if keywords else uses
                med.dosage       = f"Sesuai aturan pakai pada kemasan. {note}".strip()
                med.ingredients  = row.get("composition", "").strip()
                med.benefits     = f"{uses}; {keywords}; {note}".strip("; ")
                med.side_effects = row.get("side_effects", "").strip()
                med.expiry       = expiry
                med.type         = infer_type(name)
                med.photo        = image_url
                med.is_active    = True
                med.tags         = '["otc","indonesia","chatbot-ready"]'
                db.session.add(med)
                count_inserted += 1

    db.session.commit()
    print(f"[OK] Updated {count_updated} + Inserted {count_inserted} medicines.")
    print(f"[OK] Total: {count_updated + count_inserted} obat di database.")


def main():
    app = create_app()
    with app.app_context():
        db.create_all()
        seed_otc_catalog()


if __name__ == "__main__":
    main()
