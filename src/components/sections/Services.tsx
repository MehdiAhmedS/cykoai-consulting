"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import AbstractGlyph, { type GlyphVariant } from "@/components/ui/AbstractGlyph";

const SERVICES: {
  index: string;
  title: string;
  description: string;
  variant: GlyphVariant;
  glow: string;
}[] = [
  {
    index: "01",
    title: "AI Strategy",
    description: "From possibility to roadmap — where AI creates defensible advantage for your business, and where it doesn't.",
    variant: "network",
    glow: "rgba(173,135,82,0.2)",
  },
  {
    index: "02",
    title: "Cybersecurity",
    description: "Defend the surface area you're creating. Security designed alongside adoption, never bolted on afterward.",
    variant: "field",
    glow: "rgba(145,47,64,0.2)",
  },
  {
    index: "03",
    title: "Enterprise AI",
    description: "Production-grade intelligence systems — evaluated, monitored, and owned by your teams, not a vendor.",
    variant: "pulse",
    glow: "rgba(212,180,131,0.2)",
  },
  {
    index: "04",
    title: "Automation",
    description: "Remove friction at scale. Automation programs that compound, freeing your best people for higher judgment work.",
    variant: "flow",
    glow: "rgba(212,180,131,0.2)",
  },
  {
    index: "05",
    title: "Digital Transformation",
    description: "Modernize without breaking what already works. Sequenced change your organization can actually absorb.",
    variant: "ascend",
    glow: "rgba(173,135,82,0.2)",
  },
  {
    index: "06",
    title: "Enterprise Architecture",
    description: "Structure built for change, not just for today. Systems that stay coherent as they scale.",
    variant: "grid",
    glow: "rgba(173,135,82,0.2)",
  },
  {
    index: "07",
    title: "Technology Advisory",
    description: "An outside perspective your board can trust — clear-eyed, independent, and fluent in what's actually happening in the field.",
    variant: "orbit",
    glow: "rgba(139,107,61,0.2)",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-32 md:py-44">
      <div className="ambient-glow left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 bg-gold/[0.08]" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <SectionLabel index="02">Services</SectionLabel>
            </Reveal>
            <h2 className="mt-8 max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-[clamp(2.25rem,4.5vw,3.75rem)]">
              <SplitText className="text-ink">
                Seven disciplines. One point of accountability.
              </SplitText>
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink-muted">
              Engage us for one discipline or all seven — every engagement is
              staffed by people who&rsquo;ve shipped the thing, not just
              advised on it.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 3) * 0.08}>
              <TiltCard glowColor={service.glow} className="h-full min-h-[300px]">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[0.75rem] text-ink-faint">
                    {service.index}
                  </span>
                  <AbstractGlyph variant={service.variant} className="h-14 w-14" />
                </div>
                <h3 className="mt-10 font-display text-[1.3rem] font-medium tracking-tight text-ink">
                  {service.title}
                </h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-muted">
                  {service.description}
                </p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
