@echo off
echo ===================================================
echo   MEMBUAT FILE INSTALLER / PORTABLE .EXE
echo   MY KLEPEH E-WALLET DESKTOP
echo ===================================================
echo.
echo 1. Memeriksa dependencies...
if not exist "node_modules\electron" (
    echo Menginstall paket yang dibutuhkan...
    call npm install
)

echo.
echo 2. Memulai proses build aplikasi Windows (.exe)...
call npm run dist

echo.
echo ===================================================
echo   BUILD SELESAI!
echo   File aplikasi .exe tersimpan di folder: \dist
echo ===================================================
pause
