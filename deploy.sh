#!/bin/bash
echo "Desplegando Academia..."

# 1. Crear red compartida si no existe
docker network create web 2>/dev/null || true

# 2. Bajar últimos cambios
git pull origin main

# 2. Reconstruir y levantar servicios (con la variable de entorno para el build del frontend)
#    Es crucial pasar VITE_API_URL durante el build.
export VITE_API_URL=http://auth.149.50.130.160.nip.io
docker compose up -d --build

# 3. Limpiar imágenes viejas para ahorrar espacio
docker image prune -f

# 4. Reiniciar el Proxy Inverso (IMPORTANTE para actualizar IPs internas)
echo "Reiniciando Proxy Inverso..."
docker restart reverse_proxy || echo "Advertencia: No se pudo reiniciar reverse_proxy. Verifique si existe."

echo "==========================================="
echo "   Despliegue Completado!"
echo "==========================================="
echo "Verifique la versión en el pie de página de: http://academia.149.50.130.160.nip.io"
