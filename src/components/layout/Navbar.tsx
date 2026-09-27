"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import LogoMark from "@/components/ui/LogoMark";
import DraftMark from "@/components/ui/DraftMark";
import { site } from "@/content/site";

const { wordmark, tag, links: LINKS, cta } = site.nav;
const linksStatus = LINKS.some((l) => l.status === "draft") ? "draft" : "confirmed";

type Tone = "dark" | "light";

/** The bar's vertical centre: a section "is under the bar" when it crosses it. */
const BAR_LINE = 40;

/**
 * Inset glass bar (v3 step 03): Palantir's silhouette, Linear's glass over
 * dark sections, Harvey's over light. One IntersectionObserver reads the
 * data-tone of whatever crosses the bar's centre line and sets
 * data-nav-tone (globals.css does the rest) and the active link.
 * <900px: logo + menu button; the full-screen Windsor overlay keeps v1's
 * focus trap, Escape and paused Lenis.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const [active, setActive] = useState<string | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-tone], footer[data-tone]")
    );
    // An open Offers row is Windsor (step 06): under the bar it reads as dark.
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-offer]"));
    const onLine = new Set<HTMLElement>();
    let observer: IntersectionObserver | null = null;

    const pick = () => {
      const section = sections.find((s) => onLine.has(s));
      const row = rows.find((r) => onLine.has(r));
      if (row) setTone(row.hasAttribute("data-open") ? "dark" : "light");
      else if (section) setTone(section.dataset.tone === "light" ? "light" : "dark");
      if (section) setActive(section.id ? `#${section.id}` : null);
    };

    const observe = () => {
      observer?.disconnect();
      onLine.clear();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) onLine.add(el);
            else onLine.delete(el);
          }
          pick();
        },
        {
          // Only a 1px line at the bar's centre counts.
          rootMargin: `-${BAR_LINE}px 0px -${Math.max(window.innerHeight - BAR_LINE - 1, 0)}px 0px`,
        }
      );
      [...sections, ...rows].forEach((t) => observer?.observe(t));
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
      observer?.disconnect();
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
      className="site-nav fixed inset-x-2 top-2 z-50 min-[900px]:inset-x-0 min-[900px]:top-3 min-[900px]:mx-auto min-[900px]:w-[min(1000px,calc(100%-48px))]"
    >
      {/* A centred, rounded bar (Mehdi, 27 Sep): its 20px corners, and the CTA's
          12px, are the exceptions to the 2–8px radii besides the Projects phone outline. */}
      <div className="nav-bar h-[52px] rounded-[20px] min-[900px]:h-14">
        <div className="h-full pl-5 pr-2 min-[900px]:pl-6">
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
              <span className="type-label nav-link">{tag.text}</span>
            </a>

            <nav aria-label="Main" className="hidden items-center gap-[clamp(16px,3vw,36px)] min-[900px]:flex">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={active === link.href ? "true" : undefined}
                  className="type-small nav-link"
                >
                  {link.label}
                </a>
              ))}
              <DraftMark status={linksStatus} className="-ml-2" />
              <a
                href={cta.href}
                className="type-small nav-cta rounded-[12px] px-[18px] py-[7px] font-medium"
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
              className="flex flex-col gap-1.5 p-2 min-[900px]:hidden"
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

      {/* Mobile: full-screen Windsor overlay below the bar, links stacked in
          type-h2. A sibling of the glass bar: backdrop-filter would make the
          bar the containing block for this fixed layer. */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        data-tone="dark"
        className={`fixed inset-x-0 bottom-0 top-[68px] z-40 bg-windsor transition-opacity duration-300 ease-out-expo min-[900px]:hidden ${
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
            className="type-small rounded-xs bg-white px-7 py-[15px] text-center font-medium text-windsor"
          >
            {cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
