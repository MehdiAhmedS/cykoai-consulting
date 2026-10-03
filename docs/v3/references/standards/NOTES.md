# Standards: rules as constraints, plus frameworks

**Build plan (approved 3 Oct 2026).**
- **Decisions (Mehdi, 3 Oct).** Three rules and the four frameworks are confirmed. The framing line is "Each one is something you can check.", in place of the prompt's "Rules, not values: …" (see copy points 1 and 2 below). "Every deliverable ships complete" is removed; a draft rule, "Security is part of the design", takes its place and carries the security-designed-in claim.
- **Content:** `site.ts` gains `isShown(status)`, `standards.framing`, per-item status on `frameworks.items` with a `frameworks.label`, and `standards.team` (label, a dev-only placeholder, `members`) in place of `credentials`.
- **Section:** `Standards.tsx` stays a server component. Header as in Engagement, then the rules as a grid (one column, two from 900px), each a hairline, the name in `type-h3` and the meaning in `type-body` n700, 8px apart. Below it the frameworks strip between two hairlines: a label, then the items in `type-data` with hairline dividers. Then the team slot. The AM-5 cube and its parallax leave the section.
- **Gating:** rules, framework items and team members render in production only when confirmed. The strip and the team slot render nothing when they have nothing to show.
- **Motion:** `Reveal` only, `delay = i × 0.06` on the rules.

**Build results (3 Oct 2026).** Screenshots are in `docs/v3/after/09-standards/`: the full page and `standards-*` at 390, 768 and 1440, each also with `-rm` (reduced motion) and `-noassets`; `prod/standards-*` is the production build. Console clean in every run.
- **Layout.** Measured in headless Chromium, dev and production. At 1440 the rules are two columns of 561px, 86px apart; the two entries of a row share a top and a height (162px), so names align. At 768 and 390 they are one column (the grid goes to two at 900px). Name to meaning is 8px at every width. No sideways scroll at any width (`scrollWidth` equals the viewport).
- **Frameworks strip.** One row with 1px `n150` vertical dividers at 768 and 1440; stacked with horizontal hairlines at 390 (the row starts at 640px). The label sits above the items at every width: beside them it does not fit at 768.
- **Heading.** One line at 1440 and 768. Two lines at 390 ("The rules / we work by."), with no stranded fragment.
- **Production proof.** `prod/standards-1440.png`, `-768.png`, `-390.png`. The production HTML has the three confirmed rules and the four frameworks, and none of: "DRAFT", "Security is part of the design", "Who does the work", the team placeholder, "Every deliverable ships complete". With three rules the last grid cell is empty, as planned. Dev shows four rules, the team slot with its placeholder row, and DRAFT chips.
- **Reveals.** Opacity and `translateY` only (24px → 0), 667–675ms each, a strong ease-out (83% of the way after a quarter of the time). The two entries of a row start 58ms apart. Timed while wheel-scrolling; a jump straight to the section (`scrollTo`) completes the tweens early, which is a test artefact, not what a visitor gets. Under reduced motion every entry is at opacity 1 with no transform from the start.
- **Nothing else moves.** The section has no `data-speed`, no pin, no image, canvas or SVG. `am5-monogram-cube.png` is now used by the footer only.
- **Chrome pass.** `http://localhost:3000/#standards` in a new tab, closed after. The tab was hidden again (no frames), so it confirmed layout and that hovering a rule does nothing; the timings above are from headless Chromium.
- **Claims.** `grep -rniE "scrutin|designed in|security plan|security-first|secure by|from the start|bolted|illustrative" src`:
  - Security designed in: only the draft rule "Security is part of the design" in Standards. It is hidden in production until Mehdi confirms it, so on the live site the claim has no line yet. The Engagement stage "Design" names an "Architecture and security plan" as a deliverable, which is a thing received, not the claim.
  - Scrutiny: the word appears nowhere in `src`. The claim is carried by this section as a whole (rules that can be checked, frameworks worked to), not by a sentence.
  - "Illustrative": no hit. `ui/StatStrip.tsx` still exists but nothing imports it. Neither is on the page.
- **Rules against the references.** All four name an actor, a moment or trigger, and a thing, which is the Cure53 test; none is a value in the Anthropic sense, and none uses an adjective about Cykoai.
- **Lighthouse** (production, 12.8.2, three runs per preset): mobile 89, 89, 90 (median 89; LCP 3.5 s, CLS 0); desktop 100, 100, 100 (LCP 0.7 s, CLS 0). Accessibility, best practices and SEO are 100 in both. Step 08 recorded a mobile median of 91 with the same LCP; this step removes an image and adds only text, and the screenshot runs shared the machine, so the two points are within run-to-run noise.

Studied 3 Oct 2026. Board captures in `board/` first, then each site in Chrome, then the prompt's `npm run refs -- standards …` commands into `live/<host>/`. No code changed in this pass.

