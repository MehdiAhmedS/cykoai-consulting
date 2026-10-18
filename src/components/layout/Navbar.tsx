"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import LogoMark from "@/components/ui/LogoMark";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { wordmark, tag, links: LINKS, cta } = site.nav;
const linksStatus = LINKS.some((l) => l.status === "draft") ? "draft" : "confirmed";

type Tone = "dark" | "light";

/** Half the height of the bar's text band, around its vertical centre. */
const TEXT_BAND = 8;

/**
 * Floating glass bar (v3 step 03b): Raycast's dark glass in Windsor on every
 * section, lined up with the content column, with a light "key" CTA.
 * IntersectionObservers on three 1px lines, read from the bar's own box, set
 * data-nav-tone (globals.css densifies the fill over light sections) and
 * the active link. The tone is light if either edge of the text band is
 * over a light surface, so a light section sliding under the bar never sits
 * behind the text under the thinner dark fill. The active link follows the
 * section at the bar's centre.
 * <900px: logo + menu button; the full-screen Windsor overlay keeps v1's
 * focus trap, Escape and paused Lenis.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const [active, setActive] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-tone], footer[data-tone]")
    );
    // An open Offers row is Windsor (step 06): under the bar it reads as dark.
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-offer]"));
    const lines = { top: new Set<HTMLElement>(), centre: new Set<HTMLElement>(), bottom: new Set<HTMLElement>() };
    let observers: IntersectionObserver[] = [];

    const toneOn = (line: Set<HTMLElement>): Tone | null => {
      const section = sections.find((s) => line.has(s));
      const row = rows.find((r) => line.has(r));
      if (row) return row.hasAttribute("data-open") ? "dark" : "light";
      if (section) return section.dataset.tone === "light" ? "light" : "dark";
      return null;
    };

    const pick = () => {
      const tones = [toneOn(lines.top), toneOn(lines.bottom)];
      if (tones.includes("light")) setTone("light");
      else if (tones.includes("dark")) setTone("dark");
      const section = sections.find((s) => lines.centre.has(s));
      if (section) setActive(section.id ? `#${section.id}` : null);
    };

    const observe = () => {
      observers.forEach((o) => o.disconnect());
      const bar = barRef.current?.getBoundingClientRect();
      const centre = bar ? Math.round(bar.top + bar.height / 2) : 40;
      const at = { top: centre - TEXT_BAND, centre, bottom: centre + TEXT_BAND };
      observers = (Object.keys(lines) as (keyof typeof lines)[]).map((key) => {
        const line = lines[key];
        line.clear();
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const el = entry.target as HTMLElement;
              if (entry.isIntersecting) line.add(el);
              else line.delete(el);
            }
            pick();
          },
          {
            // Only a 1px line counts.
            rootMargin: `-${at[key]}px 0px -${Math.max(window.innerHeight - at[key] - 1, 0)}px 0px`,
          }
        );
        [...sections, ...rows].forEach((t) => observer.observe(t));
        return observer;
      });
    };

    observe();
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(observe);
    };
    addEventListener("resize", onResize);
    addEventListener("offers:change", pick);

    return () => {
      observers.forEach((o) => o.disconnect());
      cancelAnimationFrame(frame);
      removeEventListener("resize", onResize);
      removeEventListener("offers:change", pick);
    };
  }, []);

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
    <header
      data-nav-tone={tone}
      className="site-nav fixed inset-x-2 top-(--nav-top) z-50 min-[900px]:inset-x-0 min-[900px]:mx-auto min-[900px]:w-[min(1208px,calc(100%-32px))]"
    >
      {/* Its edges meet the content column (1320px less 56px each side). The
          16px corners (14px below 900px) are the radii exception besides the
          Projects phone outline (18 Oct). --nav-top and --nav-h: globals.css. */}
      <div ref={barRef} className="nav-bar h-(--nav-h) rounded-[14px] min-[900px]:rounded-[16px]">
        <div className="h-full pl-4 pr-2 min-[900px]:pl-8 min-[900px]:pr-4">
          <div className="flex h-full items-center justify-between">
            <a
              href="#top"
              className="flex items-center gap-2.5"
              onClick={() => setMenuOpen(false)}
            >
              <LogoMark className="h-[26px] w-[26px] rounded-none" />
              <span className="font-display text-[17px] font-bold tracking-[0.02em] [font-stretch:112%]">
                {wordmark.text}
              </span>
              <span className="type-label nav-tag">{tag.text}</span>
            </a>

            <nav aria-label="Main" className="hidden items-center gap-2 min-[900px]:flex">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active === link.href ? "true" : undefined}
                  className="type-nav nav-link"
                >
                  {link.label}
                </a>
              ))}
              <DraftMark status={linksStatus} className="-ml-2" />
              <a
                href={cta.href}
                className="type-nav nav-cta ml-1"
              >
                {cta.label}
              </a>
            </nav>

            <button
              ref={burgerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex flex-col gap-1.5 p-2 text-white min-[900px]:hidden"
            >
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${
                  menuOpen ? "translate-y-[3.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-current transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: full-screen Windsor overlay 8px below the bar, links stacked
          in type-h2. A sibling of the glass bar: backdrop-filter would make
          the bar the containing block for this fixed layer. */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        data-tone="dark"
        className={`fixed inset-x-0 bottom-0 top-[calc(var(--nav-top)+var(--nav-h)+8px)] z-40 bg-windsor transition-opacity duration-300 ease-out-expo min-[900px]:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="flex h-full flex-col justify-between px-[clamp(20px,4vw,56px)] py-10"
        >
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="type-h2 border-b border-white/8 py-5 text-white"
              >
                {link.label}
              </a>
            ))}
            <DraftMark status={linksStatus} className="ml-0 mt-4 self-start" />
          </div>
          <a
            href={cta.href}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            className="type-nav nav-cta w-full"
          >
            {cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
