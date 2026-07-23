import csv, json

# Load nama dari CSV ori (614)
csv_names = {r['name'].lower() for r in csv.DictReader(open('indonesia_otc_medicines.csv','r',encoding='utf-8'))}

# Load dan bersihkan JSON
jdata = json.load(open('medicines_primary.json','r',encoding='utf-8'))
before = len(jdata['medicines'])

jdata['medicines'] = [m for m in jdata['medicines'] if m['name'].lower() in csv_names]
jdata['total'] = len(jdata['medicines'])

json.dump(jdata, open('medicines_primary.json','w',encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'JSON dibersihkan: {before} -> {len(jdata["medicines"])} obat')
