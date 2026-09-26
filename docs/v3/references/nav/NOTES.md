# Nav: glass bar, switched by section

**Build plan (approved 26 Sep 2026).**
- **Bar:** a fixed header (z-50, inset 12px at 900px and up, 8px below) holds the glass bar (56/52px, 6px radius). Its contents line up with the 1320px container.
- **Mobile overlay:** a sibling of the bar, not a child, because `backdrop-filter` would trap a fixed child. It starts at top 68px and carries `data-tone="dark"`.
- **Tone and active link:** one IntersectionObserver on `section[data-tone]` and the footer. Its 1px line at 40px from the top sets `data-nav-tone` on the header and `aria-current` on the active link.
- **Glass:** Linear's values over dark and Harvey's over light, flat, with a 96% solid fallback. Light-state links and the tag use `n700`, not `n500` (Mehdi, for contrast). Only colour, background and border transition, over 200ms.
- **Anchors:** the Lenis offset is −80, and every `section[id]` gets `scroll-margin-top: 80px`. The hero becomes `min-h-svh` and pads itself below the bar.

Studied 26 Sep 2026 live in Chrome at 1440 (system theme dark), measured with the JS tool at the top of each page and after scrolling, and saved with the prompt's `npm run refs -- nav …` commands into `live/`. Board captures in `board/` agree. The `--probe` values match the Chrome measurements, but they only read the outer `header`: Harvey and Palantir keep their glass on a child layer, measured here in Chrome.

**Linear** (dark site throughout)
- Fixed, full width, 72px plus a 1px bottom hairline (73px), radius 0, z-index 100.
- Glass: `backdrop-filter: blur(20px)` on the header. The tint is a `background-image`, not `background-color`: `linear-gradient(rgba(11,11,11,.8) → ≈#151515 at .76)`, so almost flat. Its variables are `--header-bg: #0b0b0bcc` and `--header-border: #ffffff14`. No shadow, no blend.
- Links: Inter 13px/400, `rgb(138,143,152)`. On hover they turn white with a faint `rgba(255,255,255,.08)` pill, over 100ms (`cubic-bezier(.25,.46,.45,.94)`).
- Behaviour: identical at the top and after 500 and 2000px. It never shrinks, hides or re-tints. Text passing under the 80% tint reads only as soft texture (flow-02).

