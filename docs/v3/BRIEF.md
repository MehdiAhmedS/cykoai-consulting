# Cykoai v3: the brief

Read this before every v3 step. It is the shared context; each file in `docs/v3/prompts/` adds the specifics for one step. Where this brief and older documents disagree, this brief wins.

## Where the work happens

- **Branch:** `redesign/v1` is the base, and every v3 commit lands on it. `redesign/taste-pass` is a rejected experiment: don't merge it, cherry-pick from it or copy from it.
- **Plans:** `REDESIGN_PLAN.md` (v2.1) still applies, except where the v3 rules below amend it. `CLAUDE.md` summarises both.
- **Decisions:** design decisions come from the reference board, a claude.ai page Mehdi reviews. They're recorded in the Decisions table at the end of this file, and each prompt is written from them.
- **Screenshots:** the board's screenshots of every reference are saved locally in `docs/v3/references/<section>/board/`, captioned in `docs/v3/references/INDEX.md`.

## The problem v3 fixes

An audit of every statement on the current page (v1 copy, September 2026) found the following:

- **The same claims, repeated.** 24 of the page's 42 statements repeat one of seven claims, and six of the eight sections carry three to five of them each. The seven:
  1. The future moves faster than your organization.
  2. We work inside your team.
  3. Engineers and strategists who've shipped, not advised.
  4. Security designed in, "not bolted on".
  5. You own it when we leave.
  6. It holds up under scrutiny.
  7. Change paced so it compounds.
- **One list, shown twice.** What we do and Services are the same catalogue: the four pillars are the seven disciplines, regrouped.
- **Philosophy restates the hero headline.**
- **Phrases repeated word for word.** "Bolted on" appears three times, "owned by your teams" three times, and "actually" four times.
- **Missing information.** No section carries Cykoai's real engagements, a real number, a person, what an engagement costs or how long it takes, where Cykoai has worked, or proof. The one engagement note is labelled "Illustrative".
- **Ordinal numbering.** Section labels 01–07, numbered service rows and a numbered mobile menu add structure that carries no information.
- **Weak type.** Space Grotesk tops out at weight 700 and reads like a 2020 startup face. Mehdi wants type that's bolder, modern and technical.

## The v3 page: seven sections, one job each (decided)

| Section | id | The visitor asks | Only this section carries | Replaces |
|---|---|---|---|---|
| Hero | `top` | Who are you, and what do you do? | The thesis, once. What Cykoai does in one plain line. Where it really works. | Hero |
| Offers | `offers` | What exactly can I hire you for? | Named engagements: who each is for, what you get, what it touches. | What we do + Services |
| Projects | `projects` | Have you done this before? | Real engagements: client or sector, practice, standard or stack, since when, status. | The illustrative engagement note |
| Engagement | `engagement` | What happens after I get in touch? | Team shape, what you receive at each stage, how handover works; length once Mehdi confirms it. | Process + "Skin in the game" |
| Standards | `standards` | Why trust you with access to our systems? | The frameworks Cykoai works to, the rules it keeps, who does the work. | Why Cykoai |
| The name | `name` | Why "Cykoai"? | The word only: how it's said, its three parts, what each means. | Name story + Philosophy's last line |
| Contact | `contact` | What's the first step? | What to send, what happens next, how fast. | Contact |

The page order is Hero, Offers, Projects, Engagement, Standards, The name, Contact.

### Tone map

Every section carries `data-tone="dark"` or `data-tone="light"` on its `<section>`. The navbar switches its glass values from it (step 03), and display weights ease off slightly on dark (step 02).

| Section | Background | data-tone |
|---|---|---|
| Hero | `bg-windsor` | dark |
| Offers | `bg-white` | light |
| Projects | `bg-windsor` | dark |
| Engagement | `bg-white` | light |
| Standards | `bg-n50` | light |
| The name | `bg-windsor` | dark |
| Contact | `bg-white` | light |
| Footer | `bg-windsor` | dark |

### Type system (decided: Archivo + Chivo Mono; built in step 02)

