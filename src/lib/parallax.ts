import { gsap } from "@/lib/gsap";

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
 * - transform-only, driven by gsap.ticker (same clock as Lenis/ScrollTrigger)
 * - no-op under prefers-reduced-motion and on the server
 * - elements outside the viewport are skipped via IntersectionObserver
 *
 * Call from a client component's effect; returns a cleanup function.
 */
export function initParallax(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {};
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  interface Item {
    el: HTMLElement;
    speed: number;
    visible: boolean;
    /** Untransformed document-space center of the element. */
    docCenter: number;
  }

  const els: Item[] = Array.from(
    root.querySelectorAll<HTMLElement>("[data-speed]")
  ).map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed ?? "1"),
    visible: true,
    docCenter: 0,
  }));
  if (els.length === 0) return () => {};

  const measure = () => {
    for (const item of els) {
      item.el.style.transform = "";
      const rect = item.el.getBoundingClientRect();
      item.docCenter = rect.top + window.scrollY + rect.height / 2;
    }
    lastY = -1;
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = els.find((e) => e.el === entry.target);
        if (item) item.visible = entry.isIntersecting;
      }
    },
    // generous margin so drifted elements never pop at the viewport edge
    { rootMargin: "30% 0%" }
  );
  els.forEach((e) => io.observe(e.el));

  let lastY = -1;
  const update = () => {
    const y = window.scrollY;
    if (y === lastY) return;
    lastY = y;
    const mid = y + window.innerHeight / 2;
    for (const { el, speed, visible, docCenter } of els) {
      if (!visible) continue;
      const delta = (mid - docCenter) * (speed - 1);
      el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
    }
  };

  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      measure();
      update();
    });
  };

  measure();
  update();
  gsap.ticker.add(update);
  addEventListener("resize", onResize);

  return () => {
    gsap.ticker.remove(update);
    removeEventListener("resize", onResize);
    cancelAnimationFrame(resizeRaf);
    io.disconnect();
    els.forEach(({ el }) => {
      el.style.transform = "";
    });
  };
}
