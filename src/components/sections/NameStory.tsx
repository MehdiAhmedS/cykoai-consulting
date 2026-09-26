import MonoLabel from "@/components/ui/MonoLabel";
import Reveal from "@/components/ui/Reveal";
import RingField from "@/components/ui/RingField";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { label, word, pronunciation, parts, closing } = site.name;

/**
 * The name (mockup C's band): the word and how it's said, cy · ko · ai
 * split across three columns on the Windsor field, then the closing
 * line. A drawn ring echo drifts behind at 0.88.
 */
export default function TheName() {
  return (
    <section
      id="name"
      data-tone="dark"
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
          <MonoLabel tick tone="inverse">
            {label.text}
            <DraftMark status={label.status} />
          </MonoLabel>
        </Reveal>

        <Reveal delay={0.06}>
          <p className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="type-h2">
              {word.text}
            </span>
            <span className="type-data text-n300">
              {pronunciation.text}
            </span>
          </p>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 border-t border-white/14 min-[900px]:grid-cols-3">
          {parts.map((part, i) => (
            <Reveal key={part.syllable} delay={i * 0.09}>
              <div
                className={`h-full pb-1.5 pt-7 ${
                  i > 0
                    ? "border-t border-white/14 min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:pl-6"
                    : ""
                } ${i < parts.length - 1 ? "min-[900px]:pr-6" : ""}`}
              >
                <div className="type-h2">
                  {part.syllable}
                  {i < parts.length - 1 && <span className="text-driftwood">·</span>}
                  <DraftMark status={part.status} />
                </div>
                <p className="type-small mt-3.5 max-w-[30ch] text-n300">
                  {part.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="type-h2 mt-16 text-white">
            {closing.text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