**How it was measured.**
- Chrome was connected. Values are from Chrome at 1512 × 785 unless marked. The tab reported `document.visibilityState: "hidden"` the whole time, as in steps 07 and 08, so it ran no `requestAnimationFrame` and timers were throttled to one second. Screenshots, scrolling, hovers, DOM structure and computed styles worked. The motion sampler could not run.
- `resize_window` to 500px had no effect on the viewport (`outerWidth` 784, `innerWidth` still 1512), so there is no 500px Chrome view. The 390px view comes from a second run of the refs script with `--mobile` (`mobile-top.jpg`, `mobile-at-0…2.jpg` in each folder).
- Motion: no reveal was found in any of the three sections. The evidence: no `document.getAnimations()` entries on any page; Anthropic's entries read opacity `1` and transform `none` before and after scrolling in; and the headless captures that were opened (`desktop-at-0.jpg` and `mobile-at-0.jpg` for each site) show the entries fully drawn. Because the tab was hidden, Chrome alone could not rule out a script-driven reveal; the headless captures are the stronger evidence.
- The 390px values below (insets, heading size) are read from the `mobile-*.jpg` captures, not computed styles.
- Theme: Chrome followed the system setting, which is dark. Oxide is dark in both themes, Anthropic and Cure53 are light in both, so the captures match what Chrome showed.
- Libraries: none of the three has GSAP, ScrollTrigger, Lenis, a `.pin-spacer` or a `<canvas>`.
- Oxide's cookie banner covers the lower part of `mobile-at-0.jpg` and a corner of `desktop-at-0.jpg`. The script did not match its "Reject optional" button. Chrome showed no banner.

## Oxide: principles as constraints

Captures: `live/oxide.computer-principles/desktop-top.jpg`, `desktop-flow-01…04.jpg`, `desktop-at-0…2.jpg` (the Principles block), `mobile-*.jpg`. `manifest.json` holds the `--probe` values.

1. **The framing is one sentence, placed before the list.** The page has three lists (mission, principles, values). Each opens with a heading and one or two intro lines; the Principles intro says, in a single sentence, that these are limits the company holds to in every condition and not goals it hopes to reach. Nothing else on the page repeats it. The list that follows is three entries only. The framing works because it is short, said once, and sits directly above the thing it frames.
2. **One narrow column.** Heading, intro and entries share a 692px column at x = 461 (columns 4–10 of 12). Body lines run to about 75 characters. Entries stack; there is no grid.
3. **Type.** SuisseIntl 400 and 500, plus GT America Mono 400 for the nav (12px, capitals, +0.64px). Heading 36/42, weight 400, −0.468px. Intro 18/24, weight 400, in the secondary grey. Entry name 18/24, weight 500, in the primary colour. Entry text 18/24, weight 400, secondary grey. Name and text are the same size; only weight and colour separate them.
4. **Spacing.** Heading to intro 16px; between intro paragraphs 16px; intro to first entry 58px. Name to text 8px. Entry to entry 40px (`mb-10`), so the pitch is 162–186px depending on the text's line count. Entry texts are 70–230 characters, two to four lines.
5. **Entry marker.** A 16px green icon in a 40px gutter left of the name, with a 1px dark-green vertical line running down to the next icon. The icon is dimmed while its entry is in the lowest part of the viewport and takes the accent colour once it is higher up (a 150ms `color` transition, `cubic-bezier(0.4, 0, 0.2, 1)`). That is the only thing that changes on scroll. Hovering an entry does nothing.
6. **Mobile (390).** The same single column with 20px side insets; heading drops to about 20px; icon gutter narrows to about 32px. No layout change beyond that.

**Take:** say the framing once, in one line, directly above the rules. Name and text at one size, separated by weight and colour. A short list.
**Skip:** the icons and the vertical line (the prompt says no icons), the scroll-linked colour, the single narrow column (the prompt wants two columns), the two-tone statement at the top of the page, and its words.

## Anthropic: label, one-line claim, short explanation

Captures: `live/anthropic.com-company/desktop-top.jpg`, `desktop-at-0…2.jpg`, `mobile-*.jpg`.

1. **Heading left, entries right.** A 12-column grid, 1272px wide, 32px gutters. The heading block (heading plus a six-line intro) is 493px wide in columns 1–5. The entries start 652px to the right, in columns 7–12, as a two-column grid: columns of 294px, 32px column gap, 24px row gap. The heading block is `position: static`; it scrolls away while the entries continue, leaving the left half empty for most of the section.
2. **Entry rhythm.** Three parts, 8px apart: a number label (14/16.8, sans, +0.15px), the claim as an `h3` (25/30, weight 600, sans), then the explanation (15/21, weight 400, serif). The claim is a full sentence with a full stop, verb first, 21–35 characters, one or two lines at 294px. The explanation is about 430 characters, twelve lines at about 41 characters per line.
3. **Rows align.** The two entries in a row share a height (315, 324, 303px), so claims line up across columns even when one wraps to two lines. Seven entries: the last row has one entry and an empty cell.
4. **One colour.** Everything is `rgb(20,20,19)` on `rgb(250,249,245)`. Hierarchy comes from size, weight and face only; there is no grey text.
5. **Section edges.** 48px padding above and below, and a 1px hairline the full 1272px between sections. Heading 32/38.4, weight 600; heading to intro 12px.
6. **Motion.** None in the section. The navbar is fixed; on scroll the wordmark collapses to the mark.
7. **Mobile (390).** One column, 32px side insets: heading (two lines), intro, then each entry at full width in the same label, claim, explanation order.

