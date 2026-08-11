import { gsap } from "@/lib/gsap";

/**
 * data-speed parallax: elements declare `data-speed="0.85–1.0"` and one
 * shared rAF-driven translator offsets them against scroll
 * (Locomotive-style; REDESIGN_PLAN.md §1 allows ≤3 speeds per viewport).
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

  const els = Array.from(
    root.querySelectorAll<HTMLElement>("[data-speed]")
  ).map((el) => ({
    el,
    speed: parseFloat(el.dataset.speed ?? "1"),
    visible: true,
  }));
  if (els.length === 0) return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = els.find((e) => e.el === entry.target);
        if (item) item.visible = entry.isIntersecting;
      }
    },
    // generous margin so drifted elements never pop at the viewport edge
    { rootMargin: "20% 0%" }
  );
  els.forEach((e) => io.observe(e.el));

  let lastY = -1;
  const update = () => {
    const y = window.scrollY;
    if (y === lastY) return;
    lastY = y;
    for (const { el, speed, visible } of els) {
      if (!visible) continue;
      el.style.transform = `translate3d(0, ${(y * (speed - 1)).toFixed(1)}px, 0)`;
    }
  };

  gsap.ticker.add(update);
  update();

  return () => {
    gsap.ticker.remove(update);
    io.disconnect();
    els.forEach(({ el }) => {
      el.style.transform = "";
    });
  };
}
