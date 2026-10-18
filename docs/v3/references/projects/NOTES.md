# Projects: the stage

**Build plan (approved 27 Sep 2026).**
- **Content:** `projects` moves from `site.ts` to a server-only `src/content/projects.ts`. The section's server component filters by part 3's table and hands the client stage only what renders. Chapters are server-rendered children of the stage.
- **Stage:** a CSS-sticky column (`top: 12vh`, `height: 76vh`). Each layer after the first starts at `translateY(100%)` in CSS. One scrubbed timeline per title (98% → 58%) moves the layer from `yPercent: 100` and its inner layer from `-100`, both with ease "none". Under reduced motion, a `data-shown` attribute switches layers at the active chapter (62%).
- **Captures:** each capture viewport holds a track that always renders. Its tween exists before the image mounts. Images mount at 1024px and wider, once the section is within a screen, as the nearest capture at or before the active chapter plus the next one.
- **Chapters and rows:** the link has no reveal. The More work rows use a new opt-in `focusable` mode on `Reveal` (opacity only), so links stay in the Tab order.
- **Tools:** `scripts/capture-projects.mjs` makes the eight captures. `verify-shots.mjs` gains a repeatable `--scroll=<selector>@<fraction>`.

Studied 27 Sep 2026. Board captures in `board/` first (the `register-26sep/` set no longer applies), then each site in Chrome, then the prompt's `npm run refs -- projects …` commands into `live/<host>/`.

