"""
Auth routes: register, login, profile management.
"""

import uuid
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from models import db, User, AuditLog, PasswordResetToken
from middleware import token_required, generate_token
from utils.validators import (
    validate_email, validate_password, validate_phone,
    validate_name, sanitize_string
)
from utils.email import send_welcome_email
from config import get_config
from extensions import limiter
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/google', methods=['POST'])
@limiter.limit(lambda: get_config().RATE_LIMIT_LOGIN)
def google_auth():
    """Verify Google token and login/register user."""
    data = request.get_json(silent=True)
    if not data or 'token' not in data:
        return jsonify({'status': 'error', 'message': 'Token Google tidak ditemukan.'}), 400

    token = data['token']
    client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    
    if not client_id:
        return jsonify({'status': 'error', 'message': 'Server belum dikonfigurasi untuk Login Google.'}), 500

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        
        email = idinfo.get('email')
        name = idinfo.get('name', 'Google User')
        
        if not email:
            return jsonify({'status': 'error', 'message': 'Tidak bisa mendapatkan email dari Google.'}), 400
            
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Auto-register
            user = User(
                id=str(uuid.uuid4()),
                name=name,
                email=email,
                phone='',
                address='',
                role='user',
            )
            # Set random password since they login with Google
            user.set_password(str(uuid.uuid4()))
            db.session.add(user)
            db.session.flush()
            
            # Audit log
            log = AuditLog(
                user_id=user.id,
                action='register_google',
                details=f'User {email} registered via Google',
                ip_address=request.remote_addr or '',
            )
            db.session.add(log)
        else:
            # Audit log login
            log = AuditLog(
                user_id=user.id,
                action='login_google',
                details=f'User {email} logged in via Google',
                ip_address=request.remote_addr or '',
            )
            db.session.add(log)
            
        db.session.commit()
        
        # Generate our JWT token
        jwt_token = generate_token(user.id, user.role)
        
        return jsonify({
            'status': 'success',
            'message': 'Login via Google berhasil.',
            'token': jwt_token,
            'user': user.to_dict(),
        }), 200

    except ValueError:
        return jsonify({'status': 'error', 'message': 'Token Google tidak valid.'}), 401
    except Exception as e:
        import logging
        logging.error(f"Google auth error: {e}")
        return jsonify({'status': 'error', 'message': 'Gagal memproses login Google.'}), 500

@auth_bp.route('/api/auth/register', methods=['POST'])
@limiter.limit(lambda: get_config().RATE_LIMIT_REGISTER)
def register():
    """Register a new user."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    name = sanitize_string(data.get('name', ''), 100)
    email = data.get('email', '').strip().lower() if data.get('email') else ''
    password = data.get('password', '')
    phone = sanitize_string(data.get('phone', ''), 20)
    address = sanitize_string(data.get('address', ''), 300)

    # Validate
    name_check = validate_name(name)
    if not name_check['valid']:
        return jsonify({'status': 'error', 'message': name_check['message']}), 400

    if not validate_email(email):
        return jsonify({'status': 'error', 'message': 'Format email tidak valid.'}), 400

    pw_check = validate_password(password)
    if not pw_check['valid']:
        return jsonify({'status': 'error', 'message': pw_check['message']}), 400

    if phone and not validate_phone(phone):
        return jsonify({'status': 'error', 'message': 'Format nomor telepon tidak valid.'}), 400

    # Check if email already exists
    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'status': 'error', 'message': 'Email sudah terdaftar. Silakan login.'}), 409

    # Create user
    user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        phone=phone,
        address=address,
        role='user',
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()  # Write user to DB (within transaction) before FK-dependent audit log

    # Audit log
    log = AuditLog(
        user_id=user.id,
        action='register',
        details=f'User {email} registered',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    # Send welcome email (best effort — don't fail registration if email fails)
    try:
        send_welcome_email(
            to_email=user.email,
            name=user.name,
        )
    except Exception as e:
        import logging
        logging.error(f"Failed to send welcome email: {e}")

    # Generate token
    token = generate_token(user.id, user.role)

    return jsonify({
        'status': 'success',
        'message': 'Pendaftaran berhasil.',
        'token': token,
        'user': user.to_dict(),
    }), 201


@auth_bp.route('/api/auth/login', methods=['POST'])
@limiter.limit(lambda: get_config().RATE_LIMIT_LOGIN)
def login():
    """Login user and return JWT token."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    email = data.get('email', '').strip().lower() if data.get('email') else ''
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email dan password wajib diisi.'}), 400

    # Find user — pesan generik agar tidak membocorkan email mana yang terdaftar
    # (mencegah user enumeration)
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'status': 'error', 'message': 'Email atau password salah.'}), 401

    # Audit log
    log = AuditLog(
        user_id=user.id,
        action='login',
        details=f'User {email} logged in',
        ip_address=request.remote_addr or '',
    )
    db.session.add(log)
    db.session.commit()

    # Generate token
    token = generate_token(user.id, user.role)

    return jsonify({
        'status': 'success',
        'message': 'Login berhasil.',
        'token': token,
        'user': user.to_dict(),
    })

