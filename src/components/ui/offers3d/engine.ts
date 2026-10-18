/**
 * The Offers pieces' engine (v3 step 06): the shared renderer (./renderer),
 * not in the DOM, draws each open, on-screen row's scene and copies it into
 * that row's own 2D canvas, so the page never holds more than two WebGL
 * contexts (that and the globe's). Ported from the Cowork study's loop.
 *
 * Client-only. OffersList loads it with a dynamic import() once the section
 * is near and the globe has started. Imports from "three" by name only, so
 * three stays in one chunk shared with the globe engine.
 */
import {
  ColorManagement,
  type Scene,
} from "three";
import { gsap } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { CAMERA, DRAW, STILL, type PieceKey } from "./constants";
import { acquire, createRenderer, disposeTree, drawInto, release } from "./renderer";
import { builders, type Piece } from "./scenes";

// The Projects stage piece's engine ships in this chunk too: one dynamic import
// for both keeps the scenes and the shared renderer in a single copy.
export { renderStageStill, startStage } from "./stage";

// Hex values render as written. The three module is shared with the globe,
// which may not have run yet.
ColorManagement.enabled = false;

export interface OfferView {
  id: string;
  key: PieceKey;
  /** The row's 2D canvas; its row carries data-open while open. */
  canvas: HTMLCanvasElement;
}

export interface OffersEngineState {
  fps: number;
  frameCost: { n: number; mean: number; p95: number };
  /** Draw calls in each piece's last render. */
  calls: Record<string, number>;
  /** The rows drawn in the last frame. */
  drawing: string[];
  /** renderer.info.render.frame: stops advancing when nothing draws. */
  frame: number;
  built: string[];
}

export interface OffersOptions {
  views: OfferView[];
  debug: boolean;
  /** No WebGL 2 context. */
  onFail: () => void;
  /** The context was lost without a deliberate teardown. */
  onLost: () => void;
}

interface Slot {
  view: OfferView;
  row: HTMLElement | null;
  ctx: CanvasRenderingContext2D | null;
  piece: Piece | null;
  /** Device-pixel size of the row's canvas. */
  w: number;
  h: number;
  ready: boolean;
}

/**
 * Starts the pieces and returns their teardown and a state reader. Scenes are
 * built one per idle slot and compiled with compileAsync; a row that opens
 * before its scene is warm gets it built on the spot.
 */
