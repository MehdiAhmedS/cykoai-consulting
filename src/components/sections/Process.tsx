"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionLabel from "@/components/ui/SectionLabel";

const STEPS = [
  {
    index: "01",
    title: "Assess",
    description:
      "We map where your organization actually stands — technically, operationally, and culturally — against where you intend to go.",
  },
  {
    index: "02",
    title: "Align",
    description:
      "Strategy and business case, built together with the executives who'll be accountable for the outcome.",
  },
  {
    index: "03",
    title: "Design",
    description:
      "Architecture with security, governance, and scale considered from the first sketch — not bolted on afterward.",
  },
  {
    index: "04",
    title: "Deploy",
    description:
      "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it.",
  },
  {
    index: "05",
    title: "Sustain",
    description:
      "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends.",
  },
];

/**
 * Process (interim, P0): horizontal pin kept, cards restyled flat —
 * white, 1px hairline, 4px radius, mono numbers, driftwood progress
 * rule. P7 tunes the release point, background field, and recalc.
 */
export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const distance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }
            },
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative overflow-hidden bg-n50 py-24 md:h-screen md:py-0"
    >
      <div className="mx-auto flex h-full max-w-[1320px] flex-col justify-center px-[clamp(20px,4vw,56px)]">
        <div className="mb-14 flex items-end justify-between gap-8">
          <SectionLabel index="06">How we work</SectionLabel>
          <div className="hidden h-px w-40 overflow-hidden bg-n150 md:block">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-driftwood"
            />
          </div>
        </div>

        <div ref={trackRef} className="flex flex-col gap-6 md:w-max md:flex-row">
          {STEPS.map((step) => (
            <div
              key={step.index}
              className="relative flex w-full shrink-0 flex-col justify-between rounded-sm border border-n150 bg-white p-9 md:h-[420px] md:w-[380px]"
            >
              <span className="font-mono text-[11px] tracking-[0.1em] text-driftwood-deep">
                {step.index}
              </span>
              <div>
                <h3 className="font-display text-[1.6rem] font-semibold tracking-tight text-windsor">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-[1.65] text-n500">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
