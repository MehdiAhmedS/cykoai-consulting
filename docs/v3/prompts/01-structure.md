# Step 01 · Seven sections, one job each (decided: board option A)

Read `docs/v3/BRIEF.md` and `docs/v3/INVENTORY.md` first. This step turns today's eight sections into the seven in the brief, moves every string into one content file, and removes the ordinal numbering. It's a structure and content step, not a visual redesign: new sections reuse existing patterns and tokens with minimal styling, because later steps design each section properly. The page must stay shippable after this step.

## 1. Study how consultancies order their story (short)

The goal is to see how a strong consultancy page moves from who they are, to what you can buy, to proof, to method, to contact. Capture two sites:

- `npm run refs -- structure https://evilmartians.com --flow=10`: a consultancy for developer-tool, AI and cybersecurity startups, the closest business analogue to Cykoai.
- `npm run refs -- structure https://www.trailofbits.com --flow=10`: a security firm whose services and public work are separate, distinct things.

Write `docs/v3/references/structure/NOTES.md` covering:

- the order each site's homepage uses
- where it puts offers versus proof
- how each section hands over to the next

Keep it to about 15 lines. Don't copy anything.

## 2. One content file: `src/content/site.ts`

Create a typed module that holds every visible string on the page. Every entry has a `status` of `"confirmed"` (existing v1 copy Mehdi has already approved, or a line explicitly marked confirmed below) or `"draft"` (new wording that needs his sign-off). Unknown values are the string `"TBC"`. Transcribe the drafts below exactly; don't improve or extend them.

**`hero`**

| Field | Value | Status |
|---|---|---|
| eyebrow | "Security · AI automation · Engineering" | draft |
| headline | "The future moves faster than" + dim part "your organization." | confirmed |
| lede | "Cybersecurity, AI automation, mobile apps, API integrations and company websites, from one team." | draft |
| caption | "Origin Muscat" · "23.59° N, 58.38° E" | confirmed |
| primary CTA | "Talk to us" → `#contact` | confirmed |
| secondary CTA | "See what we do" → `#offers` | draft |

The caption drops "Deployed where change happens", which restates a claim.

**`offers`**

