"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { GlobeLocation } from "@/content/site";
import { ENGINE_MIN_WIDTH, LAND_URL, STILL } from "@/components/ui/globe/constants";
import { gsap } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";

declare global {
  interface Window {
    /** `?globe-still` (dev): the still frame as WebP data URLs, for scripts/render-globe-still.mjs. */
    __globeStill?: Record<800 | 1600, string> | { error: string };
  }
}

type Mode = "engine" | "still";

const WIDE = `(min-width: ${ENGINE_MIN_WIDTH}px)`;

let env: { reduced: boolean; debug: boolean; fallback: boolean; still: boolean } | null = null;

/** Reduced motion and the dev-only query flags, read once (presence is enough: scripts may drop the `=1`). */
function readEnv() {
  if (!env) {
    const params = new URLSearchParams(window.location.search);
    const dev = process.env.NODE_ENV !== "production";
    env = {
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      debug: dev && params.has("globe-debug"),
      fallback: dev && params.has("globe-fallback"),
      still: dev && params.has("globe-still"),
    };
  }
  return env;
}

function subscribeWide(callback: () => void) {
  const mql = matchMedia(WIDE);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/** The engine runs only from 900 px, with motion allowed; everything else gets the still frame. */
function getMode(): Mode {
  const e = readEnv();
  return !e.reduced && !e.fallback && !e.still && matchMedia(WIDE).matches ? "engine" : "still";
}

const getServerMode = () => null;

/** three.js r163 and later need WebGL 2, so only that is probed. */
function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
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

/** Back to hidden and loading, for a fresh start (a mode switch or a rebuild). */
function reset(root: HTMLElement) {
  gsap.killTweensOf(root);
  gsap.set(root, { opacity: 0 });
  root.dataset.globe = "loading";
}

function reveal(root: HTMLElement, reduced: boolean) {
  if (reduced) gsap.set(root, { opacity: 1 });
  else gsap.to(root, { opacity: 1, duration: 0.8, ease: "expo.out" });
}

async function fetchLand() {
  const res = await fetch(LAND_URL);
  if (!res.ok) throw new Error(`${LAND_URL}: ${res.status}`);
  return res.arrayBuffer();
}

/** `?globe-still` (dev): renders the still frame with the engine and hands it to the script. */
async function makeStill(locations: GlobeLocation[]) {
  try {
    const [engine, land] = await Promise.all([import("./globe/engine"), fetchLand()]);
    window.__globeStill = engine.renderStill(locations, land) ?? { error: "no WebGL 2" };
  } catch (e) {
    window.__globeStill = { error: String(e) };
  }
}

/**
 * The hero globe (v3 step 05b). From 900 px, with motion allowed and WebGL 2,
 * the three.js engine (./globe/engine) runs: a lit sphere, land dots, the
 * graticule, and arcs from Muscat that travel and land, up to three at once,
 * while the globe sways between 62° and 100° east. It loads after the
 * headline settles, in its own chunk, with the land data alongside.
 * Everywhere else (phones, reduced motion, no WebGL, `?globe-fallback`), a
 * pre-rendered still frame of the same scene is drawn into a 2D canvas, and
 * neither the engine nor the land data is requested. Both fade in after the
 * headline. Decorative: aria-hidden, and the hero reads completely without it.
 */
export default function HeroGlobe({ locations }: { locations: GlobeLocation[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  // Decided on mount; crossing 900 px switches modes.
  const preferred = useSyncExternalStore(subscribeWide, getMode, getServerMode);
  // No WebGL 2, or the engine lost its context twice: the still frame from then on.
  const [engineFailed, setEngineFailed] = useState(false);
  const mode: Mode | null = preferred === "engine" && engineFailed ? "still" : preferred;

  useEffect(() => {
    if (mode !== "engine") return;
    const root = rootRef.current;
    const host = hostRef.current;
    const caption = captionRef.current;
    if (!root || !host || !caption) return;

    reset(root);
    const hero = root.closest("section") ?? root;
    const headline = hero.querySelector<HTMLElement>("[data-hero-lines]");
    const { debug } = readEnv();
    const settled = heroSettled(4000);
    const sized = whenSized(host);
    let disposed = false;
    let stop: (() => void) | undefined;
    const toStill = () => {
      stop?.();
      stop = undefined;
      if (!disposed) setEngineFailed(true);
    };

    (async () => {
      await whenIdle(1600);
      if (disposed) return;
      if (!hasWebGL()) return toStill();
      // three loads after the headline's sequence, so parsing it never costs the line rise a frame.
      await settled.promise;
      if (disposed) return;
      const [engine, land] = await Promise.all([import("./globe/engine"), fetchLand()]);
      if (disposed) return;
      await sized.promise;
      if (disposed) return;
      // The scene is built in an idle slot; the engine compiles its shaders in another.
      await whenIdle(1000);
      if (disposed) return;
      let rebuilt = false;
      const launch = () => {
        stop = engine.startGlobe({
          host,
          caption,
          hero,
          headline,
          places: locations,
          land,
          debug,
          onFirstFrame: () => {
            if (disposed) return;
            root.dataset.globe = "ready";
            reveal(root, false);
          },
          onFail: toStill,
          // An unexpected lost context (for example after backgrounding) gets one fresh canvas.
          onLost: () => {
            stop?.();
            stop = undefined;
            if (disposed) return;
            if (rebuilt) return toStill();
            rebuilt = true;
            reset(root);
            launch();
          },
        });
      };
      launch();
    })().catch(toStill);

    return () => {
      disposed = true;
      settled.cancel();
      sized.cancel();
      stop?.();
      stop = undefined;
      gsap.killTweensOf(root);
    };
  }, [mode, locations]);

  useEffect(() => {
    if (mode !== "still") return;
    const root = rootRef.current;
    const canvas = stillRef.current;
    if (!root || !canvas) return;

    reset(root);
    const { reduced, still } = readEnv();
    if (still) void makeStill(locations);
    const settled = heroSettled(4000);
    let disposed = false;
    let image: HTMLImageElement | null = null;
    let file: 800 | 1600 = STILL.small;

    const scale = () => Math.min(window.devicePixelRatio || 1, 2);
    /** The 800 or 1600 file, by the canvas's device-pixel width. */
    const pick = () => (canvas.clientWidth * scale() > STILL.small ? STILL.size : STILL.small);
    const load = async (size: 800 | 1600) => {
      const img = new Image();
      img.decoding = "async";
      img.src = STILL.files[size];
      await img.decode();
      return img;
    };
    const draw = () => {
      const ctx = canvas.getContext("2d");
      const w = Math.round(canvas.clientWidth * scale());
      const h = Math.round(canvas.clientHeight * scale());
      if (!ctx || !image || !w || !h) return false;
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, w, h);
      return true;
    };
    const fail = () => {
      if (!disposed) root.dataset.globe = "none";
    };

    // A canvas, not an <img>, so the still frame is never the LCP candidate on phones.
    (async () => {
      await whenIdle(1600);
      if (disposed) return;
      file = pick();
      const img = await load(file);
      if (disposed) return;
      image = img;
      await settled.promise;
      if (disposed) return;
      if (!draw()) return fail();
      root.dataset.globe = "still";
      reveal(root, reduced);
    })().catch(fail);

    const ro = new ResizeObserver(() => {
      if (!image || disposed) return;
      const want = pick();
      if (want > file) {
        file = want;
        load(want)
          .then((img) => {
            if (disposed) return;
            image = img;
            draw();
          })
          .catch(() => {});
      } else draw();
    });
    ro.observe(canvas);

    return () => {
      disposed = true;
      settled.cancel();
      ro.disconnect();
      gsap.killTweensOf(root);
    };
  }, [mode, locations]);

  return (
    <div ref={rootRef} data-globe="loading" className="relative h-full w-full opacity-0">
      {mode === "engine" && (
        <>
          {/* The engine appends a fresh <canvas> here on every start. */}
          <div ref={hostRef} className="absolute inset-0" />
          <p
            ref={captionRef}
            aria-hidden="true"
            className="type-data pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-xs bg-windsor px-1.5 py-0.5 uppercase text-n300 opacity-0 max-[899px]:hidden"
          />
        </>
      )}
      {mode === "still" && (
        <canvas ref={stillRef} data-gen-asset aria-hidden="true" className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
