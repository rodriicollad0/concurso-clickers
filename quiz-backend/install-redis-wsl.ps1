# Script para instalar Redis en WSL desde PowerShell
Write-Host "Instalando Redis en WSL..." -ForegroundColor Green

# Actualizar paquetes e instalar Redis
$wslCommands = @"
sudo apt update && sudo apt install -y redis-server
sudo service redis-server start
redis-cli ping
"@

Write-Host "Ejecutando comandos en WSL..." -ForegroundColor Yellow
wsl bash -c $wslCommands

Write-Host ""
Write-Host "Redis deberia estar funcionando en WSL!" -ForegroundColor Green
Write-Host ""
Write-Host "Para verificar Redis:" -ForegroundColor Cyan
Write-Host "  wsl redis-cli ping" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar Redis si se detiene:" -ForegroundColor Cyan
Write-Host "  wsl sudo service redis-server start" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar el backend:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
