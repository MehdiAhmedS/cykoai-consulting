"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText as GSAPSplitText } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

/**
 * Masked line-by-line headline reveal on the official GSAP SplitText
 * (free since 3.13). autoSplit re-splits when fonts load or lines
 * rewrap, so line breaks stay true; aria handling is SplitText's
 * built-in (aria-label on the target, pieces hidden).
 */
export default function SplitText({
  children,
  className,
  delay = 0,
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    const split = GSAPSplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      // The animated copy is aria-hidden below and a plain sr-only copy
      // carries the text — SplitText's own aria-label would sit on a
      // bare span, which ARIA prohibits.
      aria: "none",
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.09,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: once
              ? "play none none none"
              : "play none none reverse",
          },
        }),
    });

    return () => {
      split.revert();
    };
  }, [delay, once]);

  return (
    <>
      <span className="sr-only">{children}</span>
      <span ref={ref} aria-hidden className={cn("inline-block", className)}>
        {children}
      </span>
    </>
  );
}
