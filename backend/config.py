"""
Backend configuration for Apotek Sehat API.

Development and testing keep safe local defaults so the project is easy to run.
Production must provide strong secrets through environment variables.
"""

import os
from datetime import timedelta


INSECURE_SECRET_VALUES = {
    '',
    'change-this-in-production',
    'apotek-sehat-secret-key-change-in-production-2026',
    'jwt-apotek-secret-change-me',
    'apotek-local-secret-change-later',
    'apotek-local-jwt-secret-change-later',
}

INSECURE_ADMIN_PASSWORDS = {
    '',
    'admin',
    'admin123',
    'password',
    'password123',
}


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv(
        'SECRET_KEY',
        'dev-only-secret-key-for-apotek-sehat-please-change-before-production'
    )
    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY',
        'dev-only-jwt-secret-for-apotek-sehat-minimum-32-bytes'
    )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Database — Docker/local uses PostgreSQL via DATABASE_URL; SQLite is only a fallback.
    # Docker format: postgresql://apotek_user:apotek_password_local@postgres:5432/apotek_db
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///apotek.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() in ('1', 'true', 'yes')
    PORT = int(os.getenv('PORT', '5000'))

    # CORS
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:5174,http://localhost:3000'
    )

    # Chatbot NLP
    MIN_CONFIDENCE = float(os.getenv('MIN_CONFIDENCE', '0.9'))
    MAX_MESSAGE_LENGTH = int(os.getenv('MAX_MESSAGE_LENGTH', '500'))
    MODEL_PATH = os.getenv('MODEL_PATH', 'models/best_model.pkl')
    VECTORIZER_PATH = os.getenv('VECTORIZER_PATH', 'models/tfidf_vectorizer.pkl')
    LABEL_ENCODER_PATH = os.getenv('LABEL_ENCODER_PATH', 'models/label_encoder.pkl')
    MEDICINES_PATH = os.getenv('MEDICINES_PATH', '../model_training/data/medicines_primary.json')
    INTENTS_PATH = os.getenv('INTENTS_PATH', '../model_training/data/intents.json')
    SYNONYMS_PATH = os.getenv('SYNONYMS_PATH', '../model_training/data/synonyms_id.json')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

    # Rate Limiting
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '200 per minute')
    RATE_LIMIT_LOGIN = os.getenv('RATE_LIMIT_LOGIN', '50 per minute')
    RATE_LIMIT_REGISTER = os.getenv('RATE_LIMIT_REGISTER', '30 per minute')
    RATE_LIMIT_CHAT = os.getenv('RATE_LIMIT_CHAT', '100 per minute')

    # Admin default (created on first run). Development has a demo password;
    # production must override it and passes validation in get_config().
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@gmail.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
    ADMIN_NAME = os.getenv('ADMIN_NAME', 'Admin 1')


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    FLASK_DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    FLASK_DEBUG = False
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    RATE_LIMIT_DEFAULT = '1000 per minute'
    RATE_LIMIT_LOGIN = '1000 per minute'
    RATE_LIMIT_REGISTER = '1000 per minute'
    RATE_LIMIT_CHAT = '1000 per minute'


def validate_production_config(config):
    """Fail fast when production secrets are missing or still demo values."""
    errors = []

    if config.SECRET_KEY in INSECURE_SECRET_VALUES or len(config.SECRET_KEY) < 32:
        errors.append('SECRET_KEY must be set to a strong value of at least 32 characters.')

    if config.JWT_SECRET_KEY in INSECURE_SECRET_VALUES or len(config.JWT_SECRET_KEY) < 32:
        errors.append('JWT_SECRET_KEY must be set to a strong value of at least 32 characters.')

    if config.ADMIN_PASSWORD in INSECURE_ADMIN_PASSWORDS or len(config.ADMIN_PASSWORD) < 12:
        errors.append('ADMIN_PASSWORD must be changed and contain at least 12 characters.')

    if errors:
        joined = ' '.join(errors)
        raise RuntimeError(f'Invalid production configuration: {joined}')



def get_config():
    """Get configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        config = ProductionConfig()
        validate_production_config(config)
        return config
    elif env == 'testing':
        return TestingConfig()
    return DevelopmentConfig()
