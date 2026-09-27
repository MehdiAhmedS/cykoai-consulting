# Step 06 · Offers: rows that open on scroll, each with a 3D piece (decided 27 September)

Read `docs/v3/BRIEF.md` first. This section answers one question: *what exactly can I hire you for?*

The design changed on 27 September. The rows with terms that Mehdi picked on the first board stay, but they now work the way Cuberto's service list does:

- each row opens by itself as it scrolls up the screen;
- an open row fills with Windsor;
- each open row shows a small three.js piece of that kind of work, instead of a picture.

Mehdi approved the Cowork study of this design. The six offers and their copy stay as they are.

## 1. The design source

This step has no reference study; go straight to the plan. The design is the Cowork study, `docs/v3/references/offers/study/index.html`. It comes from Cowork along with this prompt, so it goes in the `v3(docs)` commit with the brief and prompt updates.

- **Read its module script before planning.** The shared material, the six scene builders, the renderer loop and the open-and-close logic all come from it. Port the scenes' geometry, cameras and timings exactly.
- **Its layout and copy are a sketch.** The site's values come from this prompt, `site.ts` and the `type-*` utilities.
- **To watch it run,** serve it with `python3 -m http.server 3300 --directory docs/v3/references/offers/study` and open `http://localhost:3300`. It loads three.js from jsDelivr. Its fps readout shows how many pieces are drawing.
- **Don't use the old references.** The board captures in `references/offers/board/` (Evil Martians, Trail of Bits, Vanta, Wiz) belong to the first design and no longer apply.

When the plan is approved, write it at the top of `docs/v3/references/offers/NOTES.md`, a new file, in a few lines under a "Step 06" heading.

**Baselines:** before changing any code, make a production build of the current commit.

- **Lighthouse:** run it three times per preset (mobile and desktop), served on :3100, and record the medians in NOTES.md.
- **JavaScript:** record the total gzipped size of `.next/static/chunks`, and the size of the chunk that contains three.js (the one that includes `__THREE__`).

## 2. The section

### Header and list

- **Tone:** light (`bg-white`, `data-tone="light"`).
- **Header:**
  - `type-label` "Offers";
  - the `type-h2` heading and `type-lead` intro from `site.ts`;
  - left-aligned, max 22ch and 60ch.
- **The list:** the six offers from `site.ts` as `<article id="offer-<id>">` rows, in `site.ts` order (by practice), with no numbers. An open row carries `data-open`. A 1px n150 rule closes the list.

### A closed row

- **From 768px,** a grid of `150px minmax(0,1.25fr) minmax(0,1fr) 22px`, aligned to the baseline, gap 28px:
  - the practice, in `type-label` n500;
  - the name, an `<h3>` in `type-h3-lg`, n900;
  - the "for" line, in `type-small` n500;
  - a plus drawn with two 18px hairlines in n700.
- **Padding:** 30px top and bottom, `clamp(16px,2.5vw,32px)` at the sides.
- **The rule:** a 1px n150 rule sits across the top of each row.

### An open row

- **The fill:** a Windsor layer behind the row's content grows down from the row's top edge: `scaleY` 0 → 1, origin at the top, 0.7s `cubic-bezier(.16,1,.3,1)`. Closing reverses it.
- **Colours** change over 0.5s. Colour changes only repaint, so they're allowed alongside the transform rule:
  - the name turns white. Its weight drops by 20 instantly, not animated: add `[data-open] :is(.type-h3-lg) { font-weight: 680 }` beside the dark-tone rules in `globals.css`. Never put `data-tone` on a row;
  - the practice turns Driftwood-soft;
  - the "for" line turns n300;
  - the plus turns white and rotates 45° into a cross;
  - the row's rule turns `white/10`.
- **The body** opens under the head with the `grid-template-rows` 0fr → 1fr technique, over 0.7s with the same ease. It's the one layout transition in the section, as in the first design.
  - From 768px it's a grid of `150px minmax(0,.85fr) minmax(0,1.15fr)`.
  - Column 2 holds "You get" in `type-label` Driftwood-soft, then the "you get" text in `type-body`, white, max 40ch. It fades and rises 12px, 0.12s after the fill starts.
  - Column 3 holds the 3D piece in a 16:10 box, with its caption under it in `type-label` n300. It fades in over 0.8s.
  - Padding: 4px at the top, 36px at the bottom.