**Harvey** (light site throughout)
- Fixed, full width, 106px: a 34px dark promo banner plus a 72px bar. Radius 0, z-index 100.
- Glass on a child layer: `oklch(0.985 0.001 104 / .72)` ≈ `rgba(250,250,249,.72)`, `blur(16px)`. A solid off-white layer and a 1px hairline sit in the DOM at opacity 0 (used when a menu opens). No border and no shadow in use.
- Links: 14px/500, `rgb(15,14,13)`. On hover the link keeps its colour and gets an underline at the bar's bottom edge, while its siblings fade to grey. Transitions are 300ms.
- Behaviour: `data-theme="white"` on the header stays the same over the whole homepage. The mechanism is the same idea as our `data-nav-tone`, but Harvey never switches it here.
- The headless flow shows its cookie banner (it appeared after the script's reject step). In Chrome none appeared.

**Palantir**
- The inset bar is a separate layer: 10px from each side, 16px from the top once its 53px banner scrolls away, 70px tall, radius 10px. It has `rgba(171,171,171,.1)`, `blur(10px)`, opacity .9 and a shadow of `0 2px 10px rgba(0,0,0,.1)`.
- The header is `position: sticky` with `mix-blend-mode: difference`. That is how its white logo reads dark over the light `#efefef` sections: the computed colour stays white. Noted, not copied.
- The buttons sit in their own sticky wrapper. `window.scrollTo` does not move the page; it scrolls through its own handler.
- With a 10% tint, large headline text is still legible through the bar and competes with the logo (flow-03).
- Mobile (390): no inset. The bar is a flat full-width strip under the banner, and menu, search and "Get Started" move to a bar at the bottom of the screen.

**Avoid** (board only): `avoid-raycast.jpg` has a gradient tint, an inset highlight and a glow. `avoid-clerk.jpg` has twelve stacked progressive-blur layers.

**Take:**
- Palantir's inset silhouette at our 12/8px insets and 6px radius, with no shadow.
- Linear's 80% tint and 20px blur, flat, with Windsor in the tint. Its static behaviour: the bar changes only by tone, never by scroll.
- Harvey's 72% tint and 16px blur for light sections, and its attribute-driven theme on the header.
- An underline as the active cue (Harvey), with no motion.

**Skip:** Linear's gradient tint, Palantir's shadow, blend mode and 10% tint, promo banners, the hover pill, and sibling dimming.

**What should change in the build:**
- **Light-state link colour.** On the 72% white bar, `n500` links fail 4.5:1 once dark headings scroll under the bar: 3.54:1 at 50% blurred coverage, 2.54:1 worst case. They fail on the 96% fallback too (4.39:1). `n700` (#3a4356) passes: 5.29:1 worst case, 9.15:1 on the fallback. Proposal: light links `n700`, turning Windsor on hover.
- **Dark state.** `n300` links on the 80% Windsor bar hold 5.00:1 even over pure white beneath. As specified, it passes.
- **No reference switches by section.** Our IntersectionObserver switch has no live model to copy. Harvey's `data-theme` on the header is the closest mechanism.
- **Transition speed.** The references use 100ms (Linear) and 300ms (Harvey). The spec's 200ms `ease-out-expo` sits between them. Keep it.

## Step 03 checks (26 Sep 2026)
- **Geometry:** fixed, z-index 50, no shadow, 6px radius.
  - 1440: 12px from the top and sides, 56px tall. The logo starts at 116px, the same as the hero headline.
  - 768 and 390: 8px insets, 52px tall, 16px inner padding.
- **Tone switching** at 1440, 768 and 390 is correct over the hero, Offers, Projects, Engagement, Standards, The name and Contact. The active link is underlined on Offers, Projects, Engagement and Standards.
  - The footer is shorter than the viewport at 1440×900, 768×1024 and 390×844, so it never reaches the bar line. Contact stays under the bar and the bar correctly stays light.
  - With a 500px-tall window the footer reaches the line and the bar turns dark.
- **Contrast:** measured on real pixels with the link text hidden, over every 40px of scroll.
  - Worst dark: 6.56:1 (links), 6.08:1 (tag at 390).
  - Worst light (`n700`): 8.64:1 (links), 5.80:1 (tag at 390).
- **Anchors:** Lenis 1.3.25 reads CSS `scroll-margin-top` itself, so the prompt's −80 offset plus the 80px margin landed sections at 160px. With Mehdi's OK the Lenis offset is now 0, and the margin is the one source. Every section lands at 80px, with Lenis and with native jumps (reduced motion). Headings sit at 220px or lower.
- **Keyboard:**
  - Tab reaches the logo, the 4 links and the CTA, each with the 2px Driftwood focus ring.
  - The mobile menu opens with Enter and starts at 68px. It carries `data-tone="dark"`, so its links use weight 720, and it has no numbers.
  - Tab cycles inside the menu. Escape closes it and returns focus to the menu button.
- **Fallback:** the build contains `@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px)))` with `#0b1527f5` and `#fffffff5` (96%).
  - In Chrome, with `backdrop-filter: none` and the 96% backgrounds, both tones read cleanly.
  - With the blur off at the normal 72% light tint, a heading beneath shows through behind the logo, but the links stay readable. Real browsers without blur get the 96% fallback instead.
- **Blur:** a heading passing under the bar becomes a soft smudge on light and a soft glow on dark.
- **No console errors.** Lint and build pass. Reduced motion cuts all transitions through the global rule.
