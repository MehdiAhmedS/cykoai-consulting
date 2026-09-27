"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import type { GlobeLocation } from "@/content/site";
import { whenIdle } from "@/lib/idle";
import {
  ARC,
  PERIOD_MS,
  PULSE,
  START_OFFSET_DEG,
  THETA,
  TAU,
  easeOutCubic,
  phiFacing,
  rotate,
  rotation,
  slerp,
  sphereRadius,
  toXYZ,
  type Rotation,
  type Vec3,
} from "@/lib/globe";

interface WorldCanvasProps {
  /** Only confirmed locations are drawn: the origin, and the clients its arcs reach. */
  locations: GlobeLocation[];
  /** Called once the first frame with land is drawn. */
  onFirstFrame?: () => void;
  /** Draw the arcs (default true). */
  arcs?: boolean;
  /** Force the single static frame (same rendering as reduced motion). */
  static?: boolean;
  className?: string;
}

/**
 * The World: the hero globe's no-WebGL fallback (v3 step 05), a Canvas 2D
 * dotted globe ported from design-explorations/hero-direction-d-world.html.
 *
 * Real geography (3,338 land points from world-atlas 110m, served as
 * /assets/land-points.json) drawn with HeroGlobe's projection, tilt and spin
 * (src/lib/globe.ts), so the two agree and east is no longer mirrored. Arcs
 * run from the origin to each client and decorative place in site.ts,
 * strictly one at a time. rAF pauses off screen and on hidden tabs; reduced motion renders one
 * static frame with the origin facing the viewer and no arcs.
 */
