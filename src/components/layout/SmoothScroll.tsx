"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as typeof window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
