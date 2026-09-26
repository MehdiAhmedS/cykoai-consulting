# Step 07 · Projects: an engagement register with status (decided: board option A)

Read `docs/v3/BRIEF.md` first. This section answers *have you done this before?* with real, current work. All six engagements are in progress, so this is a register (the format security firms use for their own audit work), not outcome cards. It shows what's being done, for whom (or "Withheld"), with what standard or stack, and its status. It carries no metrics until real ones exist.

## 1. Study the references

Board captures are in `docs/v3/references/projects/board/`. Then capture them live:

```bash
npm run refs -- projects https://www.trailofbits.com/library/ --probe --flow=3
npm run refs -- projects https://reports.zellic.io --at="Show private reports"
npm run refs -- projects https://osec.io/audits --flow=2 --probe
npm run refs -- projects https://mapprojectoffice.com/index-page/ --at="project index"
npm run refs -- projects https://www.metalab.com/work --flow=3
```

In `docs/v3/references/projects/NOTES.md`, cover:

- column choices and widths, and header styling (mono, muted)
- row height and hairlines, and how dark tables keep contrast (Trail of Bits, OtterSec)
- how confidential work is shown: Zellic's "Private Report · — · Private", Map Project Office's "(confidential)", Trail of Bits' "A private client"
- Metalab's wording for unfinished work ("An ongoing partnership…")
- OtterSec's finding counts, as the future shape of real data

Skip filters (six rows don't need them), logos, thumbnails and cursor-follow images.

## 2. The design

- **Tone:** dark (`bg-windsor`, `data-tone="dark"`). This is the page's technical centrepiece.
- **Header:** `type-label` "Projects", the `type-h2` heading and `type-lead` intro from `site.ts`.
- **Summary line:** computed from the data, never hard-coded. For example "6 engagements · 6 active · newest first", in `type-data`, n300, with values in white.
- **The register, ≥768px:** a semantic `<table>`.
  - Columns: Engagement, Client, Practice, Standard / stack, Since, Status.
  - Column heads in `type-label` n300, aligned to the cell text.
  - Rows about 64px tall, with 1px `rgba(255,255,255,0.12)` hairlines; no zebra stripes or boxes.
- **Cells:**

  | Column | Treatment |
  |---|---|
  | Engagement | Display 680 at 104% width, about 1.1rem, white |
  | Client | `type-small`, white. "Withheld" in n300 with no other decoration. A client named in `site.ts` but still pending consent renders as "Withheld" in production and shows its name with a DRAFT chip in dev. |
  | Practice | `type-label`, n300 |
  | Standard / stack | `type-small`, n300 |
  | Since | `type-data`. "TBC" renders as an em dash (—) in production and as TBC with a DRAFT chip in dev. |
  | Status | A 6px Driftwood dot and `type-label` text ("In progress", "Ongoing") |

- **Expandable rows:**
  - The Engagement cell holds a button that expands a full-width row beneath it, with three short fields from `site.ts`: Context, Work, Where it stands.
  - Add these fields to `site.ts`. All are "TBC" for now, and hidden in production until confirmed.
  - The last field is phrased like "Phase 2 of 3: …", never a metric. Use Metalab-style wording for unfinished work.
  - Expand and collapse is 300ms; instant under reduced motion. Include `aria-expanded` and `aria-controls`, and full keyboard support.
- **Mobile (<768px):** no table. Each engagement becomes a block:
  - the title in the display style
  - then `type-data` key/value lines: Client, Practice, Stack, Since, Status
  - hairlines between blocks
  - the expand button below

  Screen readers get the same structure: a list of articles with definition lists.
- **Numbers only as data:** dates and counts are fine; no row numbers.
- **Motion:** rows appear with `Reveal`, 60ms stagger, opacity and y only. There are no hover lift effects; a hovered row's background shifts to `windsor-2`.

## 3. Content

Use `site.ts` as it stands after step 01:

- **HDT Systems (Germany)** is named: the Workspace hardening row.
- **The IoT mobile app client** stays "Withheld". The row describes the capability: a mobile app with API integrations to devices.
- **Practice column:** uses the offers' practices (Security, AI, Engineering, Design), so each row points at a capability from the Offers section.
- **Cykoai's own projects** go in `ownProjects`. Render them as further rows with the client "Cykoai" once Mehdi supplies them; until then, render nothing for them. Once they're in, every capability in the brief (AI automation, cybersecurity, company profiles, mobile apps, API integrations, Docker bot deployments) should appear in at least one row. Record the coverage in NOTES.md.

Never add clients, dates or outcomes that aren't confirmed.

## 4. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/07-projects`, with `--section=#projects`). Capture one row expanded at 1440 and 390, and compare with the Trail of Bits and OtterSec captures in NOTES.md for density and contrast. Check text contrast against Windsor (n300 on Windsor must pass AA at the sizes used). Check keyboard and screen-reader structure.

Commit: `v3(07): projects register with status; confidential rows withheld`. The report lists every TBC and draft value in this section.

## Acceptance

- A dark register with six rows: a table on desktop, stacked blocks on mobile. The summary line is computed from the data.
- Withheld and TBC values render correctly in both production and dev, and no invented data appears.
- Expandable rows are accessible, reduced motion is respected, and contrast passes.
