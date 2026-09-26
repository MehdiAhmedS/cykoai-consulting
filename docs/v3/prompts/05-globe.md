# Step 05 · The globe: cobe sphere, graticule, real locations only (decided: board option A)

Read `docs/v3/BRIEF.md` first. The v3 rules allow WebGL for this globe only, require it to show real locations only, and require the hero to read completely without it.

v1's `WorldCanvas` is a Canvas 2D dotted globe that draws arcs from Muscat to eight world cities. Cykoai hasn't worked in those cities, so those arcs are decoration pretending to be data. This step rebuilds the globe in two layers:

- **cobe** (WebGL, about 6KB) draws the lit, dotted sphere.
- **A 2D overlay** draws the graticule, the sphere's hairline edge and arcs, sharing cobe's rotation.

Every location comes from `site.ts`, and only confirmed ones are drawn.

## 1. Study the references

Board captures are in `docs/v3/references/globe/board/`:

- **Cloudflare's network globe** is the one live globe that holds up: dotted land, a graticule, real pins, one caption per region, no glow, no starfield.
- **Vercel's static map:** every dot is a real location.
- **Hadrian's clock strip:** geography without a map.
- **Avoid** `avoid-kaspersky.jpg`, the threat-map cliché.

Then go through them live in Chrome, as the brief describes: watch Cloudflare's globe through at least one full cycle of its arcs or pins, try dragging it, and check how its canvas is set up (size, pixel ratio, WebGL or 2D). Save a record with:

```bash
npm run refs -- globe https://www.cloudflare.com/network/ --frames --probe --mobile
npm run refs -- globe https://vercel.com/docs/regions --probe
```

The `--probe` tech field shows whether a site uses a canvas, WebGL, three.js or cobe. In `docs/v3/references/globe/NOTES.md`, note the globe's size relative to the viewport, the density of the land dots, the graticule spacing and alpha, the pin and caption treatment, and how Cloudflare labels a region.

## 2. Data (`src/content/site.ts`)

Add `globe.locations: { name, lat, lng, role: "origin" | "client", status: "confirmed" | "draft" }[]`:

- **Muscat:** `{ name: "Muscat", lat: 23.59, lng: 58.38, role: "origin", status: "confirmed" }`.
- **Client locations,** confirmed by Mehdi on 26 September. Each is placed at the country's capital and labelled with the country name only, never a city:
  - `{ name: "Pakistan", lat: 33.68, lng: 73.05, role: "client", status: "confirmed" }` (Islamabad)
  - `{ name: "UAE", lat: 24.45, lng: 54.38, role: "client", status: "confirmed" }` (Abu Dhabi)
  - `{ name: "Germany", lat: 52.52, lng: 13.40, role: "client", status: "confirmed" }` (Berlin)
- **Africa:** there are clients in Africa, but the country is TBC. Leave it out of the array until Mehdi names the country, then add it the same way. In dev only, show a small DRAFT note under the hero saying so.
- Muscat also has clients, but it's the origin, so it gets a marker and pulse and no arc.

## 3. Build it

- **Install:** `npm i cobe`. Read the README and source in `node_modules/cobe` for the API of the installed version. The options below exist in 0.6.x; adapt the names if the major version differs, and note that in NOTES.md.
- **Component:** create `src/components/ui/HeroGlobe.tsx` (client) to replace `WorldCanvas` in the hero. Keep the same wrapper, placement and parallax (`data-speed="0.93"`, right-side crop on desktop, centred at 40% opacity on mobile).
- **Composition:** step 02's wider type pushed the headline across: at 1440, "your organization." now ends around x=960, over the globe's left edge. Adjust the globe wrapper's size and right offset so the headline stays clearly legible. Either the sphere's lit area sits clear of the headline, or, where they overlap, the globe is dim enough that the text keeps AA contrast. Check at 1280, 1440 and 1920, keep the right-edge crop, and record the positions in NOTES.md.
  - Two stacked canvases, both `aria-hidden`: cobe underneath, the 2D overlay on top.
  - One `onRender` loop drives both, so they share phi and theta exactly.
