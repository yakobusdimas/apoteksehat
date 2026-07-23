"""
Database models for Apotek Sehat API.
SQLite via SQLAlchemy ORM.
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model — supports both regular user and admin."""
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), default='')
    address = db.Column(db.String(300), default='')
    city = db.Column(db.String(50), default='')
    postal_code = db.Column(db.String(10), default='')
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(10), default='user', index=True)  # 'user' or 'admin'
    allergies = db.Column(db.Text, default='')  # JSON array of allergens
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    orders = db.relationship('Order', backref='user', lazy='dynamic')

    def set_password(self, password: str):
        """Hash and set password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check password against hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        """Serialize to dictionary."""
        import json
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'postalCode': self.postal_code,
            'role': self.role,
            'allergies': json.loads(self.allergies) if self.allergies else [],
            'createdAt': self.created_at.isoformat(),
            'totalOrders': self.orders.count(),
        }
        if include_sensitive:
            data['password_hash'] = self.password_hash
        return data


class Medicine(db.Model):
    """Medicine/inventory model."""
    __tablename__ = 'medicines'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), default='Lainnya', index=True)
    price = db.Column(db.Float, default=0)
    stock = db.Column(db.Integer, default=0)
    description = db.Column(db.Text, default='')
    indication = db.Column(db.Text, default='')
    dosage = db.Column(db.Text, default='')
    ingredients = db.Column(db.Text, default='')
    benefits = db.Column(db.Text, default='')
    side_effects = db.Column(db.Text, default='')
    expiry = db.Column(db.String(20), default='')
    type = db.Column(db.String(20), default='Tablet', index=True)
    photo = db.Column(db.String(500), default='')
    # Soft-delete: False = aktif, True = diarsipkan (tidak tampil di toko)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    # Tags: JSON array string, contoh '["promo","bestseller"]'
    tags = db.Column(db.Text, default='[]')

    # Relationships
    order_items = db.relationship('OrderItem', backref='medicine', lazy='dynamic')

    def to_dict(self):
        """Serialize to dictionary."""
        import json
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'price': self.price,
            'stock': self.stock,
            'description': self.description,
            'indication': self.indication,
            'dosage': self.dosage,
            'ingredients': self.ingredients,
            'benefits': self.benefits,
            'side_effects': self.side_effects,
            'expiry': self.expiry,
            'type': self.type,
            'photo': self.photo,
            'is_active': self.is_active,
            'tags': json.loads(self.tags) if self.tags else [],
        }


class Order(db.Model):
    """Order model."""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    total = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='processing', index=True)  # processing, shipped, delivered, cancelled, flagged
    courier_name = db.Column(db.String(50), default='')
    courier_service = db.Column(db.String(50), default='')
    shipping_cost = db.Column(db.Float, default=0)  # <-- NEW: shipping cost
    address_name = db.Column(db.String(100), default='')
    address_detail = db.Column(db.String(300), default='')
    phone = db.Column(db.String(20), default='')
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, failed, cancelled, expired
    payment_type = db.Column(db.String(50), default='')
    payment_reference = db.Column(db.String(200), default='')
    paid_at = db.Column(db.DateTime, nullable=True)
    # Catatan dari pembeli, contoh: "tolong bubble wrap ekstra"
    notes = db.Column(db.Text, default='', nullable=True)
    stock_restored = db.Column(db.Boolean, default=False)  # <-- NEW: idempotent stock restore flag
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic',
                            cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize to dictionary."""
        return {
            'id': self.id,
            'orderId': self.order_id,
            'userId': self.user_id,
            'total': self.total,
            'status': self.status,
            'notes': self.notes or '',
            'shippingCost': self.shipping_cost,  # <-- NEW
            'paymentStatus': self.payment_status,
            'paymentType': self.payment_type or None,
            'paymentReference': self.payment_reference or None,
            'paidAt': self.paid_at.isoformat() if self.paid_at else None,
            'courier': {
                'name': self.courier_name,
                'service': self.courier_service,
            },
            'address': {
                'name': self.address_name,
                'detail': self.address_detail,
                'phone': self.phone,
            },
            'items': [item.to_dict() for item in self.items.all()],
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }


class OrderItem(db.Model):
    """Order item — individual medicine in an order."""
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=True)
    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Float, default=0)
    photo = db.Column(db.String(500), default='')

    def to_dict(self):
        """Serialize to dictionary."""
        return {
            'id': self.id,
            'medicineId': self.medicine_id,
            'name': self.name,
            'quantity': self.quantity,
            'price': self.price,
            'photo': self.photo,
        }


class AuditLog(db.Model):
    """Audit log — tracks important actions."""
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(50), nullable=False)  # login, register, order, admin_action
    details = db.Column(db.Text, default='')
    ip_address = db.Column(db.String(45), default='')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'action': self.action,
            'details': self.details,
            'ipAddress': self.ip_address,
            'createdAt': self.created_at.isoformat(),
        }


class PasswordResetToken(db.Model):
    """Password reset token model — stores tokens for forgot/reset password flow."""
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(128), unique=True, index=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)

    def is_expired(self):
        """Check if token has expired."""
        from datetime import datetime as dt, timezone as tz
        return dt.now(tz.utc) > self.expires_at

    def __repr__(self):
        return f'<PasswordResetToken user_id={self.user_id} used={self.used}>'
