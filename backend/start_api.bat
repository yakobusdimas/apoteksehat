@echo off
title Chatbot API - Apotek Sehat
echo ============================================================
echo     MEMULAI SERVER CHATBOT NLP - APOTEK SEHAT
echo ============================================================
echo.

cd /d "%~dp0"

REM Cek Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python tidak ditemukan! Install Python 3.10+ dari python.org
    pause
    exit /b 1
)

REM Install dependencies jika belum ada
echo [*] Mengecek dependencies...
pip install -r requirements.txt -q

echo.
echo [OK] Semua dependensi siap.
echo.
echo [*] Menjalankan server chatbot...
echo     Akses di: http://localhost:5000
echo     Tekan CTRL+C untuk menghentikan
echo ============================================================
echo.

python app.py

pause
