"""
Quick setup script for APOTEK backend.
Runs database initialization and optionally seeds data.

Usage:
  python quick_setup.py              # Setup DB only (dry run)
  python quick_setup.py --init       # Initialize database and schema
  python quick_setup.py --seed       # Also seed sample data
  python quick_setup.py --drop       # Drop and recreate database (WARNING!)
"""

import os
import sys
import subprocess
from pathlib import Path


def print_header(text):
    """Print formatted header."""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)


def check_docker():
    """Check if Docker is running."""
    try:
        result = subprocess.run(
            ['docker', 'info'],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except:
        return False


def check_postgres_local():
    """Check if PostgreSQL is running locally."""
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('localhost', 5432))
        sock.close()
        return result == 0
    except:
        return False


def run_docker_setup():
    """Setup using Docker Compose."""
    print_header("🐳 Setup with Docker Compose")
    
    print("\n1️⃣  Starting PostgreSQL...")
    subprocess.run(['docker-compose', 'up', '-d', 'postgres'], check=True)
    
    print("\n2️⃣  Waiting for PostgreSQL to be ready...")
    subprocess.run(['docker-compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'apotek_user', '-d', 'apotek_db'], 
                   check=True, capture_output=True)
    
    print("\n3️⃣  Running database migration inside backend container...")
    subprocess.run(['docker-compose', 'exec', '-T', 'backend', 'python', 'migrate_sqlite_to_postgres.py', '--apply'],
                   check=False)
    
    print("\n4️⃣  Starting all services...")
    subprocess.run(['docker-compose', 'up', '-d', 'backend', 'frontend', 'payment-server'])
    
    print_header("✅ Docker Setup Complete!")
    print("\n📝 Access URLs:")
    print("   • Frontend: http://localhost:5173")
    print("   • Adminer:  http://localhost:8080 (PostgreSQL admin)")
    print("   • API:      http://localhost:5000/api/health")
    print("\n🔐 Default login:")
    print(f"   Email:    {os.getenv('ADMIN_EMAIL', 'admin@apoteksehat.com')}")
    print(f"   Password: {os.getenv('ADMIN_PASSWORD', 'admin123')}")


def run_local_setup(init=False, seed=False):
    """Setup for local Python environment."""
    print_header("🔧 Local Setup")
    
    # Check if DATABASE_URL is configured
    db_url = os.getenv('DATABASE_URL', '')
    if not db_url or 'postgresql' not in db_url:
        print("\n⚠️  WARNING: DATABASE_URL not set to PostgreSQL!")
        print("   Please update .env file:")
        print("   DATABASE_URL=postgresql://apotek_user:apotek_password_local@localhost:5432/apotek_db")
        
        if not init:
            print("\n   Run with --init flag to continue anyway (will create database).")
            return False
    
    # Run setup_db.py
    if init or seed:
        print("\n📦 Running setup_db.py...")
        result = subprocess.run(
            ['python', 'setup_db.py'],
            cwd=Path(__file__).parent / 'backend'
        )
        if result.returncode != 0:
            print("❌ Database setup failed!")
            return False
    
    # Run migration if SQLite exists
    sqlite_db = Path(__file__).parent / 'backend' / 'instance' / 'apotek.db'
    if sqlite_db.exists():
        print("\n📖 Found existing SQLite database.")
        response = input("   Migrate to PostgreSQL? (y/N): ").lower()
        if response == 'y':
            subprocess.run(
                ['python', 'migrate_sqlite_to_postgres.py', '--apply'],
                cwd=Path(__file__).parent / 'backend'
            )
    else:
        print("\nℹ️  No existing SQLite database found. Starting fresh with PostgreSQL.")
    
    if seed:
        print("\n🌱 Seeding sample data...")
        subprocess.run(
            ['python', 'seed.py'],
            cwd=Path(__file__).parent / 'backend'
        )
    
    return True


def main():
    """Main entry point."""
    init = '--init' in sys.argv
    seed = '--seed' in sys.argv
    drop = '--drop' in sys.argv
    
    # Check environment
    using_docker = 'DOCKER_HOST' in os.environ or check_docker()
    local_postgres = check_postgres_local()
    
    print_header("APOTEK Backend Setup")
    
    if init:
        if not local_postgres and not using_docker:
            print("\n⚠️  PostgreSQL not detected!")
            print("   Options:")
            print("   1. Install PostgreSQL locally and run: python quick_setup.py --init --seed")
            print("   2. Use Docker: docker-compose up --build")
            return
        
        if seed:
            print("\n🌟 Full setup mode: Initialize + Seed data")
        else:
            print("\n⚙️  Setup mode: Database initialization only")
        
        success = run_local_setup(init=True, seed=seed)
        if success:
            print_header("✅ Local Setup Complete!")
    
    elif drop:
        print("\n⚠️  DROPPING DATABASE!")
        response = input("   Type 'YES DROP ALL DATA' to confirm: ")
        if response == 'YES DROP ALL DATA':
            subprocess.run(
                ['python', 'setup_db.py', '--drop'],
                cwd=Path(__file__).parent / 'backend'
            )
        else:
            print("❌ Cancelled.")
    
    elif seed:
        print("\n🌱 Seeding sample data only...")
        subprocess.run(
            ['python', 'seed.py'],
            cwd=Path(__file__).parent / 'backend'
        )
    
    else:
        print_header("📊 Environment Check")
        
        if local_postgres:
            print("\n✅ PostgreSQL detected at localhost:5432")
        else:
            print("\n⚠️  PostgreSQL NOT detected on localhost:5432")
            print("   Options:")
            print("   • Install PostgreSQL locally")
            print("   • Use Docker Compose: docker-compose up -d postgres")
        
        if using_docker:
            print("✅ Docker is running")
        else:
            print("⚠️  Docker not detected or not running")
        
        db_url = os.getenv('DATABASE_URL', '(not set)')
        print(f"\n📝 DATABASE_URL: {db_url}")
        
        if 'postgresql' in db_url.lower():
            print("   ✅ PostgreSQL configured!")
        else:
            print("   ⚠️  Not using PostgreSQL")
    
    print("\n" + "="*60)


if __name__ == '__main__':
    main()