### When rows open

- **Opening:** a row opens when its top rises above 66% of the viewport height.
- **Closing:** it closes when its top falls back below 78%. The gap stops a row flickering at the line.
- **Rows stay open** as they scroll off the top.
- **Measure it live:** read each row's `getBoundingClientRect()` on every tick of the GSAP ticker, after the callback that drives `lenis.raf`, so the check reads that tick's scroll. This is what the study does. Don't give each row its own ScrollTrigger: opening a row pushes every row below it down, and stored trigger positions would go stale.
- **Keep the rest of the page right:** opening and closing change the page's height above Projects and Engagement, so ScrollTrigger has to re-measure.
  - Listen for `transitionend` on each row's body, filtered to `propertyName === "grid-template-rows"`, and call `ScrollTrigger.refresh()`, debounced by about 150ms.
  - Instant opens (below) fire no `transitionend`, so refresh after them explicitly.
  - Time every refresh, and report the count and the longest in `__offers`. If one takes more than 8ms, wait until Lenis stops before refreshing, unless the top of Projects is within one screen height.
- **Jumps past Offers:** `SmoothScroll.tsx` sends every `#` link through `lenis.scrollTo`, which fixes its target when the click happens. Rows opening during the glide would then push the target away. So when the target is below the list:
  - open every row instantly, with transitions turned off for one frame;
  - call `ScrollTrigger.refresh()`;
  - then scroll.
- **On load:** rows already above the viewport (after a reload mid-page, or a `#` link in the URL) open instantly, and the scroll position is corrected by however much the list grew.
- **Reduced motion:** every row is open from the start. Set this in CSS under `@media (prefers-reduced-motion: reduce)` (body at `1fr`, fill at scale 1, copy and piece visible), so the server-rendered page is already open and nothing shifts after hydration. There are no transitions, and each piece is its still image (part 4).
- **The navbar:** an open row is Windsor, so treat the bar as over a dark surface whenever an open Offers row (`[data-open]`) is under it, using step 03's dark values. Check it at 1440 with rows open under the bar.

### Below 768px

- **The head** stacks: the practice, the name, then the "for" line, with the icon at the right.
- **The body** stacks: the piece first, then "You get".
- **Opening** works the same way as on desktop. The pieces are still images (part 4).

### Accessibility

- **Rows** are articles with the name as the `<h3>`. The body stays in the DOM when closed, so assistive tech reads every offer whether it's open or not.
- **Pieces** are `aria-hidden`, because the captions and copy carry what they show.
- **No controls:** rows open by scrolling, so there's nothing to focus, and screen readers get every row's full text either way.

## 3. The 3D pieces

### Engine

- **Files:** `src/components/ui/offers3d/`, with `engine.ts`, `scenes.ts` (the six builders) and `constants.ts`.
- **Loading:** the engine is loaded with a dynamic `import()` when the Offers section comes within one screen height of the viewport. It waits until the hero's `data-globe` is no longer `"loading"`, or 3s after load, whichever comes first, so it never competes with the globe and never waits forever when the globe doesn't start.
  - It imports from `"three"` by name, like the globe, so the bundler puts three in one chunk shared by both.
  - Set `ColorManagement.enabled = false` on the first line of `engine.ts`, and keep colours in `constants.ts` as hex strings. If the globe engine hasn't run, the shared three module would otherwise still be converting colours.
  - Part 6 checks the chunks against the baseline from part 1.
- **One renderer for all six:** a single `WebGLRenderer` that isn't in the DOM.
  - Each open row has its own 2D canvas. The engine renders that row's scene, then copies the result into the row's canvas with `drawImage` straight away, in the same task.
  - With the globe that makes two WebGL contexts on the page, and no more.
- **Renderer settings:** alpha, antialias, clear alpha 0, output `LinearSRGBColorSpace`, so hex values render as written.
  - Keep `setPixelRatio(1)`, as the study does. Size the renderer and each row's 2D canvas in device pixels: the CSS width × `min(devicePixelRatio, 2)`, with the height at width ÷ 1.6.
  - Call `setSize(w, h, false)` only when the size changes, then copy 1:1 with `drawImage(renderer.domElement, 0, 0)`. Setting a higher pixel ratio as well would make the buffer four times too big on Retina screens.