- **Display:** Archivo, variable weight and width.
  - Hero: 780 at 112% width, −0.035em, leading 0.94.
  - Section headings: 740 at 110% width, −0.03em, leading 1.0.
  - Sub-heads: 700 at 104% width.
  - On dark sections, display weights drop by 20.
- **Text:** Archivo 400 at normal width, 17px on 1.6.
- **Labels and data:** Chivo Mono 500, 11px, capitals, +0.1em. Numbers in tabular figures.
- Use the `type-*` utilities from step 02 everywhere. No ad-hoc font sizes, weights or tracking in components after step 02.

### One home per claim

Each recurring claim may appear once on the page, in its home section:

| Claim | Home |
|---|---|
| The future moves faster than your organization | Hero headline |
| We work inside your team | Engagement (team shape) |
| Engineers and strategists who've shipped | Engagement (who's on it) |
| Security designed in from the start | Standards (as a rule) |
| You own it when we leave | Engagement (handover) |
| It holds up under scrutiny | Standards (frameworks and rules) |
| Change paced so it compounds | Cut |

Words to avoid everywhere: "bolted on", "actually", "seamless", "cutting-edge", "world-class", "leverage", "unlock".

## Cykoai's real work: the only source for offers and projects

From Mehdi, 25–26 September 2026.

**What Cykoai delivers:** AI automation; cybersecurity (security reviews, hardening, penetration testing); company profiles (landing pages and design, from the ground up); mobile applications; API integrations; Docker bot deployments.

**Current engagements (all in progress):**

1. **HDT Systems (Germany)**, which may be named: Google Workspace security hardening, a review of freelancers' access, and controls working toward ISO/IEC 27001.
2. Security architecture and design audits of AI-built ("vibe-coded") applications, to get them launch-ready. Clients withheld.
3. A secure AI setup on Google Vertex AI. Client withheld.
4. A mobile application with API integrations to devices (an IoT project). The client can't be named; describe the capability only.
5. AI workflow automation. Client withheld.
6. Security analysis and penetration testing; development; landing pages. Clients withheld.

Cykoai's own projects may also be listed; Mehdi will supply names and details (TBC).

