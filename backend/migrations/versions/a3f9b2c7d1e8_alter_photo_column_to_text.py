"""alter photo column to Text

Revision ID: a3f9b2c7d1e8
Revises: 1bdf2e7071dc
Create Date: 2026-07-24 05:38:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a3f9b2c7d1e8'
down_revision = '1bdf2e7071dc'
branch_labels = None
depends_on = None


def upgrade():
    # Alter medicines.photo from VARCHAR(500) to TEXT so Base64 / long URLs can be stored
    with op.batch_alter_table('medicines', schema=None) as batch_op:
        batch_op.alter_column('photo',
               existing_type=sa.String(length=500),
               type_=sa.Text(),
               existing_nullable=True)


def downgrade():
    with op.batch_alter_table('medicines', schema=None) as batch_op:
        batch_op.alter_column('photo',
               existing_type=sa.Text(),
               type_=sa.String(length=500),
               existing_nullable=True)