**Take:** the three-step rhythm with tight 8px steps, the claim written as a short sentence that can stand alone, rows that share a height so names align, and a hairline between blocks. For Cykoai the label step is dropped (no numbers), which leaves rule name then one-line meaning, as the prompt has it.
**Skip:** the numbers, the serif, twelve-line explanations, and the static left column that leaves half the screen empty.
**Differences from the prompt (prompt wins):** Anthropic separates entries with space only; the prompt gives each entry a 1px `n150` top rule. Anthropic's entry text is one colour; the prompt uses `n700` for the meaning and `n500` for the framing line.

## Cure53: an operational rule, stated next to its evidence

Captures: `live/cure53.de/desktop-top.jpg`, `desktop-at-0…2.jpg`, `mobile-*.jpg`. The prompt's `--at="Publications"` matches the nav link first, which is already in view, so all three captures showed the top of the page. They were retaken with `--at="Download articles and papers"` (the section's own sub-heading), and `desktop-at-0.jpg` now shows the Publications header, the rule and the first rows. In Chrome the page was scrolled to `#publications` directly.

1. **The rule.** The Publications section opens with one sentence, 231 characters over three lines, before any list. It says that every report shown was published because the project's maintainers, or whoever paid for the test, asked for it. It names who decides (the client), what triggers it (an explicit request) and what it applies to (reports). A reader can test it: the 168 links below are the reports those clients chose to release.
2. **Where it sits.** Directly under the section header and above the list it governs, set in bold (Helvetica/Arial 15/24, weight 700, `rgb(64,63,62)`), indented 316px so it aligns with the second of three columns. It is the only prose in the section.
3. **A second rule, as a badge.** A round sticker fixed to the top right of every page states three things the site does not do (cookies, trackers, ads). The form is a checkable negative: a visitor can open the network panel and confirm it.
4. **The list as data.** Two 472px columns in a fixed 945px page. Rows are 35px, 12px text, the report name in weight 700 and the date in weight 400 on the same line, with a 1px black hairline between rows. Hovering a row underlines it, with no transition. Section headers are 36px, weight 700, each with a 1px rule beneath.
5. **Motion.** None. No web fonts load.
6. **Mobile (390).** The page is not responsive: it keeps the 945px layout, so the right-hand column runs off the screen.

**Take:** the shape of a rule a security buyer can check: who decides, what triggers it, what it covers, in one sentence, with no adjectives. Hairline rows of name plus data are a fair model for the frameworks strip.
**Skip:** the bold body text, the gradient sticker, the fixed-width page, the morse-code ornaments, and the density.

## What this means for the build

**The test for a rule.** From Cure53 and Oxide together: a rule passes if a client could catch Cykoai breaking it. It names an actor, a trigger or a moment, and a thing. The four drafts in `site.ts`, against that test:

| Draft rule | Checkable? | Note |
|---|---|---|
| Access ends at handover | Yes | A date and an account list can be checked. |
| Every finding ships with a fix | Yes | Visible in the report. |
| Your findings stay yours | Yes | The Cure53 shape: who decides, what triggers publication. |
| Every deliverable ships complete | Weak | "Complete" and "the same structure every time" are qualities, not something a client can catch being broken. |

**Layout.**
- Rule name and meaning 8px apart; entries 40px or more apart. At two columns the drafts' meanings (about 70 characters) fit one or two lines, far shorter than Anthropic's twelve, so the grid will read as a compact register, not as cards. Use the full container width for the grid; do not copy Anthropic's half-empty left column.
- Let the two entries of a row share a height (grid rows, not two independent stacks), so the top rules and names align.
- Production renders confirmed rules only, so the count can be odd. Anthropic leaves the last cell empty and it reads fine; do the same, and do not stretch the last entry.
- The frameworks strip follows Cure53's row logic: plain text items, hairline dividers, no logos.

**Motion.** No reference animates this content. The prompt's `Reveal` with a 60ms stagger is already the most motion in the set; add nothing to it.

**Copy points for Mehdi (found in this pass).**
1. **Three lines say one thing.** The heading ("The rules we work by."), the intro ("What you can hold us to, and the frameworks we work to.") and the prompt's new framing line ("Rules, not values: each one is something you can check.") all make the same point. Oxide says it once. The brief's first problem is repeated claims, so one of the three should go or the intro should carry only the frameworks half.
2. **The framing line's shape.** "Rules, not values" uses the same "these are X, not Y" turn as Oxide's sentence. The words differ, but it is that page's distinctive device. A positive form avoids it, for example "Each one is something you can check."
3. **A claim with no rule.** The brief gives "Security designed in from the start" its one home here, "as a rule". None of the four draft rules carries it.
4. **Production may be empty.** Every rule and the frameworks list are drafts, and the team list is empty. Under the prompt's own rule, a production build today shows the Standards header with nothing beneath it, while the navbar still links to it. The build needs a decision for that state.
