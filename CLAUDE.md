@AGENTS.md

# Cykoai Consulting — site

Forward-deployed AI + cybersecurity consulting. Brand = calm, quiet authority.
The site must demonstrate calm: if a change adds visual noise, it is wrong.

## Read before designing anything
- docs/v3/BRIEF.md (v3 rules and page structure; wins where it conflicts with the lines below)
- REDESIGN_PLAN.md (binding: §1 constitution, §AM asset rules)
- design-explorations/cykoai-redesign-board.html
- incorporation/Cykoai Design System/

## Hard rules (short form)
- Flat fields only: no gradients, glows, grain, tilt, magnetic effects or custom cursors. Glass on the navbar only (see BRIEF).
- Radii 2–8px. Exceptions: the Projects phone outline (a picture of a device) and the navbar's bar (16px, 14px below 900px) and its CTA (8px) (Mehdi, 18 Oct). Hairlines not shadows. Windsor #0B1527 / white / Driftwood #AD8752 (sparingly)
- Type: Archivo (display 104–112% width, text 100%) + Chivo Mono (labels, data). Use the type-* utilities; no ad-hoc font sizes, weights or tracking.
- Sentence case. No emoji/hype
- Numbers only as data: no ordinal section indices, numbered rows or numbered menus.
- WebGL only for the hero globe and the Offers pieces (three.js). The sphere's and the Offers solids'
  light-to-shade ramp is shading on a 3D object, not a gradient field, so the "no gradients" rule doesn't
  cover it. Nothing else on the globe or the pieces glows.
- Motion: GSAP+ScrollTrigger+Lenis only. ≤3 parallax speeds, ≤2 pins, transforms+opacity,
  full reduced-motion fallback
- Imagery ONLY from public/assets/gen/ per REDESIGN_PLAN.md §AM. Site must work with all images removed
- Higgsfield MCP: images only, 70-credit ceiling, price-discovery first, no video/3d/website tools

## Commands
npm run dev · npm run build · npm run lint

## Verification
Screenshot touched sections at 390/768/1440 (+reduced-motion, +assets-off) and self-review
against §1 before every commit (scripts/verify-shots.mjs). Never touch src/app/api/contact.
