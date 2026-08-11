"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionLabel from "@/components/ui/SectionLabel";

const LINES = [
  { text: "Technology changes faster than organizations.", tone: "muted" },
  { text: "Organizations become anxious.", tone: "muted" },
  { text: "Anxious organizations make poor decisions.", tone: "muted" },
  { text: "Cykoai creates clarity.", tone: "accent" },
] as const;

/**
 * Philosophy (interim, P0): the pinned line scrub kept, restyled flat —
 * Windsor band, white/n300 lines, driftwood underline on the last line,
 * transforms+opacity only (§1). P6 adds the rings interstitial, the
 * drawn underline, and the AM-1 monolith texture.
 */
export default function Philosophy() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(lines, { opacity: 0, y: 40 });
        gsap.set(lines[0], { opacity: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "+=300%",
            scrub: 0.6,
            pin: true,
          },
        });

        lines.forEach((line, i) => {
          if (i === 0) return;
          const prev = lines[i - 1];
          tl.to(prev, { opacity: 0, y: -40, duration: 0.6 }, i).to(
            line,
            { opacity: 1, y: 0, duration: 0.6 },
            i - 0.15
          );
        });

        tl.to({}, { duration: 0.6 });
      });

      // Reduced motion: no pin, all four lines stacked and static.
      mm.add("(prefers-reduced-motion: reduce)", () => {});

      return () => mm.revert();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="philosophy"
      ref={wrapperRef}
      className="relative overflow-hidden bg-windsor text-white motion-safe:h-screen"
    >
      <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-center px-[clamp(20px,4vw,56px)] motion-reduce:py-24">
        <div className="motion-safe:absolute motion-safe:left-[clamp(20px,4vw,56px)] motion-safe:top-16">
          <SectionLabel index="05" tone="inverse">
            Our philosophy
          </SectionLabel>
        </div>

        <div className="relative mt-10 flex items-center justify-center text-center motion-safe:mt-0 motion-safe:h-[240px] md:motion-safe:h-[200px]">
          {LINES.map((line, i) => (
            <div
              key={line.text}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="mx-auto max-w-4xl motion-safe:absolute motion-safe:inset-x-0 motion-reduce:py-4"
            >
              {line.tone === "accent" ? (
                <p className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                  <span className="border-b-2 border-driftwood pb-1">
                    {line.text}
                  </span>
                </p>
              ) : (
                <p className="font-display text-[clamp(1.6rem,3.6vw,2.9rem)] font-medium leading-[1.15] tracking-[-0.02em] text-n300">
                  {line.text}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
