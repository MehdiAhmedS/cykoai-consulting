"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import type Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import DraftMark from "@/components/ui/DraftMark";
import type { Offer, Status } from "@/content/site";
import {
  ENGINE_MIN_WIDTH,
  GLOBE_WAIT,
  OPEN,
  PIECES,
  REFRESH,
  STILL,
  stillFile,
} from "@/components/ui/offers3d/constants";
import type { OffersEngineState } from "@/components/ui/offers3d/engine";

interface OffersListProps {
  items: Offer[];
  labels: { for: string; youGet: string; status: Status };
}

type Mode = "engine" | "still";

interface OffersDebugState extends Partial<OffersEngineState> {
  refreshes: number;
  longestRefresh: number;
  open: string[];
}

declare global {
  interface Window {
    __offers?: { state: () => OffersDebugState };
    __offerStills?: Record<string, string> | { error: string };
  }
}

const WIDE = `(min-width: ${ENGINE_MIN_WIDTH}px)`;

let env: { reduced: boolean; debug: boolean; fallback: boolean; still: boolean } | null = null;

/** Reduced motion and the dev-only query flags, read once. */
function readEnv() {
  if (!env) {
    const params = new URLSearchParams(window.location.search);
    const dev = process.env.NODE_ENV !== "production";
    env = {
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      debug: dev && params.has("offers-debug"),
      fallback: dev && params.has("offers-fallback"),
      still: dev && params.has("offers-still"),
    };
  }
  return env;
}

