import { cn } from "@/lib/utils";

export default function SectionLabel({
  index,
  children,
  className,
  light,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {index && (
        <span className="font-mono text-[0.7rem] text-ink-faint">{index}</span>
      )}
      <span className="h-px w-8 bg-border-strong" />
      <span
        className={cn(
          "text-[0.75rem] font-medium uppercase tracking-[0.22em]",
          light ? "text-ink-muted" : "text-ink-faint"
        )}
      >
        {children}
      </span>
    </div>
  );
}
