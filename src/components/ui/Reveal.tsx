"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to hold back after the trigger fires (staggering siblings). */
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  once?: boolean;
}

/**
 * Scroll-in reveal: fade + rise on expo.out, driven by ScrollTrigger so it
 * shares Lenis's clock. Elements already in view at init stay static (no
 * hide-then-show flash); reduced-motion renders static.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "expo.out",
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          toggleActions: once ? "play none none none" : "play none none reverse",
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, y, once]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
