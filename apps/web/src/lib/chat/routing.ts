import type { AgentId } from "@/lib/ai/config";

const ROUTING_PATTERNS: Array<{ agent: Exclude<AgentId, "supervisor">; patterns: RegExp[]; weight: number }> = [
  {
    agent: "regulation",
    weight: 3,
    patterns: [
      /\bircc\b/i,
      /règlement/i,
      /regulation/i,
      /\bloi\b/i,
      /\blaw\b/i,
      /bulletin/i,
      /nouveau.*(règle|rule|politique|policy)/i,
      /chang(e|ement).*(ircc|immigration)/i,
      /exigence.*(ircc|visa|immigration)/i,
    ],
  },
  {
    agent: "cv",
    weight: 3,
    patterns: [
      /\bcv\b/i,
      /resume/i,
      /curriculum/i,
      /\bats\b/i,
      /mot-clé/i,
      /keyword/i,
      /optimis.*cv/i,
    ],
  },
  {
    agent: "job",
    weight: 3,
    patterns: [
      /emploi/i,
      /\bjob\b/i,
      /lettre.*motivation/i,
      /cover letter/i,
      /candidat/i,
      /offre.*(emploi|travail|job)/i,
      /travail/i,
    ],
  },
  {
    agent: "procedure",
    weight: 2,
    patterns: [
      /\bcrs\b/i,
      /express entry/i,
      /\bpnp\b/i,
      /checklist/i,
      /procédure/i,
      /procedure/i,
      /immigr/i,
      /\bvisa\b/i,
      /document.*(requis|required)/i,
      /admissib/i,
      /parcours/i,
    ],
  },
];

export type RoutableAgent = Exclude<AgentId, "supervisor">;

export function scoreAgents(message: string): Record<RoutableAgent, number> {
  const scores: Record<RoutableAgent, number> = {
    regulation: 0,
    cv: 0,
    job: 0,
    procedure: 0,
  };

  for (const { agent, patterns, weight } of ROUTING_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        scores[agent] += weight;
      }
    }
  }

  return scores;
}

/** Primary agent for simple routing (backward compatible). */
export function routeIntent(message: string): RoutableAgent {
  const scores = scoreAgents(message);
  const ranked = (Object.entries(scores) as [RoutableAgent, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  return ranked[0]?.[0] ?? "procedure";
}

/**
 * Multi-agent pipeline: up to 2 agents when the message spans topics.
 * Example: "Mon score CRS et la règle IRCC sur les fonds" → procedure + regulation.
 */
export function resolveAgents(message: string): RoutableAgent[] {
  const scores = scoreAgents(message);
  const ranked = (Object.entries(scores) as [RoutableAgent, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  if (ranked.length === 0) return ["procedure"];
  if (ranked.length === 1) return [ranked[0][0]];

  const [first, second] = ranked;
  if (second[1] >= first[1] * 0.6) {
    return [first[0], second[0]];
  }

  return [first[0]];
}

export function describeAgentRoles(agents: RoutableAgent[], locale: "fr" | "en"): string {
  const labels: Record<RoutableAgent, { fr: string; en: string }> = {
    regulation: { fr: "Réglementation IRCC", en: "IRCC regulations" },
    cv: { fr: "CV / ATS", en: "CV / ATS" },
    job: { fr: "Emploi", en: "Jobs" },
    procedure: { fr: "Procédure / CRS", en: "Procedure / CRS" },
  };

  return agents.map((a) => (locale === "fr" ? labels[a].fr : labels[a].en)).join(" + ");
}
