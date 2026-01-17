#!/bin/bash

# Herramienta de Despliegue Seguro
# Uso: Ejecutar este script en el servidor para actualizar la aplicación

echo "==========================================="
echo "   Iniciando Despliegue de Academia..."
echo "==========================================="

echo "[1/4] Descargando últimos cambios..."
git pull origin main

echo "[2/4] Deteniendo contenedores antiguos y limpiando conflictos..."
# Detener servicios del host que puedan usar el puerto 80
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
systemctl stop httpd 2>/dev/null || true

# Detener TODOS los contenedores Docker para evitar conflictos de puertos
if [ -n "$(docker ps -aq)" ]; then
    echo "Deteniendo todos los contenedores Docker..."
    docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
fi

# Limpieza profunda
docker system prune -f
docker network prune -f
docker system prune -f

echo "[4/4] Reconstruyendo y levantando servicios..."
# --build: Fuerza la construcción de imagenes
# --force-recreate: Fuerza la recreación de contenedores
# --remove-orphans: Elimina contenedores que ya no están en el compose
docker compose up -d --build --force-recreate --remove-orphans

echo "==========================================="
echo "   Despliegue Completado!"
echo "==========================================="
echo "Verifique la versión en el pie de página de: http://academia.149.50.130.160.nip.io"
