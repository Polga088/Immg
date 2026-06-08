import type { AgentId } from "./mascots";
import { parsePixelSprite } from "@/components/pixel-sprite";

const SHARED = {
  ".": null,
  B: "#1e1b2e",
  W: "#f8fafc",
  K: "#0f0f1a",
  S: "#fcd9b6",
  H: "#3f2e1f",
} as const;

/** Mira — avocate (réglementation IRCC) */
const MIRA_PALETTE: Record<string, string | null> = {
  ...SHARED,
  R: "#5b21b6",
  L: "#8b5cf6",
  C: "#e9d5ff",
  I: "#6366f1",
};

/** Rio — coach carrière / recruteur (CV & ATS) */
const RIO_PALETTE: Record<string, string | null> = {
  ...SHARED,
  T: "#047857",
  G: "#10b981",
  N: "#064e3b",
  P: "#ecfdf5",
  O: "#f97316",
};

/** Jade — conseillère emploi (candidatures) */
const JADE_PALETTE: Record<string, string | null> = {
  ...SHARED,
  A: "#d97706",
  Y: "#fbbf24",
  U: "#92400e",
  E: "#fff7ed",
  M: "#78350f",
};

/** Atlas — professeur / guide procédure (CRS & parcours) */
const ATLAS_PALETTE: Record<string, string | null> = {
  ...SHARED,
  L: "#0284c7",
  C: "#38bdf8",
  N: "#0c4a6e",
  D: "#e0f2fe",
  R: "#ef4444",
};

/** Mira — avocate, robe violette + livre de loi */
const MIRA_ROWS = [
  ".......HHHHHH.......",
  ".....HHHHHHHHHH.....",
  "...HHSSSSSSSSSSHH...",
  "....HHSSOOOOSHH.....",
  "...HHSSSSSSSSSSHH...",
  "....HCCRRRRCCCH.....",
  "....HRRRRRRRRRRRH...",
  "...HRRB......BRRH...",
  "...HRRRRRRRRRRRRH...",
  "...HRRRRRRRRRRRRH...",
  "....HRRRRRRRRRRH....",
  "....HRRRRRRRRH......",
  ".....HLLLLLLH.......",
  "......HBBBBBBH......",
  "........IIII........",
  "........BB..........",
];

/** Rio — coach CV, veste verte + document ATS */
const RIO_ROWS = [
  "........OOOO........",
  "......OOOOOOOO......",
  ".....OOSSSSSSOO.....",
  "....OOSSKKKKSSOO....",
  "....OOSSSSSSSSOO....",
  ".....OTTTTTTTTO.....",
  "....OTTTWWWWTTTO....",
  "...OTTP......PTTO...",
  "...OTTTTTTTTTTTTO...",
  "...OTTTTTTTTTTTTO...",
  "....OTTTTTTTTTTO....",
  ".....ONNNNNNNO......",
  "......ON....NO......",
  "......OBBBBBO.......",
  ".......PPPPP........",
  ".......PPPPP........",
];

/** Jade — conseillère emploi, tailleur ambre + mallette */
const JADE_ROWS = [
  "........HHHH........",
  "......HHHHHHHH......",
  ".....HHSSSSSSHH.....",
  "....HHSSOOOOSHH.....",
  "....HHSSSSSSSHH.....",
  ".....HAAAAAAAHH.....",
  "....HAAAWWWWAAAH....",
  "...HAAAB....BAAAH...",
  "...HAAAAAAAAAAAAH...",
  "...HAAAMMMMMMAAAH...",
  "....HAAAAAAAAAH.....",
  ".....HUNNNNNHU......",
  "......HU....HU......",
  "......HEEEEEM.......",
  ".......EMMMME.......",
  ".......EMMMME.......",
];

/** Atlas — professeur, blazer bleu + lunettes + pointeur */
const ATLAS_ROWS = [
  "........HHHH........",
  "......HHHHHHHH......",
  ".....HHSSSSSSHH.....",
  "....HHSSKKKKSSHH....",
  "....HHSSSSSSSSHH....",
  ".....HLLLLLLLLH.....",
  "....HLLLWWWWLLLH....",
  "...HLLLR......RLLH..",
  "...HLLLLLLLLLLLLH...",
  "...HLLLLLLLLLLLLH...",
  "....HLLLLLLLLLLH....",
  ".....HNNNNNNNNH.....",
  "......HNNNNNNH......",
  "......HDDDDDDH......",
  ".......RR...........",
  ".......RR...........",
];

export const PIXEL_SPRITES: Record<AgentId, (string | null)[][]> = {
  regulation: parsePixelSprite(MIRA_ROWS, MIRA_PALETTE),
  cv: parsePixelSprite(RIO_ROWS, RIO_PALETTE),
  job: parsePixelSprite(JADE_ROWS, JADE_PALETTE),
  procedure: parsePixelSprite(ATLAS_ROWS, ATLAS_PALETTE),
};

export const PIXEL_BG: Record<AgentId, string> = {
  regulation: "#ede9fe",
  cv: "#d1fae5",
  job: "#fef3c7",
  procedure: "#e0f2fe",
};

export const PIXEL_ROLES: Record<AgentId, { fr: string; en: string }> = {
  regulation: { fr: "Avocate", en: "Lawyer" },
  cv: { fr: "Coach CV", en: "CV Coach" },
  job: { fr: "Conseillère emploi", en: "Career Advisor" },
  procedure: { fr: "Professeur", en: "Professor" },
};
