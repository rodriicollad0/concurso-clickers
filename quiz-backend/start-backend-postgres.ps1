# Script para iniciar el backend con PostgreSQL y Redis
Write-Host "Iniciando backend con PostgreSQL y Redis..." -ForegroundColor Green

# Verificar que Redis esté funcionando
Write-Host "Verificando Redis..." -ForegroundColor Yellow
try {
    $redisPing = wsl redis-cli ping 2>$null
    if ($redisPing -eq "PONG") {
        Write-Host "✅ Redis funcionando correctamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Redis no responde. Iniciando..." -ForegroundColor Yellow
        wsl redis-server --daemonize yes
        Start-Sleep -Seconds 2
        $redisPing = wsl redis-cli ping 2>$null
        if ($redisPing -eq "PONG") {
            Write-Host "✅ Redis iniciado correctamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error con Redis" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "❌ Error verificando Redis: $_" -ForegroundColor Red
}

# Compilar proyecto
Write-Host "Compilando proyecto..." -ForegroundColor Yellow
npm run build

# Configurar variables de entorno para PostgreSQL
$env:DB_HOST="localhost"
$env:DB_PORT="5433"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="password"
$env:DB_DATABASE="quiz_system"
$env:REDIS_URL="redis://localhost:6379"
$env:NODE_ENV="development"

Write-Host ""
Write-Host "🚀 Configuración:" -ForegroundColor Cyan
Write-Host "   DB_HOST: $env:DB_HOST" -ForegroundColor White
Write-Host "   DB_PORT: $env:DB_PORT" -ForegroundColor White
Write-Host "   DB_USERNAME: $env:DB_USERNAME" -ForegroundColor White
Write-Host "   DB_DATABASE: $env:DB_DATABASE" -ForegroundColor White
Write-Host "   REDIS_URL: $env:REDIS_URL" -ForegroundColor White
Write-Host ""

# Iniciar el backend
Write-Host "🚀 Iniciando backend..." -ForegroundColor Green
node "C:\Users\rodri\OneDrive - Universidad de Castilla-La Mancha\Escritorio\Peluquería\quiz-backend\dist\src\main.js"
