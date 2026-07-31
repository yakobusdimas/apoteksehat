"""
Tests for Auth endpoints.
Run: cd backend && python -m pytest test_auth.py -v
"""

import pytest
import json


class TestRegister:
    """Tests for POST /api/auth/register."""

    def test_register_success(self, client, db):
        response = client.post('/api/auth/register', json={
            'name': 'New User',
            'email': 'new@example.com',
            'password': 'password123',
            'phone': '08123456789',
            'address': 'Test Address',
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data['status'] == 'success'
        assert 'token' in data
        assert data['user']['email'] == 'new@example.com'
        assert data['user']['role'] == 'user'

    def test_register_duplicate_email(self, client, sample_user):
        response = client.post('/api/auth/register', json={
            'name': 'Duplicate',
            'email': 'test@example.com',
            'password': 'password123',
        })
        assert response.status_code == 409
        data = response.get_json()
        assert 'sudah terdaftar' in data['message']

    def test_register_invalid_email(self, client):
        response = client.post('/api/auth/register', json={
            'name': 'Bad Email',
            'email': 'notanemail',
            'password': 'password123',
        })
        assert response.status_code == 400
        assert 'email' in response.get_json()['message'].lower()

    def test_register_short_password(self, client):
        response = client.post('/api/auth/register', json={
            'name': 'Short PW',
            'email': 'short@example.com',
            'password': '12345',
        })
        assert response.status_code == 400
        assert 'minimal' in response.get_json()['message']

    def test_register_missing_name(self, client):
        response = client.post('/api/auth/register', json={
            'email': 'noname@example.com',
            'password': 'password123',
        })
        assert response.status_code == 400

    def test_register_empty_body(self, client):
        response = client.post('/api/auth/register',
                               data='not json',
                               content_type='application/json')
        assert response.status_code == 400


class TestLogin:
    """Tests for POST /api/auth/login."""

    def test_login_success(self, client, sample_user):
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'password123',
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert 'token' in data

    def test_login_wrong_password(self, client, sample_user):
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword',
        })
        assert response.status_code == 401

    def test_login_unknown_email(self, client):
        response = client.post('/api/auth/login', json={
            'email': 'unknown@example.com',
            'password': 'password123',
        })
        # Pesan generik 401 (anti user-enumeration), bukan 404
        assert response.status_code == 401

    def test_login_empty_fields(self, client):
        response = client.post('/api/auth/login', json={
            'email': '',
            'password': '',
        })
        assert response.status_code == 400


class TestProfile:
    """Tests for GET /api/auth/me and PUT /api/auth/profile."""

    def test_get_profile_success(self, client, sample_user, auth_headers):
        response = client.get('/api/auth/me', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['email'] == 'test@example.com'

    def test_get_profile_no_token(self, client):
        response = client.get('/api/auth/me')
        assert response.status_code == 401

    def test_get_profile_invalid_token(self, client):
        response = client.get('/api/auth/me', headers={
            'Authorization': 'Bearer invalidtoken'
        })
        assert response.status_code == 401

    def test_update_profile(self, client, sample_user, auth_headers):
        response = client.put('/api/auth/profile', headers=auth_headers, json={
            'name': 'Updated Name',
            'phone': '08111111111',
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['name'] == 'Updated Name'
        assert data['user']['phone'] == '08111111111'

    def test_update_profile_invalid_phone(self, client, sample_user, auth_headers):
        response = client.put('/api/auth/profile', headers=auth_headers, json={
            'phone': 'abc123',
        })
        assert response.status_code == 400
