"""
Profile routes: User profile & allergy management.
"""

from flask import Blueprint, request, jsonify, g
from config import get_config
from middleware import token_required
from models import db, User
import json

config = get_config()
profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/api/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile with allergies."""
    user_obj = User.query.filter_by(id=g.current_user_id).first()
    if not user_obj:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    return jsonify({
        'status': 'success',
        'profile': user_obj.to_dict(),
    })


@profile_bp.route('/api/profile/allergies', methods=['PUT'])
@token_required
def update_allergies():
    """Update user allergies list."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    new_allergies = data.get('allergies', [])

    # Validate allergies
    if not isinstance(new_allergies, list):
        return jsonify({'status': 'error', 'message': 'Allergies harus berupa array.'}), 400

    validated = []
    for a in new_allergies:
        if isinstance(a, str) and a.strip():
            validated.append(a.strip())

    user_obj = User.query.filter_by(id=g.current_user_id).first()
    if not user_obj:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    # Save as JSON string in TEXT field
    user_obj.allergies = json.dumps(validated)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Profil alergi berhasil diperbarui.',
        'allergies': validated,
    })
