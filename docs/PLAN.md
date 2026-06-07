# Plan global — Immg (Immigration Canada IA)

## Contexte

- **Cible** : immigration vers le Canada (Express Entry, PNP, permis travail)
- **Dev** : Mac + Ollama local
- **Prod** : VPS 8–16 GB RAM, CPU seul (modèles 7B max)
- **UI** : bilingue FR/EN

## Vision produit

Immg accompagne les candidats à l'immigration via 4 agents IA spécialisés coordonnés par un superviseur Mastra. Chaque agent a des tools dédiés, des garde-fous juridiques et accède à un profil immigration partagé.

**Disclaimer permanent** : assistant de préparation, pas un avis juridique ni un substitut RCIC/avocat.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15, Tailwind, shadcn/ui, next-intl |
| Agents | Mastra (supervisor pattern) |
| LLM | Ollama + ai-sdk-ollama |
| Fallback | OpenAI-compatible API (optionnel) |
| DB | PostgreSQL + pgvector |
| Jobs async | API routes + cron VPS |
| Deploy | Docker Compose + Nginx |

**Modèles Ollama (8–16 GB RAM)** :
- Chat : `qwen2.5:7b`
- Embeddings : `nomic-embed-text`
- Routeur : `llama3.2:3b`

## Roadmap

### Phase 0 — Documentation et scaffolding (semaine 1)

- [x] Fichiers `.md` complets
- [x] Monorepo Next.js + Prisma + Docker
- [x] next-intl FR/EN
- [x] Client Ollama + `/api/health`

### Phase 1 — MVP Procédure (semaines 2–3)

- Profil immigration (formulaire)
- Calculateur CRS (TypeScript, testé)
- Agent Procédure + chat streaming
- Disclaimer juridique

**Critère MVP** : score CRS expliqué en FR/EN via Ollama.

### Phase 2 — Agent CV / ATS (semaines 4–5)

- Upload CV (PDF/DOCX)
- Score ATS + mots-clés
- Suggestions reformulation (sans invention)
- Export PDF

**Critère MVP** : score ATS + 5 suggestions pour une offre cible.

### Phase 3 — Agent Réglementation (semaines 6–8)

- Pipeline ingest IRCC → pgvector
- RAG avec citations obligatoires
- Alertes changements pertinents

**Critère MVP** : réponse réglementaire avec source datée IRCC.

### Phase 4 — Agent Emploi (semaines 9–11)

- Recherche Job Bank + URL manuelle
- Génération lettre de motivation
- Kanban candidatures + rappels

**Critère MVP** : brouillon lettre + suivi statut candidature.

### Phase 5 — VPS production (semaine 12)

- Docker Compose prod
- HTTPS Let's Encrypt
- Monitoring healthchecks
- Script deploy

## Modèle de données

| Entité | Description |
|--------|-------------|
| User | Auth, locale (fr/en) |
| ImmigrationProfile | Âge, diplômes, expérience, CLB, NOC, fonds |
| Document | CV, pièces jointes |
| RegulationChunk | Chunks IRCC + embedding |
| Application | Candidatures emploi |
| ProcedureStep | Checklist par programme |
| Conversation / Message | Historique par agent |

## Risques et mitigations

| Risque | Mitigation |
|--------|------------|
| Hallucinations réglementaires | RAG + citations + refus si source absente |
| Lenteur Ollama CPU | Modèle 7B, queue async, fallback API |
| Responsabilité juridique | Disclaimer RCIC, pas de soumission auto IRCC |
| ToS emploi | Brouillons + envoi manuel |
| PII | Chiffrement, logs sans données sensibles |

## Évolution

1. **Modèles** — swap `OLLAMA_MODEL` sans refactor
2. **RAG** — enrichissement IRCC + PNP provinciaux
3. **Prompts** — versionnés `prompts/{agent}/v{n}.md`
4. **Agents** — extension PNP par province
5. **Fine-tuning** — LoRA optionnel après 12 mois

## Références

- [architecture.md](architecture.md)
- [agents.md](agents.md)
- [github-references.md](github-references.md)
- [deployment-vps.md](deployment-vps.md)
