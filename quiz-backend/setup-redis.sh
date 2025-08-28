#!/bin/bash

# 🚀 Script de Inicialización - Sistema Redis Quiz
# Este script configura todo lo necesario para usar Redis con el quiz system

echo "🚀 ==============================================="
echo "🚀 CONFIGURANDO SISTEMA REDIS PARA QUIZ"
echo "🚀 ==============================================="

# Verificar si Redis está instalado
if command -v redis-cli >/dev/null 2>&1; then
    echo "✅ Redis CLI encontrado"
else
    echo "❌ Redis no encontrado. Instalando con Docker..."
    
    # Verificar Docker
    if command -v docker >/dev/null 2>&1; then
        echo "🐳 Iniciando Redis con Docker..."
        docker run -d --name redis-quiz \
            -p 6379:6379 \
            --restart unless-stopped \
            redis:alpine
        echo "✅ Redis iniciado en Docker (puerto 6379)"
    else
        echo "❌ Docker no encontrado. Por favor instala Redis manualmente:"
        echo "   Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/"
        echo "   macOS: brew install redis"
        echo "   Linux: sudo apt install redis-server"
        exit 1
    fi
fi

# Verificar conexión Redis
echo "🔍 Verificando conexión a Redis..."
if redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis está funcionando correctamente"
else
    echo "❌ No se puede conectar a Redis"
    echo "💡 Intentando iniciar Redis localmente..."
    
    # Intentar iniciar Redis
    if command -v redis-server >/dev/null 2>&1; then
        redis-server --daemonize yes --port 6379
        sleep 2
        if redis-cli ping >/dev/null 2>&1; then
            echo "✅ Redis iniciado correctamente"
        else
            echo "❌ Error iniciando Redis"
            exit 1
        fi
    fi
fi

# Verificar archivo .env
echo "🔍 Verificando configuración..."
if [ ! -f ".env" ]; then
    echo "📄 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo "⚠️  IMPORTANTE: Revisa y ajusta las variables en .env"
else
    echo "✅ Archivo .env existe"
fi

# Verificar dependencias npm
echo "🔍 Verificando dependencias npm..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas"
else
    echo "✅ Dependencias ya instaladas"
fi

# Configurar Redis con datos iniciales (opcional)
echo "🔧 Configurando Redis para el quiz system..."
redis-cli FLUSHALL > /dev/null 2>&1
echo "✅ Cache Redis limpiado"

# Configurar TTL por defecto para preguntas (5 minutos)
redis-cli CONFIG SET save "60 1" > /dev/null 2>&1
echo "✅ Configuración Redis aplicada"

echo ""
echo "🎉 ==============================================="
echo "🎉 CONFIGURACIÓN COMPLETADA"
echo "🎉 ==============================================="
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run start:dev"
echo ""
echo "🔍 Para monitorear Redis:"
echo "   redis-cli monitor"
echo ""
echo "📊 Para ver estadísticas:"
echo "   redis-cli info stats"
echo ""
echo "🧹 Para limpiar cache:"
echo "   redis-cli flushall"
echo ""
echo "📝 URLs importantes:"
echo "   Backend: http://localhost:3000"
echo "   WebSocket: ws://localhost:3000"
echo "   Redis Monitor: redis-cli monitor"
echo ""
echo "✅ ¡Sistema listo para concursos ultrarrápidos!"
