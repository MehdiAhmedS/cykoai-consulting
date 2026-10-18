/**
 * The Projects stage piece's engine (v3 step 07b): HDT Systems' piece, drawn
 * through the Offers pieces' shared renderer (./renderer) into its own 2D
 * canvas. Ported from the study's stageFrame
 * (docs/v3/references/projects/hdt-piece/index.html).
 *
 * Two clocks: ta, the ambient clock, runs from the moment the layer becomes
 * visible; ts, the sequence clock, starts when the layer's wipe reaches
 * halfway. The sequence plays once and holds. Both reset whenever the layer
 * goes from hidden to partly visible.
 *
 * Client-only. ProjectsStage loads it with a dynamic import() of ./engine,
 * which re-exports it, on desktop with motion allowed. Imports from "three" by name only, so three stays in the one
 * chunk it shares with the globe and the Offers pieces.
 */
import { ColorManagement } from "three";
import { gsap } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
import { DRAW, STAGE, STILL, type StagePieceKey } from "./constants";
import { acquire, createRenderer, disposeTree, drawInto, release, type Target } from "./renderer";
import { stageBuilders, type StageClocks, type StagePiece } from "./scenes";

ColorManagement.enabled = false;

export interface StageWipes {
  /** The layer's own wipe, 0 to 1. */
  enter: number;
  /** The next layer's wipe over it, 0 to 1 (0 when there is none). */
  cover: number;
}

export interface StageOptions {
  key: StagePieceKey;
  canvas: HTMLCanvasElement;
  /** The stage's frame area, for the on-screen check. */
  frame: HTMLElement;
  /** The wipes' progress, read from their ScrollTriggers. */
  wipes: () => StageWipes;
  /** No WebGL 2. */
  onFail: () => void;
  /** The context was lost without a deliberate teardown. */
  onLost: () => void;
}

export interface StageEngineState {
  built: boolean;
  drawing: boolean;
  ts: number;
  ta: number;
  enter: number;
  /** Frames drawn since start. */
  frames: number;
}

export interface StageEngine {
  /** Builds the scene, compiles it in idle time and draws its first frame, so the layer never wipes in blank. */
  prepare: () => void;
  stop: () => void;
  state: () => StageEngineState;
}

export function startStage(o: StageOptions): StageEngine {
  const shared = acquire();
  if (!shared) {
    o.onFail();
    return { prepare: () => {}, stop: () => {}, state: () => ({ built: false, drawing: false, ts: 0, ta: 0, enter: 0, frames: 0 }) };
  }
  const { renderer, canvas: gl } = shared;
  let stopped = false;
  let piece: StagePiece | null = null;
  let preparing = false;
  const target: Target = { ctx: o.canvas.getContext("2d"), w: 0, h: 0 };

  // The clocks, and whether the layer was visible last frame.
  let ta = 0;
  let ts = 0;
  let started = false;
  let shown = false;
  let drawing = false;
  let enter = 0;
  let frames = 0;
  // Built and compiled: hidden, the canvas holds the first frame.
  let prepared = false;
  const FIRST: StageClocks = { ts: 0, ta: 0, enter: 0 };

  const ro = new ResizeObserver(([entry]) => {
    const dpr = Math.min(window.devicePixelRatio || 1, DRAW.maxPixelRatio);
    const w = Math.max(2, Math.round(entry.contentRect.width * dpr));
    const h = Math.max(2, Math.round(entry.contentRect.height * dpr));
    if (w === target.w && h === target.h) return;
    target.w = w;
    target.h = h;
    // Setting the size clears the canvas, so only on a change.
    o.canvas.width = w;
    o.canvas.height = h;
    if (prepared && !shown && piece) draw(piece, FIRST);
  });
  ro.observe(o.canvas);

  const build = () => (piece ??= stageBuilders[o.key]());

  const draw = (p: StagePiece, clocks: StageClocks) => {
    if (target.w < 4) return;
    p.update(0, clocks);
    drawInto(target, p.scene, p.camera);
    frames++;
    o.canvas.dataset.piece = "ready";
  };

  const prepare = () => {
    if (stopped || preparing) return;
    preparing = true;
    (async () => {
      const p = build();
      await whenIdle(1000);
      if (stopped) return;
      try {
        renderer.compile(p.scene, p.camera);
      } catch {
        // The first draw compiles it instead.
      }
      prepared = true;
      if (!shown) draw(p, FIRST);
    })();
  };

  const tick = (_time: number, deltaTime: number) => {
    if (stopped || document.hidden) return;
    const dt = Math.min(deltaTime / 1000, DRAW.maxDt);
    const w = o.wipes();
    const r = o.frame.getBoundingClientRect();
    const visible = w.enter > 0 && w.cover < 1 && r.bottom > -STAGE.edge && r.top < window.innerHeight + STAGE.edge;
    drawing = visible;
    if (!visible) {
      shown = false;
      return;
    }
    if (!shown) {
      shown = true;
      ta = 0;
      ts = 0;
      started = false;
    }
    ta += dt;
    if (w.enter >= STAGE.startAt) started = true;
    if (started) ts += dt;
    enter = w.enter;
    draw(build(), { ts, ta, enter });
  };
  gsap.ticker.add(tick);

  const onLost = () => {
    if (!stopped) o.onLost();
  };
  gl.addEventListener("webglcontextlost", onLost);

  const stop = () => {
    if (stopped) return;
    stopped = true;
    // Deliberate: a context loss after this is not a failure.
    gl.removeEventListener("webglcontextlost", onLost);
    gsap.ticker.remove(tick);
    ro.disconnect();
    if (piece) disposeTree(piece.scene);
    delete o.canvas.dataset.piece;
    release();
  };

  return { prepare, stop, state: () => ({ built: !!piece, drawing, ts, ta, enter, frames }) };
}

/**
 * The still image (dev only, via `?offers-still` and
 * scripts/render-offer-stills.mjs): the scene at its still time, drawn at
 * 1600 × 1000 on a transparent background, as a WebP data URL.
 */
export function renderStageStill(key: StagePieceKey): string | { error: string } {
  const gl = document.createElement("canvas");
  const renderer = createRenderer(gl, true);
  if (!renderer) return { error: "no WebGL 2" };
  renderer.setSize(STILL.width, STILL.height, false);
  const out = document.createElement("canvas");
  out.width = STILL.width;
  out.height = STILL.height;
  const ctx = out.getContext("2d");
  if (!ctx) return { error: "no 2D context" };
  const piece = stageBuilders[key]();
  piece.camera.aspect = STILL.width / STILL.height;
  piece.camera.updateProjectionMatrix();
  piece.update(piece.still);
  renderer.render(piece.scene, piece.camera);
  ctx.drawImage(gl, 0, 0);
  const url = out.toDataURL("image/webp", STILL.quality);
  disposeTree(piece.scene);
  renderer.dispose();
  renderer.forceContextLoss();
  return url;
}
