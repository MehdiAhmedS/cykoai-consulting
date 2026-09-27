import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import DraftMark from "@/components/ui/DraftMark";
import OffersList from "@/components/offers/OffersList";
import { site } from "@/content/site";

const { label, heading, intro, fields, items } = site.offers;

/**
 * Offers (v3 step 06): the six named engagements, in practice order, as rows
 * that open on scroll, each with a small three.js piece of that kind of work
 * (a still image on phones and under reduced motion). No numbers.
 */
export default function Offers() {
  return (
    <section id="offers" data-tone="light" className="relative bg-white py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <Reveal>
          <MonoLabel tick>
            {label.text}
            <DraftMark status={label.status} />
          </MonoLabel>
        </Reveal>
        <h2 className="type-h2 mt-8 max-w-[22ch] text-windsor">
          <SplitText>{heading.text}</SplitText>
          <DraftMark status={heading.status} />
        </h2>
        <Reveal delay={0.1}>
          <p className="type-lead mt-5 max-w-[60ch] text-n700">
            {intro.text}
            <DraftMark status={intro.status} />
          </p>
        </Reveal>
        <OffersList items={items} labels={{ for: fields.for, youGet: fields.youGet, status: fields.status }} />
      </div>
    </section>
  );
}
