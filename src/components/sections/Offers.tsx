import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import IndexRow from "@/components/ui/IndexRow";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { label, heading, intro, fields, items } = site.offers;

/**
 * Offers (v3 step 01): the named engagements as expandable rows, on the
 * Services heading pattern. Each row carries its practice as a mono tag;
 * opening it shows who it's for and what you get.
 */
export default function Offers() {
  return (
    <section
      id="offers"
      data-tone="light"
      className="relative bg-white py-[clamp(88px,14vh,150px)]"
    >
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <MonoLabel tick>
                {label.text}
                <DraftMark status={label.status} />
              </MonoLabel>
            </Reveal>
            <h2 className="mt-8 max-w-2xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
              <SplitText>{heading.text}</SplitText>
              <DraftMark status={heading.status} />
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[0.95rem] leading-[1.65] text-n500">
              {intro.text}
              <DraftMark status={intro.status} />
            </p>
          </Reveal>
        </div>

        <div className="mt-16 border-b border-n150">
          {items.map((offer, i) => (
            <Reveal key={offer.id} delay={Math.min(i * 0.04, 0.2)}>
              <IndexRow
                title={
                  <>
                    {offer.name}
                    <DraftMark status={offer.status} />
                  </>
                }
                meta={offer.practice}
              >
                <dl className="grid max-w-[64ch] grid-cols-[88px_1fr] gap-x-6 gap-y-3 text-[0.98rem] leading-[1.7] md:grid-cols-[112px_1fr]">
                  <dt className="pt-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-n500">
                    {fields.for}
                  </dt>
                  <dd className="text-n700">{offer.for}</dd>
                  <dt className="pt-[5px] font-mono text-[11px] uppercase tracking-[0.1em] text-n500">
                    {fields.youGet}
                    {i === 0 && <DraftMark status={fields.status} className="ml-1" />}
                  </dt>
                  <dd className="text-n700">{offer.youGet}</dd>
                </dl>
              </IndexRow>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
