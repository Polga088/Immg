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

echo "Running database migrations..."
docker run --rm \
  --network "$(basename "$(pwd)")_immg-internal" \
  -v "$(pwd):/app" -w /app \
  --env-file .env \
  node:22-alpine sh -c "npm ci --omit=dev && cd packages/db && npx prisma db push"

docker compose -f docker-compose.prod.yml up -d

echo "Pulling Ollama models (first deploy only, may take several minutes)..."
docker compose -f docker-compose.prod.yml exec -T ollama ollama pull "${OLLAMA_MODEL:-qwen2.5:7b}" || true
docker compose -f docker-compose.prod.yml exec -T ollama ollama pull "${OLLAMA_EMBED_MODEL:-nomic-embed-text}" || true

echo "Deploy complete. Check: curl http://localhost/api/health"
