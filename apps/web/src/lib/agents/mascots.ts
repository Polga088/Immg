export type AgentId = "regulation" | "cv" | "job" | "procedure";

export interface AgentMeta {
  id: AgentId;
  name: { fr: string; en: string };
  tagline: { fr: string; en: string };
  gradient: string;
  glow: string;
  accent: string;
  ring: string;
  bg: string;
}

export const AGENTS: Record<AgentId, AgentMeta> = {
  regulation: {
    id: "regulation",
    name: { fr: "Mira", en: "Mira" },
    tagline: {
      fr: "Avocate — experte IRCC & réglementation",
      en: "Lawyer — IRCC & regulations expert",
    },
    gradient: "from-violet-500 to-indigo-600",
    glow: "shadow-violet-500/25",
    accent: "text-violet-600",
    ring: "ring-violet-200",
    bg: "bg-violet-50",
  },
  cv: {
    id: "cv",
    name: { fr: "Rio", en: "Rio" },
    tagline: {
      fr: "Coach CV — maître du score ATS",
      en: "CV coach — ATS scoring expert",
    },
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/25",
    accent: "text-emerald-600",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
  },
  job: {
    id: "job",
    name: { fr: "Jade", en: "Jade" },
    tagline: {
      fr: "Conseillère emploi — candidatures & lettres",
      en: "Career advisor — jobs & cover letters",
    },
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/25",
    accent: "text-amber-600",
    ring: "ring-amber-200",
    bg: "bg-amber-50",
  },
  procedure: {
    id: "procedure",
    name: { fr: "Atlas", en: "Atlas" },
    tagline: {
      fr: "Professeur guide — parcours & score CRS",
      en: "Professor guide — pathway & CRS score",
    },
    gradient: "from-sky-500 to-blue-600",
    glow: "shadow-sky-500/25",
    accent: "text-sky-600",
    ring: "ring-sky-200",
    bg: "bg-sky-50",
  },
};

export function getAgent(id: AgentId): AgentMeta {
  return AGENTS[id];
}

export function localeTagline(agent: AgentMeta, locale: string): string {
  return locale === "en" ? agent.tagline.en : agent.tagline.fr;
}

export function localeName(agent: AgentMeta, locale: string): string {
  return locale === "en" ? agent.name.en : agent.name.fr;
}
