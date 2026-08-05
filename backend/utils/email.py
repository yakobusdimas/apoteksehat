"""
Email notification service using Flask-Mail + Mailtrap SMTP.
Send order confirmation, status update, and welcome emails.

Usage:
    from utils.email import send_order_confirmation
    
    send_order_confirmation(
        to_email="customer@example.com",
        order_id="ORD-001",
        total=150000,
        items=[{"name": "Paracetamol", "quantity": 2}]
    )
"""

import os
from flask import current_app
from flask_mail import Message, Mail


def _get_mail():
    """Lazy-load the Mail instance from current app to avoid circular imports."""
    return current_app.extensions.get('mail') or current_app.extensions.get('flask-mail')


def _get_mail_config():
    """Get Mailtrap SMTP configuration."""
    return {
        "MAIL_SERVER": os.getenv("MAIL_SERVER", "smtp.mailtrap.io"),
        "MAIL_PORT": int(os.getenv("MAIL_PORT", "2525")),
        "MAIL_USE_TLS": os.getenv("MAIL_USE_TLS", "true").lower() == "true",
        "MAIL_USERNAME": os.getenv("MAIL_USERNAME", ""),
        "MAIL_PASSWORD": os.getenv("MAIL_PASSWORD", ""),
        "MAIL_DEFAULT_SENDER": os.getenv(
            "MAIL_DEFAULT_SENDER", "Apotek Sehat <noreply@apotek-sehat.com>"
        ),
    }


def send_email(subject: str, recipients: list[str], html_body: str):
    """
    Send an email via Mailtrap SMTP.
    
    Args:
        subject: Email subject line
        recipients: List of recipient email addresses
        html_body: HTML content for the email body
    """
    try:
        config = _get_mail_config()
        
        # Update Flask app config with Mailtrap settings
        current_app.config["MAIL_SERVER"] = config["MAIL_SERVER"]
        current_app.config["MAIL_PORT"] = config["MAIL_PORT"]
        current_app.config["MAIL_USE_TLS"] = config["MAIL_USE_TLS"]
        current_app.config["MAIL_USERNAME"] = config["MAIL_USERNAME"]
        current_app.config["MAIL_PASSWORD"] = config["MAIL_PASSWORD"]
        current_app.config["MAIL_DEFAULT_SENDER"] = config["MAIL_DEFAULT_SENDER"]
        
        msg = Message(
            subject=subject,
            recipients=recipients,
            html=html_body,
            sender=config["MAIL_DEFAULT_SENDER"],
        )
        
        _get_mail().send(msg)
        return True
        
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        # Don't raise exception — email failure shouldn't break order flow
        return False


