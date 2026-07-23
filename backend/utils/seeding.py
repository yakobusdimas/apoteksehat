"""Reusable database seeding helpers."""

import uuid

from config import get_config
from models import AuditLog, User, db


def seed_admin(app=None):
    """Create the configured admin account if it does not exist yet."""
    context = app.app_context() if app is not None else None

    if context is not None:
        context.push()

    try:
        config = get_config()
        existing = db.session.query(User).filter_by(email=config.ADMIN_EMAIL).first()
        if existing:
            return False

        admin = User()
        admin.id = str(uuid.uuid4())
        admin.name = config.ADMIN_NAME
        admin.email = config.ADMIN_EMAIL
        admin.role = 'admin'
        admin.set_password(config.ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()

        log = AuditLog()
        log.user_id = admin.id
        log.action = 'admin_seed'
        log.details = 'Admin account created on first run'
        db.session.add(log)
        db.session.commit()
        print(f"[SEED] Admin account created: {config.ADMIN_EMAIL}")
        return True
    finally:
        if context is not None:
            context.pop()
