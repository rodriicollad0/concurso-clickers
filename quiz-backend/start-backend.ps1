# Script para ejecutar el backend del Quiz System
Write-Host "🚀 Iniciando Quiz Backend..." -ForegroundColor Green
Write-Host ""

# Configurar variables de entorno
$env:DB_HOST="localhost"
$env:DB_PORT="5433" 
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="password"
$env:DB_DATABASE="quiz_system"
$env:NODE_ENV="development"
$env:PORT="3000"
$env:FRONTEND_URL="http://localhost:5173"

# Cambiar al directorio correcto
Set-Location "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend"

Write-Host "📍 Directorio: $PWD" -ForegroundColor Yellow
Write-Host "🗄️ Base de datos: PostgreSQL en puerto 5433" -ForegroundColor Cyan
Write-Host "🌐 Backend ejecutándose en: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host ""

# Ejecutar el backend
node "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend\dist\src\main.js"

Read-Host "Presiona Enter para salir"
