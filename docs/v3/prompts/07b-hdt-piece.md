# Step 07b · Projects: HDT Systems' stage piece (decided 18 October)

Read `docs/v3/BRIEF.md` first. HDT Systems has no screens to show, so today its chapter on the Projects stage shows the Access review illustration. This step replaces it with a three.js piece of the work:

- Google Workspace as a rack of servers;
- four rings, one for each of ISO/IEC 27001's control themes, that lock into line around it;
- a shield that fills with gold above the servers.

Mehdi approved it in Cowork on 18 October. It was concept B of the HDT study, "Control rings".

It runs after 06, because it shares the Offers pieces' engine. It doesn't depend on step 10.

## 1. The design source

This step has no reference study; go straight to the plan. The design is `docs/v3/references/projects/hdt-piece/index.html`. It comes from Cowork with this prompt, so it goes in the `v3(docs)` commit with the prompt and brief updates.

- **Read its module script before planning.** Port these exactly:
  - `sceneControls`: the piece, with its geometry, cameras, timings and colours;
  - `fillMaterial`: the shield's face;
  - `stageWipe` and `stageFrame`: how the piece enters on the stage.

  The rest of the page is a sketch.
- **To watch it run,** serve the repo root with `python3 -m http.server 3300` and open `http://localhost:3300/docs/v3/references/projects/hdt-piece/`.
  - It loads three.js from jsDelivr and the two captures from `public/assets/projects/`.
  - The card loops the sequence every 11 seconds, so it can be watched.
  - The scrolling box below the card shows how the site plays it.

When the plan is approved, add a "Step 07b" heading with a few lines to `docs/v3/references/projects/NOTES.md`.

**Baselines:** before changing any code, make a production build of the current commit and record these in NOTES.md:

- the Lighthouse medians: three runs per preset, mobile and desktop, served on :3100;
- the total gzipped size of `.next/static/chunks`, and the size of the chunk that contains `__THREE__`.

## 2. The piece

This is for reference; the study's code is the source of truth.

- **The servers:**
  - a three-unit rack between two plates, on four corner posts;
  - each unit has vents, a drive bay and three status lights;
  - the lights blink grey and white until the rings have locked, then turn steady Driftwood-soft.
- **The rings:**
  - four tori, with radii 1.32, 1.10, 0.89 and 0.69;
  - each has 48 ticks and one person figure (a head on a rounded bust);
  - they spin loose on tilted axes;
  - one by one they settle flat around the rack, starting at 1.0, 1.85, 2.7 and 3.55 seconds and taking 1.05 s each;
  - the four people end up spread across the front, and each ring turns gold as it settles.
- **The shield:**
  - at 4.6 seconds a gold pulse spreads out from the rack;
  - 36 gold beads spiral up from the rings into the outline of a shield above it;
  - the outline draws itself;
  - the gold face fills from the tip up, using the `uFill` shader cut-off with a bright edge at the fill line;
  - a check mark pops in;
  - the camera tilts up to keep the shield in frame.
- **Nothing written on it.** There is no text, no tag, no "Illustration" label and no Google logo or other brand mark (Mehdi, 18 October). It's the one screen on the stage without the tag.

## 3. On the stage

### The screen

- **The screen kind:** add `{ kind: "piece"; piece: "hdt" }` to `ProjectScreen` in `projects.ts`, and give HDT Systems that screen.
- **Frameless:** `StageScreen` renders the piece in a box `FRAME_WIDTH` wide and `FRAME_AREA` tall, centred where the browser frames sit.
  - The box holds a 2D canvas that fills it.
  - The canvas is transparent, so the layer's Windsor shows through.
  - There is no `BrowserFrame` and no tag.
- **The wipe:** the box sits inside the layer's `data-stage-inner`, so it travels with the existing wipe like every other screen. Don't change the wipe.
- **Chapter height:** give a chapter whose screen is a piece `lg:min-h-[100vh]`, so the sequence has room to finish at a reading pace. Illustrations keep 75vh.

### How it enters (port `stageFrame`)

- **It rises with the wipe.**
  - HDT's layer wipes up as its title rises from 98% to 58% of the viewport.
  - Pass that wipe's progress (0 → 1) to the piece as `enter`. The piece rises 0.6 units into place with `easeOut(enter)`.
  - Read the progress from the wipe's own ScrollTrigger (`self.progress` in `onUpdate`); don't add a second trigger.
- **It starts halfway through the wipe.** The piece keeps two clocks:
  - `ta`, the ambient clock, runs from the moment the layer becomes visible. It drives the loose spin, the sway, the shield's bob and the blinking lights;
  - `ts`, the sequence clock, starts when `enter` reaches 0.5.
