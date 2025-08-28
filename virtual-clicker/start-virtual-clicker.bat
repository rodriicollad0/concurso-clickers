@echo off
echo.
echo ===============================================
echo 🎮 INICIANDO SIMULADOR ARDUINO CLICKER VIRTUAL
echo ===============================================
echo.

if not exist node_modules (
    echo ❌ Dependencias no encontradas
    echo 📦 Ejecutando instalación automática...
    call install.bat
    if %errorlevel% neq 0 (
        echo ❌ Error en la instalación
        pause
        exit /b 1
    )
)

echo 🚀 Iniciando simulador...
echo.
echo 💡 IMPORTANTE:
echo - El simulador se ejecutará en: http://localhost:3001
echo - Para detener: Presiona Ctrl+C
echo - Para conectar desde tu app: usa el botón "Conectar Clicker"
echo.

start http://localhost:3001

node virtual-clicker.js

pause
