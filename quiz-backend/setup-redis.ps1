# 🚀 Script de Inicialización Redis - Windows PowerShell
# Este script configura todo lo necesario para usar Redis con el quiz system

Write-Host "🚀 ===============================================" -ForegroundColor Green
Write-Host "🚀 CONFIGURANDO SISTEMA REDIS PARA QUIZ" -ForegroundColor Green  
Write-Host "🚀 ===============================================" -ForegroundColor Green

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
    
    # Verificar si el contenedor Redis ya existe
    $redisContainer = docker ps -a --filter "name=redis-quiz" --format "{{.Names}}" 2>$null
    
    if ($redisContainer -eq "redis-quiz") {
        Write-Host "🔍 Contenedor Redis encontrado" -ForegroundColor Yellow
        
        # Verificar si está corriendo
        $runningContainer = docker ps --filter "name=redis-quiz" --format "{{.Names}}" 2>$null
        if ($runningContainer -eq "redis-quiz") {
            Write-Host "✅ Redis ya está corriendo" -ForegroundColor Green
        } else {
            Write-Host "🔄 Iniciando contenedor Redis existente..." -ForegroundColor Yellow
            docker start redis-quiz
            Start-Sleep -Seconds 3
            Write-Host "✅ Redis iniciado correctamente" -ForegroundColor Green
        }
    } else {
        Write-Host "🐳 Creando nuevo contenedor Redis..." -ForegroundColor Yellow
        docker run -d --name redis-quiz -p 6379:6379 --restart unless-stopped redis:alpine
        Start-Sleep -Seconds 5
        Write-Host "✅ Redis iniciado en Docker (puerto 6379)" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Docker no encontrado o error al ejecutar" -ForegroundColor Red
    Write-Host "💡 Opciones de instalación:" -ForegroundColor Yellow
    Write-Host "   1. Instalar Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host "   2. Usar Redis en WSL: wsl --install Ubuntu" -ForegroundColor Cyan
    Write-Host "   3. Instalar Redis nativo: https://redis.io/docs/getting-started/installation/install-redis-on-windows/" -ForegroundColor Cyan
    exit 1
}

# Verificar conexión Redis
Write-Host "🔍 Verificando conexión a Redis..." -ForegroundColor Yellow
try {
    # Intentar conectar usando redis-cli en Docker
    $redisPing = docker exec redis-quiz redis-cli ping 2>$null
    if ($redisPing -eq "PONG") {
        Write-Host "✅ Redis está funcionando correctamente" -ForegroundColor Green
    } else {
        throw "No hay respuesta de Redis"
    }
}
catch {
    Write-Host "❌ No se puede conectar a Redis" -ForegroundColor Red
    Write-Host "🔄 Reiniciando contenedor..." -ForegroundColor Yellow
    docker restart redis-quiz
    Start-Sleep -Seconds 5
    
    $redisPing = docker exec redis-quiz redis-cli ping 2>$null
    if ($redisPing -eq "PONG") {
        Write-Host "✅ Redis funcionando después del reinicio" -ForegroundColor Green
    } else {
        Write-Host "❌ Error crítico con Redis" -ForegroundColor Red
        exit 1
    }
}

# Verificar archivo .env
Write-Host "🔍 Verificando configuración..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "📄 Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Revisa y ajusta las variables en .env" -ForegroundColor Red
} else {
    Write-Host "✅ Archivo .env existe" -ForegroundColor Green
}

# Verificar dependencias npm
Write-Host "🔍 Verificando dependencias npm..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencias ya instaladas" -ForegroundColor Green
}

# Configurar Redis con datos iniciales
Write-Host "🔧 Configurando Redis para el quiz system..." -ForegroundColor Yellow
try {
    docker exec redis-quiz redis-cli FLUSHALL | Out-Null
    Write-Host "✅ Cache Redis limpiado" -ForegroundColor Green
    
    # Configurar persistencia ligera
    docker exec redis-quiz redis-cli CONFIG SET save "60 1" | Out-Null
    Write-Host "✅ Configuración Redis aplicada" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  No se pudo configurar Redis, pero debería funcionar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ===============================================" -ForegroundColor Green
Write-Host "🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "🎉 ===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para iniciar el servidor:" -ForegroundColor Cyan
Write-Host "   npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Para monitorear Redis:" -ForegroundColor Cyan
Write-Host "   docker exec -it redis-quiz redis-cli monitor" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para ver estadísticas:" -ForegroundColor Cyan
Write-Host "   docker exec redis-quiz redis-cli info stats" -ForegroundColor White
Write-Host ""
Write-Host "🧹 Para limpiar cache:" -ForegroundColor Cyan
Write-Host "   docker exec redis-quiz redis-cli flushall" -ForegroundColor White
Write-Host ""
Write-Host "📝 URLs importantes:" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
Write-Host "   WebSocket: ws://localhost:3000" -ForegroundColor White
Write-Host "   Virtual Clicker: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "✅ ¡Sistema listo para concursos ultrarrápidos! ⚡🚀" -ForegroundColor Green
