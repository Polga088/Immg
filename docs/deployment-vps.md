# Déploiement VPS — Immg

Guide pour héberger Immg sur un VPS (8–16 GB RAM, CPU seul, sans GPU).

## Architecture sur le VPS

```
Internet :80/443
       │
   ┌───▼───┐
   │ Nginx │  reverse proxy + HTTPS
   └───┬───┘
       └──────────► web (Next.js :3000)
                         │
              ┌──────────┼──────────┐
              │          │          │
         ollama      postgres    (redis phase 2)
         :11434      pgvector
         (interne)   (interne)
```

- **Mac** : édition code + Ollama local pour dev
- **VPS** : Docker Compose production

## Prérequis VPS

| Ressource | Recommandé Immg |
|-----------|-----------------|
| RAM | **8 GB minimum** (16 GB confortable avec Ollama 7B) |
| CPU | 4 vCPU |
| Disque | 40 GB SSD (modèles Ollama ~5 GB) |
| OS | Ubuntu 22.04 ou 24.04 |
| Ports | 22 (SSH), 80, 443 |

> Ollama 7B consomme ~5–8 GB RAM. Ne pas lancer d'autres services lourds sur un VPS 8 GB.

## 1. Préparer le serveur

```bash
ssh root@votre-ip-vps

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Pare-feu
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 2. Cloner et configurer

```bash
git clone https://github.com/Polga088/Immg.git /opt/immg
cd /opt/immg

cp .env.production.example .env
nano .env
```

Variables **obligatoires** :

```env
PUBLIC_APP_URL=https://immg.votredomaine.com
POSTGRES_PASSWORD=<mot-de-passe-fort>
DATABASE_URL=postgresql://immg:${POSTGRES_PASSWORD}@postgres:5432/immg
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_EMBED_MODEL=nomic-embed-text
NEXTAUTH_SECRET=<openssl rand -hex 32>
NEXTAUTH_URL=https://immg.votredomaine.com
```

## 3. Déployer

```bash
chmod +x scripts/deploy-vps.sh scripts/ollama-pull.sh

# Build et démarrage
docker compose -f docker-compose.prod.yml up -d --build

# Télécharger modèles Ollama (première fois, ~5 GB)
docker compose -f docker-compose.prod.yml exec ollama ollama pull qwen2.5:7b
docker compose -f docker-compose.prod.yml exec ollama ollama pull nomic-embed-text
docker compose -f docker-compose.prod.yml exec ollama ollama pull llama3.2:3b

# Migrations DB
docker compose -f docker-compose.prod.yml exec web npx prisma db push
```

## 4. Vérifier

```bash
# Santé globale
curl https://immg.votredomaine.com/api/health

# Réponse attendue
# {"status":"ok","ollama":true,"database":true}
```

## 5. Domaine + HTTPS

### 5.1 DNS

Créez un enregistrement **A** pointant vers l'IP du VPS :

```
immg.votredomaine.com  →  109.123.254.120
```

Attendez la propagation DNS (5–30 min), puis vérifiez :

```bash
dig +short immg.votredomaine.com
```

### 5.2 Choisir le mode HTTPS

| Situation | Script | Description |
|-----------|--------|-------------|
| **CRM Texta sur :80** (votre cas actuel) | `setup-https-host.sh` | SSL sur le nginx **système**, Immg reste sur `:8080` |
| VPS dédié, ports 80/443 libres | `setup-https.sh` | SSL entièrement dans Docker + certbot |

### 5.3 Mode recommandé — nginx hôte (coexistence CRM)

Immg écoute en local sur **8080**, le nginx du serveur termine le HTTPS :

```bash
cd /opt/immg

# Éditer .env
nano .env
# IMMG_DOMAIN=immg.votredomaine.com
# CERTBOT_EMAIL=vous@email.com
# NEXT_PUBLIC_APP_URL=https://immg.votredomaine.com
# NEXTAUTH_URL=https://immg.votredomaine.com

./scripts/deploy-vps.sh

# Activer HTTPS (root, sur le VPS)
sudo IMMG_DOMAIN=immg.votredomaine.com CERTBOT_EMAIL=vous@email.com ./scripts/setup-https-host.sh
```

Alternative manuelle : copier `deploy/nginx/host-immg.conf.example` vers `/etc/nginx/sites-available/immg`.

### 5.4 Mode Docker autonome (ports 80/443 libres)

```bash
cd /opt/immg
# .env : IMMG_DOMAIN, CERTBOT_EMAIL, SSL_ENABLED=false initialement
chmod +x scripts/setup-https.sh
./scripts/setup-https.sh
```

Le script obtient le certificat Let's Encrypt, active `SSL_ENABLED=true` et redémarre nginx.

### 5.5 Vérifier HTTPS

```bash
curl -s https://immg.votredomaine.com/api/health
# {"status":"ok","ollama":true,"database":true}
```

### 5.6 Renouvellement certificats

- **Mode hôte** : certbot timer systemd (`certbot renew`)
- **Mode Docker** : service `certbot` dans docker-compose (renew automatique toutes les 12h)

## 6. Modèles Ollama sur VPS CPU

| Modèle | RAM | Vitesse CPU | Usage |
|--------|-----|-------------|-------|
| `llama3.2:3b` | ~2 GB | Rapide | Routeur intent |
| `qwen2.5:7b` | ~5 GB | 15–30 s/réponse | Chat agents |
| `nomic-embed-text` | ~300 MB | Rapide | Embeddings RAG |

Si lenteur excessive : passer `AI_PROVIDER=hybrid` avec clé API OpenAI en fallback.

## 7. Cron veille IRCC

Sur le VPS, crontab :

```cron
# Ingest IRCC chaque dimanche 3h
0 3 * * 0 cd /opt/immg && docker compose -f docker-compose.prod.yml exec -T web npm run ingest:ircc

# Backup Postgres quotidien 4h
0 4 * * * cd /opt/immg && ./scripts/backup-postgres.sh
```

## 8. Mises à jour

```bash
cd /opt/immg
git pull
docker compose -f docker-compose.prod.yml build web --no-cache
docker compose -f docker-compose.prod.yml up -d
```

## 9. Commandes utiles

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f ollama

# Arrêter
docker compose -f docker-compose.prod.yml down

# Backup Postgres
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U immg immg > backup_$(date +%Y%m%d).sql

# RAM Ollama
docker stats immg-ollama-1
```

## 10. Développement local (Mac)

```bash
# Postgres seulement dans Docker
docker compose up -d postgres

# Ollama natif Mac (Metal acceleration)
ollama serve
./scripts/ollama-pull.sh

# App en local
npm run dev
```

## Sécurité production

- [ ] Mots de passe forts (Postgres, NEXTAUTH_SECRET)
- [ ] Ports 5432/11434 non exposés sur Internet
- [ ] HTTPS activé
- [ ] Disclaimer juridique visible
- [ ] Backups Postgres planifiés
- [ ] Logs sans PII

## Dépannage

| Symptôme | Solution |
|----------|----------|
| 502 Bad Gateway | `docker compose restart web nginx` |
| Ollama timeout | Vérifier RAM, réduire modèle ou activer hybrid |
| `ollama: false` health | `docker compose logs ollama`, repull modèles |
| DB connection refused | Vérifier `DATABASE_URL`, postgres running |
