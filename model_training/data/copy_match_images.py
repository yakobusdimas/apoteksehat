"""
copy_match_images.py
======================
Copy gambar dari Downloads ke backend/static/medicines
dengan fuzzy matching nama file → nama obat di database.

Cara pakai:
  python copy_match_images.py
"""

import shutil
import csv
import os
import re
from pathlib import Path
from difflib import SequenceMatcher

SRC_DIR  = Path(r"C:\Users\yakob\Downloads\Gambar Obat")
DST_DIR  = Path(__file__).parent.parent.parent / "backend" / "static" / "medicines"
CSV_FILE = Path(__file__).parent / "indonesia_otc_medicines.csv"

THRESHOLD = 0.55  # Minimum similarity score (0-1)


def normalize(s: str) -> str:
    """Normalize string for comparison"""
    s = s.lower()
    # Hapus ukuran/satuan umum
    s = re.sub(r'\b\d+\s*(ml|mg|g|gr|mcg|iu|tablet|kapsul|sachet|strip|botol|tube|pot|sirup|drops?|cream|krim|gel|salep|spray|inhaler|suppositoria|anak|dewasa|forte|plus|extra|regular|original|box|isi)\b', '', s)
    # Hapus karakter non-alphanumeric
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    s = ' '.join(s.split())
    return s


def similarity(a: str, b: str) -> float:
    na, nb = normalize(a), normalize(b)
    return SequenceMatcher(None, na, nb).ratio()


def best_match(filename_stem: str, medicine_names: list[str]) -> tuple[str, float]:
    """Cari nama obat yang paling mirip dengan nama file"""
    best_name = ""
    best_score = 0.0
    for name in medicine_names:
        score = similarity(filename_stem, name)
        if score > best_score:
            best_score = score
            best_name = name
    return best_name, best_score


def main():
    print("=" * 60)
    print("  COPY & MATCH GAMBAR OBAT")
    print("=" * 60)

    # Baca nama obat dari CSV
    medicine_names = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            medicine_names.append(row['name'].strip())
    print(f"  Obat di database: {len(medicine_names)}")

    # Buat folder tujuan
    DST_DIR.mkdir(parents=True, exist_ok=True)

    # Daftar file di source
    src_files = [f for f in SRC_DIR.iterdir() if f.is_file()
                 and f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif')]
    print(f"  File gambar di Downloads: {len(src_files)}")

    # File yang sudah ada di tujuan
    existing = {f.stem.lower() for f in DST_DIR.iterdir() if f.is_file()}
    print(f"  Sudah ada di static: {len(existing)}")
    print("=" * 60)

    copied    = 0
    skipped   = 0
    no_match  = 0
    log_rows  = []

    for src_file in sorted(src_files):
        stem = src_file.stem  # nama tanpa ekstensi
        ext  = src_file.suffix.lower()

        # Cek apakah file dengan nama persis sudah ada
        if stem.lower() in existing:
            skipped += 1
            continue

        # Cari match terbaik di nama obat
        match_name, score = best_match(stem, medicine_names)

        if score < THRESHOLD:
            print(f"  [NO MATCH] {stem[:50]:<50} (best: {score:.2f})")
            no_match += 1
            log_rows.append({"file": stem, "match": "", "score": score, "action": "skipped"})
            continue

        # Tentukan nama file tujuan
        # Gunakan nama obat dari DB sebagai nama file, tapi pertahankan nama asli juga
        dst_name = f"{stem}{ext}"
        dst_path = DST_DIR / dst_name

        if dst_path.exists():
            skipped += 1
            continue

        shutil.copy2(src_file, dst_path)
        copied += 1
        log_rows.append({"file": stem, "match": match_name, "score": round(score, 2), "action": "copied"})
        print(f"  [OK] {stem[:45]:<45} -> {match_name[:30]} ({score:.2f})")

    print()
    print("=" * 60)
    print(f"  Berhasil dicopy : {copied}")
    print(f"  Di-skip (ada)   : {skipped}")
    print(f"  Tidak ada match : {no_match}")
    print(f"  Total di folder : {len(list(DST_DIR.iterdir()))}")
    print("=" * 60)

    # Simpan log
    log_path = Path(__file__).parent / "image_match_log.csv"
    import csv as csv_mod
    with open(log_path, 'w', newline='', encoding='utf-8') as f:
        w = csv_mod.DictWriter(f, fieldnames=["file", "match", "score", "action"])
        w.writeheader()
        w.writerows(log_rows)
    print(f"\nLog tersimpan: {log_path.name}")


if __name__ == "__main__":
    main()
