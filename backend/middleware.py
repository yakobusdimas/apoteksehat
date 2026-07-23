"""
Middleware for Apotek Sehat API.
JWT authentication, admin authorization, request ID, security headers, logging.
"""

import os
import uuid
import logging
import functools
from datetime import datetime, timezone
from flask import request, jsonify, g, has_app_context
from functools import wraps
import jwt

class RequestIDFilter(logging.Filter):
    """Inject request_id into log records safely."""
    def filter(self, record):
        if has_app_context():
            record.request_id = getattr(g, 'request_id', '-')
        else:
            record.request_id = '-'
        return True

# Configure root logger with a SAFE format (no request_id — used by waitress/other libs)
log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Configure our own 'apotek' logger with request_id format
logger = logging.getLogger('apotek')
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter(
        '[%(asctime)s] [%(request_id)s] [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))
    _handler.addFilter(RequestIDFilter())
    logger.addHandler(_handler)
    logger.propagate = False  # Don't pass to root logger (avoids duplicate logs)


# ── Request ID Middleware ──────────────────────────────────────────────────

def init_request_id(app):
    """Attach request_id to every request."""
    @app.before_request
    def before_request():
        g.request_id = request.headers.get('X-Request-ID', str(uuid.uuid4())[:8])
        g.start_time = datetime.now(timezone.utc)

    @app.after_request
    def after_request(response):
        duration = (datetime.now(timezone.utc) - g.get('start_time', datetime.now(timezone.utc))).total_seconds()
        logger.info(
            f"{request.method} {request.path} → {response.status_code} ({duration:.3f}s)"
        )
        response.headers['X-Request-ID'] = g.get('request_id', 'N/A')
        return response


# ── Security Headers Middleware ────────────────────────────────────────────

def init_security_headers(app):
    """Add security headers to all responses."""
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response


# ── JWT Auth Middleware ────────────────────────────────────────────────────

def get_jwt_secret():
    """Get JWT secret from config (lazy import to avoid circular)."""
    from config import get_config
    return get_config().JWT_SECRET_KEY


def token_required(f):
    """Decorator: require valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Token autentikasi diperlukan.'
            }), 401

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
            g.current_user_id = payload.get('sub')
            g.current_user_role = payload.get('role', 'user')
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error',
                'message': 'Token sudah expired. Silakan login kembali.'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'status': 'error',
                'message': 'Token tidak valid.'
            }), 401

        return f(*args, **kwargs)
    return decorated


def optional_token(f):
    """Decorator: accept JWT token if present, but don't require it.
    Sets g.current_user_id and g.current_user_role if a valid token is found."""
    @wraps(f)
    def decorated(*args, **kwargs):
        g.current_user_id = None
        g.current_user_role = None

        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
                g.current_user_id = payload.get('sub')
                g.current_user_role = payload.get('role', 'user')
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
                pass  # Token invalid/expired — continue as anonymous

        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator: require admin role (must be used after @token_required)."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.get('current_user_role') != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Akses ditolak. Hanya untuk admin.'
            }), 403
        return f(*args, **kwargs)
    return decorated


def generate_token(user_id: str, role: str = 'user') -> str:
    """Generate JWT token for user."""
    from config import get_config
    config = get_config()
    payload = {
        'sub': user_id,
        'role': role,
        'iat': datetime.now(timezone.utc),
    }
    # Convert timedelta to seconds for jwt.encode
    exp = config.JWT_ACCESS_TOKEN_EXPIRES
    payload['exp'] = datetime.now(timezone.utc) + exp
    return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm='HS256')
