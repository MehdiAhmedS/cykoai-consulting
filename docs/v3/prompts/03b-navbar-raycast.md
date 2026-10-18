# Step 03b · Navbar: Raycast's glass (decided 18 October)

Read `docs/v3/BRIEF.md` first. Mehdi wants the navbar restyled after Raycast's (raycast.com).

**What stays:**

- a fixed, floating bar with the logo, the CYKOAI wordmark and its tag, the four links and the CTA;
- the burger and the full-screen overlay below 900px;
- the tone detection and the active link.

**What changes:**

- the surface: a dark Windsor glass on every section, with a hairline and an inner top highlight;
- the size, aligned with the content column;
- the link type;
- the CTA, which becomes a light "key".

The silver glass and the 20px corners go.

## 1. Reference study

In Chrome, study raycast.com and save the captures in `docs/v3/references/nav/raycast/`. Add a "Step 03b" section to `docs/v3/references/nav/NOTES.md`.

- **At 1440px, capture:**
  - the bar at rest;
  - the bar after scrolling over different content;
  - a link on hover, and on keyboard focus;
  - the Download button at rest, on hover and while pressed.
- **At 390px:** capture its phone bar and its open menu.
- **Check the measured values below** against what you find. If the site has changed, record the difference and ask Mehdi before building.

These values were measured on raycast.com at 1440 × 726 on 18 October 2026:

| Part | Value |
|---|---|
| Bar position | fixed; the wrapper is full width with 16px padding at the top and sides, so the bar floats 16px from the top |
| Bar size | 1204px wide (the content width), 76px tall, padding 16px 32px, 16px corners |
| Fill | `linear-gradient(137deg, rgba(17,18,20,0.75) 4.87%, rgba(12,13,15,0.9) 75.88%)` |
| Blur | `backdrop-filter: blur(5px)` |
| Edge | `1px solid rgba(255,255,255,0.06)` |
| Top highlight | `box-shadow: inset 0 1px 1px rgba(255,255,255,0.15)` |
| Links | 14px, weight 500, letter-spacing 0.2px, colour `#9C9C9D`, padding 12px 8px, 6px corners; white on hover, `rgba(255,255,255,0.05)` background on focus |
| "Log in" | a plain link, the same as the others |
| Download (CTA) | 36px tall, padding 8px 12px, 8px corners, background `#E6E6E6`, text `#2F3031` at 14px/500 |
| CTA shadows | `0 0 0 2px rgba(0,0,0,0.5), 0 0 14px rgba(255,255,255,0.19), inset 0 -1px 0.4px rgba(0,0,0,0.2), inset 0 1px 0.4px #fff` |
| On scroll | nothing changes: no hide, no shrink |

Then plan from what you found.

## 2. The bar (from 900px)

- **Position:**
  - the bar floats 16px from the top;
  - its width is `min(1208px, 100% − 32px)`, centred, so its edges line up with the content column (the 1320px container less its 56px padding);
  - it's 76px tall, with padding `0 16px 0 32px`;
  - 16px corners.
- **The surface over dark sections** (`data-nav-tone="dark"`):
  - fill: `linear-gradient(137deg, rgba(11,21,39,0.72) 5%, rgba(7,14,27,0.9) 76%)`. That's Windsor, then a darker Windsor, following Raycast's angle and stops;
  - blur: `blur(5px)`;
  - edge: `1px solid rgba(255,255,255,0.06)`;
  - top highlight: `inset 0 1px 1px rgba(255,255,255,0.15)`.
- **Over light sections** (`data-nav-tone="light"`) it's the same dark bar with:
  - a denser fill, `rgba(11,21,39,0.88)` → `rgba(7,14,27,0.96)`;
  - `blur(16px)`, so text passing behind doesn't show through.

  Raycast's site is dark everywhere; ours isn't. At 0.72 over white, the n300 links would drop to about 3.8:1, so the light fill must keep them at 4.5:1 or above.
- **The tone switch:**
  - only the fill and the blur change; the text stays light on both;
  - each fill sits on its own pseudo-element of the bar, and the two cross-fade by opacity over 200ms, because gradients can't transition;
  - `backdrop-filter` itself never transitions;
  - an open Offers row still counts as dark.
