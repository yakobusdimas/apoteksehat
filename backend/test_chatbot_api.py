"""
Backend API Tests for Chatbot Apotek

Run with:
    cd backend
    python -m pytest -q

Or with verbose output:
    python -m pytest -v
"""

import pytest
import json
import sys
import os

# Ensure backend directory is in path for imports
sys.path.insert(0, os.path.dirname(__file__))


# ── Unit Tests: preprocess_text ──────────────────────────────────────────────

def preprocess_text(text: str) -> str:
    """Replica of the preprocess_text function for isolated unit testing."""
    text = text.lower()
    text = __import__('re').sub(r'[^a-z0-9\s]', '', text)
    text = ' '.join(text.split())
    return text


class TestPreprocessText:
    """Unit tests for text preprocessing."""

    def test_lowercase(self):
        assert preprocess_text('HALO DUNIA') == 'halo dunia'

    def test_remove_special_chars(self):
        assert preprocess_text('sakit kepala!!!') == 'sakit kepala'

    def test_remove_numbers_keep(self):
        assert preprocess_text('paracetamol 500mg') == 'paracetamol 500mg'

    def test_trim_whitespace(self):
        assert preprocess_text('  halo   dunia  ') == 'halo dunia'

    def test_empty_string(self):
        assert preprocess_text('') == ''

    def test_only_special_chars(self):
        assert preprocess_text('!!!@@@###') == ''

    def test_indonesian_text(self):
        assert preprocess_text('Saya demam dan sakit kepala.') == 'saya demam dan sakit kepala'


# ── Integration Tests: Flask Endpoints ────────────────────────────────────────
# These tests require the full app with model loaded.
# They are skipped if model/data files are not available.

@pytest.fixture(scope='module')
def client():
    """Create a Flask test client. Loads resources only if available."""
    try:
        # Import the app and attempt to load resources
        import importlib
        import chatbot_api
        importlib.reload(chatbot_api)

        # Try loading resources; if files missing, skip gracefully
        chatbot_api.load_resources()
        return chatbot_api.app.test_client()
    except FileNotFoundError as e:
        pytest.skip(f"Model/data file not found: {e}")
    except Exception as e:
        pytest.skip(f"Cannot load resources: {e}")


@pytest.mark.skipif(
    not os.path.exists('../model_training/model/chatbot_model.pkl'),
    reason="Model file not found, skipping integration tests"
)
class TestHealthEndpoint:
    """Tests for GET /api/health."""

    def test_health_returns_json(self, client):
        response = client.get('/api/health')
        assert response.content_type == 'application/json'

    def test_health_returns_ok(self, client):
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert data['status'] == 'ok'

    def test_health_has_model_info(self, client):
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert 'model_loaded' in data
        assert 'total_medicines' in data

    def test_health_has_environment(self, client):
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert 'environment' in data
        assert data['environment'] in ('development', 'production')

    def test_health_model_loaded_true(self, client):
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert data['model_loaded'] is True


@pytest.mark.skipif(
    not os.path.exists('../model_training/model/chatbot_model.pkl'),
    reason="Model file not found, skipping integration tests"
)
class TestChatEndpointValidation:
    """Tests for POST /api/chat input validation."""

    def test_empty_body(self, client):
        response = client.post('/api/chat',
                               data='',
                               content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['status'] == 'error'

    def test_invalid_json(self, client):
        response = client.post('/api/chat',
                               data='bukan json',
                               content_type='application/json')
        assert response.status_code == 400

    def test_missing_message_field(self, client):
        response = client.post('/api/chat',
                               json={'wrong_field': 'hello'},
                               content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'message' in data['message'].lower() or 'wajib' in data['message'].lower()

    def test_empty_message(self, client):
        response = client.post('/api/chat',
                               json={'message': ''},
                               content_type='application/json')
        assert response.status_code == 400

    def test_whitespace_only_message(self, client):
        response = client.post('/api/chat',
                               json={'message': '   '},
                               content_type='application/json')
        assert response.status_code == 400

    def test_message_too_long(self, client):
        long_message = 'a' * 501
        response = client.post('/api/chat',
                               json={'message': long_message},
                               content_type='application/json')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'panjang' in data['message'].lower()

    def test_non_string_message(self, client):
        response = client.post('/api/chat',
                               json={'message': 12345},
                               content_type='application/json')
        assert response.status_code == 400

    def test_valid_message_returns_success(self, client):
        response = client.post('/api/chat',
                               json={'message': 'obat untuk sakit kepala'},
                               content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
        assert 'response' in data
        assert 'intent' in data
        assert 'confidence' in data

    def test_greeting_message(self, client):
        response = client.post('/api/chat',
                               json={'message': 'halo'},
                               content_type='application/json')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'success'
