# Reference captures from the board (checked 24–25 Sep 2026)

Every image here was captured in a real browser from the live site. Measured values come from each site's computed CSS. Use these first; then capture the live sites with `npm run refs` (see BRIEF.md) to see motion and page flow. Files prefixed `avoid-` show what not to do.

Study, don't copy: take principles (proportion, hierarchy, spacing, timing), never code, text, images or brand devices.

## nav/board: glass navbar

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| linear-top.jpg | https://linear.app | Fixed 72px bar + 1px hairline; `rgba(11,11,11,.8)`, `backdrop-filter: blur(20px)`, hairline `rgba(255,255,255,.08)`, radius 0, no shadow | Take these values with Windsor in the tint: `rgba(11,21,39,.8)` |
| linear-scrolled.jpg | https://linear.app | The same bar after scrolling: nothing changes on scroll | Take: static bar, no shrink or hide |
| harvey-top.jpg | https://www.harvey.ai | Light theme nav under a promo banner | Skip the banner |
| harvey-scrolled.jpg | https://www.harvey.ai | Frosted off-white bar over content: ≈`rgba(250,250,249,.72)`, blur 16px, no border, no shadow | Take as the light-section values |
| palantir-top.jpg | https://www.palantir.com | Inset bar floating 10px from the sides and 16px from the top; `rgba(171,171,171,.1)`, blur 10px, radius 10, soft shadow | Take the inset silhouette (at 6px radius, no shadow) |
| palantir-scrolled-light.jpg | https://www.palantir.com | Over a white section the bar reads light, but only through `mix-blend-mode: difference` on the header | Skip the blend mode; switch values by section instead |
| avoid-raycast.jpg | https://www.raycast.com | Radius-16 island, gradient tint, inset highlight, red glow behind | Avoid all of it |
| avoid-clerk.jpg | https://clerk.com | Twelve stacked progressive-blur layers | Avoid: over-engineered |

## hero-text/board: headline entrance (t0 = just after load, mid = mid-animation, end = settled)

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| linear-t0 / -mid / -end.jpg | https://linear.app | Lines go blur → sharp with a small rise. Measured: opacity 0→1, blur 10px→0, translateY 20%→0, 1000ms, delays 400/500ms, `cubic-bezier(.25,.1,.25,1)` | The calmest reveal |
| anthropic-t0 / -mid / -end.jpg | https://www.anthropic.com | Words rise and fade in, out of order. Measured: 48px→0, 800ms, `cubic-bezier(.16,1,.3,1)`, word delays 214–352ms | One motion, one direction |
| exoape-mid1 / -mid2 / -end.jpg | https://www.exoape.com | Short lines rising through overflow masks after a preloader and a slanted panel wipe | Take the mask technique; skip the preloader, the wipe and the 250px type |
| avoid-lusion-mid.jpg | https://lusion.co | Words rising rotated 15°, after a 000–100 counter preloader | Avoid: preloader, rotation |

## globe/board

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| cloudflare-network.jpg | https://www.cloudflare.com/network/ | three.js globe: dotted land, graticule, pins on real data centres, one mono caption per region ("55 cities"), no glow, no starfield. The page's city list includes Muscat | Take dotted land + graticule + real pins + captions; skip the chunky pins and the ~0.9MB script chunk |
| vercel-regions-map.jpg | https://vercel.com/docs/regions | Static dotted world map of 126 points of presence and 19 regions; works without JavaScript | Take the principle: every dot is a real location |
| hadrian-clock-strip.jpg | https://www.hadrian.co | Top strip of live clocks for the places they work (CA, AZ, AL, DC) | An honest map-free alternative: time zones Cykoai actually serves |
| avoid-kaspersky.jpg | https://cybermap.kaspersky.com | Threat-map cliché: starfield, glow, many colours | Avoid |

## type/board: bold and technical

| File | Site | Measured | Take / skip |
|---|---|---|---|
| hadrian.jpg | https://www.hadrian.co | h1 Söhne 400 · 72px · −2.16px · lh 1.0; Söhne Mono 12px caps strip; navy field | Mono data strip; the nearest palette. Skip the light weight |
| varda.jpg | https://www.varda.com | MT Everyday Sans 700 · 107px · −3.2px · lh 1.0, sentence case, copper on navy, hairline grid | Weight 700 in sentence case over hairlines; skip the photo |
| spacex.jpg | https://www.spacex.com | D-DIN-Bold · 60px · lh 0.9 · uppercase; Roboto Mono countdown | Bold display + one mono data line; skip all-caps |
| replicate.jpg | https://replicate.com | Freigeist Neue 700 · 72px · −1.8px · lh 1.0; JetBrains Mono in the code panel | Weight 700 at lh 1.0; skip the gradient |
| oxide.jpg | https://oxide.computer | Suisse Int'l 400 · 65px · lh 1.0; GT America Mono "FIG. 1" labels | Label discipline: mono labels always name something real |