- **What draws:** only rows that are open and within 40px of the viewport, and at most the three of those nearest the viewport's centre. Nothing draws in a hidden tab. Every duration is in seconds of elapsed time, with dt capped at 50ms.
- **Warm-up:** after loading, build one scene per idle slot and compile it with `renderer.compileAsync`, so the first opening doesn't stutter. The Offers section starts within a screen of the hero, so this startup cost falls inside desktop Lighthouse.
- **Teardown:** on unmount, dispose every geometry and material and force the context loss. If the context is lost unexpectedly, switch to the still images.
- **Debugging:** `?offers-debug` (dev) keeps `window.__offers`, reporting fps, frame cost (mean and p95), draw calls per piece and which rows are drawing.

### The shared look

The pieces match the globe:

- **Solids** use the study's `ramp` shader: the half-Lambert term blends shade into lit over `smoothstep(0.15, 0.95)`, with the light fixed in view space at (−0.55, 0.62, 0.56). An n300 rim mixes in over Fresnel 0.55 → 1.0.
  - It supports instancing and instance colours.
  - Back faces are shaded as front faces, for the see-through shells.
- **Edges** are 1px white hairlines (`EdgesGeometry` or line loops), at the opacities the study uses.
- **Accents:** Driftwood-soft for the one thing that moves the story on, such as a packet, a flag or the visor.
- **Dots** are small unlit spheres.
- **Rules:** no glow, no bloom, no gradients beyond the solids' shading, and no textures.

### The six pieces

Port each builder from the study, with its camera, geometry, colours and timings.

| Offer | Study builder | What it shows |
|---|---|---|
| Security reviews | `sceneSecurity` | Three plates (an app's layers) with dot grids and a Driftwood scan plane that sweeps down over 3s, in a 4.8s cycle. Where it passes a plate, set dots flag Driftwood-soft and a ring spreads. |
| Workspace hardening | `sceneWorkspace` | A core with 22 account nodes on a Fibonacci sphere, linked to it, inside a faceted icosahedron shell. Five freelancer links are Driftwood. Every 3.2s one is highlighted and pulled back to the core; it returns 7.2s later. |
| AI automation | `sceneAutomation` | Irregular boxes arrive on three lanes into a torus gate with a tilted Driftwood orbit ring and bead. They leave as evenly spaced Driftwood spheres, one every 0.52s. It's a seeded simulation, pre-run so the lanes start full. |
| Mobile apps and device integrations | `sceneMobile` | A phone (extruded rounded slab with a screen and a small UI) and three devices: a cube, a puck and a tag. Packets travel out in Driftwood along arcs and come back in white, and each device's dot lights as a packet arrives. |
| APIs and bot deployments | `sceneBot` | A capsule bot with a Driftwood visor inside a wireframe container, the deployment. Six services on sockets sit around it: database, messaging, web, payments, files, events. It turns to each in turn every 2.2s; the call goes out in Driftwood, the socket lights, and the reply comes back in white. |
| Company profiles | `sceneProfile` | Four page layers (grid, layout, type, brand) that separate in depth and settle back into one page, in a 7.2s cycle. |

The captions come from `site.ts` (part 5).

## 4. Still images

These are for phones, reduced motion, no WebGL 2 and `?offers-fallback`.

- **When the engine runs:** only at 900px and wider, with WebGL 2 available and reduced motion off. Decide on mount. If a resize crosses 900px, switch cleanly.
- **Everywhere else:** each piece is a still image, and neither three.js nor the engine is requested.
- **Making the stills,** as step 05b does for the globe:
  - In dev, `?offers-still` skips the width and globe checks. It builds each scene fresh and calls `update(still, 0)` once, at 1600 × 1000.
    - Pass a "snap" flag in place of the study's `reduce`, so state that eases in (such as the bot's visor turning) lands exactly on its pose.
    - It then sets `window.__offerStills` to one WebP data URL per piece.
  - `scripts/render-offer-stills.mjs` opens that page in a viewport at least 900px wide, with motion allowed, and writes `public/assets/gen/offer-<id>-1600.webp`.
  - Add the stills to `public/assets/gen/manifest.json` and commit them.
