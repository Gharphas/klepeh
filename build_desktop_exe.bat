@echo off
echo ===================================================
echo   MEMBUAT FILE APLIKASI DESKTOP .EXE MANDIRI
echo   MY KLEPEH E-WALLET (WINDOWS NATIVE)
echo ===================================================
echo.
echo 1. Memeriksa PyInstaller...
python -c "import PyInstaller" >nul 2>&1
if %errorlevel% neq 0 (
    echo Menginstall PyInstaller...
    python -m pip install pyinstaller pywebview
)

echo.
echo 2. Mengompilasi aplikasi ke file .exe...
python -m PyInstaller --noconsole --onefile --name="My Klepeh E-Wallet" --add-data="login.html;." --add-data="index.html;." --add-data="style.css;." --add-data="script.js;." --add-data="login.js;." --add-data="alisa2.jpg;." --add-data="bella.jpeg;." --add-data="sasuke.jpg;." app_desktop.py

echo.
echo ===================================================
echo   BERHASIL!
echo   File aplikasi dapat dibuka di: dist\My Klepeh E-Wallet.exe
echo ===================================================
pause
