from pathlib import Path, PureWindowsPath
import shutil

SRC = Path(r"C:\Users\yakob\Downloads\Gambar Obat")
DST = Path(__file__).parent.parent.parent / "backend" / "static" / "medicines"

missing = ['Nature-E Kapsul','Alphosyl HC Krim','Hydrocortisone 1% Cream','Amoxicillin Sirup 60ml','Soyisoflavon Kapsul','Vegeta Kapsul','Betadine Mouthwash 100ml','Counterpain Cream']

files = {f.stem.lower(): f for f in SRC.iterdir() if f.is_file()}

found_count = 0
for m in missing:
    mk = m.lower().replace('-','').replace('  ',' ').strip()
    # Exact match
    if mk in files:
        fp = files[mk]
        ext = fp.suffix.lower()
        ext_map = {'.jpg':'.jpg','.jpeg':'.jpeg','.png':'.png','.webp':'.webp'}
        dst_ext = ext if ext in ext_map else '.jpg'
        dst_name = f"{m}{dst_ext}"
        # Cek apakah nama file di DST sudah ada versi .webp
        dst_webp = DST / (m + '.webp')
        if dst_webp.exists():
            print(f'SKIP {m} -> sudah ada .webp')
            continue
        dst_path = DST / dst_name
        shutil.copy2(fp, dst_path)
        print(f'COPY {m:30s} -> {dst_name}')
        found_count += 1
        continue
    
    # Cari partial
    best = None
    best_score = 0
    for fname, fpath in files.items():
        words = mk.split()
        matched = sum(1 for w in words if w in fname and len(w) > 2)
        if matched >= 2 and matched > best_score:
            best_score = matched
            best = fpath
    if best:
        ext = best.suffix.lower()
        dst_name = f"{m}{ext}"
        dst_webp = DST / (m + '.webp')
        if dst_webp.exists():
            print(f'SKIP {m} -> sudah ada .webp')
            continue
        dst_path = DST / dst_name
        shutil.copy2(best, dst_path)
        print(f'PARTIAL {m:30s} -> {best.name}')
        found_count += 1
    else:
        print(f'GAGAL  {m:30s} -> TIDAK ADA')

print(f'\nBerhasil dipasangkan: {found_count}')

# Re-run optimasi untuk file baru
print('\nJalankan optimasi ulang...')
import subprocess
subprocess.run(['python', 'optimize_images.py'], check=True)
