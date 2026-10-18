# v3 build: how to run the prompts

Fifteen steps, one prompt each, run in order (05b was added on 27 September to rebuild the globe, 07 now runs before 06, 07b was added on 18 October for HDT Systems' stage piece, and 03b the same day to restyle the navbar after Raycast's), with a fresh context (`/clear`) for each step. Every prompt starts from `docs/v3/BRIEF.md`, so each session has the same context without carrying the previous step's clutter. All ten design decisions were picked on the reference board on 26 September 2026 (all option A). On 27 September Projects was picked again, on the showcase board (A, the stage). Every prompt is ready.

## Before each working session

1. Open Terminal in the repo: `cd ~/Documents/Personal/cykoai-consulting`, and check that `git branch --show-current` prints `redesign/v1`.
2. Open a second terminal tab in the same folder and run `npm run dev`. Leave it running for the whole build: every step's screenshot check uses it. If it starts misbehaving after a step's production build, stop it with Ctrl+C and start it again.
3. Make sure Chrome is open, with the Claude in Chrome extension signed in to the same account as Claude Code.
4. In the first tab, start Claude Code with Chrome connected: `claude --chrome`. In a session that's already running, `/chrome` connects it instead.
5. Choose the model with `/model`: Fable 5.1 if your plan lists it, otherwise Opus 5.5.
6. Set the effort with `/effort xhigh`.

## How to run a step

Each step is two passes in one session. First Claude Code goes through the reference sites in Chrome and writes down how they look and move; then it plans and builds from what it found. Steps 05b, 06, 07b and 11 have only the second pass (see the note after the list).

1. **Fresh context.** Type `/clear`, then `/effort` to check it still says xhigh. Plan mode stays off for the study.
2. **Study.** Paste this, changing the file name: `Read docs/v3/BRIEF.md and docs/v3/prompts/01-structure.md. Do only the reference study in part 1, in Chrome as the brief describes: save the captures, write NOTES.md and summarise what you found. Don't change any code yet.`
   - Chrome may come to the front and open tabs in their own group while it works. Let it run, and don't type in other windows meanwhile.
   - Approve its Chrome actions on the reference sites. It may ask more than once for the same thing; that's a known issue.
   - If it reaches a login page or a CAPTCHA, it should stop there. Don't sign in for it.
3. **Plan.** Press Shift+Tab until the footer reads "plan mode on", then paste, changing the file name: `Now plan the rest of docs/v3/prompts/01-structure.md, using what the study found, then carry it out exactly. Stop and ask if anything doesn't match what the prompt describes.`
4. **Check the plan** before approving it. It should:
   - use what the study found;
   - touch only the files the prompt names;
   - end with lint, build, screenshots into `docs/v3/after/<step>/`, a check of the result in Chrome, and one commit;
   - include no push, no merge and nothing in `src/app/api/contact`.

   If the plan is off, say what to change before approving.
5. **Approve** with the option that accepts edits automatically. Commands still ask first: approve the `npm`, `node`, `npx playwright` and `git` ones. "Don't ask again" is fine for `npm run` and `node scripts/`. Don't use bypass-permissions mode.
6. **Review.** When it reports back, look at the screenshots in `docs/v3/after/<step>/`, or click around `localhost:3000`.
7. **Checkpoints.** After steps 01, 02 and 05b, tell Claude in Cowork "step NN done" and wait for the review before starting the next step. Between the other steps, carry on unless something looks wrong.

**Steps with no study pass (05b, 06, 07b and 11).** After `/clear`, set the effort, press Shift+Tab until the footer reads "plan mode on" and paste, changing the file name: `Read docs/v3/BRIEF.md and docs/v3/prompts/05b-globe-threejs.md. This step has no study pass, so plan the whole prompt, then carry it out exactly. Stop and ask if anything doesn't match what the prompt describes.` Then carry on from item 4.

