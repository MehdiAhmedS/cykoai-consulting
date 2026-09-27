# Step 05b · The globe in three.js (decided 27 September)

Read `docs/v3/BRIEF.md` first. Step 05 built the globe with cobe and a 2D overlay. Mehdi reviewed it and wants a proper 3D build:

- the arcs are 1.2 px lines on a flat canvas;
- most arcs are short hooks near Muscat;
- the arcs appear and dim rather than travel;
- cobe's ocean reads as a near-black disc, and its dots come out an off-palette blue.

This step replaces the globe's engine with three.js, built from the Cowork study. It keeps everything around the engine: placement, loading, the reveal, the debug flags and the DRAFT note. cobe is retired.

**Mehdi's decisions (27 September):**

- three.js, hand-built: plain three, not React Three Fiber or three-globe.
- Arcs overlap, up to three in flight at a time.
- The globe sways between 62° and 100° east instead of spinning.
- Phones get a still frame and never download three.js.
- Unchanged from the step 05 review:
  - all nine places in `site.ts`, with only the three clients ever labelled;
  - the globe's size and right-edge crop;
  - the data line stays removed.
- Study defaults he kept: neutral dots and a hairline edge (no glow).

## 1. The design source

This step has no reference study; go straight to the plan. The design is the Cowork study, `docs/v3/references/globe/study/index.html`, which Mehdi has already reviewed and chosen from. The study folder comes from Cowork along with this prompt, so it goes in the `v3(docs)` commit with the brief and prompt updates.

- **Read its module script before planning.** The sphere, dot, graticule and arc shaders, the arc timeline, the sway and the target picking all come from it. Part 3 writes out the same values.
- **Build only Mehdi's picks:** Overlapping, Sway, All nine, Neutral and Hairline. The study's other switches were options, not features.
- **To watch it run,** serve it with `python3 -m http.server 3200 --directory docs/v3/references/globe/study` and open `http://localhost:3200`. It loads three.js from jsDelivr. `window.__study.state()` returns the front longitude and the arcs in flight.
- **Nothing else to study.** Cloudflare's measurements from step 05 are in NOTES.md. The GitHub and Stripe techniques this builds on are already part of part 3.

When the plan is approved, add it to the top of `docs/v3/references/globe/NOTES.md` in a few lines, under a "Step 05b" heading, as the brief asks.

## 2. Land data

- Write `scripts/gen-globe-land.mjs` using world-atlas `land-50m`, topojson-client and d3-geo, all as dev dependencies. It:
  - lays a Fibonacci lattice of 42,000 points over the sphere. Point i of N: y = 1 − (i + 0.5) · 2 ÷ N, r = √(1 − y²), θ = i · π(3 − √5), x = cos θ · r, z = sin θ · r;
  - keeps the land points north of 60°S (Antarctica out), which should come to 11,061, the same as the study's inline data;
  - writes `public/assets/globe-land.bin`: little-endian Int16 pairs of latitude × 100 and longitude × 100, about 44 KB.
- Use the study's convention: x = cos(lat)·sin(lng), y = sin(lat), z = cos(lat)·cos(lng). A lattice point's longitude is `atan2(x, z)`.
- Commit both the script and the `.bin`.

## 3. Build it

### Structure

- **`src/components/ui/globe/engine.ts`** (new, client-only, loaded with a dynamic `import()`):
  - creates the renderer, scene and loop, and exports `startGlobe(options)`, which returns a stop function;
  - imports from `"three"` by name only (never `import * as THREE`), so its chunk carries only what the globe uses.
- **`src/components/ui/globe/constants.ts`:** every number in this part, named.
- **`HeroGlobe.tsx`:** keep its outer lifecycle, which is:
  - `whenIdle`, `heroSettled` and `whenSized`;
  - `reveal()`;
  - one rebuild after an unexpected lost context;
  - `data-globe="loading"` until something is drawn, which verify-shots waits on. Set it to `"ready"` after the engine's first frame, `"still"` once the still frame is drawn, and `"none"` if the still frame fails, so the wait always ends;
  - the dev flags `?globe-debug` and `?globe-fallback`.

  Swap `import("cobe")` for `import("./globe/engine")`, and fetch `globe-land.bin` alongside it.
