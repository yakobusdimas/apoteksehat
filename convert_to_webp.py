"""
Konversi semua gambar obat ke format WebP (400x400, kualitas 80%)
- Input : C:\\Users\\yakob\\Downloads\\Gambar Obat\\  (semua jpg/jpeg/png)
- Output: backend/static/medicines/  (WebP, nama sama, ekstensi .webp)

Cara pakai:
    python convert_to_webp.py
"""

from pathlib import Path
from PIL import Image

SRC_DIR = Path(r"C:\Users\yakob\Downloads\Gambar Obat")
DST_DIR = Path(__file__).parent / "backend" / "static" / "medicines"
DST_DIR.mkdir(parents=True, exist_ok=True)

IMG_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".tiff", ".webp"}
TARGET_SIZE    = (400, 400)   # piksel
WEBP_QUALITY   = 80           # 0-100, makin besar makin bagus tapi makin besar filenya

src_files = [f for f in SRC_DIR.iterdir() if f.suffix.lower() in IMG_EXTENSIONS]
print(f"Ditemukan {len(src_files)} gambar di {SRC_DIR}")

skipped = converted = error = 0

for src in src_files:
    dst = DST_DIR / (src.stem + ".webp")

    # Kalau sudah ada dan lebih baru dari sumber, lewati
    if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
        skipped += 1
        continue

    try:
        with Image.open(src) as img:
            img = img.convert("RGBA") if img.mode == "RGBA" else img.convert("RGB")

            # Resize dengan mempertahankan rasio aspek (thumbnail)
            img.thumbnail(TARGET_SIZE, Image.LANCZOS)

            # Tambahkan padding putih agar hasil persegi 400x400
            bg = Image.new("RGB", TARGET_SIZE, (255, 255, 255))
            offset = ((TARGET_SIZE[0] - img.size[0]) // 2,
                      (TARGET_SIZE[1] - img.size[1]) // 2)
            bg.paste(img, offset)

            bg.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
            converted += 1
            print(f"  ✓ {src.name}  →  {dst.name}")
    except Exception as e:
        error += 1
        print(f"  ✗ {src.name}: {e}")

print(f"\nSelesai! Dikonversi: {converted} | Dilewati: {skipped} | Error: {error}")
print(f"Gambar WebP tersimpan di: {DST_DIR}")
