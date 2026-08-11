import { cn } from "@/lib/utils";

type Tone = "hairline" | "inverse-hairline" | "accent" | "windsor" | "plane";

interface DiagonalPlaneProps {
  /** Preset stroke color/weight pairing. */
  tone?: Tone;
  /** Stroke width in px (overrides the tone's default). */
  weight?: number;
  /** Optional data-speed for the shared parallax translator. */
  speed?: number;
  /** Positioning/sizing — the SVG fills this element. */
  className?: string;
  /** Mirror the diagonal (default runs bottom-left → top-right). */
  flip?: boolean;
}

const toneStroke: Record<Tone, { stroke: string; weight: number }> = {
  hairline: { stroke: "var(--color-n150)", weight: 1.5 },
  "inverse-hairline": { stroke: "rgba(255,255,255,0.08)", weight: 1.5 },
  accent: { stroke: "var(--color-driftwood)", weight: 1.5 },
  windsor: { stroke: "var(--color-windsor)", weight: 1.5 },
  /** architectural-scale soft plane (mockup B's wide stroke) */
  plane: { stroke: "rgba(255,255,255,0.05)", weight: 120 },
};

/**
 * The mark's diagonal as a section motif — one clean SVG line
 * (DS: "a single clean line, never decorative clutter").
 */
export default function DiagonalPlane({
  tone = "hairline",
  weight,
  speed,
  className,
  flip = false,
}: DiagonalPlaneProps) {
  const preset = toneStroke[tone];
  return (
    <div
      aria-hidden="true"
      data-speed={speed}
      className={cn("pointer-events-none absolute", className)}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <line
          x1={flip ? 100 : 0}
          y1="100"
          x2={flip ? 0 : 100}
          y2="0"
          stroke={preset.stroke}
          strokeWidth={weight ?? preset.weight}
          vectorEffect={
            (weight ?? preset.weight) <= 3 ? "non-scaling-stroke" : undefined
          }
        />
      </svg>
    </div>
  );
}
