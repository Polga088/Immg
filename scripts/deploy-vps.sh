#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.production.example to .env"
  exit 1
fi

echo "Building and deploying Immg..."
docker compose -f docker-compose.prod.yml build web
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for postgres..."
sleep 5

docker compose -f docker-compose.prod.yml exec -T web npx prisma db push || true

echo "Deploy complete. Check: curl http://localhost/api/health"
