import Button from "@/components/ui/Button";

/**
 * Hero — Direction D "The World" (interim, P0): mockup D's editorial
 * layout and copy on the Windsor band. The Canvas 2D dot-globe, arcs,
 * parallax speeds, and mono caption land in P1.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-64px)] w-full items-center overflow-hidden bg-windsor text-white"
    >
      <div className="relative z-[2] mx-auto w-full max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(72px,10vh,130px)]">
        <div className="inline-flex items-center gap-3.5 font-mono text-[11px] tracking-[0.22em] text-n300">
          <span aria-hidden className="h-px w-7 bg-driftwood" />
          FORWARD-DEPLOYED CONSULTING — AI · CYBERSECURITY
        </div>

        <h1 className="mt-7 max-w-[15ch] font-display text-[clamp(2.9rem,6.2vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
          The future moves faster than{" "}
          <span className="text-n500">your organization.</span>
        </h1>

        <p className="mt-7 max-w-[42ch] text-[1.1rem] leading-[1.7] text-n300">
          We deploy inside organizations anywhere change is outpacing them —
          engineers and strategists together, building until it holds.
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-7">
          <Button href="#contact" variant="inverse">
            Talk to us
          </Button>
          <a
            href="#what-we-do"
            className="border-b border-driftwood pb-[3px] text-[15px] font-medium text-white transition-colors duration-250 ease-out-expo hover:text-driftwood"
          >
            See how we work
          </a>
        </div>
      </div>
    </section>
  );
}
