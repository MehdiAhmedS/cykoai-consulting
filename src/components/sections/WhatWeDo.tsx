import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import GenImage from "@/components/ui/GenImage";

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
 * What we do — editorial split (board §05/02): sticky statement left,
 * four hairline rows right, AM-6 topo contours under the rows at ≤15%
 * opacity. No cards, no icons. Complete without the asset (fallback law).
 */
export default function WhatWeDo() {
  return (
    <section id="what-we-do" className="relative bg-white py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-[clamp(40px,5vw,88px)] px-[clamp(20px,4vw,56px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <MonoLabel index="01">What we do</MonoLabel>
          </Reveal>
          <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
            <SplitText>
              One firm across the full stack of technological change.
            </SplitText>
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-[46ch] text-[1.05rem] leading-[1.7] text-n500">
              Most firms specialize in a single layer — a model, a network, an
              audit. We operate across all of them at once, because in
              practice they are never separate problems.{" "}
              <strong className="font-semibold text-windsor">
                Adoption fails at the seams.
              </strong>
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {/* AM-6 topo-diagonal field — barely-there texture under the rows */}
          <GenImage
            src="/assets/gen/am6-topo-diagonal.png"
            fill
            sizes="(min-width: 1024px) 660px, 100vw"
            className="absolute -inset-x-6 -inset-y-8 opacity-[0.13]"
          />

          <ul className="relative">
            {PILLARS.map((pillar, i) => (
              <li
                key={pillar.title}
                tabIndex={0}
                className="group border-t border-n150 py-8 pl-4 transition-colors duration-300 ease-out-expo last:border-b hover:border-t-driftwood focus-visible:border-t-driftwood"
              >
                <Reveal delay={i * 0.06}>
                  <h3 className="font-display text-[1.35rem] font-semibold tracking-tight text-windsor transition-transform duration-300 ease-out-expo group-hover:translate-x-1 group-focus-visible:translate-x-1">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-[52ch] text-[0.98rem] leading-[1.7] text-n500">
                    {pillar.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
