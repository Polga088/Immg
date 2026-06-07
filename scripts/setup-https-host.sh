#!/usr/bin/env bash
# HTTPS via nginx HÔTE (recommandé si CRM Texta occupe le port 80)
# Immg reste sur localhost:8080, le SSL est terminé par le nginx système.
#
# Usage sur le VPS :
#   IMMG_DOMAIN=immg.example.com CERTBOT_EMAIL=you@example.com ./scripts/setup-https-host.sh
set -euo pipefail

cd "$(dirname "$0")/.."

IMMG_DOMAIN="${IMMG_DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

IMMG_DOMAIN="${IMMG_DOMAIN:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

if [ -z "$IMMG_DOMAIN" ]; then
  echo "Set IMMG_DOMAIN in .env or environment"
  exit 1
fi

if [ -z "$CERTBOT_EMAIL" ]; then
  echo "Set CERTBOT_EMAIL in .env or environment"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root on the VPS (sudo ./scripts/setup-https-host.sh)"
  exit 1
fi

APP_URL="https://${IMMG_DOMAIN}"
SNIPPET="/etc/nginx/sites-available/immg"
ENABLED="/etc/nginx/sites-enabled/immg"
LOCAL_PORT="${NGINX_HTTP_PORT:-8080}"

echo "==> Domain: $IMMG_DOMAIN → 127.0.0.1:${LOCAL_PORT}"

if ! command -v nginx &>/dev/null; then
  echo "Installing nginx..."
  apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
fi

cat > "$SNIPPET" <<EOF
server {
    listen 80;
    server_name ${IMMG_DOMAIN};

    location /.well-known/acme-challenge/ {
        proxy_pass http://127.0.0.1:${LOCAL_PORT};
    }

    location / {
        proxy_pass http://127.0.0.1:${LOCAL_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }
}
EOF

ln -sf "$SNIPPET" "$ENABLED"
nginx -t && systemctl reload nginx

echo "==> Obtaining certificate..."
certbot --nginx -d "$IMMG_DOMAIN" --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email --non-interactive --redirect

if [ -f .env ]; then
  if grep -q '^NEXT_PUBLIC_APP_URL=' .env; then
    sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${APP_URL}|" .env
  else
    echo "NEXT_PUBLIC_APP_URL=${APP_URL}" >> .env
  fi
  if grep -q '^NEXTAUTH_URL=' .env; then
    sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=${APP_URL}|" .env
  else
    echo "NEXTAUTH_URL=${APP_URL}" >> .env
  fi
  if grep -q '^IMMG_DOMAIN=' .env; then
    sed -i "s|^IMMG_DOMAIN=.*|IMMG_DOMAIN=${IMMG_DOMAIN}|" .env
  else
    echo "IMMG_DOMAIN=${IMMG_DOMAIN}" >> .env
  fi
  if grep -q '^SSL_ENABLED=' .env; then
    sed -i "s|^SSL_ENABLED=.*|SSL_ENABLED=host|" .env
  else
    echo "SSL_ENABLED=host" >> .env
  fi
fi

echo "==> Restarting Immg web (pick up NEXTAUTH_URL)..."
docker compose -f docker-compose.prod.yml up -d web 2>/dev/null || true

echo ""
echo "==> HTTPS via host nginx enabled"
echo "    App    : ${APP_URL}/fr"
echo "    Health : ${APP_URL}/api/health"
