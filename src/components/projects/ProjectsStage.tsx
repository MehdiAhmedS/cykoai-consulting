"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { MockupCopy, ProjectScreen } from "@/content/projects";
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

function subscribeDesktop(callback: () => void) {
  const mql = matchMedia(DESKTOP);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
const getDesktop = () => matchMedia(DESKTOP).matches;
const getServerDesktop = () => false;

/**
 * Projects stage (v3 step 07, showcase board A): one frame sticks beside the
 * chapters (CSS sticky, not a pin), and each next project's screen wipes up
 * over the last as its title rises from 98% to 58% of the viewport. The layer
 * moves up from yPercent 100 while its inner layer moves down from -100, so
 * the edge travels and the picture stays put. Captures scroll once through
 * their page while fully uncovered. Reduced motion: screens switch when their
 * chapter becomes active, and nothing moves. Below 1024px there is no stage;
 * chapters show their own screens.
 */
export default function ProjectsStage({ items, illustration, mockups, children }: ProjectsStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktop, getServerDesktop);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(0);

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
          gsap
            .timeline({ scrollTrigger: { trigger: title, start: "top 98%", end: "top 58%", scrub: true } })
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

  return (
    <div
      ref={root}
      className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-[clamp(24px,5vw,72px)]"
    >
      <div className="hidden lg:block">
        <div aria-hidden className="sticky top-[12vh] flex h-[76vh] flex-col justify-center">
          <div className="relative overflow-hidden" style={{ height: FRAME_AREA }}>
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
                  <StageScreen
                    item={item}
                    show={isDesktop && near && mounted.has(i)}
                    illustration={illustration}
                    mockups={mockups}
                  />
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
