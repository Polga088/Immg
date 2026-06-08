import type { AgentId } from "./mascots";

export const MASCOT_IMAGES: Record<AgentId, string> = {
  regulation: "/mascots/mira.png",
  cv: "/mascots/rio.png",
  job: "/mascots/jade.png",
  procedure: "/mascots/atlas.png",
};

export const MASCOT_BG: Record<AgentId, string> = {
  regulation: "#1a1a1a",
  cv: "#1a1a1a",
  job: "#1a1a1a",
  procedure: "#1a1a1a",
};

export const MASCOT_ROLES: Record<AgentId, { fr: string; en: string }> = {
  regulation: { fr: "Conseillère visa", en: "Visa Advisor" },
  cv: { fr: "Coach CV", en: "CV Coach" },
  job: { fr: "Conseiller emploi", en: "Career Advisor" },
  procedure: { fr: "Conseillère dossier", en: "Application Guide" },
};
