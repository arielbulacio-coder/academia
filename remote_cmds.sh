#!/bin/bash
set -e

echo "=== INICIANDO ACTUALIZACIÓN REMOTA ==="

echo "[1/3] Actualizando Proxy Inverso..."
cd /root/academia/proxy || { echo "Directorio proxy no encontrado"; exit 1; }
git pull origin main
chmod +x deploy.sh
./deploy.sh

echo "[2/3] Actualizando Academia (Frontend/Backend)..."
cd /root/academia || { echo "Directorio academia no encontrado"; exit 1; }
# Forzar pull para asegurar últimos cambios
git fetch origin main
git reset --hard origin/main
chmod +x deploy.sh
./deploy.sh

echo "=== ACTUALIZACIÓN COMPLETADA EXITOSAMENTE ==="
