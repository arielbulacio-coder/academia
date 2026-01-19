$ServerIP = "149.50.130.160"
$User = "root"
$KeyName = "donweb_fix" # Usamos la RSA limpia que ya creamos

# Script para configurar el servidor desde CERO
$SetupScript = "
set -e
echo '=== INICIANDO CONFIGURACIÓN SERVIDOR NUEVO ==='

# 1. Actualizar sistema
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get upgrade -y
apt-get install -y curl git ca-certificates gnupg lsb-release

# 2. Instalar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
    echo '> Instalando Docker...'
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo 'deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

# 3. Preparar carpetas
mkdir -p /root/academia/proxy
mkdir -p /root/golf

# 4. Clonar Proyectos (Academia contiene el proxy)
if [ ! -d '/root/academia/.git' ]; then
    echo '> Clonando Academia...'
    git clone https://github.com/arielbulacio-coder/academia.git /root/academia
else 
    echo '> Academia ya existe, actualizando...'
    cd /root/academia && git pull
fi

if [ ! -d '/root/golf/.git' ]; then
    echo '> Clonando Golf...'
    git clone https://github.com/arielbulacio-coder/golf.git /root/golf
else
    echo '> Golf ya existe, actualizando...'
    cd /root/golf && git pull
fi

# 5. Agregar Clave SSH (para futuros accesos sin password)
mkdir -p /root/.ssh
chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
# Aquí agregaremos la clave pública
echo '$((Get-Content "$PSScriptRoot\$KeyName.pub") -replace "`r","" -replace "`n","")' >> /root/.ssh/authorized_keys

# 6. Despliegue Inicial
echo '> Desplegando Proxy...'
cd /root/academia/proxy
chmod +x deploy.sh
./deploy.sh

echo '> Desplegando Academia...'
cd /root/academia
chmod +x deploy.sh
./deploy.sh

echo '> Desplegando Golf...'
cd /root/golf
chmod +x deploy.sh
./deploy.sh

echo '=== CONFIGURACIÓN COMPLETADA 🚀 ==='
"

Write-Host "Conectando al servidor NUEVO $ServerIP..." -ForegroundColor Cyan
Write-Host "Por favor ingresa la contraseña: Ry)&wiJ_4qRtkO" -ForegroundColor Yellow

# Ejecutamos el script remoto
$SetupScript | ssh -tt $User@$ServerIP "bash"
