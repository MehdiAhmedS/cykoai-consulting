"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { MockupCopy, ProjectScreen } from "@/content/projects";
import { STILL, stagePieceStill } from "@/components/ui/offers3d/constants";
import type { StageEngine, StageEngineState } from "@/components/ui/offers3d/stage";
import BrowserFrame from "./BrowserFrame";
import CaptureScreen from "./CaptureScreen";
import MockupScaler from "./MockupScaler";
import Mockup from "./mockups/Mockup";
import PhoneShell from "./PhoneShell";

export interface StageItem {
  id: string;
  name: string;
  short: string;
  screen: Exclude<ProjectScreen, { kind: "none" }>;
  /** The capture's file is listed in project-captures.json. */
  hasCapture: boolean;
}

interface ProjectsStageProps {
  items: StageItem[];
  illustration: string;
  mockups: MockupCopy;
  /** The chapters, rendered on the server; each title carries data-chapter-index. */
  children: React.ReactNode;
}

/** Tailwind's lg, in rem so it agrees with the classes at any root font size. */
const DESKTOP = "(min-width: 64rem)";
const BELOW_DESKTOP = "not all and (min-width: 64rem)";
const MOTION = "(prefers-reduced-motion: no-preference)";

/** How far a capture travels: the part of its 1440x2700 page below a 16:10 (stage) or 16:11 (inline) viewport. */
const travel = (viewport: number) => -(1 - viewport / (2700 / 1440)) * 100;

/** The frame area, and a browser frame no taller than it (bar 30px, two 1px edges, 16:10 viewport). */
const FRAME_AREA = "min(58vh, 480px)";
const FRAME_WIDTH = `min(100%, calc((${FRAME_AREA} - 32px) * 1.6 + 2px))`;

function subscribeMedia(callback: () => void) {
  const mqls = [matchMedia(DESKTOP), matchMedia(MOTION)];
  mqls.forEach((mql) => mql.addEventListener("change", callback));
  return () => mqls.forEach((mql) => mql.removeEventListener("change", callback));
}
const getDesktop = () => matchMedia(DESKTOP).matches;
const getServerFalse = () => false;

let flags: { fallback: boolean; still: boolean; debug: boolean } | null = null;

/** The Offers pieces' dev-only query flags, which the stage piece follows too. Read once. */
function readFlags() {
  if (!flags) {
    const params = new URLSearchParams(window.location.search);
    const dev = process.env.NODE_ENV !== "production";
    flags = {
      fallback: dev && params.has("offers-fallback"),
      still: dev && params.has("offers-still"),
      debug: dev && params.has("offers-debug"),
    };
  }
  return flags;
}

/** The stage piece runs from 1024px with motion allowed; otherwise it's its still image. */
const getPieceLive = () => {
  const f = readFlags();
  return matchMedia(DESKTOP).matches && matchMedia(MOTION).matches && !f.fallback && !f.still;
};

declare global {
  interface Window {
    __stagePiece?: { state: () => StageEngineState | undefined };
    __stagePieceStills?: Record<string, string> | { error: string };
  }
}

/**
 * Projects stage (v3 step 07, showcase board A): one frame sticks beside the
 * chapters (CSS sticky, not a pin), and each next project's screen wipes up
 * over the last as its title rises from 98% to 58% of the viewport. The layer
 * moves up from yPercent 100 while its inner layer moves down from -100, so
 * the edge travels and the picture stays put. Captures scroll once through
 * their page while fully uncovered. Reduced motion: screens switch when their
 * chapter becomes active, and nothing moves. Below 1024px there is no stage;
 * chapters show their own screens.
 *
 * A piece screen (HDT Systems, step 07b) is a three.js piece drawn by
 * ../ui/offers3d/stage (loaded with the Offers engine's chunk) through the
 * Offers pieces' shared renderer. It rises
 * with its wipe, whose progress the wipe's ScrollTrigger reports, and starts
 * halfway through it. Reduced motion, no WebGL 2 and `?offers-fallback` show
 * its still image.
 */
