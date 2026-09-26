import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import GenImage from "@/components/ui/GenImage";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { label, heading, intro, rules, frameworks } = site.standards;

/**
 * Standards (v3 step 01, was Why Cykoai): the rules Cykoai keeps on the
 * left, the frameworks it works to as a mono list on the right. AM-5
 * monogram-cube sits under the list at 0.88. Complete without the
 * asset (fallback law).
 */
export default function Standards() {
  return (
    <section
      id="standards"
      data-tone="light"
      className="relative overflow-hidden bg-n50 py-[clamp(88px,14vh,150px)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-[clamp(48px,5vw,88px)] px-[clamp(20px,4vw,56px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <Reveal>
            <MonoLabel tick>
              {label.text}
              <DraftMark status={label.status} />
            </MonoLabel>
          </Reveal>
          <h2 className="type-h2 mt-5 max-w-[20ch] text-windsor">
            <SplitText>{heading.text}</SplitText>
            <DraftMark status={heading.status} />
          </h2>
          <Reveal delay={0.1}>
            <p className="type-body mt-6 max-w-[46ch] text-n500">
              {intro.text}
              <DraftMark status={intro.status} />
            </p>
          </Reveal>

          <div className="mt-12 flex flex-col">
            {rules.map((rule, i) => (
              <Reveal key={rule.title} delay={i * 0.05}>
                <div className="border-t border-n150 py-7">
                  <h3 className="type-h3 text-windsor">
                    {rule.title}
                    <DraftMark status={rule.status} />
                  </h3>
                  <p className="type-small mt-2.5 max-w-[52ch] text-n500">
                    {rule.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="relative lg:pt-24">
          <Reveal delay={0.12}>
            <ul className="border-b border-n150">
              {frameworks.items.map((framework, i) => (
                <li
                  key={framework}
                  className="type-label border-t border-n150 py-4 text-windsor"
                >
                  {framework}
                  {i === 0 && <DraftMark status={frameworks.status} />}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* AM-5 — the mark made physical, under the frameworks list */}
          <div
            data-speed="0.88"
            className="pointer-events-none relative mt-16 ml-auto w-[min(320px,70%)] will-change-transform max-lg:hidden"
          >
            <GenImage
              src="/assets/gen/am5-monogram-cube.png"
              width={1024}
              height={1024}
              sizes="320px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
