"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { COBEOptions, Globe, Marker } from "cobe";
import WorldCanvas from "@/components/ui/WorldCanvas";
import type { GlobeLocation } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import {
  ARC,
  GLOBE_SCALE,
  MARKER_SIZE,
  PERIOD_MS,
  PULSE,
  START_OFFSET_DEG,
  THETA,
  TAU,
  easeOutCubic,
  markerRadius,
  phiFacing,
  rotate,
  rotation,
  screen,
  slerp,
  sphereRadius,
  toXYZ,
  type Rotation,
  type Vec3,
} from "@/lib/globe";

type CreateGlobe = (canvas: HTMLCanvasElement, opts: COBEOptions) => Globe;

/** The prompt's cobe settings (v3 step 05). The glow is the Windsor background, so none shows. */
const COBE = {
  dark: 1,
  diffuse: 1.2,
  mapBrightness: 5,
  mapBaseBrightness: 0.02,
  baseColor: [0.07, 0.1, 0.17],
  markerColor: [0.68, 0.53, 0.32],
  glowColor: [0.043, 0.082, 0.153],
} satisfies Partial<COBEOptions>;

const GRATICULE = "rgba(255,255,255,0.06)";
const EDGE = "rgba(255,255,255,0.10)";
const DRIFTWOOD = "173,135,82";
const DRIFTWOOD_SOFT = "212,180,131";
/** Graticule every 30°, sampled every 3° along each line. */
const GRID_STEP = 30;
const GRID_SAMPLE = 3;
/** Captions show once the destination faces the viewer this much, and leave below the lower value. */
const CAPTION_ON = 0.12;
const CAPTION_OFF = 0.02;
const CAPTION_FADE_MS = 600;

interface DebugPoint {
  name: string;
  x: number;
  y: number;
  z: number;
  anchorX: number | null;
  anchorY: number | null;
}

interface GlobeDebug {
  setPhi: (phi: number) => void;
  resume: () => void;
  showCrosshairs: (show: boolean) => void;
  state: () => {
    phi: number;
    theta: number;
    w: number;
    h: number;
    aspect: number;
    dpr: number;
    radius: number;
    markerPx: { origin: number; client: number };
    createMs: number;
    frameCost: { n: number; mean: number; p95: number };
    elapsed: number;
    arc: { name: string; e: number } | null;
    caption: { text: string; opacity: number } | null;
    points: DebugPoint[];
  };
}

declare global {
  interface Window {
    __globe?: GlobeDebug;
  }
}

/** Dev-only query flags. Presence is enough: scripts may drop the `=1`. */
function readFlags() {
  if (process.env.NODE_ENV === "production") return { debug: false, fallback: false };
  const params = new URLSearchParams(window.location.search);
  return { debug: params.has("globe-debug"), fallback: params.has("globe-fallback") };
}

function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** Resolves once the hero's load sequence has finished (HeroHeadline), or after `maxWait` ms. */
function heroSettled(maxWait: number) {
  let cancel = () => {};
  const promise = new Promise<void>((resolve) => {
    if (document.documentElement.dataset.heroSettled) {
      resolve();
      return;
    }
    const done = () => {
      cancel();
      resolve();
    };
    const timer = window.setTimeout(done, maxWait);
    window.addEventListener("hero:settled", done);
    cancel = () => {
      window.clearTimeout(timer);
      window.removeEventListener("hero:settled", done);
    };
  });
  return { promise, cancel: () => cancel() };
}

/** Resolves once `el` has a size; it has none while the globe is hidden. */
function whenSized(el: HTMLElement) {
  let cancel = () => {};
  const promise = new Promise<void>((resolve) => {
    if (el.clientWidth && el.clientHeight) {
      resolve();
      return;
    }
    const ro = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      ro.disconnect();
      resolve();
    });
    ro.observe(el);
    cancel = () => ro.disconnect();
  });
  return { promise, cancel: () => cancel() };
}

