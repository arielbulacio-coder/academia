Write-Host ">>> Iniciando Entorno de Desarrollo LOCAL (Sin Docker)" -ForegroundColor Cyan

# 1. Configurar y arrancar Frontend
Write-Host "[1/3] Preparando Frontend..." -ForegroundColor Yellow
Set-Location "frontend"
if (!(Test-Path "node_modules")) {
    Write-Host "Instalando dependencias (esto puede tardar)..."
    npm install
}

# Configuramos la variable de entorno para que apunte a localhost por si acaso
$env:VITE_API_URL = "http://localhost:3001"

Write-Host "[2/3] Iniciando Servidor de Desarrollo..." -ForegroundColor Green
Write-Host "La aplicación se abrirá automáticamente en tu navegador."
Write-Host "Presiona 'q' en esta ventana para detener el servidor al finalizar."
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan

# Ejecutar Vite y abrir el navegador
npm run dev -- --open

# Nota: El script se pausará aquí mientras Vite corre.
