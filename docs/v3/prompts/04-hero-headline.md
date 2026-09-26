# Step 04 · Hero headline motion (decided: board option A)

Read `docs/v3/BRIEF.md` first. This step gives the hero a load sequence: the headline lines rise through masks in the heavy display, the lede and CTAs follow, and one mono data line types on last. The globe is untouched here; step 05 rebuilds it.

## 1. Study the references

Board captures are in `docs/v3/references/hero-text/board/`. The t0/mid/end frames show each reveal in progress, with measured timings in INDEX.md. Then capture the load animations live:

```bash
npm run refs -- hero-text https://linear.app --frames
npm run refs -- hero-text https://www.anthropic.com --frames
npm run refs -- hero-text https://www.exoape.com --frames --wait=4000
npm run refs -- hero-text https://www.spacex.com --probe
```

In `docs/v3/references/hero-text/NOTES.md`:

- **For each site:** what moves, in what order, over how long, and what stays still.
- **Linear:** the measured spec is opacity 0→1, blur 10px→0, rise 20%→0, 1000ms, delays 400/500ms.
- **Anthropic:** 48px→0 over 800ms, words out of order.
- **Exo Ape:** take the line-mask technique only; skip its preloader and panel wipe.
- **SpaceX:** the countdown is the precedent for one line of live-looking mono data. Note its size and position.
- **Avoid:** `avoid-lusion-mid.jpg` (preloader, words tilted 15°).

## 2. The sequence

| t (s) | Element | Motion |
|---|---|---|
| 0.00 | eyebrow (`type-label`) | opacity 0→1, 0.6s |
| 0.10 | headline lines (`type-hero`) | each line rises through its own mask: yPercent 108→0, 1.05s, `expo.out`, stagger 0.08s |
| 0.55 | lede (`type-lead`) | opacity 0→1, y 14px→0, 0.8s `expo.out` |
| 0.75 | CTAs | same as the lede |
| 0.95 | data line (`type-data`) | types on left to right, about 24ms per character |

The whole sequence finishes within about 2.1s. The globe (step 05) fades in after it. Nothing loops and nothing blocks: no preloader, no scroll lock.

## 3. Build it

- **Component:** create `src/components/sections/HeroHeadline.tsx` (client). It runs on load, not on scroll. The existing `SplitText` component deliberately skips above-the-fold elements, so don't use it here.
  - Use GSAP's `SplitText` (registered in `src/lib/gsap.ts`) with `type: "lines", mask: "lines", autoSplit: true`.
  - Keep the dim span ("your organization.") as its own colour through the split.
  - Accessibility: a visually hidden plain copy of the headline carries the text, and the animated copy is `aria-hidden`, as in v1's `SplitText`.
- **No flash, no stuck text:**
  - Add a tiny inline script in `layout.tsx` `<head>`: `document.documentElement.classList.add("js")`.
  - CSS: `.js [data-hero-reveal] { visibility: hidden; animation: hero-failsafe 0s 2.5s forwards }` with `@keyframes hero-failsafe { to { visibility: visible } }`.
  - The component sets `visibility: visible` once the split is ready. If the script ever fails, the failsafe shows the text after 2.5s.
- **Wait for fonts:** await `document.fonts.ready`, with a 1.2s timeout, before splitting, so lines don't re-wrap mid-animation.
- **The data line:**
  - Content: `ORIGIN MUSCAT · 23.59° N, 58.38° E · GST UTC+4`. Add "GST UTC+4" (Muscat's time zone, a fact) to the hero caption in `site.ts`, as confirmed.
  - On ≥900px, it replaces v1's bottom-right caption, in the same position.
  - On <900px, it sits under the CTAs; v1 hid the caption on mobile.
  - Type it on by revealing characters, either with a monospace `ch` width and `steps()` or with a JS character reveal. Screen readers get the full text immediately.
- **Parallax:** keep v1's `data-speed` layers (headline 0.97, globe 0.93). The reveal animates inner line elements, so it doesn't fight the parallax transform on the `h1`.
- **Reduced motion:** everything renders in its final state, with no typing, splitting or failsafe delay.

## 4. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/04-hero-headline`). Then:

- **Record the sequence** with `npm run refs -- _self http://localhost:3000 --frames --mobile`. Compare the frames with Linear's and Exo Ape's, and put the comparison in NOTES.md. Delete the `_self` capture afterwards.
- **Measure timing and layout:** check total time to settle (≤ 2.1s), layout shift (0), and LCP (the headline should still be the LCP element, painted within 2.5s on a production build: `npm run build && npm run start`, then Lighthouse).
- **Reduced motion:** with `prefers-reduced-motion: reduce`, it's static and complete.
- **Script failure:** with JavaScript disabled, the headline shows (no `js` class). With the component's effect removed (simulating a failure), the failsafe reveals it at 2.5s.

Commit: `v3(04): hero headline load sequence with mono data line`.

## Acceptance

- The headline lines rise through masks at 1.05s with a 0.08s stagger, and the lede, CTAs and data line follow in the order and timings above.
- There's no flash of text, no re-wrap during the animation, and no layout shift; the failsafe works.
- The data line is correct at both breakpoints, readable by screen readers, and static under reduced motion.
