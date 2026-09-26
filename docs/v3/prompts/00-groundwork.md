# Step 00 · Groundwork (nothing on the site changes)

Read `docs/v3/BRIEF.md` first. This step prepares `redesign/v1` for the v3 work: it parks leftover files, sets up the reference tooling, records baseline screenshots, updates the rules and maps the codebase. When you're done, the site must look exactly as it does now.

## 1. Park the leftovers from the rejected taste-pass experiment

The working tree has five uncommitted files that came from `redesign/taste-pass`:

- `src/components/sections/Hero.tsx` (modified)
- `src/components/sections/Philosophy.tsx` (modified)
- `src/components/sections/Process.tsx` (modified)
- `src/components/ui/LedgerEntry.tsx` (new)
- `src/components/ui/WorldCanvas.tsx` (modified)

Keep them, but off v1. Commit only these paths, so the new untracked `docs/v3/` and `scripts/ref-shots.mjs` stay on v1:

```bash
git status --short          # expect exactly the five files above, plus untracked docs/v3/ and scripts/ref-shots.mjs
git switch -c wip/taste-leftovers
git add -- src/components/sections/Hero.tsx src/components/sections/Philosophy.tsx src/components/sections/Process.tsx src/components/ui/LedgerEntry.tsx src/components/ui/WorldCanvas.tsx
git commit -m "wip: park taste-pass leftovers (not part of v3)" -- src/components/sections/Hero.tsx src/components/sections/Philosophy.tsx src/components/sections/Process.tsx src/components/ui/LedgerEntry.tsx src/components/ui/WorldCanvas.tsx
git switch redesign/v1
git status --short          # now only docs/v3/ and scripts/ref-shots.mjs, untracked
git tag v1-before-v3
```

Also remove two harmless leftovers from an earlier inspection:

```bash
rm -f .git/index.lock.stale-from-claude-2026-09-25
rm -rf .git/lost-found
```

Stop and report instead of improvising if `git status` shows anything else, if any command fails, or if the branches differ from this description. Don't touch `master`, `redesign/taste-pass` or the existing stash, and don't push.

## 2. Reference tooling

1. `scripts/ref-shots.mjs` is already in place. Read its header comment for the flags.
2. Add two npm scripts to `package.json`:
   - `"refs": "node scripts/ref-shots.mjs"`
   - `"shots": "node scripts/verify-shots.mjs"`
3. Make sure Playwright's Chromium is installed: run `npx playwright install chromium` if it isn't already.
4. Smoke-test the tool:
   - Run `npm run refs -- _smoke https://linear.app --frames --probe`.
   - Open two of the captures in `docs/v3/references/_smoke/live/linear.app/` to confirm they're real renders, not blank pages or bot walls.
   - Check that `manifest.json` lists the loaded fonts.
   - Delete the `_smoke` folder.
5. Check that `git check-ignore -v docs/v3/references/nav/board/linear-top.jpg` reports it as ignored. Reference captures are third-party pages kept for local study only, and `docs/v3/.gitignore` keeps them out of git.

## 3. Baseline screenshots of today's v1

With `npm run dev` running, run `node scripts/verify-shots.mjs --full --out=docs/v3/before`. Every later step compares against these. Confirm there are no console errors.

## 4. Update the rules

**`CLAUDE.md`:**
- Under "Read before designing anything", add a first item: `docs/v3/BRIEF.md (v3 rules and page structure; wins where it conflicts with the lines below)`.
- Under "Hard rules (short form)":
  - Replace the first line with `Flat fields only: no gradients, glows, grain, tilt, magnetic effects or custom cursors. Glass on the navbar only (see BRIEF).`
  - Replace the type line with `Type: being replaced in v3 step 02; until then keep the current fonts.`
  - Add `Numbers only as data: no ordinal section indices, numbered rows or numbered menus.`
  - Add `WebGL only for the hero globe (cobe).`
- Keep everything else.

**`REDESIGN_PLAN.md`:**
- Directly after §1, add a short section, `## 1.v3 · Amendments (September 2026)`.
- In it, point to `docs/v3/BRIEF.md` and list the amended rules verbatim from the brief's "Amended in v3" list.
- Don't rewrite anything else in the plan.

## 5. Inventory

Write `docs/v3/INVENTORY.md` covering:

- **Each current section:** its file, its id, the components it uses, every visible string (verbatim), and the v3 section it feeds according to the brief's table (or "cut").
- **Every place ordinal numbering appears.** At least: `MonoLabel`'s `index` prop and its call sites, the index column in `IndexRow`, `SectionLabel`, and the `String(i + 1).padStart(2, "0")` in the Navbar's mobile menu. Add anything else you find.
- **Reusable building blocks** (`MonoLabel`, `Reveal`, `SplitText`, `GenImage`, `Button`, `IndexRow`, `WorldCanvas`, `RingField`, `DiagonalPlane`), one line each on what they do.
- **The motion setup:**
  - where GSAP, ScrollTrigger and Lenis are initialised
  - the parallax helper and its `data-speed` values
  - how reduced motion is handled

## 6. Check, commit, report

- `npm run lint` and `npm run build` pass. Nothing visual changed.
- Commit on `redesign/v1`: `v3(00): groundwork, brief, prompts, reference tooling, rule amendments, inventory`.
- Report back with:
  - the git state (branches, the tag)
  - the smoke-test result
  - anything that surprised you
  - questions for Mehdi

## Acceptance

- The `redesign/v1` working tree is clean apart from ignored files; the leftovers sit on `wip/taste-leftovers`; the tag `v1-before-v3` exists.
- `npm run refs` works, and the baseline screenshots exist in `docs/v3/before/`.
- The `CLAUDE.md` and `REDESIGN_PLAN.md` amendments are in place, and `docs/v3/INVENTORY.md` is written.
- The site renders exactly as before.
