# AGENTS.md — Instructions Cursor pour Immg

## Projet

Immg — plateforme IA multi-agents pour l'immigration Canada. Stack : Next.js 15, Mastra, Ollama, PostgreSQL pgvector, next-intl (FR/EN).

## Structure

```
apps/web/src/
├── agents/          # Mastra agents (supervisor + 4 spécialisés)
├── lib/ai/          # Provider Ollama, config AI_PROVIDER
├── lib/crs/         # Calculateur CRS (TypeScript pur, testé)
├── lib/ats/         # Scoring ATS
├── lib/rag/         # RAG réglementation IRCC
├── app/[locale]/    # Routes i18n
└── messages/        # fr.json, en.json
packages/db/         # Prisma schema
```

## Conventions

- TypeScript strict
- Le LLM **n'effectue jamais** les calculs CRS — utiliser `lib/crs/`
- Réglementation : toujours citer sources (URL + date) via RAG
- CV : ne jamais inventer expérience/diplôme
- Disclaimer juridique sur toute UI agent
- Prompts versionnés dans `agents/prompts/{agent}/v1.md`
- i18n : toute string UI dans `messages/fr.json` et `messages/en.json`

## Agents

| ID | Dossier | Tools |
|----|---------|-------|
| supervisor | `agents/supervisor.ts` | délégation |
| regulation | `agents/regulation.ts` | searchRegulations, getRecentChanges |
| cv | `agents/cv.ts` | parseResume, scoreATS, suggestImprovements |
| job | `agents/job.ts` | searchJobs, generateCoverLetter, trackApplication |
| procedure | `agents/procedure.ts` | calculateCRS, getChecklist, getRequiredDocuments |

## Ollama

- Dev Mac : `http://localhost:11434`
- VPS : `http://ollama:11434`
- Modèle chat : `qwen2.5:7b`
- Embeddings : `nomic-embed-text`
- Provider : `ai-sdk-ollama`

## Commandes

```bash
npm run dev          # Next.js dev
npm run db:push      # Prisma push
npm run test         # Vitest (CRS, ATS)
npm run ingest:ircc  # Pipeline RAG IRCC
./scripts/ollama-pull.sh
```

## Docs

- [docs/PLAN.md](docs/PLAN.md) — roadmap
- [docs/architecture.md](docs/architecture.md) — technique
- [docs/agents.md](docs/agents.md) — définition agents
- [docs/github-references.md](docs/github-references.md) — repos référence

## Sécurité

- Pas de PII dans les logs
- Pas de soumission automatique dossiers IRCC
- Pas d'auto-submit candidatures LinkedIn
- Valider `.env` ne contient pas de secrets commités
