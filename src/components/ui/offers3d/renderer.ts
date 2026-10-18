/**
 * The pieces' one WebGL renderer (v3 steps 06 and 07b), shared by the Offers
 * engine and the Projects stage piece so the page never holds more than two
 * WebGL contexts (this and the globe's). Not in the DOM: each piece is drawn
 * here and copied into its own 2D canvas.
 *
 * A reference-counted singleton: acquire() creates it on first use, release()
 * disposes it when the last user lets go. It keeps the drawing buffer's size,
 * so it resizes only when the target changes.
 */
import {
  LinearSRGBColorSpace,
  WebGLRenderer,
  getConsoleFunction,
  setConsoleFunction,
  type BufferGeometry,
  type Material,
  type Object3D,
  type PerspectiveCamera,
  type Scene,
} from "three";

/**
 * Creates the WebGL 2 context itself and hands it to three, so a missing
 * context never makes three log an error (verify-shots fails on any). Anything
 * three reports while it starts is downgraded to a warning. (The globe
 * engine's, copied: importing it would pull the globe into this chunk.)
 */
export function createRenderer(canvas: HTMLCanvasElement, preserveDrawingBuffer: boolean) {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer,
    powerPreference: "high-performance",
  };
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", attributes);
  } catch {
    return null;
  }
  if (!gl) return null;
  const previous = getConsoleFunction();
  setConsoleFunction((type, message, ...params) => (type === "log" ? console.log : console.warn)(message, ...params));
  try {
    const renderer = new WebGLRenderer({ canvas, context: gl, ...attributes });
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    return renderer;
  } catch {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  } finally {
    setConsoleFunction(previous);
  }
}

export interface SharedRenderer {
  renderer: WebGLRenderer;
  /** The renderer's own canvas, for context-loss listeners. */
  canvas: HTMLCanvasElement;
}

interface Holder extends SharedRenderer {
  refs: number;
  lost: boolean;
  w: number;
  h: number;
}

let held: Holder | null = null;

/** The shared renderer, created on first use; null without WebGL 2 or after the context was lost. */
export function acquire(): SharedRenderer | null {
  if (held) {
    if (held.lost) return null;
    held.refs++;
    return held;
  }
  const canvas = document.createElement("canvas");
  const renderer = createRenderer(canvas, false);
  if (!renderer) return null;
  const h: Holder = { renderer, canvas, refs: 1, lost: false, w: 0, h: 0 };
  canvas.addEventListener("webglcontextlost", () => (h.lost = true));
  held = h;
  return h;
}

/** Lets go of the shared renderer; the last release disposes it and frees its context. */
export function release() {
  if (!held || --held.refs > 0) return;
  const h = held;
  held = null;
  h.renderer.dispose();
  h.renderer.forceContextLoss();
}

/** A 2D canvas to copy into, and its size in device pixels. */
export interface Target {
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
}

/**
 * Draws a scene at the target's size and copies it 1:1 into the target's
 * canvas in the same task, while the drawing buffer still holds the frame.
 */
export function drawInto(target: Target, scene: Scene, camera: PerspectiveCamera) {
  if (!held) return;
  const { renderer, canvas } = held;
  if (held.w !== target.w || held.h !== target.h) {
    renderer.setSize(target.w, target.h, false);
    held.w = target.w;
    held.h = target.h;
  }
  camera.aspect = target.w / target.h;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  target.ctx?.clearRect(0, 0, target.w, target.h);
  target.ctx?.drawImage(canvas, 0, 0);
}

/** Every geometry and material under `root`, each disposed once. */
export function disposeTree(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  root.traverse((o) => {
    const node = o as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
    if (node.geometry) geometries.add(node.geometry);
    if (node.material) for (const m of Array.isArray(node.material) ? node.material : [node.material]) materials.add(m);
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
}
