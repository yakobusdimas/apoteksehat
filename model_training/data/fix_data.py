"""Fix Vegeta Ibu Hamil -> Vegeta Herbal, update Vfresh description"""
import csv, json
from pathlib import Path

BASE = Path('.')
CSV  = BASE / 'indonesia_otc_medicines.csv'
JSON = BASE / 'medicines_primary.json'

# Fix CSV
with open(CSV, 'r', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))
    fields = csv.DictReader(open(CSV, 'r', encoding='utf-8')).fieldnames

changed_csv = 0
for r in rows:
    name = r.get('name', '')
    # Fix 1: Vegeta Ibu Hamil -> Vegeta Herbal
    if 'vegeta' in name.lower() and 'hamil' in name.lower():
        r['name'] = 'Vegeta Herbal'
        r['uses'] = 'Vegeta Herbal digunakan sebagai minuman herbal serat untuk membantu melancarkan pencernaan dan menjaga kesehatan tubuh.'
        r['image_url'] = '/static/medicines/Vegeta Herbal.jpg'
        changed_csv += 1
        print(f'CSV: Renamed "{name}" -> "Vegeta Herbal"')
    # Fix 2: Vfresh -> roll on description
    if 'vfresh' in name.lower() or name.lower() == 'vfresh':
        r['uses'] = 'Vfresh adalah minyak angin aromaterapi dalam bentuk roll on yang praktis. Memberikan sensasi segar dan hangat untuk meredakan pusing, mual, dan masuk angin. Dapat diaplikasikan langsung ke kulit.'
        r['image_url'] = '/static/medicines/Vfresh Sirup.jpg'
        changed_csv += 1
        print(f'CSV: Updated Vfresh description')

with open(CSV, 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    w.writerows(rows)

# Fix JSON
jdata = json.load(open(JSON, 'r', encoding='utf-8'))
changed_json = 0
for m in jdata['medicines']:
    name = m.get('name', '')
    if 'vegeta' in name.lower() and 'hamil' in name.lower():
        m['name'] = 'Vegeta Herbal'
        m['uses'] = 'Vegeta Herbal digunakan sebagai minuman herbal serat untuk membantu melancarkan pencernaan dan menjaga kesehatan tubuh.'
        m['image_url'] = '/static/medicines/Vegeta Herbal.jpg'
        changed_json += 1
        print(f'JSON: Renamed "{name}" -> "Vegeta Herbal"')
    if 'vfresh' in name.lower() or name.lower() == 'vfresh':
        m['uses'] = 'Vfresh adalah minyak angin aromaterapi dalam bentuk roll on yang praktis. Memberikan sensasi segar dan hangat untuk meredakan pusing, mual, dan masuk angin.'
        m['image_url'] = '/static/medicines/Vfresh Sirup.jpg'
        changed_json += 1
        print(f'JSON: Updated Vfresh')

json.dump(jdata, open(JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'\nCSV changes: {changed_csv} | JSON changes: {changed_json}')
