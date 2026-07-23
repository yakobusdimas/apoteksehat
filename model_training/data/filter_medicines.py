#!/usr/bin/env python3
"""
Script untuk memfilter 200 obat umum dari Medicine_Details.csv
yang relevan untuk apotek Indonesia
"""

import pandas as pd
import json
import re

# Kategori obat yang umum di apotek Indonesia
PRIORITY_CATEGORIES = {
    'pain_fever': ['pain', 'fever', 'headache', 'migraine', 'analgesic'],
    'cough_cold': ['cough', 'cold', 'flu', 'respiratory'],
    'antibiotics': ['bacterial infection', 'antibiotic'],
    'stomach': ['acidity', 'indigestion', 'ulcer', 'gastric', 'stomach'],
    'allergy': ['allergy', 'allergic', 'antihistamine', 'sneezing', 'runny nose'],
    'vitamins': ['vitamin', 'nutritional', 'supplement'],
    'skin': ['skin', 'rash', 'dermatitis', 'itching'],
    'diabetes': ['diabetes', 'blood sugar'],
    'hypertension': ['hypertension', 'blood pressure'],
    'common_otc': ['diarrhea', 'constipation', 'nausea', 'vomiting']
}

# Obat-obatan umum yang sering dicari (nama generik/brand)
COMMON_MEDICINES = [
    'paracetamol', 'ibuprofen', 'aspirin', 'amoxicillin', 'azithromycin',
    'cetirizine', 'loratadine', 'omeprazole', 'ranitidine', 'metformin',
    'amlodipine', 'vitamin', 'multivitamin', 'antacid'
]

def score_medicine(row):
    """Calculate relevance score for a medicine"""
    score = 0
    uses = str(row['Uses']).lower()
    name = str(row['Medicine Name']).lower()
    
    # Check priority categories
    for category, keywords in PRIORITY_CATEGORIES.items():
        for keyword in keywords:
            if keyword in uses:
                score += 10
                break
    
    # Bonus for common medicine names
    for med in COMMON_MEDICINES:
        if med in name:
            score += 15
            break
    
    # Bonus for high review scores (popular medicines)
    try:
        excellent = float(row['Excellent Review %'])
        if excellent > 40:
            score += 5
        elif excellent > 30:
            score += 3
    except:
        pass
    
    return score

def clean_medicine_data(df, limit=200):
    """Filter and clean medicine data"""
    # Calculate scores
    df['relevance_score'] = df.apply(score_medicine, axis=1)
    
    # Sort by score and take top N
    df_sorted = df.sort_values('relevance_score', ascending=False)
    df_top = df_sorted.head(limit)
    
    # Create simplified dataset
    medicines = []
    for idx, row in df_top.iterrows():
        medicine = {
            'id': idx + 1,
            'name': row['Medicine Name'],
            'composition': row['Composition'],
            'uses': row['Uses'],
            'side_effects': row['Side_effects'],
            'manufacturer': row['Manufacturer'],
            'image_url': row['Image URL'],
            # Translate uses to Indonesian categories
            'kategori_id': categorize_indonesian(row['Uses'])
        }
        medicines.append(medicine)
    
    return medicines

def categorize_indonesian(uses):
    """Map English uses to Indonesian categories"""
    uses_lower = uses.lower()
    categories = []
    
    if any(k in uses_lower for k in ['pain', 'fever', 'headache']):
        categories.append('Nyeri & Demam')
    if any(k in uses_lower for k in ['cough', 'cold', 'respiratory']):
        categories.append('Batuk & Flu')
    if 'bacterial' in uses_lower or 'infection' in uses_lower:
        categories.append('Antibiotik')
    if any(k in uses_lower for k in ['stomach', 'gastric', 'ulcer', 'acidity']):
        categories.append('Lambung & Pencernaan')
    if 'allergy' in uses_lower:
        categories.append('Alergi')
    if 'vitamin' in uses_lower or 'nutritional' in uses_lower:
        categories.append('Vitamin & Suplemen')
    if 'skin' in uses_lower:
        categories.append('Kulit')
    if 'diabetes' in uses_lower:
        categories.append('Diabetes')
    if 'hypertension' in uses_lower or 'blood pressure' in uses_lower:
        categories.append('Hipertensi')
    
    return categories if categories else ['Lainnya']

def main():
    # Read CSV
    print("[*] Membaca Medicine_Details.csv...")
    df = pd.read_csv('../../Medicine_Details.csv')
    print(f"Total obat dalam database: {len(df)}")
    
    # Filter medicines
    print("[*] Memfilter 200 obat paling relevan...")
    medicines = clean_medicine_data(df, limit=200)
    
    # Save to JSON
    output_file = 'medicines_primary.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'total': len(medicines),
            'medicines': medicines
        }, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] Berhasil menyimpan {len(medicines)} obat ke {output_file}")
    
    # Print statistics
    print("\n[*] Statistik kategori:")
    category_counts = {}
    for med in medicines:
        for cat in med['kategori_id']:
            category_counts[cat] = category_counts.get(cat, 0) + 1
    
    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {cat}: {count} obat")

if __name__ == '__main__':
    main()
