@echo off
title Simulador Arduino Clicker Virtual
color 0a

echo.
echo ===============================================
echo 🎮 ARDUINO CLICKER VIRTUAL - INICIO COMPLETO
echo ===============================================
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Descarga e instala Node.js desde:
    echo    https://nodejs.org
    echo.
    echo 💡 Después de instalar Node.js, ejecuta este archivo nuevamente
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

:: Verificar si las dependencias están instaladas
if not exist node_modules (
    echo 📦 Instalando dependencias por primera vez...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas correctamente
    echo.
)

echo 🚀 Iniciando simulador...
echo.
echo ===============================================
echo 🎯 SIMULADOR ARDUINO CLICKER VIRTUAL ACTIVO
echo ===============================================
echo.
echo 🌐 Interfaz del simulador: http://localhost:3001
echo 📱 Tu aplicación principal: http://localhost:5173
echo.
echo 📋 PASOS PARA USAR:
echo.
echo 1. ✅ Este simulador ya está corriendo
echo 2. 🌐 Abre tu app principal en: http://localhost:5173
echo 3. 🎮 Presiona "Conectar Clicker" en tu app
echo 4. 🎯 Usa los botones A,B,C,D en http://localhost:3001
echo 5. ✨ ¡Las respuestas aparecerán automáticamente!
echo.
echo ⌨️ Para detener: Presiona Ctrl+C
echo ===============================================
echo.

:: Abrir automáticamente las páginas web
timeout /t 2 /nobreak >nul
start http://localhost:3001
timeout /t 1 /nobreak >nul
start http://localhost:5173

:: Iniciar el simulador
node virtual-clicker.js
