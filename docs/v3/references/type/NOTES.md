# Type: bold and technical

Studied 26 Sep 2026 live in Chrome at 1440 (system theme dark; all five sites are dark-first anyway), measured with the JS tool, and saved with `npm run refs -- type <url> --probe --mobile` into `live/`. Probe values in each `manifest.json` match the Chrome measurements. The Chrome window resize did not reach the page this session (width stayed 1440), so the 390px wraps come from the `mobile-top.jpg` captures.

**Varda** — MT Everyday Sans
- Display: 700, 107.5px, lh 1.0, −3.22px (−0.03em), 100% width, sentence case, copper on navy. 390: 44.8px, four lines of one word each ("Space / born, / Earth / bound") beside the logo column.
- Section h2: 500, 54.7px, lh 1.15, −0.02em. Body 21.8/30.5 (lh 1.4). Small bold sans labels ("Mission", "Government"), not mono.
- Mono layer: none. Hairline grid lines carry the technical feel instead.

**Hadrian** — Söhne / Söhne Mono
- Display: 400, 72px, lh 1.0, −2.16px (−0.03em). Section h2 400, 64px, lh 1.0, −0.03em. 390: 30px, two lines ("The Future of / American Production").
- Mono layer: Söhne Mono 12px/18px caps, tracking normal, in a hairline-boxed strip of live clocks for four sites with time zones (CA 10:07AM PDT …). Buttons are mono 16px caps. The headline fades in after load.

**Oxide** — Suisse Int'l / GT America Mono
- Display: 400, 65px, lh 1.0, −1.625px (−0.025em). Section h2 400, 36/42, −0.013em. Body 25/32. 390: 36px, two centred lines.
- Mono layer: GT America Mono 11–12px caps, +0.64px (≈ +0.05em). Labels always name something real: "FIG. 1 · OXIDE CLOUD COMPUTER", a CLI/API/console panel that types commands.
- The mobile cookie banner stayed ("Reject optional" is not a label the capture script matches).

**SpaceX** — D-DIN-Bold / Roboto Mono
- Display: D-DIN-Bold, 60px, lh 0.9, −1px, all caps. Later h2s 80/76 and 48/60, +0.02em caps. 390: 60/54, two lines ("STARSHIP / FLIGHT 14").
- Mono layer: Roboto Mono 16px countdown "T-1D 19:07:12" directly above the headline. Its digits roll as 0–9 columns. A second counter "T+03:06:56" sits in the navbar.

**Replicate** — Freigeist Neue / JetBrains Mono
- Display: 700, 72px, lh 1.0, −1.8px (−0.025em), sentence case, with a hard break ("Run AI / with an API."). Section h2 400, 48/48. 390: 48px, the same two lines.
- Mono layer: JetBrains Mono 14/20 in a real code panel.

**Take:**
- Weight 700 or more in sentence case (Varda, Replicate). Leading 1.0 or tighter. Tracking about −0.025 to −0.03em at display sizes.
- Hairlines.
- One mono line that carries real data next to the headline (Hadrian's clocks, SpaceX's countdown). For Cykoai that means the origin coordinates, and later the client locations.
- Mono labels at 11–12px caps that name something real (Oxide).

**Skip:** all-capitals headlines (SpaceX), photography (Varda), gradients (Replicate), the light 400 display weights (Hadrian, Oxide), rolling digits.

**Differences from the prompt (the prompt wins):**
- Every reference uses 100% width. Width 104–112% is Cykoai's own choice.
- The hero's −0.035em is tighter than any reference (−0.025 to −0.03em).
- Mono tracking on the references is normal to +0.05em. The prompt's `type-label` is +0.1em.

## Step 02 build notes (26 Sep 2026)
- **Width approach: `font-stretch`.** `next/font` declares `font-stretch: 62% 125%` on Archivo's `@font-face`. In Chrome at 80px/780 the test line measured 1855px at 100% and 2080px at 112%. `font-variation-settings` gave the same widths, so it is not needed.
- **One value changed from the prompt:** `type-hero` is `clamp(2.25rem, 6.4vw, 5.75rem)`, not a 3rem minimum. At 390px, 3rem (48px) could not fit the headline in 2–3 lines without "organization." alone on the last line (tested: 4 lines, or overflow). Mehdi chose 2.25rem.
  - The dim span "your organization." is also `whitespace-nowrap`.
  - Result at 390, 768 and 1440: "The future moves / faster than / your organization."
- **Left in `src/components` after the grep, on purpose:**
  - The navbar wordmark (`font-display text-[17px] font-bold tracking-[0.02em] [font-stretch:112%]`). The prompt gives it its own treatment.
  - The footer's aria-hidden "CYKOAI" wordmark (`text-[clamp(3.5rem,11.5vw,10.5rem)] font-bold leading-[0.95] tracking-[-0.02em]`, now at 112%). It is the same brand mark, not a heading.
  - `font-medium` on `Button` and the CTA links. These are controls, and `type-small` alone would drop them to 400.
  - `DraftMark` uses `type-label` with `leading-none`. It only shows in dev.
- **Checks:**
  - No Space Grotesk, Inter or JetBrains Mono in `.next/static`. Only Archivo and Chivo Mono ship.
  - Cold-load layout shift is 0.0000 at 1440 and 390, on both dev and production builds. The hero box is the same before and after `document.fonts.ready`.
  - Contrast: n500 on white 4.76, n500 on n50 4.52, n300 on Windsor 9.28, driftwood on Windsor 5.53. The hero dim part (n500 on Windsor, large text) is 3.84.
  - Computed weights: the hero is 760 on dark. h2 is 740 on light and 720 on dark. h3 is 700 on light and 680 on dark.
  - Labels: every one is Chivo Mono 500, 11px, +0.1em, caps.
- **For step 03:** the mobile menu overlay is dark but is not a section. It carries no `data-tone`, so its `type-h2` links use weight 740, not 720.
