"""
Emergency fix: Drop and reseed medicines table with correct data from JSON.
This fixes the issue where medicines exist but price/description/indication are empty.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import db, Medicine
import json

def fix_medicines():
    """Drop and reseed medicines with correct data."""
    app = create_app()
    
    with app.app_context():
        # Check current state
        existing_count = Medicine.query.count()
        print(f"Found {existing_count} medicines in database")
        
        # Load JSON data
        data_path = os.path.join(
            os.path.dirname(__file__), '..', 'model_training', 'data', 'medicines_primary.json'
        )
        
        if not os.path.exists(data_path):
            print(f"[ERROR] Medicine data file not found: {data_path}")
            return False
        
        with open(data_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        medicines_list = json_data.get('medicines', [])
        if not medicines_list:
            print("[ERROR] No medicines found in JSON file")
            return False
        
        print(f"JSON contains {len(medicines_list)} medicines")
        
        # Drop medicines table and recreate
        print("Dropping medicines table...")
        db.session.execute(db.text("DELETE FROM order_items"))
        db.session.commit()
        db.session.execute(db.text("DELETE FROM medicines"))
        db.session.commit()
        
        from sqlalchemy import text
        db.session.execute(text("DROP TABLE IF EXISTS medicines CASCADE"))
        db.session.execute(text("CREATE SEQUENCE medicines_id_seq RESTART WITH 1"))
        print("[OK] Medicines table dropped")
        
        # Recreate tables using SQLAlchemy (creates all missing tables)
        print("Recreating tables...")
        db.create_all()
        print("[OK] Tables recreated")
        
        # Recreate with proper data from JSON
        print("Reseeding medicines with correct data...")
        count = 0
        for med in medicines_list:
            m = Medicine(
                name=med.get('name', ''),
                category=med.get('category', 'Lainnya'),
                price=float(med.get('price', 0)),
                stock=50,  # Will be updated later
                description=med.get('description', ''),
                indication=med.get('indication', ''),
                dosage=med.get('dosage', ''),
                ingredients=med.get('ingredients', ''),
                benefits=med.get('benefits', ''),
                side_effects=med.get('side_effects', ''),
                expiry='',
                type=med.get('type', 'Tablet'),
                photo=med.get('photo', ''),
            )
            db.session.add(m)
            count += 1
        
        db.session.commit()
        
        # Verify
        new_count = Medicine.query.count()
        sample = Medicine.query.first()
        
        print(f"\n[OK] Reseeded {new_count} medicines")
        print(f"Sample: {sample.name}")
        print(f"  Price: Rp {sample.price:,.0f}")
        print(f"  Has description: {bool(sample.description)}")
        print(f"  Has indication: {bool(sample.indication)}")

if __name__ == '__main__':
    fix_medicines()
