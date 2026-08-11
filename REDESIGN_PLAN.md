# Cykoai landing page rebuild — execution plan for Claude Code (v2.1)

**Date:** August 2026 · **Repo:** `cykoai-consulting` · **Status:** ready to execute
**v2 change:** adds a Higgsfield MCP asset pipeline (images only, hard credit budget) and a Claude Design sync step. Supersedes v1 entirely.
**v2.1 change:** hero is now **Direction D — The World** (Column-inspired canvas dot-globe; Mehdi's pick). Mockups A–C are retired as hero candidates but their salvaged parts remain in P4/P5. AM-1 demoted to optional; generation ceiling lowered to 55.

**Inputs (read these first):**
- `design-explorations/cykoai-redesign-board.html` — direction, inspiration library, section notes
- `design-explorations/hero-direction-d-world.html` — **the hero reference implementation** (working canvas globe + arcs; port this)
- `design-explorations/hero-direction-{a,b,c}.html` — retired hero candidates; still the styling reference for salvaged parts (A's memo card → P4, C's name-story band → P5)
- `incorporation/Cykoai Design System/` — canonical tokens, components, brand voice

---

## 0 · Locked decisions

| # | Decision | Choice |
|---|----------|--------|
| D1 | Hero direction | **Direction D — The World.** Column-inspired: Windsor band, editorial type left, a slowly rotating **Canvas 2D dotted globe** (real geography, 110s/rotation) cropped at the right edge, with driftwood "deployment arcs" animating from Muscat to world cities one at a time. Reference implementation: `design-explorations/hero-direction-d-world.html`. C's `cy·ko·ai` name-story band (P5) and A's engagement-note artifact (P4) survive from the retired mockups |
| D2 | 3D | **2.5D + generated stills + the code-rendered globe.** Canvas 2D is not WebGL and is sanctioned. No live WebGL (three.js), no generated video |
| D3 | Animation stack | **GSAP + ScrollTrigger + Lenis only.** Remove framer-motion + three.js family. No anime.js (one runtime, one clock) |
| D4 | Section treatments | Services = numbered index rows 01–07 · What-we-do = editorial split, sticky left · Philosophy & Process keep pin mechanics, restyled flat |
| D5 | Theming | **Light-first single theme v1** (white body + permanent Windsor bands). Theme plumbing dormant, toggle hidden |
| D6 | Generated imagery | **DONE — generated and reviewed in Cowork, 11 Aug 2026.** Final set + URLs live in `public/assets/gen/manifest.json`; total spend 13.98 credits, ~96 remaining. **Claude Code performs no generation** — P-A is download-only and the Higgsfield MCP is not required. **No video anywhere** (Mehdi's call; the sample was cut) |

---

## 1 · The constitution (non-negotiable design rules)

Check every diff against this list. If a change needs a banned item, the change is wrong — redesign it.

**NEVER:**
- Gradients (backgrounds, text, borders). Flat fields only.
- `backdrop-filter` / glass. Glow blobs, colored shadows, film grain overlays.
- Tilt-on-hover, magnetic buttons, custom cursors, scale-up hovers, playful overshoot.
- Radii above **8px** (pill only on small tags).
- Generic decorative glyphs. Graphic vocabulary = **the diagonal, concentric rings, hairlines, and §AM imagery**. Lucide icons only where they clarify.
- Emoji, exclamation marks, title case, hype words.

**IMAGERY (amended in v2 — replaces v1's "no generated imagery"):**
- Generated imagery is allowed **only** from the approved §AM manifest. Nothing ad-hoc.
- Every asset must be: **abstract or architectural** (objects, surfaces, geometry — never people, never literal koi/fish/trees/animals/offices/handshakes), **palette-locked** (Windsor `#0B1527`, white, Driftwood `#AD8752`, cool neutrals — nothing else dominant), **matte** with a single hard light source. No lens flare, no bokeh, no glossy "AI sheen", no text/watermarks inside images.
- An asset that drifts off-palette gets regraded with the CSS `.img-grade` utility (§AI) or rejected — never a third regeneration.
- **Fallback law:** every section must remain complete and shippable with pure line-geometry (the v1 design) if its asset is rejected or missing. Imagery is progressive enhancement, never a structural dependency. (Deliberate inversion of asset-first sites: credits are finite; the brand carries the page, images elevate it.)

**ALWAYS:**
- Tokens from `incorporation/Cykoai Design System/tokens/`. Driftwood budget: links, rules, focus rings, ~one highlight per screen, never a fill.
- Type: Space Grotesk display (`-0.03em`, ~1.02, hero `clamp(2.9rem,6.5vw,5.8rem)`) · Inter body (`1.125rem/1.65`, 46–52ch) · JetBrains Mono 10–11px caps labels (`.14–.22em`).
- Layout: 1320px grid, 1px hairlines not shadows, 2–8px radii, asymmetry, mono numbering.
- Motion: ≤3 parallax speeds/viewport (≈0.85/0.92/1.0), ≤2 pins/page, reveals 500–800ms `expo.out`, staggers ≤90ms, hovers 200–300ms color/rule shifts, transforms+opacity only, full `prefers-reduced-motion` static fallback.
- Voice: sentence case, short declaratives, numbers over adjectives.

---

## AM · Asset manifest & generation protocol (Higgsfield MCP)

> **STATUS: EXECUTED — 11 Aug 2026, in Cowork, with Mehdi reviewing each asset.** Spend: 13.98 of 110 credits (~96 remain). The protocol and table below are retained for the record, but the **live source of truth is `public/assets/gen/manifest.json`** — it reflects the final set including changes made during review: AM-2 approved in two variants (plaster + limestone), AM-1 promoted from optional to the dark-band texture, **AM-3 (water ripple) and AM-4 (ring disc) cut** to keep the motif balance (rings = light bands only; the diagonal = dark bands and objects), and **all video permanently out** by Mehdi's decision. Claude Code: skip to P-A, which is download-only.

### AM.0 Credit protocol — read before generating anything

1. Call `balance`. Expected ≈110. **Hard ceiling for this whole phase: 55 credits.** Stop and report the moment projected spend crosses it.
2. **Price discovery first:** generate AM-2 *alone* (v2.1: it is now the most important asset), cheapest sensible config. Re-check `balance`, compute actual per-image cost, project the full manifest. Show the math before continuing.
3. One retry maximum per asset (changed prompt, not rerolled luck). A second failure = invoke the fallback law and move on.
4. Every asset is single-shot (v2.1: no 2-candidate master anymore; AM-1 is optional and last).
5. Prefer `generate_image_batch` + `jobs_wait` + one `show_generation_by_ids` for the post-master batch.
6. Confirm every kept asset with `media_confirm`, download to `public/assets/gen/`, and write `public/assets/gen/manifest.json`: `[{id, media_id, model, prompt, params, credits_spent, kept}]` — full reproducibility.
7. **Forbidden tools** (they burn credits or violate D2/D6): `generate_video*`, `generate_3d`, `upscale_video`, `motion_control`, `create_website`/`deploy_website`, any `ms_*`/marketing-studio model, `shorts_studio_*`, `dubbing`, audio tools.

### AM.1 Shared art direction (append to every prompt)

> matte surfaces, architectural studio photography, single hard directional light, deep controlled shadow, near-black navy #0B1527 environment, warm bronze #AD8752 accent light only, cool neutral greys, minimalist, abstract, no people, no animals, no text, no watermark, no lens flare, no bokeh

Where the model supports it (Recraft V4.1), also pass `colors: ["#0B1527","#FFFFFF","#AD8752","#3A4356","#B4B9C4"]` and `background_color` for flat-field assets.

### AM.2 The manifest (6 core assets, ~8–10 generations + 2 cutouts)

| ID | Asset | Model / config | AR | Used in | Prompt core (add AM.1 suffix) |
|----|-------|----------------|----|---------|-------------------------------|
| AM-1 | **Master monolith** *(OPTIONAL in v2.1 — generate last, only if budget clearly allows)* — monolithic near-black concrete block, one clean diagonal cut, warm light escaping | `soul_cinematic`, 2k, single-shot | 21:9 | OG/social image only (the hero is now the code globe) | "monumental minimalist concrete monolith, single precise diagonal cut revealing warm bronze light within, cinematic architectural still" |
| AM-2 | **Rings relief** — paper-white bas-relief of concentric growth rings (sequoia cross-section, abstracted) | `recraft_v4_1` utility + palette lock | 16:9 | Light interstitial band before Philosophy (P5/P6) | "white-on-white bas relief carving, concentric tree growth rings, raking side light, subtle warm edge glow" |
| AM-3 | **Water ripple** — macro dark water surface, one concentric ripple system (the koi, abstracted) | `soul_cinematic`, 1.5k | 21:9 | Philosophy band texture at 12–18% opacity (P6) | "macro still of near-black water surface, single expanding concentric ripple, faint warm glint on wave crests" |
| AM-4 | **Ring object cutout** — solid disc/ring object with concentric relief, 3/4 studio view → `remove_background` | `recraft_v4_1` standard + palette lock → cutout | 1:1 | Parallax layer in name-story band (P5) | "physical disc object carved with concentric rings, dark navy stone with one bronze ring, studio product shot on plain background" |
| AM-5 | **Monogram object cutout** — extruded square block with diagonal cut (the logo, made physical), 3/4 view → `remove_background` | `soul_cinematic` 1.5k → cutout | 1:1 | Footer / Why-Cykoai parallax layer (P4/P8) | "solid dark navy cube sliced by one clean diagonal plane, the cut face in white, physical object studio shot on plain background" |
| AM-6 | **Topo-diagonal field** — faint hairline topographic contours crossed by one diagonal, near-white | `recraft_v4_1` vector/utility + palette lock, `background_color #F9F9FA` | 16:9 | What-we-do / Process light-band background at low opacity (P2/P7) | "ultra-minimal topographic contour line drawing, thin grey lines on off-white, one straight diagonal line crossing the field" |

**Reserve ops (only if needed, count against the 70):** `outpaint_image` AM-1 to wider crop if 21:9 clips badly at 1440×900; `upscale_image` AM-1 to 4K *only* if visible banding at display size. Nothing else.

**Review gate:** after generation, display all six against the §1 imagery rules. Mehdi approves the set (or individual rejections) before any wiring. Rejected asset → fallback law.

### AM.3 Integration spec (§AI)

- Serve via `next/image`, AVIF/WebP, quality ~70. v2.1: the hero has **no image** — LCP is the headline text, which should make LCP trivial to hit. Textures ≤150KB each. Total image payload on first load ≤900KB.
- Textures (am1-monolith on the dark Philosophy band, am6-topo-diagonal behind the What-we-do rows) render at 8–15% opacity **under** content; they must survive being barely noticed. Full-bleed moments (am2-rings-plaster interstitial; optionally am2b-rings-limestone in the name-story/About area) get the Watershed treatment: atmospheric, cropped hard, never a "look at my AI image" hero-in-a-frame.
- The cutout (am5-monogram-cube, transparent PNG) is a `data-speed` parallax layer — a real object render drifting between type planes; this is where the "3D parallax" feel comes from.
- Add `.img-grade` utility: a Windsor multiply overlay + slight desaturation (CSS `filter`/blend on a wrapper) to pull any drifting asset back to palette. Decorative images: `alt=""`, `aria-hidden`.
- Every image sits in a sized container — CLS stays 0.

---

## 2 · Dependency changes

```bash
npm remove three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing framer-motion
# keep: gsap lenis next react react-dom clsx tailwind-merge resend firebase
# add: nothing — Higgsfield assets arrive as static files, no runtime SDK
```

**Why GSAP-only (D3):** already in the repo; the standard for pin/scrub/parallax; the whole plugin suite (SplitText, DrawSVG, MorphSVG) is free since the Webflow acquisition — use official `SplitText`. Framer-motion duplicates GSAP here; anime.js would be a third runtime for zero new capability. One clock.

**Firebase/resend:** untouched. `src/app/api/contact/route.ts` stays exactly as is.

---

## 3 · File inventory

**DELETE**
```
src/components/three/{CrystalCore,HeroCanvas,ParticleLattice}.tsx
src/components/ui/{TiltCard,MagneticButton,AbstractGlyph}.tsx
src/components/layout/{CustomCursor,NoiseOverlay}.tsx
src/components/sections/{Testimonials,CaseStudies}.tsx   # never render fake proof
```

**CREATE**
```
src/components/ui/DiagonalPlane.tsx    # SVG diagonal; props: weight, tone, speed
src/components/ui/RingField.tsx        # concentric rings; props: count, accentIndex, speeds[], solidCore
src/components/ui/MonoLabel.tsx        # mono caps label w/ driftwood tick + index
src/components/ui/IndexRow.tsx         # numbered service row; hover rule→driftwood
src/components/ui/EngagementNote.tsx   # memo artifact card (mockup A)
src/components/ui/StatStrip.tsx        # bordered stat row (mockup B)
src/components/ui/Button.tsx           # flat solid/ghost, 2px radius, per DS
src/components/ui/GenImage.tsx         # next/image wrapper: sized container, .img-grade option, aria-hidden default
src/components/sections/NameStory.tsx  # cy·ko·ai band (mockup C) + AM-4 parallax cutout
src/components/ui/WorldCanvas.tsx      # port of mockup D's globe: Canvas 2D, dotted land, Muscat arcs;
                                       #   props: {arcs?: boolean, static?: boolean}; IO-paused; rm-static
public/assets/land-points.json         # 3,338 [lat,lon] land dots (already generated — copy from mockup D's
                                       #   embedded LAND array; do not regenerate)
src/lib/parallax.ts                    # data-speed → one gsap.ticker translator; SSR-safe; reduced-motion no-op
public/assets/gen/                     # Higgsfield outputs + manifest.json
```

**MODIFY:** `globals.css` (strip .glass/.text-gradient*/.ambient-glow/noise/cursor; add hairline + .img-grade utilities; light-first per D5) · `layout.tsx` (drop cursor/noise; keep Lenis; hide toggle) · `page.tsx` (order: Hero → WhatWeDo → Services → WhyCykoai → NameStory → Philosophy → Process → Contact) · `Navbar` · `Footer` · all sections per §4 · `Reveal` + `SplitText` (rewrite on GSAP) · `SectionLabel` (fix numbering page-wide).

**KEEP AS-IS:** `api/contact/route.ts`, `lib/theme.ts` (dormant), `lib/useReducedMotion.ts`, icons.

---

## 4 · Phases

One phase = one commit (`redesign: P<N> <name>`). Don't start a phase until the previous *Done when* passes.

### P0 — Foundation
Branch `redesign/v1`. §2 dependency removal. Purge banned CSS; create `parallax.ts`, `DiagonalPlane`, `RingField`, `MonoLabel`, `Button`, `GenImage`. Write `CLAUDE.md` from §7.
**Done when:** build passes; zero refs to deleted files; three.js gone from bundle.

### P-A — Asset download (generation already done)
Assets were generated and reviewed with Mehdi in Cowork. Read `public/assets/gen/manifest.json`, download each `raw_url` to its stated `file` name in `public/assets/gen/` (curl/fetch is fine), and verify pixel dimensions against the manifest. **Do not generate, regenerate, upscale, or call any Higgsfield tool.** If a URL has expired, stop and tell Mehdi — the assets are recoverable from his Higgsfield library by `job_id`.
**Done when:** all five files on disk at the manifest's dimensions; no Higgsfield calls made.

### P1 — Nav + Hero (Direction D — The World)
Navbar per §3 **plus a real mobile menu** (<900px: hamburger → full-screen Windsor overlay, links stacked in Space Grotesk — the mockups punt on this; the build must not). Hero: port `hero-direction-d-world.html` faithfully into `WorldCanvas.tsx` + `Hero.tsx`:
- Globe: Canvas 2D, land dots from `land-points.json`, 110s/rotation, tilt −13°, initial rotation faces the Gulf, hairline sphere edge, dot alpha/size scaled by depth. `devicePixelRatio` capped at 2.
- Deployment arcs: driftwood great-circle arcs Muscat → {London, Singapore, NYC, Frankfurt, Nairobi, Tokyo, Sydney, São Paulo}, strictly one at a time (draw 3.2s `cubic ease-out` → hold 0.9s → fade 1.2s → 1.4s gap), head dot, landing dot, Muscat origin pulse. Skip spawn while the hub faces away.
- Discipline: rAF paused via IntersectionObserver + `visibilitychange`; `prefers-reduced-motion` renders one static frame with a single completed arc; mobile: globe centered behind text at ~40% opacity.
- Layout: editorial left column (eyebrow, headline "The future moves faster than your organization." with the final words dimmed, lede, white CTA + driftwood link); mono caption bottom-right ("DEPLOYED WHERE CHANGE HAPPENS / ORIGIN — MUSCAT · 23.59° N, 58.38° E"); globe container drifts at 0.93, headline 0.97.
**Done when:** side-by-side with the mockup at 1440/768/390 is a match; scroll trace shows the globe costs <2ms/frame; LCP = headline text; reduced-motion static; canvas has `aria-hidden="true"` and the section reads fully with canvas removed.

### P2 — What we do
Editorial split: sticky statement left, four hairline rows right (no cards, no icons). AM-6 topo field at ≤15% opacity behind the row column. Hover: rule→driftwood, title +4px.
**Done when:** sticky sane at all breakpoints; rows keyboard-focusable; section reads clean with AM-6 disabled.

### P3 — Services
Seven `IndexRow`s (mono 01–07, SG title, one-liner, arrow). Click expands detail (300ms `expo.out`, `aria-expanded`).
**Done when:** reads as table of contents; keyboard complete.

### P4 — Why Cykoai
Left: blunt claims. Right: `EngagementNote` (content marked illustrative) over 3-cell `StatStrip` (`TODO(mehdi): real numbers`). AM-5 monogram cutout drifts behind the column at 0.88.
**Done when:** zero abstract decoration except AM-5; artifacts legible; works without AM-5.

### P5 — Name story (new)
Mockup C band: Windsor field, `cy · ko · ai` columns, drawn `RingField` echo drifting at 0.88 (the ring-disc cutout was cut — the drawn rings carry this band alone). Optionally, am2b-rings-limestone may appear here as a restrained side image instead of in the interstitial — one placement, not both.
**Done when:** matches mockup C band; page-wide section numbering consistent.

### P6 — Philosophy
Keep pin + line scrub. Flat Windsor band; lines white/`--n300`; final line's driftwood underline draws in (scaleX). am1-monolith as the band texture at 8–15% opacity, drifting 0.92 — the diagonal cut echoing the mark behind the argument.
**Done when:** pins on page = this + Process; reduced-motion = four stacked static lines; the monolith is invisible-but-felt (if it announces itself or fights the text, lower opacity or drop it — fallback law).

### P7 — Process
Keep horizontal pin. Flat white cards (1px border, 4px radius, mono numbers), driftwood progress rule. AM-6 (or plain field) behind. Mobile: vertical, no pin.
**Done when:** resize recalc solid; progress hits 100% at release.

### P8 — Contact + Footer
Flat form card per DS `Input`/`Button` (2px radii, driftwood focus). Footer: Windsor band, oversized wordmark, diagonal divider; AM-5 cutout may anchor the corner at 0.94.
**Done when:** form submits against unchanged API; focus visible; footer diagonal at 45°.

### P9 — Motion polish
Lenis↔ScrollTrigger sync once in `SmoothScroll`. Band color handoffs (0.4 viewport overlap). Audit: ≤3 speeds/viewport, ≤2 pins, no width/height/top/left animation, cutout layers composited (transform-only).
**Done when:** full-scroll performance trace shows no animation long-tasks >50ms, no forced reflows.

### P10 — QA gate
- Screenshot matrix: 390/768/1440 × every section × (motion, reduced-motion) × (assets on, assets off — fallback law proof).
- Console zero errors. Lighthouse mobile: **LCP <2.5s, CLS <0.1, TBT <200ms**; JS <150KB gz; image budget per §AM.3.
- A11y: AA contrast (body accent text uses `--driftwood-deep #7D5F33`), keyboard pass, focus visible, `aria-expanded` correct, decorative images hidden.
- SEO: metadata unchanged; valid h1→h3 ladder; AM-1 crop wired as OG image.
**Done when:** all green → PR `Redesign v2 — editorial authority + generated assets` with before/afters.

---

## 5 · Verification loop (every phase, before commit)

1. `npm run dev`
2. Screenshot touched section at 1440/768/390 (Playwright script, or Playwright/Chrome DevTools MCP if configured).
3. Self-review against §1 + the mockups. Litmus: *"Would this look at home on daylightcomputer.com or column.com?"*
4. Toggle reduced-motion, re-screenshot. **For asset sections: also screenshot with the asset display:none'd** (fallback law).
5. Console clean → commit.

---

## 6 · Copy notes

Keep: hero headline, "adoption fails at the seams," the four Philosophy lines, "Seven disciplines. One point of accountability.", response-time line. Sentence-case audit everywhere. `TODO(mehdi)`: StatStrip numbers, engagement-note content, CTA wording ("Talk to us" per DS voice).

---

## 7 · CLAUDE.md (write at repo root in P0)

```markdown
# Cykoai Consulting — site

Forward-deployed AI + cybersecurity consulting. Brand = calm, quiet authority.
The site must demonstrate calm: if a change adds visual noise, it is wrong.

## Read before designing anything
- REDESIGN_PLAN.md (binding: §1 constitution, §AM asset rules)
- design-explorations/cykoai-redesign-board.html
- incorporation/Cykoai Design System/

## Hard rules (short form)
- Flat fields only: NO gradients, glass, glows, grain, tilt, magnetic, custom cursors
- Radii 2–8px. Hairlines not shadows. Windsor #0B1527 / white / Driftwood #AD8752 (sparingly)
- Space Grotesk display · Inter body · JetBrains Mono labels. Sentence case. No emoji/hype
- Motion: GSAP+ScrollTrigger+Lenis only. ≤3 parallax speeds, ≤2 pins, transforms+opacity,
  full reduced-motion fallback
- Imagery ONLY from public/assets/gen/ per REDESIGN_PLAN.md §AM. Site must work with all images removed
- Higgsfield MCP: images only, 70-credit ceiling, price-discovery first, no video/3d/website tools

## Commands
npm run dev · npm run build · npm run lint

## Verification
Screenshot touched sections at 390/768/1440 (+reduced-motion, +assets-off) and self-review
against §1 before every commit. Never touch src/app/api/contact.
```

---

## 8 · Handoff prompt (paste into Claude Code at repo root, Higgsfield MCP connected)

> Read REDESIGN_PLAN.md in full — §1 and §AM are binding. Then read the four mockups in design-explorations/ (hero-direction-d-world.html is the hero you are building; a/b/c are retired but P4/P5 salvage parts from them) and the design system readme in "incorporation/Cykoai Design System/".
>
> Execute phase by phase starting at P0, one commit per phase, running the §5 verification loop each time and showing me screenshots before moving on. P1's globe is a faithful port of mockup D — reuse its embedded LAND array as public/assets/land-points.json rather than regenerating it.
>
> For P-A: all assets are already generated and approved — public/assets/gen/manifest.json is the source of truth. Download each raw_url to its stated filename, verify dimensions, and move on. Do not call any Higgsfield or image/video generation tool for any reason; if a URL is dead, stop and tell me. There is no video anywhere in this design.
>
> If a requirement appears to need a banned element (§1), stop and propose an alternative instead.

## 8.5 · Claude Design sync (runs from Cowork, not Claude Code)

No "Cykoai" project exists in the claude.ai/design workspace yet (checked Aug 2026 — six other projects, none Cykoai). Step: create a **Cykoai Design System** design project and upload the existing `incorporation/Cykoai Design System/` bundle (it is already in Claude Design format: `_ds_manifest.json`, guidelines, tokens, components). After P0 and after P8, sync the new primitives (DiagonalPlane, RingField, IndexRow, EngagementNote, StatStrip + AM asset cards) into it via /design-sync so decks, reports, and the site stay one brand. Mehdi triggers this by telling Cowork "sync the design system" with the desktop app open.

---

## 9 · v2 backlog (out of scope)

- `generate_3d` GLB of the monogram object → real-time hero (would reopen the WebGL decision — evaluate then).
- Full dark theme re-enable · case studies/insights when real · analytics · Sequoia-style motion toggle.

*(Video was evaluated with a live sample and cut from the design entirely — per Mehdi, 11 Aug 2026. Not a backlog item.)*
```
