"use client";

import { useEffect, useRef } from "react";

interface WorldCanvasProps {
  /** Draw the deployment arcs (default true). */
  arcs?: boolean;
  /** Force the single static frame (same rendering as reduced motion). */
  static?: boolean;
  className?: string;
}

/**
 * The World — Canvas 2D dotted globe, ported faithfully from
 * design-explorations/hero-direction-d-world.html (Direction D).
 *
 * Real geography (3,338 land points from world-atlas 110m, served as
 * /assets/land-points.json), 110s per rotation, −13° tilt, and driftwood
 * "deployment arcs" from Muscat to world cities, strictly one at a time.
 * No WebGL — sanctioned by D2. rAF pauses offscreen and on hidden tabs;
 * reduced-motion renders one static frame with a single completed arc.
 */
export default function WorldCanvas({
  arcs = true,
  static: forceStatic = false,
  className,
}: WorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcsRef = useRef(arcs);

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
    const D2R = Math.PI / 180;
    const TILT = -13 * D2R;
    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);
    const PERIOD = 110000; // one rotation: 110s — calm
    const ROT0 = -32 * D2R; // start with the Gulf / Indian Ocean facing front

    // Deployment network: Muscat hub → world
    const HUB: [number, number] = [23.59, 58.38];
    const TARGETS: [number, number][] = [
      [51.5, -0.13], // London
      [1.35, 103.82], // Singapore
      [40.71, -74.0], // New York
      [50.11, 8.68], // Frankfurt
      [-1.29, 36.82], // Nairobi
      [35.68, 139.69], // Tokyo
      [-33.87, 151.21], // Sydney
      [-23.55, -46.63], // São Paulo
    ];
    const vec = ([la, lo]: [number, number]) => {
      const a = la * D2R,
        o = lo * D2R,
        c = Math.cos(a);
      return [c * Math.cos(o), Math.sin(a), c * Math.sin(o)] as const;
    };
    type V3 = readonly [number, number, number];
    const HUBV = vec(HUB);
    const TARGV = TARGETS.map(vec);

    let pts: V3[] = [];
    let W = 0,
      H = 0,
      R = 0,
      CX = 0,
      CY = 0;

    function size() {
      if (!canvas || !ctx || !parent) return;
      const b = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = b.width;
      H = b.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(W, H) * 0.46;
      CX = W / 2;
      CY = H / 2;
    }

    function rotP(v: V3, cosR: number, sinR: number): V3 {
      // rotate Y then tilt X
      const x = v[0] * cosR + v[2] * sinR;
      const z = -v[0] * sinR + v[2] * cosR;
      const y = v[1] * cosT - z * sinT;
      return [x, y, v[1] * sinT + z * cosT];
    }
    const slerp = (a: V3, b: V3, t: number): V3 => {
      let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      d = Math.min(1, Math.max(-1, d));
      const om = Math.acos(d),
        so = Math.sin(om) || 1e-6;
      const s0 = Math.sin((1 - t) * om) / so,
        s1 = Math.sin(t * om) / so;
      return [
        a[0] * s0 + b[0] * s1,
        a[1] * s0 + b[1] * s1,
        a[2] * s0 + b[2] * s1,
      ];
    };
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // Arc lifecycle: draw 3.2s → hold .9s → fade 1.2s → gap, one at a time
    let arc: { t0: number; target: V3 } | null = null;
    let nextArcAt = 1200;
    let ti = 0;
    function spawnArc(now: number, cosR: number, sinR: number) {
      if (rotP(HUBV, cosR, sinR)[2] < 0.15) {
        nextArcAt = now + 2000; // hub on far side — wait
        return;
      }
      arc = { t0: now, target: TARGV[ti++ % TARGV.length] };
    }

    function drawArc(
      A: V3,
      B: V3,
      prog: number,
      alpha: number,
      cosR: number,
      sinR: number
    ) {
      if (!ctx) return;
      const SEG = 64,
        lift = 0.07;
      let started = false;
      ctx.beginPath();
      let head: [number, number] | null = null;
      for (let i = 0; i <= SEG * prog; i++) {
        const t = i / SEG;
        const v = slerp(A, B, t);
        const k = 1 + lift * Math.sin(Math.PI * t);
        const p = rotP([v[0] * k, v[1] * k, v[2] * k], cosR, sinR);
        if (p[2] <= 0) {
          started = false;
          continue;
        }
        const x = CX + p[0] * R,
          y = CY - p[1] * R;
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
      if (prog >= 1 && head) {
        ctx.beginPath();
        ctx.arc(head[0], head[1], 1.8, 0, 7);
        ctx.fillStyle = `rgba(173,135,82,${(0.9 * alpha).toFixed(3)})`;
        ctx.fill();
      }
    }

    function draw(now: number) {
      if (!ctx) return;
      const rot = rm ? ROT0 : ROT0 + ((now % PERIOD) / PERIOD) * 2 * Math.PI;
      const cosR = Math.cos(rot),
        sinR = Math.sin(rot);
      ctx.clearRect(0, 0, W, H);

      // sphere edge — hairline
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, 7);
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots — alpha and size scale with depth
      for (let i = 0; i < pts.length; i++) {
        const p = rotP(pts[i], cosR, sinR);
        if (p[2] <= 0.01) continue;
        const a = 0.1 + 0.42 * p[2];
        const r = 0.55 + 1.05 * p[2];
        ctx.beginPath();
        ctx.arc(CX + p[0] * R, CY - p[1] * R, r, 0, 7);
        ctx.fillStyle = `rgba(226,232,240,${a.toFixed(3)})`;
        ctx.fill();
      }

      // origin pulse — Muscat
      const hp = rotP(HUBV, cosR, sinR);
      if (hp[2] > 0.01) {
        const hx = CX + hp[0] * R,
          hy = CY - hp[1] * R;
        ctx.beginPath();
        ctx.arc(hx, hy, 2.4, 0, 7);
        ctx.fillStyle = "rgba(173,135,82,.95)";
        ctx.fill();
        if (!rm) {
          const ph = (now % 4000) / 4000;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.4 + ph * 14, 0, 7);
          ctx.strokeStyle = `rgba(173,135,82,${(0.3 * (1 - ph)).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // deployment arc — one at a time
      if (!arcsRef.current) return;
      if (rm) {
        drawArc(HUBV, TARGV[0], 1, 1, cosR, sinR);
      } else {
        if (!arc && now >= nextArcAt) spawnArc(now, cosR, sinR);
        if (arc) {
          const e = now - arc.t0;
          let prog = 1,
            alpha = 1;
          if (e < 3200) prog = ease(e / 3200);
          else if (e < 4100) prog = 1;
          else if (e < 5300) {
            prog = 1;
            alpha = 1 - (e - 4100) / 1200;
          } else {
            arc = null;
            nextArcAt = now + 1400;
          }
          if (arc) drawArc(HUBV, arc.target, prog, alpha, cosR, sinR);
        }
      }
    }

    // Run loop only while visible & tab focused
    let running = false;
    let rafId = 0;
    let disposed = false;
    const loop = (now: number) => {
      draw(now);
      if (running) rafId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running && !disposed) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onResize = () => {
      size();
      if (rm) draw(0);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    size();
    addEventListener("resize", onResize);

    let io: IntersectionObserver | null = null;

    // Fetch after the browser is idle: the 40KB land file must not
    // compete with fonts and hydration for the LCP-critical window —
    // the hero reads complete before the globe fades in.
    const whenIdle = new Promise<void>((resolve) => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => resolve(), { timeout: 1600 });
      } else {
        setTimeout(resolve, 350);
      }
    });

    whenIdle
      .then(() => fetch("/assets/land-points.json"))
      .then((r) => r.json())
      .then((land: [number, number][]) => {
        if (disposed) return;
        // Precompute unit vectors for every land dot
        pts = land.map(([la, lo]) => {
          const a = la * D2R,
            o = lo * D2R,
            c = Math.cos(a);
          return [c * Math.cos(o), Math.sin(a), c * Math.sin(o)] as const;
        });
        if (rm) {
          draw(0); // static frame, one arc, no motion
        } else {
          io = new IntersectionObserver(([entry]) =>
            entry.isIntersecting ? start() : stop()
          );
          io.observe(parent);
          document.addEventListener("visibilitychange", onVisibility);
          start();
        }
      })
      .catch(() => {
        // Fallback law: the hero must read complete without the globe.
      });

    return () => {
      disposed = true;
      stop();
      io?.disconnect();
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [forceStatic]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
