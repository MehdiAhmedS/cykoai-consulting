import MonoLabel from "@/components/ui/MonoLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";
import IndexRow from "@/components/ui/IndexRow";

const SERVICES = [
  {
    index: "01",
    title: "AI Strategy",
    description:
      "From possibility to roadmap — where AI creates defensible advantage for your business, and where it doesn't.",
  },
  {
    index: "02",
    title: "Cybersecurity",
    description:
      "Defend the surface area you're creating. Security designed alongside adoption, never bolted on afterward.",
  },
  {
    index: "03",
    title: "Enterprise AI",
    description:
      "Production-grade intelligence systems — evaluated, monitored, and owned by your teams, not a vendor.",
  },
  {
    index: "04",
    title: "Automation",
    description:
      "Remove friction at scale. Automation programs that compound, freeing your best people for higher judgment work.",
  },
  {
    index: "05",
    title: "Digital Transformation",
    description:
      "Modernize without breaking what already works. Sequenced change your organization can actually absorb.",
  },
  {
    index: "06",
    title: "Enterprise Architecture",
    description:
      "Structure built for change, not just for today. Systems that stay coherent as they scale.",
  },
  {
    index: "07",
    title: "Technology Advisory",
    description:
      "An outside perspective your board can trust — clear-eyed, independent, and fluent in what's actually happening in the field.",
  },
];

/**
 * Services — the numbered index (board §05/03): seven disciplines as a
 * table of contents. Each row expands its one-liner on click/Enter.
 */
export default function Services() {
  return (
    <section id="services" className="relative bg-white py-[clamp(88px,14vh,150px)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)]">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal>
              <MonoLabel index="02">Services</MonoLabel>
            </Reveal>
            <h2 className="mt-8 max-w-2xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-windsor">
              <SplitText>
                Seven disciplines. One point of accountability.
              </SplitText>
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[0.95rem] leading-[1.65] text-n500">
              Engage us for one discipline or all seven — every engagement is
              staffed by people who&rsquo;ve shipped the thing, not just
              advised on it.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 border-b border-n150">
          {SERVICES.map((service, i) => (
            <Reveal key={service.index} delay={Math.min(i * 0.04, 0.2)}>
              <IndexRow index={service.index} title={service.title}>
                {service.description}
              </IndexRow>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