export function startOffers(o: OffersOptions): { stop: () => void; state: () => OffersEngineState } {
  const shared = acquire();
  if (!shared) {
    o.onFail();
    return { stop: () => {}, state: () => ({ fps: 0, frameCost: { n: 0, mean: 0, p95: 0 }, calls: {}, drawing: [], frame: 0, built: [] }) };
  }
  const { renderer, canvas: gl } = shared;
  let stopped = false;

  const slots: Slot[] = o.views.map((view) => ({
    view,
    row: view.canvas.closest<HTMLElement>("[data-offer]"),
    ctx: view.canvas.getContext("2d"),
    piece: null,
    w: 0,
    h: 0,
    ready: false,
  }));

  // Each 2D canvas in device pixels: its CSS width × min(dpr, 2), height = width ÷ 1.6.
  const observers = slots.map((s) => {
    const ro = new ResizeObserver(([entry]) => {
      const cssW = entry.contentRect.width;
      if (!cssW) return;
      const dpr = Math.min(window.devicePixelRatio || 1, DRAW.maxPixelRatio);
      const w = Math.max(2, Math.round(cssW * dpr));
      const h = Math.max(2, Math.round(w / CAMERA.aspect));
      if (w === s.w && h === s.h) return;
      s.w = w;
      s.h = h;
      // Setting the size clears the canvas, so only on a change.
      s.view.canvas.width = w;
      s.view.canvas.height = h;
    });
    ro.observe(s.view.canvas);
    return ro;
  });

  const build = (s: Slot) => (s.piece ??= builders[s.view.key](false));

  const draw = (s: Slot, piece: Piece) => {
    drawInto(s, piece.scene, piece.camera);
    if (!s.ready) {
      s.ready = true;
      s.view.canvas.dataset.piece = "ready";
    }
  };

  /* ---- the loop, on GSAP's ticker (after Lenis and the rows' check) ---- */

  let t = 0;
  const costs: number[] = [];
  const calls: Record<string, number> = {};
  let drawing: string[] = [];
  let fps = 0;
  let fpsFrames = 0;
  let fpsAt = performance.now();

  const tick = (_time: number, deltaTime: number) => {
    if (stopped || document.hidden) return;
    const dt = Math.min(deltaTime / 1000, DRAW.maxDt);
    t += dt;
    const vh = window.innerHeight;
    const centre = vh / 2;
    const near: { s: Slot; d: number }[] = [];
    for (const s of slots) {
      if (s.w < 4 || !s.row?.hasAttribute("data-open")) continue;
      const r = s.view.canvas.getBoundingClientRect();
      if (r.bottom < -DRAW.edge || r.top > vh + DRAW.edge) continue;
      near.push({ s, d: Math.abs((r.top + r.bottom) / 2 - centre) });
    }
    near.sort((a, b) => a.d - b.d);
    const started = o.debug ? performance.now() : 0;
    drawing = [];
    for (const { s } of near.slice(0, DRAW.max)) {
      const piece = build(s);
      piece.update(t, dt);
      draw(s, piece);
      drawing.push(s.view.id);
      if (o.debug) calls[s.view.id] = renderer.info.render.calls;
    }
    if (o.debug) {
      if (drawing.length) {
        costs.push(performance.now() - started);
        if (costs.length > 600) costs.shift();
      }
      fpsFrames++;
      const now = performance.now();
      if (now - fpsAt >= 1000) {
        fps = (fpsFrames * 1000) / (now - fpsAt);
        fpsFrames = 0;
        fpsAt = now;
      }
    }
  };
  gsap.ticker.add(tick);

  // Warm-up: one scene per idle slot, its shaders compiled off the critical path.
  (async () => {
    for (const s of slots) {
      await whenIdle(1000);
      if (stopped) return;
      if (s.piece) continue;
      const piece = build(s);
      try {
        await renderer.compileAsync(piece.scene, piece.camera);
      } catch {
        // The first draw compiles it instead.
      }
    }
  })();

  const onLost = () => {
    if (!stopped) o.onLost();
  };
  gl.addEventListener("webglcontextlost", onLost);

  const stop = () => {
    if (stopped) return;
    stopped = true;
    // Deliberate: the context loss forced below is not a failure.
    gl.removeEventListener("webglcontextlost", onLost);
    gsap.ticker.remove(tick);
    observers.forEach((ro) => ro.disconnect());
    for (const s of slots) {
      if (s.piece) disposeTree(s.piece.scene);
      delete s.view.canvas.dataset.piece;
    }
    release();
  };

  const state = (): OffersEngineState => {
    const sorted = [...costs].sort((a, b) => a - b);
    return {
      fps,
      frameCost: {
        n: sorted.length,
        mean: sorted.reduce((sum, v) => sum + v, 0) / (sorted.length || 1),
        p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      },
      calls: { ...calls },
      drawing: [...drawing],
      frame: renderer.info.render.frame,
      built: slots.filter((s) => s.piece).map((s) => s.view.id),
    };
  };

  return { stop, state };
}

/**
 * The still images (dev only, via `?offers-still` and
 * scripts/render-offer-stills.mjs): each scene built fresh, snapped, updated
 * once at its still time and drawn at 1600 × 1000 on a transparent
 * background. Returns one WebP data URL per offer id.
 */
export function renderStills(views: { id: string; key: PieceKey }[]): Record<string, string> | { error: string } {
  const gl = document.createElement("canvas");
  const renderer = createRenderer(gl, true);
  if (!renderer) return { error: "no WebGL 2" };
  renderer.setSize(STILL.width, STILL.height, false);
  const out = document.createElement("canvas");
  out.width = STILL.width;
  out.height = STILL.height;
  const ctx = out.getContext("2d");
  if (!ctx) return { error: "no 2D context" };
  const urls: Record<string, string> = {};
  for (const v of views) {
    const piece = builders[v.key](true);
    piece.camera.aspect = STILL.width / STILL.height;
    piece.camera.updateProjectionMatrix();
    piece.update(piece.still, 0);
    renderer.render(piece.scene as Scene, piece.camera);
    ctx.clearRect(0, 0, STILL.width, STILL.height);
    ctx.drawImage(gl, 0, 0);
    urls[v.id] = out.toDataURL("image/webp", STILL.quality);
    disposeTree(piece.scene);
  }
  renderer.dispose();
  renderer.forceContextLoss();
  return urls;
}
