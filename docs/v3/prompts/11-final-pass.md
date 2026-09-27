# Step 11 · Final pass: consistency, quality, ready to merge

Read `docs/v3/BRIEF.md` first. No new design in this step. It makes the seven sections read as one page, removes what's dead, proves quality, and prepares the merge into `master`. Stop and report rather than inventing content if anything needed for launch is still unconfirmed.

## 1. Consistency

- **Type:** every heading, body and label uses a `type-*` utility. Grep `src/components` for `font-semibold`, `tracking-[`, `text-[clamp` and `font-display` outside the utilities, then fix or justify each hit.
- **Spacing:** all seven sections share one vertical rhythm. Choose v1's section padding token and apply it everywhere, and use one container (1320px, with v1's side gutters).
- **Tone map:** each section's background and `data-tone` match the brief. The navbar switches correctly over every section and the footer at 390, 768 and 1440. Screenshot the bar over every section at 1440.
- **Motion budget:**
  - at most 2 pins on the page (expected: 0)
  - at most 3 parallax speeds in any viewport
  - transforms and opacity only
  - every animation has a reduced-motion state

  Run the whole page with `prefers-reduced-motion: reduce`.
- **One home per claim:** grep the rendered copy for the seven claims and the banned words from the brief, and record the results in `docs/v3/FINAL.md`.
- **Numbers:** confirm no ordinal numbering anywhere, including the menu, rows and labels. Numbers should appear only as data.

## 2. Dead code

Remove components and assets nothing imports any more. Likely candidates: `WhatWeDo`, `Services`, `Philosophy`, `EngagementNote`, `StatStrip`, `SectionLabel`, `DiagonalPlane`, `LedgerEntry` (if it came back), and unused `public/assets` files. Keep `public/assets/projects/`: its captures let Mehdi move entries onto the Projects stage without capturing them again. Check every removal with a build. `WorldCanvas`, cobe and `public/assets/land-points.json` should already be gone after step 05b; remove them if not.

## 3. Content gate

List every `status: "draft"` and every "TBC" in `src/content/site.ts` in `docs/v3/FINAL.md`, grouped by section, with a proposed default for each (for example "hide", or "use v1's copy").

- The branch can't merge while any draft or TBC would render in production.
- Unconfirmed items must be hidden in production (already the rule), and any section left empty because of that must still read well.
- Screenshot the production build (served on port 3100, as the brief's check list describes) to prove it.

Also update `layout.tsx` metadata. The title and description still describe "enterprise AI … digital transformation". Write a draft title and description that match the real offers, and mark them for Mehdi's approval in FINAL.md. Don't ship them silently.

## 4. Quality checks, on a production build

- **Lighthouse (mobile and desktop):**
  - LCP under 2.5s, and it should be the hero headline
  - CLS under 0.05
  - TBT under 200ms
  - accessibility 95 or higher

  Record the scores in FINAL.md.
- **Bundle:** three.js is one chunk, shared by the globe and the Offers pieces; it loads after idle on desktop only, and phones never request it; fonts are subset to Latin; there are no leftover dependencies. Remove anything unused from `package.json`.
- **Accessibility:**
  - landmarks, and one `h1` with h2 → h3 order
  - focus visible everywhere
  - every expandable row has `aria-expanded` and `aria-controls` and works from the keyboard
  - the mobile menu traps focus and closes on Escape
  - contrast passes in both navbar states and on every section
- **Screenshots:** `node scripts/verify-shots.mjs --full --out=docs/v3/after/11-final`, then compare with `docs/v3/before`. Put a before/after pair per section in FINAL.md.
- **Contact:** the form still submits (manual test), and `src/app/api/contact` is untouched (check with `git diff master -- src/app/api`).

## 5. Wrap up

- In `REDESIGN_PLAN.md`, set the status to "v3 complete on redesign/v1, pending merge", and fold the brief's v3 rules into §1 so the constitution reads as one document.
- Write `docs/v3/RELEASE.md` covering:
  - what changed, section by section
  - the decisions it follows
  - known gaps (unconfirmed content)
  - how to merge: open a pull request from `redesign/v1` to `master` and review it. Don't merge or push without Mehdi's go-ahead.
- Commit: `v3(11): final pass, consistency, dead code, content gate, quality report`.

## Acceptance

- `docs/v3/FINAL.md` records the consistency results, the grep results, Lighthouse scores and before/after pairs, with every open draft or TBC listed and hidden in production.
- Dead code is removed, the build is clean, and the bundle is as specified.
- The release note is written, and nothing is merged or pushed without approval.
