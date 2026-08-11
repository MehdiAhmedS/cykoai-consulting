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

export default function Philosophy() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(lines, { opacity: 0, y: 40, filter: "blur(6px)" });
        gsap.set(lines[0], { opacity: 1, y: 0, filter: "blur(0px)" });

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
          tl.to(prev, { opacity: 0, y: -40, filter: "blur(6px)", duration: 0.6 }, i)
            .to(line, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 }, i - 0.15);
        });

        tl.to({}, { duration: 0.6 });
      });

      return () => mm.revert();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="philosophy" ref={wrapperRef} className="relative h-screen overflow-hidden bg-charcoal">
      <div className="ambient-glow left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-gold/[0.08]" />

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-10">
        <div className="absolute left-6 top-16 md:left-10">
          <SectionLabel index="03">Our philosophy</SectionLabel>
        </div>

        <div className="relative flex h-[240px] items-center justify-center text-center md:h-[200px]">
          {LINES.map((line, i) => (
            <div
              key={line.text}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="absolute inset-x-0 mx-auto max-w-4xl"
            >
              <p
                className={
                  line.tone === "accent"
                    ? "font-display text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-gradient-accent"
                    : "font-display text-[clamp(1.75rem,4vw,3.25rem)] font-medium leading-[1.15] tracking-[-0.02em] text-ink-muted"
                }
              >
                {line.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
