import { cn } from "@/lib/utils";

/** Bar widths for the device list: shapes only. */
const LIST = ["62%", "48%", "56%", "40%", "52%"];
const DOT = "size-[6px] shrink-0 rounded-full bg-white/25";

/**
 * The device app's placeholder (v3 step 07): a phone drawn in hairlines
 * holding skeleton blocks and no text. A picture of a device, so its 34px /
 * 24px radii are the one exception to the page's 2–8px rule. The ring is
 * full and neutral: a partly filled ring would read as a percentage.
 */
export default function PhoneShell({ tag, variant }: { tag: string; variant: "stage" | "inline" }) {
  const phone = (
    <div
      className={cn(
        "aspect-[9/19.5] rounded-[34px] border border-white/12 p-[10px]",
        variant === "stage" ? "h-[calc(min(58vh,480px)_-_48px)]" : "w-full max-w-[230px]"
      )}
    >
      <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[24px] border border-white/8 bg-windsor-2 p-3.5">
        <div className="flex items-center justify-between pt-1">
          <span className="h-[6px] w-[38%] rounded-full bg-white/14" />
          <span className="size-[14px] rounded-full border border-white/14" />
        </div>
        <div className="flex aspect-[5/4] shrink-0 items-center justify-center rounded-[8px] bg-white/6">
          <svg viewBox="0 0 100 100" className="w-[56%] text-white/16">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="7" />
          </svg>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2">
          {[0, 1].map((k) => (
            <div key={k} className="rounded-[8px] bg-white/6 p-2.5">
              <span className={cn(DOT, "block")} />
              <span className="mt-3 block h-[5px] w-3/4 rounded-full bg-white/12" />
            </div>
          ))}
        </div>
        <ul className="flex min-h-0 flex-1 flex-col justify-evenly">
          {LIST.map((width, k) => (
            <li key={k} className="flex items-center gap-2.5 border-t border-white/8 py-1.5">
              <span className={DOT} />
              <span className="h-[5px] rounded-full bg-white/12" style={{ width }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const label = (
    <span className="type-label rounded-[2px] border border-white/20 px-1.5 leading-[16px] text-n300">{tag}</span>
  );

  if (variant === "stage") {
    return (
      <div className="flex flex-col items-center gap-3">
        {phone}
        {label}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 rounded-[8px] bg-windsor-2 px-6 py-[clamp(22px,4vw,44px)]">
      {phone}
      {label}
    </div>
  );
}
