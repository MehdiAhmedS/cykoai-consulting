# v3 build: how to run the prompts

Twelve steps, one prompt each, one fresh Claude Code session per step, run in order. Every prompt starts from `docs/v3/BRIEF.md`, so each session has the same context without carrying the previous step's clutter. All ten design decisions were picked on the reference board on 26 September 2026 (all option A), so every prompt is ready.

## Before step 00 (once)

1. Open Terminal in the repo: `cd ~/Documents/Personal/cykoai-consulting`, and check that `git branch --show-current` prints `redesign/v1`.
2. Open a second terminal tab in the same folder and run `npm run dev`. Leave it running for the whole build: every step's screenshot check uses it. If it starts misbehaving after a step's production build, stop it with Ctrl+C and start it again.
3. In the first tab, start Claude Code with `claude`.
4. Choose the model with `/model`: Fable 5.1 if your plan lists it, otherwise Opus 5.5.
5. Set the effort with `/effort xhigh`.

## How to run a step

1. **Fresh context.** Type `/clear` (not needed for the first step of a new session), then `/effort` to check it still says xhigh.
2. **Plan mode.** Press Shift+Tab until the footer reads "plan mode on".
3. **Paste** this, changing the file name: `Read docs/v3/BRIEF.md and docs/v3/prompts/00-groundwork.md, then carry out the prompt exactly. Stop and ask if anything doesn't match what the prompt describes.`
4. **Check the plan** before approving it. It should:
   - cover every part of the prompt, starting with the reference captures;
   - touch only the files the prompt names;
   - end with lint, build, screenshots into `docs/v3/after/<step>/` and one commit;
   - include no push, no merge and nothing in `src/app/api/contact`.

   For step 00, also check that it moves only the five leftover files (`Hero.tsx`, `Philosophy.tsx`, `Process.tsx`, `LedgerEntry.tsx`, `WorldCanvas.tsx`) to `wip/taste-leftovers`. If the plan is off, say what to change before approving.
5. **Approve** with the option that accepts edits automatically. Commands still ask first: approve the `npm`, `node`, `npx playwright` and `git` ones. "Don't ask again" is fine for `npm run` and `node scripts/`. Don't use bypass-permissions mode.
6. **Review.** When it reports back, look at the screenshots in `docs/v3/after/<step>/`, or click around `localhost:3000`.
7. **Checkpoints.** After steps 01, 02 and 05, tell Claude in Cowork "step NN done" and wait for the review before starting the next step. Between the other steps, carry on unless something looks wrong.

**Effort:** xhigh for every step. The prompts already make the design decisions, so the job is careful execution; max is slower, uses more of your plan and tends to overthink work that's already specified. Switch to `/effort max` for step 05, where the overlay has to match cobe's projection exactly, or when re-running a step that went wrong.

**If something goes wrong:** Esc stops Claude Code, and you can type a correction. `/rewind` (or Esc twice) rolls back its file edits in the current session, but not commands it ran. Each step is its own commit, so a finished step can be reverted on its own.

## The sequence

| Step | What it does | Needs from you first |
|---|---|---|
| 00 · Groundwork | Parks the taste-pass leftovers, sets up reference capture, takes "before" screenshots, updates the rules, maps the code. Nothing visible changes. | nothing |
| 01 · Structure | Seven sections with one job each, one content file, light/dark tones, no 01–07 numbering. | nothing |
| 02 · Typography | Archivo + Chivo Mono as shared `type-*` utilities across the page. | nothing |
| 03 · Navbar | Inset glass bar, switched by section, new links, fixed anchor offsets. | nothing |
| 04 · Hero headline | Line-mask rise, lede and CTAs, the Muscat data line types on. | nothing |
| 05 · Globe | cobe sphere, graticule overlay, real locations only (Muscat, Pakistan, UAE, Germany). | which country in Africa (added when known) |
| 06 · Offers | Offer rows built on your six capabilities, short copy. | nothing |
| 07 · Projects | Dark register: HDT Systems named, the rest withheld. | your own projects to list |
| 08 · Engagement | Sticky "cover" with length, team, effort; five parts with what you receive. | typical length and effort (hidden until then) |
| 09 · Standards | Rules as constraints, frameworks strip, team slot. | credentials (optional) |
| 10 · Name + Contact | Dictionary entry for "cykoai" [see·ko·ya]; what to send per offer. | what clients should send (optional) |
| 11 · Final pass | Consistency, dead code, content gate, Lighthouse, release note for the merge. | approve the new page title and description |

Nothing blocks on your answers: unconfirmed content stays TBC, shows a DRAFT chip in dev and is hidden in production. Answering before the step just means the section ships complete.

**Review checkpoints** (look properly before moving on): after 01 (is the structure right?), after 02 (is the type right?), and after 05 (is the hero right?). The rest can flow.

## Why step by step and not one shot

- **You see each change before the next one builds on it.** The taste-pass branch was a single big pass that you rejected at the end; this way a wrong turn costs one step, not the whole redesign.
- **Each session studies only its own references.** Screenshots of reference sites fill a Claude Code session quickly, and one prompt covering every section would be judging the last sections with the least attention left.
- **The foundation comes first.** Structure and type change every section's measurements, so sections are designed after them, not before.
- **One commit per step,** so any step can be reverted without losing the others.
