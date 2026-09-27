# Offers: rows that open on scroll, each with a 3D piece

## Step 06

**Build plan (approved 27 Sep 2026).**
- **Rows:** `OffersList` (client) renders the six rows from `site.ts`. A check on the GSAP ticker, which always runs after Lenis's callback, reads each row's rect and sets `data-open` (open above 66%, closed below 78%). CSS does the rest:
  - the fill's `scaleY`;
  - the colours;
  - the `grid-template-rows` body;
  - reduced motion, where every row is open in CSS from the first paint.
- **Instant opens** (a row that opens while already above the viewport, and `#` jumps past the list):
  - transitions are off for one frame;
  - the scroll is corrected by how far an anchor moved (browser scroll anchoring may already have done it);
  - then `lenis.resize()` and `ScrollTrigger.refresh()`.

  During a jump, rows only open.
- **Refresh:** `transitionend` on `grid-template-rows` triggers `ScrollTrigger.refresh()`, debounced 150ms and timed. A refresh over 8ms defers later ones until Lenis stops, unless Projects is within a screen.
- **Pieces:** `src/components/ui/offers3d/` (`constants.ts`, `scenes.ts`, `engine.ts`) ports the study's six builders exactly.
  - One off-DOM WebGL 2 renderer copies each open, on-screen row (at most three) into that row's 2D canvas with `drawImage`.
  - It loads through a dynamic `import()` once the section is within a screen and the globe has left `loading` (or 3s after load), and warms one scene per idle slot with `compileAsync`.
- **Stills:** the engine runs only at 900px and up, with motion allowed and WebGL 2. Everywhere else, `next/image` stills (`offer-<id>-1600.webp`) are shown. `scripts/render-offer-stills.mjs` renders them through `?offers-still`.
- **Navbar:** open rows under the bar read as dark.

**Baselines (production build of `b8f0a5e`, `next start -p 3100`):**

| | Value |
|---|---|
| Lighthouse mobile (runs 91, 92, 92; median) | 92: FCP 0.91 s, LCP 3.34 s, TBT 71 ms, CLS 0 |
| Lighthouse desktop (runs 100, 100, 100; median) | 100: FCP 0.25 s, LCP 0.68 s, TBT 0 ms, CLS 0 |
| Accessibility, best practices, SEO | 100 on both presets |
| `.next/static/chunks`, all JS, gzip -9 | 406,058 bytes in 11 files |
| The chunk with `__THREE__` (`12m6jhytsunzs.js`, three plus the globe engine) | 570,689 bytes raw, 140,647 gzipped |

## Step 06 checks (27 Sep 2026)

**How it was checked.**
- Chrome's tab still reported `hidden`, so it runs no animation frames. Motion, loading and jumps were checked in headless Chrome with the GPU (Playwright with `executablePath` set to Google Chrome), at 1440 × 900, against dev (`?offers-debug`) and production (:3100).
- Chrome was used for a look: a hidden tab freezes the row transitions and, correctly, draws no pieces.
- The Cowork study was served on :3300 and shot beside the site with the same rows open (`cmp-*` in the scratchpad). The pieces, cameras and colours match, and the row layout matches.

**Rows.**
- Opening and closing: rows open as their top passes 65.9% and close at 78.2–78.3% on the way back.
- The navbar turns dark whenever an open row is under the bar, and light over the Offers header.
- Reduced motion has every row open from the first paint, with stills and no transitions.
- Below 768px the head and body stack, with the piece first.
- With images removed, each box stays Windsor with its caption (`*-noassets.png`).

**Frame rate (a 5s `__lenis.scrollTo` through the list, dev):**
- 318 frames in 5.28 s (60 fps, the display's rate), longest gap 16.8 ms.
- `__offers`: p95 frame cost 0.80 ms, mean 0.56 ms.
- At most 2 pieces drawing at once (limit 3).
- Draw calls per piece: security 15, workspace 5, automation 12.
- 3 refreshes, the longest 4.3–5.3 ms, so none deferred.

**Idle cost.**
- With every row closed, or the list off screen, `render.frame` holds (884 → 884).
- With `document.hidden` true it holds too (282 → 282). Headless never hides a tab, so the flag was forced; the tick checks it.

**Jumps from the top of the page.**
- Offers, Projects, Engagement, Standards, both "Talk to us" and "See what we do" land at 79.9–80.4px.
- For targets below the list, all six rows open instantly and none closes during the glide.
- With all six rows open, Projects' second wipe still starts at 98% and lands at 58%, linearly (90% → 80%, 78% → 50%, 66% → 20%). Engagement still pins (section at 0, track −400px, 400px in).

**Reload mid-page (production).**
- Chrome restores the scroll against the server HTML, where the rows are closed.
- Rows above the viewport then open instantly, and the scroll is corrected, so what's on screen holds.
- Rows in view open with their normal transition. The first run found a bug here: `data-instant` sat on the list, so those rows snapped open (+813px). The marker now goes on each instantly opened row.
- Reloads below Engagement still shift by 556px just after load. That is Engagement's pin spacing arriving with hydration, and the baseline build (`b8f0a5e`, served on :3200 from a worktree) does the same, so it isn't from this step.

**Network (production unless noted).**

| Case | Result |
|---|---|
| 1440 with motion | one three.js chunk, both engines, no stills, no console warnings (none of three's "multiple instances") |
| 500px, and 1440 with reduced motion | no three.js, no engines, only the six stills |
| Dev `?offers-fallback` | no Offers engine; the globe still loads three.js |
| Dev `?offers-fallback&globe-fallback` | no three.js at all |

**Bundle (`.next/static/chunks`, gzip -9).**
- Total: 428,356 bytes in 15 files, up 22,298 from the 406,058 baseline (limit 25 KB).
- Exactly one chunk has `__THREE__`: 144,719 bytes.
- The globe engine is its own chunk (6,875), so three plus the globe engine is 151,594 (limit 160 KB).
- The Offers engine is 8,236.

**verify-shots.** `--full` and `--full --section=#offers` with `--scroll="#offer-ai-automation@0.3" --scroll="#offer-apis-bots@0.3"`, into `docs/v3/after/06-offers/`. Console clean.

**Lighthouse (production, three runs per preset, medians):**
- Mobile: 91, 91 and 90 → 91 (baseline 92). LCP 3.46 s, TBT 118 ms (was 71), CLS 0.
- Desktop: 100, 100 and 100 (baseline 100). LCP 0.72 s, TBT 0, CLS 0.
- Accessibility, best practices and SEO are 100 on both.
- Within 2 points.

**Differences from the prompt:**
- Still images mount with `loading="eager"` once the section is within one screen height. Native lazy loading never fetches inside a closed (clipped) row, so the 0.8 s fade would finish before the picture arrived.
- The piece's fade keeps the study's 0.12 s delay (the prompt gives 0.8 s and no delay).
- "Company profiles" is now "Landing pages" (`landing-pages`), per Mehdi on 27 Sep. Its still was renamed to match.
