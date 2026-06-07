#!/usr/bin/env bash
# Premier déploiement sur VPS 109.123.254.120 (à exécuter SUR le serveur en root)
# Port 8080 pour coexister avec le CRM Texta (80/443)
set -euo pipefail

APP_DIR="/opt/immg"
REPO="https://github.com/Polga088/Immg.git"

echo "==> Immg — déploiement sur $(hostname)"

if ! command -v docker &>/dev/null; then
  echo "Docker absent — installation..."
  apt-get update && apt-get install -y git curl
  curl -fsSL https://get.docker.com | sh
fi

if [ ! -d "$APP_DIR" ]; then
  git clone "$REPO" "$APP_DIR"
else
  cd "$APP_DIR" && git pull
fi

cd "$APP_DIR"

if [ ! -f .env ]; then
  POSTGRES_PASSWORD=$(openssl rand -hex 16)
  NEXTAUTH_SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://109.123.254.120:8080

DATABASE_URL=postgresql://immg:${POSTGRES_PASSWORD}@postgres:5432/immg
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_ROUTER_MODEL=llama3.2:3b

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
FALLBACK_MODEL=gpt-4o-mini

NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://109.123.254.120:8080

NEXT_PUBLIC_DEFAULT_LOCALE=fr
EOF
  echo "Fichier .env créé avec secrets générés."
fi

chmod +x scripts/deploy-vps.sh scripts/vps-first-deploy.sh
./scripts/deploy-vps.sh

echo ""
echo "==> Immg déployé"
echo "    URL    : http://109.123.254.120:8080/fr"
echo "    Health : http://109.123.254.120:8080/api/health"
echo ""
echo "==> Prochaine étape HTTPS (domaine requis) :"
echo "    1. DNS A record : immg.votredomaine.com → 109.123.254.120"
echo "    2. Éditer .env : IMMG_DOMAIN, CERTBOT_EMAIL, NEXT_PUBLIC_APP_URL, NEXTAUTH_URL"
echo "    3. sudo ./scripts/setup-https-host.sh   (CRM sur :80)"
echo "       ou ./scripts/setup-https.sh          (ports 80/443 libres)"
