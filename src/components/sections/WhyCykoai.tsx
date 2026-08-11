import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import EngagementNote from "@/components/ui/EngagementNote";
import StatStrip from "@/components/ui/StatStrip";
import GenImage from "@/components/ui/GenImage";

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
 * Why Cykoai — proof over pitch (board §05/04): blunt claims left,
 * artifacts right (illustrative engagement note over the stat strip),
 * AM-5 monogram-cube cutout drifting behind the artifact column at
 * 0.88. Complete without the asset (fallback law).
 */
export default function WhyCykoai() {
  return (
    <section id="why" className="relative overflow-hidden bg-n50 py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-[clamp(48px,5vw,88px)] px-[clamp(20px,4vw,56px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <Reveal>
            <MonoLabel index="03">Why Cykoai</MonoLabel>
          </Reveal>
          <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
            <SplitText>
              Confidence is earned by people who&rsquo;ve done the work
              before.
            </SplitText>
          </h2>

          <div className="mt-12 flex flex-col">
            {BENEFITS.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 0.05}>
                <div className="border-t border-n150 py-7">
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-[11px] tracking-[0.1em] text-driftwood-deep">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.3rem] font-semibold tracking-tight text-windsor">
                        {benefit.title}
                      </h3>
                      <p className="mt-2.5 max-w-[52ch] text-[0.95rem] leading-[1.65] text-n500">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative lg:pt-24">
          {/* AM-5 — the mark made physical, drifting between type planes */}
          <div
            data-speed="0.88"
            className="pointer-events-none absolute -top-8 right-[-72px] w-[min(360px,60%)] will-change-transform max-lg:hidden"
          >
            <GenImage
              src="/assets/gen/am5-monogram-cube.png"
              width={1024}
              height={1024}
              sizes="360px"
            />
          </div>

          <Reveal delay={0.12}>
            <EngagementNote className="relative" />
          </Reveal>
          <Reveal delay={0.2}>
            <StatStrip className="relative mt-10" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
