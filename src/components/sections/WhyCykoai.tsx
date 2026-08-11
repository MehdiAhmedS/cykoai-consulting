import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";

const BENEFITS = [
  {
    title: "Fluent in both worlds",
    description:
      "Our people have shipped production AI systems and defended enterprise networks. We translate between the technical and the boardroom without losing precision on either side.",
  },
  {
    title: "Built to survive scrutiny",
    description:
      "Every recommendation is stress-tested against security, governance, and regulatory reality — so what we build together holds up in an audit, not just in a demo.",
  },
  {
    title: "Skin in the game",
    description:
      "We stay through implementation. Forward deployed means our teams sit inside yours, accountable for outcomes — not a slide deck handed off at the door.",
  },
  {
    title: "Speed without recklessness",
    description:
      "Momentum matters, but so does control. We move quickly toward decisions that are reversible, and carefully toward the ones that aren't.",
  },
];

/**
 * Why Cykoai (interim, P0): blunt claims as flat rows — glyphs gone.
 * P4 adds the EngagementNote + StatStrip artifact column and AM-5.
 */
export default function WhyCykoai() {
  return (
    <section id="why" className="relative bg-n50 py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <Reveal>
          <SectionLabel index="03">Why Cykoai</SectionLabel>
        </Reveal>
        <h2 className="mt-8 max-w-3xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
          <SplitText>
            Confidence is earned by people who&rsquo;ve done the work before.
          </SplitText>
        </h2>

        <div className="mt-16 flex flex-col border-t border-n150">
          {BENEFITS.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 0.05}>
              <div className="grid grid-cols-[48px_1fr] items-baseline gap-4 border-b border-n150 py-10 md:grid-cols-[64px_320px_1fr] md:gap-8">
                <span className="font-mono text-[11px] tracking-[0.1em] text-driftwood-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[1.5rem] font-semibold tracking-tight text-windsor">
                  {benefit.title}
                </h3>
                <p className="col-span-2 max-w-[52ch] text-[1rem] leading-[1.7] text-n500 md:col-span-1">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
