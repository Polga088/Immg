#!/usr/bin/env bash
# Backup Postgres Immg (à planifier en cron sur le VPS)
# Usage: ./scripts/backup-postgres.sh
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/opt/immg/backups}"
mkdir -p "$BACKUP_DIR"

STAMP=$(date +%Y%m%d_%H%M%S)
FILE="${BACKUP_DIR}/immg_${STAMP}.sql"

docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U immg immg > "$FILE"

gzip -f "$FILE"
echo "Backup: ${FILE}.gz"

# Keep last 14 days
find "$BACKUP_DIR" -name 'immg_*.sql.gz' -mtime +14 -delete
