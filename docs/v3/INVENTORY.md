# v3 inventory: the v1 page as of tag `v1-before-v3`

Written in step 00 from `redesign/v1` at `c3f1aeb` (tagged `v1-before-v3`), after the taste-pass leftovers were parked on `wip/taste-leftovers`. Baseline screenshots: `docs/v3/before/`. "v3 home" follows the section table in `docs/v3/BRIEF.md`.

## Page order

`src/app/layout.tsx` wraps everything in `SmoothScroll`, then renders `Navbar`, the page, and `Footer`. `src/app/page.tsx` renders the sections in this order:

| # in DOM | Component | File | id | Background | v3 home |
|---|---|---|---|---|---|
| — | Navbar | `src/components/layout/Navbar.tsx` | (header) | `bg-windsor` | Navbar (step 03) |
| 1 | Hero | `src/components/sections/Hero.tsx` | `top` | `bg-windsor` | Hero |
| 2 | WhatWeDo | `src/components/sections/WhatWeDo.tsx` | `what-we-do` | `bg-white` | Offers |
| 3 | Services | `src/components/sections/Services.tsx` | `services` | `bg-white` | Offers |
| 4 | WhyCykoai | `src/components/sections/WhyCykoai.tsx` | `why` | `bg-n50` | Standards (claims); Engagement ("Skin in the game"); note and stats cut |
| 5 | NameStory | `src/components/sections/NameStory.tsx` | `name` | `bg-windsor` | The name |
| 6a | RingsInterstitial | `src/components/sections/Philosophy.tsx` | (none, `aria-hidden`) | `bg-n50` + AM-2 image | cut (no home in the brief's table) |
| 6b | Philosophy | `src/components/sections/Philosophy.tsx` | `philosophy` | `bg-windsor` | cut; its last line goes to The name |
| 7 | Process | `src/components/sections/Process.tsx` | `process` | `bg-n50` | Engagement |
| 8 | Contact | `src/components/sections/Contact.tsx` | `contact` | `bg-white` | Contact |
| — | Footer | `src/components/layout/Footer.tsx` | (footer) | `bg-windsor` | Footer (dark tone) |

No section carries `data-tone` yet. Three carry `data-band-fade` (NameStory `#F9F9FA`, Philosophy `#F9F9FA`, Footer `#FFFFFF`); see Motion.

## Sections, components and strings

Strings are verbatim from the source. `&rsquo;` is written as ’.

### Navbar — `src/components/layout/Navbar.tsx`

- **Components:** `LogoMark`.
- **Behaviour:** sticky, solid Windsor, 64px, `border-white/8` hairline. Below 900px, a burger opens a full-screen Windsor overlay (focus trapped, Lenis stopped, Escape closes).
- **Links (`LINKS`):** `#what-we-do` "What we do", `#services` "Services", `#process` "How we work".
- **Strings:**
  - "CYKOAI" (wordmark), "CONSULTING" (mono tag)
  - "What we do", "Services", "How we work"
  - "Talk to us" (desktop CTA, `#contact`), "Talk to us" (mobile overlay CTA)
  - Mobile overlay: "01", "02", "03" before each link (generated, see Ordinal numbering)
  - aria: "Main", "Mobile", "Open menu" / "Close menu"; logo image alt "Cykoai"

### Hero — `src/components/sections/Hero.tsx` · id `top` → Hero

- **Components:** `WorldCanvas` (inside a `data-speed="0.93"` wrapper), `Button` (`variant="inverse"`).
- **Strings:**
  - Eyebrow: "FORWARD-DEPLOYED CONSULTING — AI · CYBERSECURITY"
  - H1: "The future moves faster than" + "your organization." (second part in `text-n500`)
  - Lede: "We deploy inside organizations anywhere change is outpacing them — engineers and strategists together, building until it holds."
  - Buttons: "Talk to us" (`#contact`), "See how we work" (`#what-we-do`)
  - Caption (hidden below 900px): "DEPLOYED WHERE CHANGE HAPPENS" / "ORIGIN — MUSCAT ·" "23.59° N, 58.38° E"

### What we do — `src/components/sections/WhatWeDo.tsx` · id `what-we-do` → Offers

- **Components:** `MonoLabel` (`index="01"`), `SplitText`, `Reveal`, `GenImage` (AM-6 `am6-topo-diagonal.png` at 13% opacity).
- **Layout:** sticky statement left, four hairline rows right (`PILLARS`).
- **Strings:**
  - Label: "What we do"
  - H2: "One firm across the full stack of technological change."
  - Body: "Most firms specialize in a single layer — a model, a network, an audit. We operate across all of them at once, because in practice they are never separate problems." + bold "Adoption fails at the seams."
  - Pillars (title / description):
    - "Intelligence systems" / "AI strategy and enterprise AI built on real workflows — not demos. We design systems that hold up under production load and scrutiny."
    - "Security & resilience" / "Cybersecurity woven into architecture from day one, so adoption never outpaces your ability to defend what you've built."
    - "Architecture & strategy" / "Enterprise architecture and technology strategy that turn ambition into a sequence of decisions your teams can actually execute."
    - "Velocity & automation" / "Automation, productivity, and digital transformation programs that compound — each one making the next easier to ship."

### Services — `src/components/sections/Services.tsx` · id `services` → Offers

- **Components:** `MonoLabel` (`index="02"`), `SplitText`, `Reveal`, `IndexRow` ×7 (expandable rows).
- **Strings:**
  - Label: "Services"
  - H2: "Seven disciplines. One point of accountability."
  - Aside: "Engage us for one discipline or all seven — every engagement is staffed by people who’ve shipped the thing, not just advised on it."
  - Rows (index / title / detail):
    - "01" / "AI Strategy" / "From possibility to roadmap — where AI creates defensible advantage for your business, and where it doesn't."
    - "02" / "Cybersecurity" / "Defend the surface area you're creating. Security designed alongside adoption, never bolted on afterward."
    - "03" / "Enterprise AI" / "Production-grade intelligence systems — evaluated, monitored, and owned by your teams, not a vendor."
    - "04" / "Automation" / "Remove friction at scale. Automation programs that compound, freeing your best people for higher judgment work."
    - "05" / "Digital Transformation" / "Modernize without breaking what already works. Sequenced change your organization can actually absorb."
    - "06" / "Enterprise Architecture" / "Structure built for change, not just for today. Systems that stay coherent as they scale."
    - "07" / "Technology Advisory" / "An outside perspective your board can trust — clear-eyed, independent, and fluent in what's actually happening in the field."
  - Row titles are title case ("AI Strategy", "Digital Transformation"), against the sentence-case rule.

### Why Cykoai — `src/components/sections/WhyCykoai.tsx` · id `why` → Standards (+ Engagement)

- **Components:** `MonoLabel` (`index="03"`), `SplitText`, `Reveal`, `EngagementNote`, `StatStrip`, `GenImage` (AM-5 `am5-monogram-cube.png` in a `data-speed="0.88"` wrapper, hidden below `lg`).
- **Strings:**
  - Label: "Why Cykoai"
  - H2: "Confidence is earned by people who’ve done the work before."
  - Benefits (generated index "01"–"04" / title / description):
    - "Fluent in both worlds" / "Our people have shipped production AI systems and defended enterprise networks. We translate between the technical and the boardroom without losing precision on either side." → Engagement (who's on it)
    - "Built to survive scrutiny" / "Every recommendation is stress-tested against security, governance, and regulatory reality — so what we build together holds up in an audit, not just in a demo." → Standards
    - "Skin in the game" / "We stay through implementation. Forward deployed means our teams sit inside yours, accountable for outcomes — not a slide deck handed off at the door." → Engagement (per the brief's table)
    - "Speed without recklessness" / "Momentum matters, but so does control. We move quickly toward decisions that are reversible, and carefully toward the ones that aren't." → Standards (as a rule) or cut
  - `EngagementNote` strings (→ cut; the brief removes the "Illustrative" note):
    - Header: "ENGAGEMENT NOTE", "ILLUSTRATIVE" "· N–014"
    - "W01" "Deployed: two engineers, one strategist, inside the client’s risk team."
    - "W06" "Fraud-triage agent in production. Review time down 63%."
    - "W11" "Security review passed. Zero critical findings."
    - "W14" "Handoff complete — their team runs it now."
    - Footer: "OUTCOME — OWNED BY THE CLIENT"
    - aria-label: "Illustrative engagement note"
  - `StatStrip` strings (→ cut; unverified numbers, marked `TODO(mehdi)` in source):
    - "2 – 4" "PEOPLE, DEPLOYED INSIDE"
    - "< 90" "DAYS TO PRODUCTION"
    - "100%" "OWNED BY YOUR TEAM"

### The name — `src/components/sections/NameStory.tsx` · id `name` → The name

- **Components:** `MonoLabel` (`index="04"`, `tone="inverse"`), `Reveal`, `RingField` (`count={3} accentIndex={2} tone="inverse"`) in a `data-speed="0.88"` wrapper.
- **Strings:**
  - Label: "The name is the operating model"
  - Cells (syllable / body):
    - "cy·" / "From cyber-security. Defense is never bolted on — it is where every engagement begins."
    - "ko·" / "The sound of the koi and the heart of the sequoia — agility against constant flux, resilience against the test of time."
    - "ai" / "Applied intelligence — deployed inside your organization, owned by your teams."

### Rings interstitial — `RingsInterstitial` in `src/components/sections/Philosophy.tsx` → cut

- **Components:** `GenImage` (AM-2 `am2-rings-plaster.png`, `grade`). `aria-hidden` section, 46vh, no id, no text.

### Philosophy — `src/components/sections/Philosophy.tsx` · id `philosophy` → cut (last line → The name)

- **Components:** `SectionLabel` (`index="05"`, `tone="inverse"`), `GenImage` (AM-1 `am1-monolith.png` at 10%, in a `data-speed="0.92"` wrapper). Pin 1 of 2 (see Motion).
- **Strings:**
  - Label: "Our philosophy"
  - Lines: "Technology changes faster than organizations." / "Organizations become anxious." / "Anxious organizations make poor decisions." / "Cykoai creates clarity." (accent line, driftwood underline)
  - The first line restates the hero headline, as the brief notes.

### How we work — `src/components/sections/Process.tsx` · id `process` → Engagement

- **Components:** `SectionLabel` (`index="06"`), `GenImage` (AM-6 at 8%). Horizontal pin (pin 2 of 2) at ≥900px with a driftwood progress rule; stacked cards below that or under reduced motion.
- **Strings:**
  - Label: "How we work"
  - Steps (index / title / description):
    - "01" / "Assess" / "We map where your organization actually stands — technically, operationally, and culturally — against where you intend to go."
    - "02" / "Align" / "Strategy and business case, built together with the executives who'll be accountable for the outcome."
    - "03" / "Design" / "Architecture with security, governance, and scale considered from the first sketch — not bolted on afterward."
    - "04" / "Deploy" / "Forward-deployed engineers and strategists work inside your teams, shipping the thing rather than presenting it."
    - "05" / "Sustain" / "We instrument, measure, and hand off a system your teams can run and evolve long after the engagement ends."

### Contact — `src/components/sections/Contact.tsx` · id `contact` → Contact

- **Components:** `SectionLabel` (`index="07"`), `SplitText`, `Reveal`, `Button` (`variant="solid"`, submit). Posts JSON to `/api/contact` (never touched).
- **Strings:**
  - Label: "Get in touch"
  - H2: "Let’s shape what’s next."
  - Body: "Tell us where your organization is headed, and where it feels stuck. We typically respond within one business day."
  - Email: "info@cykoai.com"; note: "For press and partnerships, same address."
  - Placeholders: "Full name", "Company", "Work email", "What are you trying to solve?"
  - Button: "Send message" / "Sending…"
  - Status: "Thanks — we'll be in touch shortly." (success); error text comes from the API or "Something went wrong."

### Footer — `src/components/layout/Footer.tsx`

- **Components:** `LogoMark`, `GenImage` (AM-5 in a `data-speed="0.94"` wrapper, hidden below `lg`), a 45° hairline div.
- **Strings:**
  - "Cykoai" (wordmark beside the mark)
  - "Forward deployed AI and cybersecurity consulting for organizations shaping the future instead of reacting to it."
  - "Talk to us" (`#contact`)
  - Column "Company": "What we do" (`#what-we-do`), "Services" (`#services`), "Philosophy" (`#philosophy`), "Process" (`#process`)
  - Column "Connect": "info@cykoai.com"
  - "CYKOAI" (oversized wordmark, `aria-hidden`)
  - "© {year} CYKOAI CONSULTING. ALL RIGHTS RESERVED." / "DESIGNED AND BUILT IN-HOUSE."

### Metadata — `src/app/layout.tsx`

- Title: "Cykoai — Forward Deployed AI & Cybersecurity Consulting" (template "%s — Cykoai")
- Description: "Cykoai is a forward deployed AI and cybersecurity consulting firm helping enterprises adopt disruptive technology with confidence — AI strategy, security, architecture, and transformation."
- OG description: "We help organizations stop reacting to technological change and start shaping it."
- Keywords: "AI consulting", "cybersecurity consulting", "enterprise AI", "digital transformation", "AI strategy", "forward deployed engineering"
- Step 11 replaces the title and description.

## Ordinal numbering (all to go under the v3 rule)

| Where | What |
|---|---|
| `src/components/ui/MonoLabel.tsx:5-6,35-38` | `index` prop ("01"–"07") rendered in driftwood before the label |
| `src/components/sections/WhatWeDo.tsx:40` | `<MonoLabel index="01">` |
| `src/components/sections/Services.tsx:62` | `<MonoLabel index="02">` |
| `src/components/sections/WhyCykoai.tsx:43` | `<MonoLabel index="03">` |
| `src/components/sections/NameStory.tsx:44` | `<MonoLabel index="04">` |
| `src/components/ui/SectionLabel.tsx:13,19` | passes `index` through to `MonoLabel`; shows the tick only when there is no index |
| `src/components/sections/Philosophy.tsx:115` | `<SectionLabel index="05">` |
| `src/components/sections/Process.tsx:108` | `<SectionLabel index="06">` |
| `src/components/sections/Contact.tsx:49` | `<SectionLabel index="07">` |
| `src/components/ui/IndexRow.tsx:6-7,37-39` | required `index` prop in a 48/64px first grid column (the detail row keeps an empty spacer column, line 70) |
| `src/components/sections/Services.tsx:8-44,81-82` | `index: "01"`–`"07"` in `SERVICES`, used as the React key and passed to `IndexRow` |
| `src/components/layout/Navbar.tsx:159` | `String(i + 1).padStart(2, "0")` before each mobile menu link |
| `src/components/sections/WhyCykoai.tsx:58` | `String(i + 1).padStart(2, "0")` before each benefit |
| `src/components/sections/Process.tsx:10-35,120,123-124` | `index: "01"`–`"05"` in `STEPS`, used as the key and printed on each card |

Numbers that are data and may stay: the Hero caption coordinates "23.59° N, 58.38° E". The `EngagementNote` weeks ("W01"–"W14") are data in form but illustrative in content, so they leave with the note.

## Reusable building blocks

- **`MonoLabel`** (`src/components/ui/MonoLabel.tsx`): JetBrains Mono caps eyebrow (11px, 0.22em), with a driftwood index or a 28px driftwood tick in front; `tone` light/inverse; `as` sets the tag.
- **`SectionLabel`** (`src/components/ui/SectionLabel.tsx`): thin alias over `MonoLabel` that shows the tick when no index is given.
- **`Reveal`** (`src/components/ui/Reveal.tsx`): ScrollTrigger fade-and-rise (24px, 0.7s `expo.out`, start `top 82%`); skips elements already in view and under reduced motion.
- **`SplitText`** (`src/components/ui/SplitText.tsx`): masked line-by-line headline rise on GSAP SplitText (`yPercent: 110`, 0.8s, 0.09 stagger), with an sr-only copy for screen readers; skips in-view elements and reduced motion.
- **`GenImage`** (`src/components/ui/GenImage.tsx`): `next/image` wrapper for `public/assets/gen/` art; decorative by default, optional `.img-grade`, and a `data-gen-asset` hook that the assets-off screenshot pass hides.
- **`Button`** (`src/components/ui/Button.tsx`): flat link or button, 2px radius, variants `solid` / `inverse` / `ghost` / `ghost-inverse`, sizes `md` / `sm`, colour-only hovers.
- **`IndexRow`** (`src/components/ui/IndexRow.tsx`): numbered accordion row (index, title, chevron) that opens a detail region at 300ms; the top rule turns driftwood on hover or open.
- **`WorldCanvas`** (`src/components/ui/WorldCanvas.tsx`): Canvas 2D dotted globe from `public/assets/land-points.json` (3,338 points), 110s per turn, −13° tilt, Muscat hub pulse and one driftwood arc at a time; pauses offscreen, one static frame under reduced motion. Its arc targets (London, Singapore, New York, Frankfurt, Nairobi, Tokyo, Sydney, São Paulo) are not the real client locations the brief requires; step 05 replaces it with cobe.
- **`RingField`** (`src/components/ui/RingField.tsx`): 1–7 concentric hairline rings with one optional driftwood accent ring and optional solid core; per-ring `speeds` prop feeds `data-speed` (no caller uses it).
- **`DiagonalPlane`** (`src/components/ui/DiagonalPlane.tsx`): one SVG diagonal line in five tone presets with an optional `data-speed`. Not imported anywhere on v1.
- Also present: **`LogoMark`** (the real monogram PNG, used in Navbar and Footer), **`StatStrip`** and **`EngagementNote`** (both leave in v3).

## Motion setup

- **GSAP and plugins:** `src/lib/gsap.ts` registers `ScrollTrigger` and `SplitText` on the client and re-exports `gsap`, `ScrollTrigger`, `SplitText`. Every component imports from here.
- **Lenis:** `src/components/layout/SmoothScroll.tsx` (a client wrapper in `layout.tsx`). It creates Lenis (`duration: 1.15`, quartic ease-out), feeds `lenis.on("scroll", ScrollTrigger.update)`, drives `lenis.raf` from `gsap.ticker` with `lagSmoothing(0)`, and exposes it as `window.__lenis` (the Navbar uses it to stop scrolling while the menu is open). It also:
  - routes same-page `#` anchor clicks through `lenis.scrollTo` with `offset: -64` (the nav height)
  - runs the band colour hand-offs: each `[data-band-fade]` element tweens from that colour to its own background between `top 90%` and `top 50%`
  - calls `initParallax()`
- **Parallax:** `src/lib/parallax.ts` `initParallax()` finds every `[data-speed]` element and, on `gsap.ticker`, sets `translate3d(0, (viewportMid − docCenter) × (speed − 1), 0)`. It re-measures on every `ScrollTrigger` refresh and skips writes for layers far offscreen. Current values:

  | Where | Element | data-speed |
  |---|---|---|
  | `Hero.tsx:22` | globe wrapper | 0.93 |
  | `Hero.tsx:34` | H1 | 0.97 |
  | `WhyCykoai.tsx:78` | AM-5 cube | 0.88 |
  | `NameStory.tsx:36` | RingField wrapper | 0.88 |
  | `Philosophy.tsx:101` | AM-1 monolith | 0.92 |
  | `Footer.tsx:38` | AM-5 cube | 0.94 |

  `RingField` and `DiagonalPlane` can also set `data-speed`, but no caller passes one.
- **Pins (2 of 2 allowed):** Philosophy (line scrub, `end: "+=300%"`, `scrub: 0.6`) and Process (horizontal track, ≥900px only, `scrub: 0.6`). Both use `gsap.context` + `gsap.matchMedia`.
- **Reduced motion:**
  - `SmoothScroll` returns early, so there is no Lenis, no band fades and no parallax; anchors use native jumps.
  - `initParallax` is also a no-op on its own.
  - `Reveal` and `SplitText` skip their tweens, so content renders static.
  - `WorldCanvas` draws one static frame with one completed arc.
  - Philosophy and Process register their pins only under `(prefers-reduced-motion: no-preference)`; Philosophy uses Tailwind `motion-safe:` / `motion-reduce:` classes to show four stacked lines instead.
  - `globals.css:118-127` cuts every CSS animation and transition to 0.001ms.
  - `src/lib/useReducedMotion.ts` (`usePrefersReducedMotion`) exists but nothing imports it.

## Other notes for later steps

- **Unused code on v1:** `DiagonalPlane.tsx`, `src/lib/useReducedMotion.ts`, `src/lib/theme.ts` (a dark/light theme store; nothing imports it). `public/assets/gen/am2b-rings-limestone.png` is not referenced.
- **Fonts:** `layout.tsx` loads Inter, Space Grotesk (600, 700) and JetBrains Mono (400) through `next/font/google`; `globals.css` maps them to `--font-sans`, `--font-display`, `--font-mono`. Step 02 replaces these.
- **Rule edges to keep in mind:** `.img-grade::after` uses `mix-blend-mode: multiply` (image grading, not the navbar); the Contact fields use a 3px driftwood focus `box-shadow` ring.
- **Repeated phrases the brief calls out, by location:** "bolted on" (Services `02`, NameStory "cy", Process "Design"); "owned by your teams" (Services `03`, NameStory "ai"; near matches in StatStrip "OWNED BY YOUR TEAM" and EngagementNote "OUTCOME — OWNED BY THE CLIENT"); "actually" (WhatWeDo "Architecture & strategy", Services `05`, Services `07`, Process "Assess").
