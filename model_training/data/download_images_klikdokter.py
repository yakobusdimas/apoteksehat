"""
download_images_klikdokter.py
==============================
Download gambar obat dari URL thumbnail KlikDokter.
- Skip gambar yang sudah ada di folder
- Simpan ke backend/static/medicines/
- Nama file = nama obat (slug)

Cara pakai:
  python download_images_klikdokter.py
"""

import csv
import os
import re
import time
import requests
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
CSV_FILE   = BASE_DIR / "klikdokter_medicines.csv"
# Folder tujuan gambar (sama dengan folder gambar yang sudah ada)
IMAGE_DIR  = BASE_DIR.parent.parent / "backend" / "static" / "medicines"

DELAY      = 0.5    # detik jeda antar download
TIMEOUT    = 15     # timeout request

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://www.klikdokter.com/",
}

def slugify(name: str) -> str:
    """Ubah nama obat jadi nama file yang aman"""
    name = name.strip()
    # Ganti karakter tidak valid dengan underscore
    name = re.sub(r'[\\/:*?"<>|]', '_', name)
    return name


def get_ext(url: str) -> str:
    """Ambil ekstensi dari URL gambar"""
    url_path = url.split("?")[0]
    ext = os.path.splitext(url_path)[1].lower()
    if ext in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        return ext
    return ".jpg"  # default


def main():
    print("=" * 55)
    print("  DOWNLOAD GAMBAR OBAT DARI KLIKDOKTER")
    print("=" * 55)

    # Pastikan folder tujuan ada
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  Folder tujuan: {IMAGE_DIR}")

    # Hitung gambar yang sudah ada
    existing_files = {f.stem.lower() for f in IMAGE_DIR.iterdir() if f.is_file()}
    print(f"  Gambar sudah ada: {len(existing_files)}")

    # Baca CSV KlikDokter
    to_download = []
    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name      = row.get("name", "").strip()
            image_url = row.get("image_url", "").strip()

            if not name or not image_url:
                continue

            slug = slugify(name)

            # Cek apakah sudah ada (case-insensitive)
            if slug.lower() in existing_files:
                continue

            to_download.append({
                "name": name,
                "slug": slug,
                "url": image_url,
            })

    print(f"  Akan download  : {len(to_download)} gambar")
    print(f"  Di-skip (ada)  : {len(existing_files)}")
    print("=" * 55)

    if not to_download:
        print("\n[INFO] Semua gambar sudah ada. Tidak ada yang perlu didownload.")
        return

    success = 0
    failed  = 0
    skipped = 0

    for i, item in enumerate(to_download):
        name = item["name"]
        slug = item["slug"]
        url  = item["url"]
        ext  = get_ext(url)
        filename = f"{slug}{ext}"
        filepath = IMAGE_DIR / filename

        print(f"  [{i+1:3d}/{len(to_download)}] {name[:45]:<45}", end=" ", flush=True)

        # Double-check file belum ada
        if filepath.exists():
            print("SKIP (ada)")
            skipped += 1
            continue

        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, stream=True)

            if resp.status_code == 200:
                content_type = resp.headers.get("Content-Type", "")
                # Cek apakah ini benar gambar
                if "image" in content_type or len(resp.content) > 1000:
                    with open(filepath, "wb") as f:
                        f.write(resp.content)
                    size_kb = filepath.stat().st_size // 1024
                    print(f"OK ({size_kb}KB)")
                    success += 1
                else:
                    print(f"SKIP (bukan gambar: {content_type})")
                    skipped += 1
            elif resp.status_code == 404:
                print("404 (tidak ada)")
                failed += 1
            else:
                print(f"Error {resp.status_code}")
                failed += 1

        except requests.exceptions.Timeout:
            print("TIMEOUT")
            failed += 1
        except requests.exceptions.RequestException as e:
            print(f"ERROR: {str(e)[:30]}")
            failed += 1
        except KeyboardInterrupt:
            print(f"\n\n[STOP] Dihentikan di gambar {i+1}.")
            break

        time.sleep(DELAY)

    print("\n" + "=" * 55)
    print(f"  Berhasil download : {success} gambar")
    print(f"  Gagal/tidak ada   : {failed} gambar")
    print(f"  Di-skip           : {skipped} gambar")
    print(f"  Total di folder   : {len(list(IMAGE_DIR.iterdir()))} gambar")
    print("=" * 55)
    print(f"\n[SELESAI] Gambar tersimpan di:")
    print(f"  {IMAGE_DIR}")


if __name__ == "__main__":
    main()
