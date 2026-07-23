"""
Order routes: create, list, detail, cancel.
"""

import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g, current_app
from models import db, User, Order, OrderItem, Medicine, AuditLog
from middleware import token_required
from utils.validators import validate_order_data, sanitize_string
from utils.email import send_order_confirmation
from utils.ml_fraud import check_order_fraud

# Allowlist kurir & harga ongkir
SHIPPING_ALLOWLIST = {
    'GoSend': {
        'Instant': 15000,
        'Same Day': 10000,
    },
    'GrabExpress': {
        'Instant': 17000,
        'Same Day': 12000,
    }
}

def validate_shipping(courier_name: str, courier_service: str) -> float:
    """Validate shipping cost against allowlist. Return 0 if invalid."""
    if not courier_name or not courier_service:
        return 0
    return SHIPPING_ALLOWLIST.get(courier_name, {}).get(courier_service, 0)


def restore_order_stock(order: Order) -> bool:
    """Restore stock for all items in an order (idempotent). Returns True if stock was restored."""
    if order.stock_restored:
        return False  # Already restored
    
    try:
        for item in order.items.all():
            if item.medicine_id:
                med = Medicine.query.with_for_update().filter(Medicine.id == item.medicine_id).first()
                if med:
                    med.stock += item.quantity
        order.stock_restored = True
        db.session.commit()
        return True
    except Exception as e:
        current_app.logger.error(f"Stock restore error for order {order.order_id}: {e}")
        db.session.rollback()
        return False

orders_bp = Blueprint('orders', __name__)


def generate_order_id():
    """Generate unique order ID: APY-DDMM-XXXX."""
    now = datetime.now(timezone.utc)
    random_part = uuid.uuid4().hex[:4].upper()
    return f"APY-{now.strftime('%d%m')}-{random_part}"


