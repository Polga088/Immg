import type { AgentId } from "./mascots";
import { parsePixelSprite } from "@/components/pixel-sprite";

const SHARED = {
  ".": null,
  B: "#1e1b2e",
  W: "#f8fafc",
  K: "#0f0f1a",
} as const;

const MIRA_PALETTE: Record<string, string | null> = {
  ...SHARED,
  P: "#7c3aed",
  L: "#c4b5fd",
  E: "#fef08a",
  O: "#1e1b4b",
  Y: "#f59e0b",
  I: "#e0e7ff",
  D: "#6366f1",
};

const RIO_PALETTE: Record<string, string | null> = {
  ...SHARED,
  O: "#ea580c",
  R: "#f97316",
  L: "#fdba74",
  G: "#059669",
  T: "#10b981",
  C: "#ecfdf5",
};

const JADE_PALETTE: Record<string, string | null> = {
  ...SHARED,
  Y: "#fbbf24",
  O: "#d97706",
  R: "#ea580c",
  E: "#fff7ed",
  L: "#fde68a",
  N: "#78350f",
};

const ATLAS_PALETTE: Record<string, string | null> = {
  ...SHARED,
  S: "#0ea5e9",
  A: "#38bdf8",
  C: "#e0f2fe",
  N: "#0369a1",
  R: "#ef4444",
  D: "#dc2626",
  G: "#22c55e",
};

/** Mira — pixel owl with law book (regulation) */
const MIRA_ROWS = [
  "......BBBB......",
  "....BBPPPPBB....",
  "...BPPPLLLPPB...",
  "..BPLWOOOWLPB...",
  "..BPLWOOOWLPB...",
  "...BPPPLLLPPB...",
  "....BBPYYPBB....",
  "....BPPBBPPB....",
  "...BPPBBBBPPB...",
  "..BPPB....BPPB..",
  "..BPBB....BBPB..",
  "..BP..IIID.BP...",
  "..BP..IIID.BP...",
  "..BP..IIII.BP...",
  "...BB......BB...",
  "....BB....BB....",
];

/** Rio — pixel fox with resume (CV/ATS) */
const RIO_ROWS = [
  "......BBBB......",
  "....BBRRRRBB....",
  "...BRRRLLLRRB...",
  "..BOOORRRROOOB..",
  "..BOOWKKWWOOB...",
  "..BOOORRRROOOB..",
  "...BRRRYYRRRB...",
  "....BBRRRRBB....",
  "...BRRBBBBRRB...",
  "..BRRB....BRRB..",
  "..BRBB....BBRB..",
  "..BRB..CCGGBRB..",
  "..BRB..CCTTGRB..",
  "..BRB..CCTTGRB..",
  "...BB......BB...",
  "....BB....BB....",
];

/** Jade — pixel bird with envelope (jobs) */
const JADE_ROWS = [
  "......BBBB......",
  "....BBYYYYBB....",
  "...BYYYYYYYYB...",
  "..BYYYOOWWYYB...",
  "..BYYYOOWWYYB...",
  "...BYYYYYYYYB...",
  "....BBYYYYBB....",
  "...BYYBBBBYYB...",
  "..BYYB....BYYB..",
  ".BYYYB....BYYYB.",
  "BYYYYB....BYYYYB",
  "BYYEEB....BEEYYB",
  ".BYEENB....NEYYB",
  "..BYEEB....BEEYB",
  "...BB......BB...",
  "....BB....BB....",
];

/** Atlas — pixel compass buddy (procedure) */
const ATLAS_ROWS = [
  "......BBBB......",
  "....BBSSSSBB....",
  "...BSSAAAASSB...",
  "..BSSACRRACSSB..",
  "..BSSACRRACSSB..",
  "..BSSACNNACSSB..",
  "..BSSAAAASSB....",
  "...BSSBBBBSSB...",
  "...BSSB..BSSB...",
  "..BSSBB..BBSSB..",
  "..BSBB....BBSSB.",
  "..BSB..GG..BSSB.",
  "..BSB..GG..BSSB.",
  "..BSBB....BBSSB.",
  "...BB......BB...",
  "....BB....BB....",
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
