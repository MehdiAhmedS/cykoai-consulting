import { cn } from "@/lib/utils";

interface MonoLabelProps {
  children: React.ReactNode;
  /** A 28px driftwood tick leads the label. */
  tick?: boolean;
  /** Text color context: light surface (n500) or Windsor band (n300). */
  tone?: "light" | "inverse";
  as?: "div" | "h2" | "h3" | "p";
  className?: string;
}

/**
 * The instrumentation voice: JetBrains Mono caps, .22em tracking,
 * optional driftwood tick (mockups' .eyebrow / .kicker).
 */
export default function MonoLabel({
  children,
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
      {tick && <span aria-hidden className="h-px w-7 shrink-0 bg-driftwood" />}
      <span>{children}</span>
    </Tag>
  );
}