**How it was measured.** Chrome was connected, but the tab reported `document.visibilityState: "hidden"` the whole time (the window seems to sit in its own full-screen space). A hidden tab runs no `requestAnimationFrame`, so:
- In Chrome: screenshots (they force a frame), hovers, DOM structure and computed styles worked. `resize_window` had no effect, so there is no 500px Chrome view.
- Exo Ape never got past its preloader in Chrome, and Darkroom's wipe never moved there.
- All motion timing, every 390px view and the extra captures come from headless Chromium (Playwright, 1440 × 900 and 390 × 844, the refs script's user agents), using the brief's sampler extended with `clip-path` and scroll position. The extra captures are `live/<host>/study-*.jpg`.
- Chrome follows the system theme, which is dark. Darkroom and Metalab are dark-only. 14islands is light in both. Cuberto turns black for its work grid in both, driven by scroll, not by theme.

## Lighthouse baseline (part 1)

Production build of `8982551` (same code as `decebbc`), served by `next start -p 3100`. Lighthouse 12.8.2, simulated throttling, three runs per preset. Medians:

| Preset | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|
| Mobile | 93 | 100 | 100 | 100 | 0.76 s | 3.25 s | 38 ms | 0 | 2.26 s |
| Desktop | 100 | 100 | 100 | 100 | 0.21 s | 0.64 s | 0 ms | 0 | 0.61 s |

- Mobile runs: 93, 93, 93. Desktop runs: 100, 100, 100.
- The LCP element is the hero lede in every run.

## Darkroom (the core of this step)

Captures: `live/darkroom.engineering/desktop-flow-01…10.jpg`, plus `study-midwipe.jpg` (half-way through the second wipe) and `study-mobile-midwipe.jpg`.

- **The sticky frame.**
  - Plain CSS: `position: sticky`, `top: 14px`, `height: 100vh` (900px at 1440 × 900).
  - Its parent section is 300vh (2700px) for three projects: 100vh of scroll per project. The stage travels 200vh while stuck.
  - There are no `.pin-spacer` elements, no `<canvas>` and no `window.gsap`. Lenis drives the scroll (`html.lenis`).
- **Layers.** Three absolutely placed layers fill the stage, each holding a full-bleed `<video>` (`object-fit: cover`) and the project's name.
  - The first layer has `clip-path: none`. The second and third start at `clip-path: inset(100% 0 0)`.
  - Nothing inside a layer moves: the video has no transform. The clip edge travels and the picture stays put.
- **The wipe, against scroll.** Distances are from the moment the section's top reaches the top of the viewport, at 1440 × 900.

  | Scroll | What happens |
  |---|---|
  | −14 px | The stage sticks. The first project is already in place. |
  | 0–450 px (0–50vh) | The first project holds. |
  | 450–900 px (50–100vh) | The second layer wipes up from the bottom: `inset(100% 0 0)` → `inset(0% 0 0)`, linear (6.67% per 30px). |
  | 900–1350 px | The second project holds. |
  | 1350–1800 px | The third layer wipes up the same way. |
  | 1786 px | The stage unsticks, 14px before the third wipe ends. The last project gets no hold on the stuck stage. |

  - It's tied straight to scroll, with no easing and no smoothing of its own. At a steady 450px/s the clip trailed the scroll position by 9–22px (1–3 frames), because it updates on Lenis's next frame. Scrolling back reverses it exactly.
  - Reduced motion changes nothing: the wipe still runs.
- **Names.** They're huge (therma 700, 122px at 1469px wide, −0.05em, red).
  - Each name is sticky inside its layer, centred (top 404px at 900 tall). The clip crops it together with its picture.
  - They're left-aligned, right-aligned, then left-aligned again.
  - Once the stage leaves, the names stay centred for about 400px more, then scroll away.
- **Loading.** The videos are `muted loop`, `preload="none"`, with posters, not `autoplay`. A script plays each one once it's in view.
- **Mobile (390 × 844).** It's the same stage, still sticky: `top: 3.9px`, 844px tall, in a 3 × 844px section, with 75px names. There's no stacked fallback.

**Take:** the CSS-sticky stage, and a linear wipe tied to scroll that reverses exactly, with the edge moving and the picture still.
**Skip:** the red display type, full-bleed video, names clipped inside the picture, and the missing reduced-motion fallback.

## Metalab

Captures: `live/metalab.com/desktop-top.jpg`, `mobile-top.jpg`, `study-hover-uber.jpg`, `study-hover-midjourney.jpg` and `study-mobile-scroll1/2.jpg`.

- **What sits around each project** (1440 × 900, one screen, the stage swaps in place):
  - Services, top left of the panel (378, 174): two services separated by a comma, Basis Grotesque 400, 16/22.4px, −0.01em, white.
  - The media panel, top right (749, 117): 576 × 360, so **16:10**.
  - The name, centred low (496, 624): PP Eiko 240, 88/104px, −0.02em, white, as an `<h1>`.
  - One sentence, bottom right (1086, 787): 16/22.4px, three lines at 212px wide.
- **The device frame.** Metalab draws none. The monitor or phone is part of the photo or render inside the panel.
  - The panel is clipped by an SVG `clipPath` rect with `rx="8"`: an **8px radius**, with no bar, no edge and no shadow.
  - Panel slots change per project (top right 576 × 360; in Chrome at 1469 wide, also about 809 × 431 lower right and 735 × 392 left).
- **The swap, on hover** (from one project to the next):
  - 0 ms: the old panel's clip collapses to zero width over 250ms. The old name fades out over 233ms.
  - 0 ms: the new panel's clip opens from zero to 576px wide over 670ms, with a strong ease-out (63% of the way at a quarter of the time). Its radius grows from 0 to 8px alongside.
  - 0 ms: the new name fades in over 575ms, ease-out. Nothing translates.
  - The active pill gets a 1px white outline (`border-color` transition 0.2s).
- **Mobile.** The page is one screen tall (844px): the heading and the pills only. There's no stage and no panel on a phone.

**Take:** the detail set (the interface in a frame, the name, the services, one sentence), a 16:10 panel with an 8px radius, and an outline or rule as the active cue.
**Skip:** pointing as the only way to switch, the swap per hover, the serif display face, and the moving panel slots.

## Exo Ape (work)

Captures: `live/exoape.com-work/desktop-top.jpg`, `desktop-flow-01/02.jpg` (the flow stops at two: the page takes over the wheel and never scrolls), `study-first.jpg`, `study-after-wheel.jpg` and `study-mobile.jpg`.

- **One project per screen.** The document is exactly one viewport tall (900px). There's a full-bleed image behind, and an inset image of 318 × 396 in the centre (561, 252).
- **Name and category** sit together in the left third, vertically centred:
  - the name at (233, 406): Lausanne, 52/64px, −1.5px (−0.029em), white;
  - the category right under it: about 16/24px at 80% opacity.
  - They're two tones of one voice: nothing between them, no label and no rule.
- **The change** on one wheel step takes about 1.0s:
  - the old title leaves through a line mask over about 500ms;
  - the image layers swap with a clip and a scale from 1.1 to 1 over about 1000ms;
  - the category crossfades over about 1150ms;
  - a "View" cursor follows the mouse.
- **Counter:** "01 / 14" at the bottom right, 14/25px, with the total at 60% opacity.

**Take:** one project in focus at a time, with the name and category sitting close as one unit.
**Skip:** the wheel takeover, the "01 / 14" counter, the custom cursor and the image scale.

## Cuberto

Captures: `live/cuberto.com/desktop-flow-01…08.jpg`, `study-grid.jpg` and `study-mobile-grid.jpg`.

- **Grid.** Two columns of 450px cards at x 216 and 774 (a 108px gutter). The right column starts 135px lower, so the rows stagger.
- **Cards by kind:**
  - landing pages in a monitor: 450 × 608 (about 3:4 portrait);
  - apps in a phone: 450 × 450 (square).
  - The device is part of a rendered image or video inside the card. There's no drawn frame.
  - Radius 18px, `overflow: hidden`.
- **One sentence under each:** Suisse Intl 400, 18/21.6px, white, 450px wide (two lines at most), about 29px under the card. It's a sentence about what was done, with no name above it.
- **Hover:** the still image gives way to a video, and a white circle with an arrow replaces the cursor.
- **Mobile:** one column, 359 × 476 cards, and the sentence at 17.7px.

**Take:** pages shown in a wide screen and apps in a phone; one plain sentence under each.
**Skip:** the soft 18px cards, video on hover, the custom cursor and the staggered columns.

## 14islands

Captures: `live/14islands.com/desktop-top.jpg`, `desktop-flow-01…08.jpg`, `study-list.jpg`, `study-list-hover.jpg` and `study-mobile-list.jpg`.

- **Cards for the best work.** Two columns at 1440: images 661 × 441 (3:2), an 11px gutter, a 4px radius on the image wrapper, 20 cards.
  - Under each image, 25px down: "Name — Category" on one line. AftenScreen 400, 27.2/35.4px, −0.04em. The name is black (#070707); the dash and the category are grey (#a2a2a9).
- **Then a plain list** of 15 more, straight after the cards, with no heading:
  - It sits in the right column only (x 725, 660px wide).
  - It uses the same "Name — Category" line at the same size.
  - Rows are 68.4px: 17px padding above and below, plus the line.
  - A 1px #a2a2a9 hairline sits above and below each row (`::before` and `::after`). There are no images, dates or links styled differently.
- **Rows arriving** (a timeline from the scroll that brings the list in):
  - +516 ms: the first row's hairline draws from `scaleX(0)` to 1 over 1233ms, a strong ease-out (86% at a quarter of the time).
  - +916 ms: the first row's text rises from 41px to 0 over 620ms, and fades in over 1260ms.
  - The next rows follow about 100ms apart (text at +1015, +1233, +1333 ms).
- **Hover:** the dash grows by about 13px and pushes the category right. The colours don't change.
- **Mobile:** the list stays indented (it starts at x 108 of 390). Rows are 56px, with 20px type.

**Take:** large work first, then the rest as a plain list of name and category between hairlines. It's the model for "More work".
**Skip:** the right-column indent, the growing dash, the 1.2–1.5s fades and draws (the brief allows 500–800ms), and the missing heading.

## What this changes for the build

Nothing here argues against the prompt's plan. Where a live value differs, the prompt's value stays:

| Topic | Live value | Prompt value (kept) |
|---|---|---|
| Wipe property | Darkroom animates `clip-path: inset()` | Transforms only: the layer from `yPercent: 100` and its child from `-100`. It looks the same (the edge moves, the picture stays) without repainting each frame. |
| Wipe distance | 50vh of scroll per wipe, with 50vh holds | The title moving from 98% to 58% of the viewport: 40vh |
| Scroll per project | 100vh each | 120vh chapters with a capture, 75vh without |
| Stage | `top: 14px`, `height: 100vh`, full bleed | `top: 12vh`, `height: 76vh`, in a column beside the chapters |
| Frame | Metalab: 16:10 at 576px wide, 8px radius, no bar or edge | 16:10 viewport, 8px radius, plus our 30px bar and 1px `white/10` edge |
| Reduced motion | Darkroom still wipes | Screens switch with no wipe |
| Row reveals | 14islands: 1.2–1.5s, about 100ms apart | `Reveal`, 500–800ms, 60ms apart |
| "More work" heading | 14islands has none | An `<h3>` label, for the outline and screen readers |

Points to carry into the plan:
- **CSS sticky is enough.** Darkroom's stage is plain `position: sticky`, with no pin. This supports the prompt's choice and keeps the two-pin budget free.
- **Ease "none" is right.** Darkroom's wipe is linear and tied straight to scroll. Any smoothing comes from Lenis, not from the tween.
- **The last chapter's hold.** Darkroom's stage leaves as the last wipe ends, so its last project is never seen at rest. In our layout, the hold after the last wipe is the part of the last chapter below its title (the AI workflow mockup, a 75vh chapter). Check that it's long enough to read the mockup before the stage unsticks.
- **Names outside the frame.** Darkroom crops its names inside the picture. Ours live in the chapters, so they stay readable while a wipe crosses the frame.
- **Loading.** Darkroom never preloads a video: posters plus `preload="none"`, played in view. The prompt's "one capture ahead" goes further, and should.
- **Phones.** Metalab drops its stage on phones, and Cuberto and 14islands stack. Only Darkroom keeps a full-screen sticky stage at 390. The prompt's "nothing sticks below 1024px" matches the majority.

## Step 07 checks (27 Sep 2026)

**Mid-wipe, beside Darkroom.** Both frames are half-way through a wipe: the edge travels, and both pictures stay still.

| Darkroom (`live/darkroom.engineering/study-midwipe.jpg`) | Cykoai (`after/07-projects/scroll-project-rabia-al-basri-h3@0.78-1440.png`) |
|---|---|
| ![Darkroom mid-wipe](live/darkroom.engineering/study-midwipe.jpg) | ![Cykoai mid-wipe](../../after/07-projects/scroll-project-rabia-al-basri-h3@0.78-1440.png) |

Darkroom's flow captures (0.9 viewport steps) never land mid-wipe, so the left image is the study's own capture at 75% of a wipe.

**How it was checked.** The Chrome tab still reported `hidden`, so motion, loading and keyboard were checked in headless Chromium (Playwright, 1440 × 900) against `localhost:3000`. The scroll was driven by `__lenis.scrollTo(y, { duration: 5, easing: t => t })`, with a sampler logging every title's `top / innerHeight`, `scrollY`, and each layer's, inner layer's and track's transform on every frame. Chrome was used for screenshots and hovers.

- **Wipe:** each of the six wipes starts at 96.6–97.8% and lands at 56.8–58.0%. The spread comes from sampling: about 2.4% of the viewport per frame at this speed. The layer and its inner layer cancel on every frame (the picture stays still). Scrolling back returns every layer to 100%.
- **Captures:** each moves once, from 0 to −66.67% (its whole page). The first starts as the stage sticks (the grid at 12%); the others start at their own title's 58%. Each ends as the next title reaches 98%. While one moves, its layer is at 0 and the next is at 100%. The only exception is the single boundary frame where one window ends and the next wipe begins; production shows none.
- **Active chapter and strip:** the strip switches at 59–60% going down (the 62% trigger plus one frame for React to render) and follows back up through every chapter.
- **Frame rate:** across the section, 599 frames in 4.98 s (120 fps, the headless display rate). The longest gap is 9.4 ms, with none over 20 ms, on dev and on production.
  - While the hero is on screen, headless frames reach about 190 ms every ~165px, with or without the capture images. That's the three.js globe on software WebGL, not this section.
- **Layout shift:** none during the scroll, and none from `#projects`.
- **Loading:**
  - Nothing is requested at load (the section is 1,000px below the fold).
  - The first two captures (Bukhait Sefrar and Rabia Al Basri) are requested when the section is 99px below the viewport bottom.
  - MONO is requested once Rabia's chapter is active: one ahead.
  - No inline capture is requested at 1440 (they're `display: none` and lazy).
- **Reduced motion:** the screens switch at 62% with no in-between values. Tracks have no transform (each capture shows its top), and no reveal is left hidden.
- **Images removed:** each frame shows its fallback name on windsor-2, and every chapter still reads (`*-noassets.png`).
- **Fit:** the stage fits inside the viewport at all three sizes, the strip sits inside the stage, and no screen is taller than the frame area.

  | Viewport | Stage | Frame area | Frame |
  |---|---|---|---|
  | 1024 × 768 | 92–676 | 445px | 512px wide |
  | 1280 × 720 | 86–634 | 418px | 619px wide |
  | 1440 × 900 | 108–792 | 480px | 653px wide |

- **Hold after the last wipe:** 187px (21vh) at 1440 × 900 before the stage unsticks. The AI workflow mockup then stays in view as the stage scrolls away. It's short, as the study expected; left as specified.
- **Keyboard:** Tab reaches all eight links in the section in order: three chapter links, then five More work rows. Each scrolls into view with its row fully visible. A chapter link's accessible name is "Visit the live page: Bukhait Sefrar (opens in a new tab)". Nothing inside the `aria-hidden` stage or inline screens is focusable, and there are no duplicate ids.
- **verify-shots:** `--full`, `--full --section=#projects` and the four `--scroll` shots, at 390, 768 and 1440, into `docs/v3/after/07-projects/`. The console is clean in every run.
- **Production (`next start -p 3100`):**
  - Four chapters render: HDT Systems, Launch-readiness audits, the device app and AI workflow automation, all illustrations. More work has two rows, and the summary reads "6 projects · 6 in progress".
  - The page HTML has no "TBC", no DRAFT chip, no `v0-` or `vercel.app` link, and none of the hidden names. `.next/static` holds none of those names or links either.
- **Lighthouse (production, three runs per preset, medians):**
  - Mobile: 92, 92 and 92 (baseline 93). LCP 3.35 s, TBT 73 ms, CLS 0.
  - Desktop: 100, 100 and 100 (baseline 100). LCP 0.68 s, CLS 0.
  - Both are within 2 points of the baseline, with accessibility, best practices and SEO at 100.
- **Captures:** made by `scripts/capture-projects.mjs`.
  - Full page: Bukhait Sefrar 154 KB, Asaan Nikah 109 KB, GiGi Energy 86 KB, Voss Architects 270 KB, Hously 206 KB.
  - `--tiles`: Rabia Al Basri 83 KB, MONO 162 KB, Optimus 98 KB.
    - Rabia's full-page capture had a dark blank band. MONO's was blank below its first screen. Optimus's caught its typed headline half-way.
    - Rabia's second and third screens show its scroll-linked story panel, whose text is dim until scrolled through. That's how the page looks at those points.

## Step 07b: HDT Systems' stage piece (18 Oct 2026)

**Plan (as built).**
- **Renderer:** the Offers engine's renderer moved to `src/components/ui/offers3d/renderer.ts`: `createRenderer`, a reference-counted `acquire`/`release` singleton with the size cache, `drawInto` (resize if needed, render, copy into the 2D canvas in the same task) and `disposeTree`. The Offers engine uses it unchanged.
- **Scene:** the study's `sceneControls` and `fillMaterial` are ported into `scenes.ts` as the `hdt` stage builder, with its colours in `constants.ts` (`SOLID.base`, and `SOLID.gold`: Driftwood-soft over `#6E5530`).
- **Stage engine:** `offers3d/stage.ts` ports `stageFrame`: the `ta` and `ts` clocks, `enter` from the wipe's own ScrollTrigger (`onUpdate`/`onRefresh`), a draw only while the layer is partly uncovered and the frame is within 40px, and a reset on each return. It's re-exported from `engine.ts`, so both callers load one chunk. Turbopack had copied `scenes.ts` and the renderer into two chunks when the stage had its own import (+10 KB gzipped).
- **Stage:** `{ kind: "piece"; piece: "hdt" }` renders as a frameless box `FRAME_WIDTH` × `FRAME_AREA` inside `data-stage-inner`, so the wipe is unchanged. The chapter is `lg:min-h-[100vh]`. It's prepared (built, compiled in idle time, first frame drawn) when the chapter before it is active.
- **Stills:** `public/assets/gen/project-hdt-1600.webp` at 7.4 s, from `?offers-still` and `node scripts/render-offer-stills.mjs --only=stage`. It's shown at 16:10 below 1024px and covers the box on the stage (same camera, so the crop matches the live framing).
- **Clean-up:** `AccessReview.tsx`, its `Mockup` case, `"access-review"` and `mockups.accessReview` are gone.

**Baselines (before any code change).** Production build of `0d6da15` plus the uncommitted 17 Oct content edits, served on :3100; Lighthouse 12, three runs per preset, medians.
- Mobile: 90, LCP 3.56 s, TBT 88 ms, CLS 0. Desktop: 100, LCP 0.73 s, TBT 0 ms, CLS 0.
- `.next/static/chunks`: 430,151 B gzipped. three's chunk (`__THREE__`): 585,459 B, 146,042 B gzipped.

**Checks (headless Chromium, 1440 × 900, dev and production).**
- **Entry:** with HDT's title at 90% the layer is at 20% of its wipe and only `ta` runs. `ts` starts at 50%. By 58% the rings lock one by one and turn gold, then the pulse, the beads, the outline, the fill and the check follow. At +7 s it holds the shield with gentle motion (`hdt-*.png` in `docs/v3/after/07b-hdt-piece/`).
- **Never blank:** while Bukhait Sefrar is active the scene is built and its first frame is drawn (one frame, then nothing until the wipe starts).
- **Restart:** with Rabia Al Basri's layer over it, it stops drawing. As that layer uncovers it, scrolling back up, both clocks restart at 0 from loose rings.
- **Contexts:** two live WebGL contexts throughout (the globe's and the shared one), with the Offers pieces drawing and then HDT's, on dev and on production. The two extra contexts created are the WebGL 2 probes, which are lost at once.
- **Fallbacks:** at 390px the chapter shows the still, frameless, at 16:10 with no tag. At 1440 with reduced motion and with `?offers-fallback` the stage shows the still, and no canvas is made.
- **verify-shots:** `--full --section=#projects` with `--scroll` at 90%, 70% and 58%, and `--full`: console clean.
- **`npm run refs -- _self … --at="HDT Systems"`:** it matched the stage's index strip and captured Bukhait Sefrar's layer, so the entry shots above are from the check script. `_self` was deleted.

**Performance after.**
- `.next/static/chunks`: 433,735 B gzipped (+3,584 B). three is still in one chunk: 586,820 B, 146,454 B gzipped (+412 B, the lathe and extrude geometry).
- Mobile: 90, LCP 3.57 s, TBT 101 ms, CLS 0. Desktop: 100, LCP 0.73 s, TBT 1 ms, CLS 0.
- TBT and CLS are within step 11's limits. Mobile LCP is over 2.5 s, as it was before this step: the LCP element is the hero lede, which this step doesn't touch.
