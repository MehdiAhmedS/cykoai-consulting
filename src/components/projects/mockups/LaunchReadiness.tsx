import type { MockupCopy } from "@/content/projects";

/** Key swatches, strongest to weakest: a scale, never set against a row. */
const SWATCH = ["bg-white/55", "bg-white/38", "bg-white/24", "bg-white/12"];
/** Redaction-bar widths (px) where a review's notes would be. */
const NOTES = [236, 184, 212, 160, 196, 224];

/**
 * Illustration of a launch-readiness review (AI-built apps). Authored at
 * 960x600: a severity key and the checklist of what a review covers, each
 * item with a neutral dot. No severity, count or result against any item.
 */
export default function LaunchReadiness({ copy }: { copy: MockupCopy["launchReadiness"] }) {
  return (
    <div className="flex h-full w-full flex-col gap-4 bg-windsor p-6">
      <div className="flex items-center justify-between rounded-[6px] bg-windsor-2 px-5 py-4">
        <p className="type-body text-white">{copy.title}</p>
        <ul className="flex gap-5">
          {copy.severity.map((level, i) => (
            <li key={level} className="type-label flex items-center gap-2 text-n300">
              <span className={`size-[8px] rounded-[2px] ${SWATCH[i]}`} />
              {level}
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-1 flex-col rounded-[6px] border border-white/10 px-5">
        {copy.checklist.map((item, i) => (
          <li key={item} className="flex flex-1 items-center gap-4 border-b border-white/10 last:border-0">
            <span className="size-[6px] shrink-0 rounded-full bg-white/25" />
            <span className="type-small w-[280px] shrink-0 text-white">{item}</span>
            <span className="h-[10px] rounded-[2px] bg-white/10" style={{ width: NOTES[i % NOTES.length] }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
