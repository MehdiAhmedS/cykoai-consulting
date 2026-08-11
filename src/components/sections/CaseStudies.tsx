"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitText from "@/components/ui/SplitText";
import Reveal from "@/components/ui/Reveal";

// Illustrative engagement summaries — swap in real, named case studies
// (with client permission) as they become publishable.
const CASES = [
  {
    sector: "Global Financial Services",
    title: "Modernizing fraud detection without expanding risk surface",
    result: "AI system deployed alongside a rebuilt security & governance layer",
    tags: ["Enterprise AI", "Cybersecurity"],
    accent: "from-gold/20 to-transparent",
  },
  {
    sector: "Industrial Manufacturing",
    title: "Securing OT convergence during a decade-long modernization program",
    result: "Architecture and advisory across IT/OT boundary",
    tags: ["Cybersecurity", "Architecture"],
    accent: "from-gold-deep/20 to-transparent",
  },
  {
    sector: "Federal & Public Sector",
    title: "Standing up an AI governance framework ahead of regulation",
    result: "Strategy and technology advisory for agency-wide adoption",
    tags: ["AI Strategy", "Advisory"],
    accent: "from-gold/20 to-transparent",
  },
  {
    sector: "Global Logistics",
    title: "Automating operations across a fragmented legacy estate",
    result: "Automation and digital transformation roadmap, phased for zero downtime",
    tags: ["Automation", "Transformation"],
    accent: "from-gold-light/20 to-transparent",
  },
];

export default function CaseStudies() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="work" className="relative py-32 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <SectionLabel index="06">Selected work</SectionLabel>
        </Reveal>
        <h2 className="mt-8 max-w-2xl font-display font-medium leading-[1.05] tracking-[-0.02em] text-[clamp(2.25rem,4.5vw,3.75rem)]">
          <SplitText className="text-ink">
            Engagements, not case study theater.
          </SplitText>
        </h2>

        <div className="mt-16 flex flex-col">
          {CASES.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div
                data-cursor="view"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                className="group relative grid cursor-pointer grid-cols-1 gap-4 border-t border-border py-9 transition-colors duration-500 md:grid-cols-[1fr_2.2fr_1fr] md:gap-8 md:py-12"
              >
                <div
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${item.accent}`}
                />

                <span className="font-mono text-[0.8rem] text-ink-faint">
                  {item.sector}
                </span>

                <h3 className="max-w-xl font-display text-[1.3rem] font-medium leading-snug tracking-tight text-ink transition-transform duration-500 group-hover:translate-x-2 md:text-[1.6rem]">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-strong px-3 py-1 text-[0.7rem] text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <motion.div
                  initial={false}
                  animate={{
                    height: active === i ? "auto" : 0,
                    opacity: active === i ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="col-span-1 overflow-hidden md:col-span-3"
                >
                  <p className="max-w-2xl pt-5 text-[0.95rem] leading-relaxed text-ink-muted">
                    {item.result}
                  </p>
                </motion.div>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}
