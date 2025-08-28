@echo off
echo.
echo ===============================================
echo 🎮 INSTALANDO SIMULADOR ARDUINO CLICKER VIRTUAL
echo ===============================================
echo.

echo 📦 Instalando dependencias de Node.js...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error instalando dependencias
    echo 💡 Asegurate de tener Node.js instalado
    echo 📥 Descarga Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo ✅ Instalación completada exitosamente!
echo.
echo 📝 INSTRUCCIONES DE USO:
echo.
echo 1. Ejecutar: start-virtual-clicker.bat
echo 2. Abrir navegador en: http://localhost:3001
echo 3. En tu app principal, conectar normalmente con Web Serial API
echo 4. Usar botones A, B, C, D para simular respuestas
echo.
echo 🎯 El simulador está listo para usar!
echo.
pause
