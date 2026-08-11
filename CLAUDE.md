@AGENTS.md

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
against §1 before every commit (scripts/verify-shots.mjs). Never touch src/app/api/contact.
