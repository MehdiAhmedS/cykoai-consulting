"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import MagneticButton from "@/components/ui/MagneticButton";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), {
  ssr: false,
});

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgress = useRef(0);
  const canRender3D = !usePrefersReducedMotion();

  // The WebGL scene otherwise renders forever, competing with the main
  // thread for the rest of the page's scroll. Pause its frameloop entirely
  // once it scrolls out of view, resume when it scrolls back into view.
  const [heroInView, setHeroInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollProgress.current = v;
  });

  return (
    <section
      id="top"
      ref={sectionRef}
      className="force-dark relative flex h-[100svh] min-h-[720px] w-full items-center overflow-hidden bg-void"
    >
      <div className="absolute inset-0">
        {canRender3D ? (
          <HeroCanvas scrollProgress={scrollProgress} active={heroInView} />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 65% 45%, rgba(173,135,82,0.18), transparent 70%)",
            }}
          />
        )}
      </div>

      {/* Gradient scrim so text stays legible over the 3D scene */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-void/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-void to-transparent" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-strong bg-white/[0.03] px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
            <span className="text-[0.75rem] tracking-wide text-ink-muted">
              Forward Deployed AI &amp; Cybersecurity Consulting
            </span>
          </motion.div>

          <h1 className="font-display font-medium leading-[0.98] tracking-[-0.03em] text-ink">
            <span className="block text-[clamp(2.75rem,7vw,6rem)]">
              <SplitText>The future moves</SplitText>
            </span>
            <span className="block text-[clamp(2.75rem,7vw,6rem)]">
              <SplitText delay={0.12}>faster than your</SplitText>
            </span>
            <span className="block text-[clamp(2.75rem,7vw,6rem)] text-gradient-accent">
              <SplitText delay={0.24}>organization.</SplitText>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-ink-muted"
          >
            Cykoai helps enterprises adopt AI, security, and emerging
            technology with precision — turning disruption into an advantage,
            not an anxiety.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-11 flex flex-wrap items-center gap-5"
          >
            <MagneticButton href="#contact" variant="solid" size="lg">
              Book a strategy session
            </MagneticButton>
            <MagneticButton href="#what-we-do" variant="ghost" size="lg">
              Explore our approach
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute inset-x-0 bottom-9 flex flex-col items-center gap-3"
      >
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-ink-faint">
          Scroll
        </span>
        <div className="h-10 w-px overflow-hidden bg-white/10">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full bg-gradient-to-b from-transparent via-ink to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
