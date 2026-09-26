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
      className="relative flex min-h-[calc(100svh-64px)] w-full items-center overflow-hidden bg-windsor text-white"
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
        <div className="inline-flex items-center gap-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-n300">
          <span aria-hidden className="h-px w-7 bg-driftwood" />
          {eyebrow.text}
          <DraftMark status={eyebrow.status} className="ml-0" />
        </div>

        <h1
          data-speed="0.97"
          className="mt-7 max-w-[15ch] font-display text-[clamp(2.9rem,6.2vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
        >
          {headline.text}{" "}
          <span className="text-n500">{headline.dim}</span>
        </h1>

        <p className="mt-7 max-w-[42ch] text-[1.1rem] leading-[1.7] text-n300">
          {lede.text}
          <DraftMark status={lede.status} />
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-7">
          <Button href={primaryCta.href} variant="inverse">
            {primaryCta.label}
          </Button>
          <a
            href={secondaryCta.href}
            className="border-b border-driftwood pb-[3px] text-[15px] font-medium text-white transition-colors duration-250 ease-out-expo hover:text-driftwood"
          >
            {secondaryCta.label}
          </a>
          <DraftMark status={secondaryCta.status} className="-ml-5" />
        </div>
      </div>

      {/* mono caption — instrumentation voice, bottom right */}
      <div className="absolute bottom-24 right-[clamp(20px,4vw,56px)] text-right font-mono text-[10px] uppercase leading-loose tracking-[0.22em] text-n300 max-[899px]:hidden">
        {caption.origin} ·{" "}
        <span className="text-driftwood">{caption.coordinates}</span>
      </div>
    </section>
  );
}
