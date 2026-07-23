"""
Admin routes: stats, manage users, manage orders, manage medicines.
All endpoints require admin role.
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy import func
from models import db, User, Order, Medicine, AuditLog
from middleware import token_required, admin_required
from utils.validators import sanitize_string
from utils.ml_forecasting import get_stock_forecast

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/api/admin/stats', methods=['GET'])
@token_required
@admin_required
def get_stats():
    """Get dashboard statistics."""
    total_users = User.query.filter_by(role='user').count()
    total_medicines = Medicine.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total)).filter(Order.status != 'cancelled').scalar() or 0

    pending_orders = Order.query.filter_by(status='processing').count()
    delivered_orders = Order.query.filter_by(status='delivered').count()
    cancelled_orders = Order.query.filter_by(status='cancelled').count()
    low_stock = Medicine.query.filter(Medicine.stock < 50).count()

    return jsonify({
        'status': 'success',
        'stats': {
            'totalUsers': total_users,
            'totalMedicines': total_medicines,
            'totalOrders': total_orders,
            'totalRevenue': total_revenue,
            'pendingOrders': pending_orders,
            'deliveredOrders': delivered_orders,
            'cancelledOrders': cancelled_orders,
            'lowStockMedicines': low_stock,
        }
    })


@admin_bp.route('/api/admin/forecasting', methods=['GET'])
@token_required
@admin_required
def get_forecasting():
    """Get stock demand forecasting for the next 30 days."""
    days = request.args.get('days', 30, type=int)
    # limit to max 90 days to prevent excessive processing
    days = min(max(days, 7), 90)
    
    forecasts = get_stock_forecast(days_ahead=days)
    
    return jsonify({
        'status': 'success',
        'days_ahead': days,
        'forecasts': forecasts,
        'total_items': len(forecasts)
    })


@admin_bp.route('/api/admin/users', methods=['GET'])
@token_required
@admin_required
def list_users():
    """List all users."""
    users = User.query.filter_by(role='user').order_by(User.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'users': [u.to_dict() for u in users],
        'total': len(users),
    })


@admin_bp.route('/api/admin/users/<user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(user_id):
    """Delete a user (admin only)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    if user.role == 'admin':
        return jsonify({'status': 'error', 'message': 'Tidak bisa menghapus admin.'}), 400

    # Cancel all pending orders
    orders = Order.query.filter_by(user_id=user_id, status='processing').all()
    for order in orders:
        order.status = 'cancelled'
        # Restore stock
        for item in order.items.all():
            if item.medicine_id:
                med = Medicine.query.get(item.medicine_id)
                if med:
                    med.stock += item.quantity

    db.session.delete(user)

    # Audit log
    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_delete_user',
        details=f'Deleted user {user.email}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'User {user.email} berhasil dihapus.',
    })


@admin_bp.route('/api/admin/orders', methods=['GET'])
@token_required
@admin_required
def list_all_orders():
    """List all orders (admin view)."""
    status = request.args.get('status', '').strip()
    query = Order.query

    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'orders': [o.to_dict() for o in orders],
        'total': len(orders),
    })


@admin_bp.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_order_status(order_id):
    """Update order status (admin only)."""
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'status': 'error', 'message': 'Pesanan tidak ditemukan.'}), 404

    data = request.get_json(silent=True)
    if not data or 'status' not in data:
        return jsonify({'status': 'error', 'message': 'Field "status" wajib diisi.'}), 400

    new_status = data['status'].strip().lower()
    # Bug #C fix: 'flagged' harus bisa diubah admin (misal: approve fraud review → processing)
    valid_statuses = ['processing', 'flagged', 'shipped', 'delivered', 'cancelled']

    if new_status not in valid_statuses:
        return jsonify({
            'status': 'error',
            'message': f'Status tidak valid. Pilihan: {", ".join(valid_statuses)}'
        }), 400

    old_status = order.status
    order.status = new_status

    # If cancelled, restore stock
    if new_status == 'cancelled' and old_status != 'cancelled':
        for item in order.items.all():
            if item.medicine_id:
                med = Medicine.query.get(item.medicine_id)
                if med:
                    med.stock += item.quantity

    # Audit log
    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_update_order',
        details=f'Order {order.order_id}: {old_status} → {new_status}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'Status pesanan diperbarui: {old_status} → {new_status}',
        'order': order.to_dict(),
    })


