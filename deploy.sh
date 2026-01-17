#!/bin/bash

# Herramienta de Despliegue Seguro
# Uso: Ejecutar este script en el servidor para actualizar la aplicación

echo "==========================================="
echo "   Iniciando Despliegue de Academia..."
echo "==========================================="

echo "[1/4] Descargando últimos cambios..."
git pull origin main

echo "[2/4] Deteniendo contenedores antiguos y limpiando conflictos..."
docker compose down
# Intentamos matar a traefik si existe para liberar el puerto 80
docker rm -f traefik 2>/dev/null || true
# Limpiamos redes huerfanas
docker network prune -f

echo "[3/4] Limpiando caché de Docker (opcional pero recomendado)..."
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
