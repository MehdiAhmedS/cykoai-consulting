# Step 09 · Standards: rules as constraints, plus frameworks (decided: board option A)

Read `docs/v3/BRIEF.md` first. This section answers *why trust you with access to our systems?* It replaces v1's four adjectives (fluent, scrutiny-proof, skin in the game, fast but careful) with things a security buyer can check: rules Cykoai keeps, the frameworks it works to, and who does the work. It's the one home for "security designed in" and "it holds up under scrutiny".

## 1. Study the references

Board captures are in `docs/v3/references/standards/board/`. Then go through each site live in Chrome, as the brief describes: scroll through each principles or values section and note its rhythm, spacing and how entries are labelled. Save a record with:

```bash
npm run refs -- standards https://oxide.computer/principles --flow=4
npm run refs -- standards https://www.anthropic.com/company --at="What we value"
npm run refs -- standards https://cure53.de --at="Publications"
```

In `docs/v3/references/standards/NOTES.md`, cover:

- **Oxide:** it frames principles as constraints rather than aspirations. Note the framing; don't reuse its words.
- **Anthropic:** its entry rhythm (label, one-line claim, short explanation) and spacing.
- **Cure53:** its operational rule of publishing reports only at the client's request, which is the kind of rule this section wants.

Skip ethics-only principles, serif body text and numbered entries.

## 2. The design

- **Tone:** light (`bg-n50`, `data-tone="light"`).
- **Header:** `type-label` "Standards", the `type-h2` heading and `type-lead` intro from `site.ts`. Add one framing line in `type-body` n500, as a draft: "Rules, not values: each one is something you can check."
- **Rules:**
  - A two-column grid on desktop, one column on mobile. Each entry has a 1px `n150` top rule, the rule name in `type-h3`, and its one-line meaning in `type-body` n700. No numbers, no icons.
  - The rules come from `site.ts`, all drafts for Mehdi to confirm. Only confirmed rules render in production; dev shows every rule with DRAFT chips.
- **Frameworks strip:** below the rules, a full-width band between two `n150` hairlines. A `type-label` "Frameworks and platforms", then the items in `type-data`, separated by hairline dividers: ISO/IEC 27001, Google Workspace, Google Vertex AI, Docker (from `site.ts`, drafts until Mehdi confirms). Add further items only when he confirms them. No logos, and no certification claims: ISO/IEC 27001 appears as a framework Cykoai implements controls for, not a certificate it holds.
- **Who does the work:** a slot for the team, with names, roles and credentials. The content is TBC: build the layout (a simple list of `type-h3` name, `type-small` role, `type-data` credentials) but render it only when `site.ts` has confirmed entries. In dev, show one DRAFT placeholder row explaining what's needed.
- **Motion:** entries `Reveal` with a 60ms stagger. Nothing else.

## 3. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/09-standards`, with `--section=#standards`). Check that the production build hides every unconfirmed rule, the team slot and any unconfirmed framework items. Build once with `NODE_ENV=production` and screenshot to prove it.

Compare the rule entries with the Anthropic and Oxide captures: are they operational and checkable, rather than values? Grep the page copy and record in NOTES.md that the security-first and scrutiny claims now live only here.

Commit: `v3(09): standards as rules and frameworks`.

## Acceptance

- Rules render as constraints in a two-column grid, only confirmed ones in production, with no numbers or icons.
- The frameworks strip shows confirmed items only, and the team slot is hidden until confirmed.
- The illustrative engagement note and stat strip are nowhere on the page, and this is the only home of the security-first and scrutiny claims.
