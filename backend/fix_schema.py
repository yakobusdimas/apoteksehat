"""Add missing 'allergies' column to users table in PostgreSQL."""
import psycopg2

conn = psycopg2.connect(
    host='postgres',  # Docker service name, not localhost
    port=5432,
    user='apotek_user',
    password='apotek_password_local',
    dbname='apotek_db'
)
cur = conn.cursor()

# Check if column exists first
cur.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'allergies'
""")
exists = cur.fetchone()

if not exists:
    print("Column 'allergies' does not exist. Adding it now...")
    cur.execute("ALTER TABLE users ADD COLUMN allergies TEXT DEFAULT ''")
    conn.commit()
    print("✓ Column 'allergies' added successfully!")
else:
    print("Column 'allergies' already exists.")

# Also create password_reset_tokens table if missing
cur.execute("""
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
    )
""")
table_exists = cur.fetchone()[0]

if not table_exists:
    print("Creating password_reset_tokens table...")
    cur.execute("""
        CREATE TABLE password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(36) REFERENCES users(id),
            token VARCHAR(128) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used BOOLEAN DEFAULT FALSE
        );
        CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
    """)
    conn.commit()
    print("✓ Table 'password_reset_tokens' created!")
else:
    print("Table 'password_reset_tokens' already exists.")

cur.close()
conn.close()
print("\nSchema update complete!")
