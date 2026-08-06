"""
auto_assign_photos.py
---------------------
Script ini mencocokkan nama file webp di folder public/medicines/
dengan nama obat di database, lalu mengupdate kolom photo yang kosong.

Cara pakai:
  cd backend
  python auto_assign_photos.py
"""

import os
import sys
import re

# Tambahkan folder backend ke path agar bisa import models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Medicine


# ──────────────────────────────────────────────────────────────────────────────
# Konfigurasi
# ──────────────────────────────────────────────────────────────────────────────
# Folder tempat file webp tersedia (relatif dari root publik frontend)
MEDICINES_PUBLIC_PATH = '/medicines/'   # URL path yang diakses browser


def normalize(text: str) -> str:
    """Lowercase + hapus karakter non-alphanumeric untuk fuzzy matching."""
    text = text.lower()
    # Hapus tanda baca dan simbol
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Normalisasi spasi
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def score_match(med_name: str, file_stem: str) -> int:
    """
    Hitung skor kemiripan antara nama obat dan nama file.
    Skor lebih tinggi = lebih mirip.
    """
    norm_med = normalize(med_name)
    norm_file = normalize(file_stem)

    # Exact match
    if norm_med == norm_file:
        return 100

    # File contains medicine name
    if norm_med in norm_file:
        return 90

    # Medicine name contains file stem
    if norm_file in norm_med:
        return 85

    # Token overlap score
    med_tokens = set(norm_med.split())
    file_tokens = set(norm_file.split())
    if not med_tokens or not file_tokens:
        return 0

    overlap = med_tokens & file_tokens
    # Hitung rasio overlap terhadap token terpendek
    ratio = len(overlap) / min(len(med_tokens), len(file_tokens))
    return int(ratio * 80)


def get_best_match(med_name: str, file_stems: list) -> tuple:
    """Kembalikan (filename_with_ext, score) terbaik untuk nama obat."""
    best_file = None
    best_score = 0

    for stem, filename in file_stems:
        s = score_match(med_name, stem)
        if s > best_score:
            best_score = s
            best_file = filename

    return best_file, best_score


def main():
    # ── Setup Flask app context ──────────────────────────────────────────────
    app = create_app()

    # ── Baca daftar file webp dari folder public/medicines atau static/medicines ──────
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.normpath(os.path.join(script_dir, '..', 'frontend', 'public', 'medicines'))
    static_dir = os.path.normpath(os.path.join(script_dir, 'static', 'medicines'))

    target_dir = None
    if os.path.isdir(public_dir) and any(f.lower().endswith('.webp') for f in os.listdir(public_dir)):
        target_dir = public_dir
    elif os.path.isdir(static_dir) and any(f.lower().endswith('.webp') for f in os.listdir(static_dir)):
        target_dir = static_dir

    if not target_dir:
        print(f"Error: Folder foto tidak ditemukan di {public_dir} maupun {static_dir}")
        sys.exit(1)

    webp_files = [f for f in os.listdir(target_dir) if f.lower().endswith('.webp')]
    print(f"OK: Ditemukan {len(webp_files)} file webp di folder {target_dir}\n")

    # Buat list (stem, filename) — stem = nama tanpa ekstensi
    file_stems = [(os.path.splitext(f)[0], f) for f in webp_files]

    # ── Update database ──────────────────────────────────────────────────────
    with app.app_context():
        # Ambil semua obat di database untuk disinkronkan fotonya
        medicines = Medicine.query.all()

        print(f"Info: Memproses sinkronisasi foto untuk {len(medicines)} obat di database...\n")

        MIN_SCORE = 60   # Skor minimum untuk dianggap cocok
        updated = 0
        skipped = 0
        skipped_names = []

        for med in medicines:
            best_file, score = get_best_match(med.name, file_stems)

            if best_file and score >= MIN_SCORE:
                url = MEDICINES_PUBLIC_PATH + best_file
                med.photo = url
                print(f"  OK [{score:3d}] {med.name[:45]:<45} -> {best_file}")
                updated += 1
            else:
                skipped += 1
                skipped_names.append(med.name)
                if best_file:
                    print(f"  WARN [{score:3d}] {med.name[:45]:<45} -> (tidak cocok, kandidat: {best_file})")
                else:
                    print(f"  WARN [  0] {med.name[:45]:<45} -> (tidak ada kandidat)")

        # Commit semua perubahan sekaligus
        db.session.commit()

        print(f"\n{'-'*60}")
        print(f"Selesai diupdate : {updated} obat")
        print(f"Dilewati (skor rendah) : {skipped} obat")
        if skipped_names:
            print(f"\n{'-'*60}")
            print("Obat yang tidak cocok (perlu assign manual):")
            for name in skipped_names:
                print(f"  - {name}")
        print(f"\nSelesai! Refresh admin dashboard untuk melihat hasilnya.")


if __name__ == '__main__':
    main()
