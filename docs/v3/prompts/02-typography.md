# Step 02 · Type system: Archivo + Chivo Mono (decided: board option A)

Read `docs/v3/BRIEF.md` first, especially "Type system". This step replaces Space Grotesk, Inter and JetBrains Mono with Archivo (display and text) and Chivo Mono (labels and data). It moves every heading, body and label style onto a small set of shared `type-*` utilities, so later steps can't drift. Layout and colours stay as they are; only type changes.

## 1. Study the references

Look at the board captures in `docs/v3/references/type/board/` first. INDEX.md lists the measured values: Hadrian, Varda, SpaceX, Replicate, Oxide. Then go through each site live in Chrome, as the brief describes: measure the computed type of the headline, section headings, body text and mono labels with the JavaScript tool. Save a record with the commands below; their `--mobile` captures show how each headline wraps at 390px.

```bash
npm run refs -- type https://www.varda.com --probe --mobile
npm run refs -- type https://www.hadrian.co --probe --mobile
npm run refs -- type https://oxide.computer --probe --mobile
npm run refs -- type https://www.spacex.com --probe --mobile
npm run refs -- type https://replicate.com --probe --mobile
```

In `docs/v3/references/type/NOTES.md`, record for each site:

- the display size, weight, width, tracking and leading you measured, checked against `manifest.json`
- how its mono layer carries real data (clocks, coordinates, countdowns, figure labels)
- how the headline wraps at 390px

What to take: weight of 700 or more in sentence case, tight leading, hairlines, and one mono data line. What to skip: all-capitals headlines, gradients, photography.

## 2. Load the fonts (`src/app/layout.tsx`)

- Remove the `Inter`, `Space_Grotesk` and `JetBrains_Mono` imports.
- Add `Archivo` from `next/font/google` as a variable font with the width axis: `Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" })`. Don't pass `weight`; the variable range is 100–900.
- Add `Chivo_Mono({ subsets: ["latin"], variable: "--font-chivo-mono", display: "swap" })`.
- Put both variables on `<html>`, replacing the old ones.
- In `src/app/globals.css`, inside `@theme inline`:
  - `--font-sans: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;`
  - `--font-display: var(--font-archivo), ui-sans-serif, system-ui, sans-serif;`
  - `--font-mono: var(--font-chivo-mono), ui-monospace, "SFMono-Regular", monospace;`

**Check the width axis works.** In Chrome at `localhost:3000`, use the JavaScript tool to render a test string at `font-stretch: 112%` and at `100%`, and compare their measured widths (`getBoundingClientRect`). If they're equal, `next/font`'s `@font-face` has no `font-stretch` range. In that case, set width with `font-variation-settings: "wdth" 112` inside the utilities below instead. Note which approach works in NOTES.md.

## 3. The type utilities (`src/app/globals.css`)

Define these with Tailwind v4 `@utility`:

| Utility | Family | Weight | Width | Size | Leading | Tracking | Extra |
|---|---|---|---|---|---|---|---|
| `type-hero` | display | 780 | 112% | `clamp(3rem, 6.4vw, 5.75rem)` | 0.94 | −0.035em | `text-wrap: balance` |
| `type-h2` | display | 740 | 110% | `clamp(2.1rem, 4.2vw, 3.5rem)` | 1.0 | −0.03em | `text-wrap: balance` |
| `type-h3` | display | 700 | 104% | `clamp(1.3rem, 1.9vw, 1.6rem)` | 1.15 | −0.015em | |
| `type-lead` | sans | 400 | 100% | `1.1875rem` | 1.6 | 0 | |
| `type-body` | sans | 400 | 100% | `1.0625rem` | 1.6 | 0 | |
| `type-small` | sans | 400 | 100% | `0.9375rem` | 1.55 | 0 | |
| `type-label` | mono | 500 | | `11px` | 1.8 | 0.1em | uppercase |
| `type-data` | mono | 400 | | `13px` | 1.6 | 0.02em | `font-variant-numeric: tabular-nums` |

- **On dark sections:** add `[data-tone="dark"] :is(.type-hero) { font-weight: 760 }` and `[data-tone="dark"] :is(.type-h2) { font-weight: 720 }`, because light text on navy reads heavier. Do the same for `type-h3` (680).
- **Body default:** set `body` to the `type-body` values, so plain paragraphs are right without classes.

## 4. Apply the utilities everywhere

Go through every section, the Navbar, the Footer and the UI components. Replace ad-hoc type classes with the utilities:

- `font-display text-[clamp(...)] font-semibold leading-[...] tracking-[...]` becomes `type-h2` (or `type-hero` / `type-h3`).
- Mono eyebrows (`font-mono text-[11px] tracking-[0.22em] uppercase`) become `type-label`. `MonoLabel` should render `type-label`.
- Numbers, coordinates and statuses become `type-data`.
- The navbar wordmark keeps its own treatment: Archivo 700 at 112% width, +0.02em, caps.

Colour, spacing and layout classes stay. Afterwards, grep for `font-semibold`, `tracking-[` and `text-[clamp` in `src/components`. What's left should be justified in NOTES.md or removed.

## 5. Update the rules

In `CLAUDE.md` "Hard rules", replace the type line with: `Type: Archivo (display 104–112% width, text 100%) + Chivo Mono (labels, data). Use the type-* utilities; no ad-hoc font sizes, weights or tracking.` Mirror this in `REDESIGN_PLAN.md` §1.v3.

## 6. Check, commit, report

Run the brief's check list (lint, build, verify-shots into `docs/v3/after/02-type`). Then look specifically at:

- **The hero headline** at 390, 768 and 1440. It must break into two or three lines, with no widow on its own line.
- **Section headings** on dark and light sections, side by side with the Varda and Hadrian captures.
- **Mono labels:** consistent size and tracking everywhere.
- **Layout shift from font loading.** Measure it on a cold load: a fresh headless Playwright page has an empty cache. Sum the buffered `layout-shift` entries from a `PerformanceObserver` (`{ type: "layout-shift", buffered: true }`). The total should stay under 0.05, and the hero shouldn't move as the fonts swap in; `next/font`'s fallback metrics should see to that.
- **Contrast:** body text on white and `n300` text on Windsor still pass AA.

Commit: `v3(02): type system, Archivo + Chivo Mono with shared type utilities`. In the report, include before/after crops of the hero and one section heading.

## Acceptance

- No Space Grotesk, Inter or JetBrains Mono anywhere, including the bundle and CSS.
- Every heading, body and label uses a `type-*` utility, and width is confirmed working (font-stretch or `wdth`).
- The hero reads as bold and technical: 780 weight, 112% width, tight leading. Dark sections use the lighter weights.
- There is no layout shift from font loading, and lint, build and screenshots pass.