- **Showing the stills:** use `next/image`, which makes the smaller sizes from the 1600 file. Make them lazy-loaded and decorative, in the same 16:10 box, with `data-gen-asset` so the every-image-removed check covers them. With the images removed, the box stays Windsor, with the caption under it.

## 5. Content and rules

- **In `site.ts`,** add a `caption` to each offer, as a `Text` with `status: "draft"`, using the study's captions:
  - Security reviews: "An app's layers, scanned before launch".
  - Workspace hardening: "Accounts, their access, and the shell around them".
  - AI automation: "Scattered manual work in, one steady flow out".
  - Mobile apps and device integrations: "One app, in conversation with its devices".
  - APIs and bot deployments: "A bot in its container, calling the services around it".
  - Company profiles: "Grid, layout, type and brand, layer by layer".

  The "You get" label is the existing `offers.fields.youGet`. Keep every existing draft as written, and don't add a "From you" field.
- **In `CLAUDE.md`,** the WebGL line becomes: "WebGL only for the hero globe and the Offers pieces (three.js)". Extend its shading note to the Offers solids.
- **Never invent:** no deliverables, prices, durations or client names in the copy, and no text, digits or labels inside the pieces.

## 6. Check, commit, report

Run the brief's check list, with verify-shots into `docs/v3/after/06-offers` and `--section=#offers`. Also:

- **Open rows:** add `--scroll="#offer-ai-automation@0.3" --scroll="#offer-apis-bots@0.3"` so the shots catch rows open with their pieces. First make `--scroll` wait for the section to settle:
  - after scrolling, wait 1.2s, then scroll to the same fraction again, and repeat until the target's top holds steady within 2px;
  - then wait for `data-open` on the target row, plus 1.6s for the fill and the piece to appear.
- **Compare with the study:** in the Chrome self-review, scroll through Offers beside the study page, served as in part 1. The pieces, their timing and the row motion should match.
- **Frame rate:** during a 5s scripted scroll through Offers (`window.__lenis.scrollTo(y, { duration: 5, easing: (t) => t })`):
  - count `requestAnimationFrame` callbacks and report the longest gap between frames. The count should hold the display's refresh rate;
  - from `__offers`, p95 frame cost should be 3ms or less, with no more than three pieces drawing at once. Report the refresh count and the longest refresh.
- **Idle cost:**
  - with every row closed or off screen, nothing draws;
  - in a hidden tab, `renderer.info.render.frame` stops advancing.
- **Phones and fallbacks:**
  - At 500px wide and with reduced motion on, the network panel shows no three.js chunk and no Offers engine, only the still images.
  - With `?offers-fallback`, there's no Offers engine. The globe still loads three.js at 900px and wider.
  - With `?offers-fallback&globe-fallback`, no three.js loads at all.
- **The rest of the page:**
  - Open all six rows, then scroll on. The Projects stage still wipes as each title passes 98% of the viewport, and the Engagement section behaves as before.
  - From the top of the page, each nav link and hero CTA lands within 2px of its usual 80px offset.
  - After a reload halfway down the page, nothing jumps.
- **Bundle,** measured in `.next/static/chunks` against part 1's baseline:
  - exactly one chunk contains three.js (`__THREE__`), and the console never warns about multiple instances of three.js;
  - the total gzipped JavaScript grows by 25 KB or less;
  - the three.js chunk plus the globe engine stays within step 05b's limit of 160 KB gzipped. If it doesn't, report the number.
- **Lighthouse:** three runs per preset again. Compare the medians with the baseline from part 1: they should be within 2 points.

Commit: `v3(06): offers open on scroll with a three.js piece each; stills on phones`. The report lists every TBC and draft in this section, the chunk sizes and the frame figures.

## Acceptance

- **Rows:** six rows, ordered by practice, with no numbers. Each opens as it rises past 66% of the viewport, fills with Windsor, shows "You get" and its 3D piece, and closes again if scrolled back past 78%.
- **The pieces** match the study: one shared renderer, the globe's look, only open on-screen rows drawing, and the bot piece for APIs and bot deployments.
- **Phones, reduced motion and no WebGL** show still images and never load three.js.
- **Transforms and opacity** only, plus colour changes and the one `grid-template-rows` transition.
- **The rest of the page** keeps its scroll timings after rows open and close. Anchor links land where they should, and the navbar reads open rows as dark.
