import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";

const PILLARS = [
  {
    title: "Intelligence systems",
    description:
      "AI strategy and enterprise AI built on real workflows — not demos. We design systems that hold up under production load and scrutiny.",
  },
  {
    title: "Security & resilience",
    description:
      "Cybersecurity woven into architecture from day one, so adoption never outpaces your ability to defend what you've built.",
  },
  {
    title: "Architecture & strategy",
    description:
      "Enterprise architecture and technology strategy that turn ambition into a sequence of decisions your teams can actually execute.",
  },
  {
    title: "Velocity & automation",
    description:
      "Automation, productivity, and digital transformation programs that compound — each one making the next easier to ship.",
  },
];

/**
 * What we do (interim, P0): flat hairline rows, no cards, no icons.
 * P2 adds the sticky editorial split and the AM-6 topo field.
 */
export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="relative bg-white py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <Reveal>
          <SectionLabel index="01">What we do</SectionLabel>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <h2 className="max-w-[22ch] font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
            <SplitText>
              One firm across the full stack of technological change.
            </SplitText>
          </h2>
          <Reveal delay={0.15} className="flex items-end">
            <p className="max-w-[52ch] text-[1.05rem] leading-[1.7] text-n500">
              Most firms specialize in a single layer — a model, a network, an
              audit. We operate across all of them at once, because in
              practice they are never separate problems.{" "}
              <strong className="font-semibold text-windsor">
                Adoption fails at the seams.
              </strong>
            </p>
          </Reveal>
        </div>

        <div className="mt-20 flex flex-col border-t border-n150">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.06}>
              <div className="grid grid-cols-1 gap-3 border-b border-n150 py-9 md:grid-cols-[220px_1fr] md:gap-10">
                <h3 className="font-display text-[1.35rem] font-semibold tracking-tight text-windsor">
                  {pillar.title}
                </h3>
                <p className="max-w-[52ch] text-[0.98rem] leading-[1.7] text-n500">
                  {pillar.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
