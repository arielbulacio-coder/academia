$ServerIP = "149.50.130.160"
$User = "root"

$Commands = "
set -e
echo '=== INICIANDO DESPLIEGUE ==='
# 1. Proxy
echo '> Actualizando Proxy...'
cd /root/academia/proxy
git pull origin main
chmod +x deploy.sh
./deploy.sh

# 2. Academia
echo '> Actualizando Academia...'
cd /root/academia
git fetch origin main
git reset --hard origin/main
chmod +x deploy.sh
./deploy.sh
echo '=== LISTO ==='
"

Write-Host "Conectando a $ServerIP... (Contraseña: k3.46iltUtG/tQ)" -ForegroundColor Cyan
# Pasamos los comandos como Here-String a ssh
$Commands | ssh -tt $User@$ServerIP "bash"