@orders_bp.route('/api/orders', methods=['POST'])
@token_required
def create_order():
    """Create a new order (checkout)."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    # Validate
    validation = validate_order_data(data)
    if not validation['valid']:
        return jsonify({'status': 'error', 'message': validation['errors'][0]}), 400

    user = db.session.get(User, g.current_user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    items_data = data.get('items', [])
    address = data.get('address', {})
    courier = data.get('courier', {})
    
    # Validate items: must have medicineId, quantity
    for item in items_data:
        if not item.get('medicineId'):
            return jsonify({'status': 'error', 'message': 'Item harus memiliki medicineId.'}), 400
        if not item.get('quantity') or int(item.get('quantity', 0)) < 1:
            return jsonify({'status': 'error', 'message': 'Quantity harus minimal 1.'}), 400

    # Calculate subtotal from DB prices (not client)
    subtotal = 0
    total_items = 0
    for item in items_data:
        med_id = item.get('medicineId')
        med = Medicine.query.get(med_id)
        if not med or not med.is_active:
            return jsonify({'status': 'error', 'message': f'Obat dengan ID {med_id} tidak tersedia.'}), 400
        if med.stock < int(item.get('quantity', 1)):
            return jsonify({'status': 'error', 'message': f'Stok {med.name} tidak cukup. Tersisa: {med.stock}'}), 400
        subtotal += med.price * int(item.get('quantity', 1))
        total_items += int(item.get('quantity', 1))

    # Check for fraud using Isolation Forest ML model
    is_fraud, fraud_reason = check_order_fraud(subtotal, total_items, user.id)
    order_status = 'flagged' if is_fraud else 'processing'

    # Create order
    shipping_cost = validate_shipping(courier.get('name', ''), courier.get('service', ''))
    order = Order(
        order_id=generate_order_id(),
        user_id=user.id,
        total=subtotal + shipping_cost,  # <-- NEW: total = subtotal + shipping
        status=order_status,
        courier_name=courier.get('name', ''),
        courier_service=courier.get('service', ''),
        shipping_cost=shipping_cost,  # <-- NEW
        address_name=sanitize_string(address.get('name', ''), 100),
        address_detail=sanitize_string(address.get('detail', ''), 300),
        phone=sanitize_string(address.get('phone', ''), 20),
    )
    db.session.add(order)

    # Create order items with row-level locking to prevent race conditions
    for item in items_data:
        med_id = item.get('medicineId')
        quantity = int(item.get('quantity', 1))
        
        # We need to fetch med again in this loop for the correct item
        med = Medicine.query.get(med_id)
        if not med:
            continue
            
        name = med.name
        price = med.price
        photo = item.get('photo', '')
        
        # Validate before creating item
        if quantity < 1:
            db.session.rollback()
            return jsonify({'status': 'error', 'message': 'Quantity harus minimal 1.'}), 400
        
        order_item = OrderItem(
            order=order,
            medicine_id=med_id,
            name=name,  # <-- NEW: snapshot from DB
            quantity=quantity,
            price=price,  # <-- NEW: price from DB
            photo=med.photo or photo,  # <-- NEW: fallback to client photo if DB empty
        )
        db.session.add(order_item)

        # Decrease stock with row-level locking (PostgreSQL only)
        if med_id:
            try:
                # Lock the medicine row to prevent concurrent updates (race condition)
                med_lock = Medicine.query.with_for_update().filter(Medicine.id == med_id).first()
                if not med_lock:
                    db.session.rollback()
                    return jsonify({'status': 'error', 'message': f'Obat dengan ID {med_id} tidak ditemukan.'}), 404
                
                if med_lock.stock < quantity:
                    db.session.rollback()
                    return jsonify({
                        'status': 'error', 
                        'message': f'Stok {name} tidak cukup. Tersisa: {med_lock.stock}'
                    }), 400
                
                med_lock.stock -= quantity
            except Exception as e:
                db.session.rollback()
                from flask import current_app
                current_app.logger.error(f"Stock lock error for medicine {med_id}: {e}")
                return jsonify({'status': 'error', 'message': 'Terjadi kesalahan saat memverifikasi stok.'}), 500

    # Audit log
    audit_details = f'Order {order.order_id} created, total Rp {order.total:,.0f}'
    if is_fraud:
        audit_details += f' [FLAGGED FRAUD: {fraud_reason}]'
        
    log = AuditLog(
        user_id=user.id,
        action='order',
        details=audit_details,
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    # Send email notification (non-blocking — don't fail if email fails)
    # Fix Bug #1: email dikirim SEBELUM return agar tidak jadi dead code
    try:
        items_for_email = [{
            'name': item.name,
            'quantity': item.quantity,
            'price': item.price,
        } for item in order.items.all()]
        send_order_confirmation(
            to_email=user.email,
            order_id=order.order_id,
            total=total,
            items=items_for_email,
        )
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Failed to send order confirmation email: {e}")

    return jsonify({
        'status': 'success',
        'message': 'Pesanan berhasil dibuat.',
        'order': order.to_dict(),
    }), 201


@orders_bp.route('/api/orders', methods=['GET'])
@token_required
def list_orders():
    """List current user's orders."""
    status = request.args.get('status', '').strip()
    query = Order.query.filter_by(user_id=g.current_user_id)

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'orders': [o.to_dict() for o in orders],
        'total': len(orders),
    })


@orders_bp.route('/api/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order(order_id):
    """Get single order detail."""
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'status': 'error', 'message': 'Pesanan tidak ditemukan.'}), 404

    # Only allow user to see their own orders
    if order.user_id != g.current_user_id:
        return jsonify({'status': 'error', 'message': 'Akses ditolak.'}), 403

    return jsonify({
        'status': 'success',
        'order': order.to_dict(),
    })


