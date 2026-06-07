#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.production.example to .env"
  exit 1
fi

echo "Building and deploying Immg..."
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d postgres ollama
echo "Waiting for postgres..."
sleep 8

echo "Running SQL pre-migration (existing data)..."
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U immg -d immg -v ON_ERROR_STOP=1 \
  < packages/db/prisma/sql/migrate-v2.sql

echo "Running database migrations..."
NETWORK=$(docker network ls --format '{{.Name}}' | grep immg-internal | head -1)
docker run --rm \
  --network "${NETWORK}" \
  -v "$(pwd):/app" -w /app \
  --env-file .env \
  node:22-alpine sh -c "npm ci --omit=dev && cd packages/db && npx prisma db push --accept-data-loss"

docker compose -f docker-compose.prod.yml up -d

echo "Pulling Ollama models (first deploy only, may take several minutes)..."
docker compose -f docker-compose.prod.yml exec -T ollama ollama pull "${OLLAMA_MODEL:-qwen2.5:7b}" || true
docker compose -f docker-compose.prod.yml exec -T ollama ollama pull "${OLLAMA_EMBED_MODEL:-nomic-embed-text}" || true

echo "Deploy complete."
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
  BASE="${NEXT_PUBLIC_APP_URL:-http://localhost:${NGINX_HTTP_PORT:-8080}}"
  echo "Check: curl ${BASE}/api/health"
else
  echo "Check: curl http://localhost:${NGINX_HTTP_PORT:-8080}/api/health"
fi
