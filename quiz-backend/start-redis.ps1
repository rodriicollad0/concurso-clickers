# Script simple para iniciar Redis con Docker
Write-Host "Iniciando Redis para Quiz System..." -ForegroundColor Green

# Verificar Docker
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "Docker encontrado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "Docker no encontrado. Instalalo desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Verificar si Redis ya existe
$existingContainer = docker ps -a --filter "name=redis-quiz" --format "{{.Names}}" 2>$null

if ($existingContainer -eq "redis-quiz") {
    Write-Host "Contenedor Redis encontrado. Iniciando..." -ForegroundColor Yellow
    docker start redis-quiz
} else {
    Write-Host "Creando nuevo contenedor Redis..." -ForegroundColor Yellow
    docker run -d --name redis-quiz -p 6379:6379 --restart unless-stopped redis:alpine
}

Start-Sleep -Seconds 3

# Verificar conexion
$redisPing = docker exec redis-quiz redis-cli ping 2>$null
if ($redisPing -eq "PONG") {
    Write-Host "Redis iniciado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para probar Redis:" -ForegroundColor Cyan
    Write-Host "  docker exec -it redis-quiz redis-cli" -ForegroundColor White
    Write-Host ""
    Write-Host "Para iniciar el backend:" -ForegroundColor Cyan  
    Write-Host "  npm run start:dev" -ForegroundColor White
} else {
    Write-Host "Error iniciando Redis" -ForegroundColor Red
}
