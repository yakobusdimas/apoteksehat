"""
Input validation utilities for Apotek Sehat API.
"""


import re


EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
PHONE_REGEX = re.compile(r'^(\+62|62|0)[0-9]{9,13}$')


def validate_email(email: str) -> bool:
    """Validate email format."""
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip().lower()))


def validate_password(password: str) -> dict:
    """Validate password strength."""
    if not password or not isinstance(password, str):
        return {'valid': False, 'message': 'Password wajib diisi.'}
    if len(password) < 6:
        return {'valid': False, 'message': 'Password minimal 6 karakter.'}
    if len(password) > 128:
        return {'valid': False, 'message': 'Password terlalu panjang.'}
    return {'valid': True}


def validate_phone(phone: str) -> bool:
    """Validate Indonesian phone number format."""
    if not phone:
        return True  # Phone is optional
    cleaned = re.sub(r'[\s\-()]', '', phone)
    return bool(PHONE_REGEX.match(cleaned))


def validate_name(name: str) -> dict:
    """Validate user name."""
    if not name or not isinstance(name, str):
        return {'valid': False, 'message': 'Nama wajib diisi.'}
    name = name.strip()
    if len(name) < 2:
        return {'valid': False, 'message': 'Nama minimal 2 karakter.'}
    if len(name) > 100:
        return {'valid': False, 'message': 'Nama terlalu panjang.'}
    return {'valid': True}


def sanitize_string(s: str, max_length: int = 500) -> str:
    """Sanitize string input — trim and limit length."""
    if not s or not isinstance(s, str):
        return ''
    return s.strip()[:max_length]


def validate_order_data(data: dict) -> dict:
    """Validate order creation payload."""
    errors = []
    if not data:
        return {'valid': False, 'errors': ['Request body tidak boleh kosong.']}

    items = data.get('items', [])
    if not items or not isinstance(items, list):
        errors.append('Items wajib diisi dan berupa array.')
    else:
        for i, item in enumerate(items):
            if not item.get('name'):
                errors.append(f'Item {i+1}: nama wajib diisi.')
            if not item.get('quantity') or item.get('quantity', 0) < 1:
                errors.append(f'Item {i+1}: quantity minimal 1.')
            if item.get('price', 0) < 0:
                errors.append(f'Item {i+1}: price tidak boleh negatif.')

    address = data.get('address', {})
    if not address.get('name'):
        errors.append('Nama penerima wajib diisi.')
    if not address.get('phone'):
        errors.append('Nomor telepon penerima wajib diisi.')

    if errors:
        return {'valid': False, 'errors': errors}
    return {'valid': True}
