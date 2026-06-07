import type { AgentId } from "@/lib/agents/mascots";
import { cn } from "@/lib/utils";

interface MascotProps {
  agent: AgentId;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-36 w-36",
};

export function AgentMascot({
  agent,
  size = "md",
  className,
  animated = true,
}: MascotProps) {
  return (
    <div
      className={cn(
        sizes[size],
        animated && "animate-mascot-float",
        className,
      )}
      aria-hidden
    >
      {agent === "regulation" && <MiraOwl />}
      {agent === "cv" && <RioFox />}
      {agent === "job" && <JadeBird />}
      {agent === "procedure" && <AtlasCompass />}
    </div>
  );
}

function MiraOwl() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full drop-shadow-lg">
      <circle cx="60" cy="60" r="56" fill="url(#mira-bg)" />
      <ellipse cx="60" cy="68" rx="38" ry="34" fill="#5B21B6" />
      <circle cx="60" cy="52" r="30" fill="#7C3AED" />
      <circle cx="48" cy="50" r="11" fill="#FEF3C7" stroke="#4C1D95" strokeWidth="2" />
      <circle cx="72" cy="50" r="11" fill="#FEF3C7" stroke="#4C1D95" strokeWidth="2" />
      <circle cx="48" cy="50" r="5" fill="#1E1B4B" />
      <circle cx="72" cy="50" r="5" fill="#1E1B4B" />
      <circle cx="46" cy="48" r="1.5" fill="white" />
      <circle cx="70" cy="48" r="1.5" fill="white" />
      <path d="M60 58 L52 64 L68 64 Z" fill="#F59E0B" />
      <rect x="78" y="72" width="22" height="28" rx="3" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <line x1="82" y1="80" x2="96" y2="80" stroke="#6366F1" strokeWidth="2" />
      <line x1="82" y1="86" x2="94" y2="86" stroke="#6366F1" strokeWidth="1.5" />
      <line x1="82" y1="92" x2="96" y2="92" stroke="#6366F1" strokeWidth="1.5" />
      <defs>
        <radialGradient id="mira-bg" cx="0.3" cy="0.2" r="0.9">
          <stop stopColor="#EDE9FE" />
          <stop offset="1" stopColor="#C4B5FD" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function RioFox() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full drop-shadow-lg">
      <circle cx="60" cy="60" r="56" fill="url(#rio-bg)" />
      <ellipse cx="60" cy="70" rx="32" ry="28" fill="#F97316" />
      <path d="M60 38 C48 38 38 48 38 58 C38 48 44 34 60 34 C76 34 82 48 82 58 C82 48 72 38 60 38Z" fill="#EA580C" />
      <circle cx="50" cy="58" r="5" fill="#1C1917" />
      <circle cx="70" cy="58" r="5" fill="#1C1917" />
      <circle cx="49" cy="57" r="1.5" fill="white" />
      <circle cx="69" cy="57" r="1.5" fill="white" />
      <ellipse cx="60" cy="66" rx="5" ry="4" fill="#1C1917" />
      <path d="M38 52 L28 44 L36 58Z" fill="#EA580C" />
      <path d="M82 52 L92 44 L84 58Z" fill="#EA580C" />
      <rect x="72" y="78" width="26" height="20" rx="2" fill="white" stroke="#059669" strokeWidth="2" />
      <line x1="76" y1="84" x2="94" y2="84" stroke="#10B981" strokeWidth="2" />
      <line x1="76" y1="90" x2="90" y2="90" stroke="#10B981" strokeWidth="1.5" />
      <path d="M52 78 L68 78 L60 88 Z" fill="#059669" />
      <defs>
        <radialGradient id="rio-bg" cx="0.3" cy="0.2" r="0.9">
          <stop stopColor="#D1FAE5" />
          <stop offset="1" stopColor="#6EE7B7" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function JadeBird() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full drop-shadow-lg">
      <circle cx="60" cy="60" r="56" fill="url(#jade-bg)" />
      <ellipse cx="55" cy="65" rx="28" ry="24" fill="#F59E0B" />
      <circle cx="72" cy="52" r="18" fill="#D97706" />
      <circle cx="78" cy="50" r="4" fill="#1C1917" />
      <circle cx="77" cy="49" r="1.2" fill="white" />
      <path d="M88 52 L98 48 L90 56 Z" fill="#EA580C" />
      <path d="M35 70 Q55 55 75 68" stroke="#B45309" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="48" cy="78" rx="14" ry="8" fill="#FBBF24" transform="rotate(-20 48 78)" />
      <rect x="58" y="72" width="24" height="18" rx="2" fill="#FFF7ED" stroke="#EA580C" strokeWidth="2" />
      <path d="M62 78 L78 78 L70 86 Z" fill="#EA580C" opacity="0.6" />
      <circle cx="42" cy="62" r="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <defs>
        <radialGradient id="jade-bg" cx="0.3" cy="0.2" r="0.9">
          <stop stopColor="#FEF3C7" />
          <stop offset="1" stopColor="#FCD34D" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function AtlasCompass() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full drop-shadow-lg">
      <circle cx="60" cy="60" r="56" fill="url(#atlas-bg)" />
      <circle cx="60" cy="62" r="34" fill="#0EA5E9" stroke="#0369A1" strokeWidth="3" />
      <circle cx="60" cy="62" r="28" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <path d="M60 38 L66 62 L60 86 L54 62 Z" fill="#EF4444" />
      <path d="M60 38 L54 62 L60 86 L66 62 Z" fill="#DC2626" />
      <circle cx="60" cy="62" r="5" fill="#0C4A6E" />
      <path d="M44 44 C52 52 48 58 40 56 C48 50 44 44 44 44Z" fill="#DC2626" />
      <path d="M76 44 C68 52 72 58 80 56 C72 50 76 44 76 44Z" fill="#DC2626" />
      <rect x="78" y="78" width="20" height="22" rx="2" fill="white" stroke="#0284C7" strokeWidth="2" />
      <path d="M82 84 L94 84 L88 94 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      <line x1="82" y1="90" x2="92" y2="90" stroke="#94A3B8" strokeWidth="1.5" />
      <defs>
        <radialGradient id="atlas-bg" cx="0.3" cy="0.2" r="0.9">
          <stop stopColor="#E0F2FE" />
          <stop offset="1" stopColor="#7DD3FC" />
        </radialGradient>
      </defs>
    </svg>
  );
}
