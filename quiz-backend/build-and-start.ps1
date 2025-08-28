# Script para compilar y ejecutar el backend
Write-Host "🔨 Compilando proyecto..." -ForegroundColor Yellow
Set-Location "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend"

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa" -ForegroundColor Green
    Write-Host "🚀 Ejecutando backend..." -ForegroundColor Green
    
    # Configurar variables de entorno y ejecutar
    $env:DB_HOST="localhost"
    $env:DB_PORT="5433" 
    $env:DB_USERNAME="postgres"
    $env:DB_PASSWORD="password"
    $env:DB_DATABASE="quiz_system"
    $env:NODE_ENV="development"
    $env:PORT="3000"
    $env:FRONTEND_URL="http://localhost:5173"
    
    node "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Concurso-Clicker\quiz-backend\dist\src\main.js"
} else {
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
}

Read-Host "Presiona Enter para salir"
