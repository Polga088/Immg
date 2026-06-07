# Références GitHub — Immg

Repos open-source sélectionnés pour améliorer le niveau du projet. Classés par priorité d'intégration.

---

## Tier 1 — Intégration directe ou fork partiel

### [mastra-ai/mastra](https://github.com/mastra-ai/mastra) (~25k ⭐)

**Usage** : Orchestration multi-agents — supervisor pattern, tools, mémoire, MCP.

**Intégration Immg** :
- Superviseur + 4 sub-agents
- Pattern `Agent` avec `agents: { regulation, cv, job, procedure }`
- Workflows pour pipelines RAG et ingest IRCC

**Fichiers à étudier** : docs supervisor agents, `@mastra/core/agent`

---

### [srbhr/Resume-Matcher](https://github.com/srbhr/resume-matcher) (~27k ⭐)

**Usage** : Agent CV — scoring ATS, keywords, Ollama natif, export PDF.

**Intégration Immg** :
- Algorithme scoring mots-clés vs job description
- Support Ollama local
- Flow upload → score → suggestions → export

**Ne pas fork entier** : extraire logique scoring et patterns UI dans `src/lib/ats/`

---

### [jagreehal/ai-sdk-ollama](https://github.com/jagreehal/ai-sdk-ollama)

**Usage** : Provider Ollama pour Vercel AI SDK — tool calling fiable.

**Intégration Immg** :
- `src/lib/ai/ollama.ts`
- Streaming chat + tools pour tous les agents

```typescript
import { ollama } from 'ai-sdk-ollama';
import { streamText } from 'ai';
```

---

### [pgvector/pgvector](https://github.com/pgvector/pgvector)

**Usage** : Extension PostgreSQL pour embeddings RAG.

**Intégration Immg** :
- Image Docker `pgvector/pgvector:pg16`
- Prisma + raw SQL pour similarity search
- Table `RegulationChunk` avec colonne `embedding vector(768)`

---

## Tier 2 — Patterns à adapter

### [LakshmiSravyaVedantham/legal-lens](https://github.com/LakshmiSravyaVedantham/legal-lens)

**Usage** : Agents Réglementation + Procédure.

**Patterns à reprendre** :
- RAG avec citations obligatoires (document + page)
- Audit logging (qui a consulté quoi)
- Multi-LLM pluggable (Ollama + fallback)
- Docker Compose one-command deploy

---

### [deniztuncerz/enterprise-rag-llmops-assistant](https://github.com/deniztuncerz/enterprise-rag-llmops-assistant)

**Usage** : Stack RAG production.

**Patterns à reprendre** :
- Pipeline ingest PDF/DOCX → chunk → embed → search
- Agent layer avec 7 tools
- Prometheus/Grafana monitoring (phase VPS)
- GitHub Actions CI

---

### [tcpsyn/CareerPulse](https://github.com/tcpsyn/CareerPulse)

**Usage** : Agent Emploi — pipeline complet self-hosted.

**Patterns à reprendre** :
- Scoring jobs 0–100 vs resume
- Tailored resume + cover letter par offre
- Kanban pipeline candidatures
- Support Ollama local inference
- Extension Chrome autofill (phase future)

---

### [l3lackcurtains/jobs-optima](https://github.com/l3lackcurtains/jobs-optima)

**Usage** : Optimisation ATS + suivi candidatures.

**Patterns à reprendre** :
- BYOK (Bring Your Own Key) pour API cloud optionnelle
- Side-by-side before/after ATS score
- Job scanner scheduled
- Chrome extension save jobs

---

### [wihlarkop/applykit](https://github.com/wihlarkop/applykit)

**Usage** : Local-first, Ollama, tracker Kanban.

**Patterns à reprendre** :
- Fit score job vs profil
- SQLite/local data (nous : PostgreSQL)
- Smart Apply workflow (brouillon, pas auto-send)
- Multi-profile support

---

## Tier 3 — Inspiration ciblée

| Repo | Usage Immg |
|------|------------|
| [yugpatill/adaptive-rag-portfolio](https://github.com/yugpatill/adaptive-rag-portfolio) | Routing adaptatif : doc RAG vs web vs LLM direct |
| [amaan2801/LegalAssist-using-LLM-and-RAG](https://github.com/amaan2801/LegalAssist-using-LLM-and-RAG) | Mode draft documents + traçabilité sources |
| [alibaba/SmartResume](https://github.com/alibaba/SmartResume) | Parsing CV layout-aware (PDF complexes) |
| [XJTLUmedia/AI-HR-Management-Toolkit](https://github.com/XJTLUmedia/AI-HR-Management-Toolkit) | Pipeline ATS + MCP tools parsing batch |
| [vercel/ai](https://github.com/vercel/ai) | AI SDK — streaming, tools, UI hooks |
| [ollama/ollama](https://github.com/ollama/ollama) | Runtime LLM local |
| [nordwestt/ollama-ai-provider-v2](https://github.com/nordwestt/ollama-ai-provider-v2) | Alternative provider Ollama (plus léger) |

---

## Matrice agent → repos

| Agent Immg | Repos prioritaires | Ce qu'on réutilise |
|------------|-------------------|-------------------|
| Réglementation | legal-lens, enterprise-rag, adaptive-rag | Ingest, citations, alertes |
| CV / ATS | Resume-Matcher, SmartResume | Scoring, keywords, parsing |
| Emploi | CareerPulse, jobs-optima, applykit | Kanban, lettres, fit score |
| Procédure | legal-lens, LegalAssist | Checklist, disclaimers |
| Infra | mastra, ai-sdk-ollama, pgvector | Orchestration, deploy |

---

## Projet frère Texta

| Ressource | Chemin |
|-----------|--------|
| Architecture CRM | `../CRM/docs/architecture.md` |
| Deploy VPS | `../CRM/docs/deployment-vps.md` |

Réutiliser les patterns Docker/Nginx/scripts deploy du CRM Texta pour Immg.

---

## Ordre d'étude recommandé

1. **mastra-ai/mastra** — comprendre supervisor pattern
2. **jagreehal/ai-sdk-ollama** — intégrer Ollama
3. **srbhr/Resume-Matcher** — agent CV
4. **LakshmiSravyaVedantham/legal-lens** — RAG + citations
5. **tcpsyn/CareerPulse** — agent emploi complet
