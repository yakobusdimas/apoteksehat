"""
Database seeder — populate database with medicines and sample orders.
Run: python seed.py
"""

import os
import sys
import json
import uuid
import random
from datetime import datetime, timedelta

# Add parent to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import db, User, Medicine, Order, OrderItem
from utils.seeding import seed_admin


def seed_medicines():
    """Seed medicines from JSON data file or use fallback data."""
    data_path = os.path.join(
        os.path.dirname(__file__), '..', 'model_training', 'data', 'medicines_primary.json'
    )

    # Fallback data if file not found
    fallback_data = {
        "medicines": [
            {"name": "Paracetamol 500mg", "kategori_id": ["Nyeri & Demam"], "composition": "Paracetamol 500mg", "uses": "Meredakan demam dan nyeri ringan", "side_effects": "Mual, pusing", "manufacturer": "PT Kimia Farma", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Paracetamol"},
            {"name": "Amoxicillin 500mg", "kategori_id": ["Antibiotik"], "composition": "Amoxicillin 500mg", "uses": "Infeksi bakteri", "side_effects": "Diare, ruam", "manufacturer": "PT Kalbe Farma", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Amoxicillin"},
            {"name": "OBH Combi Sirup", "kategori_id": ["Batuk"], "composition": "Dextromethorphan HBr, Guaifenesin", "uses": "Batuk berdahak", "side_effects": "Mengantuk", "manufacturer": "PT Sanbe Farma", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=OBH+Combi"},
            {"name": "Vitamin C 1000mg", "kategori_id": ["Vitamin"], "composition": "Vitamin C 1000mg", "uses": "Meningkatkan imunitas", "side_effects": "Gangguan lambung", "manufacturer": "PT Darya-Varia", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Vitamin+C"},
            {"name": "Mixagrip Tablet", "kategori_id": ["Flu"], "composition": "Paracetamol, Phenylpropanolamine HCl", "uses": "Gejala flu", "side_effects": "Mengantuk", "manufacturer": "PT Tempo Scan Pacific", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Mixagrip"},
            {"name": "Diabex 500mg", "kategori_id": ["Diabetes"], "composition": "Metformin HCl 500mg", "uses": "Diabetes tipe 2", "side_effects": "Mual, diare", "manufacturer": "PT Dexa Medica", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Diabex"},
            {"name": "Norvasc 10mg", "kategori_id": ["Hipertensi"], "composition": "Amlodipine 10mg", "uses": "Hipertensi", "side_effects": "Pusing, edema", "manufacturer": "PT Pfizer Indonesia", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Norvasc"},
            {"name": "Simvastatin 20mg", "kategori_id": ["Kolesterol"], "composition": "Simvastatin 20mg", "uses": "Menurunkan kolesterol", "side_effects": "Nyeri otot", "manufacturer": "PT Merck Tbk", "image_url": "https://placehold.co/400x400/0f766e/ffffff?text=Simvastatin"},
        ]
    }

    json_data = None
    if os.path.exists(data_path):
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
        except Exception as e:
            print(f"[WARN] Failed to read medicine data file: {data_path} ({e})")

    if not json_data:
        print("[WARN] Using fallback medicine data")
        json_data = fallback_data

    # Fix Bug #4: deteksi reseed berdasarkan jumlah kategori, bukan hanya harga == 0
    # Jika kategori DB tidak mencakup data baru (misal 14 kategori baru), paksa reseed
    existing_count = Medicine.query.count()
    if existing_count > 0:
        print(f"[!] Found {existing_count} existing medicines. Checking if reseed needed...")
        # Hitung berapa kategori unik di DB vs yang ada di file JSON
        db_categories = set(
            row[0] for row in db.session.query(Medicine.category).distinct().all()
        )
        json_categories = set()
        for m in json_data.get('medicines', []):
            cat_raw = m.get('kategori_id', ['Lainnya'])
            cat = cat_raw[0] if isinstance(cat_raw, list) and cat_raw else str(cat_raw)
            json_categories.add(cat)

        missing_cats = json_categories - db_categories
        sample = Medicine.query.first()
        needs_reseed = (
            (sample.price == 0 and not sample.description)
            or len(missing_cats) >= 3  # banyak kategori baru yang belum ada
        )
        if needs_reseed:
            print(f"[!] Reseed diperlukan. Kategori baru: {missing_cats}. Clearing data lama...")
            db.session.query(Medicine).delete()
            db.session.commit()
        else:
            print(f"[SKIP] {existing_count} medicines sudah sesuai (kategori DB lengkap).")
            return



    medicines = json_data.get('medicines', [])
    
    # Price range based on category/type patterns — extended for 14 new categories
    price_ranges = {
        'Nyeri & Demam':                 (5000, 35000),
        'Obat Batuk':                    (8000, 45000),
        'Flu & Pilek':                   (10000, 50000),
        'Lambung & Maag':                (12000, 55000),
        'Pencernaan & Diare':            (8000, 40000),
        'Vitamin & Suplemen':            (15000, 120000),
        'Alergi & Gatal':                (10000, 60000),
        'Obat Kulit & Luka':             (12000, 70000),
        'Antijamur & Kulit':             (15000, 80000),
        'Obat Oles Nyeri':               (10000, 55000),
        'Mata & Telinga':                (18000, 75000),
        'Mulut & Tenggorokan':           (8000, 45000),
        'Herbal & Tradisional':          (8000, 50000),
        'Perawatan Hidung & Pernapasan': (10000, 60000),
        # Legacy
        'Vitamin':      (15000, 85000),
        'Suplemen':     (20000, 120000),
        'Hipertensi':   (35000, 150000),
        'Diabetes':     (40000, 180000),
        'Antibiotik':   (15000, 65000),
        'Lainnya':      (20000, 100000),
    }
    
    types_mapping = {
        'Tablet': 'Tablet',
        'Kapsul': 'Kapsul',
        'Sirup': 'Sirup',
        'Sachet': 'Sachet',
        'Injeksi': 'Injeksi',
    }
    
    expiries = ['2026-12-31', '2027-06-30', '2028-03-15', '2027-11-20']

    count = 0
    for med in medicines:
        name = med.get('name', '')
        category = med.get('kategori_id', ['Lainnya'])[0] if isinstance(med.get('kategori_id'), list) and med.get('kategori_id') else 'Lainnya'
        
        # Generate realistic price based on category
        low, high = price_ranges.get(category, price_ranges['Lainnya'])
        price = random.randint(low, high)
        
        # Map composition to description if uses not available
        composition = med.get('composition', '')
        uses = med.get('uses', '')
        side_effects_raw = med.get('side_effects', '')
        manufacturer = med.get('manufacturer', '')
        
        m = Medicine()
        m.name = name
        m.category = category
        m.price = float(price)
        m.stock = random.randint(50, 300)
        m.description = composition if composition else (uses[:200] if uses else '')
        m.indication = uses if uses else ''
        m.dosage = f"Dosis sesuai anjuran dokter. {manufacturer}".rstrip('. ') if manufacturer else 'Sesuai resep dokter'
        m.ingredients = composition if composition else ''
        m.benefits = uses if uses else ''
        m.side_effects = side_effects_raw if side_effects_raw else ''
        m.expiry = random.choice(expiries)
        m.type = 'Tablet' if 'Tablet' in name else ('Kapsul' if 'Kapsul' in name else 'Tablet')
        m.photo = med.get('image_url', '')
        db.session.add(m)
        count += 1

    db.session.commit()
    print(f"[OK] Seeded {count} medicines with proper data!")


def seed_sample_users():
    """Create sample users for demo."""
    sample_users = [
        {'name': 'Demo User', 'email': 'user@demo.com', 'phone': '08111222333', 'address': 'Demo Address', 'password': 'demo123'},
        {'name': 'Ahmad Rizki', 'email': 'ahmad@email.com', 'phone': '081234567890', 'address': 'Jl. Sudirman No. 12, Jakarta', 'password': 'password123'},
        {'name': 'Siti Nurhaliza', 'email': 'siti@email.com', 'phone': '081323456789', 'address': 'Jl. Gatot Subroto No. 45, Bandung', 'password': 'password123'},
        {'name': 'Budi Santoso', 'email': 'budi@email.com', 'phone': '081434567890', 'address': 'Jl. Thamrin No. 88, Semarang', 'password': 'password123'},
    ]

    for u in sample_users:
        existing = User.query.filter_by(email=u['email']).first()
        if existing:
            continue

        user = User()
        user.id = str(uuid.uuid4())
        user.name = u['name']
        user.email = u['email']
        user.phone = u['phone']
        user.address = u['address']
        user.role = 'user'
        user.set_password(u['password'])
        db.session.add(user)

    db.session.commit()
    print(f"[OK] Sample users created/verified.")


def seed_sample_orders():
    """Create sample orders for demo."""
    sample_orders = [
        {'items': [{'name': 'Paracetamol 500mg', 'quantity': 3, 'price': 45000}], 'status': 'delivered'},
        {'items': [{'name': 'Amoxicillin 500mg', 'quantity': 2, 'price': 50000}], 'status': 'processing'},
        {'items': [{'name': 'OBH Combi Sirup', 'quantity': 1, 'price': 18000}], 'status': 'cancelled'},
        {'items': [{'name': 'Vitamin C 1000mg', 'quantity': 2, 'price': 35000}], 'status': 'delivered'},
        {'items': [{'name': 'Mixagrip Tablet', 'quantity': 1, 'price': 12000}], 'status': 'delivered'},
    ]

    users = User.query.filter_by(role='user').all()
    if not users:
        print("[SKIP] No users found for sample orders.")
        return

    existing = Order.query.count()
    if existing > 0:
        print(f"[SKIP] {existing} orders already exist.")
        return

    couriers = [
        {'name': 'JNE', 'service': 'REG'},
        {'name': 'J&T', 'service': 'Express'},
        {'name': 'SiCepat', 'service': 'REG'},
    ]

    for i, order_data in enumerate(sample_orders):
        user = users[i % len(users)]
        courier = couriers[i % len(couriers)]
        total = sum(item['price'] * item['quantity'] for item in order_data['items'])

        order = Order()
        order.order_id = f"APY-{(datetime.utcnow() - timedelta(days=i)).strftime('%d%m')}-{uuid.uuid4().hex[:4].upper()}"
        order.user_id = user.id
        order.total = total
        order.status = order_data['status']
        order.courier_name = courier['name']
        order.courier_service = courier['service']
        order.address_name = user.name
        order.address_detail = user.address
        order.phone = user.phone
        order.created_at = datetime.utcnow() - timedelta(days=i)
        db.session.add(order)

        for item in order_data['items']:
            oi = OrderItem()
            oi.name = item['name']
            oi.quantity = item['quantity']
            oi.price = item['price']
            oi.order = order
            db.session.add(oi)

    db.session.commit()
    print(f"[OK] Seeded {len(sample_orders)} sample orders.")


def main():
    """Run all seeders."""
    app = create_app()

    with app.app_context():
        db.create_all()
        seed_admin()
        print("\n[*] Seeding database...")
        seed_medicines()
        seed_sample_users()
        seed_sample_orders()
        print("[OK] Database seeding complete.\n")


if __name__ == '__main__':
    main()