@admin_bp.route('/api/admin/medicines', methods=['POST'])
@token_required
@admin_required
def add_medicine():
    """Add a new medicine (admin only)."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    name = sanitize_string(data.get('name', ''), 200)
    if not name:
        return jsonify({'status': 'error', 'message': 'Nama obat wajib diisi.'}), 400

    med = Medicine(
        name=name,
        category=sanitize_string(data.get('category', ''), 50),
        price=float(data.get('price', 0)),
        stock=int(data.get('stock', 0)),
        description=sanitize_string(data.get('description', ''), 2000),
        indication=sanitize_string(data.get('indication', ''), 1000),
        dosage=sanitize_string(data.get('dosage', ''), 500),
        ingredients=sanitize_string(data.get('ingredients', ''), 500),
        benefits=sanitize_string(data.get('benefits', ''), 500),
        side_effects=sanitize_string(data.get('side_effects', ''), 500),
        expiry=sanitize_string(data.get('expiry', ''), 20),
        type=sanitize_string(data.get('type', 'Tablet'), 20),
        photo=sanitize_string(data.get('photo', ''), 500),
        is_active=data.get('is_active', True),
        tags=data.get('tags', '[]'),
    )
    db.session.add(med)

    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_add_medicine',
        details=f'Added medicine: {name}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Obat berhasil ditambahkan.',
        'medicine': med.to_dict(),
    }), 201


@admin_bp.route('/api/admin/medicines/<int:medicine_id>', methods=['PUT'])
@token_required
@admin_required
def update_medicine(medicine_id):
    """Update a medicine (admin only)."""
    med = Medicine.query.get(medicine_id)
    if not med:
        return jsonify({'status': 'error', 'message': 'Obat tidak ditemukan.'}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    if 'name' in data:
        med.name = sanitize_string(data['name'], 200)
    if 'category' in data:
        med.category = sanitize_string(data['category'], 50)
    if 'price' in data:
        med.price = float(data['price'])
    if 'stock' in data:
        med.stock = int(data['stock'])
    if 'description' in data:
        med.description = sanitize_string(data['description'], 2000)
    if 'indication' in data:
        med.indication = sanitize_string(data['indication'], 1000)
    if 'dosage' in data:
        med.dosage = sanitize_string(data['dosage'], 500)
    if 'ingredients' in data:
        med.ingredients = sanitize_string(data['ingredients'], 500)
    if 'benefits' in data:
        med.benefits = sanitize_string(data['benefits'], 500)
    if 'side_effects' in data:
        med.side_effects = sanitize_string(data['side_effects'], 500)
    if 'expiry' in data:
        med.expiry = sanitize_string(data['expiry'], 20)
    if 'type' in data:
        med.type = sanitize_string(data['type'], 20)
    if 'photo' in data:
        med.photo = sanitize_string(data['photo'], 500)
    if 'is_active' in data:
        med.is_active = bool(data['is_active'])
    if 'tags' in data:
        import json
        tags_val = data['tags']
        if isinstance(tags_val, list):
            med.tags = json.dumps(tags_val)
        else:
            med.tags = sanitize_string(tags_val, 500)

    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_update_medicine',
        details=f'Updated medicine ID {medicine_id}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Obat berhasil diperbarui.',
        'medicine': med.to_dict(),
    })





@admin_bp.route('/api/admin/medicines/<int:medicine_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_medicine(medicine_id):
    """Soft-delete a medicine (sets is_active=False)."""
    med = Medicine.query.get(medicine_id)
    if not med:
        return jsonify({'status': 'error', 'message': 'Obat tidak ditemukan.'}), 404

    med.is_active = False

    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_delete_medicine',
        details=f'Soft-deleted medicine: {med.name}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'Obat "{med.name}" berhasil dihapus.',
    })


@admin_bp.route('/api/admin/medicines/<int:medicine_id>/toggle', methods=['PATCH'])
@token_required
@admin_required
def toggle_medicine_active(medicine_id):
    """Toggle medicine active/inactive status."""
    med = Medicine.query.get(medicine_id)
    if not med:
        return jsonify({'status': 'error', 'message': 'Obat tidak ditemukan.'}), 404

    data = request.get_json(silent=True)
    if not data or 'is_active' not in data:
        return jsonify({'status': 'error', 'message': 'Field "is_active" wajib diisi.'}), 400

    med.is_active = bool(data['is_active'])
    status_text = 'aktif' if med.is_active else 'diarsipkan'

    log = AuditLog(
        user_id=g.current_user_id,
        action='admin_toggle_medicine',
        details=f'{med.name} → {status_text}',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': f'Obat "{med.name}" berhasil {status_text}.',
        'medicine': med.to_dict(),
    })
