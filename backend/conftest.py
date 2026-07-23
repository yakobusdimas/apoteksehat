"""
Pytest fixtures for backend testing.
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from models import db as _db, User
from middleware import generate_token


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    os.environ['FLASK_ENV'] = 'testing'
    application = create_app()
    return application


@pytest.fixture(scope='function')
def db(app):
    """Setup database for each test."""
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app, db):
    """Create test client with clean database."""
    return app.test_client()


@pytest.fixture
def sample_user(app, db):
    """Create a sample user for testing."""
    user = User(
        id='test-user-001',
        name='Test User',
        email='test@example.com',
        phone='08123456789',
        role='user',
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def sample_admin(app, db):
    """Create a sample admin for testing."""
    admin = User(
        id='test-admin-001',
        name='Test Admin',
        email='admin@apoteksehat.com',
        role='admin',
    )
    admin.set_password('admin123')
    db.session.add(admin)
    db.session.commit()
    return admin


@pytest.fixture
def auth_headers(sample_user):
    """Generate authorization headers for sample user."""
    token = generate_token(sample_user.id, sample_user.role)
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def admin_headers(sample_admin):
    """Generate authorization headers for admin."""
    token = generate_token(sample_admin.id, sample_admin.role)
    return {'Authorization': f'Bearer {token}'}