function reveal(root: HTMLElement, reduced: boolean, done: "ready" | "fallback") {
  if (reduced) {
    gsap.set(root, { opacity: 1 });
    root.dataset.globe = done === "ready" ? "static" : done;
    return;
  }
  gsap.to(root, {
    opacity: 1,
    duration: 0.8,
    ease: "expo.out",
    onComplete: () => {
      root.dataset.globe = done;
    },
  });
}

const markerId = (l: GlobeLocation) => `loc-${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const wrap = (a: number) => ((a % TAU) + TAU) % TAU;

function graticule(): Vec3[][] {
  const lines: Vec3[][] = [];
  for (let lng = -180; lng < 180; lng += GRID_STEP) {
    const line: Vec3[] = [];
    for (let lat = -90; lat <= 90; lat += GRID_SAMPLE) line.push(toXYZ(lat, lng));
    lines.push(line);
  }
  for (let lat = -90 + GRID_STEP; lat < 90; lat += GRID_STEP) {
    const line: Vec3[] = [];
    for (let lng = -180; lng <= 180; lng += GRID_SAMPLE) line.push(toXYZ(lat, lng));
    lines.push(line);
  }
  return lines;
}

/** Adds the front-facing (z > 0) parts of a line to the current path, cut exactly at the rim. */
function traceFront(ctx: CanvasRenderingContext2D, line: Vec3[], m: Rotation, map: (p: Vec3) => [number, number]) {
  let prev: Vec3 | null = null;
  for (const v of line) {
    const p = rotate(m, v);
    const rim = (a: Vec3) => {
      const t = a[2] / (a[2] - p[2]);
      return map([a[0] + (p[0] - a[0]) * t, a[1] + (p[1] - a[1]) * t, 0]);
    };
    if (p[2] > 0) {
      const [x, y] = map(p);
      if (!prev) ctx.moveTo(x, y);
      else if (prev[2] <= 0) {
        const [rx, ry] = rim(prev);
        ctx.moveTo(rx, ry);
        ctx.lineTo(x, y);
      } else ctx.lineTo(x, y);
    } else if (prev && prev[2] > 0) {
      const [rx, ry] = rim(prev);
      ctx.lineTo(rx, ry);
    }
    prev = p;
  }
}

interface StartOptions {
  createGlobe: CreateGlobe;
  root: HTMLDivElement;
  host: HTMLDivElement;
  overlay: HTMLCanvasElement;
  caption: HTMLParagraphElement;
  locations: GlobeLocation[];
  reduced: boolean;
  debug: boolean;
  onFail: () => void;
  onLost: () => void;
}

/**
 * Creates the cobe globe and its overlay and runs them from one rAF loop,
 * so both use the same phi and theta. Returns the clean-up.
 */
function startGlobe(o: StartOptions): () => void {
  const { root, host, overlay, caption, reduced, debug } = o;
  const ctx = overlay.getContext("2d");
  if (!ctx) {
    o.onFail();
    return () => {};
  }

  const confirmed = o.locations.filter((l) => l.status === "confirmed");
  const origin = confirmed.find((l) => l.role === "origin");
  const clients = confirmed.filter((l) => l.role === "client");
  const hub = origin ? toXYZ(origin.lat, origin.lng) : null;
  const phiStart = origin ? phiFacing(origin.lng + (reduced ? 0 : START_OFFSET_DEG)) : 0;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = host.clientWidth;
  let h = host.clientHeight;
  let mapSamples = window.innerWidth < 900 ? 9000 : 14000;
  const markers: Marker[] = confirmed.map((l) => ({
    location: [l.lat, l.lng],
    size: l.role === "origin" ? MARKER_SIZE.origin : MARKER_SIZE.client,
    // With ids cobe positions its own anchor divs each frame: the debug view compares against them.
    ...(debug ? { id: markerId(l) } : {}),
  }));

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%";
  host.append(canvas);

  // cobe loads its land map with `new Image()` and never redraws when it arrives,
  // so keep a handle on that image (only for this synchronous call) to redraw ourselves.
  const NativeImage = window.Image;
  const captured: { land: HTMLImageElement | null } = { land: null };
  const headBefore = document.head.lastElementChild;
  const createStart = performance.now();
  let globe: Globe;
  window.Image = function (width?: number, height?: number) {
    captured.land = new NativeImage(width, height);
    return captured.land;
  } as unknown as typeof Image;
  try {
    globe = o.createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: w,
      height: h,
      phi: phiStart,
      theta: THETA,
      mapSamples,
      ...COBE,
      markers,
      markerElevation: 0,
      arcs: [],
      scale: GLOBE_SCALE,
    });
  } finally {
    window.Image = NativeImage;
  }
  const createMs = performance.now() - createStart;

  // cobe rewrites a <style> in <head> on every update, for CSS anchor variables
  // this page doesn't use. Detached, those writes no longer touch the page's styles.
  const style = document.head.lastElementChild;
  if (style !== headBefore && style instanceof HTMLStyleElement) style.remove();

  // cobe returns silent stubs when a shader fails: treat that like no WebGL.
  const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
  if (!gl || gl.isContextLost() || !gl.getParameter(gl.CURRENT_PROGRAM)) {
    globe.destroy();
    host.replaceChildren();
    o.onFail();
    return () => {};
  }

  let aspect = canvas.width / canvas.height;
  const sizeOverlay = () => {
    overlay.width = Math.round(w * dpr);
    overlay.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    aspect = canvas.width / canvas.height;
  };
  sizeOverlay();

  const lines = graticule();
  const map = (p: Vec3, k = 1) => screen(p, w, h, aspect, k);
  let phi = phiStart;
  let frozenPhi: number | null = null;
  let crosshairs = debug;
  let elapsed = 0;
  let last = -1;
  let raf = 0;
  let running = false;
  let intersecting = true;
  let arc: { target: GlobeLocation; to: Vec3; t0: number } | null = null;
  let nextArcAt: number = ARC.first;
  let targetIndex = 0;
  let captionOn = false;
  let captionFor: GlobeLocation | null = null;
  let chipW = 0;
  let chipH = 0;
  let rootLeft = 0;
  let viewW = 0;
  const costs: number[] = [];

  /** Is screen-x `x` (globe px) inside the part of the hero the viewport shows? */
  const onScreen = (x: number) => {
    const left = root.getBoundingClientRect().left + x;
    return left >= 24 && left <= document.documentElement.clientWidth - 24;
  };

  const hideCaption = () => {
    if (!captionOn) return;
    captionOn = false;
    caption.style.opacity = "0";
    caption.style.willChange = "";
  };

  const strokeArc = (m: Rotation, a: Vec3, b: Vec3, prog: number, alpha: number) => {
    ctx.beginPath();
    let started = false;
    let head: [number, number] | null = null;
    for (let i = 0; i <= ARC.segments * prog; i++) {
      const t = i / ARC.segments;
      const p = rotate(m, slerp(a, b, t));
      if (p[2] <= 0) {
        started = false;
        continue;
      }
      const [x, y] = map(p, 1 + ARC.lift * Math.sin(Math.PI * t));
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
      head = [x, y];
    }
    ctx.strokeStyle = `rgba(${DRIFTWOOD},${(0.7 * alpha).toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (head && prog < 1) {
      ctx.beginPath();
      ctx.arc(head[0], head[1], 2.2, 0, TAU);
      ctx.fillStyle = `rgba(${DRIFTWOOD_SOFT},${alpha.toFixed(3)})`;
      ctx.fill();
    }
  };

  /** One mono country name beside the destination, from landing until the arc has faded. */
  const placeCaption = (m: Rotation, e: number, alpha: number) => {
    if (!arc || e < ARC.draw) return hideCaption();
    const p = rotate(m, arc.to);
    if (p[2] < (captionOn ? CAPTION_OFF : CAPTION_ON)) return hideCaption();
    if (captionFor !== arc.target) {
      caption.textContent = arc.target.name;
      chipW = caption.offsetWidth;
      chipH = caption.offsetHeight;
      rootLeft = root.getBoundingClientRect().left;
      viewW = document.documentElement.clientWidth;
      captionFor = arc.target;
    }
    if (!captionOn) {
      captionOn = true;
      caption.style.willChange = "transform, opacity";
    }
    const [x, y] = map(p);
    const gap = markerRadius(MARKER_SIZE.client, h) + 6;
    // Right of the point, away from the headline; left only where the viewport would cut it.
    const left = rootLeft + x + gap + chipW > viewW - 8 ? x - gap - chipW : x + gap;
    caption.style.transform = `translate3d(${left.toFixed(1)}px, ${(y - chipH / 2).toFixed(1)}px, 0)`;
    caption.style.opacity = Math.min(easeOutExpo((e - ARC.draw) / CAPTION_FADE_MS), alpha).toFixed(3);
  };

  /** v1's lifecycle, one arc at a time: draw 3.2 s → hold 0.9 s → fade 1.2 s → 1.4 s gap. */
  const runArcs = (m: Rotation, hubP: Vec3) => {
    if (!hub) return;
    if (!arc && elapsed >= nextArcAt) {
      if (hubP[2] >= 0.15 && onScreen(map(hubP)[0])) {
        const target = clients[targetIndex++ % clients.length];
        arc = { target, to: toXYZ(target.lat, target.lng), t0: elapsed };
      } else nextArcAt = elapsed + ARC.retry;
    }
    if (!arc) return hideCaption();
    const e = elapsed - arc.t0;
    let prog = 1;
    let alpha = 1;
    if (e < ARC.draw) prog = easeOutCubic(e / ARC.draw);
    else if (e >= ARC.draw + ARC.hold && e < ARC.draw + ARC.hold + ARC.fade) {
      alpha = 1 - (e - ARC.draw - ARC.hold) / ARC.fade;
    } else if (e >= ARC.draw + ARC.hold + ARC.fade) {
      arc = null;
      captionFor = null;
      nextArcAt = elapsed + ARC.gap;
      return hideCaption();
    }
    strokeArc(m, hub, arc.to, prog, alpha);
    placeCaption(m, e, alpha);
  };

  const drawOverlay = () => {
    const m = rotation(phi, THETA);
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    for (const line of lines) traceFront(ctx, line, m, map);
    ctx.strokeStyle = GRATICULE;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, sphereRadius(h), 0, TAU);
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (hub && !reduced) {
      const hubP = rotate(m, hub);
      if (hubP[2] > 0) {
        const ph = (elapsed % PULSE.period) / PULSE.period;
        const [x, y] = map(hubP);
        ctx.beginPath();
        ctx.arc(x, y, markerRadius(MARKER_SIZE.origin, h) + ph * PULSE.grow, 0, TAU);
        ctx.strokeStyle = `rgba(${DRIFTWOOD},${(PULSE.alpha * (1 - ph)).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (clients.length) runArcs(m, hubP);
    }

    if (crosshairs) {
      ctx.strokeStyle = "#35d0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const l of confirmed) {
        const p = rotate(m, toXYZ(l.lat, l.lng));
        if (p[2] <= 0) continue;
        const [x, y] = map(p);
        ctx.moveTo(x - 7, y);
        ctx.lineTo(x + 7, y);
        ctx.moveTo(x, y - 7);
        ctx.lineTo(x, y + 7);
      }
      ctx.stroke();
    }
  };

  const render = () => {
    const t = debug ? performance.now() : 0;
    phi = frozenPhi ?? (reduced ? phiStart : wrap(phiStart + (elapsed / PERIOD_MS) * TAU));
    globe.update({ phi });
    drawOverlay();
    if (debug) {
      costs.push(performance.now() - t);
      if (costs.length > 300) costs.shift();
    }
  };

  const frame = (now: number) => {
    raf = 0;
    elapsed += last < 0 ? 0 : Math.min(now - last, 100);
    last = now;
    render();
    if (running) raf = requestAnimationFrame(frame);
  };

  /** Runs only while the hero is near the viewport and the tab is visible. */
  const sync = () => {
    const should = !reduced && intersecting && !document.hidden;
    if (should && !running) {
      running = true;
      last = -1;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  // Reveal once the land map is drawn, so it never pops in during the fade.
  let revealed = false;
  let backupRaf = 0;
  const onLand = () => {
    render();
    if (!revealed) {
      revealed = true;
      reveal(root, reduced, "ready");
    }
  };
  const land = captured.land;
  if (land) {
    land.addEventListener("load", onLand, { once: true });
    land.addEventListener("error", onLand, { once: true });
  } else {
    // No handle on cobe's image: draw frames for a second, then reveal.
    const until = performance.now() + 1000;
    const tick = (now: number) => {
      render();
      if (now < until) backupRaf = requestAnimationFrame(tick);
      else onLand();
    };
    backupRaf = requestAnimationFrame(tick);
  }

  const section = root.closest("section") ?? root;
  const io = reduced
    ? null
    : new IntersectionObserver(
        ([entry]) => {
          intersecting = entry.isIntersecting;
          sync();
        },
        { rootMargin: "160px 0px" }
      );
  io?.observe(section);
  if (!reduced) document.addEventListener("visibilitychange", sync);

  // Only backing-store sizes change here, never layout.
  const ro = new ResizeObserver(() => {
    const nw = host.clientWidth;
    const nh = host.clientHeight;
    if (!nw || !nh || (nw === w && nh === h)) return;
    w = nw;
    h = nh;
    const samples = window.innerWidth < 900 ? 9000 : 14000;
    if (samples !== mapSamples) {
      mapSamples = samples;
      globe.update({ width: w, height: h, mapSamples });
    } else globe.update({ width: w, height: h });
    sizeOverlay();
    if (!running) render();
  });
  ro.observe(host);

  const onLost = () => o.onLost();
  canvas.addEventListener("webglcontextlost", onLost);

  if (debug) {
    window.__globe = {
      setPhi: (v) => {
        frozenPhi = v;
        if (!running) render();
      },
      resume: () => {
        frozenPhi = null;
      },
      showCrosshairs: (show) => {
        crosshairs = show;
        if (!running) render();
      },
      state: () => {
        const m = rotation(phi, THETA);
        const anchors = Array.from(canvas.parentElement?.children ?? []).filter(
          (el): el is HTMLElement => el !== canvas && el instanceof HTMLElement
        );
        const sorted = [...costs].sort((a, b) => a - b);
        return {
          phi,
          theta: THETA,
          w,
          h,
          aspect,
          dpr,
          radius: sphereRadius(h),
          markerPx: { origin: markerRadius(MARKER_SIZE.origin, h), client: markerRadius(MARKER_SIZE.client, h) },
          createMs,
          frameCost: {
            n: sorted.length,
            mean: sorted.reduce((s, v) => s + v, 0) / (sorted.length || 1),
            p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
          },
          elapsed,
          arc: arc ? { name: arc.target.name, e: elapsed - arc.t0 } : null,
          caption: captionOn ? { text: caption.textContent ?? "", opacity: Number(caption.style.opacity) } : null,
          points: confirmed.map((l, i) => {
            const p = rotate(m, toXYZ(l.lat, l.lng));
            const [x, y] = map(p);
            const a = anchors[i];
            return {
              name: l.name,
              x,
              y,
              z: p[2],
              anchorX: a ? (parseFloat(a.style.left) / 100) * w : null,
              anchorY: a ? (parseFloat(a.style.top) / 100) * h : null,
            };
          }),
        };
      },
    };
  }

  // Reduced motion: no loop, one static frame (drawn on land load and on resize).
  sync();

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(backupRaf);
    io?.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", sync);
    canvas.removeEventListener("webglcontextlost", onLost);
    land?.removeEventListener("load", onLand);
    land?.removeEventListener("error", onLand);
    globe.destroy();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    host.replaceChildren();
    gsap.killTweensOf(root);
    hideCaption();
    if (debug) delete window.__globe;
  };
}

/**
 * The hero globe (v3 step 05): cobe's WebGL sphere with a 2D overlay on top
 * (graticule, edge hairline, Muscat's pulse, one arc at a time to a confirmed
 * client, and that client's country name). Both layers share one rAF loop, so
 * they share phi and theta. cobe loads after idle, in its own chunk; the globe
 * fades in after the headline sequence. No WebGL: WorldCanvas, same locations.
 * Decorative: aria-hidden, and the hero reads completely without it.
 */
export default function HeroGlobe({ locations }: { locations: GlobeLocation[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [mode, setMode] = useState<"webgl" | "fallback">("webgl");
  const fallbackDrawn = useRef(false);
  const fallbackWaiter = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (mode !== "webgl") return;
    const root = rootRef.current;
    const host = hostRef.current;
    const overlay = overlayRef.current;
    const caption = captionRef.current;
    if (!root || !host || !overlay || !caption) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settled = heroSettled(4000);
    const sized = whenSized(host);
    let disposed = false;
    let stop: (() => void) | undefined;
    const toFallback = () => {
      stop?.();
      stop = undefined;
      if (!disposed) setMode("fallback");
    };

    (async () => {
      await whenIdle(1600);
      if (disposed) return;
      const { debug, fallback } = readFlags();
      if (fallback || !hasWebGL()) return toFallback();
      const { default: createGlobe } = await import("cobe");
      if (disposed) return;
      // Shader compilation waits for the headline, so it never costs it a frame,
      // and then for an idle period of its own: the settled event fires inside
      // GSAP's last animation frame, and a cold compile can take ~250 ms.
      await settled.promise;
      await sized.promise;
      if (disposed) return;
      await whenIdle(1000);
      if (disposed) return;
      let rebuilt = false;
      const launch = () => {
        stop = startGlobe({
          createGlobe,
          root,
          host,
          overlay,
          caption,
          locations,
          reduced,
          debug,
          onFail: toFallback,
          // A lost context (for example after backgrounding) gets one fresh canvas.
          onLost: () => {
            stop?.();
            stop = undefined;
            if (disposed) return;
            if (rebuilt) toFallback();
            else {
              rebuilt = true;
              launch();
            }
          },
        });
      };
      launch();
    })().catch(toFallback);

    return () => {
      disposed = true;
      settled.cancel();
      sized.cancel();
      stop?.();
      stop = undefined;
    };
  }, [mode, locations]);

  useEffect(() => {
    if (mode !== "fallback") return;
    const root = rootRef.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const settled = heroSettled(4000);
    const drawn = fallbackDrawn.current
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          fallbackWaiter.current = resolve;
        });
    let disposed = false;
    Promise.all([settled.promise, drawn]).then(() => {
      if (!disposed) reveal(root, reduced, "fallback");
    });
    return () => {
      disposed = true;
      settled.cancel();
      fallbackWaiter.current = null;
      gsap.killTweensOf(root);
    };
  }, [mode]);

  const onFallbackFrame = useCallback(() => {
    fallbackDrawn.current = true;
    fallbackWaiter.current?.();
  }, []);

  return (
    <div ref={rootRef} data-globe="loading" className="relative h-full w-full opacity-0">
      {mode === "fallback" ? (
        <WorldCanvas locations={locations} onFirstFrame={onFallbackFrame} />
      ) : (
        <>
          {/* cobe moves its canvas into its own wrapper here, so React renders no children */}
          <div ref={hostRef} className="absolute inset-0" />
          <canvas ref={overlayRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
          <p
            ref={captionRef}
            aria-hidden="true"
            className="type-data pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-xs bg-windsor px-1.5 py-0.5 uppercase text-n300 opacity-0 max-[899px]:hidden"
          />
        </>
      )}
    </div>
  );
}