Keep this copy short (Mehdi's instruction). There is no length or price field.

- heading: "What you can hire us for." (draft)
- intro: "Six ways to work with us. Pick one, or combine them." (draft)
- items (all draft):

| id | name | practice | for | youGet |
|---|---|---|---|---|
| `security-reviews` | Security reviews | Security | Apps about to launch, including AI-built ones | Architecture and design review and penetration testing, with findings by severity and fixes |
| `workspace-hardening` | Workspace hardening | Security | Organisations on Google Workspace | A hardened configuration, a review of contractor and freelancer access, and controls mapped to ISO/IEC 27001 |
| `ai-automation` | AI automation | AI | Teams with repetitive, manual work | AI workflows that remove manual steps, including private AI on Google Vertex |
| `mobile-iot` | Mobile apps and device integrations | Engineering | Products that talk to hardware | Mobile applications with API integrations to devices and IoT hardware |
| `apis-bots` | APIs and bot deployments | Engineering | Teams connecting systems | API integrations and Docker-based bot deployments |
| `company-profiles` | Company profiles | Design | Companies that need a presence | Landing pages and brand design, from the ground up |

**`projects`**

- heading: "What we're working on now." (draft)
- intro: "Current engagements. Some clients are named; confidential ones are withheld." (draft)
- items (`since` is "TBC" for every one):

| title | client | practice | stack | status | copy status |
|---|---|---|---|---|---|
| Google Workspace hardening and access review | HDT Systems, Germany | Security | Google Workspace · ISO/IEC 27001 controls | In progress | client confirmed; title draft |
| Launch-readiness audits for AI-built apps | Withheld | Security | Architecture and design review | Ongoing | draft |
| Mobile app with device integrations | Withheld | Engineering | Mobile · device APIs · IoT | Ongoing | draft |
| Secure AI environment | Withheld | AI | Google Vertex AI | In progress | draft |
| AI workflow automation | Withheld | AI | TBC | In progress | draft |
| Penetration testing and web builds | Withheld | Security · Design | TBC | Ongoing | draft |

- `ownProjects`: an empty list for Cykoai's own projects. Mehdi will supply them (name, one line, practice, stack, year, link). Render nothing until entries exist.

**`engagement`**

- heading: "How an engagement runs." (draft)
- intro: "What happens between your first message and the handover." (draft)
- steps, adapted from v1's Process:

| Step | Text | Status |
|---|---|---|
| Assess | "We map where your organization stands, technically, operationally and culturally, against where you intend to go." | confirmed; v1 copy with "actually" removed |
| Align | "Strategy and business case, built together with the executives who'll be accountable for the outcome." | confirmed |
| Design | "The architecture and delivery plan, including how it will be secured and run." | draft; replaces the "not bolted on" line |
| Deploy | "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it." | confirmed; this is now the only place these claims live |
| Sustain | "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends." | confirmed; the only home of the ownership claim |

**`standards`**

- heading: "The rules we work by." (draft)
- intro: "What you can hold us to, and the frameworks we work to." (draft)
- rules (all draft; they are examples for Mehdi to adopt, edit or reject):

| Rule | What it means |
|---|---|
| Access ends at handover | Least-privilege accounts for the engagement only, revoked on the last day. |
| Every finding ships with a fix | Each issue carries a severity and a remediation, never a bare list. |
| Your findings stay yours | Nothing is published without your written permission. |
| Every deliverable ships complete | The same structure every time, whatever the size of the engagement. |

- frameworks: "ISO/IEC 27001", "Google Workspace", "Google Vertex AI", "Docker" (draft). No team credentials yet; keep an empty, hidden `credentials` list.

**`name`**

| Field | Value | Status |
|---|---|---|
| label | "The name" | draft |
| word | "cykoai" | confirmed |
| pronunciation | "see-ko-ya" | confirmed |
| cy | "From cybersecurity. The part of the work that comes first." | draft |
| ko | "The koi, which moves with the current, and the sequoia, which outlasts it." | draft |
| ai | "Applied intelligence: models put to work on real operations." | draft |
| closing | "Cykoai creates clarity." | confirmed; Philosophy's last line, moved here |

**`contact`:** keep v1's copy exactly (confirmed), with the label "Get in touch" and no number.

**`nav`:** Offers → `#offers`, Projects → `#projects`, Engagement → `#engagement`, Standards → `#standards`, and the CTA "Talk to us" → `#contact`.

**`footer`:** the same four links plus `info@cykoai.com`.

## 3. Rebuild the page

`src/app/page.tsx` renders, in order: `Hero`, `Offers`, `Projects`, `Engagement`, `Standards`, `TheName`, `Contact`. Every component reads its copy from `site.ts`.

Give every `<section>` the background and the `data-tone="dark|light"` attribute from the brief's tone map. The footer is `bg-windsor`, dark. Projects becomes a Windsor band, so its text uses the inverse colours: white, `n300` and Driftwood. Keep v1's `data-band-fade` handoffs where they still make sense between neighbouring sections; remove any that now fade between the wrong colours.

- **Hero:** keep the component and visuals, including the globe (steps 04 and 05 redesign them); only its copy changes.
- **Offers** (new, `sections/Offers.tsx`, `id="offers"`):
  - Reuse the Services heading pattern and the `IndexRow` list.
  - Each row: the offer name, with the practice as a small mono tag on the right.
  - Expanding a row shows label/value pairs: For, You get.
  - Delete `WhatWeDo.tsx` and `Services.tsx` once nothing imports them.
- **Projects** (new, `sections/Projects.tsx`, `id="projects"`):
  - A plain register: a semantic `<table>` from 768px up (columns Engagement, Client, Practice, Standard / stack, Since, Status); stacked label/value blocks below 768px.
  - Hairline rows, mono column heads, and the status shown with a small Driftwood dot.
  - No images, no numbering.
- **Engagement:**
  - Rename `Process.tsx` to `Engagement.tsx`, with `id="engagement"`.
  - Keep its current visual structure, including its progress rule if it has one.
- **Standards:**
  - Rename `WhyCykoai.tsx` to `Standards.tsx`, with `id="standards"`.
  - Rules on the left, frameworks as a mono list on the right.
  - Remove `EngagementNote` and `StatStrip` from the page and delete `EngagementNote.tsx`. Its content is fictional.
  - Keep the section's existing image only if the layout still works without the removed parts.
- **The name:**
  - Keep `NameStory.tsx` and its visuals (`RingField`); rename the export to `TheName` if you like.
  - Show the three syllable lines and the closing line from `site.ts`.
  - Delete `Philosophy.tsx` and take it off the page.
- **Contact:** unchanged apart from the label.

**Draft marker:** add `src/components/ui/DraftMark.tsx`, a tiny mono "DRAFT" chip that renders only when `process.env.NODE_ENV !== "production"`. Place it next to every draft string, so Mehdi can see what still needs his sign-off while reviewing in dev.

## 4. Remove ordinal numbering everywhere

- **`MonoLabel`:** remove the `index` prop and its render path, and update every call site (use `tick` or a plain label).
- **`SectionLabel`:** simplify it the same way, or delete it if nothing needs it.
- **`IndexRow`:** remove the index column and prop; the grid becomes `[1fr_auto]`.
- **Navbar mobile menu:** remove the `String(i + 1).padStart(2, "0")` span.
- **Keep numbers that are data:** coordinates, and later weeks and dates.
- **Check:** grep for `padStart`, `index="`, and `"0[1-7]"` string literals; none should remain as labels.

## 5. One home per claim

Grep the rendered copy for "bolted on", "owned by your team", "inside your", "compound", "actually", "demo", "scrutiny", "forward-deployed". Each claim in the brief's table appears at most once, in its home section; fix anything else. Words that simply name an offer, such as "Docker-based bot deployments", are fine: the check is for repeated claims, not words. Record the grep results in NOTES.md.

## 6. Check, commit, report

- Run `npm run lint` and `npm run build`.
- With `npm run dev` running, capture the whole page with `node scripts/verify-shots.mjs --full --out=docs/v3/after/01-structure`. There must be no console errors.
- Compare against `docs/v3/before/`: sections, order, anchors and the mobile menu should all work.
- Commit on `redesign/v1`: `v3(01): seven sections, one job each; content model; numbering removed`.
- Report back with:
  - what changed and the files touched
  - the screenshot folder
  - a list of every draft and TBC value in `site.ts`, grouped by section, so Mehdi can answer them in one go

## Acceptance

- The page has seven sections in the brief's order, with the right ids. The nav, footer and CTA anchors land correctly, and the mobile menu works.
- Every section has the background and `data-tone` from the tone map.
- All copy comes from `src/content/site.ts`, and every draft shows a DRAFT chip in dev.
- There are no ordinal numbers anywhere; coordinates remain.
- Each recurring claim appears at most once, and "bolted on" and "actually" appear nowhere.
- The engagement note and stat strip are gone, and nothing invented has been added.
- Lint and build pass; the screenshots show no console errors; reduced motion still works.
