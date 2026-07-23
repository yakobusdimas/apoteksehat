"""
Tests for email notification service.

Note: These tests use a mock SMTP server to avoid sending real emails.
"""

import os
import pytest
from unittest.mock import patch, MagicMock
from utils.email import (
    send_email,
    send_order_confirmation,
    send_order_status_update,
    send_welcome_email,
)
from app import create_app


@pytest.fixture
def app_context():
    """Fixture to provide Flask application context."""
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        yield app


@pytest.fixture
def mock_mail_send():
    """Fixture to mock mail.send."""
    with patch('utils.email.mail.send') as mock_send:
        mock_send.return_value = None
        yield mock_send


def test_send_email_success(app_context, mock_mail_send):
    """Test send_email with valid inputs."""
    success = send_email(
        subject="Test Subject",
        recipients=["test@example.com"],
        html_body="<p>Test Body</p>",
    )
    
    assert success is True
    mock_mail_send.assert_called_once()
    msg = mock_mail_send.call_args[0][0]
    assert msg.subject == "Test Subject"
    assert msg.recipients == ["test@example.com"]
    assert msg.html == "<p>Test Body</p>"


def test_send_order_confirmation(app_context, mock_mail_send):
    """Test order confirmation email."""
    success = send_order_confirmation(
        to_email="customer@example.com",
        order_id="ORD-001",
        total=150000,
        items=[
            {"name": "Paracetamol", "quantity": 2, "price": 15000},
            {"name": "Ibuprofen", "quantity": 1, "price": 20000},
        ],
    )
    
    assert success is True
    mock_mail_send.assert_called_once()
    msg = mock_mail_send.call_args[0][0]
    assert "ORD-001" in msg.subject


def test_send_order_status_update(app_context, mock_mail_send):
    """Test order status update email."""
    success = send_order_status_update(
        to_email="customer@example.com",
        order_id="ORD-001",
        new_status="shipped",
    )
    
    assert success is True
    mock_mail_send.assert_called_once()
    msg = mock_mail_send.call_args[0][0]
    assert "ORD-001" in msg.subject


def test_send_welcome_email(app_context, mock_mail_send):
    """Test welcome email."""
    success = send_welcome_email(
        to_email="newuser@example.com",
        name="John Doe",
    )
    
    assert success is True
    mock_mail_send.assert_called_once()
    msg = mock_mail_send.call_args[0][0]
    assert "Selamat Datang" in msg.subject


def test_email_config_from_env():
    """Test that email config is read from environment variables."""
    os.environ["MAIL_SERVER"] = "smtp.test.com"
    os.environ["MAIL_PORT"] = "587"
    os.environ["MAIL_USE_TLS"] = "true"
    os.environ["MAIL_USERNAME"] = "testuser"
    os.environ["MAIL_PASSWORD"] = "testpass"
    
    from utils.email import _get_mail_config
    config = _get_mail_config()
    
    assert config["MAIL_SERVER"] == "smtp.test.com"
    assert config["MAIL_PORT"] == 587
    assert config["MAIL_USE_TLS"] is True
    assert config["MAIL_USERNAME"] == "testuser"
    assert config["MAIL_PASSWORD"] == "testpass"


def test_email_default_sender():
    """Test default sender is set correctly."""
    from utils.email import _get_mail_config
    config = _get_mail_config()
    
    assert config["MAIL_DEFAULT_SENDER"] == "Apotek Sehat <noreply@apotek-sehat.com>"


def test_email_failure_does_not_raise(app_context, mock_mail_send):
    """Test that email failure does not raise exception."""
    mock_mail_send.side_effect = Exception("SMTP Error")
    
    success = send_email(
        subject="Test",
        recipients=["test@example.com"],
        html_body="<p>Test</p>",
    )
    assert success is False
