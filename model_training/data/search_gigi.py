import csv

rows = list(csv.DictReader(open('indonesia_otc_medicines.csv','r',encoding='utf-8')))
keywords = ['gigi','dental','sakit gigi','gusi','kumur','antiseptik mulut']

found = []
for r in rows:
    text = (r.get('name','') + ' ' + r.get('uses','') + ' ' + r.get('symptom_keywords','')).lower()
    if any(k in text for k in keywords):
        found.append(r)

print(f'Obat sakit gigi/mulut ditemukan: {len(found)}')
print()
for r in found:
    name = r['name']
    cat  = r['category']
    uses = r['uses'][:80]
    print(f'  - {name} | {cat}')
    print(f'    {uses}')
    print()
