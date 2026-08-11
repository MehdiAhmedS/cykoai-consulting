"use client";

import { useId, useState } from "react";

interface IndexRowProps {
  /** Mono index, "01"–"07". */
  index: string;
  title: string;
  /** Detail revealed on expand. */
  children: React.ReactNode;
}

/**
 * Numbered service row (board §05/03, Obys pattern): mono index +
 * Space Grotesk title + chevron, whole row a button. Click/Enter
 * expands the detail at 300ms expo.out; top rule turns driftwood on
 * hover/focus/open.
 */
export default function IndexRow({ index, title, children }: IndexRowProps) {
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
          className="grid w-full grid-cols-[48px_1fr_auto] items-baseline gap-4 py-7 text-left md:grid-cols-[64px_1fr_auto] md:gap-8"
        >
          <span className="font-mono text-[11px] tracking-[0.1em] text-driftwood-deep">
            {index}
          </span>
          <span className="font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold tracking-tight text-windsor transition-transform duration-300 ease-out-expo group-hover:translate-x-1">
            {title}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className={`h-4 w-4 self-center text-n500 transition-transform duration-300 ease-out-expo ${
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
          <div className="grid grid-cols-[48px_1fr] gap-4 pb-8 md:grid-cols-[64px_1fr] md:gap-8">
            <span aria-hidden />
            <div className="max-w-[52ch] text-[0.98rem] leading-[1.7] text-n500">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
