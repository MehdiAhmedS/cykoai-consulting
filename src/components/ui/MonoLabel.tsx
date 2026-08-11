import { cn } from "@/lib/utils";

interface MonoLabelProps {
  children: React.ReactNode;
  /** Mono index ("01"–"07") rendered in driftwood before the label. */
  index?: string;
  /** Without an index, a 28px driftwood tick leads the label instead. */
  tick?: boolean;
  /** Text color context: light surface (n500) or Windsor band (n300). */
  tone?: "light" | "inverse";
  as?: "div" | "h2" | "h3" | "p";
  className?: string;
}

/**
 * The instrumentation voice: JetBrains Mono caps, .22em tracking,
 * driftwood index or tick (mockups' .eyebrow / .kicker).
 */
export default function MonoLabel({
  children,
  index,
  tick = false,
  tone = "light",
  as: Tag = "div",
  className,
}: MonoLabelProps) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em]",
        tone === "inverse" ? "text-n300" : "text-n500",
        className
      )}
    >
      {index ? (
        <span aria-hidden className="tracking-[0.1em] text-driftwood">
          {index}
        </span>
      ) : tick ? (
        <span aria-hidden className="h-px w-7 shrink-0 bg-driftwood" />
      ) : null}
      <span>{children}</span>
    </Tag>
  );
}
