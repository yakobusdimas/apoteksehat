"""
Apotek Sehat API — Entry Point

Flask application factory with all blueprints registered.
Run: python app.py
"""

import os

# Load .env dari root project (satu level di atas backend/)
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(_env_path):
    with open(_env_path, encoding='utf-8', errors='ignore') as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _v = _line.split('=', 1)
                os.environ.setdefault(_k.strip(), _v.strip())

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import get_config
from extensions import limiter

# Import extensions
from flask_mail import Mail
from flask_migrate import Migrate
mail = Mail()
migrate = Migrate()

# Import models (must be before routes for db reference)
from models import db, User, Medicine

# Import middleware
from middleware import init_request_id, init_security_headers

# Import websockets
from sockets import socketio

# Import routes
from routes.auth import auth_bp
from routes.medicines import medicines_bp
from routes.orders import orders_bp
from routes.admin import admin_bp
from routes.chat import chat_bp
from routes.profile import profile_bp


def create_app(config=None):
    """Create and configure Flask application."""
    if config is None:
        config = get_config()

    app = Flask(__name__)
    app.config.from_object(config)

    # ── Initialize Extensions ───────────────────────────────────────
    db.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    socketio.init_app(app)

    # Allow up to 20 MB request body (supports Base64-encoded images ~15 MB raw)
    app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20 MB

    # CORS with configurable origins
    origins = [o.strip() for o in config.CORS_ORIGINS.split(',') if o.strip()]
    CORS(app, resources={
        r"/api/*": {
            "origins": origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    })

    # Rate limiting — default limit dari config; limit login/register
    # diterapkan per-endpoint di routes/auth.py via @limiter.limit(...)
    app.config.setdefault('RATELIMIT_DEFAULT', config.RATE_LIMIT_DEFAULT)
    limiter.init_app(app)

    # ── Initialize Middleware ────────────────────────────────────────
    init_request_id(app)
    init_security_headers(app)

    # Chat blueprint punya limit seragam untuk semua endpoint-nya
    limiter.limit(config.RATE_LIMIT_CHAT)(chat_bp)

    # ── Register Blueprints ────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(medicines_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(profile_bp)

    # ── Health Check ───────────────────────────────────────────────
    @app.route('/api/health', methods=['GET'])
    def health():
        """Health check endpoint."""
        return jsonify({
            'status': 'ok',
            'environment': 'development' if config.FLASK_DEBUG else 'production',
            'database': 'connected' if db.engine else 'disconnected',
        })

    # ── Static Medicine Images ─────────────────────────────────────────────
    MEDICINES_STATIC = os.path.join(os.path.dirname(__file__), 'static', 'medicines')
    PUBLIC_MEDICINES_STATIC = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'medicines')

    @app.route('/medicines/<path:filename>', methods=['GET'])
    @app.route('/static/medicines/<path:filename>', methods=['GET'])
    def medicine_image(filename):
        """Serve medicine images from static/medicines/ or frontend/public/medicines/ directory."""
        if os.path.exists(os.path.join(MEDICINES_STATIC, filename)):
            return send_from_directory(MEDICINES_STATIC, filename)
        if os.path.exists(os.path.join(PUBLIC_MEDICINES_STATIC, filename)):
            return send_from_directory(PUBLIC_MEDICINES_STATIC, filename)
        return send_from_directory(MEDICINES_STATIC, filename)

    # ── Error Handlers ─────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'status': 'error', 'message': 'Endpoint tidak ditemukan.'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'status': 'error', 'message': 'Method tidak diizinkan.'}), 405

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({'status': 'error', 'message': 'Terlalu banyak request. Coba lagi nanti.'}), 429

    @app.errorhandler(500)
    def internal_error(e):
        if config.FLASK_DEBUG:
            return jsonify({'status': 'error', 'message': str(e)}), 500
        return jsonify({'status': 'error', 'message': 'Terjadi kesalahan internal server.'}), 500

    # Load NLP model globally when app starts
    try:
        from utils.nlp import load_model
        load_model(config)
    except FileNotFoundError as e:
        import logging
        logging.getLogger('apotek').warning(f"NLP model not found: {e}. Chatbot endpoint will return 503.")

    return app


# Admin seeding lives in utils.seeding to keep this entry point focused.



# ── Main ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app = create_app()

    with app.app_context():
        db.create_all()

    from utils.seeding import seed_admin

    seed_admin(app)

    config = get_config()
    print("\n" + "=" * 60)
    print("    CHATBOT API SERVER - APOTEK SEHAT")
    print("=" * 60)
    print(f"  Environment : {'DEVELOPMENT' if config.FLASK_DEBUG else 'PRODUCTION'}")
    print(f"  Server      : http://localhost:{config.PORT}")
    print(f"  Database    : {config.SQLALCHEMY_DATABASE_URI}")
    print(f"  Endpoints   :")
    print(f"    POST /api/auth/register")
    print(f"    POST /api/auth/login")
    print(f"    GET  /api/auth/me")
    print(f"    GET  /api/medicines")
    print(f"    POST /api/orders")
    print(f"    POST /api/chat")
    print(f"    GET  /api/health")
    print("=" * 60 + "\n")

    # Use socketio.run instead of app.run for WebSocket support
    socketio.run(app, host='0.0.0.0', port=config.PORT, debug=config.FLASK_DEBUG, allow_unsafe_werkzeug=True)
