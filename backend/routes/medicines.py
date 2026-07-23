"""
Medicine routes: list, search, detail.
"""

from flask import Blueprint, request, jsonify, g
from models import db, Medicine
from middleware import token_required, optional_token
from utils.ml_recommendation import get_collaborative_recommendations

medicines_bp = Blueprint('medicines', __name__)


@medicines_bp.route('/api/medicines/recommendations', methods=['GET'])
@optional_token
def recommendations():
    """Get collaborative filtering recommendations based on user history."""
    # Fix Bug #5: use g.current_user_id (set by @optional_token), not g.user
    user_id = g.current_user_id if g.current_user_id else None

    # Get top 6 recommended items
    recommended_meds = get_collaborative_recommendations(user_id, num_recommendations=6)

    return jsonify({
        'status': 'success',
        'medicines': recommended_meds,
        'message': 'Rekomendasi berdasarkan aktivitas Anda' if user_id else 'Rekomendasi obat populer'
    })


@medicines_bp.route('/api/medicines', methods=['GET'])
@optional_token
def list_medicines():
    """List all medicines with optional filters."""
    query = Medicine.query.filter_by(is_active=True)

    # Category filter
    category = request.args.get('category', '').strip()
    if category:
        query = query.filter(Medicine.category == category)

    # Search filter
    search = request.args.get('q', '').strip()
    if search:
        pattern = f'%{search}%'
        # Fix Bug #6: tambahkan ingredients ke pencarian agar komposisi/kandungan ditemukan
        query = query.filter(
            db.or_(
                Medicine.name.ilike(pattern),
                Medicine.category.ilike(pattern),
                Medicine.indication.ilike(pattern),
                Medicine.ingredients.ilike(pattern),
                Medicine.description.ilike(pattern),
            )
        )

    # Pagination — max 1000 per page, page minimum 1
    page = max(1, request.args.get('page', 1, type=int))
    per_page = request.args.get('per_page', 40, type=int)
    per_page = min(max(1, per_page), 1000)

    paginated = query.order_by(Medicine.name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'status': 'success',
        'medicines': [m.to_dict() for m in paginated.items],
        'total': paginated.total,
        'page': page,
        'per_page': per_page,
        'pages': paginated.pages,
    })


@medicines_bp.route('/api/medicines/search', methods=['GET'])
@optional_token
def search_medicines():
    """Quick search endpoint."""
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'status': 'error', 'message': 'Query "q" wajib diisi.'}), 400

    pattern = f'%{q}%'
    results = Medicine.query.filter(
        Medicine.is_active == True,
        db.or_(
            Medicine.name.ilike(pattern),
            Medicine.category.ilike(pattern),
            Medicine.indication.ilike(pattern),
            Medicine.benefits.ilike(pattern),
        )
    ).order_by(Medicine.name).limit(20).all()

    return jsonify({
        'status': 'success',
        'medicines': [m.to_dict() for m in results],
        'total': len(results),
    })


@medicines_bp.route('/api/medicines/<int:medicine_id>', methods=['GET'])
@optional_token
def get_medicine(medicine_id):
    """Get single medicine detail."""
    medicine = Medicine.query.get(medicine_id)
    if not medicine:
        return jsonify({'status': 'error', 'message': 'Obat tidak ditemukan.'}), 404

    return jsonify({
        'status': 'success',
        'medicine': medicine.to_dict(),
    })


@medicines_bp.route('/api/medicines/categories', methods=['GET'])
@optional_token
def list_categories():
    """List all medicine categories."""
    categories = db.session.query(Medicine.category).distinct().order_by(Medicine.category).all()
    return jsonify({
        'status': 'success',
        'categories': [c[0] for c in categories],
    })
