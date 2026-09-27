# Globe: cobe sphere, graticule, real locations only

## Step 05b: three.js (plan approved 27 Sep 2026)

- **Engine:** `src/components/ui/globe/engine.ts` (plain three 0.186.1, named imports only) with every value in `constants.ts`, ported from the Cowork study with Mehdi's picks: overlapping arcs, sway, all nine places, neutral dots, hairline rim. cobe, `WorldCanvas`, `src/lib/globe.ts` and `land-points.json` are gone.
- **Land:** `scripts/gen-globe-land.mjs` writes `public/assets/globe-land.bin` (11,061 points, 44,244 B), byte-identical to the study's inline data.
- **Loading:** from 900 px, with motion allowed and WebGL 2: idle, then the headline settles, then the engine chunk and the land data load together. The scene is built in one idle slot, and the shaders compile (`renderer.compile` with a zero-opacity arc, head and ring) in another. The first frame sets `data-globe="ready"` and fades in.
- **Still frame everywhere else** (phones, reduced motion, no WebGL, `?globe-fallback`): `globe-still-800/1600.webp`, rendered by the engine (`?globe-still` + `scripts/render-globe-still.mjs`), drawn into a 2D canvas after idle, `data-globe="still"`. A width crossing 900 px switches modes cleanly.
- **Two readings of the prompt:** three loads after the headline settles (the brief's "loaded after the headline"), not in the first idle slot as cobe did. The head point's disc fills 76% of its sprite, so scale 0.022 gives about 8 px.

**Step 05 build plan (approved 27 Sep 2026).**
- **cobe 2.0.1, not 0.6.x.** It has no `onRender` and no loop of its own: `createGlobe()` draws once and each `update()` draws one frame. So one rAF loop in `HeroGlobe.tsx` calls `update({ phi })` and then draws the 2D overlay with the same phi and theta. `src/lib/globe.ts` reproduces cobe's `U()` and `O()` exactly.
- **Mehdi's choices:**
  - The tilt is +13°, north toward the viewer. The prompt's −13°, applied as in v1, would show the globe from slightly south of the equator.
  - Markers are Muscat 0.035 and clients 0.02, because cobe 2 draws the prompt's sizes about three times larger.
  - The labels sit on a flat Windsor chip.
  - Phone contrast is measured against the background blurred to the stroke width.
  - The no-WebGL fallback (`WorldCanvas`, with its mirror fixed) gets the same arcs.
- **Motion:** the globe turns like the real Earth, once every 110 s, driven by elapsed time. It starts after idle and after the headline settles (`data-hero-settled`), then fades in over 0.8 s once cobe's land texture has loaded. It pauses off screen and while the tab is hidden. Reduced motion shows one static frame with Muscat facing.
- **Start:** the animated start puts Muscat 45° west of centre, so all three client arcs play before Muscat turns under the right-edge crop.
- **Composition:** the wrapper keeps `min(90vh,58vw)`, and its right offset becomes −0.39 × its width. The sphere then clears "your organization." by at least 24 px, even allowing for the arc lift. The measurements are in the checks below.

Studied 27 Sep 2026.

- **Chrome (system theme dark):** Cloudflare at 1440, then at 636 px wide. Vercel and Hadrian at 636. Measured with the JS tool: canvas setup, the pin and caption DOM, CSS variables, script chunks, Vercel's images, Hadrian's strip.
- **Motion was timed in headless Google Chrome with the real GPU.** Chrome draws nothing while its window is hidden or fully covered (`visibilityState: hidden`, 0 frames), and the window kept going hidden during the session. So a scratchpad script ran Playwright with `channel: "chrome"` (ANGLE Metal, M1 Pro, 60.1 fps, dark theme). It sampled every 6th frame for 215 s (one full turn), every frame during a drag, then scroll, 500 and 390 px, and reduced motion. Its screenshots are in `live/cloudflare.com-network-webgl/`.
- **Records:** both of the prompt's `npm run refs` commands. The capture script's headless shell only has SwiftShader (software WebGL), and Cloudflare refuses software WebGL and shows a static picture instead. That first run is kept as `live/cloudflare.com-network-no-webgl/`. The same command with `PW_CHROMIUM="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` shows the real globe, in `live/cloudflare.com-network/`.
- **Source:** Cloudflare's component (`/_astro/_globe.*.js`, `/_astro/_poi.*.js`) was read for exact values: grid, dot count, camera, speeds. A projection model built from those values matches the live pin positions to a median of 0.65 px over 2,147 samples, so the values below are the site's own. Read to understand, not copied.

## Cloudflare network globe

**Setup**
- An Astro island (`RegionEarth`, hydrated `client:visible` with a 250 px root margin): React Three Fiber on three.js r182.
- One WebGL2 canvas (antialias on, alpha, `powerPreference: "high-performance"`), 1440×800 CSS at 1440 and 600 px tall below 768. Pixel ratio capped at 2 (`[1, 1]` and no antialias on lower performance tiers).
- **The backing store is 3% short:** 2793×1552, not 2880×1600. The canvas was measured while its wrapper was still at scale 0.97 for the entrance, and never again. At 500 and 390 the canvas stays at 97% of its box (378×582 inside 390×600).
- Pins and captions are HTML over the canvas: 49 anchors moved every frame with `translate3d` from the three.js projection.
- **Cost:** a 7.9 KB component, a three.js chunk of 912 KB decoded (241 KB transferred) and a 96.6 KB land-points binary (uncompressed). 61 WebGL draw calls per frame, 59 of them graticule lines (one draw each).

**Size and position**
- **At 1440×900 the sphere is 740 px across: 51% of the viewport width,** centred under the title. Its top is 355 px down the page, so 545 px of it (74%) is above the fold. It fills 91% of the 800 px canvas height; the last 9 px are cut off at the bottom.
- **The size follows the canvas height,** not the width (a fixed vertical field of view): 740 px at any desktop width. Below 768 it is 371 px: 74% of the width at 500 and 95% at 390, nearly edge to edge.
- Camera: fov 45°, 2.80 units from the centre on desktop and 4.03 below 768. Globe radius 0.99, moved down 0.1.
- The globe sits below the text, never behind it.

**Land dots**
- **16,098 land dots, picked from a 50,000-point Fibonacci lattice** (32% is land), so each dot's nearest neighbour is about 0.9° away. At 1440 that is about 8 px at the centre of the face (perspective enlarges the near side). Each dot is a 3 px rounded square (17% corner radius) facing outward.
- Unlit and one colour: `#d63c01` on `#151414` in dark, orange on cream in light.
- **See-through sphere:** the far side's land draws too, mirrored and dimmed. When the Pacific faces front, dim Europe and Africa fill the middle of the globe (`desktop-dark-whole-sphere.jpg`).
- **No glow, no starfield:** fog in the background colour fades the rim and the far side (from 2 to 4 units on desktop, 3.25 to 6 below 768). There is no separate edge line; the rim is where the grid converges and fades.

**Graticule**
- **Meridians every 15°, parallels every 7.5°** (22 plus the equator), plus 12 full meridian circles every 30° drawn on top, so every second meridian is drawn twice. 1 px WebGL lines at radius 1.00, just above the dots.
- **Alpha:** dark mode draws `#f0e3de` at opacity 0.04. On `#151414` a line pixel measures (30,28,28), 9 levels up; a doubled 30° meridian measures (35,33,33), 14 levels up. Light mode draws the border colour at full opacity.
- On screen at 1440: parallels about 69 px apart at the centre of the face (measured 67.5–71), meridians about 138 px, both closing up toward the rim.

**Pins**
- 48 px discs: `#ff5e1f` at 90%, 8 px backdrop blur, 1 px border, a 24 px server icon. 38 px below 768, where the overlay is scaled to 80%. No hover state: pins and captions have `pointer-events: none`.
- **Visibility with hysteresis:** a pin shows once its point faces the viewer by more than 0.12 (the dot product of its normal and the view direction, about 83° from the face centre) and hides below 0.02 (about 89°). It pops in and out with a 200 ms scale transition. 4 to 27 of the 49 show at a time.
- All pins also hide while the camera turns faster than 0.05 rad (2.9°) per frame. The drag below stayed under that.

**Captions: how a region is labelled**
- **One caption per region, anchored to a lead city:** North America (San Francisco), Latin America (São Paulo), Europe (London), Middle East (Dubai), Asia (Tokyo), Oceania (Sydney), plus one stat.
- **Format:** a count as the headline ("55 cities", FT Kunst Grotesk 500, 18/21.6 px, −0.45 px) over one sentence naming the region and a few cities (400, 16/19.2 px). Both `#ff5e1f` in dark. Not mono.
- **Box:** 240 px wide, 8/12 px padding, a 1 px dashed orange border, eight 2×16 px corner brackets, and an 80% background fill with an 8 px blur.
- **Placement:** a fixed offset from the anchor's projected point: 280 px left or 92 px right on desktop, 112 or 84 px below 768. Vertically, the region captions measured 44–60 px above their anchor and the stat about 100 px below. Each floats ±6 px on a 10.5 s sine.
- **When it shows:** on desktop, only while its anchor is in front and on the caption's side of the globe (a left caption on the left half). So captions sit toward the rim, not across the face. Below 768 a caption shows whenever its anchor is in front, and two stack over the globe (`w390-dark-globe.jpg`).
- **One turn, measured:** Oceania 26.7–59.7 s, Asia 72.9–106.2 s, Europe 114.3–145.9 s, Middle East 117.4–155.3 s, the stat 115.2–149.3 s, Latin America 144.5–175.1 s, North America 0–7.4 s and 178.7–207.8 s. So 30–38 s each, and three at once from 117 to 146 s.
- **Entrance and exit:** the box grows from the corner nearest its anchor over 200 ms (ease-out cubic), then the text fades in over 200 ms (`desktop-dark-drag-mid.jpg` catches an empty box mid-grow). It leaves instantly (scale 0) when the anchor turns past the threshold.
- **The stat is placed at an invented point.** "234B+ Daily cyber threats blocked" sits at 37.51°, −7.13°: London's coordinates moved 14° south and 7° west. It is a claim pinned to a place where nothing is, the "decoration pretending to be data" this step removes from v1.
- The city list lower on the page names Muscat ("Manama, BH · Muscat, OM · Najaf, IQ"): city plus ISO country code.

**Motion timeline** (desktop, dark, fast network; from navigation)
- **1.07 s** the wrapper is in the DOM at opacity 0 and scale 0.97. **1.24 s** DOMContentLoaded.
- **1.66 s** the component script loads, **1.76 s** the three.js chunk, **2.18 s** the land points.
- **1.94 s** canvas sized. **2.09 s** first frame drawn.
- **2.21 s** ready: two frames after the dots are uploaded, or after a 1.8 s timer if loading stalls.
- **2.21 → 3.1 s** the wrapper fades 0 → 1 and scales 0.97 → 1 over 900 ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Measured opacity: 0.31 at +83 ms, 0.55 at +150, 0.72 at +216, 0.90 at +350, 0.97 at +483, 1.00 at +683. A strong ease-out: 90% of the fade in the first 40% of the time.
- **Then a steady turn: −1.796°/s, 200.5 s per turn** at 60.1 fps, steady within 1.5% in every 10 s window. It is OrbitControls' `autoRotateSpeed` 0.3, advanced per frame rather than per second, so a 120 Hz screen turns it in about 100 s.
- **Direction:** the same as the real Earth seen from space with north up. Land slides left to right and the view drifts west: 98°W at 0 s, 170°W at 40 s, 118°E at 80 s, 47°E at 120 s, 27°W at 160 s, 98°W again at 200 s.
- **Axis:** rolled −0.25 rad (−14.3°) in the picture plane. The camera orbits the screen's vertical axis (polar angle locked at 90°), not the Earth's own axis. So the globe wobbles rather than spins: the latitude facing the viewer swings between about 12°S and 16°N over a turn.
- **Drag:** horizontal only (no zoom, no pan). A 300 px drag turned it about 135° in all (2π × drag distance ÷ canvas height). About 80% came while dragging, and the rest glided in over about 1.5 s after release (damping 0.05 per frame). Then it went straight back to the auto-turn. Dragging right moves land right. The cursor stays `auto` (no grab hand), and `touch-action: pan-y` keeps vertical page scrolling on touch.
- **Scroll:** no pin and no parallax; the globe scrolls with the page. It keeps rendering until the canvas is more than 160 px off screen, then stops completely (0 draw calls in 2 s at scrollY 1800), and resumes on the way back.
- **Reduced motion:** no auto-turn (pins moved 0.00 px in 8 s) and no entrance transition (shown at about 1.06 s). Dragging still works.

**Fallback without WebGL**
- If WebGL is missing, or the renderer is software (SwiftShader, llvmpipe, "software", Mesa), it logs a warning and shows a static PNG (`/static/globe.png` or `globe-dark.png`) with the same fade.
- **In light mode the PNG's cream background shows as a box** on the white page (`cloudflare.com-network-no-webgl/desktop-top.jpg`).
- Its alt text, "3D globe visualization requires hardware acceleration", describes the failure, not the picture.
- A performance setting in their CMS preview can drop to the same PNG (low), or to DPR 1, no antialias and half the turning speed (medium). Public visitors get the full version.

**Take:**
- Flat, unlit dotted land with no glow and no starfield, the rim fading into the background. Our `glowColor` set to the background gives the same result.
- Real locations only, one short caption per place.
- Captions at a fixed pixel offset from the projected point, recomputed every frame, on the outward side (toward the rim, not across the face).
- Hysteresis for anything tied to a location: show above about 0.12, hide below about 0.02, so labels don't flicker at the rim.
- A sub-second, strong ease-out fade once the first frame is drawn.
- Stopping completely off screen, with a margin so drawing restarts before the globe is back in view.

**Skip:**
- The 48 px pins with icons and blur, the dashed bracketed boxes, the float, and more than one caption at a time.
- The see-through far side: busy and mirrored. cobe draws only the near side.
- The scale-in (it left their canvas 3% short), per-frame speed, the invented stat location, and the 912 KB chunk.
- Dragging: the prompt makes the globe decorative.
- A fallback picture with an opaque background.

## Vercel regions map

- **A static figure, no canvas and no JavaScript** (`--probe`: canvas 0, WebGL false). Two PNGs swapped by theme with `dark:hidden` / `hidden dark:block`: `cdn-pops-light.png` (311 KB) and `cdn-pops-dark.png` (2.7 MB), both 3480×2168 with a 1740×1084 intrinsic size. About 766 px wide at 1440 in a 1 px bordered, 8 px radius frame.
- **The numbers live in text:** a `<figcaption>` reads "126 Points of Presence in 94 cities across 51 countries", and the alt text repeats it.
- **The picture's own text went stale:** its subtitle says "119 globally distributed points of presence" while its legend says 126.
- **Land:** grey dots on a staggered (hex) grid about 3.4° of longitude apart (26 px in the source, about 5.7 px on screen), each dot about 46% of the pitch. Coastal dots shrink to specks, which softens the coastlines. The dark version adds a dark ring round each dot and a faint navy glow under the land.
- **Data:** 126 bright green points of presence (about twice a land dot) over 19 dark green region discs (about five times). One hue; the hierarchy is size and brightness only.

**Take:** every dot is a real location; hierarchy by size and brightness in one colour; numbers in text, never in the picture.
**Skip:** the navy glow and the dot halos; counts baked into images.

## Hadrian clock strip

- A strip in the header: `CA | 11:54PM PDT | AZ | 11:54PM MST | AL | 01:54AM CDT | DC | 02:54AM EDT`. Place code, local time, zone.
- Söhne Mono 400, 12/18 px, capitals, white on navy. 26 px tall, a 1 px border in the text colour, cells padded 0 8 px with 1 px dividers.
- Shown at 1024 px and up only (`hidden lg:flex`, so not at 636 in Chrome; the board capture shows it). It fades in over 300 ms once the browser has set the times. Minute precision, 12-hour clock.

**Take:** place and time zone as a plain fact, without a map. Our hero's data line (Muscat, GST UTC+4) already does this.
**Skip:** a live clock strip, for now.

## Avoid

`avoid-kaspersky.jpg` (board only, not visited): a starfield, a green glow, eight colours and stat panels.

## Differences from the prompt (the prompt wins)

| | Cloudflare, measured | Prompt, kept |
|---|---|---|
| Turn | 200.5 s at 60 fps, per frame | 110 s per turn (v1's pace) |
| Axis | rolled −14.3° in the picture plane; the globe wobbles | about −13° tilt toward the viewer (cobe's theta), spinning on its own axis |
| Graticule | 15° × 7.5°, 4% (6% on doubled lines), faded at the rim | every 30°, 1 px, `rgba(255,255,255,0.06)`, plus a 0.10 edge |
| Land | 16,098 dots about 0.9° apart, see-through | cobe, `mapSamples` about 14,000 (9,000 below 900 px) |
| Markers | 48 px HTML pins | cobe markers 0.06 (Muscat) and 0.035, plus Muscat's pulse |
| Captions | count and sentence in a dashed box, up to three | one mono country name, no box, one at a time |
| Arcs | off on this page (in the code: 1.5 s draw-in, 0.55 s retract, lift 7.5% of the radius) | v1's cycle: draw 3.2 s, hold 0.9 s, fade 1.2 s, gap 1.4 s |
| Entrance | 900 ms fade and scale from 0.97, at about 2.2 s | 0.8 s fade, after the headline sequence |
| Loading | 912 KB when within 250 px of the viewport | cobe, about 6 KB, after idle |
| Placement | centred under the title, 740 px at 1440 | right crop in v1's wrapper (745 px at 1440) |

v1's arc lift (0.07 of the radius) is already close to Cloudflare's 0.075.

If cobe's `mapSamples` also counts a Fibonacci lattice over the whole sphere (check its source in step 3), 14,000 samples put each dot's nearest neighbour about 1.6° away and 9,000 about 2.1°. That is nearly twice Cloudflare's spacing, so about a third as many dots per area, and calmer. v1's 3,338 land points sit on a 1.8° grid.

## What should change in the build

- **v1's globe is mirrored east to west.** In `docs/v3/after/04-hero-headline/1440-rm.png` the arc from Muscat to London runs up and to the right, and Africa sits right of Oman. On a real globe, both are to the left. The cause: `vec()` runs longitude from +x toward +z, and with +z pointing at the viewer, east turns toward screen-left. The prompt makes `WorldCanvas` the no-WebGL fallback, so fix its handedness and check it against cobe: Germany up and to the left of Muscat, Pakistan up and to the right, the UAE just to the left. The start angle (`ROT0`) must then be recomputed, or Muscat no longer faces front.
- **Choose the spin direction on purpose.** The real Earth, and Cloudflare, slide land left to right while the view drifts west. Depending on which axis the mirror fix negates, v1's turn can come out either way. Check it in the `?globe-debug=1` mode.
- **Turn by time, not by frame,** so 60 and 120 Hz screens show the same 110 s.
- **Size the canvases from layout size** (`clientWidth`/`clientHeight` or a ResizeObserver), not `getBoundingClientRect()` under a transform. Don't scale the wrapper during the fade; the prompt asks for a fade only.
- **Keep captions off the headline.** At 1440 the headline reaches about x = 960, over the globe's left part. Germany lies about 45° west and 29° north of Muscat, so it often draws on the left half. Put each caption on the side away from the headline (right, or above), and show it only when the destination is well in front (hysteresis on z, like Cloudflare's 0.12 and 0.02).
- **Pause with a margin:** an IntersectionObserver `rootMargin` of about 160 px, so drawing restarts just before the hero is back in view.
- **Our screenshot tools render WebGL in software.** `scripts/verify-shots.mjs` calls `chromium.launch()`, and `ref-shots` does too unless `PW_CHROMIUM` is set: both use Playwright's headless shell, which only has SwiftShader. cobe runs there on the CPU, so frame rates and timings from those runs mean little. Measure fps in Chrome, or in headless Chrome with `channel: "chrome"`. And if we copy Cloudflare's rule that software WebGL counts as no WebGL, verify-shots will only ever show the fallback.
- **Chrome only draws while its window is at least partly visible.** For the self-review in Chrome, keep a strip of the Chrome window uncovered.

## Files

- `board/`: the four board captures (read first).
- `live/cloudflare.com-network/`: `--frames --probe --mobile`, light theme, real GPU (via `PW_CHROMIUM`). The globe appears between the 1600 and 2500 ms frames.
- `live/cloudflare.com-network-no-webgl/`: the same command on SwiftShader; Cloudflare's static fallback.
- `live/cloudflare.com-network-webgl/`: dark theme, real GPU: load at 1.5/3/4.5 s, the full turn every 20 s (`desktop-dark-cycle-000s` to `200s`), the whole sphere, a centre crop, the drag, scroll steps, reduced motion, and 500 and 390 px.
- `live/vercel.com-docs-regions/`: `--probe`, light theme.

## Step 05 checks (27 Sep 2026)

Measured in headless Google Chrome with the real GPU (`channel: "chrome"`, ANGLE Metal, M1 Pro), on dev with `?globe-debug` unless noted. The Chrome self-review was skipped: the Chrome window kept going hidden, and Mehdi chose to skip it. Screenshots are in `docs/v3/after/05-globe/`.

- **cobe 2.0.1 adaptations:**
  - There is no `onRender`, so one rAF loop calls `update({ phi })` and then draws the overlay.
  - cobe never redraws once its land texture has loaded. `HeroGlobe` catches that image while `createGlobe` runs, redraws on its `load` event, and only then reveals the globe.
  - cobe rewrites a `<style>` in `<head>` on every update. That element is detached right after creation.
  - `markerElevation: 0`.
  - At an 810 px canvas, the markers are 14 px across for Muscat (0.035) and 8 px for clients (0.02).
- **Alignment (`align-1…3.png`):** checked at three rotations: Muscat 30° west of centre, facing, and 60° west.
  - Our projected points match cobe's own marker anchors to 0.000 px.
  - With the overlay hidden, the centres of the drawn Driftwood markers sit within 0.32 px of our points (0.77 px near the rim, where Muscat and the UAE crowd each other).
- **No glow, no starfield:** pixels just outside the rim differ from `#0B1527` by at most 1 level.
- **Composition** (at 0.39): the sphere's radius is 0.4 × the wrapper width. "Clear" is the gap from the dim span "your organization." to the sphere, and "with lift" subtracts the arc lift (0.07R).

  | Size | R | Sphere left | Dim span ends | Clear | With lift |
  |---|---|---|---|---|---|
  | 1920×1080 | 389 | 1424 | 1199 | 225 | 198 |
  | 1536×864 | 311 | 1140 | 1007 | 132 | 111 |
  | 1440×1000 | 334 | 1014 | 959 | 55 | 32 |
  | 1440×900 | 324 | 1027 | 959 | 68 | 45 |
  | 1440×790 | 284 | 1077 | 959 | 118 | 98 |
  | 1366×1024 | 317 | 962 | 879 | 83 | 61 |
  | 1366×768 | 276 | 1014 | 879 | 135 | 115 |
  | 1366×650 | 234 | 1068 | 879 | 189 | 173 |
  | 1280×800 | 288 | 913 | 802 | 111 | 91 |
  | 1280×700 | 252 | 959 | 802 | 157 | 139 |
  | 1024×768 | 238 | 721 | 642 | 80 | 63 |
  | 900×700 | 209 | 634 | 564 | 70 | 55 |

  Below 900 px the globe is centred behind the text at 40%, as before.
- **Contrast:** the text was hidden, the background under each line was blurred to that line's stroke width, and the worst (P95) value was taken over 12 rotations at every size above plus 768×1024 and 390×844.
  - **Desktop:** the dim span keeps its plain-Windsor 3.84:1 at every size (large text needs 3:1), because the globe never reaches it. White lines 18.25:1, lede and eyebrow 9.28:1. On the data line, the Driftwood coordinates read 5.53:1, and "GST UTC+4" drops to 8.5:1 on short viewports, where the sphere's rim reaches it.
  - **Phones:** at 40% the dim span reads 3.87:1 at 390 and 3.70:1 at 768, so 40% stays (Mehdi's rule).
  - **Labels:** they sit on a solid Windsor chip, so they read at n300 on Windsor, 9.28:1.
- **Motion** (dev, 1440×900):
  - **Fade:** the headline settles at 2.42 s after navigation, and the globe starts fading 33 ms later (after an idle slot). Opacity is 0.56 at +100 ms, 0.93 at +300 ms and 1.00 by +700 ms: 0.8 s `expo.out`.
  - **Spin:** 3.273°/s, so one turn takes 110 s.
  - **Arcs** (elapsed clock): Pakistan at 1.2 s, the UAE at 7.9 s and Germany at 14.7 s, each lasting 5.3 s (3.2 s draw, 0.9 s hold, 1.2 s fade), with 1.4 s gaps.
  - **Labels:** each shows when its arc lands. It reaches 0.99 opacity within 300 ms, then falls with the arc's fade (0.94 → 0.19) and is gone at 5.3 s. Labels are hidden below 900 px.
  - In production at 1440, the globe is almost fully in by 2.5 s, and the first arc is drawing at 4 s (`frames/`).
- **Cost:**
  - JS per frame (`update` plus overlay): 0.30 ms on average, 0.70 ms at the 95th percentile. The budget is 2 ms.
  - `createGlobe`: 22–32 ms when the shader cache is warm. The very first run on a cold cache took 418 ms, so the globe is built in an idle slot of its own after the headline settles, not inside GSAP's last frame.
  - Two WebGL draws per frame.
  - Production over 5 s: 60.2 fps, 88 style recalcs (7.5 ms), 1 layout, 130 ms of script.
- **Pause:**
  - 240 draws in 2 s on screen, 0 when scrolled two viewports down, 240 again on return.
  - 0 while a reduced-motion frame sits idle.
  - 0 while the tab is hidden. Headless keeps background tabs visible, so this was checked with a simulated `visibilitychange` (`document.hidden` forced true).
- **cobe chunk:** `3yef2z4oh_s_a.js`, 12,968 B raw and 5,893 B gzipped. It is not in `/`'s first-load list. First-load JS is 739,136 B, 10.5 KB more than step 04, for the globe code itself.
- **Lighthouse (production, :3100):**
  - Desktop: 100, LCP 0.7 s (the lede), CLS 0, TBT 0.
  - Mobile: 90, 91 and 91; LCP 3.4 s (the lede); CLS 0; TBT 40–140 ms. The remaining long tasks are React hydration and Lighthouse's own scripts. Step 04 was 87 with LCP 3.6 s.
  - One earlier run scored 72 (TBT 800 ms), when a cold shader compile ran inside the headline's last GSAP frame. That prompted the idle slot above.
- **Fallbacks:**
  - `?globe-fallback` (dev) and production with `--disable-3d-apis` both show `WorldCanvas` (`fallback-*.png`). It now draws correctly: Africa sits left of Arabia, and Germany is up and to the left of Muscat. It plays the arcs to Pakistan, the UAE and Germany.
  - Reduced motion shows one static frame with land and Muscat facing (`rm-1440.png`).
  - With `[data-hero-globe]` hidden, the hero reads completely at 390, 768 and 1440, with no console errors (`no-globe-*.png`); the globe is never created at zero size.
  - `verify-shots --full` for the page and for `#top`: console clean. It renders on SwiftShader and shows the globe.
- **Next to Cloudflare** (`frames/` against `live/cloudflare.com-network/`):
  - **Timing:** the two load on a similar schedule. Theirs shows at about 2.2 s and fades over 0.9 s with a scale; ours at about 2.4 s, fading only.
  - **Density:** ours is sparser (land dots about 1.6° apart against their 0.9°).
  - **Grid:** our graticule is wider (30° against 15° × 7.5°).
  - **Calm:** we show one arc and one label at a time; they show up to three captions at once.
  - **Near side only:** cobe draws only the near side, so no mirrored far-side land shows through.
  - **Sphere colour:** ours is darker. In dark mode, cobe fills the ocean at 10% of `baseColor`, which reads as a near-black disc on Windsor. The land dots come out `baseColor × 5.1` ≈ `#5B82DD`. Both are questions for Mehdi, because they follow the prompt's values.
- **Differences from the prompt, all recorded:** tilt +13° (Mehdi); marker sizes (Mehdi); label chip (Mehdi); cobe 2's loop and texture handling; a 45° animated start; the right offset −0.39 × width; software WebGL counts as WebGL, as the prompt says.
- **TBC:** the African country. It stays out of `site.globe.locations`, with a dev-only DRAFT note under the hero.

## Changes after Mehdi's review (27 Sep 2026)

- **Decorative places (Mehdi's choice):** Saudi Arabia, India, Egypt, the United Kingdom and Singapore are not clients. They are in `site.globe.locations` with `role: "decorative"`, placed at their capitals.
  - Each gets a marker (the client size) and an arc, but never a label, so the site names no country where Cykoai has no clients.
  - This departs from the brief's "real locations only" rule. Mehdi was told and chose it; the brief is unchanged.
- **Arcs:** still one at a time, with v1's timings.
  - Each arc goes to the next place in `site.ts` order that faces the viewer and is on screen, and never repeats the previous one.
  - Muscat must face the viewer, but it may sit under the right-edge crop, so late arcs sweep in from the edge.
  - Measured in the first 34 s: Pakistan (label), Saudi Arabia, the UAE (label), Germany (label), the United Kingdom. India, Egypt and Singapore follow as they turn into view.
- **Size:** the sphere is 15% larger (`GLOBE_SCALE` 1.15, 92% of the canvas; R = 373 px at 1440×900).
  - The right offset became −0.45 × the width, so the sphere's left edge stays where it was.
  - Clearance from the dim headline span is unchanged (55 px at 1440×1000); allowing for the now larger arc lift, it is 28 px there, still over the 24 px floor.
  - Markers are now 16 px (Muscat) and 9 px across. The animated start moved to 60° west of centre.
- **Data line removed (Mehdi):** "ORIGIN MUSCAT · 23.59° N, 58.38° E · GST UTC+4" is gone from the hero on every width, along with `hero.caption` in `site.ts`. The load sequence now settles after the CTAs (about 1.9 s after navigation on dev), so the globe fades in earlier.
- **Re-checked:**
  - Alignment: 0.000 px numerically, and within 0.94 px in pixels (markers cut by the viewport edge or near the rim skipped).
  - No glow: the rim is within 1 level of Windsor.
  - Contrast: the dim span keeps 3.84:1 at every desktop size, 3.83:1 at 390 and 3.63:1 at 768 (40% kept).
  - `verify-shots --full` for the page and `#top` into `docs/v3/after/05-globe-review/`: console clean.
  - Lighthouse: mobile 89 and 92 (LCP 3.4 s, CLS 0, TBT 50–190 ms); desktop 100.
  - The cobe chunk is unchanged (5,893 B gzipped).
- **Tooling note:** the long-running dev server kept serving stale Tailwind CSS (the new offset class never appeared). Restarting did not help; clearing `.next/dev` did.

## Step 05b checks (27 Sep 2026)

Measured in headless Google Chrome with the real GPU (`channel: "chrome"`), on dev with `?globe-debug` unless noted. Screenshots are in `docs/v3/after/05b-globe/`.

- **Chrome self-review:** not possible. The Chrome window stayed hidden (`visibilityState: hidden`), so Chrome drew no frames. The globe paused itself there, as it should. The comparison with the study was made in headless Chrome instead (`cmp-study.png`, `cmp-site.png`, both 7 s after load): the sphere, dots, graticule and rim match. The only difference is the planned one: a solid head point instead of the study's soft glow.
- **Land data:** 11,061 points, 44,244 B, byte-identical to the study's inline data.
- **Chunk:** `40pmkdc0_t824.js` (three plus the engine) is 569,705 B raw and 140,232 B gzipped (the budget is 160 KB). It is not in `/`'s first-load list.
  - First-load JS is 843,524 B. That is 7,524 B less than step 05 measured the same way (851,048 B, from a build of the previous commit), because the HeroGlobe chunk shrank from 26,889 to 19,365 B.
  - `globe-land.bin` is 44,244 B.
  - The still frames are 146,290 B (1600) and 62,118 B (800), WebP at quality 0.8, both under §AM.3's 150 KB texture budget.
- **Cost** (1440×900, dpr 1):
  - 60 fps.
  - JS per frame: 0.27 ms mean, 0.5 ms p95 (the budget is 2 ms). At the other five sizes, p95 is 0.3–0.7 ms.
  - 18–20 draw calls (the budget is 24), so the markers stay nine meshes.
  - Production: 301 rAF callbacks in 5.01 s (60.1 fps).
- **Motion** (50 s at 1440×900):
  - The sway ran from 62.0° to 100.0° east.
  - At most three arcs were in flight.
  - Each arc landed at 1.50–1.52 s (frame-quantised) and was gone at 3.10 s. Launches came every 1.31–1.32 s.
  - At most one caption was visible at a time, and only Pakistan, the UAE and Germany were labelled.
  - Six places were reached: Pakistan, Saudi Arabia, the UAE, India, Germany and Egypt. Singapore (under the right-edge crop) and the United Kingdom (facing below 0.3) were not reached, as the target rules intend.
- **Head point** (calculated): the disc is 0.022 × 0.76 across. At 1440×900 that is 7.9 px at the front of the sphere, and 8.2–8.5 px at an arc's apex.
- **Pause:**
  - 121 frames in 2 s on screen.
  - 0 when scrolled two viewports down, and 120 again on return.
  - 0 while hidden, with a simulated `visibilitychange` (headless keeps tabs visible).
  - It resumes where it left off: elapsed went from 6.52 to 7.50 s one second after showing again.
- **Composition:** this is the gap from "your organization." to the sphere. R comes from fov 30° at 4.18 units. The gaps are unchanged from step 05. "Closest arc" is the closest a lit arc point came to the headline's text boxes over 45–50 s at each size; none crossed.

  | Size | R | Sphere left | Dim span ends | Clear | Closest arc |
  |---|---|---|---|---|---|
  | 1920×1080 | 447 | 1424 | 1199 | 225 | 289 |
  | 1440×900 | 372 | 1027 | 959 | 68 | 123 |
  | 1440×1000 | 384 | 1014 | 959 | 55 | 111 |
  | 1366×768 | 318 | 1014 | 879 | 135 | 183 |
  | 1280×800 | 331 | 913 | 802 | 111 | 160 |
  | 1024×768 | 273 | 721 | 642 | 80 | 129 |

- **Network:**
  - Production at 500 px requested only `globe-still-800.webp`.
  - Reduced motion at 1440 requested only `globe-still-1600.webp`.
  - Dev with `?globe-fallback` requested only `globe-still-1600.webp`, plus Turbopack's 769-byte dev loader stub for the dynamic import. The stub loads no three code, and production has no stub.
  - The desktop production control requested the engine chunk and `globe-land.bin`.
- **Lighthouse (production, :3100):**
  - Mobile: 93 and 93. LCP 3.2–3.3 s (the lede), TBT 30–50 ms, CLS 0.
  - Desktop: 99 and 100. LCP 0.6 s (the lede), TBT 0–80 ms, CLS 0.
- **verify-shots:** `--full` for the page and for `#top`, console clean. SwiftShader runs the engine at 1440; 390 and 768 show the still frame at 40%.
- **Captures:** `--frames --mobile` against production with real Chrome, in `frames/`.
- **Still frame:** it matches the study's own reduced-motion frame (`study-still.png`). At 72° east the Germany arc climbs near the rim and curls into Germany, which faces at only 0.28 there. This is a question for Mehdi.
- **Differences from the prompt:** no values differ. Two implementation choices are recorded in the plan at the top: three loads after the headline settles, and the head disc fills 76% of its sprite.

## Arcs to and fro (27 Sep 2026, per Mehdi)

**What changed:**
- **Routes:** arcs no longer only leave Muscat. The engine builds one great circle per pair of confirmed places (36 routes for nine places) and flies each either way; a `uReverse` uniform flips the lit span.
- **Order:** flights take turns out from Muscat, back to Muscat, then between two other places (`ROUTES.order`). A place Muscat has just reached sends the next arc back first, so arcs go to and fro.
- **Cadence:** up to five arcs in flight (it was three), launched every 0.9 s (it was 1.3 s), with a 0.5 s retry.
- **Kept:**
  - the source faces at least 0.15, and the destination faces at least 0.3 and lands inside the hero margins;
  - the headline guard;
  - no route already in flight, and no place another arc is about to land on;
  - labels for clients only;
  - the draw, tail and landing timings.
- **Still frame:** unchanged, with Muscat's three client arcs.
  - Drawing every client route bunched the UAE, Pakistan and Muscat arcs to Germany into a knot, and a still can't show direction.
  - `renderStill` now picks those three routes from the route list, so a re-render gives the same image.

**Checks, in Chrome with the GPU (headless), with `?globe-debug`, over one full 48 s sway:**
- **Flights:** 52 in all: 18 out from Muscat, 17 back to it, 17 between.
- **To and fro:** return trips follow outbound ones, e.g. Muscat → Germany at 6.4 s, then Germany → Muscat at 10.1 s.
- **In flight:** at most 4 at once, 3.3 on average; the 0.9 s cadence and 3.1 s life rarely reach five.
- **Places:** every place except the United Kingdom flew. At 62–100° east the UK never faces the viewer enough.
- **Headline:** no lit point fell on its line boxes.
- **Labels:** Pakistan, the UAE and Germany only. The console was clean at 60 fps.

**Production:** `verify-shots --full --section=#top` is console clean (`docs/v3/after/globe-arcs/`), and so is the production build in Chrome (`prod-1440-*.png`).

**Lighthouse (three runs per preset):**
- Mobile: 91, 92 and 92 (median 92, as after step 07). LCP 3.34 s, TBT 74 ms, CLS 0.
- Desktop: 100, 100 and 100.
