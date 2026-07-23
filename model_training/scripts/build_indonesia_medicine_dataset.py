#!/usr/bin/env python3
"""Build Indonesia-first medicine CSVs for catalog and recommendation training.

Outputs:
- model_training/data/medicine_primer_indonesia.csv
- model_training/data/medicine_training_hybrid.csv
"""

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OTC_PATH = DATA_DIR / "indonesia_otc_medicines.csv"
PRIMARY_PATH = DATA_DIR / "medicine_primer.csv"
TRAINING_PATH = DATA_DIR / "medicine_training.csv"
OUT_PRIMARY = DATA_DIR / "medicine_primer_indonesia.csv"
OUT_TRAINING = DATA_DIR / "medicine_training_hybrid.csv"

STANDARD_FIELDS = [
    "Medicine Name",
    "Composition",
    "Uses",
    "Side_effects",
    "Image URL",
    "Manufacturer",
    "Excellent Review %",
    "Average Review %",
    "Poor Review %",
    "Category",
    "Requires Prescription",
    "Is OTC",
    "Symptom Keywords",
    "Recommendation Note",
]


def read_csv(path: Path):
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows):
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=STANDARD_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def normalize_existing(row):
    return {
        "Medicine Name": row.get("Medicine Name", "").strip(),
        "Composition": row.get("Composition", "").strip(),
        "Uses": row.get("Uses", "").strip(),
        "Side_effects": row.get("Side_effects", "").strip(),
        "Image URL": row.get("Image URL", "").strip(),
        "Manufacturer": row.get("Manufacturer", "").strip(),
        "Excellent Review %": row.get("Excellent Review %", "0").strip() or "0",
        "Average Review %": row.get("Average Review %", "0").strip() or "0",
        "Poor Review %": row.get("Poor Review %", "0").strip() or "0",
        "Category": row.get("Category", "Lainnya").strip() or "Lainnya",
        "Requires Prescription": row.get("Requires Prescription", "unknown").strip() or "unknown",
        "Is OTC": row.get("Is OTC", "unknown").strip() or "unknown",
        "Symptom Keywords": row.get("Symptom Keywords", "").strip(),
        "Recommendation Note": row.get("Recommendation Note", "").strip(),
    }


def normalize_otc(row):
    return {
        "Medicine Name": row.get("name", "").strip(),
        "Composition": row.get("composition", "").strip(),
        "Uses": row.get("uses", "").strip(),
        "Side_effects": row.get("side_effects", "").strip(),
        "Image URL": row.get("image_url", "").strip(),
        "Manufacturer": row.get("manufacturer", "").strip(),
        "Excellent Review %": "80",
        "Average Review %": "15",
        "Poor Review %": "5",
        "Category": row.get("category", "Lainnya").strip() or "Lainnya",
        "Requires Prescription": row.get("requires_prescription", "false").strip() or "false",
        "Is OTC": row.get("is_otc", "true").strip() or "true",
        "Symptom Keywords": row.get("symptom_keywords", "").strip(),
        "Recommendation Note": row.get("recommendation_note", "").strip(),
    }


def dedupe(rows):
    seen = set()
    result = []
    for row in rows:
        name = row["Medicine Name"].casefold().strip()
        if not name or name in seen:
            continue
        seen.add(name)
        result.append(row)
    return result


def main():
    otc_rows = [normalize_otc(row) for row in read_csv(OTC_PATH)]
    primary_rows = [normalize_existing(row) for row in read_csv(PRIMARY_PATH)]
    training_rows = [normalize_existing(row) for row in read_csv(TRAINING_PATH)]

    indonesia_primary = dedupe(otc_rows + primary_rows)[:200]
    hybrid_training = dedupe(otc_rows + training_rows)

    write_csv(OUT_PRIMARY, indonesia_primary)
    write_csv(OUT_TRAINING, hybrid_training)

    print(f"Saved {len(indonesia_primary)} rows -> {OUT_PRIMARY}")
    print(f"Saved {len(hybrid_training)} rows -> {OUT_TRAINING}")


if __name__ == "__main__":
    main()