@auth_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user profile."""
    user = User.query.filter_by(id=g.current_user_id).first()
    if not user:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    return jsonify({
        'status': 'success',
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_auth_profile():
    """Update current authenticated user profile."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

    user = User.query.filter_by(id=g.current_user_id).first()
    if not user:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404

    if 'name' in data:
        name = sanitize_string(data.get('name', ''), 100)
        name_check = validate_name(name)
        if not name_check['valid']:
            return jsonify({'status': 'error', 'message': name_check['message']}), 400
        user.name = name

    if 'phone' in data:
        phone = sanitize_string(data.get('phone', ''), 20)
        if phone and not validate_phone(phone):
            return jsonify({'status': 'error', 'message': 'Format nomor telepon tidak valid.'}), 400
        user.phone = phone

    if 'address' in data:
        user.address = sanitize_string(data.get('address', ''), 300)

    if 'city' in data:
        user.city = sanitize_string(data.get('city', ''), 50)

    if 'postalCode' in data:
        postal_code = sanitize_string(data.get('postalCode', ''), 10)
        if postal_code and not postal_code.isdigit():
            return jsonify({'status': 'error', 'message': 'Kode pos harus berupa angka.'}), 400
        user.postal_code = postal_code

    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'Profil berhasil diperbarui.',
        'user': user.to_dict(),
    }), 200


@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
@limiter.limit(lambda: get_config().RATE_LIMIT_LOGIN)
def forgot_password():
    """Generate password reset token. In dev mode, returns token directly."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400
    
    email = data.get('email', '').strip().lower() if data else ''
    
    if not email:
        return jsonify({'status': 'error', 'message': 'Email wajib diisi.'}), 400
    
    user = User.query.filter_by(email=email).first()
    # Selalu balas sukses agar tidak membocorkan email mana yang terdaftar
    # (mencegah user enumeration)
    generic_response = {
        'status': 'success',
        'message': 'Jika email terdaftar, link reset telah dikirim.',
    }
    if not user:
        return jsonify(generic_response), 200
    
    # Generate secure token
    import secrets
    token_str = secrets.token_urlsafe(32)
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token_str,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(hours=24),  # 24h expiry
    )
    db.session.add(reset_token)
    db.session.commit()
    
    # In production: send email with reset link
    # For dev mode: return token in response
    if get_config().FLASK_DEBUG:
        return jsonify({
            'status': 'success',
            'message': 'Token reset berhasil dibuat (dev mode).',
            'reset_token': token_str,  # ⚠️ Only exposed in dev mode
            'expires_in_hours': 24,
        }), 200
    
    return jsonify(generic_response), 200


@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400
    
    token_str = data.get('token', '')
    new_password = data.get('newPassword', '') or data.get('new_password', '')
    
    if not token_str:
        return jsonify({'status': 'error', 'message': 'Token wajib diisi.'}), 400
    
    if not new_password:
        return jsonify({'status': 'error', 'message': 'Password baru wajib diisi.'}), 400
    
    # Validate password strength
    pw_check = validate_password(new_password)
    if not pw_check['valid']:
        return jsonify({'status': 'error', 'message': pw_check['message']}), 400
    
    reset_token = PasswordResetToken.query.filter_by(token=token_str).first()
    if not reset_token:
        return jsonify({'status': 'error', 'message': 'Token tidak valid.'}), 400
    
    if reset_token.used:
        return jsonify({'status': 'error', 'message': 'Token sudah digunakan.'}), 400
    
    if reset_token.is_expired():
        return jsonify({'status': 'error', 'message': 'Token sudah kadaluarsa.'}), 400
    
    # Reset password
    user = User.query.get(reset_token.user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User tidak ditemukan.'}), 404
    
    user.set_password(new_password)
    reset_token.used = True
    db.session.commit()
    
    # Invalidate ALL other unused tokens for this user (force re-login from all devices)
    PasswordResetToken.query.filter_by(
        user_id=user.id,
        used=False
    ).delete()
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Password berhasil diubah. Silakan login.',
    }), 200



