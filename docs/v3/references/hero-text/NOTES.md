# Hero text: headline entrance

**Build plan (approved 26 Sep 2026).**
- **Component:** `HeroHeadline.tsx` holds the eyebrow, the h1 (a screen-reader copy plus an `aria-hidden` animated copy), the lede, the CTAs and the data line.
- **Sequence:** it waits for fonts (1.2s cap), then splits lines with GSAP SplitText masks and runs one timeline:
  - eyebrow 0s
  - lines 0.10s (yPercent 108→0, 1.05s expo.out, stagger 0.08)
  - lede 0.55s
  - CTAs 0.75s
  - data line typed at 0.95s, 24ms per character
- **Masks:** each line gets `padding-bottom: 0.15em` and each mask `margin-bottom: -0.15em`, so descenders are not cut (the study's finding).
- **Hiding and failsafe:** the `js` class hides `[data-hero-reveal]` until the split is ready, with a 2.5s CSS failsafe. Reduced motion shows everything static.
- **Data line:** "ORIGIN MUSCAT · 23.59° N, 58.38° E · GST UTC+4" sits bottom-right at 900px and up, and under the CTAs below that.

Studied 26 Sep 2026 live in Chrome at 1440 (system theme dark) and saved with the prompt's `npm run refs -- hero-text …` commands into `live/`.

Load animations: the `--frames` window (0–2500ms from DOMContentLoaded) caught Anthropic's reveal. It missed Linear (the hero appears after about 2.5s) and Exo Ape (its preloader runs past 2.5s). So the Linear timing below comes from the live Web Animations objects in Chrome. The Exo Ape timing comes from the brief's sampler, attached during its preloader in a headless Playwright page (the Chrome tab stays in the background and throttles frames). The board frames match both.

**Linear** (Inter 510, 64/64px, −0.022em)
- **What moves:** each headline line. Opacity 0→1, `filter: blur(10px)→0` and `translateY(20%)→0`, each as a separate Web Animation (script, not CSS). 1000ms, `cubic-bezier(.25,.1,.25,1)` (plain "ease"), `fill: both`.
- **Order:** desktop lines start at 400ms and 500ms. The mobile version is four phrase chunks at 400, 433, 466 and 499ms (33ms apart).
- **Structure:** the line breaks are hard-coded, as separate desktop (`hide-mobile`) and mobile (`show-mobile`) spans. A visually hidden plain copy carries the text. No masks (`overflow: visible`).
- **What stays still:** the nav, and the sub-line and product shot after their own fades. Nothing replays on scroll.

**Anthropic** (Anthropic Sans 700, 60.9/67px)
- **What moves:** each word (`span.animate-word`, inline-block). A CSS transition of opacity 0→1 and `translateY(48px)→0`, 800ms, `cubic-bezier(.16,1,.3,1)` (the same curve as our `--ease-out-expo`).
- **Order:** word delays are uneven, 243–334ms, so words land out of order. In the frames, the words already show at various strengths at 0ms and settle by about 1600ms. The linked words ("research", "products") keep their underline.
- **Structure:** a `u-sr-only` plain copy carries the text. No masks.
- **What stays still:** the right-hand paragraph is static from the first paint. The media card below fills in later (2500ms frame).

**Exo Ape** (Lausanne 300, 250px, −0.046em)
- **What moves:** each line of "Digital / Design / Experience" rises inside its own mask.
  - Structure: `h1 > .title-mask` (`overflow: hidden`) `> .title-line`.
  - The lines start about 2.95s after load, once the preloader ends, from 183px down (about 80% of the 230px mask).
  - Each line takes about 0.95–1.05s, with a strong ease-out (about two thirds of the distance in the first third of the time). The lines start about 60ms apart, and all have settled by about 4.1s.
- **Masks sized to the glyphs, not the line-height:** the line box is 183px (lh 0.73), but the mask is 230px tall and ends at the bottom of the descenders. Only the empty ascent above the capitals is cut. The "g" in "Digital" is whole.
- **What stays still:** the lede above the headline is visible from the start. Skip the preloader and the panel wipe (board frames).

**SpaceX** (probe only for the page; countdown measured in Chrome)
- Headline: D-DIN-Bold 60/54px, caps.
- The countdown "T-1D 18:09:03" is Roboto Mono 16px/22.4, weight 400, caps, colour `rgb(240,240,250)`. It sits directly on top of the headline (0px gap), left-aligned with it (x = 60). Each digit is a rolling 0–9 column.
- It is the precedent for one line of live-looking mono data, but ours is a static fact that types on once. It does not roll.

**Avoid** (board only): `avoid-lusion-mid.jpg` has a 000–100 counter preloader and words tilted 15°.

**Take:**
- Exo Ape's per-line masks and strong ease-out (≈1s, ≈60ms stagger). The prompt's 1.05s `expo.out` and 0.08s stagger sit right on it.
- Anthropic's curve, which is already ours.
- The pattern every reference shares: a plain screen-reader copy plus an `aria-hidden` animated copy.
- SpaceX's single mono data line.

**Skip:** preloaders, panel wipes, blur (Linear's is calm, but the prompt specifies masks), out-of-order words, 15° tilts, rolling digits, 250px type.

**Differences from the prompt (the prompt wins):**
- SpaceX places its data line above the headline. The prompt puts ours bottom-right at 900px and up (v1's caption spot) and under the CTAs below 900px. Keep the prompt.
- Linear starts at 400ms and Exo Ape at about 2.95s. The prompt starts the lines at 0.10s with no preloader. Keep the prompt.

**What should change in the build:**
- **Pad the masks.** `type-hero` has line-height 0.94, so a GSAP `mask: "lines"` wrapper is only 0.94em tall. The descenders of "y" and "g" in "your organization." would stay cut off after the rise.
  - Fix, as Exo Ape does: extend each mask below the line box. For example, give the mask `padding-bottom` of about 0.15em with an equal negative `margin-bottom`, so the layout does not move.
  - Check it by comparing a settled, split headline with the unsplit one, pixel for pixel, at 390, 768 and 1440.

## Step 04 checks (26 Sep 2026)
- **Sequence**, sampled every frame from the moment the reveal elements show (about 250–350ms after navigation on dev). The same at 390, 768 and 1440:
  - eyebrow 0.01→0.60s
  - lines start at 0.10, 0.18 and 0.27s (0.08s stagger). They reach exactly 0 at about 0.9–1.15s; the rise is 1.05s `expo.out`.
  - lede 0.56→1.32s; CTAs 0.77→1.53s
  - data line typed 0.96→2.04s (46 characters)
  - **Settled 2.04s after the reveal**, about 2.3–2.4s after navigation.
- **Lines and masks:** 3 lines ("The future moves / faster than / your organization."), with no re-wrap during the rise. With parallax off, the settled split headline matches the unsplit (reduced-motion) one pixel for pixel: **0.000% difference** at every width. The padded masks cut no descenders, and the lede sits at the same place in both modes.
- **Layout shift:** 0.0000 at 1440 and 390, on a cold load of the production build.
- **LCP (accepted by Mehdi, 26 Sep):** in Chrome, lines first painted below their masks never count as LCP when they slide in. So the lede is now the LCP element.
  - Production, Playwright (no throttling): the lede at 0.64–0.69s.
  - Lighthouse desktop: score 100, LCP 0.7s (lede), CLS 0.
  - Lighthouse mobile (simulated slow phone): score 87, LCP 3.6s (lede).
  - The step 03 build, measured the same way: score 92, LCP 3.2s, and the element was the headline. So the simulated mobile target of 2.5s was already missed before this step.
  - Flagged for the step 11 performance pass.
- **Reduced motion:** at 150ms every element is visible, with nothing split and no typing.
- **JavaScript disabled:** everything shows, because the `js` class never lands.
- **Script failure** (`/_next/static/chunks/*.js` aborted): hidden at 1.0s, and the failsafe shows it all by 2.7s.
- **Screen readers:** one heading ("The future moves faster than your organization.") and one data-line paragraph at each width.
- **Parallax:** after 300px of scroll the h1 is at −10.2px and the globe at −21px, while the lines stay at 0.
- **Tooling note:** the `_self` frame capture showed a Next.js "1 Issue" badge. It is a hydration mismatch on the Contact inputs' `caret-color`, which Playwright's screenshots inject (`caret: "hide"`) when they run before hydration. With `caret: "initial"` there is no error in 3 of 3 runs. It comes from the tool, not the site.

## Frame comparison (`npm run refs -- _self … --frames --mobile`, then deleted)
- **Ours:** 0ms blank. 250ms the eyebrow fading in. 600ms the lines mid-rise through their masks. 1000ms the headline settled and the lede in. 1600ms the CTAs in and the data line typing. 2500ms complete.
- **Linear:** the same window shows nothing (its lines start at about 2.9s after load, blur-to-sharp, no masks).
- **Exo Ape:** the same window is still its preloader (its lines rise about 2.95→4.1s).
- Ours is fully settled before either reference starts. It uses Exo Ape's mask technique with a similar stagger (80ms against their about 60ms) and no preloader.
