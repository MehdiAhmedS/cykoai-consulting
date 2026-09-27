"use client";

import { useLayoutEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import DraftMark from "@/components/ui/DraftMark";
import { gsap, SplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";

const { eyebrow, headline, lede, caption, primaryCta, secondaryCta } = site.hero;

const DATA_LINE = [caption.origin, caption.coordinates, caption.timezone].join(" · ");
// Each part stays whole; the line may only wrap at the separators.
const DATA_PARTS = [
  { text: caption.origin, className: "text-n300" },
  { text: caption.coordinates, className: "text-driftwood" },
  { text: caption.timezone, className: "text-n300" },
];

/** One mono line of real data; the visual copy is split into characters to type on. */
function DataLine({ className }: { className?: string }) {
  return (
    <p className={cn("type-data uppercase", className)}>
      <span className="sr-only">{DATA_LINE}</span>
      <span aria-hidden data-hero-reveal data-hero-type>
        {DATA_PARTS.map((part, p) => (
          <span key={part.text}>
            {p > 0 && (
              <span className="text-n300">
                <span data-hero-char> </span>
                <span data-hero-char>·</span>
                <span data-hero-char> </span>
              </span>
            )}
            <span className={cn("whitespace-nowrap", part.className)}>
              {Array.from(part.text).map((ch, i) => (
                <span key={i} data-hero-char>
                  {ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </p>
  );
}

/**
 * Tells the hero globe (step 05) that the load sequence is over, so it can
 * fade in after it. Fires once: auto re-splits rebuild the timeline.
 */
function markHeroSettled() {
  const root = document.documentElement;
  if (root.dataset.heroSettled) return;
  root.dataset.heroSettled = "true";
  window.dispatchEvent(new Event("hero:settled"));
}

/**
 * Hero load sequence (v3 step 04): eyebrow fades, the headline's lines rise
 * through padded masks, lede and CTAs follow, the data line types on last.
 * Runs once on load (not on scroll), after fonts settle so lines never
 * re-wrap mid-animation. Reduced motion: static and complete (CSS).
 */
export default function HeroHeadline() {
  const columnRef = useRef<HTMLDivElement>(null);
  const desktopLineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const column = columnRef.current;
    const desktopLine = desktopLineRef.current;
    if (!column || !desktopLine || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markHeroSettled();
      return;
    }

    const scopes = [column, desktopLine];
    const q = (sel: string) => scopes.flatMap((s) => Array.from(s.querySelectorAll<HTMLElement>(sel)));
    const lines = column.querySelector<HTMLElement>("[data-hero-lines]");
    if (!lines) {
      markHeroSettled();
      return;
    }

    let cancelled = false;
    let split: SplitText | null = null;

    const fontsReady = Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);

    fontsReady.then(() => {
      if (cancelled) return;
      split = SplitText.create(lines, {
        type: "lines",
        mask: "lines",
        linesClass: "hero-line",
        tag: "span",
        autoSplit: true,
        aria: "none",
        // Returned so an auto re-split (fonts, resize) syncs to the same time.
        onSplit: (self) => {
          const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: markHeroSettled });
          tl.fromTo(q("[data-hero-eyebrow]"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0)
            .fromTo(self.lines, { yPercent: 108 }, { yPercent: 0, duration: 1.05, stagger: 0.08 }, 0.1)
            .fromTo(q("[data-hero-lede]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.55)
            .fromTo(q("[data-hero-ctas]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.75);
          // Each copy of the data line types on its own (only one is displayed).
          q("[data-hero-type]").forEach((line) => {
            tl.fromTo(
              line.querySelectorAll("[data-hero-char]"),
              { opacity: 0 },
              { opacity: 1, duration: 0.001, stagger: 0.024, ease: "none" },
              0.95
            );
          });
          return tl;
        },
      });
      // From-states are set; now the hidden reveal elements can show.
      q("[data-hero-reveal]").forEach((el) => {
        el.style.visibility = "visible";
      });
    });

    return () => {
      cancelled = true;
      split?.revert();
    };
  }, []);

  return (
    <>
      <div
        ref={columnRef}
        className="relative z-[2] mx-auto w-full max-w-[1320px] px-[clamp(20px,4vw,56px)] py-[clamp(72px,10vh,130px)]"
      >
        <div
          data-hero-reveal
          data-hero-eyebrow
          className="type-label inline-flex items-center gap-3.5 text-n300"
        >
          <span aria-hidden className="h-px w-7 bg-driftwood" />
          {eyebrow.text}
          <DraftMark status={eyebrow.status} className="ml-0" />
        </div>

        <h1 data-speed="0.97" className="type-hero mt-7 max-w-[15ch]">
          <span className="sr-only">
            {headline.text} {headline.dim}
          </span>
          <span aria-hidden data-hero-reveal data-hero-lines className="block">
            {headline.text}{" "}
            <span className="whitespace-nowrap text-n500">{headline.dim}</span>
          </span>
        </h1>

        <p data-hero-reveal data-hero-lede className="type-lead mt-7 max-w-[42ch] text-n300">
          {lede.text}
          <DraftMark status={lede.status} />
        </p>

        <div data-hero-reveal data-hero-ctas className="mt-11 flex flex-wrap items-center gap-7">
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

        {/* <900px: the data line sits under the CTAs */}
        <DataLine className="mt-10 min-[900px]:hidden" />
      </div>

      {/* ≥900px: the data line takes v1's caption spot, bottom right */}
      <div
        ref={desktopLineRef}
        className="absolute bottom-24 right-[clamp(20px,4vw,56px)] text-right max-[899px]:hidden"
      >
        <DataLine />
      </div>
    </>
  );
}