- **Warm the shaders before the first frame.** In an idle slot of its own after the headline settles (as step 05 does for cobe's cold compile), run `renderer.compile(scene, camera)`. It only compiles visible objects, so first add one arc, one head point and one landing ring at zero opacity, then remove them. Otherwise their shaders compile in the middle of the first arc.
- **Tear down deliberately.** Flag deliberate teardowns (unmount, crossing 900 px) so the lost-context handler doesn't treat `forceContextLoss()` as a failure and rebuild. Give every engine start a fresh `<canvas>`; a canvas that has lost its context can't be reused. The still frame uses its own 2D canvas.
- **Remove** cobe from `package.json`, the 2D overlay code, and `src/lib/globe.ts` if nothing else imports it.
- **Update `CLAUDE.md`:** its line "WebGL only for the hero globe (cobe)" becomes "WebGL only for the hero globe (three.js)". Add that the sphere's light-to-shade ramp is shading on a 3D object, not a gradient field, so it isn't covered by the "no gradients" rule. Nothing else on the globe glows.

### Where the engine runs, and the still frame

- The engine runs only when all three hold:
  - the viewport is at least 900 px wide;
  - `hasWebGL()` passes. three.js r163 and later need WebGL 2, so probe `webgl2` only. Wrap the renderer's creation in try/catch too, and fall back to the still frame without logging an error, because verify-shots fails on any console error;
  - reduced motion is off.

  Decide on mount. If a resize crosses 900 px, switch modes cleanly: tear the engine down, or start it.
- Everywhere else, the hero shows the still frame: phones, no WebGL, reduced motion and `?globe-fallback`. There, neither the engine chunk nor `globe-land.bin` is requested.
- **The still frame** is a pre-rendered image of the same scene, generated by the engine itself:
  - The scene: front longitude 72° east, the three client arcs drawn in full at 80% opacity (no heads, no rings, no labels), and a transparent background.
  - In dev, `?globe-still` renders that frame at 1600 × 1600 and sets `window.__globeStill` to two WebP data URLs from the canvas, at 1600 and 800 px. Read the WebGL canvas in the same task as the render, or create the renderer with `preserveDrawingBuffer` in this mode only, or the image comes out blank.
  - `scripts/render-globe-still.mjs` opens `http://localhost:3000/?globe-still`, reads them and writes `public/assets/gen/globe-still-1600.webp` and `globe-still-800.webp`. Chrome encodes the WebP, so no new image tool is needed.
  - Add a `globe-still` entry to `public/assets/gen/manifest.json` naming the script, and commit both files.
- **Show the still frame in a 2D canvas, drawn after idle, not in an `<img>`.** Canvases aren't LCP candidates, so the LCP stays on the text on phones (the lede today).
  - Pick the 800 or 1600 file by the canvas's device-pixel width.
  - It fades in with the same `reveal()` after the headline.
- The still frame replaces `WorldCanvas` as the no-WebGL fallback. Delete `WorldCanvas.tsx` and `public/assets/land-points.json` once a grep shows nothing imports them.

### The scene (the study's values)

| Part | Value |
|---|---|
| Renderer | `WebGLRenderer` with antialias, alpha and `powerPreference: "high-performance"`. Pixel ratio `min(devicePixelRatio, 2)`; clear alpha 0. Set `ColorManagement.enabled = false` and `outputColorSpace = LinearSRGBColorSpace`, so hex values render as written. |
| Camera | Perspective, fov 30°, 4.18 units from the centre. The sphere then fills 92% of the canvas height, as step 05's does (R = 373 px at 1440 × 900). |
| Tilt | +13°, north toward the viewer (a parent group's `rotation.x`). |
| Sway | Front longitude = 81° − 19° × sin(2πt ÷ 44 s), so between 62° and 100° east. The earth group's `rotation.y` is minus the front longitude. |
| Sphere | 128 × 96 segments with a custom shader. The light is fixed in view space at (−0.55, 0.62, 0.56). Shade `#0e1930` rises to lit `#1a2a49` over smoothstep(0.15, 0.95) of the half-Lambert term. The rim is `#AEB8C8` mixed in at 0.3 over Fresnel 0.93 → 1.0. |
| Land dots | 11,061 instances of a 6-sided disc, radius 0.0043, at r = 1.0015, facing outward, in one `InstancedMesh`. Colour `#AEB8C8` at 0.46, multiplied by smoothstep(0, 0.5, facing) so they fade toward the rim. |
| Graticule | Meridians every 30°; parallels at 0, ±30° and ±60°. r = 1.002, in one `LineSegments`. White at 0.075, multiplied by smoothstep(0, 0.4, facing). |
| Facing | Wherever this prompt says a point "faces" the viewer at some value, that value is the dot product of the point's outward normal and the unit vector from the point to the camera (the study's `facing()`). It isn't the normal's z: from 4.18 units away the rim sits at a normal z of about 0.24. |
| Markers | Discs at r = 1.0035. Muscat: `#D4B483`, size 0.017. Clients: `#AD8752`, 0.0105. Decorative places: `#AD8752` at 70% opacity, 0.0105. |
| Muscat's pulse | A `#D4B483` ring (inner radius 0.8, outer 1) at r = 1.004, every 4 s. Over 2.6 s it grows from Muscat's marker size (0.017) to 3.8 times that, with ease-out cubic, while its opacity falls linearly from 0.42 to 0. |
| Draw order | Sphere, dots, graticule, arcs, markers, rings, head points (`renderOrder`). Everything except the sphere is transparent, with `depthWrite` off and `depthTest` on, so the sphere hides whatever is behind it. |

### Arcs

| Part | Value |
|---|---|
| Path | A great circle from Muscat at r = 1.004 + H·sin(πt), where H = clamp(0.4 × the angle in radians, 0.03, 0.2). The ends sit just above the surface so the tube doesn't sink into it. Short hops arch; long ones rise to 0.2. |
| Geometry | A centripetal `CatmullRomCurve3` through 65 points, as a `TubeGeometry` of 160 × 8 segments with radius 0.0033. Build it once per place. |
| Shader | `uv.x` runs along the arc. Discard fragments outside [tail, head]. Opacity rises from 0.2 at the tail to 1 over the first 60% of the lit span. While drawing, the last 16% warms from `#BB9259` to `#F3E2C2`. |
| Timeline | The head goes 0 → 1 over 1.5 s (ease-in-out cubic). The tail goes 0 → 1 from 2.1 s over 1.0 s, with the same ease. The arc is gone at 3.1 s. |
| Head point | A small solid disc sprite, `#F3E2C2` at 0.95, about 8 px across at 1440 × 900 (scale about 0.022), with normal blending and no soft falloff, since `CLAUDE.md` rules out glows. It follows the head and fades over 0.3 s after landing. This is the one change from the study, whose head is a soft glow. |
| Landing | A `#D4B483` ring at the destination, at r = 1.004, grows from 0.011 to 0.071 over 1.3 s (ease-out cubic) while its opacity falls linearly from 0.55 to 0. The destination marker swells to 1.7× and back over 0.8 s (a sine bump). |
| Cadence | A new arc every 1.3 s while fewer than three are in flight. The first starts 0.9 s after the globe appears. |
| Targets | The next place in `site.ts` order that meets all of these: it faces the viewer at 0.3 or more, it lands inside the hero with at least 16 px to spare on the left, 30 px on the right and 10 px at the top and bottom (the study's margins), it isn't in flight, and it wasn't the last one launched. Launch only while Muscat faces at 0.15 or more. With no target, retry in 0.8 s. |
| Headline guard | Before launching, project 9 points along the arc, for the globe's rotation now and 3.1 s ahead (the sway is deterministic, and it moves the globe up to about 8° in that time). Skip the target if any point falls inside one of the headline's line boxes grown by 24 px. Use the line elements from HeroHeadline's split, or `Range.getClientRects()` on the h1, not the h1's block box. |
| Labels | Clients only (Pakistan, the UAE, Germany), in the existing caption chip. It sits 12 px right of the point, or left if it would come within 12 px of the viewport's edge. It fades in over 0.25 s on landing and out over 0.3 s from 2.6 s. Keep step 05's visibility thresholds rather than the study's single one: it shows once the point faces at 0.12 and hides below 0.02. |
| One label at a time | A new landing replaces the current label, which fades out over 0.2 s. The single caption element already does this. Labels stay hidden below 900 px. |

### Running

- **Time-based:** measure every duration in seconds of elapsed time, and cap dt at 50 ms, so 60 Hz and 120 Hz screens look the same.
- **Pausing:** pause off screen (an IntersectionObserver with a 160 px root margin) and in hidden tabs. Resume where it left off.
- **Resizing:** size from layout, with a ResizeObserver on the wrapper, not `getBoundingClientRect()` under the parallax transform.
- **Quality:** if the mean frame time over 3 s exceeds 20 ms, drop the pixel ratio to 1.5, then to 1 (GitHub's tiers, simplified).
- **Unmount:** dispose every geometry, material and texture, call `renderer.dispose()`, and force the context loss.
- **Debugging:** `?globe-debug` (dev) keeps `window.__globe`, reporting:
  - fps and frame cost (mean and p95);
  - draw calls (`renderer.info.render.calls`);
  - the front longitude and pixel ratio;
  - the arcs in flight (name and elapsed time) and the current label.

### Composition

Keep the wrapper exactly as it is: `min(90vh, 58vw)`, right −0.45 × its width, the parallax `data-speed="0.93"`, and 40% opacity centred behind the text below 900 px (now the still frame). Re-measure the gap from "your organization." to the sphere with step 05's method, at 1920 × 1080, 1440 × 900, 1440 × 1000, 1366 × 768, 1280 × 800 and 1024 × 768. Also check that no arc crosses the headline's text at those sizes.

## 4. Check, commit, report

Run the brief's check list, with verify-shots into `docs/v3/after/05b-globe`. Also:

- **Frame rate** in Chrome on Mehdi's Mac: count `requestAnimationFrame` callbacks over 5 s. It should hold the display's refresh rate. From `__globe`, p95 JS per frame should be 2 ms or less, with 24 draw calls or fewer. With nine marker meshes, up to three arcs, head points and rings, a straight port comes to about 20; make the markers one `InstancedMesh` if it goes over.
- **Chunk:** the engine chunk (three plus the engine) should be 160 KB gzipped or less, and not in `/`'s first-load list. Record its size and the size of `globe-land.bin`.
- **Phones and fallbacks:** at 500 px wide, with reduced motion on, and with `?globe-fallback`, the network panel shows no engine chunk and no land data, only the still WebP.
- **Lighthouse** (production, :3100):
  - mobile should stay where step 05 left it (89–92, with the lede as LCP);
  - desktop should be 95 or more, with the lede or headline as LCP and TBT of 100 ms or less.
- **Motion,** read from `__globe`:
  - the sway's range over 44 s (62°–100°);
  - never more than three arcs in flight;
  - one arc's timeline (landing at 1.5 s, gone at 3.1 s);
  - never two labels at once.
- **Pausing:** when the hero is scrolled away, and in a hidden tab, `renderer.info.render.frame` stops advancing for 2 s. Don't use `render.calls` for this: it keeps the last frame's count while paused.
- **Captures:** `--frames` of the hero at 1440 and 390 px. In the Chrome self-review, compare the running hero with the study page, served as in part 1.

Commit: `v3(05b): three.js globe with travelling arcs; still frame on phones`.

## Acceptance

- **The globe is three.js:** a lit sphere, land dots, the 30° graticule and a hairline rim, with no glow.
- **Arcs travel** from Muscat and land with a ring, up to three at once, and none crosses the headline.
- **It sways** between 62° and 100° east.
- **Labels:** clients are labelled one at a time and the decorative places never are. Africa stays off until Mehdi names the country.
- **Fallbacks:** phones, reduced motion and no-WebGL all show the still frame, and never load three.js or the land data.
- **Loading and cost:** the engine loads after the headline, in its own chunk; it pauses off screen and holds the display's frame rate.
- **Clean-up:** cobe, `WorldCanvas` and `land-points.json` are gone.