export default function ProjectsStage({ items, illustration, mockups, children }: ProjectsStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribeMedia, getDesktop, getServerFalse);
  const pieceLive = useSyncExternalStore(subscribeMedia, getPieceLive, getServerFalse);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(0);

  // The stage piece: its index, canvas, engine, and its wipes' progress by layer.
  const pieceIndex = items.findIndex((item) => item.screen.kind === "piece");
  const piece = pieceIndex >= 0 ? (items[pieceIndex].screen as Extract<ProjectScreen, { kind: "piece" }>).piece : null;
  const frameRef = useRef<HTMLDivElement>(null);
  const pieceCanvas = useRef<HTMLCanvasElement>(null);
  const pieceEngine = useRef<StageEngine | null>(null);
  const wipes = useRef<number[]>([]);
  const activeRef = useRef(active);
  // No WebGL 2, or the context was lost: the still from then on.
  const [pieceFailed, setPieceFailed] = useState(false);
  const pieceMode = pieceLive && !pieceFailed ? "engine" : "still";

  const captures = useMemo(
    () => items.flatMap((item, i) => (item.screen.kind === "capture" && item.hasCapture ? [i] : [])),
    [items]
  );
  /** The nearest capture at or before the active chapter, and the next one after it (mockups between are skipped). */
  const reach = useCallback(
    (i: number) => {
      const before = captures.filter((k) => k <= i).at(-1);
      const after = captures.find((k) => k > i);
      return [before, after].filter((k): k is number => k !== undefined);
    },
    [captures]
  );
  const [mounted, setMounted] = useState(() => new Set(reach(0)));

  const go = useCallback(
    (i: number) => {
      setActive(i);
      setMounted((prev) => {
        const add = reach(i).filter((k) => !prev.has(k));
        return add.length ? new Set([...prev, ...add]) : prev;
      });
    },
    [reach]
  );

  // Nothing loads until the section is within one screen height.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const titles = [...el.querySelectorAll<HTMLElement>("[data-chapter-index]")].sort(
      (a, b) => Number(a.dataset.chapterIndex) - Number(b.dataset.chapterIndex)
    );
    const layers = [...el.querySelectorAll<HTMLElement>("[data-stage-layer]")];

    // The active chapter (both motion modes): its title has passed 62% of the viewport.
    const ctx = gsap.context(() => {
      titles.forEach((title, i) => {
        if (i === 0) return;
        ScrollTrigger.create({
          trigger: title,
          start: "top 62%",
          onEnter: () => go(i),
          onLeaveBack: () => go(i - 1),
        });
      });
    }, el);

    const mm = gsap.matchMedia();

    mm.add(`${DESKTOP} and ${MOTION}`, () => {
      titles.forEach((title, i) => {
        const layer = layers[i];
        if (!layer) return;

        // The wipe: scrubbed to the title's rise from 98% to 58%. y:0 because
        // GSAP reads the class's translateY(100%) as pixels.
        if (i > 0) {
          const inner = layer.querySelector("[data-stage-inner]");
          // The stage piece reads each wipe's progress from here: no second trigger.
          const report = (self: ScrollTrigger) => {
            wipes.current[i] = self.progress;
          };
          gsap
            .timeline({
              scrollTrigger: {
                trigger: title,
                start: "top 98%",
                end: "top 58%",
                scrub: true,
                onUpdate: report,
                onRefresh: report,
              },
            })
            .fromTo(layer, { y: 0, yPercent: 100 }, { yPercent: 0, ease: "none" }, 0)
            .fromTo(inner, { yPercent: -100 }, { yPercent: 0, ease: "none" }, 0);
        }

        // A capture scrolls once, top to bottom, while its layer is fully
        // uncovered: from its own wipe's end (the stage sticking, for the
        // first) to the next wipe's start; the last runs for 90% of its chapter.
        const track = layer.querySelector("[data-capture-track]");
        if (!track) return;
        const next = titles[i + 1];
        const chapter = title.closest("article");
        const until = next
          ? { endTrigger: next, end: "top 98%" }
          : { end: () => `+=${(chapter?.offsetHeight ?? 0) * 0.9}` };
        gsap.fromTo(
          track,
          { yPercent: 0 },
          {
            yPercent: travel(10 / 16),
            ease: "none",
            scrollTrigger: {
              ...(i === 0 ? { trigger: el, start: "top 12%" } : { trigger: title, start: "top 58%" }),
              ...until,
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );
      });
      return () => {
        wipes.current = [];
      };
    });

    // Below 1024px each inline capture scrolls through its page as its chapter crosses the viewport.
    mm.add(`${BELOW_DESKTOP} and ${MOTION}`, () => {
      el.querySelectorAll<HTMLElement>('[data-capture-track="inline"]').forEach((track) => {
        gsap.fromTo(
          track,
          { yPercent: 0 },
          {
            yPercent: travel(11 / 16),
            ease: "none",
            scrollTrigger: { trigger: track.closest("article"), start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    });

    // A late font swap can re-split and re-centre a title: measure again.
    let live = true;
    document.fonts.ready.then(() => {
      if (live) ScrollTrigger.refresh();
    });

    return () => {
      live = false;
      mm.revert();
      ctx.revert();
    };
  }, [go]);

  /* ---- the stage piece ---- */

  useEffect(() => {
    if (pieceMode !== "engine" || !near || !piece) return;
    let disposed = false;
    const fail = () => {
      pieceEngine.current?.stop();
      pieceEngine.current = null;
      if (!disposed) setPieceFailed(true);
    };
    import("@/components/ui/offers3d/engine")
      .then((m) => {
        const canvas = pieceCanvas.current;
        const frame = frameRef.current;
        if (disposed || !canvas || !frame) return;
        pieceEngine.current = m.startStage({
          key: piece,
          canvas,
          frame,
          wipes: () => ({ enter: wipes.current[pieceIndex] ?? 0, cover: wipes.current[pieceIndex + 1] ?? 0 }),
          onFail: fail,
          onLost: fail,
        });
        // The chapter before it is already active: ready it now.
        if (activeRef.current >= pieceIndex - 1) pieceEngine.current?.prepare();
      })
      .catch(fail);
    return () => {
      disposed = true;
      pieceEngine.current?.stop();
      pieceEngine.current = null;
    };
  }, [pieceMode, near, piece, pieceIndex]);

  // When the chapter before it becomes active, the piece builds, compiles and draws its first frame.
  useEffect(() => {
    activeRef.current = active;
    if (pieceIndex >= 0 && active >= pieceIndex - 1) pieceEngine.current?.prepare();
  }, [active, pieceIndex]);

  // `?offers-debug` (dev): the piece's clocks.
  useEffect(() => {
    if (!readFlags().debug) return;
    window.__stagePiece = { state: () => pieceEngine.current?.state() };
    return () => {
      delete window.__stagePiece;
    };
  }, []);

  // `?offers-still` (dev): renders the piece's still for scripts/render-offer-stills.mjs.
  useEffect(() => {
    if (!readFlags().still || !piece) return;
    let cancelled = false;
    import("@/components/ui/offers3d/engine")
      .then((m) => {
        if (cancelled) return;
        const url = m.renderStageStill(piece);
        window.__stagePieceStills = typeof url === "string" ? { [piece]: url } : url;
      })
      .catch((e) => {
        window.__stagePieceStills = { error: String(e) };
      });
    return () => {
      cancelled = true;
    };
  }, [piece]);

  return (
    <div
      ref={root}
      className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-[clamp(24px,5vw,72px)]"
    >
      <div className="hidden lg:block">
        <div aria-hidden className="sticky top-[12vh] flex h-[76vh] flex-col justify-center">
          <div ref={frameRef} className="relative overflow-hidden" style={{ height: FRAME_AREA }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                data-stage-layer={i}
                data-shown={i <= active ? "" : undefined}
                className={cn(
                  "absolute inset-0 overflow-hidden bg-windsor",
                  i > 0 && "[transform:translateY(100%)] data-shown:[transform:none]"
                )}
              >
                <div data-stage-inner className="absolute inset-0 flex items-center justify-center">
                  {item.screen.kind === "piece" ? (
                    <PieceScreen
                      piece={item.screen.piece}
                      mode={pieceMode}
                      show={isDesktop && near}
                      canvasRef={pieceCanvas}
                    />
                  ) : (
                    <StageScreen
                      item={item}
                      show={isDesktop && near && mounted.has(i)}
                      illustration={illustration}
                      mockups={mockups}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-4 gap-x-5 gap-y-3">
            {items.map((item, i) => (
              <span
                key={item.id}
                className={cn(
                  "type-label truncate border-t pt-2",
                  i === active ? "border-driftwood text-white" : "border-white/12 text-n300"
                )}
              >
                {item.short}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

/**
 * The stage piece's box: FRAME_WIDTH wide and FRAME_AREA tall, centred where
 * the browser frames sit, with no frame and no tag. Its canvas is transparent,
 * so the layer's Windsor shows through. The still is the same camera at 16:10,
 * so covering the box crops it as the live piece is framed.
 */
function PieceScreen({
  piece,
  mode,
  show,
  canvasRef,
}: {
  piece: Extract<ProjectScreen, { kind: "piece" }>["piece"];
  mode: "engine" | "still";
  show: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div className="relative" style={{ width: FRAME_WIDTH, height: FRAME_AREA }}>
      {mode === "engine" && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
      {mode === "still" && show && (
        <Image
          src={stagePieceStill(piece)}
          width={STILL.width}
          height={STILL.height}
          sizes="(min-width: 1024px) 50vw, 100vw"
          quality={70}
          alt=""
          loading="eager"
          data-gen-asset=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function StageScreen({
  item,
  show,
  illustration,
  mockups,
}: {
  item: StageItem;
  show: boolean;
  illustration: string;
  mockups: MockupCopy;
}) {
  const { screen } = item;
  if (screen.kind === "piece") return null; // PieceScreen
  if (screen.kind === "phone-shell") return <PhoneShell tag={illustration} variant="stage" />;
  if (screen.kind === "mockup") {
    return (
      <BrowserFrame label={screen.label} tag={illustration} style={{ width: FRAME_WIDTH }}>
        <MockupScaler>
          <Mockup kind={screen.mockup} copy={mockups} />
        </MockupScaler>
      </BrowserFrame>
    );
  }
  return (
    <BrowserFrame label={screen.label} style={{ width: FRAME_WIDTH }}>
      <CaptureScreen name={item.name} slug={screen.slug} show={show && item.hasCapture} track="stage" />
    </BrowserFrame>
  );
}
