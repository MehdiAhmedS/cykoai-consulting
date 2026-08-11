"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import MagneticButton from "@/components/ui/MagneticButton";
import LogoMark from "@/components/ui/LogoMark";
import ThemeToggle from "@/components/ui/ThemeToggle";

const LINKS = [
  { href: "#what-we-do", label: "What We Do" },
  { href: "#services", label: "Services" },
  { href: "#philosophy", label: "Philosophy" },
  { href: "#process", label: "Process" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    if (latest > previous && latest > 200) setHidden(true);
    else setHidden(false);
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="force-dark fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between px-6 transition-all duration-500 md:px-10 ${
          scrolled ? "py-4" : "py-7"
        }`}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-full w-full border-b border-border bg-void/80 backdrop-blur-md" />
        </div>

        <a
          href="#top"
          data-cursor="link"
          className="flex items-center gap-3 font-display font-medium tracking-tight text-ink"
        >
          <LogoMark className="h-7 w-7" />
          <span>
            <span className="text-[1.05rem]">Cykoai</span>
            <span className="ml-1.5 text-[0.65rem] font-normal uppercase tracking-[0.2em] text-ink-faint">
              Consulting
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-cursor="link"
              className="group relative text-[0.875rem] text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-ink transition-all duration-300 ease-out-quart group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="hidden lg:block">
            <MagneticButton href="#contact" variant="outline" size="sm">
              Start a conversation
            </MagneticButton>
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex flex-col gap-1.5 lg:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border-b border-border bg-void/95 backdrop-blur-xl lg:hidden"
      >
        <div className="flex flex-col gap-1 px-6 py-6">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-3 text-lg text-ink-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-3 rounded-full border border-border-strong px-5 py-3 text-center text-sm text-ink"
          >
            Start a conversation
          </a>
        </div>
      </motion.div>
    </motion.header>
  );
}
