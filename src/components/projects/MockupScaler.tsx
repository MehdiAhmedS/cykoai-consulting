"use client";

import { useEffect, useRef } from "react";

/**
 * Mockups are authored at 960x600 and scaled to their frame by width / 960,
 * measured with a ResizeObserver. They stay transparent until a real width
 * is measured, so a display:none copy never shows at the wrong size.
 */
export default function MockupScaler({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    const art = inner.current;
    if (!el || !art) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width <= 0) return;
      art.style.transform = `scale(${width / 960})`;
      art.style.opacity = "1";
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      <div ref={inner} className="absolute left-0 top-0 h-[600px] w-[960px] origin-top-left opacity-0">
        {children}
      </div>
    </div>
  );
}
