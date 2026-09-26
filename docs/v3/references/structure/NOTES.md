# Structure: how two consultancies order their homepage

**Build plan (approved 26 Sep 2026).** Seven sections in the brief's order, each with its tone-map background and `data-tone`. All copy moves to `src/content/site.ts` with a status per entry; drafts show a dev-only DRAFT chip. Every section opens with the same `MonoLabel tick` line (Offers, Projects, Engagement and Standards reuse the nav word, draft). Projects is a register (table from 768px, stacked below). TBC shows as "TBC" in dev; in production an all-TBC column is dropped and single TBC cells show "—". The footer tagline is removed (it repeated two claims). No new band fades; one pin remains (Engagement).

Studied 26 Sep 2026 live in Chrome (1440 wide, then 500 wide: Chrome's minimum window width, so 390 was not reachable) and saved with `npm run refs -- structure <url> --flow=10` into `live/`. No board captures exist for this section. Neither site loads GSAP, ScrollTrigger, Lenis, pins or WebGL.

**Evil Martians** (8 blocks, page about 6000px)
- Order: hero (name, one "who it's for" line, CTA) → one featured case (client, stage, one real metric, link) → client cases → services ("startups hire us for") → open-source proof with a real chart → mid-page contact (call, coffee, email) → investor logos → podcast → FAQ (covers cost, location, how it works) → thin footer.
- Offers vs proof: proof comes first; services are block 4. There is no process section; the FAQ does that job.
- Handover: one dark field, no background change. A fixed 160px gap between blocks (60px at 500). Each block opens with the same line: a mono caps H3 (15/16px, 500, 87.5% width) on the left, a "see all" link on the right, a hairline under. The hero CTA docks top-right once you scroll.
- Motion: only CSS loops (4–4.2s linear). Blocks render on arrival; no staged reveals.

**Trail of Bits** (3 blocks, page about 2270px)
- Order: hero (thesis h1, three CTAs) beside one featured research card → services strip (six practice tiles) → work register (dated rows) with reports, talks and one repo beside it → "explore everything" → one-line footer.
- Offers vs proof: offers sit right under the hero; proof is the biggest block and comes last. Contact is not a section: "Get in touch" stays in the fixed side rail (a bottom tab bar at 500), always one tap away. Real counts and "since 2012" sit in the top bar as data.
- Handover: one flat field, 20px gaps. Each block opens with a mono chip label (Geist Mono 12px, +0.04em, caps) left and "view all" right.
- Register row: date (mono) → title → client (mono caps) → tag chips. Hairlines between rows; hover lightens the row background in 150ms.
- Type: h1 FH Lecturis 400, 80/80px, −2px (48px at 500); body Geist 16/24.

**Take:** Trail of Bits' order (offers right after the hero, then proof), which is the brief's Hero → Offers → Projects. One repeated section header (mono label + hairline) as the handover, with the tone map as the only other cue. The dated register row for Projects. One always-visible contact path (the navbar "Talk to us").
**Skip:** mid-page contact blocks, logo walls, carousels, podcast and FAQ blocks, glow, mascots, the side rail and site search.
**Differences:** 390px was not reachable in Chrome (500 minimum), and the prompt's commands save no `--mobile` capture. The headless capture shows Trail of Bits' light theme; Chrome showed dark.

## Step 01 checks (26 Sep 2026)
- **Numbering:** `grep -rnE 'padStart|index="|"0[1-7]"' src` finds nothing. Coordinates stay in the hero caption.
- **Claims** (rendered body text of `/`, dev and production; plus `src/content/site.ts`):
  - "inside your": 1, the Deploy step (its home)
  - "forward-deployed": 1, the same Deploy line
  - "bolted on", "owned by your team", "compound", "actually", "demo", "scrutiny", "forward deployed": 0
  - "seamless", "cutting-edge", "world-class", "leverage", "unlock", "illustrative": 0
  - "future": 1 (hero headline). "hand off" / "handover": Sustain, the Engagement intro and one Standards rule. That is one ownership claim, in Engagement.
  - The `<title>` still says "Forward Deployed"; step 11 replaces the metadata.
- **Production** (`next start`): no "DRAFT" and no "TBC" in the HTML; the Since column is gone; the two TBC stack cells show "—".
- **Pins:** 1 at 1440 (Engagement); 0 under reduced motion and below 900px.
- **Fixed on the way** (both were already in v1; Mehdi approved the fixes):
  - Mobile-menu links now scroll. The anchor scroll waits one frame, so Lenis restarts before it runs.
  - Engagement cards stack under reduced motion and below 900px. Before, only 2–3 of the 5 steps were visible there.
