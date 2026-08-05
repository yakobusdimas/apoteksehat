import csv
import os

csv_path = r'c:\Users\yakob\OneDrive\Documents\APOTEK\model_training\data\indonesia_otc_medicines.csv'

def generate_dosage(name, composition, category):
    name_l = name.lower()
    comp_l = composition.lower()
    cat_l = category.lower()

    # Sirup Anak
    if 'anak' in name_l or 'sirup' in name_l or 'syrup' in comp_l:
        return 'Anak 2-6 tahun: 1 sendok takar (5ml) 3-4 kali sehari. Anak 6-12 tahun: 2 sendok takar (10ml) 3-4 kali sehari sesudah makan.'
    
    # Salep / Gel / Cream
    if any(w in name_l for w in ['gel', 'cream', 'krim', 'salep', 'lotion', 'ointment']):
        return 'Oleskan tipis dan merata pada area kulit yang sakit 2-3 kali sehari setelah dibersihkan.'

    # Tetes Mata / Telinga / Spray
    if 'mata' in cat_l or 'tetes' in name_l or 'spray' in name_l:
        return 'Teteskan 1-2 tetes pada mata/telinga yang sakit 3-4 kali sehari atau sesuai kebutuhan.'

    # Sachet / Cairan Herbal / Minuman
    if 'sachet' in name_l or 'herbal' in cat_l or 'botol' in name_l:
        return 'Dewasa: 1 sachet/botol dilarutkan dalam air hangat/langsung diminum, 2-3 kali sehari sesudah makan.'

    # Antasida / Maag / Lambung
    if any(w in name_l or w in comp_l for w in ['promag', 'mylanta', 'antasida', 'polysilane', 'maag', 'lambung']):
        return 'Dewasa: 1-2 tablet dikunyah 1 jam sebelum makan atau 2 jam sesudah makan dan sebelum tidur.'

    # Suplemen / Vitamin
    if 'vitamin' in cat_l or any(w in name_l for w in ['vit', 'zinc', 'iron', 'kalsium', 'multivitamin']):
        return 'Dewasa: 1 tablet/kapsul sekali sehari sesudah makan pagi atau siang.'

    # Obat Flu & Batuk / Demam / Nyeri (Tablet / Kaplet / Kapsul)
    if any(w in name_l or w in comp_l for w in ['paracetamol', 'ibuprofen', 'mixagrip', 'procold', 'bodrex', 'panadol', 'biogesic', 'amoxisan', 'siladex']):
        return 'Dewasa & Anak >12 tahun: 1 tablet 3-4 kali sehari sesudah makan (maksimal 4 tablet sehari). Anak 6-12 tahun: 1/2 tablet 3-4 kali sehari.'

    # Default Tablet / Kapsul Umum
    return 'Dewasa: 1 tablet/kapsul 3 kali sehari sesudah makan. Anak 6-12 tahun: 1/2 tablet 3 kali sehari.'

def generate_side_effects(name, composition, category, current_sf):
    name_l = name.lower()
    comp_l = composition.lower()
    
    sf_items = []
    if current_sf and current_sf.strip() and current_sf.strip() != 'Jarang':
        sf_items.append(current_sf.strip())

    if any(w in name_l or w in comp_l for w in ['ctm', 'dextromethorphan', 'pseudoephedrine', 'flu', 'batuk']):
        sf_items.append('Mengantuk ringan, mulut terasa kering, pusing')
    elif any(w in name_l or w in comp_l for w in ['paracetamol', 'ibuprofen', 'nyeri', 'demam']):
        sf_items.append('Jarang terjadi mual atau gangguan lambung ringan jika dikonsumsi berlebihan')
    elif any(w in name_l or w in comp_l for w in ['antasida', 'maag', 'promag', 'mylanta']):
        sf_items.append('Sembelit atau diare ringan jika dikonsumsi jangka panjang')
    else:
        sf_items.append('Secara umum ditoleransi dengan baik. Efek samping jarang terjadi jika dikonsumsi sesuai dosis.')

    return '. '.join(list(dict.fromkeys(sf_items)))

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = list(reader.fieldnames)
    if 'dosage' not in fieldnames:
        fieldnames.append('dosage')
    rows = list(reader)

for r in rows:
    name = r.get('name', '')
    comp = r.get('composition', '')
    cat = r.get('category', '')
    curr_sf = r.get('side_effects', '')

    r['dosage'] = generate_dosage(name, comp, cat)
    r['side_effects'] = generate_side_effects(name, comp, cat, curr_sf)

with open(csv_path, mode='w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

    print(f'[OK] BERHASIL memperkaya data DOSIS dan EFEK SAMPING untuk {len(rows)} produk obat!')
