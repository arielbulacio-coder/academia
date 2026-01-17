#!/bin/bash

# Herramienta de Despliegue Seguro
# Uso: Ejecutar este script en el servidor para actualizar la aplicación

echo "==========================================="
echo "   Iniciando Despliegue de Academia..."
echo "==========================================="

echo "[1/4] Descargando últimos cambios..."
git pull origin main

echo "[2/5] Configurando Infraestructura de Red..."
# Crear red externa 'web' si no existe
docker network create web 2>/dev/null || true

echo "[3/5] Desplegando Portero (Traefik)..."
# Aseguramos que Traefik esté corriendo primero
cd traefik
docker compose up -d --force-recreate
cd ..

echo "[4/5] Limpiando caché de Aplicación..."
docker system prune -f

echo "[5/5] Desplegando Academia..."
# --build: Fuerza la construcción de imagenes nuevas
# --force-recreate: Fuerza a soltar cualquier configuración vieja
docker compose up -d --build --force-recreate


echo "==========================================="
echo "   Despliegue Completado!"
echo "==========================================="
echo "Verifique la versión en el pie de página de: http://academia.149.50.130.160.nip.io"
