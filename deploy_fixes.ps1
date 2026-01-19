# Deploy Academia fixes to server
$SERVER = "root@149.50.130.160"
$KEY = "donweb_key"

Write-Host "Deploying Academia fixes..." -ForegroundColor Cyan

# Copy modified files to server
Write-Host "Uploading frontend files..." -ForegroundColor Yellow
scp -i $KEY -o StrictHostKeyChecking=no `
    frontend/src/pages/Cursos.jsx `
    frontend/src/pages/Planificador.jsx `
    frontend/src/components/CursoModal.jsx `
    ${SERVER}:/root/academia/frontend/src/

# Rebuild frontend container
Write-Host "Rebuilding frontend container..." -ForegroundColor Yellow
ssh -i $KEY -o StrictHostKeyChecking=no $SERVER "cd /root/academia && docker compose up -d --build frontend"

Write-Host "Deployment complete!" -ForegroundColor Green
