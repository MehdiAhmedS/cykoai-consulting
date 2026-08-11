"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { initParallax } from "@/lib/parallax";

/**
 * Drives the whole page's smooth scroll via Lenis, synced to GSAP's ticker
 * so ScrollTrigger-based sections (Philosophy pin, Process horizontal
 * scroll) stay perfectly in step with the virtual scroll position.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.1,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    (window as typeof window & { __lenis?: Lenis }).__lenis = lenis;
    window.dispatchEvent(new Event("lenis:ready"));

    // One shared translator for every [data-speed] layer on the page
    // (no-op under reduced motion; scan happens after hydration so all
    // sections' layers are in the DOM).
    const cleanupParallax = initParallax();

    // Route same-page anchors through Lenis so nav clicks glide instead
    // of jumping (native jump remains for reduced-motion users, who have
    // no Lenis at all). Offset clears the sticky 64px nav band.
    const onAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const target = document.querySelector(anchor.hash || "#");
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -64 });
    };
    document.addEventListener("click", onAnchorClick);

    // Band color handoffs (Cappen move): a dark band fades up from the
    // preceding light field across 0.4 viewport as it enters.
    const fadeTweens = Array.from(
      document.querySelectorAll<HTMLElement>("[data-band-fade]")
    ).map((band) =>
      gsap.fromTo(
        band,
        { backgroundColor: band.dataset.bandFade },
        {
          backgroundColor: getComputedStyle(band).backgroundColor,
          ease: "none",
          immediateRender: true,
          scrollTrigger: {
            trigger: band,
            start: "top 90%",
            end: "top 50%",
            scrub: true,
          },
        }
      )
    );

    return () => {
      cleanupParallax();
      document.removeEventListener("click", onAnchorClick);
      fadeTweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as typeof window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