def send_order_confirmation(to_email: str, order_id: str, total: float, items: list[dict]):
    """
    Send order confirmation email to customer.
    
    Args:
        to_email: Customer's email address
        order_id: Order ID (e.g., "ORD-001")
        total: Total order amount in IDR
        items: List of dicts with keys: name, quantity, price
    """
    items_html = "".join(
        f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">{item['name']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">Rp{item.get('price', 0):,.0f}</td>
        </tr>
        """
        for item in items
    )
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
            ✅ Pesanan Berhasil Dibuat!
        </h2>
        
        <p>Terima kasih telah berbelanja di <strong>Apotek Sehat</strong>!</p>
        
        <div style="background: #f0fdfa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>ID Pesanan:</strong> {order_id}</p>
            <p><strong>Total Pembayaran:</strong> <span style="color: #0891b2; font-size: 1.2em;">Rp{total:,.0f}</span></p>
        </div>
        
        <h3 style="margin-top: 24px;">Detail Pesanan:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #0891b2; color: white;">
                    <th style="padding: 12px; text-align: left;">Produk</th>
                    <th style="padding: 12px; text-align: center;">Jumlah</th>
                    <th style="padding: 12px; text-align: right;">Harga</th>
                </tr>
            </thead>
            <tbody>
                {items_html}
            </tbody>
        </table>
        
        <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px;">
            <p style="margin: 0;"><strong>⏰ Langkah Selanjutnya:</strong></p>
            <p style="margin: 8px 0 0 0;">Silakan selesaikan pembayaran Anda dalam 24 jam agar pesanan dapat segera diproses.</p>
        </div>
        
        <p style="margin-top: 24px; color: #666;">
            Jika ada pertanyaan, hubungi kami di 
            <a href="mailto:support@apotek-sehat.com">support@apotek-sehat.com</a>
        </p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 0.9em;">
            <p>Terima kasih,</p>
            <p><strong>Apotek Sehat</strong></p>
            <p>Sehat Anda, Prioritas Kami 💊</p>
        </div>
    </div>
    """
    
    return send_email(
        subject=f"✅ Konfirmasi Pesanan {order_id} - Apotek Sehat",
        recipients=[to_email],
        html_body=html_body,
    )


def send_order_status_update(to_email: str, order_id: str, new_status: str):
    """
    Send order status update notification.
    
    Args:
        to_email: Customer's email address
        order_id: Order ID (e.g., "ORD-001")
        new_status: New order status (processing, shipped, delivered, cancelled)
    """
    status_messages = {
        "processing": ("📦 Pesanan Sedang Diproses", "Tim apoteker kami sedang menyiapkan pesanan Anda."),
        "shipped": ("🚚 Pesanan Sedang Dikirim", "Pesanan Anda telah dikirim dan sedang dalam perjalanan!"),
        "delivered": ("✅ Pesanan Telah Diterima", "Pesanan Anda telah berhasil diterima. Semoga lekas sembuh!"),
        "cancelled": ("❌ Pesanan Dibatalkan", "Pesanan Anda telah dibatalkan."),
    }
    
    title, message = status_messages.get(new_status, (new_status, ""))
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
            {title}
        </h2>
        
        <p>Pesanan Anda dengan ID <strong>{order_id}</strong> telah diperbarui.</p>
        
        <div style="background: #f0fdfa; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Status:</strong> {new_status.upper()}</p>
            <p>{message}</p>
        </div>
        
        <p style="color: #666; margin-top: 24px;">
            Untuk informasi lebih lanjut, hubungi kami di 
            <a href="mailto:support@apotek-sehat.com">support@apotek-sehat.com</a>
        </p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 0.9em;">
            <p>Terima kasih,</p>
            <p><strong>Apotek Sehat</strong></p>
        </div>
    </div>
    """
    
    return send_email(
        subject=f"📬 Update Status Pesanan {order_id} - Apotek Sehat",
        recipients=[to_email],
        html_body=html_body,
    )


def send_welcome_email(to_email: str, name: str):
    """
    Send welcome email to new users.
    
    Args:
        to_email: New user's email address
        name: User's name
    """
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">
            🎉 Selamat Datang di Apotek Sehat!
        </h2>
        
        <p>Halo <strong>{name}</strong>,</p>
        
        <p>Terima kasih telah mendaftar di Apotek Sehat! Sekarang Anda bisa:</p>
        
        <ul style="line-height: 1.8;">
            <li>✅ Belanja obat-obatan dengan mudah</li>
            <li>🚚 Pesan dan terima di rumah</li>
            <li>📋 Lacak status pesanan Anda</li>
            <li>💬 Dapatkan konsultasi chatbot kesehatan 24/7</li>
        </ul>
        
        <div style="margin-top: 24px; text-align: center;">
            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/medicines" 
               style="background: #0891b2; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Mulai Belanja Sekarang
            </a>
        </div>
        
        <p style="margin-top: 24px; color: #666;">
            Jika ada pertanyaan, hubungi kami di 
            <a href="mailto:support@apotek-sehat.com">support@apotek-sehat.com</a>
        </p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 0.9em;">
            <p>Salam sehat,</p>
            <p><strong>Tim Apotek Sehat</strong></p>
            <p>Sehat Anda, Prioritas Kami 💊</p>
        </div>
    </div>
    """
    
    return send_email(
        subject="🎉 Selamat Datang di Apotek Sehat!",
        recipients=[to_email],
        html_body=html_body,
    )
