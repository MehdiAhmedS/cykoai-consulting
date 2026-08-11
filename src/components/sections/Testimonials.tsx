"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Placeholder quotes in the client's own voice — replace with attributed,
// approved testimonials before launch.
const QUOTES = [
  {
    quote:
      "Cykoai didn't just advise us on AI adoption — they sat with our engineers until the system was live, secure, and owned by our own team.",
    name: "Chief Information Officer",
    org: "Global Financial Services Institution",
  },
  {
    quote:
      "They speak the language of the board and the language of the SOC in the same meeting. That's rare, and it's exactly what a transformation like ours needed.",
    name: "VP of Enterprise Architecture",
    org: "Multinational Manufacturer",
  },
  {
    quote:
      "The clarity they brought to a genuinely chaotic modernization program was the single biggest factor in us shipping on time.",
    name: "Director of Technology Strategy",
    org: "Federal Agency",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [paused]);

  const current = QUOTES[index];

  return (
    <section
      className="relative py-32 md:py-44"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ambient-glow left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-gold/[0.08]" />

      <div className="relative mx-auto max-w-[1000px] px-6 text-center md:px-10">
        <div className="relative flex min-h-[280px] items-center justify-center md:min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-[clamp(1.4rem,3vw,2.25rem)] font-medium leading-[1.3] tracking-[-0.01em] text-ink">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="mt-8">
                <p className="text-[0.95rem] font-medium text-ink">{current.name}</p>
                <p className="text-[0.85rem] text-ink-faint">{current.org}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              data-cursor="link"
              aria-label={`Show testimonial ${i + 1}`}
              className="group relative h-px w-10 bg-white/15"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-ink transition-all duration-500 ${
                  i === index ? "w-full" : "w-0 group-hover:w-1/3"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
