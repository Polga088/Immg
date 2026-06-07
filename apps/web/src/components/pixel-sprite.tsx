import { cn } from "@/lib/utils";

export type PixelRow = string;

export function parsePixelSprite(
  rows: PixelRow[],
  palette: Record<string, string | null>,
): (string | null)[][] {
  return rows.map((row) => [...row].map((ch) => palette[ch] ?? null));
}

interface PixelSpriteProps {
  pixels: (string | null)[][];
  className?: string;
}

export function PixelSprite({ pixels, className }: PixelSpriteProps) {
  const height = pixels.length;
  const width = pixels[0]?.length ?? 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full pixel-art", className)}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {pixels.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null,
        ),
      )}
    </svg>
  );
}
