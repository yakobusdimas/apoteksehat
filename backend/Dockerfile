FROM python:3.12-slim

WORKDIR /app

# Install dependencies first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment defaults (safe for production)
ENV FLASK_ENV=production
ENV FLASK_DEBUG=false
ENV PORT=5000
ENV CORS_ORIGINS=http://localhost:5173
ENV DATABASE_URL=postgresql://apotek_user:apotek_password_local@postgres:5432/apotek_db
ENV SECRET_KEY=change-this-in-production

EXPOSE 5000

CMD ["sh", "-c", "python seed.py && python -c \"from app import create_app, socketio; from config import get_config; config = get_config(); app = create_app(config); socketio.run(app, host='0.0.0.0', port=config.PORT, debug=config.FLASK_DEBUG, allow_unsafe_werkzeug=True)\""]
