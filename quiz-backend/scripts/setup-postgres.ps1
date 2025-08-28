# Script de configuración para PostgreSQL
# Ejecutar después de instalar PostgreSQL

Write-Host "=== Configuración de PostgreSQL para Quiz System ===" -ForegroundColor Green

# Verificar si PostgreSQL está instalado
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL encontrado: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL no encontrado. Por favor instálalo primero." -ForegroundColor Red
    Write-Host "Descarga desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Crear la base de datos
Write-Host "`n🔧 Creando base de datos 'quiz_system'..." -ForegroundColor Yellow

try {
    # Intentar crear la base de datos
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE quiz_system;"
    Write-Host "✅ Base de datos 'quiz_system' creada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  La base de datos 'quiz_system' ya existe o hubo un error" -ForegroundColor Yellow
}

# Verificar la conexión
Write-Host "`n🔍 Verificando conexión..." -ForegroundColor Yellow
try {
    psql -U postgres -h localhost -p 5432 -d quiz_system -c "SELECT current_database();"
    Write-Host "✅ Conexión a la base de datos exitosa" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al conectar a la base de datos" -ForegroundColor Red
    Write-Host "Verifica que PostgreSQL esté ejecutándose y que la contraseña sea correcta" -ForegroundColor Yellow
}

Write-Host "`n🚀 Configuración completada. Ahora puedes ejecutar:" -ForegroundColor Green
Write-Host "npm run start:dev" -ForegroundColor Cyan
