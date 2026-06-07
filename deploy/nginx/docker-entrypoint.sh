#!/bin/sh
set -eu

OUTPUT="/etc/nginx/conf.d/default.conf"
SSL_ENABLED="${SSL_ENABLED:-false}"
IMMG_DOMAIN="${IMMG_DOMAIN:-_}"

if [ "$SSL_ENABLED" = "true" ]; then
  TEMPLATE="/etc/nginx/templates/immg-https.conf.template"
else
  TEMPLATE="/etc/nginx/templates/immg-http.conf.template"
fi

if [ ! -f "$TEMPLATE" ]; then
  echo "Missing nginx template at $TEMPLATE"
  exit 1
fi

sed "s/\${IMMG_DOMAIN}/${IMMG_DOMAIN}/g" "$TEMPLATE" > "$OUTPUT"
echo "Nginx config: $(basename "$TEMPLATE") (domain=$IMMG_DOMAIN)"
