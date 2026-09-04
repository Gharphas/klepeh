@echo off
echo ===================================================
echo   MEMULAI APLIKASI DESKTOP MY KLEPEH E-WALLET
echo ===================================================
echo.
echo Memeriksa dependencies Electron...
if not exist "node_modules\electron" (
    echo Menginstall Electron (pertama kali saja)...
    call npm install
)

echo.
echo Meluncurkan Aplikasi Desktop My Klepeh...
call npx electron .
