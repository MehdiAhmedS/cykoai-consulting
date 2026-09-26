import Button from "@/components/ui/Button";
import WorldCanvas from "@/components/ui/WorldCanvas";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { eyebrow, headline, lede, caption, primaryCta, secondaryCta } = site.hero;

/**
 * Hero — Direction D "The World" (mockup: hero-direction-d-world.html).
 * Editorial left column over the Windsor band; the Canvas 2D dot-globe
 * crops at the right edge and drifts at 0.93, headline at 0.97. Mobile
 * (<900px): globe centered behind the text at 40% opacity, caption
 * hidden. The section reads completely with the canvas removed.
 */
export default function Hero() {
  return (
    <section
      id="top"
      data-tone="dark"
      className="relative flex min-h-svh w-full items-center overflow-hidden bg-windsor pt-[60px] text-white min-[900px]:pt-[68px]"
    >
      {/* globe — decorative, parallax on the inner wrapper */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 aspect-square -translate-y-1/2 min-[900px]:right-[max(-13vw,-250px)] min-[900px]:w-[min(90vh,58vw)] max-[899px]:right-1/2 max-[899px]:w-[130vw] max-[899px]:translate-x-1/2 max-[899px]:opacity-40"
      >
        <div data-speed="0.93" className="h-full w-full will-change-transform">
          <WorldCanvas />
        </div>
      </div>

      <div className="relative z-[2] mx-auto w-full max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(72px,10vh,130px)]">
        <div className="type-label inline-flex items-center gap-3.5 text-n300">
          <span aria-hidden className="h-px w-7 bg-driftwood" />
          {eyebrow.text}
          <DraftMark status={eyebrow.status} className="ml-0" />
        </div>

        <h1
          data-speed="0.97"
          className="type-hero mt-7 max-w-[15ch]"
        >
          {headline.text}{" "}
          <span className="whitespace-nowrap text-n500">{headline.dim}</span>
        </h1>

        <p className="type-lead mt-7 max-w-[42ch] text-n300">
          {lede.text}
          <DraftMark status={lede.status} />
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-7">
          <Button href={primaryCta.href} variant="inverse">
            {primaryCta.label}
          </Button>
          <a
            href={secondaryCta.href}
            className="type-small border-b border-driftwood pb-[3px] font-medium text-white transition-colors duration-250 ease-out-expo hover:text-driftwood"
          >
            {secondaryCta.label}
          </a>
          <DraftMark status={secondaryCta.status} className="-ml-5" />
        </div>
      </div>

      {/* mono caption — instrumentation voice, bottom right */}
      <div className="absolute bottom-24 right-[clamp(20px,4vw,56px)] flex items-baseline gap-2 text-right text-n300 max-[899px]:hidden">
        <span className="type-label">{caption.origin} ·</span>
        <span className="type-data text-driftwood">{caption.coordinates}</span>
      </div>
    </section>
  );
}
