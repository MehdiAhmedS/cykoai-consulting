import type { MockupCopy } from "@/content/projects";
import { cn } from "@/lib/utils";

/** Redaction-bar widths (px) for the Account and Access columns: shapes only, no data. */
const ROWS = [
  [132, 88],
  [104, 116],
  [148, 72],
  [96, 104],
  [124, 92],
  [112, 128],
];

const COLS = "grid grid-cols-[1.6fr_0.9fr_1.3fr_0.8fr_0.9fr] items-center gap-x-4";
const CHIP = "h-[18px] w-[52px] rounded-[2px] border border-white/15";
const DOT = "size-[6px] rounded-full bg-white/25";

/**
 * Illustration of a Workspace access review (HDT Systems). Authored at
 * 960x600. Every row reads the same: redaction bars, empty neutral chips and
 * dots, so no row carries a state, a decision or anyone's data.
 */
export default function AccessReview({ copy }: { copy: MockupCopy["accessReview"] }) {
  return (
    <div className="flex h-full w-full gap-4 bg-windsor p-6">
      <ul className="w-[168px] shrink-0 space-y-1 rounded-[6px] bg-windsor-2 p-3">
        {copy.rail.map((item, i) => (
          <li
            key={item}
            className={cn("type-small rounded-[4px] px-3 py-1.5", i === 0 ? "bg-white/8 text-white" : "text-n300")}
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-1 flex-col rounded-[6px] border border-white/10">
        <div className={cn(COLS, "border-b border-white/10 px-4 py-3")}>
          {copy.columns.map((col) => (
            <span key={col} className="type-label text-n300">
              {col}
            </span>
          ))}
        </div>
        {ROWS.map(([account, access], i) => (
          <div key={i} className={cn(COLS, "border-b border-white/10 px-4 py-[14px]")}>
            <span className="h-[10px] rounded-[2px] bg-white/12" style={{ width: account }} />
            <span className={CHIP} />
            <span className="h-[10px] rounded-[2px] bg-white/12" style={{ width: access }} />
            <span className={DOT} />
            <span className={CHIP} />
          </div>
        ))}
        <ul className="mt-auto flex gap-6 px-4 py-4">
          {copy.legend.map((item) => (
            <li key={item} className="type-label flex items-center gap-2 text-n300">
              <span className="h-[12px] w-[20px] rounded-[2px] border border-white/15" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-[200px] shrink-0 rounded-[6px] bg-windsor-2 p-4">
        <p className="type-label text-n300">{copy.controlsTitle}</p>
        <ul className="mt-3">
          {copy.controls.map((item) => (
            <li key={item} className="type-small flex items-center gap-2.5 border-t border-white/10 py-2.5 text-n300">
              <span className={DOT} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
