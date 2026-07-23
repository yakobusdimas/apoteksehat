#!/bin/bash
# Startup script for Flask Chatbot API
# Run this in a separate terminal before starting React app

echo "========================================"
echo "  Starting Flask Chatbot API Server"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[*] Checking Python installation..."
python3 --version
if [ $? -ne 0 ]; then
    echo "[ERROR] Python not found! Please install Python 3.8+"
    exit 1
fi

echo ""
echo "[*] Starting Flask server on http://localhost:5000"
echo "[*] Press Ctrl+C to stop the server"
echo ""

python3 app.py
