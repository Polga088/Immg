# Architecture — Immg

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js (apps/web)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ UI FR/EN │  │  Chat    │  │ Profil   │  │  Kanban     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘  │
│       └─────────────┴─────────────┴───────────────┘          │
│                          │                                    │
│              ┌───────────▼───────────┐                       │
│              │  Agent Superviseur    │  (Mastra)             │
│              └───┬───┬───┬───┬──────┘                       │
│     regulation  cv  job  procedure                           │
│       │         │    │      │                                 │
│  ┌────▼────┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──────┐                   │
│  │ RAG     │ │ ATS │ │Jobs │ │ CRS     │                   │
│  │ IRCC    │ │Score│ │Queue│ │Checklist│                   │
│  └────┬────┘ └──┬──┘ └──┬──┘ └──┬──────┘                   │
└───────┼─────────┼───────┼───────┼───────────────────────────┘
        │         │       │       │
   ┌────▼─────────▼───────▼───────▼────┐
   │         PostgreSQL + pgvector      │
   └────────────────────────────────────┘
        │
   ┌────▼────┐
   │ Ollama  │  qwen2.5:7b + nomic-embed-text
   └─────────┘
```

## Modules API

| Route | Description |
|-------|-------------|
| `GET /api/health` | Santé app + Ollama + Postgres |
| `POST /api/chat` | Chat streaming (superviseur) |
| `POST /api/chat/[agent]` | Chat direct par agent |
| `GET/POST /api/profile` | Profil immigration |
| `POST /api/crs/calculate` | Calculateur CRS |
| `POST /api/cv/upload` | Upload et analyse CV |
| `POST /api/cv/score` | Score ATS |
| `GET/POST /api/regulations/search` | RAG réglementation |
| `GET/POST /api/jobs` | Candidatures emploi |
| `POST /api/jobs/cover-letter` | Génération lettre |

## Couche IA (`src/lib/ai/`)

```
ai/
├── provider.ts      # Abstraction AI_PROVIDER (ollama | hybrid | openai)
├── ollama.ts        # Client ai-sdk-ollama
├── embed.ts         # Embeddings nomic-embed-text
└── config.ts        # Modèles, timeouts, fallback
```

Variable `AI_PROVIDER` :
- `ollama` — Ollama uniquement (dev Mac, VPS self-hosted)
- `hybrid` — Ollama par défaut, fallback API si timeout
- `openai` — API cloud uniquement

## Agents Mastra (`src/agents/`)

```
agents/
├── index.ts           # Export Mastra instance
├── supervisor.ts      # Coordinateur
├── regulation.ts      # Agent réglementation
├── cv.ts              # Agent CV/ATS
├── job.ts             # Agent emploi
├── procedure.ts       # Agent procédure
├── prompts/           # Prompts versionnés
└── tools/             # Tools par agent
    ├── regulation.ts
    ├── cv.ts
    ├── job.ts
    └── procedure.ts
```

## RAG réglementation (`src/lib/rag/`)

```
rag/
├── ingest.ts          # Chunking + embedding IRCC
├── search.ts          # Similarity search pgvector
└── sources.ts         # URLs sources officielles
```

Pipeline :
1. Fetch page IRCC (cron hebdomadaire)
2. Chunk (512 tokens, overlap 50)
3. Embed via Ollama `nomic-embed-text`
4. Store dans `RegulationChunk`
5. Search top-k → prompt LLM avec citations

## Calculateur CRS (`src/lib/crs/`)

Logique **100 % TypeScript**, testée unitairement. Le LLM n'effectue jamais le calcul — il explique le résultat.

Composantes CRS (simplifié MVP) :
- Âge
- Éducation
- Langue officielle (CLB)
- Expérience travail étranger / Canada
- Adaptabilité (études Canada, emploi Canada, frère/sœur)

## ATS (`src/lib/ats/`)

Règles codées :
- Présence sections (Contact, Summary, Experience, Education, Skills)
- Longueur et format
- Correspondance mots-clés offre vs CV
- Pénalités (tableaux, images, colonnes multiples)

Score 0–100 + suggestions LLM contraintes.

## Schéma Prisma (packages/db)

Voir `packages/db/prisma/schema.prisma` pour le schéma complet.

Relations clés :
- `User` 1—1 `ImmigrationProfile`
- `User` 1—N `Document`, `Application`, `Conversation`
- `RegulationChunk` — standalone avec embedding vector

## Environnements

### Mac (dev)

```
Next.js dev :3000  →  Ollama localhost:11434
                  →  Postgres Docker :5432
```

### VPS (prod, 8–16 GB)

```
Nginx :443  →  Next.js :3000
                →  Ollama (internal)
                →  Postgres (internal, non exposé)
```

## Sécurité

- JWT/session pour auth
- Documents chiffrés au repos (phase 2)
- Logs sans PII
- Rate limiting API chat
- Disclaimer juridique sur chaque session agent

## Dépendances externes (phases futures)

- Job Bank Canada — scraping/API publique
- IRCC Canada.ca — ingestion RAG
- Optionnel : OpenAI/Anthropic pour fallback hybrid