## offers/board

Superseded on 27 September: step 06 builds from the Cowork study in `offers/study/index.html`. These captures belong to the first design.

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| evilmartians-what-it-takes.jpg | https://evilmartians.com/services/ai-harness | An offer written as terms: a 2-week sprint, the price, "From you" / "From us", a weekly rate to extend | Scope + length (+ price if Mehdi wants) in three sentences |
| trailofbits-services.jpg | https://www.trailofbits.com | A security firm's services tree with one scope sentence per service | One sentence of scope per offer |
| vanta-grid.jpg · vanta-seventh.jpg | https://www.vanta.com | Six modules in a grid and a full-width seventh block (the chat widget over a card is Vanta's own) | The six-plus-one layout; skip the product mockups |
| wiz-tabs.jpg | https://www.wiz.io | Code / Cloud / Defend tabs sharing one diagram frame whose contents change | One persistent diagram, a state per offer; skip colour per tab |

## projects/board: the stage (checked 27 Sep 2026)

Picked on the showcase board on 27 September (direction A). The register captures from 26 September are in `projects/board/register-26sep/`; that direction was replaced and they no longer apply.

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| darkroom-stage.jpg · darkroom-next.jpg | https://darkroom.engineering | A full-screen frame held by plain CSS sticky for three projects' worth of scrolling. Each next project wipes up from the bottom, tied to scroll, while its giant name holds mid-screen | Take the sticky frame and the scroll-tied wipe; skip the red display type and full-bleed video |
| metalab-stage.jpg | https://www.metalab.com | One stage that swaps to the project pointed at: its interface on a monitor, the name in large type, the services ("Product Design, Product Strategy") and one sentence | Take the detail set; skip pointing as the only trigger |
| exoape-work-stage.jpg | https://www.exoape.com/work | One project on screen at a time: a large image, an inset image, the name and the category | Take the focus on one project; skip the wheel takeover and the "01 / 14" counter |
| cuberto-grid.jpg | https://cuberto.com | Landing pages in a monitor and apps in a phone, one sentence under each | Take device frames for pages and apps; skip the soft rounded cards |
| ramotion-cases.jpg | https://www.ramotion.com | Case studies that show the product itself: a dashboard with its phone app over it, pages in a browser frame | Take the product's own interface as the picture |
| 14islands-card.jpg | https://www.14islands.com | Large cards for the best work, then a plain list of further projects by name and category | Take the list after the showcase: "More work" |
| hadrian-panel.jpg | https://www.hadrian.co | A panel with a hairline table under it: a mono label on the left, a plain statement on the right | Take hairline facts under each project |
| helsing-panel.jpg | https://helsing.ai | The product name in white with what it is in grey beneath ("AI strike drone") | Take the two-tone name and descriptor |
| evilmartians-featured.jpg | https://evilmartians.com | One client at a time with a single mono data line | Take one data line per project; skip funding stages and results |

## engagement/board

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| trailofbits-anatomy.jpg | https://www.trailofbits.com ("Anatomy of a report") | "Every part of the report does a job": 8 parts, 64 pages, every report ships every part | Walk the buyer through the deliverable, part by part |
| trailofbits-report-cover.jpg | same | Sample cover: engagement period, 4 engineers, 10 person-weeks, severity × difficulty matrix | Team and effort stated as data |
| thoughtbot-phases.jpg | https://thoughtbot.com | Five phases, each with named artifacts; no durations | A named artifact per phase; add weeks |

## standards/board

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| oxide-principles.jpg | https://oxide.computer/principles | Principles framed as "not aspirations, they are constraints" | Rules you keep, not qualities you claim |
| anthropic-values.jpg | https://www.anthropic.com/company | Each value as label, one-line claim, short explanation | The entry rhythm; skip the serif body |

## name/board

| File | Site | What it shows | Take / skip |
|---|---|---|---|
| exoape-story-hero.jpg · exoape-story-name-line.jpg · exoape-exo-definition.jpg | https://www.exoape.com/story | The page defines its own name like a dictionary entry: "Exo [ĕk′sō]" with its meaning, then "Ape" | Pronunciation + meaning, one part at a time; skip the 3D renders and ~9,500px of scroll for ~250 words |
| linear-method-toc.jpg | https://linear.app/method | Mono chapter codes 1.1–3.6 that navigate a long page | If a label is needed, make it navigable data |
