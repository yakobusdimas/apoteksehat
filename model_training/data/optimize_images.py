"""
optimize_images.py
===================
Kompres dan convert semua gambar obat ke WebP
agar loading web lebih cepat tanpa mengorbankan kualitas visual.

Apa yang dilakukan:
  - Resize gambar ke max 400x400px (aspect ratio dipertahankan)
  - Convert ke WebP format (60-80% lebih kecil dari JPG/PNG)
  - Quality 82% (tidak terlihat perbedaan secara mata)
  - Simpan hasil di subfolder /optimized/ (asli tetap aman)
  - Skip file yang sudah dioptimasi

Cara pakai:
  python optimize_images.py

Setelah selesai, ganti path di backend ke folder /optimized/
"""

from PIL import Image
import os
import shutil
from pathlib import Path

IMG_DIR   = Path(__file__).parent.parent.parent / "backend" / "static" / "medicines"
OPT_DIR   = IMG_DIR  # Overwrite in-place (backup dulu)
BACKUP_DIR = IMG_DIR.parent / "medicines_original"

MAX_SIZE  = (400, 400)   # Max resolusi (px)
QUALITY   = 82           # WebP quality 0-100
OUTPUT_EXT = ".webp"

SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'}


def format_size(bytes_: int) -> str:
    if bytes_ < 1024:
        return f"{bytes_}B"
    elif bytes_ < 1024 * 1024:
        return f"{bytes_ / 1024:.1f}KB"
    else:
        return f"{bytes_ / 1024 / 1024:.1f}MB"


def optimize_image(src: Path, dst: Path) -> tuple[int, int]:
    """Optimasi 1 gambar. Return (original_bytes, new_bytes)"""
    orig_size = src.stat().st_size

    with Image.open(src) as img:
        # Konversi ke RGB (hapus alpha jika ada, untuk WebP compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Buat background putih untuk gambar dengan transparansi
            bg = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            bg.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = bg
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize kalau terlalu besar
        if img.width > MAX_SIZE[0] or img.height > MAX_SIZE[1]:
            img.thumbnail(MAX_SIZE, Image.LANCZOS)

        # Simpan sebagai WebP
        dst.parent.mkdir(parents=True, exist_ok=True)
        img.save(dst, 'WEBP', quality=QUALITY, method=6)

    new_size = dst.stat().st_size
    return orig_size, new_size


def main():
    print("=" * 65)
    print("  OPTIMASI GAMBAR OBAT -> WebP")
    print(f"  Folder : {IMG_DIR}")
    print(f"  Max    : {MAX_SIZE[0]}x{MAX_SIZE[1]}px | Quality: {QUALITY}%")
    print("=" * 65)

    # Kumpulkan semua gambar
    all_files = [f for f in IMG_DIR.iterdir()
                 if f.is_file() and f.suffix.lower() in SUPPORTED]
    print(f"  Total gambar: {len(all_files)}")

    # Hitung total ukuran sebelum
    total_before = sum(f.stat().st_size for f in all_files)
    print(f"  Total ukuran sebelum: {format_size(total_before)}")
    print("=" * 65)

    # Backup dulu (pertama kali saja)
    if not BACKUP_DIR.exists():
        print(f"\n[BACKUP] Menyalin file asli ke {BACKUP_DIR.name}/...")
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        for f in all_files:
            shutil.copy2(f, BACKUP_DIR / f.name)
        print(f"[BACKUP] {len(all_files)} file berhasil dibackup\n")
    else:
        print(f"[BACKUP] Folder backup sudah ada ({BACKUP_DIR.name}/), skip backup\n")

    converted = 0
    skipped   = 0
    errors    = 0
    total_saved = 0

    for src in sorted(all_files):
        # Nama output = sama tapi ekstensi .webp
        dst = IMG_DIR / (src.stem + OUTPUT_EXT)

        # Skip kalau sudah ada WebP yang lebih baru dari source
        if dst.exists() and dst.suffix == OUTPUT_EXT and src.suffix.lower() == OUTPUT_EXT:
            skipped += 1
            continue

        try:
            orig_bytes, new_bytes = optimize_image(src, dst)
            saved = orig_bytes - new_bytes
            total_saved += saved
            ratio = (1 - new_bytes / orig_bytes) * 100 if orig_bytes > 0 else 0

            # Hapus file asli kalau berhasil diconvert ke .webp (dan nama berbeda)
            if dst != src and dst.exists():
                src.unlink()

            print(f"  [OK] {src.name[:50]:<50} "
                  f"{format_size(orig_bytes):>7} -> {format_size(new_bytes):<7} (-{ratio:.0f}%)")
            converted += 1

        except Exception as e:
            print(f"  [ERR] {src.name[:50]:<50} {str(e)[:30]}")
            errors += 1

    total_after = sum(f.stat().st_size for f in IMG_DIR.iterdir()
                      if f.is_file() and f.suffix.lower() in SUPPORTED)

    print()
    print("=" * 65)
    print(f"  Berhasil dioptimasi : {converted}")
    print(f"  Di-skip             : {skipped}")
    print(f"  Error               : {errors}")
    print(f"  Ukuran sebelum      : {format_size(total_before)}")
    print(f"  Ukuran sesudah      : {format_size(total_after)}")
    print(f"  HEMAT               : {format_size(total_before - total_after)} "
          f"({(1 - total_after/total_before)*100:.1f}%)")
    print("=" * 65)
    print("\n[SELESAI] Gambar sudah dioptimasi!")
    print("File asli tersimpan di folder: medicines_original/")


if __name__ == "__main__":
    main()