- **cobe settings:**

  | Option | Value |
  |---|---|
  | `dark` | 1 |
  | `baseColor` | `[0.07, 0.10, 0.17]` (Windsor, lifted) |
  | `markerColor` | `[0.68, 0.53, 0.32]` (Driftwood) |
  | `glowColor` | `[0.043, 0.082, 0.153]` (the Windsor background, so no glow is visible; the no-glow rule still applies) |
  | `diffuse` | about 1.2 |
  | `mapBrightness` | about 5 |
  | `mapBaseBrightness` | about 0.02 |
  | `mapSamples` | about 14000 on desktop, about 9000 below 900px |
  | `devicePixelRatio` | `min(window.devicePixelRatio, 2)` |

  Markers: Muscat at size 0.06; confirmed clients at 0.035.
- **Rotation:** one revolution per 110s (v1's pace) and a tilt of about −13°, converted to cobe's theta. There's no user interaction; the globe is decorative.
- **Overlay projection:**
  - Replicate cobe's own maths: find its latitude/longitude → xyz conversion and its phi/theta rotation in `node_modules/cobe`, and reuse them exactly. Don't approximate.
  - Draw only the front hemisphere (z > 0).
  - Add a debug mode (`?globe-debug=1`, dev only) that draws overlay dots on top of cobe's markers. Check alignment within 2px at three different rotations, and screenshot it for NOTES.md.
- **Overlay content:**
  - Graticule every 30° of latitude and longitude: 1px, `rgba(255,255,255,0.06)`.
  - The sphere's edge: 1px, `rgba(255,255,255,0.10)`.
  - Muscat's pulse ring: the Driftwood ring from v1, every 4s.
  - Arcs from Muscat to each confirmed client location, one at a time, with v1's lifecycle: draw 3.2s, hold 0.9s, fade 1.2s, gap 1.4s. The arc is `rgba(173,135,82,.7)` with a small head dot.
  - When an arc lands, a one-line mono caption with the location's name from `site.ts` (the country, never a city; `type-data`, n300) fades in beside the destination and leaves with the fade. No counts or claims unless `site.ts` has them confirmed.
- **Performance:**
  - Import cobe dynamically after idle (`requestIdleCallback` with a 1.6s timeout, as v1 does for its land data), so it never competes with the headline.
  - Fade the globe in over 0.8s once the first frame is drawn, after the step 04 sequence.
  - Pause rendering when the hero is off screen (IntersectionObserver) or the tab is hidden.
  - cobe must end up in its own chunk; confirm with the build output.
- **Fallbacks:**
  - If WebGL isn't available, fall back to v1's `WorldCanvas`, fed the same locations (Muscat only for now; no hard-coded cities).
  - Under reduced motion, draw one static frame with Muscat facing the viewer and no arc animation.
  - The hero must read completely if the canvas fails or is removed.
- **Clean-up:** remove the eight hard-coded target cities from `WorldCanvas` (it becomes the fallback), and delete `public/assets/land-points.json` only if nothing uses it any more.

## 4. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/05-globe`). Also:

- Put `--frames` captures of the hero next to Cloudflare's globe in NOTES.md: dot density, graticule, calm.
- Record the alignment debug screenshots, the frame rate on desktop (in Chrome, count `requestAnimationFrame` callbacks over 5 seconds with the JavaScript tool; it should hold the display's refresh rate, 60fps or more), the size of the cobe chunk, and that nothing renders while off screen.
- Check reduced motion (static frame), the no-WebGL fallback (you can force it with a query flag) and the canvas-removed hero.

Commit: `v3(05): cobe globe with graticule overlay; real locations only`.

## Acceptance

- The two layers stay aligned within 2px, with the graticule and edge hairline drawn and no visible glow or starfield.
- Only confirmed locations appear: Muscat, Pakistan, the UAE and Germany today, labelled by country. Arcs animate one at a time, only to confirmed client locations.
- cobe loads after idle in its own chunk and pauses off screen. The reduced-motion and no-WebGL fallbacks work, and the hero reads without the canvas.
