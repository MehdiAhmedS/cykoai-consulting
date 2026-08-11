"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import LogoMark from "@/components/ui/LogoMark";

const LINKS = [
  { href: "#what-we-do", label: "What we do" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "How we work" },
];

/**
 * The DS's "permanent dark inverse band": solid Windsor, 64px, hairline
 * bottom border. No blur, no hide-on-scroll, no shrink tricks.
 * <900px: hamburger → full-screen Windsor overlay, links stacked in
 * Space Grotesk, focus trapped, Lenis paused while open.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const lenis = (window as typeof window & { __lenis?: Lenis }).__lenis;
    lenis?.stop();
    const burger = burgerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const overlay = overlayRef.current;
    const focusables = () =>
      Array.from(
        overlay?.querySelectorAll<HTMLElement>("a[href]") ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      // Trap Tab between the burger and the overlay links.
      if (e.key === "Tab") {
        const items = [burgerRef.current, ...focusables()].filter(
          Boolean
        ) as HTMLElement[];
        if (items.length === 0) return;
        e.preventDefault();
        const idx = items.indexOf(document.activeElement as HTMLElement);
        const next = e.shiftKey
          ? idx <= 0
            ? items.length - 1
            : idx - 1
          : idx === -1 || idx === items.length - 1
            ? 0
            : idx + 1;
        items[next].focus();
      }
    };
    // Overlay only exists below 900px — close if the viewport grows past it.
    const mq = matchMedia("(min-width: 900px)");
    const onMq = () => {
      if (mq.matches) setMenuOpen(false);
    };
    addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);

    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      burger?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-windsor">
      <div className="flex h-16 items-center justify-between px-[clamp(20px,4vw,56px)]">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-white"
          onClick={() => setMenuOpen(false)}
        >
          <LogoMark className="h-[26px] w-[26px] rounded-none" />
          <span className="font-display text-[17px] font-bold tracking-[0.02em]">
            CYKOAI
          </span>
          <span className="font-mono text-[9px] tracking-[0.32em] text-n300">
            CONSULTING
          </span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-[clamp(16px,3vw,36px)] min-[900px]:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13.5px] text-n300 transition-colors duration-250 ease-out-expo hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-xs border border-white/35 px-[18px] py-[9px] text-[13.5px] font-medium text-white transition-colors duration-250 ease-out-expo hover:bg-white hover:text-windsor"
          >
            Talk to us
          </a>
        </nav>

        <button
          ref={burgerRef}
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex flex-col gap-1.5 p-2 min-[900px]:hidden"
        >
          <span
            className={`h-px w-6 bg-white transition-transform duration-300 ${
              menuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-white transition-transform duration-300 ${
              menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile: full-screen Windsor overlay, links stacked in Space Grotesk */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-windsor transition-opacity duration-300 ease-out-expo min-[900px]:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-between px-[clamp(20px,4vw,56px)] py-10"
        >
          <div className="flex flex-col">
            {LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="border-b border-white/8 py-5 font-display text-[2rem] font-semibold tracking-[-0.02em] text-white"
              >
                <span className="mr-4 font-mono text-[11px] tracking-[0.1em] text-driftwood">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            className="rounded-xs bg-white px-7 py-[15px] text-center text-[15px] font-medium text-windsor"
          >
            Talk to us
          </a>
        </nav>
      </div>
    </header>
  );
}
