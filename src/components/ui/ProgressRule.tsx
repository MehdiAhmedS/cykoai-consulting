"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A 1px Driftwood rule down the left edge of its (relative) parent, drawn
 * from the top as the parent scrolls past 60% of the viewport, so its tip
 * stays on that line. Desktop only. The CSS state is fully drawn, which is
 * what reduced motion and the server render show.
 */
export default function ProgressRule() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rule = ref.current;
    const column = rule?.parentElement;
    if (!rule || !column) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        rule,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: column,
            start: "top 60%",
            end: "bottom 60%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-y-0 left-0 hidden w-px origin-top bg-driftwood min-[900px]:block"
    />
  );
}
