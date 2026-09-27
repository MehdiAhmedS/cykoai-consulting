# Step 06 · Offers: rows with terms (decided: board option A)

Read `docs/v3/BRIEF.md` first. This section answers one question: *what exactly can I hire you for?* Each offer is a row stating who it's for and what you get, written as terms rather than adjectives. Step 01 built a plain version from `IndexRow`; this step designs it properly.

## 1. Study the references

Board captures are in `docs/v3/references/offers/board/`. Then go through each site live in Chrome, as the brief describes: hover the offer rows or cards, open anything that expands, and time the expand and collapse with the sampler. Save a record with:

```bash
npm run refs -- offers https://evilmartians.com/services/ai-harness --at="What it takes to start" --mobile
npm run refs -- offers https://www.trailofbits.com --flow=6
npm run refs -- offers https://www.vanta.com --at="It's all here"
npm run refs -- offers https://www.wiz.io --at="Code"
```

On Trail of Bits, find the Services section or page in Chrome (use the menu if the homepage doesn't show it), and capture that URL too.

In `docs/v3/references/offers/NOTES.md`:

- **Evil Martians:** how it states an offer as terms, especially its "From you" / "From us" split. It also lists length and price; Cykoai publishes neither.
- **Trail of Bits:** its one sentence of scope per service.
- **Vanta:** the six-plus-one layout, as a note only.
- **Wiz:** one persistent frame.

Take the terms and the one-line scope. Skip product mockups, colour per tab and carousels.

## 2. The design

- **Tone:** light (`bg-white`, `data-tone="light"`).
- **Header:** `type-label` "Offers", then the `type-h2` heading and `type-lead` intro from `site.ts`, left-aligned, max 22ch and 60ch.
- **The list:** one full-width list ordered by practice (Security, then AI, then Engineering, then Design), with no numbers. Each row is a button that expands in place. Keep every line short; Mehdi asked for brevity.
- **Closed row, desktop,** a grid of `minmax(0,1fr) auto`:
  - Left: the offer name in `type-h3-lg`, the larger `type-h3` that step 07 added, with the "for" line under it in `type-small` n500.
  - Right, aligned to the name's baseline: the practice in `type-label`, and a plus/cross icon drawn with two hairlines, as in v1's `IndexRow`. There's no length or price: Mehdi wants the copy short.
- **Expanded row:** a two-column definition grid (one column on mobile) with:
  - **You get:** from `site.ts`.
  - **From you:** a new field, `fromYou`, "TBC" for now.

  Labels in `type-label`, values in `type-body`. Fields that are TBC or draft render with a DRAFT chip in dev and are not rendered at all in production.
- **Rules and hover:** hairline `n150` separators. On hover or focus, the row's top rule turns Driftwood and the title shifts to `n700`. Colour and rule changes only; nothing slides.
- **Mobile:** the name, the "for" line, then the practice in mono underneath. The icon stays on the right, and the expanded content stacks.
- **Motion:** rows use `Reveal` on entry with a 60ms stagger. Expand and collapse is 300ms `ease-out-expo` using the `grid-template-rows` technique. Instant under reduced motion.
- **Accessibility:** `aria-expanded` and `aria-controls` on each row button, and the region labelled by the offer name. Keyboard works (Enter and Space). Multiple rows can be open at once.

## 3. Content

- Add `fromYou: "TBC"` to every offer in `site.ts`.
- Keep every existing draft as written. The six offers follow Mehdi's capability list (see the brief).
- Don't invent deliverables, prices or durations.

## 4. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/06-offers`, with `--section=#offers`). Capture it expanded and collapsed at 1440 and 390. Compare it with the Evil Martians and Trail of Bits captures in NOTES.md: does each row read as terms a buyer could act on?

Commit: `v3(06): offers as rows with terms`. The report lists every TBC and draft field in this section.

## Acceptance

- Six offer rows ordered by practice, with no numbers and no durations. Each shows its "for" line when closed and expands to You get / From you.
- Unconfirmed fields are hidden in production and flagged in dev.
- Hover and focus are colour and rule changes only, with correct ARIA and keyboard behaviour. Reduced motion is instant, and mobile works.
