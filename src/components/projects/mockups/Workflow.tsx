import { Fragment } from "react";
import type { MockupCopy } from "@/content/projects";

const DOT = "size-[6px] shrink-0 rounded-full bg-white/25";

/**
 * Illustration of an AI workflow (AI workflow automation). Authored at
 * 960x600: five nodes joined by hairline connectors, and a side panel that
 * lists the same steps, each with a neutral dot.
 */
export default function Workflow({ copy }: { copy: MockupCopy["workflow"] }) {
  return (
    <div className="flex h-full w-full gap-6 bg-windsor p-6">
      <div className="flex flex-1 flex-col items-center justify-center">
        {copy.steps.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <span className="h-[28px] w-px bg-white/20" />}
            <div className="flex w-[340px] items-center gap-3 rounded-[6px] border border-white/10 bg-windsor-2 px-4 py-3">
              <span className={DOT} />
              <span className="type-small text-white">{step}</span>
            </div>
          </Fragment>
        ))}
      </div>
      <ul className="w-[260px] shrink-0 self-center rounded-[6px] border border-white/10 px-5 py-2">
        {copy.steps.map((step) => (
          <li key={step} className="type-small flex items-center gap-3 border-b border-white/10 py-3 text-n300 last:border-0">
            <span className={DOT} />
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