@orders_bp.route('/api/orders/<int:order_id>/cancel', methods=['PUT'])
@token_required
def cancel_order(order_id):
    """Cancel an order (only if still processing)."""
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'status': 'error', 'message': 'Pesanan tidak ditemukan.'}), 404

    if order.user_id != g.current_user_id:
        return jsonify({'status': 'error', 'message': 'Akses ditolak.'}), 403

    # Fix Bug #2: 'flagged' order (fraud-flagged) juga bisa dibatalkan
    # agar stok tidak hilang untuk transaksi yang dicurigai fraud
    if order.status not in ('processing', 'flagged'):
        return jsonify({'status': 'error', 'message': f'Pesanan dengan status "{order.status}" tidak bisa dibatalkan.'}), 400

    order.status = 'cancelled'

    # Restore stock with row-level locking
    try:
        for item in order.items.all():
            if item.medicine_id:
                med = Medicine.query.with_for_update().filter(Medicine.id == item.medicine_id).first()
                if med:
                    med.stock += item.quantity
    except Exception as e:
        from flask import current_app
        current_app.logger.error(f"Stock restore error for order {order.order_id}: {e}")

    # Audit log
    log = AuditLog(
        user_id=g.current_user_id,
        action='cancel_order',
        details=f'Order {order.order_id} cancelled',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Pesanan berhasil dibatalkan.',
        'order': order.to_dict(),
    })
@orders_bp.route('/api/orders/by-code/<string:order_code>', methods=['GET'])
@token_required
def get_order_by_code(order_code):
    """Get order by public order code (e.g. APY-0706-XXXX). Used by tracking page."""
    order = Order.query.filter_by(order_id=order_code).first()
    if not order:
        return jsonify({'status': 'error', 'message': 'Pesanan tidak ditemukan.'}), 404

    if order.user_id != g.current_user_id and g.current_user_role != 'admin':
        return jsonify({'status': 'error', 'message': 'Akses ditolak.'}), 403

    return jsonify({
        'status': 'success',
        'order': order.to_dict(),
    })


@orders_bp.route('/api/orders/<string:order_code>/payment-status', methods=['PUT'])
def update_payment_status(order_code):
    """Update payment status from payment server webhook. Internal endpoint."""
    # Require a shared secret — mandatory in production
    import os
    secret = request.headers.get('X-Payment-Secret', '')
    expected = os.getenv('PAYMENT_WEBHOOK_SECRET')
    if not expected:
        current_app.logger.error("PAYMENT_WEBHOOK_SECRET is not set — rejecting all webhooks")
        return jsonify({'status': 'error', 'message': 'Server misconfigured: webhook secret not set.'}), 500
    if secret != expected:
        current_app.logger.warning(f"Webhook secret mismatch: got '{secret}', expected '{expected}'")
        return jsonify({'status': 'error', 'message': 'Unauthorized.'}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    order = Order.query.filter_by(order_id=order_code).first()
    if not order:
        return jsonify({'status': 'error', 'message': 'Pesanan tidak ditemukan.'}), 404

    valid_payment_statuses = {'pending', 'paid', 'failed', 'cancelled', 'expired'}
    new_payment_status = data.get('paymentStatus', '').strip().lower()
    if new_payment_status not in valid_payment_statuses:
        return jsonify({'status': 'error', 'message': f'paymentStatus tidak valid: {new_payment_status}'}), 400

    # Restore stock if payment failed/expired/cancelled (idempotent)
    if new_payment_status in ('cancelled', 'expired', 'failed') and order.status in ('processing', 'flagged'):
        if restore_order_stock(order):
            order.status = 'cancelled'

    order.payment_status = new_payment_status
    order.payment_type = data.get('paymentType', order.payment_type or '')
    order.payment_reference = data.get('paymentReference', order.payment_reference or '')

    if new_payment_status == 'paid' and not order.paid_at:
        from datetime import datetime as _dt, timezone as _tz
        raw_paid_at = data.get('paidAt')
        try:
            order.paid_at = _dt.fromisoformat(raw_paid_at) if raw_paid_at else _dt.now(_tz.utc)
        except (ValueError, TypeError):
            order.paid_at = _dt.now(_tz.utc)

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Status pembayaran diperbarui.',
        'order': order.to_dict(),
    })
