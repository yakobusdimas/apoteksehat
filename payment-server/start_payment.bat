@echo off
title Payment Server - Apotek Sehat
echo ============================================================
echo     MEMULAI PAYMENT SERVER - APOTEK SEHAT (Midtrans)
echo ============================================================
echo.

cd /d "%~dp0"

REM Cek Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Install Node.js dari https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies jika node_modules belum ada
if not exist "node_modules" (
    echo [*] Menginstall dependencies...
    npm install
    echo [OK] Dependencies terinstall.
    echo.
)

echo [*] Menjalankan Payment Server...
echo     Mode: SANDBOX (Testing)
echo     URL : http://localhost:3001
echo.
echo     Tekan CTRL+C untuk menghentikan
echo ============================================================
echo.

node server.js

pause
