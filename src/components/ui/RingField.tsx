import { cn } from "@/lib/utils";

interface RingFieldProps {
  /** Number of rings, 1–7 (insets follow mockup C's growth-ring spacing). */
  count?: number;
  /** Which ring (0-based, outside-in) renders in driftwood. */
  accentIndex?: number;
  /** Per-ring data-speed values (outside-in) for parallax drift. */
  speeds?: number[];
  /** Fill the innermost circle solid. */
  solidCore?: boolean;
  /** Ring colors for light surfaces or Windsor bands. */
  tone?: "light" | "inverse";
  className?: string;
}

/** Mockup C's non-uniform insets — tighter toward the core, like growth rings. */
const INSETS = [0, 9, 19, 30, 38, 43, 46.5];

/**
 * Concentric growth rings (the sequoia, abstracted) — hairline circles,
 * one optional driftwood accent, optional solid core. Give the parent an
 * aspect-square box; rings are pure divs, animatable via data-speed.
 */
export default function RingField({
  count = 7,
  accentIndex,
  speeds,
  solidCore = false,
  tone = "light",
  className,
}: RingFieldProps) {
  const rings = INSETS.slice(0, Math.max(1, Math.min(count, INSETS.length)));
  const base =
    tone === "inverse" ? "border-white/7" : "border-windsor/14";
  const accent =
    tone === "inverse" ? "border-driftwood/30" : "border-driftwood/85";

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute aspect-square", className)}
    >
      {rings.map((inset, i) => (
        <div
          key={i}
          data-speed={speeds?.[i]}
          className={cn(
            "absolute rounded-full border",
            i === accentIndex ? cn(accent, "border-[1.5px]") : base
          )}
          style={{ inset: `${inset}%` }}
        />
      ))}
      {solidCore && (
        <div
          data-speed={speeds?.[rings.length]}
          className={cn(
            "absolute rounded-full",
            tone === "inverse" ? "bg-white" : "bg-windsor"
          )}
          style={{ inset: "46.5%" }}
        />
      )}
    </div>
  );
}