export default function WorldCanvas({
  locations,
  onFirstFrame,
  arcs = true,
  static: forceStatic = false,
  className,
}: WorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcsRef = useRef(arcs);
  const firstFrame = useEffectEvent(() => onFirstFrame?.());

  useEffect(() => {
    arcsRef.current = arcs;
  }, [arcs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rm =
      forceStatic ||
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const confirmed = locations.filter((l) => l.status === "confirmed");
    const origin = confirmed.find((l) => l.role === "origin");
    const HUBV = origin ? toXYZ(origin.lat, origin.lng) : null;
    // Arcs reach clients and decorative places alike.
    const TARGV = confirmed.filter((l) => l.role !== "origin").map((l) => toXYZ(l.lat, l.lng));
    const PHI0 = origin ? phiFacing(origin.lng + (rm ? 0 : START_OFFSET_DEG)) : 0;

    let pts: Vec3[] = [];
    let W = 0,
      H = 0,
      R = 0,
      CX = 0,
      CY = 0;

    function size() {
      if (!canvas || !ctx || !parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = sphereRadius(H);
      CX = W / 2;
      CY = H / 2;
    }

    // Arc lifecycle: draw 3.2s → hold .9s → fade 1.2s → gap, one at a time
    let arc: { t0: number; target: Vec3 } | null = null;
    let nextArcAt: number = ARC.first;
    let ti = 0;
    let lastTarget: Vec3 | null = null;
    function spawnArc(elapsed: number, m: Rotation) {
      const left = canvas ? canvas.getBoundingClientRect().left : 0;
      const vw = document.documentElement.clientWidth;
      const seen = (p: Vec3) => left + CX + p[0] * R >= 24 && left + CX + p[0] * R <= vw - 24;
      const hub = HUBV && rotate(m, HUBV);
      // hub on far side — wait (it may sit under the right-edge crop)
      if (!hub || hub[2] < 0.15) {
        nextArcAt = elapsed + ARC.retry;
        return;
      }
      // next target, in order, that faces the viewer and is on screen (never the last one again)
      for (let k = 0; k < TARGV.length; k++) {
        const target = TARGV[(ti + k) % TARGV.length];
        if (target === lastTarget && TARGV.length > 1) continue;
        const p = rotate(m, target);
        if (p[2] >= 0.2 && seen(p)) {
          ti = (ti + k + 1) % TARGV.length;
          arc = { t0: elapsed, target };
          lastTarget = target;
          return;
        }
      }
      nextArcAt = elapsed + ARC.retry;
    }

    function drawArc(A: Vec3, B: Vec3, prog: number, alpha: number, m: Rotation) {
      if (!ctx) return;
      let started = false;
      ctx.beginPath();
      let head: [number, number] | null = null;
      for (let i = 0; i <= ARC.segments * prog; i++) {
        const t = i / ARC.segments;
        const k = 1 + ARC.lift * Math.sin(Math.PI * t);
        const p = rotate(m, slerp(A, B, t));
        if (p[2] <= 0) {
          started = false;
          continue;
        }
        const x = CX + p[0] * k * R,
          y = CY - p[1] * k * R;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
        head = [x, y];
      }
      ctx.strokeStyle = `rgba(173,135,82,${(0.7 * alpha).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      if (head && prog < 1) {
        ctx.beginPath();
        ctx.arc(head[0], head[1], 2.2, 0, 7);
        ctx.fillStyle = `rgba(212,180,131,${alpha.toFixed(3)})`;
        ctx.fill();
      }
    }

    function draw(elapsed: number) {
      if (!ctx) return;
      const phi = rm ? PHI0 : (PHI0 + (elapsed / PERIOD_MS) * TAU) % TAU;
      const m = rotation(phi, THETA);
      ctx.clearRect(0, 0, W, H);

      // sphere edge — hairline
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, 7);
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots — alpha and size scale with depth
      for (let i = 0; i < pts.length; i++) {
        const p = rotate(m, pts[i]);
        if (p[2] <= 0.01) continue;
        const a = 0.1 + 0.42 * p[2];
        const r = 0.55 + 1.05 * p[2];
        ctx.beginPath();
        ctx.arc(CX + p[0] * R, CY - p[1] * R, r, 0, 7);
        ctx.fillStyle = `rgba(226,232,240,${a.toFixed(3)})`;
        ctx.fill();
      }

      // client locations — the same places the arcs land
      for (const t of TARGV) {
        const p = rotate(m, t);
        if (p[2] <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(CX + p[0] * R, CY - p[1] * R, 1.8, 0, 7);
        ctx.fillStyle = "rgba(173,135,82,.9)";
        ctx.fill();
      }

      if (!HUBV) return;

      // origin pulse — Muscat
      const hp = rotate(m, HUBV);
      if (hp[2] > 0.01) {
        const hx = CX + hp[0] * R,
          hy = CY - hp[1] * R;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.4, 0, 7);
        ctx.fillStyle = "rgba(173,135,82,.95)";
        ctx.fill();
        if (!rm) {
          const ph = (elapsed % PULSE.period) / PULSE.period;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.4 + ph * PULSE.grow, 0, 7);
          ctx.strokeStyle = `rgba(173,135,82,${(PULSE.alpha * (1 - ph)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // deployment arc — one at a time (none under reduced motion)
      if (rm || !arcsRef.current || !TARGV.length) return;
      if (!arc && elapsed >= nextArcAt) spawnArc(elapsed, m);
      if (arc) {
        const e = elapsed - arc.t0;
        let prog = 1,
          alpha = 1;
        if (e < ARC.draw) prog = easeOutCubic(e / ARC.draw);
        else if (e < ARC.draw + ARC.hold) prog = 1;
        else if (e < ARC.draw + ARC.hold + ARC.fade) {
          prog = 1;
          alpha = 1 - (e - ARC.draw - ARC.hold) / ARC.fade;
        } else {
          arc = null;
          nextArcAt = elapsed + ARC.gap;
        }
        if (arc) drawArc(HUBV, arc.target, prog, alpha, m);
      }
    }

    // Run loop only while near the viewport & tab visible; one elapsed clock
    let running = false;
    let rafId = 0;
    let disposed = false;
    let intersecting = true;
    let elapsed = 0;
    let last = -1;
    const loop = (now: number) => {
      elapsed += last < 0 ? 0 : Math.min(now - last, 100);
      last = now;
      draw(elapsed);
      if (running) rafId = requestAnimationFrame(loop);
    };
    const sync = () => {
      const should = !rm && !disposed && pts.length > 0 && intersecting && !document.hidden;
      if (should && !running) {
        running = true;
        last = -1;
        rafId = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(rafId);
      }
    };

    size();
    const ro = new ResizeObserver(() => {
      if (parent.clientWidth === W && parent.clientHeight === H) return;
      size();
      if (!running) draw(elapsed);
    });
    ro.observe(parent);

    let io: IntersectionObserver | null = null;

    // Fetch after the browser is idle: the 40KB land file must not
    // compete with fonts and hydration for the LCP-critical window.
    whenIdle()
      .then(() => fetch("/assets/land-points.json"))
      .then((r) => r.json())
      .then((land: [number, number][]) => {
        if (disposed) return;
        pts = land.map(([la, lo]) => toXYZ(la, lo));
        draw(0);
        firstFrame();
        if (!rm) {
          // Watch the section, not the parallax layer (see src/lib/parallax.ts).
          io = new IntersectionObserver(
            ([entry]) => {
              intersecting = entry.isIntersecting;
              sync();
            },
            { rootMargin: "160px 0px" }
          );
          io.observe(canvas.closest("section") ?? parent);
          document.addEventListener("visibilitychange", sync);
          sync();
        }
      })
      .catch(() => {
        // Fallback law: the hero must read complete without the globe.
      });

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(rafId);
      io?.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [forceStatic, locations]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
