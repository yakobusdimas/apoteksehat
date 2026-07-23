"""Update image paths in CSV and JSON, then reseed DB"""
import csv, json
from pathlib import Path

CSV  = Path('indonesia_otc_medicines.csv')
JSON = Path('medicines_primary.json')
IMG  = Path('../../backend/static/medicines')

# Kumpulkan semua file gambar
img_files = set()
for f in IMG.iterdir():
    if f.is_file():
        stem = f.stem.lower()
        img_files.add(stem)

print(f'Total gambar di folder: {len(img_files)}')

# Update CSV
with open(CSV, 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))
    fields = csv.DictReader(open(CSV, 'r', encoding='utf-8')).fieldnames

updated = 0
for r in rows:
    name = r['name'].strip()
    name_key = name.lower()
    if name_key in img_files:
        # Cari ekstensi asli
        for f in IMG.iterdir():
            if f.is_file() and f.stem.lower() == name_key:
                r['image_url'] = f'/static/medicines/{f.name}'
                updated += 1
                break
    else:
        # Hapus image_url atau set fallback
        r['image_url'] = ''

print(f'CSV updated: {updated} rows with images')

with open(CSV, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

# Update JSON image_url but keep original if exists
jdata = json.load(open(JSON, 'r', encoding='utf-8'))
for m in jdata['medicines']:
    name_key = m['name'].strip().lower()
    if name_key in img_files:
        for f in IMG.iterdir():
            if f.is_file() and f.stem.lower() == name_key:
                m['image_url'] = f'/static/medicines/{f.name}'
                break
    else:
        m['image_url'] = ''

json.dump(jdata, open(JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# Hitung final
final_with_img = sum(1 for m in jdata['medicines'] if m.get('image_url'))
print(f'JSON: {final_with_img}/{len(jdata["medicines"])} medicines have image_url')

print('\n✅ Done!')