- **It plays once and holds.**
  - Call `update(0, { ts, ta, enter })` as the study does.
  - The sequence stops at 8.9 s. After the shield forms, the piece holds the locked rings and the shield, which keep moving gently on `ta`.
  - On the site the piece never releases or loops.
- **It restarts each time it comes back.** When the layer goes from fully hidden to partly visible, both clocks reset to 0. That happens:
  - when its own wipe starts, scrolling down;
  - when the next layer's wipe starts to uncover it, scrolling back up.
- **It's never blank.** When the chapter before it becomes active:
  - build the scene;
  - compile its programs in idle time (`renderer.compile`);
  - draw its first frame (`ts` 0, `ta` 0, `enter` 0).

  That way the layer never wipes in empty.
- **It draws only while it can be seen:** while its layer is at least partly visible and the stage is within 40px of the viewport. It stops when the next layer covers it or the stage leaves the screen.

### Reduced motion, phones and no WebGL

- **Reduced motion, from 1024px:** screens already switch without the wipe. The piece shows its still image, and no clocks run.
- **Below 1024px:** the chapter's inline screen shows the still image, frameless, at 16:10, in the slot where illustrations sit. No tag.
- **No WebGL 2, or a lost context:** the still image.
- **The still:**
  - it's the piece at its still time, 7.4 s, the secured state;
  - render it with the same dev-only route and script as the Offers stills (`?offers-still` and `scripts/render-offer-stills.mjs`). Extend them, or add siblings;
  - write `public/assets/gen/project-hdt-1600.webp` at 1600 × 1000 on a transparent background, and list it in `public/assets/gen/manifest.json`.

## 4. The renderer

The page holds two WebGL contexts at most: the globe's and the pieces'. Keep it that way.

- **A shared renderer:** move the Offers engine's renderer into `src/components/ui/offers3d/renderer.ts`.
  - It holds `createRenderer` and the draw-and-copy step: resize if needed, render, then copy into the target 2D canvas in the same task.
  - It's a reference-counted singleton (`acquire` and `release`) that holds the size cache.
  - The Offers engine uses it with no change in behaviour.
- **HDT's piece** draws through the same instance.
  - Its builder (`hdt`) and `fillMaterial` go in `scenes.ts` beside the others.
  - Its colours go in `constants.ts`, by name: the solids' pairs as in the study, Driftwood-soft for the gold, and the gold's shade, `#6E5530`.
- **The stage engine:** a small client engine drives the clocks and the drawing described above.
  - It lives in `offers3d/`, or in a `projects3d/` that imports from it.
  - Load it with a dynamic `import()` when the Projects section is within one screen (the stage's existing IntersectionObserver), on desktop with motion only.
  - three stays in the one chunk it shares with the globe and the Offers pieces.

## 5. Clean-up

HDT no longer uses the Access review illustration. Remove:

- `AccessReview.tsx`;
- its case in `Mockup.tsx`;
- `"access-review"` from the mockup union;
- `mockups.accessReview` from `projectsCopy`.

Launch readiness and Workflow stay.

## 6. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/07b-hdt-piece`, with `--section=#projects`). Also:

- **Capture the entry:**
  - run `npm run refs -- _self http://localhost:3000 --at="HDT Systems"`;
  - use verify-shots' `--scroll=<selector>@<fraction>` to place HDT's title at 90%, 70% and 58% of the viewport, then take shots 2 s and 7 s later;
  - the piece should rise with the wipe, the rings should lock, and the shield should form and hold;
  - delete `_self` afterwards.
- **Scroll on past HDT, then back up.** The piece should restart from loose rings as Rabia Al Basri's layer uncovers it.
- **Count the contexts:** once the globe, the Offers pieces and HDT's piece have all drawn, the page holds two WebGL contexts.
- **Check the fallbacks:** at 390px, with reduced motion and with `?offers-fallback` (or the piece's own equivalent), the piece shows its still.
- **Performance:** record in NOTES.md:
  - the gzipped chunk sizes against the baselines, with three still in one chunk;
  - the Lighthouse medians: LCP under 2.5 s, CLS under 0.05 and TBT under 200 ms, as in step 11.

Commit: `v3(07b): HDT Systems' stage piece: control rings, servers and a shield`.

## Acceptance

- HDT Systems' screen on the stage is the piece: frameless, with no text and no tag.
- As HDT's title rises, the piece rises with the wipe and starts halfway through it. It plays once and holds the shield with gentle motion, and it restarts each time it comes back into view.
- The layer never wipes in blank.
- The page has at most two WebGL contexts, and the Offers pieces behave exactly as before.
- Phones, reduced motion and no WebGL 2 show the still image.
- The Access review illustration and its copy are gone; the other two illustrations are unchanged.
