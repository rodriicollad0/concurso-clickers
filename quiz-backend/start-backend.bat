@echo off
echo.
echo 🚀 Iniciando Quiz Backend...
echo.

REM Configurar variables de entorno
set DB_HOST=localhost
set DB_PORT=5433
set DB_USERNAME=postgres
set DB_PASSWORD=password
set DB_DATABASE=quiz_system
set NODE_ENV=development
set PORT=3000
set FRONTEND_URL=http://localhost:5173

REM Cambiar al directorio correcto
cd /d "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend"

echo 📍 Directorio: %CD%
echo 🗄️ Base de datos: PostgreSQL en puerto 5433
echo 🌐 Backend ejecutándose en: http://localhost:3000/api
echo.

REM Ejecutar el backend
node "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend\dist\src\main.js"

pause