- **Fallback:** with `@supports not (backdrop-filter: blur(1px))`, a solid `rgba(11,21,39,0.96)`.
- **No drop shadow under the bar,** no `saturate()` and no `mix-blend-mode`.

## 3. Its contents

- **Wordmark:**
  - the LogoMark and CYKOAI in white, unchanged in size;
  - the "CONSULTING" tag in `type-label`, n300.
- **Links:**
  - Archivo at 14px, weight 500, letter-spacing 0.2px;
  - colour n300, padding 12px 8px, 6px corners;
  - white on hover, over 150ms;
  - keyboard focus gets a `rgba(255,255,255,0.05)` background plus the site's focus ring;
  - the gap between links is 8px. Raycast spaces its links with their own padding, not with wide gaps.
- **The active link** (the section under the bar): white, with the existing 1px Driftwood underline at a 6px offset.
- **The CTA ("Talk to us")** is a light key, as Raycast's Download is:
  - 36px tall, padding 8px 14px, 8px corners;
  - background `#E9EBEF`, text Windsor at 14px/500;
  - shadows: `0 0 0 2px rgba(0,0,0,0.5), 0 0 14px rgba(255,255,255,0.19), inset 0 -1px 0.4px rgba(0,0,0,0.2), inset 0 1px 0.4px #fff`;
  - hover: background white, over 150ms;
  - pressed: `translateY(1px)`, and the outer glow drops to 0.1;
  - leave 12px between the last link and the CTA.

## 4. Below 900px

- **The bar:**
  - 8px from the top and sides, 56px tall, 14px corners, padding `0 8px 0 16px`;
  - the same surface and the same tone rules.
- **The burger:** its two lines are white.
- **The overlay:** keep the full-screen Windsor overlay and its focus trap, Escape handling and paused Lenis. Start it 8px below the bar's new bottom edge, worked out from the bar's size rather than the old `top-[68px]`.
- **The overlay's CTA** uses the light key style from part 3, full width.

## 5. What stays as it is

- the IntersectionObserver that reads the tone and the active section;
- the links and their order, and the CTA's target;
- the overlay staying a sibling of the bar, because `backdrop-filter` would trap a fixed child;
- reduced motion: colour fades only, nothing moves.

## 6. Brief

Update `docs/v3/BRIEF.md` to match:

- **The radii line under "Kept from §1":** the navbar's exceptions become 16px corners (14px below 900px) and an 8px CTA.
- **"Glass on the navbar only":**
  - Raycast's recipe: a Windsor gradient fill from 72% to 90% opaque (88% to 96% over light sections);
  - blur 5px over dark sections and 16px over light ones;
  - a white/6 hairline and a 1px inner top highlight at white/15;
  - the CTA may carry its key shadows;
  - still no `saturate()`, no drop shadow under the bar and no `mix-blend-mode`.
- **The Decisions table's Navbar row:** add "Restyled on 18 October after Raycast's glass: dark on every section, a light key CTA (03b)", and add 03b to its steps.
- **The later navbar bullet** (the one with the silver glass): replace it with the values above.

## 7. Check, commit, report

Run the brief's check list. Take verify-shots into `docs/v3/after/03b-navbar` with:

- `--section=#top`;
- `#offers`, with a row open and with all rows closed;
- `#projects`, `#standards` and `#contact`;

all at 1440px and 390px. Also:

- **Contrast:** compute the links' and the tag's contrast against the bar composited over white, at both ends of the light-section gradient. Record the worst case in NOTES.md; it must be 4.5:1 or more.
- **In Chrome:**
  - hover a link and the CTA, and press the CTA;
  - Tab through the bar and check that focus is visible on every item;
  - scroll through every section and check that the bar never flickers when the tone switches.
- **Below 900px:** open and close the overlay, check that Escape works, and check that focus returns to the burger.

Commit: `v3(03b): navbar restyled after Raycast's glass`.

## Acceptance

- The bar is dark Windsor glass on every section, with the hairline and the top highlight. It's 16px from the top and lines up with the content column.
- Links are 14px/500 in n300, white on hover. The active section's link is white with the Driftwood underline.
- The CTA is the light key, with its hover and pressed states.
- The links stay at 4.5:1 or more over light sections, and the bar never flickers at a tone change.
- Below 900px, the bar and overlay work as before at the new size.
- The brief matches the new values.
