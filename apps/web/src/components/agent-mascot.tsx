import Image from "next/image";
import type { AgentId } from "@/lib/agents/mascots";
import { MASCOT_BG, MASCOT_IMAGES } from "@/lib/agents/mascot-assets";
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
  sm: "p-0.5",
  md: "p-1",
  lg: "p-1.5",
  xl: "p-2",
};

const imageSizes = {
  sm: 48,
  md: 80,
  lg: 112,
  xl: 144,
};

export function AgentMascot({
  agent,
  size = "md",
  className,
  animated = true,
  framed = true,
}: MascotProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        sizes[size],
        animated && "animate-mascot-bob",
        framed && "retro-mascot-frame rounded-sm",
        framed && padSizes[size],
        className,
      )}
      style={framed ? { backgroundColor: MASCOT_BG[agent] } : undefined}
      aria-hidden
    >
      <Image
        src={MASCOT_IMAGES[agent]}
        alt=""
        fill
        sizes={`${imageSizes[size]}px`}
        className="object-contain pixel-art"
        priority={size === "xl" || size === "lg"}
      />
    </div>
  );
}
