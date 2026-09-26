# Step 03 · Navbar: inset glass, switched by section (decided: board option A)

Read `docs/v3/BRIEF.md` first (v3 rules: glass on the navbar only; the tone map). The v1 navbar is a solid 64px Windsor band. It becomes a floating, inset glass bar:

- **Silhouette:** Palantir's inset bar.
- **Over dark sections:** Linear's measured glass values.
- **Over light sections:** Harvey's measured glass values.

It switches from the `data-tone` of whichever section sits under it. Nothing else on the page changes.

## 1. Study the references

Board captures are in `docs/v3/references/nav/board/`. INDEX.md has the measured values. Then go through each site live in Chrome, as the brief describes. Scroll each from the top through two or three sections and watch the header: whether it changes as you scroll, what changes (tint, blur, border, height) and how fast. Measure its computed values at the top of the page and again after scrolling. Save a record with:

```bash
npm run refs -- nav https://linear.app --probe --flow=3
npm run refs -- nav https://www.harvey.ai --probe --flow=4
npm run refs -- nav https://www.palantir.com --probe --flow=4 --mobile
```

In `docs/v3/references/nav/NOTES.md`, for each site record: height, insets, radius, background, backdrop-filter, border, and how the bar behaves over dark and light content (from the flow captures).

- **Palantir:** its light-over-white look comes from `mix-blend-mode: difference`. Note it and don't copy it.
- **Avoid** `avoid-raycast.jpg` (gradient tint, glow, inset highlight) and `avoid-clerk.jpg` (stacked progressive blur).

## 2. The spec

**Geometry**

| Viewport | Top inset | Side insets | Height | Radius | Width | Inner padding |
|---|---|---|---|---|---|---|
| ≥900px | 12px | 12px | 56px | 6px | full width, contents aligned to the 1320px container | 20px |
| <900px | 8px | 8px | 52px | 6px | full width | 16px |

The header is `position: fixed` with `z-index: 50`. There's no spacer: the hero starts at the top of the page and pads its own content below the bar.

**Dark state** (section under the bar has `data-tone="dark"`), after Linear:

- `background: rgba(11, 21, 39, 0.80)`
- `backdrop-filter: blur(20px)`, with `-webkit-backdrop-filter` as well
- `border: 1px solid rgba(255, 255, 255, 0.08)`
- text white, links `n300` turning white on hover, CTA outlined white

**Light state** (`data-tone="light"`), after Harvey:

- `background: rgba(255, 255, 255, 0.72)`
- `backdrop-filter: blur(16px)`
- `border: 1px solid rgba(11, 21, 39, 0.08)`
- text Windsor, links `n500` turning Windsor on hover, CTA outlined Windsor

**Never:** inset highlights, `saturate()`, shadows, gradients or `mix-blend-mode`. Don't animate `backdrop-filter`. Only `background-color`, `border-color` and `color` transition, over 200ms `ease-out-expo`.

**Fallback:** `@supports not (backdrop-filter: blur(1px))`: dark `rgba(11,21,39,.96)`, light `rgba(255,255,255,.96)`.

**Switching:** watch every `section[data-tone]` (and the footer) with one `IntersectionObserver`, using a root margin so a section counts as "under the bar" when it crosses the bar's vertical centre (about 40px from the top of the viewport). Set `data-nav-tone` on the header; CSS handles the rest. No scroll listeners.

**Contents:**

- Left: `LogoMark` and the CYKOAI wordmark (as styled in step 02).
- Centre-right: links from `site.ts` `nav`: Offers, Projects, Engagement, Standards.
- Right: the "Talk to us" CTA → `#contact`.
- **Active section:** the link for the section in view gets full-strength text colour and a 1px Driftwood underline. Use the same observer. Subtle, no motion.

**Mobile (<900px):**

- The bar shows the logo and a menu button.
- The menu opens v1's full-screen Windsor overlay: links stacked in `type-h2`, no numbers, the CTA at the bottom.
- Keep v1's focus trap, Escape to close, and Lenis paused while it's open.
- The overlay starts below the bar (top 68px).

**Anchors:**

- In `SmoothScroll.tsx`, change the Lenis anchor offset from `-64` to `-80`.
- Add `scroll-margin-top: 80px` to every `section[id]`, so reduced-motion users (native jumps, no Lenis) also land below the bar.

## 3. Check, commit, report

Run the brief's check list (lint, build, verify-shots into `docs/v3/after/03-nav`). Then verify, at 1440, 768 and 390:

- **Tone switching** works over the hero, Offers, Projects, Engagement, Standards, The name, Contact and the footer. Screenshot the bar over one dark and one light section at each width.
- **Contrast:** link text contrast is at least 4.5:1 in both states, measured against the bar over the busiest content.
- **Blur** is visible over text scrolling beneath the bar.
- **Anchors** land with the heading clear of the bar.
- **Keyboard:** Tab reaches every link, focus rings are visible, and the mobile menu can be opened, navigated and closed with the keyboard.
- **Fallback:** with `backdrop-filter` disabled in devtools, the solid fallback shows.
- **Reduced motion:** no transitions.

Commit: `v3(03): inset glass navbar, tone-switched`.

## Acceptance

- The bar matches the spec at both breakpoints, with the correct glass values per tone and no forbidden effects.
- It switches cleanly between every section and the footer, and the active-section indicator works.
- Anchor offsets are fixed for both Lenis and native jumps, and the mobile menu has no numbers and keeps its accessibility behaviour.
