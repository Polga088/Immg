#!/bin/sh
set -eu

OUTPUT="/etc/nginx/conf.d/default.conf"
SSL_ENABLED="${SSL_ENABLED:-false}"
IMMG_DOMAIN="${IMMG_DOMAIN:-_}"

# Templates live outside /etc/nginx/templates to avoid conflict with nginx auto-envsubst
if [ "$SSL_ENABLED" = "true" ]; then
  TEMPLATE="/etc/immg/templates/immg-https.conf.template"
else
  TEMPLATE="/etc/immg/templates/immg-http.conf.template"
fi

if [ ! -f "$TEMPLATE" ]; then
  echo "Missing nginx template at $TEMPLATE"
  exit 1
fi

# Remove stale configs from previous deploys
rm -f /etc/nginx/conf.d/immg-http.conf /etc/nginx/conf.d/immg-https.conf 2>/dev/null || true

sed "s/\${IMMG_DOMAIN}/${IMMG_DOMAIN}/g" "$TEMPLATE" > "$OUTPUT"
echo "Nginx config: $(basename "$TEMPLATE") (domain=$IMMG_DOMAIN)"
