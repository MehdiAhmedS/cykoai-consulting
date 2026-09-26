import WorldCanvas from "@/components/ui/WorldCanvas";
import HeroHeadline from "@/components/sections/HeroHeadline";

/**
 * Hero — Direction D "The World" (mockup: hero-direction-d-world.html).
 * Editorial left column over the Windsor band; the Canvas 2D dot-globe
 * crops at the right edge and drifts at 0.93, headline at 0.97. Mobile
 * (<900px): globe centered behind the text at 40% opacity. The copy and
 * its load sequence live in HeroHeadline. The section reads completely
 * with the canvas removed.
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

      <HeroHeadline />
    </section>
  );
}
