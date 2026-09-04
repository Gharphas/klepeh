@echo off
title My Klepeh E-Wallet Desktop App
echo ===================================================
echo   MEMBUKA APLIKASI DESKTOP MY KLEPEH E-WALLET
echo ===================================================
echo.
python app_desktop.py
if %errorlevel% neq 0 (
    echo.
    echo Menjalankan alternatif melalui Electron...
    call npx electron .
)
