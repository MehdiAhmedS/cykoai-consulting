"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import AbstractGlyph, { type GlyphVariant } from "@/components/ui/AbstractGlyph";

const PILLARS: {
  variant: GlyphVariant;
  title: string;
  description: string;
  glow: string;
}[] = [
  {
    variant: "network",
    title: "Intelligence systems",
    description:
      "AI strategy and enterprise AI built on real workflows — not demos. We design systems that hold up under production load and scrutiny.",
    glow: "rgba(173,135,82,0.2)",
  },
  {
    variant: "field",
    title: "Security & resilience",
    description:
      "Cybersecurity woven into architecture from day one, so adoption never outpaces your ability to defend what you've built.",
    glow: "rgba(139,107,61,0.2)",
  },
  {
    variant: "grid",
    title: "Architecture & strategy",
    description:
      "Enterprise architecture and technology strategy that turn ambition into a sequence of decisions your teams can actually execute.",
    glow: "rgba(173,135,82,0.2)",
  },
  {
    variant: "flow",
    title: "Velocity & automation",
    description:
      "Automation, productivity, and digital transformation programs that compound — each one making the next easier to ship.",
    glow: "rgba(212,180,131,0.2)",
  },
];

export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="01">What we do</SectionLabel>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <h2 className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-[clamp(2.25rem,4.5vw,3.75rem)]">
            <SplitText className="text-ink">
              One firm across the full stack of technological change.
            </SplitText>
          </h2>
          <Reveal delay={0.15} className="flex items-end">
            <p className="text-[1.05rem] leading-relaxed text-ink-muted">
              Most firms specialize in a single layer — a model, a network, an
              audit. We operate across all of them at once, because in
              practice they are never separate problems. Adoption fails at
              the seams.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <TiltCard glowColor={pillar.glow} className="h-full">
                <AbstractGlyph variant={pillar.variant} className="mb-8 h-20 w-20" />
                <h3 className="font-display text-[1.35rem] font-medium tracking-tight text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted">
                  {pillar.description}
                </p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
