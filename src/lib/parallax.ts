import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * data-speed parallax: elements declare `data-speed="0.85–1.0"` and one
 * shared rAF-driven translator offsets them against scroll
 * (Locomotive-style; REDESIGN_PLAN.md §1 allows ≤3 speeds per viewport).
 *
 * The offset is measured from the element's untransformed document
 * position and zeroes when the element's center crosses the viewport
 * center — so layers anywhere down the page drift around where they
 * were laid out (the mockups' bare `scrollY * (speed-1)` only behaves
 * for elements near the top of the page).
 *
 * Document positions are re-measured on every ScrollTrigger refresh:
 * pin spacers (Engagement) grow the document after load, and
 * stale centers would strand layers hundreds of px off target.
 *
 * Offscreen gating is arithmetic on the stored centers — never an
 * IntersectionObserver, which would watch the *transformed* box and can
 * deadlock: a stale offset pushes the layer out of view, and the
 * observer that should wake it no longer fires.
 *
 * - transform-only, driven by gsap.ticker (same clock as Lenis/ScrollTrigger)
 * - no-op under prefers-reduced-motion and on the server
 *
 * Call from a client component's effect; returns a cleanup function.
 */
export function initParallax(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {};
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  interface Item {
    el: HTMLElement;
    speed: number;
    /** Untransformed document-space center and half-height. */
    docCenter: number;
    halfH: number;
  }

  const els: Item[] = Array.from(
    root.querySelectorAll<HTMLElement>("[data-speed]")
  ).map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed ?? "1"),
    docCenter: 0,
    halfH: 0,
  }));
  if (els.length === 0) return () => {};

  let lastY = -1;
  const update = (force = false) => {
    const y = window.scrollY;
    if (!force && y === lastY) return;
    lastY = y;
    const vh = window.innerHeight;
    const mid = y + vh / 2;
    for (const item of els) {
      const delta = (mid - item.docCenter) * (item.speed - 1);
      // Skip writes while the (shifted) box is far outside the viewport.
      const center = item.docCenter + delta - y;
      if (center + item.halfH < -vh * 0.5 || center - item.halfH > vh * 1.5) {
        continue;
      }
      item.el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
    }
  };

  const measure = () => {
    for (const item of els) {
      item.el.style.transform = "";
      const rect = item.el.getBoundingClientRect();
      item.docCenter = rect.top + window.scrollY + rect.height / 2;
      item.halfH = rect.height / 2;
    }
    update(true);
  };

  const tick = () => update(false);
  const onRefresh = () => measure();

  measure();
  gsap.ticker.add(tick);
  // Pin spacers and image loads reflow the document; ScrollTrigger
  // refresh is the single signal that layout settled again (it also
  // fires on resize).
  ScrollTrigger.addEventListener("refresh", onRefresh);

  return () => {
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    els.forEach(({ el }) => {
      el.style.transform = "";
    });
  };
}
