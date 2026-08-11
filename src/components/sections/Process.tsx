"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionLabel from "@/components/ui/SectionLabel";
import AbstractGlyph, { type GlyphVariant } from "@/components/ui/AbstractGlyph";

const STEPS: {
  index: string;
  title: string;
  description: string;
  variant: GlyphVariant;
}[] = [
  {
    index: "01",
    title: "Assess",
    description:
      "We map where your organization actually stands — technically, operationally, and culturally — against where you intend to go.",
    variant: "network",
  },
  {
    index: "02",
    title: "Align",
    description:
      "Strategy and business case, built together with the executives who'll be accountable for the outcome.",
    variant: "orbit",
  },
  {
    index: "03",
    title: "Design",
    description:
      "Architecture with security, governance, and scale considered from the first sketch — not bolted on afterward.",
    variant: "grid",
  },
  {
    index: "04",
    title: "Deploy",
    description:
      "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it.",
    variant: "flow",
  },
  {
    index: "05",
    title: "Sustain",
    description:
      "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends.",
    variant: "pulse",
  },
];

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
    <section id="process" ref={sectionRef} className="relative overflow-hidden bg-charcoal py-32 md:h-screen md:py-0">
      <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-10">
        <div className="mb-14 flex items-end justify-between gap-8">
          <SectionLabel index="05">How we work</SectionLabel>
          <div className="hidden h-px w-40 overflow-hidden bg-border md:block">
            <div
              ref={progressRef}
              className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-gold-light via-gold to-gold-deep"
            />
          </div>
        </div>

        <div
          ref={trackRef}
          className="flex flex-col gap-6 md:w-max md:flex-row md:gap-6"
        >
          {STEPS.map((step) => (
            <div
              key={step.index}
              className="relative flex w-full shrink-0 flex-col justify-between rounded-3xl border border-border bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-9 md:h-[420px] md:w-[380px]"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[0.8rem] text-ink-faint">
                  {step.index}
                </span>
                <AbstractGlyph variant={step.variant} className="h-16 w-16" />
              </div>
              <div>
                <h3 className="font-display text-[1.6rem] font-medium tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
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
