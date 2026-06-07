# Immg — Immigration Canada IA

Plateforme d'accompagnement à l'immigration vers le Canada, orchestrée par **4 agents IA spécialisés** et un **superviseur**, propulsée par **Ollama** (local, gratuit).

> **Avertissement** : Immg est un assistant de préparation. Il ne remplace pas un consultant réglementé (RCIC) ni un avocat en immigration.

## Agents

| Agent | Rôle |
|-------|------|
| **Réglementation** | Veille IRCC, analyse des nouveautés, impact sur votre profil |
| **CV / ATS** | Optimisation CV selon normes ATS, scoring mots-clés |
| **Emploi** | Recherche d'offres, lettres de motivation, suivi candidatures |
| **Procédure** | Parcours immigration, calculateur CRS, checklists |

## Stack

- **Next.js 15** + TypeScript + Tailwind + shadcn/ui
- **Mastra** — orchestration multi-agents (supervisor pattern)
- **Ollama** + Vercel AI SDK — LLM local (`qwen2.5:7b`)
- **PostgreSQL** + pgvector — données + embeddings RAG
- **next-intl** — interface bilingue FR/EN

## Prérequis (Mac)

- Node.js 22+
- Docker Desktop
- [Ollama](https://ollama.com) installé localement

```bash
brew install ollama
ollama serve
./scripts/ollama-pull.sh
```

## Démarrage rapide

```bash
# 1. Services (Postgres + pgvector)
docker compose up -d postgres

# 2. Variables d'environnement
cp .env.example .env.local

# 3. Base de données
npm install
npm run db:push

# 4. Application
npm run dev
```

Ouvrir [http://localhost:3000/fr](http://localhost:3000/fr) ou [http://localhost:3000/en](http://localhost:3000/en).

Healthcheck : [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Documentation

| Fichier | Description |
|---------|-------------|
| [docs/PLAN.md](docs/PLAN.md) | Plan global, roadmap, critères MVP |
| [docs/architecture.md](docs/architecture.md) | Architecture technique et modèle de données |
| [docs/agents.md](docs/agents.md) | Définition des agents, prompts, tools |
| [docs/github-references.md](docs/github-references.md) | Repos open-source de référence |
| [docs/deployment-vps.md](docs/deployment-vps.md) | Déploiement VPS (8–16 GB RAM) |
| [AGENTS.md](AGENTS.md) | Instructions pour Cursor / développement |

## Structure

```
Immg/
├── apps/web/           # Next.js App Router
├── packages/db/        # Prisma + pgvector
├── docs/               # Documentation
├── scripts/            # Ollama, ingest IRCC
├── docker-compose.yml  # Dev
└── docker-compose.prod.yml
```

## Environnements

| Environnement | Ollama | Base de données |
|---------------|--------|-----------------|
| Mac (dev) | `localhost:11434` | Docker Postgres local |
| VPS (prod) | Container Ollama | Postgres pgvector interne |

## Licence

Projet privé — Texta 2026
