#!/usr/bin/env bash
# Active HTTPS Let's Encrypt pour Immg (mode Docker autonome — ports 80/443 libres)
# Si le CRM occupe le port 80, utilisez ./scripts/setup-https-host.sh à la place.
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml -f docker-compose.https.yml"

if [ ! -f .env ]; then
  echo "Missing .env — copy .env.production.example to .env"
  exit 1
fi

# shellcheck disable=SC1091
source .env

IMMG_DOMAIN="${IMMG_DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

if [ -z "$IMMG_DOMAIN" ] || [ "$IMMG_DOMAIN" = "_" ]; then
  echo "Set IMMG_DOMAIN in .env (e.g. immg.votredomaine.com)"
  exit 1
fi

if [ -z "$CERTBOT_EMAIL" ]; then
  echo "Set CERTBOT_EMAIL in .env"
  exit 1
fi

APP_URL="https://${IMMG_DOMAIN}"

echo "==> Domain: $IMMG_DOMAIN"
echo "==> Requires ports 80 and 443 free on this server"

export SSL_ENABLED=false
$COMPOSE up -d nginx web postgres ollama

echo "==> Requesting Let's Encrypt certificate..."
$COMPOSE run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$IMMG_DOMAIN" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

update_env() {
  local key="$1" val="$2"
  if grep -q "^${key}=" .env; then
    sed -i.bak "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
}

update_env SSL_ENABLED true
update_env NEXT_PUBLIC_APP_URL "$APP_URL"
update_env NEXTAUTH_URL "$APP_URL"
update_env IMMG_DOMAIN "$IMMG_DOMAIN"

sed "s/\\${IMMG_DOMAIN}/${IMMG_DOMAIN}/g" deploy/nginx/immg-https.conf.template \
  > deploy/nginx/immg-https-active.conf
update_env NGINX_CONF_PATH "./deploy/nginx/immg-https-active.conf"
rm -f .env.bak

# shellcheck disable=SC1091
source .env
export SSL_ENABLED=true

echo "==> Restarting with TLS..."
$COMPOSE up -d

echo ""
echo "==> HTTPS enabled (Docker)"
echo "    App    : ${APP_URL}/fr"
echo "    Health : ${APP_URL}/api/health"
