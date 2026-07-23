#!/usr/bin/env python3
"""Convert Indonesia OTC CSV to medicines_primary.json used by chatbot resources."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "indonesia_otc_medicines.csv"
OUT_PATH = ROOT / "data" / "medicines_primary.json"
BACKUP_PATH = ROOT / "data" / "backups" / "medicines_primary_before_indonesia_otc.json"


def main():
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)
    if OUT_PATH.exists() and not BACKUP_PATH.exists():
        BACKUP_PATH.write_text(OUT_PATH.read_text(encoding="utf-8"), encoding="utf-8")

    medicines = []
    with CSV_PATH.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            name = row.get("name", "").strip()
            if not name:
                continue
            uses = row.get("uses", "").strip()
            keywords = row.get("symptom_keywords", "").strip()
            note = row.get("recommendation_note", "").strip()
            medicines.append({
                "id": idx,
                "name": name,
                "composition": row.get("composition", "").strip(),
                "uses": f"{uses}; Gejala terkait: {keywords}; {note}".strip("; "),
                "side_effects": row.get("side_effects", "").strip(),
                "manufacturer": row.get("manufacturer", "").strip(),
                "image_url": row.get("image_url", "").strip(),
                "kategori_id": [row.get("category", "Lainnya").strip() or "Lainnya"],
                "requires_prescription": row.get("requires_prescription", "false").strip().lower() == "true",
                "is_otc": row.get("is_otc", "true").strip().lower() == "true",
                "symptom_keywords": keywords,
                "recommendation_note": note,
            })

    OUT_PATH.write_text(
        json.dumps({"total": len(medicines), "medicines": medicines}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Saved {len(medicines)} medicines -> {OUT_PATH}")
    print(f"Backup -> {BACKUP_PATH}")


if __name__ == "__main__":
    main()