**Effort:** xhigh for every step. The prompts already make the design decisions, so the job is careful execution; max is slower, uses more of your plan and tends to overthink work that's already specified. Switch to `/effort max` for steps 05b, 06 and 07b, where the 3D shaders and frame budget need the most care, or when re-running a step that went wrong.

**If something goes wrong:** Esc stops Claude Code, and you can type a correction. `/rewind` (or Esc twice) rolls back its file edits in the current session, but not commands it ran. Each step is its own commit, so a finished step can be reverted on its own.

## The sequence

| Step | What it does | Needs from you first |
|---|---|---|
| 00 · Groundwork | Parks the taste-pass leftovers, sets up reference capture, takes "before" screenshots, updates the rules, maps the code. Nothing visible changes. Done 26 September. | nothing |
| 01 · Structure | Seven sections with one job each, one content file, light/dark tones, no 01–07 numbering. | nothing |
| 02 · Typography | Archivo + Chivo Mono as shared `type-*` utilities across the page. | nothing |
| 03 · Navbar | Inset glass bar, switched by section, new links, fixed anchor offsets. | nothing |
| 03b · Navbar, Raycast's glass | Restyles the bar after raycast.com: dark Windsor glass on every section with a hairline and an inner top highlight, lined up with the content column, 14px links, and a light "key" CTA. Has a short study of raycast.com first. Run it whenever you like. | nothing |
| 04 · Hero headline | Line-mask rise, lede and CTAs, the Muscat data line types on. | nothing |
| 05 · Globe | cobe sphere, graticule overlay and arcs; decorative places and a larger globe after review. Done 27 September; 05b replaces its engine. | nothing |
| 05b · Globe in three.js | Rebuilds the globe in three.js from the Cowork study: a lit sphere, arcs that travel and land (up to three at once), a slow sway, and a still frame on phones. The study is already done, so skip the study pass and start in plan mode. | which country in Africa (added when known) |
| 06 · Offers | Rows that open as you scroll, Cuberto-style, each with a three.js piece of the work, from the Cowork study; still images on phones. The study is already done, so skip the study pass and start in plan mode. Runs after 07. | nothing |
| 07 · Projects | The stage: a sticky frame whose screen wipes to each project as you scroll. Your landing pages are captured live, confidential work is shown as labelled illustrations, and the rest goes in a list. Runs before 06. | for each landing page: client or concept, naming and year; whether to link the live pages |
| 07b · HDT piece | HDT Systems' screen on the stage becomes a three.js piece from the Cowork study: servers, four control rings that lock, a shield that fills with gold, and no text or tag. It rises with the wipe, plays once and holds. No study pass; start in plan mode. Runs after 06. | nothing |
| 08 · Engagement | Sticky "cover" with length, team, effort; five parts with what you receive. | typical length and effort (hidden until then) |
| 09 · Standards | Rules as constraints, frameworks strip, team slot. | credentials (optional) |
| 10 · Name + Contact | Dictionary entry for "cykoai" [see·ko·ya]; contact restyled. | nothing (signed off 17 Oct) |
| 11 · Final pass | Consistency, dead code, content gate, Lighthouse, release note for the merge. No references, so skip the study pass. | approve the new page title and description |

Nothing blocks on your answers: unconfirmed content stays TBC, shows a DRAFT chip in dev and is hidden in production. Answering before the step just means the section ships complete.

**Review checkpoints** (look properly before moving on): after 01 (is the structure right?), after 02 (is the type right?), and after 05b (is the hero right?). The rest can flow.

## Why step by step and not one shot

- **You see each change before the next one builds on it.** The taste-pass branch was a single big pass that you rejected at the end; this way a wrong turn costs one step, not the whole redesign.
- **Each session studies only its own references.** Screenshots of reference sites fill a Claude Code session quickly, and one prompt covering every section would be judging the last sections with the least attention left.
- **The foundation comes first.** Structure and type change every section's measurements, so sections are designed after them, not before.
- **One commit per step,** so any step can be reverted without losing the others.
