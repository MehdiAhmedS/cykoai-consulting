"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import AbstractGlyph, { type GlyphVariant } from "@/components/ui/AbstractGlyph";

const BENEFITS: {
  variant: GlyphVariant;
  title: string;
  description: string;
}[] = [
  {
    variant: "network",
    title: "Fluent in both worlds",
    description:
      "Our people have shipped production AI systems and defended enterprise networks. We translate between the technical and the boardroom without losing precision on either side.",
  },
  {
    variant: "weave",
    title: "Built to survive scrutiny",
    description:
      "Every recommendation is stress-tested against security, governance, and regulatory reality — so what we build together holds up in an audit, not just in a demo.",
  },
  {
    variant: "pulse",
    title: "Skin in the game",
    description:
      "We stay through implementation. Forward deployed means our teams sit inside yours, accountable for outcomes — not a slide deck handed off at the door.",
  },
  {
    variant: "orbit",
    title: "Speed without recklessness",
    description:
      "Momentum matters, but so does control. We move quickly toward decisions that are reversible, and carefully toward the ones that aren't.",
  },
];

export default function WhyCykoai() {
  return (
    <section className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="04">Why Cykoai</SectionLabel>
        </Reveal>
        <h2 className="mt-8 max-w-3xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-[clamp(2.25rem,4.5vw,3.75rem)]">
          <SplitText className="text-ink">
            Confidence is earned by people who&rsquo;ve done the work before.
          </SplitText>
        </h2>

        <div className="mt-24 flex flex-col divide-y divide-border">
          {BENEFITS.map((benefit, i) => (
            <Reveal key={benefit.title} delay={0.05}>
              <div
                className={`flex flex-col items-center gap-10 py-14 md:gap-16 md:py-20 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                <div className="flex w-full max-w-[220px] shrink-0 justify-center">
                  <AbstractGlyph variant={benefit.variant} className="h-44 w-44" />
                </div>
                <div className="max-w-2xl">
                  <span className="font-mono text-[0.75rem] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-[1.6rem] font-medium tracking-tight text-ink md:text-[2rem]">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 text-[1rem] leading-relaxed text-ink-muted">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
