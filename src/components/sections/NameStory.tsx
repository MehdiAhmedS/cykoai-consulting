import MonoLabel from "@/components/ui/MonoLabel";
import Reveal from "@/components/ui/Reveal";
import RingField from "@/components/ui/RingField";

const CELLS = [
  {
    syllable: "cy",
    dot: true,
    body: "From cyber-security. Defense is never bolted on — it is where every engagement begins.",
  },
  {
    syllable: "ko",
    dot: true,
    body: "The sound of the koi and the heart of the sequoia — agility against constant flux, resilience against the test of time.",
  },
  {
    syllable: "ai",
    dot: false,
    body: "Applied intelligence — deployed inside your organization, owned by your teams.",
  },
];

/**
 * The name story (mockup C's band): cy · ko · ai split across three
 * columns on the Windsor field, a drawn ring echo drifting behind at
 * 0.88 — the rings carry this band alone (the ring-disc cutout was cut).
 */
export default function NameStory() {
  return (
    <section
      id="name"
      data-band-fade="#F9F9FA"
      className="relative overflow-hidden bg-windsor text-white"
    >
      <div
        data-speed="0.88"
        className="pointer-events-none absolute -bottom-[55%] -left-[18%] aspect-square w-[52vw] max-w-[700px] will-change-transform"
      >
        <RingField count={3} accentIndex={2} tone="inverse" className="inset-0" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(88px,14vh,150px)]">
        <Reveal>
          <MonoLabel index="04" tone="inverse">
            The name is the operating model
          </MonoLabel>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 border-t border-white/14 min-[900px]:grid-cols-3">
          {CELLS.map((cell, i) => (
            <Reveal key={cell.syllable} delay={i * 0.09}>
              <div
                className={`h-full pb-1.5 pt-7 ${
                  i > 0
                    ? "border-t border-white/14 min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:pl-6"
                    : ""
                } ${i < CELLS.length - 1 ? "min-[900px]:pr-6" : ""}`}
              >
                <div className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold tracking-[-0.02em]">
                  {cell.syllable}
                  {cell.dot && <span className="text-driftwood">·</span>}
                </div>
                <p className="mt-3.5 max-w-[30ch] text-[0.95rem] leading-[1.65] text-n300">
                  {cell.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
