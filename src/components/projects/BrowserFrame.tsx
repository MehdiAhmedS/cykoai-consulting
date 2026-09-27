import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  /** The screen's label in the bar. */
  label: string;
  /** "Illustration" on mockups, at the right of the bar. */
  tag?: string;
  /** 16:10 on the stage and for mockups; 16:11 for captures below 1024px. */
  viewport?: "16/10" | "16/11";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * A browser window drawn in hairlines (v3 step 07): a 30px bar with three
 * dots and the label, radius 8px, a 1px white/10 edge, no shadow, and
 * windsor-2 behind the screen. Decorative: every frame sits inside an
 * aria-hidden stage or inline screen, and nothing in it is focusable.
 */
export default function BrowserFrame({ label, tag, viewport = "16/10", className, style, children }: BrowserFrameProps) {
  return (
    <div className={cn("overflow-hidden rounded-[8px] border border-white/10 bg-windsor-2", className)} style={style}>
      <div className="flex h-[30px] items-center gap-3 px-3">
        <span className="flex shrink-0 gap-[5px]">
          <span className="size-[7px] rounded-full bg-white/18" />
          <span className="size-[7px] rounded-full bg-white/18" />
          <span className="size-[7px] rounded-full bg-white/18" />
        </span>
        <span className="type-label truncate text-n300">{label}</span>
        {tag && (
          <span className="type-label ml-auto shrink-0 rounded-[2px] border border-white/20 px-1.5 leading-[16px] text-n300">
            {tag}
          </span>
        )}
      </div>
      <div className={cn("relative overflow-hidden bg-windsor-2", viewport === "16/10" ? "aspect-[16/10]" : "aspect-[16/11]")}>
        {children}
      </div>
    </div>
  );
}
