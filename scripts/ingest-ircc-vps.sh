#!/usr/bin/env bash
# Ingest IRCC en production (le conteneur web n'a que le build standalone Next.js)
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Missing .env"
  exit 1
fi

NETWORK=$(docker network ls --format '{{.Name}}' | grep immg-internal | head -1)
if [ -z "$NETWORK" ]; then
  echo "Network immg-internal not found — run ./scripts/deploy-vps.sh first"
  exit 1
fi

echo "Running IRCC ingest (live fetch + pgvector embeddings)..."
docker run --rm \
  --network "${NETWORK}" \
  -v "$(pwd):/app" -w /app \
  --env-file .env \
  node:22-alpine sh -c "npm ci && npm run db:generate && cd apps/web && npx tsx scripts/ingest-ircc.ts"

echo "Ingest complete."
