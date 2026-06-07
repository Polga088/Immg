import type { AgentId } from "@/lib/agents/mascots";
import { PIXEL_BG, PIXEL_SPRITES } from "@/lib/agents/pixel-sprites";
import { PixelSprite } from "@/components/pixel-sprite";
import { cn } from "@/lib/utils";

interface MascotProps {
  agent: AgentId;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  framed?: boolean;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
  xl: "h-36 w-36",
};

const padSizes = {
  sm: "p-1",
  md: "p-1.5",
  lg: "p-2",
  xl: "p-2.5",
};

export function AgentMascot({
  agent,
  size = "md",
  className,
  animated = true,
  framed = true,
}: MascotProps) {
  const sprite = PIXEL_SPRITES[agent];

  return (
    <div
      className={cn(
        sizes[size],
        animated && "animate-mascot-bob",
        framed && "retro-mascot-frame",
        framed && padSizes[size],
        className,
      )}
      style={framed ? { backgroundColor: PIXEL_BG[agent] } : undefined}
      aria-hidden
    >
      <PixelSprite pixels={sprite} />
    </div>
  );
}
