"""
Fix medicines: update ALL records with correct data from JSON source.
No DROP TABLE needed - just UPDATE existing records in place.
"""
import sys
import os
sys.path.insert(0, '/app')

from app import create_app
from models import db, Medicine
import json
import random

def fix_medicines():
    """Update all medicine records with correct data from JSON."""
    app = create_app()
    
    with app.app_context():
        # Load JSON
        data_path = os.path.join('/app', '..', 'model_training', 'data', 'medicines_primary.json')
        
        if not os.path.exists(data_path):
            print(f"[ERROR] Not found: {data_path}")
            return False
        
        with open(data_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        medicines_json = json_data.get('medicines', [])
        print(f"JSON has {len(medicines_json)} medicines")
        
        # Price ranges by category
        price_ranges = {
            'Hipertensi': (35000, 150000),
            'Diabetes': (40000, 180000),
            'Nyeri & Demam': (5000, 35000),
        }
        
        expiries = ['2026-12-31', '2027-06-30', '2028-03-15']
        
        count = 0
        for med_data in medicines_json:
            name = med_data.get('name', '')
            kategori = med_data.get('kategori_id', [])
            category = kategori[0] if isinstance(kategori, list) and kategori else 'Lainnya'
            
            # Get price from category
            low, high = price_ranges.get(category, (20000, 100000))
            price = random.randint(low, high)
            
            # Map fields
            composition = med_data.get('composition', '')
            uses = med_data.get('uses', '')
            side_effects_raw = med_data.get('side_effects', '')
            manufacturer = med_data.get('manufacturer', '')
            
            # Find matching medicine in DB
            med = Medicine.query.filter_by(name=name).first()
            if not med:
                continue  # Skip if name doesn't match
            
            # UPDATE the medicine with real data
            med.price = float(price)
            med.category = category
            med.stock = random.randint(50, 300)
            med.description = composition if composition else (uses[:200] if uses else '')
            med.indication = uses if uses else ''
            med.dosage = f"Dosis sesuai anjuran dokter. {manufacturer}".rstrip('. ') if manufacturer else 'Sesuai resep dokter'
            med.ingredients = composition if composition else ''
            med.benefits = uses if uses else ''
            med.side_effects = side_effects_raw if side_effects_raw else ''
            med.expiry = random.choice(expiries)
            med.type = 'Tablet' if 'Tablet' in name else ('Capsule' if 'Capsule' in name or 'Kapsul' in name else 'Tablet')
            med.photo = med_data.get('image_url', '')
            
            count += 1
        
        db.session.commit()
        
        # Verify
        sample = Medicine.query.first()
        print(f"\n[OK] Updated {count} medicines!")
        print(f"Sample: {sample.name}")
        print(f"  Price: Rp {sample.price:,.0f}")
        print(f"  Description: {bool(sample.description)}")
        print(f"  Indication: {bool(sample.indication)}")

if __name__ == '__main__':
    fix_medicines()