function subscribeWide(callback: () => void) {
  const mql = matchMedia(WIDE);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/** The engine runs only from 900 px, with motion allowed; everything else gets the stills. */
function getMode(): Mode {
  const e = readEnv();
  return !e.reduced && !e.fallback && !e.still && matchMedia(WIDE).matches ? "engine" : "still";
}

const getServerMode = () => null;

/** three.js r163 and later need WebGL 2, so only that is probed. */
function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** Resolves once the hero globe has left "loading", or GLOBE_WAIT ms after load, whichever comes first. */
function globeStarted() {
  let cancel = () => {};
  const promise = new Promise<void>((resolve) => {
    const globe = document.querySelector<HTMLElement>("[data-globe]");
    if (!globe || globe.dataset.globe !== "loading") {
      resolve();
      return;
    }
    const done = () => {
      cancel();
      resolve();
    };
    const mo = new MutationObserver(() => {
      if (globe.dataset.globe !== "loading") done();
    });
    mo.observe(globe, { attributes: true, attributeFilter: ["data-globe"] });
    const timer = window.setTimeout(done, Math.max(0, GLOBE_WAIT - performance.now()));
    cancel = () => {
      mo.disconnect();
      window.clearTimeout(timer);
    };
  });
  return { promise, cancel: () => cancel() };
}

const lenisNow = () => (window as typeof window & { __lenis?: Lenis }).__lenis;

/**
 * Offers rows (v3 step 06, the Cowork study): each row opens by itself as its
 * top rises above 66% of the viewport, fills with Windsor and shows what you
 * get with a small three.js piece, and closes again below 78%. The check
 * reads every row's rect on each tick of GSAP's ticker, after Lenis, since an
 * opening row pushes every row below it down. CSS does the motion off
 * `data-open`; reduced motion is open from the first paint, in CSS.
 *
 * Pieces: from 900 px, with motion allowed and WebGL 2, one shared renderer
 * (../ui/offers3d/engine) draws the open, on-screen rows into their canvases.
 * Everywhere else each piece is a still image, and three is never requested.
 */
export default function OffersList({ items, labels }: OffersListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const canvases = useRef<Record<string, HTMLCanvasElement | null>>({});
  const engineRef = useRef<{ stop: () => void; state: () => OffersEngineState } | null>(null);
  const statsRef = useRef({ refreshes: 0, longestRefresh: 0 });
  // Decided on mount; crossing 900 px switches modes.
  const preferred = useSyncExternalStore(subscribeWide, getMode, getServerMode);
  // No WebGL 2, or the context was lost: stills from then on.
  const [engineFailed, setEngineFailed] = useState(false);
  const mode: Mode | null = preferred === "engine" && engineFailed ? "still" : preferred;
  // Nothing loads until the section is within one screen height of the viewport.
  const [near, setNear] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(list);
    return () => io.disconnect();
  }, []);

  /* ---- the rows: open on scroll ---- */

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("[data-offer]"));
    const announce = () => window.dispatchEvent(new Event("offers:change"));

    // Reduced motion: every row is open in CSS already; data-open tells the navbar.
    if (readEnv().reduced) {
      rows.forEach((row) => row.setAttribute("data-open", ""));
      announce();
      return;
    }

    const stats = statsRef.current;
    let timer = 0;
    let slow = false;
    let pending = false;

    const refreshNow = () => {
      window.clearTimeout(timer);
      pending = false;
      const t0 = performance.now();
      ScrollTrigger.refresh();
      const took = performance.now() - t0;
      stats.refreshes++;
      stats.longestRefresh = Math.max(stats.longestRefresh, took);
      if (took > REFRESH.slow) slow = true;
    };
    /** After one slow refresh, wait for Lenis to stop, unless Projects is within a screen. */
    const mustWait = () => {
      if (!slow || !lenisNow()?.isScrolling) return false;
      const projects = document.getElementById("projects");
      return !!projects && projects.getBoundingClientRect().top >= window.innerHeight * 2;
    };
    const tryRefresh = () => {
      if (mustWait()) pending = true;
      else refreshNow();
    };
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "grid-template-rows") return;
      window.clearTimeout(timer);
      timer = window.setTimeout(tryRefresh, REFRESH.debounce);
    };
    const bodies = rows.map((row) => row.querySelector<HTMLElement>(".offer-body"));
    bodies.forEach((b) => b?.addEventListener("transitionend", onEnd));

    /**
     * Opens rows with transitions off for one frame, keeps the view where it
     * was (the browser's scroll anchoring may already have), then re-measures.
     */
    const openInstantly = (targets: HTMLElement[]) => {
      const opening = targets.filter((row) => !row.hasAttribute("data-open"));
      if (!opening.length) return;
      const anchor = rows.find((row) => row.getBoundingClientRect().top >= 0) ?? document.getElementById("projects");
      const before = anchor?.getBoundingClientRect().top ?? 0;
      // Only these rows skip their transitions: a row opening in view in the same tick still animates.
      opening.forEach((row) => row.setAttribute("data-instant", ""));
      opening.forEach((row) => row.setAttribute("data-open", ""));
      void list.offsetHeight;
      const moved = (anchor?.getBoundingClientRect().top ?? 0) - before;
      const lenis = lenisNow();
      // Lenis first learns the page grew; otherwise its scrollTo clamps to the old limit.
      lenis?.resize();
      if (Math.abs(moved) >= 1) {
        const y = window.scrollY + moved;
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      }
      refreshNow();
      announce();
      requestAnimationFrame(() => opening.forEach((row) => row.removeAttribute("data-instant")));
    };

    // A jump's glide: rows may open but never close, until Lenis settles.
    let hold = false;
    let holdSeen = false;
    let holdUntil = 0;

    const check = () => {
      const lenis = lenisNow();
      if (hold) {
        if (lenis?.isScrolling) holdSeen = true;
        else if (holdSeen) hold = false;
        if (performance.now() > holdUntil) hold = false;
      }
      const vh = window.innerHeight;
      const instant: HTMLElement[] = [];
      let changed = false;
      for (const row of rows) {
        const r = row.getBoundingClientRect();
        const open = row.hasAttribute("data-open");
        if (!open && r.top < vh * OPEN.at) {
          // Already scrolled past (a reload mid-page, a # in the URL, the End key): open at once.
          if (r.bottom < 0) instant.push(row);
          else {
            row.setAttribute("data-open", "");
            changed = true;
          }
        } else if (open && !hold && r.top > vh * OPEN.closeAt) {
          row.removeAttribute("data-open");
          changed = true;
        }
      }
      if (instant.length) openInstantly(instant);
      if (changed) announce();
      if (pending && !mustWait()) refreshNow();
    };

    // After the ticker callback that drives lenis.raf, so the check reads this tick's scroll.
    // Re-added whenever Lenis (re)starts, which appends its callback to the ticker.
    const attach = () => {
      gsap.ticker.remove(check);
      gsap.ticker.add(check);
    };
    if (lenisNow()) attach();
    window.addEventListener("lenis:ready", attach);

    // Jumps past the list: SmoothScroll fixes lenis.scrollTo's target when the click happens,
    // so open everything first (this capture listener runs before its bubbling one).
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!link?.hash) return;
      const target = document.querySelector(link.hash);
      if (!target || target.getBoundingClientRect().top < list.getBoundingClientRect().bottom) return;
      hold = true;
      holdSeen = false;
      holdUntil = performance.now() + REFRESH.holdMax;
      openInstantly(rows);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      gsap.ticker.remove(check);
      window.removeEventListener("lenis:ready", attach);
      document.removeEventListener("click", onClick, true);
      bodies.forEach((b) => b?.removeEventListener("transitionend", onEnd));
      window.clearTimeout(timer);
    };
  }, []);

  /* ---- the pieces ---- */

  useEffect(() => {
    if (mode !== "engine" || !near) return;
    const globe = globeStarted();
    let disposed = false;
    const fail = () => {
      engineRef.current?.stop();
      engineRef.current = null;
      if (!disposed) setEngineFailed(true);
    };

    (async () => {
      await globe.promise;
      if (disposed) return;
      if (!hasWebGL()) return fail();
      const engine = await import("@/components/ui/offers3d/engine");
      if (disposed) return;
      const views = items.flatMap((o) => {
        const canvas = canvases.current[o.id];
        const key = PIECES[o.id];
        return canvas && key ? [{ id: o.id, key, canvas }] : [];
      });
      engineRef.current = engine.startOffers({ views, debug: readEnv().debug, onFail: fail, onLost: fail });
    })().catch(fail);

    return () => {
      disposed = true;
      globe.cancel();
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [mode, near, items]);

  // `?offers-debug` (dev): the engine's figures and the refreshes.
  useEffect(() => {
    if (!readEnv().debug) return;
    const list = listRef.current;
    window.__offers = {
      state: () => ({
        ...engineRef.current?.state(),
        ...statsRef.current,
        open: Array.from(list?.querySelectorAll<HTMLElement>("[data-offer][data-open]") ?? []).map((r) => r.dataset.offer ?? ""),
      }),
    };
    return () => {
      delete window.__offers;
    };
  }, []);

  // `?offers-still` (dev): renders the still images with the engine and hands them to the script.
  useEffect(() => {
    if (!readEnv().still) return;
    let cancelled = false;
    import("@/components/ui/offers3d/engine")
      .then((engine) => {
        if (!cancelled) window.__offerStills = engine.renderStills(items.map((o) => ({ id: o.id, key: PIECES[o.id] })));
      })
      .catch((e) => {
        window.__offerStills = { error: String(e) };
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <div ref={listRef} className="mt-[clamp(40px,7vh,72px)] border-b border-n150">
      {items.map((offer, i) => (
        <article key={offer.id} id={`offer-${offer.id}`} data-offer={offer.id} className="offer-row">
          <div aria-hidden className="offer-fill" />
          <div aria-hidden className="offer-rule" />
          <div className="grid grid-cols-[minmax(0,1fr)_22px] gap-x-4 gap-y-1.5 px-[clamp(16px,2.5vw,32px)] py-6 md:grid-cols-[150px_minmax(0,1.25fr)_minmax(0,1fr)_22px] md:items-baseline md:gap-x-7 md:gap-y-3 md:py-[30px]">
            <p className="offer-practice type-label col-start-1">{offer.practice}</p>
            <h3 className="offer-name type-h3-lg col-start-1 md:col-start-2">
              {offer.name}
              <DraftMark status={offer.status} />
            </h3>
            <p className="offer-for type-small col-start-1 md:col-start-3">
              <span className="sr-only">{labels.for}: </span>
              {offer.for}
            </p>
            <span
              aria-hidden
              className="offer-icon col-start-2 row-span-3 row-start-1 self-center md:col-start-4 md:row-span-1"
            />
          </div>
          <div className="offer-body">
            <div className="offer-inner">
              <div className="grid grid-cols-1 gap-x-7 gap-y-[18px] px-[clamp(16px,2.5vw,32px)] pb-7 pt-1 md:grid-cols-[150px_minmax(0,.85fr)_minmax(0,1.15fr)] md:pb-9">
                <div className="offer-copy order-2 grid content-start gap-2.5 pt-1.5 md:order-none md:col-start-2">
                  <p className="type-label text-driftwood-soft">
                    {labels.youGet}
                    {i === 0 && <DraftMark status={labels.status} />}
                  </p>
                  <p className="type-body max-w-[40ch] text-white">{offer.youGet}</p>
                </div>
                <figure className="offer-piece order-1 md:order-none md:col-start-3">
                  <div aria-hidden className="relative aspect-[16/10] w-full">
                    {mode === "engine" && (
                      <canvas
                        ref={(el) => {
                          canvases.current[offer.id] = el;
                        }}
                        className="absolute inset-0 h-full w-full"
                      />
                    )}
                    {mode === "still" && near && (
                      <Image
                        src={stillFile(offer.id)}
                        width={STILL.width}
                        height={STILL.height}
                        sizes="(min-width: 768px) 40vw, 100vw"
                        quality={70}
                        alt=""
                        loading="eager"
                        data-gen-asset=""
                        className="absolute inset-0 h-full w-full"
                      />
                    )}
                  </div>
                  <figcaption className="type-label mt-2.5 text-n300">
                    {offer.caption.text}
                    <DraftMark status={offer.caption.status} />
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
