"""
Database setup script for PostgreSQL.
Run this to create the database and initialize the schema.

Usage:
  python setup_db.py          # Create database if not exists
  python setup_db.py --drop   # Drop and recreate database (WARNING!)
"""

import os
import sys
import psycopg2
from psycopg2 import sql, OperationalError


def get_connection(db_name=None):
    """Create connection to PostgreSQL server."""
    db_url = os.getenv('DATABASE_URL', '')
    
    if db_url and not db_name:
        # Connect to default database first
        conn = psycopg2.connect(
            host=db_url.split('/')[0].split('@')[-1].split(':')[0] or 'localhost',
            port=5432,
            user='apotek_user',
            password='apotek_password_local',
            dbname='postgres'  # Connect to default postgres database
        )
        conn.set_commit()
        return conn
    elif db_name:
        return psycopg2.connect(
            host='localhost',
            port=5432,
            user='apotek_user',
            password='apotek_password_local',
            dbname=db_name
        )
    
    raise ValueError("DATABASE_URL not set or db_name not provided")


def create_database():
    """Create the apotek_db database if it doesn't exist."""
    print("🔍 Checking if database exists...")
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(
        "SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'apotek_db'"
    )
    exists = cursor.fetchone()
    
    if exists:
        print("✅ Database 'apotek_db' already exists")
        cursor.close()
        conn.close()
        return True
    
    # Create database
    print("📦 Creating database 'apotek_db'...")
    cursor.execute("CREATE DATABASE apotek_db")
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database created successfully!")
    
    return True


def init_schema():
    """Initialize database schema using Flask-SQLAlchemy."""
    from app import create_app
    
    print("⚙️  Initializing database schema...")
    
    app = create_app()
    
    with app.app_context():
        from models import db
        db.create_all()
        print("✅ Schema initialized successfully!")
        print(f"   Tables created: {db.engine.table_names()}")


def reset_database():
    """Drop and recreate database (WARNING: deletes all data!)."""
    if not input("⚠️  WARNING: This will delete ALL data! Type 'YES' to continue: ") == "YES":
        print("❌ Operation cancelled.")
        return
    
    conn = get_connection()
    cursor = conn.cursor()
    
    # Terminate all connections to apotek_db
    print("🔌 Terminating existing connections...")
    cursor.execute("""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'apotek_db'
        AND pid != pg_backend_pid()
    """)
    
    # Drop database
    print("🗑️  Dropping database...")
    cursor.execute("DROP DATABASE IF EXISTS apotek_db")
    conn.commit()
    
    # Recreate
    print("📦 Recreating database...")
    cursor.execute("CREATE DATABASE apotek_db")
    conn.commit()
    
    cursor.close()
    conn.close()
    print("✅ Database recreated!")
    
    # Initialize schema
    init_schema()


def seed_data():
    """Seed initial data if seed.py exists."""
    import subprocess
    from pathlib import Path
    
    backend_dir = Path(__file__).parent / 'backend'
    seed_script = backend_dir / 'seed.py'
    
    if seed_script.exists():
        print("🌱 Running seed script...")
        result = subprocess.run(
            ['python', str(seed_script)],
            cwd=str(backend_dir),
            env={**os.environ, 'DATABASE_URL': os.getenv('DATABASE_URL', '')}
        )
        if result.returncode == 0:
            print("✅ Data seeded successfully!")
        else:
            print("❌ Seeding failed. Please run seed.py manually.")
    else:
        print("⚠️  No seed.py found. Skipping data seeding.")


def main():
    """Main entry point."""
    if len(sys.argv) > 1 and sys.argv[1] == '--drop':
        reset_database()
        seed_data()
    elif len(sys.argv) > 1 and sys.argv[1] == '--seed':
        seed_data()
    else:
        create_database()
        init_schema()
    
    print("\n" + "="*60)
    print("✅ Database setup complete!")
    print("="*60)
    print("\n📝 Next steps:")
    print("   1. Start backend: docker-compose up backend")
    print("   2. Or run locally: cd backend && python app.py")
    print("   3. Access Adminer at http://localhost:8080")
    print("="*60)


if __name__ == '__main__':
    main()
