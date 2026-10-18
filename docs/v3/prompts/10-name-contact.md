# Step 10 · The name (dictionary entry) and Contact (decided: board option A)

Read `docs/v3/BRIEF.md` first. Two sections, each with a single job:

- **The name** explains the word "cykoai" and nothing else: how it's said, its three parts, and one closing line.
- **Contact** says what happens next, and how fast.

## 1. Study the references

Board captures are in `docs/v3/references/name/board/`. Then go through each site live in Chrome, as the brief describes: scroll Exo Ape's story slowly and time how its words and images enter, and look at how Linear Method sets its codes. Save a record with:

```bash
npm run refs -- name https://www.exoape.com/story --flow=10 --frames --wait=4000
npm run refs -- name https://linear.app/method --at="Introduction"
npm run refs -- offers https://evilmartians.com/services/ai-harness --at="What it takes to start"
```

If Exo Ape ignores the headless capture's scrolling, rely on what you saw in Chrome and on the board captures, and say so.

In `docs/v3/references/name/NOTES.md`, cover:

- how Exo Ape sets its name as a dictionary entry: the pronunciation in brackets, the meaning, then the next part
- the scale relationship between the word and its definition
- the pacing; note that Exo Ape uses about 9,500px of scroll for about 250 words, which is far too long for Cykoai
- Linear Method's mono codes, as navigable data

For Contact, note Evil Martians' "From you" / "From us" split.

## 2. The name (`id="name"`, dark)

- **The entry:**
  - The word "cykoai" in the display face at hero weight: 760 on dark, 112% width, `clamp(3.5rem, 11vw, 8.5rem)`, leading 0.9.
  - Beside it on desktop, or under it on mobile, in `type-data` Driftwood: the pronunciation from `site.ts` (confirmed: "see-ko-ya"), set as `[see·ko·ya] · noun`.
- **The three parts:** a three-column grid under a 1px `rgba(255,255,255,0.14)` rule, one column on mobile. Each column has the syllable ("cy", "ko", "ai") in `type-label` Driftwood and its line from `site.ts` in `type-body` (`#D5DAE3`). Mehdi approved these lines on 17 October. Columns are divided by hairlines. No numbers.
- **Closing line:** "Cykoai creates clarity." (confirmed) in `type-h3` white, under the parts.
- **RingField:** keep v1's `RingField` as a quiet background (≤15% opacity) only if it doesn't compete with the word. Otherwise remove it and note why.
- **Motion,** triggered when the section enters (no pin):
  1. The word starts set solid, "cykoai".
  2. Interpuncts fade in and the three syllables move apart to "cy · ko · ai". This is transform only: each syllable is its own span and moves by `translateX`, 0.9s `expo.out`.
  3. Then the three part columns fade up with a 90ms stagger.
  4. Then the closing line.

  Total about 1.8s. Under reduced motion, it's static, already spaced, with everything visible. Screen readers get "Cykoai" once, with the animated spans `aria-hidden`.

## 3. Contact (`id="contact"`, light)

- Keep v1's form, email line and response-time sentence (all confirmed). Don't touch `src/app/api/contact`.
- **No "What to send" list.** Mehdi left it out at sign-off (17 October). Don't add a `whatToSend` field or any other new copy: every string this step uses is already confirmed, and nothing should show a DRAFT chip, in dev or production.
- The heading and intro stay as v1's confirmed copy, restyled with `type-h2` and `type-lead`.

## 4. Check, commit, report

Run the brief's check list (verify-shots into `docs/v3/after/10-name-contact`, with `--section=#name` and `--section=#contact`). Also:

- Capture the name animation with `npm run refs -- _self http://localhost:3000 --at="Cykoai creates clarity" --mobile`. The three `at` captures, taken on arrival, +0.7s and +2.2s, show the sequence. Confirm the syllables separate calmly and nothing overlaps at 390px, then delete `_self`.
- Check the form still submits: the API route is untouched, and a manual test is enough.

Commit: `v3(10): the name as a dictionary entry; contact restyled`.

## Acceptance

- The name section explains only the word: pronunciation `[see·ko·ya]`, three parts and the closing line. The syllable animation is transform only, with a static reduced-motion state.
- Contact keeps the form and API unchanged and adds no new copy. No DRAFT chip appears anywhere in either section.
- No numbering, and no claims repeated from other sections.
