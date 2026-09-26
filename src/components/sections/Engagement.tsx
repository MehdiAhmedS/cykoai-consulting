"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import MonoLabel from "@/components/ui/MonoLabel";
import GenImage from "@/components/ui/GenImage";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { label, heading, intro, steps } = site.engagement;

/**
 * Engagement (v3 step 01, was Process): the horizontal pin kept, cards
 * flat — white, 1px hairline, 4px radius, driftwood progress rule.
 * The row layout applies only where the pin runs (≥900px, motion
 * allowed); everywhere else the cards stack, so every step stays readable.
 */
export default function Engagement() {
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
      id="engagement"
      ref={sectionRef}
      data-tone="light"
      className="relative overflow-hidden bg-white py-24 motion-safe:min-[900px]:h-screen motion-safe:min-[900px]:py-0"
    >
      {/* AM-6 contour field — barely-there texture, ≤15% */}
      <GenImage
        src="/assets/gen/am6-topo-diagonal.png"
        fill
        sizes="100vw"
        className="absolute inset-0 opacity-[0.08]"
      />

      <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-center px-[clamp(20px,4vw,56px)]">
        <div className="mb-14 flex items-end justify-between gap-8">
          <div>
            <MonoLabel tick>
              {label.text}
              <DraftMark status={label.status} />
            </MonoLabel>
            <h2 className="mt-6 max-w-2xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
              {heading.text}
              <DraftMark status={heading.status} />
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-[1.65] text-n500">
              {intro.text}
              <DraftMark status={intro.status} />
            </p>
          </div>
          <div className="mb-2 hidden h-px w-40 shrink-0 overflow-hidden bg-n150 motion-safe:min-[900px]:block">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-driftwood"
            />
          </div>
        </div>

        <div ref={trackRef} className="flex flex-col gap-6 motion-safe:min-[900px]:w-max motion-safe:min-[900px]:flex-row">
          {steps.map((step) => (
            <div
              key={step.title}
              className="relative flex w-full shrink-0 flex-col justify-end rounded-sm border border-n150 bg-white p-9 motion-safe:min-[900px]:h-[420px] motion-safe:min-[900px]:w-[380px]"
            >
              <h3 className="font-display text-[1.6rem] font-semibold tracking-tight text-windsor">
                {step.title}
                <DraftMark status={step.status} />
              </h3>
              <p className="mt-3 text-[0.95rem] leading-[1.65] text-n500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
