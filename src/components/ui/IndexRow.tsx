"use client";

import { useId, useState } from "react";

interface IndexRowProps {
  title: React.ReactNode;
  /** Small mono tag on the right, before the chevron (e.g. the practice). */
  meta?: React.ReactNode;
  /** Detail revealed on expand. */
  children: React.ReactNode;
}

/**
 * Expandable list row (board §05/03, Obys pattern): Space Grotesk title,
 * optional mono tag and a chevron, whole row a button. Click/Enter
 * expands the detail at 300ms expo.out; top rule turns driftwood on
 * hover/focus/open.
 */
export default function IndexRow({ title, meta, children }: IndexRowProps) {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <div
      className={`group border-t transition-colors duration-300 ease-out-expo ${
        open ? "border-t-driftwood" : "border-n150 hover:border-t-driftwood"
      }`}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((v) => !v)}
          className="grid w-full grid-cols-[1fr_auto] items-baseline gap-4 py-7 text-left md:gap-8"
        >
          <span className="font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold tracking-tight text-windsor transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
            {title}
          </span>
          <span className="flex items-center gap-4 self-center md:gap-6">
            {meta && (
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-n500">
                {meta}
              </span>
            )}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className={`h-4 w-4 text-n500 transition-transform duration-300 ease-out-expo ${
                open ? "rotate-180 text-driftwood-deep" : ""
              }`}
            >
              <path
                d="M3 6l5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out-expo ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
