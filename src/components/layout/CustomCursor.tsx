"use client";

import { useEffect, useRef } from "react";

/**
 * A soft, glowing cursor with two-speed follow: the dot tracks the pointer
 * immediately, the halo eases behind it. Expands over interactive elements.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    document.body.classList.add("custom-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let haloX = mouseX;
    let haloY = mouseY;
    let visible = false;

    const dot = dotRef.current;
    const halo = haloRef.current;
    if (!dot || !halo) return;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        dot!.style.opacity = "1";
        halo!.style.opacity = "1";
      }
      dot!.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }

    function onLeave() {
      dot!.style.opacity = "0";
      halo!.style.opacity = "0";
      visible = false;
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [data-cursor='link'], input, textarea"
      );
      const big = target.closest("[data-cursor='view']");
      if (big) {
        halo!.dataset.state = "view";
      } else if (interactive) {
        halo!.dataset.state = "link";
      } else {
        halo!.dataset.state = "default";
      }
    }

    let rafId: number;
    function tick() {
      haloX += (mouseX - haloX) * 0.16;
      haloY += (mouseY - haloY) * 0.16;
      halo!.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={haloRef}
        data-state="default"
        className="pointer-events-none fixed left-0 top-0 z-[200] h-10 w-10 rounded-full opacity-0 transition-[opacity,width,height,background-color] duration-300 ease-out mix-blend-difference
          data-[state=link]:h-16 data-[state=link]:w-16
          data-[state=view]:h-24 data-[state=view]:w-24"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.15) 60%, transparent 75%)",
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-opacity duration-300"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
