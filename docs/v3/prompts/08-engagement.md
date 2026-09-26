# Step 08 · Engagement: the deliverable anatomy (decided: board option A)

Read `docs/v3/BRIEF.md` first. This section answers *what happens after I get in touch?* with mechanics, not adjectives: who's on it, exactly what the client receives at each stage, and how long it takes once Mehdi confirms a typical length. It's also the one home for "we work inside your team", "engineers and strategists" and "you own it when we leave". Trail of Bits' "Anatomy of a report" is the model: a cover that states effort as data, then each part of the deliverable and the job it does.

## 1. Study the references

Board captures are in `docs/v3/references/engagement/board/`. Then capture them live:

```bash
npm run refs -- engagement https://www.trailofbits.com --flow=4
npm run refs -- engagement https://thoughtbot.com/services --flow=6
```

Find Trail of Bits' "Anatomy of a report" page (linked from its Services area; the board captures show it) and capture that URL with `--flow=10 --mobile`. Find thoughtbot's Shaping Sprint page and capture it with `--at="What happens in a Shaping Sprint"`.

In `docs/v3/references/engagement/NOTES.md`, cover:

- how the cover states the period, team and effort as data
- how each part is labelled and explained, and how the page moves through the parts
- thoughtbot's one named artifact per phase. It gives no durations; Cykoai doesn't publish any yet either, so the cover's Length row stays hidden in production until Mehdi confirms one.

Don't copy text or structure names.

## 2. The design

- **Tone:** light (`bg-white`, `data-tone="light"`).
- **Header:** `type-label` "Engagement", the `type-h2` heading and `type-lead` intro from `site.ts`.
- **Desktop layout, a two-column grid:**
  - **Left, the cover:** `position: sticky` (CSS only; not a GSAP pin), `top: 96px`, about 36% wide. It's styled as a document cover:
    - 1px `n150` border, 4px radius, `n50` background, generous padding
    - a `type-label` title: "A typical engagement"
    - then `type-data` label/value rows with hairlines between them:

    | Row | Value | Status |
    |---|---|---|
    | Length | TBC | |
    | Team | "Engineers and a strategist, inside your team" | draft; derived from the confirmed Deploy line |
    | Effort | TBC | |
    | Handover | "Your team runs it" | draft; derived from the confirmed Sustain line |

    TBC rows are hidden in production and shown with DRAFT in dev.
  - **Right, the parts:** the five stages from `site.ts` (Assess, Align, Design, Deploy, Sustain). Each part has:
    - the stage name in `type-h3`
    - its confirmed description in `type-body`
    - a "You receive" line: `type-label` label plus a `type-body` value
    - a hairline above each part
    - no numbers; the stage names carry the order
- **Artifacts:** add a `receive` field to each stage in `site.ts`, as drafts for Mehdi to confirm:

  | Stage | You receive (draft) |
  |---|---|
  | Assess | "A current-state map" |
  | Align | "Scope and business case" |
  | Design | "Architecture and security plan" |
  | Deploy | "A working system, built with your team" |
  | Sustain | "Runbook, measures and handover" |

- **Progress rule:** a 1px Driftwood rule runs down the left edge of the parts column. It's scrubbed with scroll through ScrollTrigger (`scaleY` from 0 to 1, `transform-origin: top`), so the reader sees how far through the engagement they are. No pin: remove v1 Process's horizontal-scroll pin entirely, which frees a pin in the ≤2 budget.
- **Mobile (<900px):** the cover sits on top, not sticky, then the parts stacked. No progress rule.
- **Motion:** parts `Reveal` on entry, 90ms stagger, opacity and y only. Under reduced motion, everything is static and the progress rule is fully drawn.

## 3. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/08-engagement`, with `--section=#engagement`). Also check:

- the sticky cover while scrolling through all five parts at 1440, with no overlap with the navbar
- the progress rule tracking scroll
- the mobile stacking
- that this is the only section with "inside your team", "engineers and strategists" and ownership wording: grep the page copy and record the results in NOTES.md
- the pin count on the page, recorded in NOTES.md

Commit: `v3(08): engagement as a deliverable anatomy with a sticky cover`.

## Acceptance

- A sticky cover (CSS) states length, team, effort and handover as data, with TBC values hidden in production.
- Five parts, each with its description and a "You receive" line, and no numbering.
- The progress rule is scrubbed on desktop, the old horizontal pin is gone, reduced motion and mobile are correct, and each claim lives only here.
