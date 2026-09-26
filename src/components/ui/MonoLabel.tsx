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
 * The instrumentation voice: type-label (Chivo Mono caps), optional
 * driftwood tick (mockups' .eyebrow / .kicker).
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
        "type-label flex items-center gap-4",
        tone === "inverse" ? "text-n300" : "text-n500",
        className
      )}
    >
      {tick && <span aria-hidden className="h-px w-7 shrink-0 bg-driftwood" />}
      <span>{children}</span>
    </Tag>
  );
}
