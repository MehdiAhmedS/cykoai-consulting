# Engagement: the deliverable anatomy

**Build plan (approved 3 Oct 2026).**
- **Content:** each stage in `site.ts` gains a draft `receive`. `engagement.cover` holds the title and four rows (Length and Effort are TBC, so hidden in production). `receiveLabel` is "You receive".
- **Section:** `Engagement.tsx` becomes a server component. No `overflow-hidden`, no AM-6 texture, no pin. From 900px it is a 36/64 grid: the cover is CSS-sticky (`top: 96px`, `align-self: start`) with the label above each value; the stages are an unnumbered list, each a hairline, the name, the description and a "You receive" line with no rule of its own.
- **Progress rule:** a new client `ui/ProgressRule.tsx`. Fully drawn in CSS; from 900px with motion allowed it is scrubbed `scaleY` 0 → 1 from the column's top to its bottom crossing 60% of the viewport, so the tip stays on that line.
- **Motion:** stages `Reveal` with `delay = i × 0.09`. Reduced motion and phones get everything static; phones get no rule.

**Build results (3 Oct 2026).** Screenshots are in `docs/v3/after/08-engagement/` (`prod/` and `prod-*` are the production build).
- **Sticky cover.** Measured in headless Chromium against the production build. The cover is 307px tall with its two production rows (462px in dev with all four). Its top holds at 96px while the stages pass, at 1440 × 900, 1366 × 768 and 900 × 900; the navbar's lower edge is at 68px, so they never overlap. Travel is 863px at 1440 × 900 (the stages column is 1170px).
- **Progress rule.** `scaleY` ran 0.153 → 0.954 across the five stages and reached 1 at the end; its tip stayed at 0.6 of the viewport height at every step. Under reduced motion it is `scaleY: 1` throughout. Below 900px it is `display: none`.
- **Reveals.** Opacity and `translateY` only (24px → 0), about 670ms each, ending about 90ms apart when the stages enter together. Under reduced motion all five are at opacity 1 from the start.
- **Mobile.** At 390 and 768 the cover is `position: static` on top, the stages stack under it, and the page has no sideways scroll (`scrollWidth` equals the viewport). Below 640px the "You receive" label sits above its value, so every stage reads the same.
- **Heading.** One line at 1440 and 768. Two lines at 390 ("How an / engagement runs."): it can't fit one line there, and the other break would strand "runs.".
- **TBC rows.** The production HTML for `#engagement` has no "Length", "Effort", "TBC" or "DRAFT". Dev shows all four rows with DRAFT chips.
- **Claims.** `grep -rniE "inside your teams?|engineers and (a )?strategists?|your teams? (runs?|can run)|you own|owned by|ownership|hand ?off|hand ?over" src`:
  - "inside your team(s)": `site.ts` Engagement only (the cover's Team row and the Deploy text).
  - "engineers and strategists" / "engineers and a strategist": Engagement only (the same two lines).
  - Ownership and handover: Engagement only for the claim (the intro, the cover's Handover row, the Sustain text and its "You receive" line). One other hit, in Standards: the rule titled "Access ends at handover". It is about access being revoked, not about who owns the system, so it was left.
  - `ui/StatStrip.tsx` still holds "OWNED BY YOUR TEAM", but nothing imports it, so it isn't on the page.
- **Pins.** `pin:` appears nowhere in `src/` now: zero GSAP pins, down from one. Two CSS-sticky elements remain, which aren't pins: the Projects stage and this cover. No `.pin-spacer` in the DOM.
- **Lighthouse** (production, 12.8.2, three runs per preset): mobile 89, 91, 91 (median 91; LCP 3.5 s, CLS 0); desktop 98, 100, 100 (median 100; LCP 0.7 s, CLS 0). Accessibility, best practices and SEO are 100 in both. Step 07 recorded 92 and 100; step 06 landed after that measurement, so the one-point difference on mobile isn't attributable to this step.
- **Not used any more:** `public/assets/gen/am6-topo-diagonal.png` (the section has no image now). The file is still there.

Studied 3 Oct 2026. Board captures in `board/` first, then each site in Chrome, then the prompt's `npm run refs -- engagement …` commands into `live/<host>/`. No code changed in this pass.

**How it was measured.**
- Chrome was connected. The tab reported `document.visibilityState: "hidden"` the whole time, as in step 07, so it ran no `requestAnimationFrame`. Screenshots, hovers, DOM structure and computed styles worked. `resize_window` to 500px had no effect (the viewport stayed 1512 × 783), so there is no 500px Chrome view.
- thoughtbot sets `scroll-behavior: smooth`, which never advances in a hidden tab. Scrolling there needed `scrollTo({ behavior: "instant" })`.
- Motion, sticky travel and every 390px value come from headless Chromium (Playwright, 1440 × 900 and 390 × 844, the refs script's user agents). The extra captures are `live/trailofbits.com-anatomy-of-a-report/study-*.jpg`.
- Theme: Chrome followed the system setting, which is dark. The capture script renders light. Trail of Bits has both themes with the same layout; its accent is `#ff4b40` on dark and `rgb(208,0,0)` on light. thoughtbot is dark in both.
- The script's own `mobile-flow-*.jpg` for the anatomy page have the cookie banner over the lower half (its Decline button wasn't matched at 390). Use `study-mobile-top/cover/parts.jpg` instead, taken after declining.

**URLs found.** The anatomy page is `https://trailofbits.com/anatomy-of-a-report/`, linked from a panel at the top of `/services/`. The Shaping Sprint page is `https://thoughtbot.com/services/shaping-sprint`.

## Trail of Bits: the anatomy page (the model for this step)

Captures: `live/trailofbits.com-anatomy-of-a-report/desktop-top.jpg`, `desktop-flow-01…05.jpg`, `study-hover-link.jpg`, `study-mobile-top/cover/parts.jpg`. The home page is in `live/trailofbits.com/`.

Values are from Chrome at 1512 × 783 unless marked 1440.

- **Page order.** A hero panel with three facts beside it, then the walk-through (a mock document on the left, eight explanations on the right), then a comparison table, a row of past reports and a closing list of services. 4140px tall in all. The walk-through is 1834px of it.
- **The facts panel states the deliverable as data.** Three stacked cells, 16px padding, hairlines between them. Each cell is three lines:
  - a label: Geist Mono 400, 11px, capitals, +0.04em, grey
  - a value: Geist 400, 28px on 28px, −0.03em (a count, a page length, a percentage)
  - one sentence saying what the value means: 12px on 18px, grey
- **The cover.** It is the first "page" of the mock document.
  - A mono line naming the firm (10px, capitals, +0.06em), then the title (FH Lecturis 400, 26px on 27.3px, −0.025em).
  - Under a hairline with 16px above the rows, a `<dl>` in two equal columns (16px column gap, 8px row gap). Four rows: period, engineers, effort, method.
  - Labels: Geist Mono 400, 10px on 14px, capitals, +0.04em, grey. Values: Geist 400, 12px on 16.8px, right-aligned.
  - Every value is short: a date range, a count, a number of person-weeks, two words. None wraps.
  - One value only, the effort, is set in mono and in the accent colour. It is the page's single highlight, and the first explanation on the right is about that row.
  - A strip under each page carries its name and page number in 9px mono.
- **How each part is labelled and explained** (right column, eight bordered blocks, 16px apart, 20px padding, 1px border, 1px radius, 208–226px tall):
  - a mono header row, 11px capitals: a two-digit index and the part's name on the left, its page number on the right (10px)
  - a one-sentence heading that makes a claim: Geist 500, 22px on 27.5px, −0.025em
  - two or three sentences of explanation: 13px on 20.15px, grey
  - a set-off line under it: 2px left rule, 12px left padding, a 12px mono capitals label, then 12px on 18px text. It always answers the same question (what others do instead).
  - So each part is name → claim → why → one fixed-format line. The fixed line is what makes the eight read as a set.
- **How the page moves through the parts.**
  - Layout: `grid`, columns `1.3fr 1fr` (713px and 549px; 673px and 517px at 1440), 40px gap.
  - The document column is `position: sticky; top: 24px; align-self: start`, CSS only. But it is 1726px tall inside an 1834px grid, so it can travel only 108px. Measured at 1440 × 900: its top holds at 24px from scroll 580 to about 655, then it scrolls away with everything else. In practice the two columns scroll together, and the sticky does nothing a reader would notice.
  - The link between the columns is hover, not scroll. Pointing at an explanation tints the matching part of the document with the accent at 6% alpha and rings its numbered badge; the block's border lightens and its index turns to the accent. Clicking does nothing more: no scroll, no drawer.
  - There is no progress indicator of any kind.
- **Motion, as a timeline.**
  - On load and on scroll: nothing. Opacity stays 1 and transform stays `none` on every block, before and after scrolling. `document.getAnimations()` is empty. No `window.gsap`, no Lenis, no `.pin-spacer`, no `<canvas>`.
  - On hover: 0ms, the document part's tint appears within one frame (no transition on it). 0–150ms, the explanation's border and background ease with `cubic-bezier(0.4, 0, 0.2, 1)`. The badge has 200ms transitions on `box-shadow` and `transform`.
- **Mobile (390 × 844).**
  - One column. The whole mock document comes first (1918px), then all eight explanations (2007px). A reader scrolls past every page of the document before reaching the first explanation, and hover is gone, so the link between the two is lost.
  - The page overflows sideways: the layout is 469px wide in a 390px viewport. The mock document causes it (its offset "stacked pages" layers and rows that won't shrink). The cover's rows stay in two columns of 176px.
  - The heading drops from 68px to 40px. Explanation headings drop from 22px to 18px.

**Take:**
- The cover as a short list of label/value rows in the data face, with hairlines, and one row carrying the only highlight.
- A value on the cover that a part beside it then explains (their effort row and their first part). Ours: the Team row comes from Deploy and the Handover row from Sustain.
- Each part in one fixed shape, ending in the same labelled line every time. For us that line is "You receive".
- CSS sticky with `align-self: start`, no pin, no script.
- No entrance motion needed for this to read well; the content does the work.

**Skip:**
- The two-digit indices and numbered badges (v3: no ordinals). Their page numbers are data; their indices are not.
- The whole mock document with eight pages. Ours is the cover only.
- The hover link between columns. It depends on the badges, and it disappears on touch.
- The "what others do" line. It compares against competitors, which isn't our voice.
- Their mobile order and the sideways overflow.
- Dark panels inside panels, 1px radii, the light 300 display weight.

**Differences from the prompt (the prompt's values stay):**

| Thing | Trail of Bits | Prompt |
|---|---|---|
| Sticky offset | 24px (no top bar while scrolled) | 96px |
| Sticky column width | 56.5% (`1.3fr`) | about 36% |
| Which side explains | right, narrower | right, wider |
| Radius | 1px | 4px |
| Part labels | index + name + page number | name only |
| Progress | none | 1px Driftwood rule, scrubbed |
| Entrance motion | none | `Reveal`, 90ms stagger |

## Trail of Bits: home and Services

Captures: `live/trailofbits.com/desktop-top.jpg`, `desktop-flow-01…03.jpg`.

- A 104px left rail (`sticky; top: 0; height: 100dvh`) holds the navigation. The 55px top bar is not stuck in practice: its parent is only as tall as itself.
- The top bar states the firm as data in mono: counts of publications, audits and repositories, and the founding year.
- Home is 2283px tall and Services is 1468px. Services opens with a panel that previews the report cover (title and effort row, cropped) and links to the anatomy page. The cover is used as the hook.
- No scroll motion, no pins, no canvas.

**Take:** the cover itself is the thing that draws a reader in. **Skip:** the rail navigation and pixel-art icons.

## thoughtbot: the Shaping Sprint phases

Captures: `live/thoughtbot.com-services-shaping-sprint/desktop-at-0…2.jpg`, `mobile-at-0…2.jpg`, and the Services page in `live/thoughtbot.com-services/`.

- **Layout** (1512 wide in Chrome; the same at 1440 with 432px items):
  - A mono eyebrow (JetBrains Mono 700, 18px, warm grey) directly above the heading (Cosmica 700, 36px on 46.8px, −0.01em). 72px from the heading to the first phase.
  - A 12-column grid, 36px column gap, 72px row gap. Each phase spans four columns (456px). Five phases sit as three, then two; the sixth cell is left empty.
- **Each phase is three things:** the name (Cosmica 700, 22.5px on 25.9px), 18px gap, one or two sentences (PP Mori 400, 20.25px on 30.4px), 27px gap, a mono link to that phase's exercises (18px, 700, dotted underline, pale yellow).
- **No numbers and no durations.** The names carry the order, with no index, no "week 1", no arrows between phases.
- **Artifacts: less than the board caption says.** `INDEX.md` records "five phases, each with named artifacts". Live, there is no separate artifact line. The phases name activities. Only one phase (the fourth) lists concrete things a client ends up holding, and it does so inside its sentence; the last phase ends on findings and next steps. So a separate "You receive" line on every stage goes further than this reference does. That is a reason to keep it, and a reason the five draft values need Mehdi's sign-off, since nothing here can be borrowed.
- **Motion.** None on load or scroll: 171 frames sampled while the phases came into view, opacity 1 and transform `none` throughout, no animations. On hover the link's dotted underline goes and its colour deepens, over 150ms `ease-in-out` (the underline is a border). The header is `sticky; top: 0`, 70px, solid, no blur.
- **Mobile (390).** One column, 326px wide with 32px side insets, 64px between phases. Heading 28px on 36.4px, phase names 18px, text 16px on 24px. No sideways overflow. Order and content are unchanged.

**Take:** stage names with no index; one consistent, short closing element per phase; a single stacked column on phones with generous gaps.
**Skip:** the three-and-two grid with an empty cell (ours is one column of parts beside the cover), 20px body text, per-phase links, the dotted underlines.

## thoughtbot: Services

Captures: `live/thoughtbot.com-services/desktop-top.jpg`, `desktop-flow-01…06.jpg`.

- 7101px tall. Each service is a block with a mono eyebrow, a heading, a paragraph, one link and an illustration on the right. One block lists services in three columns of plain links.
- No scroll motion. Nothing sticks except the header.

**Take:** nothing beyond the phase section above. **Skip:** the isometric illustrations.

## What this changes for the build

1. **The cover must be shorter than the viewport, or the sticky does nothing.** Trail of Bits shows the failure: a 1726px sticky column in an 1834px grid travels 108px. With `top: 96px`, the cover has to fit in `100vh − 96px` (804px at 900 tall, 672px at 768 tall). It will, since it is a title and two to four rows, but check a short laptop height as well as 1440 × 900.
2. **The sticky travel is the parts column's height minus the cover's height.** Five short parts could leave very little travel. Give each part enough vertical padding that the cover stays put through all five; measure it in the self-review rather than assume it.
3. **`align-self: start` on the cover.** In a grid, a stretched item has no room to stick.
4. **Navbar clearance.** The navbar is `top: 12px` and 56px tall from 900px, so its lower edge is at 68px. `top: 96px` leaves 28px. No change to the prompt.
5. **The cover's values are sentences, not data.** Trail of Bits' right-aligned two-column rows work because each value is a few characters. "Engineers and a strategist, inside your team" at about 36% width will wrap in that layout. Stack the label over the value, or give the value the wider column and left-align it.
6. **In production the cover has two rows** (Team, Handover) until Length and Effort are confirmed. Design it to look finished with two.
7. **"You receive" without its own left rule.** The reference sets its closing line off with a 2px left rule. Our parts column already has the Driftwood progress rule on its left edge, so a second rule per part would double up. Use the `type-label` alone.
8. **Mobile.** Cover first works for us because it is short; it failed there because the "cover" was the whole document. Keep `min-width: 0` on the cover and let values wrap, to avoid the sideways overflow seen at 390.
9. **The progress rule and the reveals are ours.** Neither reference has them. Neither reference animates this content at all, so keep both quiet.
10. **Current code.** `src/components/sections/Engagement.tsx` still has the horizontal pin (`pin: true`, `scrub: 0.6`). The prompt already removes it.
