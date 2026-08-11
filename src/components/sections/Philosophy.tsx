"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionLabel from "@/components/ui/SectionLabel";
import GenImage from "@/components/ui/GenImage";

const LINES = [
  { text: "Technology changes faster than organizations.", tone: "muted" },
  { text: "Organizations become anxious.", tone: "muted" },
  { text: "Anxious organizations make poor decisions.", tone: "muted" },
  { text: "Cykoai creates clarity.", tone: "accent" },
] as const;

/**
 * The rings interstitial (light band before the Windsor pin): AM-2
 * plaster relief, full-bleed and cropped hard — atmosphere, not a
 * framed picture. Falls back to a plain n50 field (fallback law).
 */
function RingsInterstitial() {
  return (
    <section aria-hidden="true" className="relative h-[46vh] min-h-[320px] overflow-hidden bg-n50">
      <GenImage
        src="/assets/gen/am2-rings-plaster.png"
        fill
        grade
        sizes="100vw"
        className="absolute inset-0"
        imgClassName="object-[50%_38%]"
      />
    </section>
  );
}

/**
 * Philosophy — the page's cinematic center: pinned line scrub on the
 * flat Windsor band, AM-1 monolith as a barely-there texture drifting
 * at 0.92, the last line's driftwood underline drawing in at the end.
 * Reduced motion: four static stacked lines, full underline, no pin.
 */
export default function Philosophy() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lines = lineRefs.current.filter(Boolean) as HTMLDivElement[];
        gsap.set(lines, { opacity: 0, y: 40 });
        gsap.set(lines[0], { opacity: 1, y: 0 });
        if (underlineRef.current) {
          gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: "0 50%" });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "+=300%",
            scrub: 0.6,
            pin: true,
          },
        });

        lines.forEach((line, i) => {
          if (i === 0) return;
          const prev = lines[i - 1];
          tl.to(prev, { opacity: 0, y: -40, duration: 0.6 }, i).to(
            line,
            { opacity: 1, y: 0, duration: 0.6 },
            i - 0.15
          );
        });

        if (underlineRef.current) {
          tl.to(underlineRef.current, { scaleX: 1, duration: 0.5 }, ">-0.1");
        }
        tl.to({}, { duration: 0.6 });
      });

      return () => mm.revert();
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <RingsInterstitial />
      <section
        id="philosophy"
        ref={wrapperRef}
        data-band-fade="#F9F9FA"
        className="relative overflow-hidden bg-windsor text-white motion-safe:h-screen"
      >
        {/* AM-1 monolith — invisible-but-felt texture, drifting at 0.92 */}
        <div
          data-speed="0.92"
          className="pointer-events-none absolute -inset-y-[8%] inset-x-0 will-change-transform"
        >
          <GenImage
            src="/assets/gen/am1-monolith.png"
            fill
            sizes="100vw"
            className="absolute inset-0 opacity-10"
            imgClassName="object-[45%_70%]"
          />
        </div>

        <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-center px-[clamp(20px,4vw,56px)] motion-reduce:py-24">
          <div className="motion-safe:absolute motion-safe:left-[clamp(20px,4vw,56px)] motion-safe:top-16">
            <SectionLabel index="05" tone="inverse">
              Our philosophy
            </SectionLabel>
          </div>

          <div className="relative mt-10 flex items-center justify-center text-center motion-reduce:flex-col motion-safe:mt-0 motion-safe:h-[240px] md:motion-safe:h-[200px]">
            {LINES.map((line, i) => (
              <div
                key={line.text}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="mx-auto max-w-4xl motion-safe:absolute motion-safe:inset-x-0 motion-reduce:py-4"
              >
                {line.tone === "accent" ? (
                  <p className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                    <span className="relative inline-block pb-2">
                      {line.text}
                      <span
                        ref={underlineRef}
                        aria-hidden
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-driftwood"
                      />
                    </span>
                  </p>
                ) : (
                  <p className="font-display text-[clamp(1.6rem,3.6vw,2.9rem)] font-medium leading-[1.15] tracking-[-0.02em] text-n300">
                    {line.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
