"""
Migration script: SQLite → PostgreSQL
Migrates existing data from SQLite database to PostgreSQL.

Usage:
  python migrate_sqlite_to_postgres.py   # Dry run (default)
  python migrate_sqlite_to_postgres.py --apply  # Actually migrate data
"""

import os
import sys
import json
import sqlite3
from pathlib import Path


def get_sqlite_db_path():
    """Find existing SQLite database."""
    backend_dir = Path(__file__).parent
    
    # Check common locations
    candidates = [
        backend_dir / 'instance' / 'apotek.db',
        backend_dir / 'apotek.db',
        Path.cwd() / 'backend' / 'instance' / 'apotek.db',
    ]
    
    for db_path in candidates:
        if db_path.exists():
            return str(db_path)
    
    # Check instance directory even if empty
    instance_dir = backend_dir / 'instance'
    if instance_dir.exists():
        return str(instance_dir / 'apotek.db')
    
    return None


def read_sqlite_data(db_path):
    """Read all data from SQLite database."""
    print(f"📖 Reading from SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    data = {}
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    print(f"   Tables found: {tables}")
    
    for table in tables:
        if table.startswith('sqlite_'):
            continue
            
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [col['name'] for col in cursor.fetchall()]
        
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        
        data[table] = {
            'columns': columns,
            'records': []
        }
        
        for row in rows:
            record = dict(zip(columns, row))
            data[table]['records'].append(record)
    
    print(f"   ✅ Read {sum(len(t['records']) for t in data.values())} total records")
    
    conn.close()
    return data


def migrate_to_postgres(data):
    """Migrate data to PostgreSQL using Flask-SQLAlchemy."""
    from app import create_app
    from models import db, User, Medicine, Order, OrderItem, AuditLog
    from werkzeug.security import generate_password_hash
    import uuid
    from datetime import datetime
    
    app = create_app()
    
    with app.app_context():
        print("\n🔄 Migrating to PostgreSQL...\n")
        
        # Skip tables that SQLAlchemy will create automatically
        skip_tables = ['alembic_version']
        
        for table_name in data.keys():
            if table_name in skip_tables:
                continue
                
            records = data[table_name]['records']
            columns = data[table_name]['columns']
            
            print(f"   📝 Migrating {table_name}: {len(records)} records...")
            
            for record in records:
                try:
                    if table_name == 'users':
                        user = User(
                            id=record['id'],
                            name=record['name'],
                            email=record['email'],
                            phone=record.get('phone', ''),
                            address=record.get('address', ''),
                            city=record.get('city', ''),
                            role=record.get('role', 'user'),
                            allergies=record.get('allergies', ''),
                        )
                        user.set_password(generate_password_hash(record['password_hash']))
                        db.session.add(user)
                        
                    elif table_name == 'medicines':
                        medicine = Medicine(
                            id=record.get('id'),  # Preserve ID if needed
                            name=record['name'],
                            category=record.get('category', 'Lainnya'),
                            price=record.get('price', 0),
                            stock=record.get('stock', 0),
                            description=record.get('description', ''),
                            indication=record.get('indication', ''),
                            dosage=record.get('dosage', ''),
                            ingredients=record.get('ingredients', ''),
                            benefits=record.get('benefits', ''),
                            side_effects=record.get('side_effects', ''),
                            expiry=record.get('expiry', ''),
                            type=record.get('type', 'Tablet'),
                            photo=record.get('photo', ''),
                        )
                        db.session.add(medicine)
                        
                    elif table_name == 'orders':
                        order = Order(
                            id=record.get('id'),
                            order_id=record['order_id'],
                            user_id=record['user_id'],
                            total=record.get('total', 0),
                            status=record.get('status', 'processing'),
                            courier_name=record.get('courier_name', ''),
                            courier_service=record.get('courier_service', ''),
                            address_name=record.get('address_name', ''),
                            address_detail=record.get('address_detail', ''),
                            phone=record.get('phone', ''),
                        )
                        # Parse timestamps
                        if 'created_at' in record and record['created_at']:
                            try:
                                order.created_at = datetime.fromisoformat(
                                    record['created_at'].replace('Z', '+00:00')
                                )
                            except:
                                pass
                        
                        db.session.add(order)
                        
                    elif table_name == 'order_items':
                        item = OrderItem(
                            id=record.get('id'),
                            order_id=record['order_id'],
                            medicine_id=record.get('medicine_id'),
                            name=record['name'],
                            quantity=record.get('quantity', 1),
                            price=record.get('price', 0),
                            photo=record.get('photo', ''),
                        )
                        db.session.add(item)
                        
                    elif table_name == 'audit_logs':
                        from models import AuditLog as AuditLogModel
                        log = AuditLogModel(
                            id=record.get('id'),
                            user_id=record.get('user_id'),
                            action=record['action'],
                            details=record.get('details', ''),
                            ip_address=record.get('ip_address', ''),
                        )
                        if 'created_at' in record and record['created_at']:
                            try:
                                log.created_at = datetime.fromisoformat(
                                    record['created_at'].replace('Z', '+00:00')
                                )
                            except:
                                pass
                        db.session.add(log)
                        
                except Exception as e:
                    print(f"   ⚠️  Skipping record in {table_name}: {str(e)}")
        
        print("\n💾 Committing all data...")
        db.session.commit()
        print("✅ Migration complete!")


def dry_run():
    """Show what would be migrated without actually doing it."""
    db_path = get_sqlite_db_path()
    
    if not db_path:
        print("❌ No SQLite database found!")
        print("\nExpected locations:")
        print("  - backend/instance/apotek.db")
        print("  - backend/apotek.db")
        print("\nIf you don't have existing data, that's OK!")
        return
    
    data = read_sqlite_data(db_path)
    
    print("\n" + "="*60)
    print("📊 Migration Summary (DRY RUN):")
    print("="*60)
    
    for table_name in data:
        if table_name.startswith('sqlite_'):
            continue
        count = len(data[table_name]['records'])
        print(f"   • {table_name}: {count} records")
    
    total = sum(len(t['records']) for t in data.values() if not t.startswith('sqlite_'))
    print(f"\n   Total: {total} records would be migrated")
    print("="*60)


def main():
    """Main entry point."""
    apply = '--apply' in sys.argv
    
    db_path = get_sqlite_db_path()
    
    if not db_path:
        print("ℹ️  No SQLite database found.")
        print("\nThis is expected if you're starting fresh!")
        print("\nTo initialize a new PostgreSQL database instead, run:")
        print("  python setup_db.py")
        sys.exit(0)
    
    data = read_sqlite_data(db_path)
    
    print("\n" + "="*60)
    print("📊 Migration Plan:")
    print("="*60)
    
    for table_name in data:
        if table_name.startswith('sqlite_'):
            continue
        count = len(data[table_name]['records'])
        print(f"   • {table_name}: {count} records")
    
    total = sum(len(t['records']) for t in data.values() if not t.startswith('sqlite_'))
    print(f"\n   Total: {total} records will be migrated")
    print("="*60)
    
    if apply:
        migrate_to_postgres(data)
    else:
        print("\n⚠️  This is a DRY RUN. No data has been migrated yet.")
        print("   To actually perform the migration, run:")
        print("   python migrate_sqlite_to_postgres.py --apply")


if __name__ == '__main__':
    main()
