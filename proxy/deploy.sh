#!/bin/bash
echo "Iniciando Despliegue del Proxy Nginx..."

# 1. Crear red web si no existe
docker network create web 2>/dev/null || true

# 2. Levantar el proxy
docker compose up -d --build --force-recreate

echo "Proxy Nginx Desplegado en puerto 80!"
