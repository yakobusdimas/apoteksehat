"""
Tests for Order endpoints.
Run: cd backend && python -m pytest test_orders.py -v
"""

import pytest


class TestCreateOrder:
    """Tests for POST /api/orders."""

    def test_create_order_success(self, client, sample_user, auth_headers, db):
        # First add a medicine
        from models import Medicine
        med = Medicine(
            name='Test Medicine',
            category='Pereda Nyeri',
            price=15000,
            stock=100,
        )
        db.session.add(med)
        db.session.commit()

        response = client.post('/api/orders', headers=auth_headers, json={
            'items': [
                {'name': 'Test Medicine', 'quantity': 2, 'price': 15000, 'medicineId': med.id}
            ],
            'address': {'name': 'Test Name', 'phone': '08123456789', 'detail': 'Jl. Test No. 1'},
            'courier': {'name': 'JNE', 'service': 'REG'},
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['order']['orderId'].startswith('APY-')
        assert data['order']['total'] == 30000
        assert data['order']['status'] == 'processing'

    def test_create_order_no_auth(self, client):
        response = client.post('/api/orders', json={
            'items': [{'name': 'Test', 'quantity': 1, 'price': 10000}],
            'address': {'name': 'Test', 'phone': '08123456789'},
        })
        assert response.status_code == 401

    def test_create_order_empty_items(self, client, auth_headers):
        response = client.post('/api/orders', headers=auth_headers, json={
            'items': [],
            'address': {'name': 'Test', 'phone': '08123456789'},
        })
        assert response.status_code == 400

    def test_create_order_missing_address(self, client, auth_headers):
        response = client.post('/api/orders', headers=auth_headers, json={
            'items': [{'name': 'Test', 'quantity': 1, 'price': 10000}],
        })
        assert response.status_code == 400


class TestListOrders:
    """Tests for GET /api/orders."""

    def test_list_orders_empty(self, client, sample_user, auth_headers):
        response = client.get('/api/orders', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['total'] == 0

    def test_list_orders_no_auth(self, client):
        response = client.get('/api/orders')
        assert response.status_code == 401


class TestCancelOrder:
    """Tests for PUT /api/orders/:id/cancel."""

    def test_cancel_order_success(self, client, sample_user, auth_headers, db):
        from models import Order, OrderItem, Medicine
        med = Medicine(name='Cancel Test', price=10000, stock=50)
        db.session.add(med)
        db.session.commit()

        order = Order(
            order_id='APY-TEST-0001',
            user_id=sample_user.id,
            total=10000,
            status='processing',
            address_name='Test',
            phone='08123456789',
        )
        db.session.add(order)
        oi = OrderItem(order=order, name='Cancel Test', quantity=1, price=10000, medicine_id=med.id)
        db.session.add(oi)
        db.session.commit()

        response = client.put(f'/api/orders/{order.id}/cancel', headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data['order']['status'] == 'cancelled'

    def test_cancel_order_not_found(self, client, auth_headers):
        response = client.put('/api/orders/99999/cancel', headers=auth_headers)
        assert response.status_code == 404