**Where clients are:** Muscat (Oman, also Cykoai's origin), Pakistan, the UAE, Germany, and a country in Africa (which one is TBC).

**The name:** "Cykoai" is pronounced "see-ko-ya".

**Offer copy:** keep it short. No durations or prices are published.

Content rules:

- **Never invent.** Clients, metrics, dates, prices, credentials and quotes are never invented. Anything unconfirmed stays in `src/content/site.ts` with `status: "draft"` or the value `"TBC"`.
- **Confidential clients read "Withheld".** Naming a client needs that client's consent, which Mehdi confirms.
- **Two things leave the page:** the "Illustrative" engagement note, and the stat strip (2–4 people, <90 days, 100%), whose numbers are unverified.
- **Voice:** sentence case and short declarative sentences. Use numbers only when they're real.

## v3 rules (amendments to REDESIGN_PLAN §1)

**Kept from §1:**

- Palette: Windsor #0B1527, white, and Driftwood #AD8752, used sparingly (rules, links, focus, about one highlight per screen).
- Flat fields; hairlines, not shadows; radii 2–8px.
- Sentence case; no emoji or hype.
- Motion: GSAP + ScrollTrigger + Lenis only; transforms and opacity only; at most 2 pins per page; a full reduced-motion fallback.
- Imagery only from `public/assets/gen/`, and the page must work with every image removed.
- Never touch `src/app/api/contact`.

**Amended in v3:**

- **Glass on the navbar only.** Backdrop blur 16–20px, tint at least 72% opaque, a 1px hairline, and an `@supports not (backdrop-filter: blur(1px))` solid fallback. No inset highlight, no `saturate()`, no shadow, no `mix-blend-mode`.
- **WebGL in the hero globe only.** Use cobe (about 6KB); arcs and graticule may be drawn on a 2D canvas overlay that shares the rotation. The globe shows real locations only, and the hero must read completely with the canvas removed.
- **Numbers only as data:** dates, weeks, counts, coordinates, time zones. No ordinal section indices, numbered rows or numbered menus.
- **Typography:** Archivo + Chivo Mono (see Type system), built in step 02. Until then, leave the fonts alone.
- **Reveal timing:** the hero headline reveal may run up to 1200ms; other reveals stay at 500–800ms.
- **SVG line drawing:** a stroke draw-in of up to 600ms is allowed for line glyphs.

## How to study a reference

Every section prompt lists reference sites. For each one:

1. **Board captures first.** Look at the board's captures in `docs/v3/references/<section>/board/`. `references/INDEX.md` says what each shows and what was measured.
2. **Capture the live site** with `npm run refs -- <section> <url> [flags]`:
   - `--flow`: the page's flow as you scroll
   - `--frames`: the load animation
   - `--at="text"`: one specific section
   - `--mobile`: the 390px view as well
   - `--probe`: measured fonts and nav/heading styles

   Output goes to `docs/v3/references/<section>/live/`.
3. **Take notes.** Read the images at desktop and mobile widths, then write `docs/v3/references/<section>/NOTES.md`. For each reference, give 3–5 concrete observations (layout, hierarchy, spacing, type, motion timing, mobile behaviour), what to take, and what to skip.
4. **Derive principles; don't copy.** Never copy a reference's code, text, images, logos or distinctive brand devices. If a live site blocks capture, rely on the board captures and say so in NOTES.md.

## How to build and check every step

1. **Read** this brief, the step's prompt, `CLAUDE.md`, and the files you'll touch.
2. **Plan.** Mehdi runs each step in plan mode, so the plan you present comes before the reference study: list the captures as its first task. Once he approves it, do the reference study, then write a short plan at the top of the step's NOTES.md, adjusted for what the references showed, before editing.
3. **Implement.** After step 01, all copy comes from `src/content/site.ts`.
4. **Check the build:** run `npm run lint` and `npm run build`.
5. **Screenshot.** With `npm run dev` running, run `node scripts/verify-shots.mjs --full --out=docs/v3/after/<step>`, plus `--section=#<id>` for the sections you touched. Any console error fails the step.
6. **Self-review.** Check against the v3 rules and the step's acceptance list. Put your screenshots next to the references and fix what's off.
7. **Commit** on `redesign/v1` as `v3(<step>): <summary>`. Screenshots under `docs/v3/` are gitignored.
8. **Report back** with:
   - what changed and the file list
   - screenshot paths
   - every draft or TBC item
   - questions for Mehdi

## Decisions from the reference board

All picked on 26 September 2026.

| Area | Decision | Step |
|---|---|---|
| Page structure | A: seven sections, one job each | 01 |
| Typography | A: Archivo + Chivo Mono | 02 |
| Navbar | A: inset glass bar; Linear's values on dark sections, Harvey's on light, switched per section | 03 |
| Headline motion | A: line-mask rise in the heavy display, then a mono data line types on | 04 |
| Globe | A: cobe sphere with a graticule and arcs to real client locations only | 05 |
| Offers | A: offer rows with terms (who it's for, what you get); no length, per Mehdi | 06 |
| Projects | A: engagement register with status; confidential rows shown as withheld | 07 |
| Engagement | A: deliverable anatomy, with the team (and length, once confirmed) on a "cover" | 08 |
| Standards | A: rules as constraints plus a frameworks strip | 09 |
| The name | A: dictionary entry (pronunciation, three parts, one closing line) | 10 |

Answered on 26 September:

- HDT Systems (Germany) is the Workspace client and may be named.
- The IoT client stays withheld.
- Clients are in Muscat, Pakistan, the UAE, Germany and Africa.
- The pronunciation is "see-ko-ya".
- Offers stay short, with no durations.

Still open; until answered, the value stays TBC in `site.ts` and is hidden in production:

- which country in Africa (05)
- Cykoai's own projects to list: name, one line, capability, stack, year, link (07)
- any credentials to show for the team (09, optional)
- what a client should send for each offer (10, optional)
