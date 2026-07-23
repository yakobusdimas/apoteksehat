#!/usr/bin/env python3
"""
Database schema update script for PostgreSQL migration.
Adds any missing tables or columns that weren't created during initial setup.
"""
import sys
sys.path.insert(0, '.')

from app import create_app
from models import db


def update_schema():
    """Create all missing tables and columns."""
    app = create_app()
    
    with app.app_context():
        # Create any missing tables
        print("Checking tables...")
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        print(f"Existing tables: {existing_tables}")
        
        # Create all tables that don't exist
        db.create_all()
        print("OK All tables created/verified")
        
        # Check for missing columns in users table
        user_columns = [col['name'] for col in inspector.get_columns('users')]
        required_user_columns = ['id', 'name', 'email', 'phone', 'address', 
                                'city', 'postal_code', 'password_hash', 'role', 
                                'allergies', 'created_at']
        
        missing_user_cols = [col for col in required_user_columns if col not in user_columns]
        if missing_user_cols:
            print(f"Adding missing columns to users table: {missing_user_cols}")
            
            # Add allergies column (JSON text field)
            if 'allergies' not in user_columns:
                from sqlalchemy import text
                db.session.execute(text("ALTER TABLE users ADD COLUMN allergies TEXT DEFAULT ''"))
                print("  ✓ Added allergies column")
                
        # Check for missing columns in orders table  
        order_columns = [col['name'] for col in inspector.get_columns('orders')]
        required_order_columns = ['id', 'order_id', 'user_id', 'total', 'status',
                                'courier_name', 'courier_service', 'address_name',
                                'address_detail', 'phone', 'created_at', 'updated_at',
                                'payment_status', 'payment_type', 'payment_reference', 'paid_at',
                                'notes', 'shipping_cost', 'stock_restored']  # <-- NEW shipping_cost, stock_restored
        
        missing_order_cols = [col for col in required_order_columns if col not in order_columns]
        if missing_order_cols:
            print(f"Adding missing columns to orders table: {missing_order_cols}")
            from sqlalchemy import text
            payment_col_defs = {
                'payment_status':    "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending'",
                'payment_type':      "ALTER TABLE orders ADD COLUMN payment_type VARCHAR(50) DEFAULT ''",
                'payment_reference': "ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(200) DEFAULT ''",
                'paid_at':           "ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL",
                'notes':             "ALTER TABLE orders ADD COLUMN notes TEXT DEFAULT ''",
                'shipping_cost':     "ALTER TABLE orders ADD COLUMN shipping_cost FLOAT DEFAULT 0",
                'stock_restored':    "ALTER TABLE orders ADD COLUMN stock_restored BOOLEAN DEFAULT FALSE",
            }
            for col, sql in payment_col_defs.items():
                if col in missing_order_cols:
                    try:
                        db.session.execute(text(sql))
                        print(f"  OK Added {col} column")
                    except Exception as e:
                        print(f"  ⚠ {col}: {e} (may already exist)")
        else:
            print("  ✓ All order columns present")
            
        # Check for missing columns in medicines table
        medicine_columns = [col['name'] for col in inspector.get_columns('medicines')]
        required_medicine_columns = ['id', 'name', 'category', 'price', 'stock',
                                    'description', 'indication', 'dosage', 'ingredients',
                                    'benefits', 'side_effects', 'expiry', 'type', 'photo',
                                    'is_active', 'tags']  # Added is_active, tags
        
        missing_medicine_cols = [col for col in required_medicine_columns if col not in medicine_columns]
        if missing_medicine_cols:
            print(f"Adding missing columns to medicines table: {missing_medicine_cols}")
            from sqlalchemy import text
            medicine_col_defs = {
                'is_active': "ALTER TABLE medicines ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
                'tags':      "ALTER TABLE medicines ADD COLUMN tags TEXT DEFAULT '[]'",
            }
            for col, sql in medicine_col_defs.items():
                if col in missing_medicine_cols:
                    try:
                        db.session.execute(text(sql))
                        print(f"  OK Added {col} column")
                    except Exception as e:
                        print(f"  ⚠ {col}: {e} (may already exist)")
        else:
            print("  ✓ All medicine columns present")
            
        # Check if password_reset_tokens table exists
        if 'password_reset_tokens' not in existing_tables:
            print("Creating password_reset_tokens table...")
            from models import PasswordResetToken  # noqa: F401
            db.create_all()
            print("  ✓ Created password_reset_tokens table")
            
        db.session.commit()
        print("\nSchema update complete!")


if __name__ == "__main__":
    update_schema()
