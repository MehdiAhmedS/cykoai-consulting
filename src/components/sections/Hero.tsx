import HeroGlobe from "@/components/ui/HeroGlobe";
import DraftMark from "@/components/ui/DraftMark";
import HeroHeadline from "@/components/sections/HeroHeadline";
import { SHOW_DRAFTS, site } from "@/content/site";

const { globe } = site;

/**
 * Hero — Direction D "The World" (mockup: hero-direction-d-world.html).
 * Editorial left column over the Windsor band; the cobe globe (v3 step 05)
 * crops at the right edge and drifts at 0.93, headline at 0.97. Its right
 * offset scales with its width, so the sphere always clears the dim headline
 * span. Mobile (<900px): globe centered behind the text at 40% opacity. The
 * copy and its load sequence live in HeroHeadline. The section reads
 * completely with the globe removed.
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
        data-hero-globe
        className="pointer-events-none absolute top-1/2 aspect-square -translate-y-1/2 [--globe-w:min(90vh,58vw)] min-[900px]:right-[calc(var(--globe-w)*-0.45)] min-[900px]:w-(--globe-w) max-[899px]:right-1/2 max-[899px]:w-[130vw] max-[899px]:translate-x-1/2 max-[899px]:opacity-40"
      >
        <div data-speed="0.93" className="h-full w-full will-change-transform">
          <HeroGlobe locations={globe.locations} />
        </div>
      </div>

      <HeroHeadline />

      {/* dev only: a known client location that is not on the globe yet */}
      {SHOW_DRAFTS && (
        <div className="absolute inset-x-0 bottom-6 z-[2]">
          <p className="type-label mx-auto max-w-[1320px] px-[clamp(20px,4vw,56px)] text-n300">
            <DraftMark status={globe.pending.status} className="ml-0 mr-2" />
            {globe.pending.text}
          </p>
        </div>
      )}
    </section>
  );
}
