# Step 07 · Projects: the stage (decided 27 September: showcase board, direction A)

Read `docs/v3/BRIEF.md` first. This section answers *have you done this before?* by showing the work. On 27 September Mehdi picked direction A, "the stage", on the showcase board. It replaces the engagement register planned on 26 September, so step 01's plain table goes. The section works like this:

- one frame sticks beside the projects while they scroll past, and each project's screen wipes into it as its text arrives;
- the landing pages Mehdi designed and built appear as captures of the live pages, scrolling inside the frame;
- confidential work appears as UI mockups tagged "Illustration";
- the device app appears as a phone shell for now;
- everything else goes in a plain "More work" list under the stage.

This step runs before step 06 (Offers), which waits until Mehdi has talked through the services. Nothing here depends on step 06.

**Mehdi's answers (27 September):**

- **Screens:** capture the live pages. Where a project has no screen, use a placeholder or an illustration.
- **Security work:** show UI mockups of it.
- **The device app:** a phone shell for now. Real screens, with data blurred, may follow.
- **The landing pages:** eight, listed in part 3. HDT Systems' own landing page isn't finished, so it stays out.

## 1. Study the references

**Board captures** are in `docs/v3/references/projects/board/`. The register captures from 26 September are in `board/register-26sep/` and no longer apply. `docs/v3/references/INDEX.md` comes from Cowork with this prompt, so it goes in the `v3(docs)` commit with the brief and prompts. The captures themselves are gitignored, like every third-party screenshot.

**Go through each site live in Chrome,** as the brief describes. Save a record with:

```bash
npm run refs -- projects https://darkroom.engineering --flow=10
npm run refs -- projects https://www.metalab.com --probe --mobile
npm run refs -- projects https://www.exoape.com/work --flow=4
npm run refs -- projects https://cuberto.com --flow=8
npm run refs -- projects https://www.14islands.com --flow=8
```

**Lighthouse baseline:** before changing any code, run Lighthouse three times per preset (mobile and desktop) on a production build of the current commit, served on :3100. Record the medians in NOTES.md; part 5 compares against them.

In `docs/v3/references/projects/NOTES.md`, cover:

- **Darkroom,** the core of this step:
  - the sticky frame: its `position`, `top` and height;
  - how much scrolling each project gets;
  - how the next project wipes in. To find out which property moves, add `clipPath`, `maskImage` and `webkitMaskImage` to the sampler, check for a `<canvas>`, and log `scrollY` with each sample. Write the wipe as a timeline against scroll distance.

  Take the sticky frame and the scroll-tied wipe. Skip the red display type and the full-bleed video.
- **Metalab:**
  - what sits around each project: its interface in a device, the name, the services and one sentence;
  - the device frame's radius, bar and edge.

  Skip pointing as the only way to switch.
- **Exo Ape work:** one project at a time, and how the name and category sit. Skip the wheel takeover and the "01 / 14" counter.
- **Cuberto:** landing pages in a monitor, apps in a phone, and one sentence under each. Skip the soft rounded cards.
- **14islands:** large cards for the best work, then a plain list of the rest by name and category. This is the model for "More work".

Mehdi's own pages are captured in part 4, not here.

## 2. The design

### Section

- **Tone:** dark (`bg-windsor`, `data-tone="dark"`).
- **Header:**
  - `type-label` "Projects";
  - the `type-h2` heading and `type-lead` intro from `projects.ts` (part 3);
  - left-aligned, max 22ch and 60ch.
- **Summary line** under the intro, in `type-data`, n300, with the numbers in white:
  - compute it from the entries that render; never hard-code it. For example: "14 projects · 6 in progress";
  - "in progress" counts both "In progress" and "Ongoing".
- **Order:** the stage, then "More work".

### The stage, 1024 px and wider

- **Grid:**
  - the stage column first, then the chapters: `minmax(0,1.15fr) minmax(0,0.85fr)`, gap `clamp(24px,5vw,72px)`, inside the section's container;
  - the chapters sit in one wrapper, which is the second grid item;
  - no ancestor of the stage may have `overflow: hidden` or `auto`, or sticky stops working.
- **The stage** is `position: sticky`, with `top: 12vh`, `height: 76vh` and its content centred. It's CSS sticky, not a ScrollTrigger pin, so the page's two-pin budget stays free.
- **The frame area** is `min(58vh, 480px)` tall, with `overflow: hidden`. Each screen is its own layer in it:
  - positioned absolutely, `inset: 0`, with `overflow: hidden`, on `bg-windsor`, so it fully covers the layer below;
  - with its device centred;
  - later layers stack on top.
- **The index strip** sits under the frame. It holds the featured projects' short names in a four-column grid, in `type-label`, n300:
  - each name has a 1px `white/12` top rule;
  - the active one turns white with a Driftwood rule;
  - it's decorative: `aria-hidden`, and not focusable;
  - check that the stage still fits at 1024 × 768 and 1280 × 720.
- **Browser frame:**
  - a 30px bar with three 7px dots at `white/18`, and the screen's label in `type-label`, n300;
  - radius 8px, a 1px `white/10` edge, no shadow, and `windsor-2` behind the screen;
  - a 16:10 viewport under the bar;
  - as wide as the column, or narrower if that would make it taller than the frame area.
- **Phone frame** (the shell only):
  - The brief's 2–8px radius rule covers the page's own surfaces. A device outline is a picture of a device, so it's the one exception.
  - Radius 34px outside and 24px inside, with 10px padding and a 1px `white/12` edge.
  - As tall as the frame area minus 48px, with the "Illustration" tag in the gap under it. The phone and its tag are centred as one group.
  - Add the same exception to `CLAUDE.md`'s radius rule, so a later pass doesn't "fix" it.
- **Chapters:** one per featured project, as `<article id="project-<id>">`.
  - **Height:** chapters with a capture are at least 120vh tall; the others at least 75vh. Content is centred vertically, with 16px gaps.
  - **Contents, in order:**
    1. **Meta line:** practice · type, in `type-label`, n300.
    2. **Name:** an `<h3>` in a new shared utility, `type-h3-lg`. It's `type-h3` scaled up to `clamp(1.5rem, 2.4vw, 2.1rem)`, with the same −20 weight on dark sections. Step 06 uses it for the offer names later.
    3. **One line:** `type-body`, n300, max 44ch.
    4. **Facts:** a `<dl>` in two columns with 1px `white/12` hairlines. Terms are `type-label` n300; values are `type-data` white.
       - Entries with a `year` (landing pages) show Client, Year and Stack.
       - Entries with a `since` (engagements) show Client, Since, Status and Stack. Status has the 6px Driftwood dot from step 01's register.
    5. **Link,** only when the entry has one: "Visit the live page ↗" in `type-small`. It opens in a new tab with `rel="noopener noreferrer"`.

### Motion on the stage

Transforms and opacity only, as the brief requires. Everything is tied to scroll through ScrollTrigger, on Lenis's clock.

| Part | Behaviour |
|---|---|
| The wipe | Each next screen's layer wipes up from the bottom of the frame over the last one while its chapter's title rises from 98% to 58% of the viewport height, scrubbed. Scrolling back reverses it. The first screen is already in place when the stage arrives. |
| How to build the wipe | The layer is the wrapper, and its `overflow: hidden` does the clipping: it moves from `yPercent: 100` to 0. A full-size child inside it (not the device) moves from `yPercent: -100` to 0. Both tweens sit in one scrubbed timeline, at position 0, with ease "none". The edge travels and the picture stays put. Don't use `clip-path`: it breaks the transforms-and-opacity rule and repaints every frame. |
| Active chapter | The chapter whose title top has passed 62% of the viewport height. The index strip follows it. |
| Inside the frame | A capture scrolls once from its top to its bottom, in the window where its layer is fully uncovered. It starts when its own wipe ends (its title at 58%); for the first chapter, it starts when the stage sticks. It reaches the bottom when the next chapter's wipe starts. The last chapter reaches it when the page has moved on by 90% of the chapter's height. With 120vh capture chapters, that's about 1.6 times the page's speed at 1440 × 900, a little faster for the first chapter. Mockups and the shell stay still. |
| Text | The name rises through line masks (`SplitText`) as the chapter arrives. The meta line, the line and the facts follow with `Reveal`, 60ms apart, within the brief's 500–800ms. |
| Reduced motion | No wipe: the screen switches when its chapter becomes active. Nothing scrolls inside the frame, so each capture shows its top. No reveals. |

### Screens

**Captures** are the files from part 4, `public/assets/projects/<slug>.webp`, each 1440 × 2700.

- **Rendering:** use `next/image` with `width={1440}`, `height={2700}`, `sizes="(min-width: 1024px) 50vw, 100vw"` and `style={{ width: "100%", height: "auto" }}`. The config already serves AVIF and WebP at quality 70. Don't use `GenImage` or its `.img-grade` veil: the veil would recolour Mehdi's pages.
- **Accessibility:** they're decorative (`alt=""`), because each chapter carries the words.
- **The fallback:** each frame paints `windsor-2`, with the project's name in `type-label` n300, permanently under the image.
- **Existence check:** render an image only for a slug listed in `src/content/project-captures.json` (part 4). A missing file would 404, and verify-shots fails on the console error that causes.
- **The image-removed check:** put `data-gen-asset` on the `<img>` itself, so the brief's every-image-removed check (verify-shots `--assets-off`) hides it and shows the fallback.

**Loading:** every screen sits in the frame at once, so native lazy loading would fetch them all together.

- **The stage mounts its images only at 1024px and wider.** Decide that with `matchMedia` in an effect, so the server renders no stage images. Never choose the layout during render: that causes hydration errors (which fail verify-shots) and layout shift.
- **One capture ahead:** mount the active chapter's capture and the next capture, even if mockup chapters sit between them. Once mounted, an image stays mounted, so a reverse wipe never uncovers an empty frame.
- **Nothing early:** nothing loads until the section is within one screen height of the viewport.
- **Inline screens** (below 1024px) use native lazy loading and are `display: none` from 1024px, so nothing is fetched twice.

**Mockups** are HTML components, not images:

- **Surface:** a `bg-windsor` background, `windsor-2` panels and `white/10` hairlines.
- **Type:** fixed-size utilities only (`type-label`, `type-data`, `type-small`, `type-body`); the display sizes scale with the viewport and would reflow. Text is white and n300. The active item is white, not Driftwood.
- **Scale:** author each at 960 × 600, positioned absolutely with `transform-origin: 0 0`. Scale it to the frame by the frame's width ÷ 960, measured with a ResizeObserver.
- **Copy:** mockup strings live in `projects.ts` with the rest of the section's copy. They get no DRAFT chips, because the mockups are hidden from assistive tech and the chips would clutter them.
- **The bar:** the mockup's label, with an "Illustration" tag at the right: `type-label`, n300, a 1px `white/20` edge, radius 2px.
- **Access:** mockups are `aria-hidden`.

| Mockup | Used by | Contents |
|---|---|---|
| Access review | HDT Systems | A left rail: Accounts (active), Groups, Sharing, Devices, Controls. Column heads: Account, Type, Access, 2-step, Decision. Six rows of redaction bars, with empty neutral chips and dots, so no row has a state. A legend at the foot: Keep, Reduce, Remove. A "Controls" panel lists the four control themes of ISO/IEC 27001:2022's Annex A (Organizational, People, Physical, Technological), each with a neutral dot. |
| Launch readiness | Launch-readiness audits | A header, "Launch-readiness review", and a severity scale as a key (Critical, High, Medium, Low). A checklist of what a review covers, each item with a neutral dot: Secrets in the client bundle; Row-level security; Admin routes; Sign-in rate limits; Error pages; Dependencies. |
| Workflow | AI workflow automation | Five nodes joined by hairline connectors: Request arrives → AI reads and extracts → Checked against rules → A person approves → Records updated. A side panel lists the same steps, each with a neutral dot. |

Mockups show the kind of work, never results or a client's data:

- no names, counts, scores, percentages, dates or states;
- no severity or decision against a row;
- no vendor logos, and no imitation of a real product's interface.

**The phone shell** is for the device app. The phone frame holds skeleton blocks and no text:

- a top bar;
- one large card with a full, neutral ring drawn in SVG (a partly filled ring would read as a percentage);
- two small device cards with neutral dots;
- a list of five devices with neutral dots.

### More work

- **Heading:** "More work" as an `<h3 id="projects-more">`, styled `type-label`.
- **Rows:** one per remaining entry, as articles between 1px `white/12` hairlines. No images.
- **From 768px,** each row is a grid of `minmax(0,1.3fr) minmax(0,1fr) auto`:
  - first, the name as an `<h4>` styled `type-h3` at its normal size, white, with the one line under it (`type-small`, n300);
  - then practice · type (`type-label`, n300) and the client (`type-small`);
  - last, the year or since (`type-data`), and the status for engagements.

  The fact labels are visually hidden.
- **Below 768px:** the name, the line, then one `type-label` line of practice · type · year or since.
- **Links:** when an entry has one, the name is the link, followed by an `aria-hidden` ↗.
- **Hover and focus** on that link: the row's top rule turns Driftwood. Colour only; nothing moves.
- **Motion:** rows arrive with `Reveal`, 60ms apart.

### Below 1024px

- **Nothing sticks.** There's no stage. Each chapter shows its screen first, then its text, with no minimum height.
- **Captures** sit in the browser frame at the column's width, with a 16:11 viewport. Each scrolls inside its frame as the chapter crosses the viewport, from entering at the bottom to leaving at the top.
- **Mockups** keep 16:10.
- **The phone shell** sits centred on a `windsor-2` panel, at most 230px wide, with `clamp(22px,4vw,44px)` above and below.
- **Spacing:** chapters are separated by a hairline and `clamp(40px,8vw,64px)`.
- **Reduced motion:** each capture shows its top, still.

### Accessibility

- **Chapters** are articles, with the name as the `<h3>` and the facts as a `<dl>`.
- **Hidden duplicates:** the sticky stage and every screen frame, on the stage or inline, are `aria-hidden`, and nothing inside them is focusable or wrapped in a link. The chapters carry everything the screens show.
- **Link names:** a chapter link's accessible name starts with its visible text: "Visit the live page: Bukhait Sefrar (opens in a new tab)". The extra words are visually hidden, and the ↗ is `aria-hidden`. More work links get the same "(opens in a new tab)".
- **Focus:** focusing a link scrolls its chapter in. The stage follows, because scroll drives it.
- **Unique ids:** chapter anchors are `project-<id>`, because some project ids could match offer ids.

## 3. Content

### Where it lives

Any client component that imports `site.ts` ships the whole file in the page's JavaScript. So hidden entries would still reach the browser, names and links included. To keep them out:

- move the whole `projects` block out of `site.ts` into `src/content/projects.ts`, using `site.ts`'s `Status` and `TBC`;
- import it, and `project-captures.json`, only from server components;
- the section's server component filters the entries by the table under "What renders where", and passes the stage, a client component, only what renders.

### The model

Replace `Project` and `OwnProject` with one entry type, and drop `columns` and `ownProjects`:

```ts
export type ProjectScreen =
  | { kind: "capture"; slug: string; label: string }
  | { kind: "mockup"; mockup: "access-review" | "launch-readiness" | "workflow"; label: string }
  | { kind: "phone-shell" }
  | { kind: "none" }; // More work only; an entry needs a screen before it can be featured

export interface Project {
  id: string; // the chapter's anchor is `project-${id}`
  name: string;
  short: string; // for the index strip, 18 characters at most
  line: string;
  practice: string; // one of the offers' practices
  type: string;
  client: string; // a name, "Withheld", "Concept", or TBC
  clientStatus?: Status; // "draft" until the client agrees to be named
  year?: string; // landing pages
  since?: string; // engagements
  state?: "In progress" | "Ongoing";
  stack: string;
  link?: string;
  linkStatus?: Status;
  screen: ProjectScreen;
  featured: boolean; // on the stage; otherwise in More work
  status: Status;
}
```

**Copy,** all `status: "draft"`:

- **Heading:** "What we've built, and what we're building."
- **Intro:** "Sites we've designed and built, and the engagements under way now. Confidential clients aren't named, and their work is shown as illustrations."
- **Labels:** "More work", "Illustration", "Visit the live page", "(opens in a new tab)".
- **Summary words:** "project", "projects", "in progress".
- **Fact labels:** Client, Year, Since, Status, Stack.
- **Mockup strings:** exactly as in the mockups table.

### The entries

Keep this order: the stage first, then More work. Every entry is `status: "draft"`. Where no short name is given, it's the name.

On the stage (`featured: true`):

| id | Name (short name) | One line | Practice · type | Client | When | Screen |
|---|---|---|---|---|---|---|
| `bukhait-sefrar` | Bukhait Sefrar | A right-to-left Arabic site for a law firm and legal consultancy in Muscat. | Design · Landing page, Arabic | Bukhait Sefrar, Muscat (pending consent) | Year TBC | capture |
| `hdt-systems` | HDT Systems | Google Workspace hardening, a review of freelancers' access, and controls working toward ISO/IEC 27001. | Security · Workspace hardening | HDT Systems, Germany (confirmed) | Since TBC · In progress | Access review |
| `rabia-al-basri` | Rabia Al Basri | An interactive autobiography of the eighth-century mystic. | Design · Interactive story | TBC | Year TBC | capture |
| `launch-audits` | Launch-readiness audits (Launch audits) | Architecture and design reviews of AI-built apps, so they're ready to launch. | Security · Security review | Withheld | Since TBC · Ongoing | Launch readiness |
| `mono` | MONO | A landing page for sustainable modular homes. | Design · Landing page | TBC | Year TBC | capture |
| `device-app` | Mobile app for connected devices (Device app) | A mobile app that works with IoT hardware through device APIs. | Engineering · Mobile app, IoT | Withheld | Since TBC · Ongoing | phone shell |
| `ai-workflows` | AI workflow automation (AI automation) | AI workflows that take manual steps out of a team's daily work. | AI · AI automation | Withheld | Since TBC · In progress | Workflow |

In More work (`featured: false`):

| id | Name | One line | Practice · type | Client | When | Screen |
|---|---|---|---|---|---|---|
| `asaan-nikah` | Asaan Nikah | A landing page and an application system for a free matrimony service that runs on WhatsApp. | Engineering · Web app and landing page | Asaan Nikah (pending consent) | Year TBC | capture |
| `private-ai` | Secure AI environment | A private AI setup on Google Vertex AI. | AI · AI platform | Withheld | Since TBC · In progress | none |
| `pentests` | Penetration testing | Security analysis and penetration testing. | Security · Penetration test | Withheld | Since TBC · Ongoing | none |
| `optimus` | Optimus | A landing page for an AI platform. | Design · Landing page | TBC | Year TBC | capture |
| `gigi-energy` | GiGi Energy | A landing page for an energy drink. | Design · Landing page | TBC | Year TBC | capture |
| `voss-architects` | Voss Architects | A landing page for an architecture studio. | Design · Landing page | TBC | Year TBC | capture |
| `hously` | Hously | A landing page for an architecture and interiors studio. | Design · Landing page | TBC | Year TBC | capture |

The rest of each entry:

- **Capture labels:** each landing page's name.
- **Stack:**
  - seven of the landing pages: "Next.js · Tailwind CSS · Vercel", as checked on each live page on 27 September;
  - Asaan Nikah: TBC, because its application system's stack isn't known;
  - HDT Systems: "Google Workspace · ISO/IEC 27001 controls";
  - Launch-readiness audits: "Architecture and design review";
  - Device app: "Mobile · device APIs · IoT";
  - Secure AI environment: "Google Vertex AI";
  - AI workflow automation and Penetration testing: TBC.
- **Links:** each landing page's URL from part 4, with `linkStatus: "draft"`.

### What renders where

This section follows step 01's behaviour until step 11's content gate:

| Value | Dev | Production |
|---|---|---|
| Draft copy | Renders, with one DRAFT chip beside each entry's name | Renders, without the chip |
| A TBC fact | "TBC" with a DRAFT chip | Left out |
| A link with `linkStatus: "draft"` | Renders, with a DRAFT chip | Left out |
| An entry whose client has `clientStatus: "draft"` | Renders, with a DRAFT chip beside the client | The whole entry is left out |
| A capture entry | Renders | Renders only when its client is "Concept", or a name with `clientStatus: "confirmed"`. A capture shows the page's brand, so it names the client. |

Two more rules:

- **"Concept"** marks work made without a client. Only Mehdi sets it.
- **Minimum stage:** the stage needs at least two featured entries that render. With fewer, render them as More work rows. Today production shows four, all illustrations, until Mehdi answers.

Never add clients, dates, links or outcomes that aren't confirmed.

## 4. Capture the pages

**The script:** write `scripts/capture-projects.mjs` with:

- Playwright's Chromium, which is already a dev dependency;
- sharp, which comes with Next.js. Add it to `devDependencies` so the script doesn't rely on that.

**The pages,** as `{ slug, url }` in the script. Capture all eight, so Mehdi can move entries onto the stage without capturing again:

| slug | url |
|---|---|
| `bukhait-sefrar` | https://v0-bukhait-sefrar-landing-page.vercel.app/ |
| `rabia-al-basri` | https://v0-rabia-al-basri-website.vercel.app/ |
| `mono` | https://v0-mono-housing-landing.vercel.app/ |
| `asaan-nikah` | https://v0-asaan-nikah-landing-page.vercel.app/ |
| `optimus` | https://v0-optimus-the-ai-landing.vercel.app/ |
| `gigi-energy` | https://v0-energy-drink-landing-gigi.vercel.app/ |
| `voss-architects` | https://v0-minimal-architecture-landing.vercel.app/ |
| `hously` | https://v0-hously-modern-architecture-landing.vercel.app/ |

**For each page:**

1. Use a 1440 × 900 viewport at device scale 1, in the light colour scheme, with `ref-shots.mjs`'s desktop Chrome user agent (some sites serve headless browsers differently).
2. Load it and wait for the network to settle (at most 15 s), then 1.5 s more.
3. Scroll down to 3,600 px in 300 px mouse-wheel steps, 250 ms apart, then back up the same way. The wheel triggers the pages' scroll reveals the way a visitor does. MONO, Optimus, GiGi and Rabia Al Basri all reveal content as it scrolls into view.
4. Move the mouse to (0, 0), so no hover state is captured. Wait for `document.fonts.ready`, then 1.2 s more.
5. Take a full-page screenshot clipped to the top 1440 × 2700, which is three screens. Check that it came back at exactly that size.
6. Encode it with sharp as WebP at quality 80, to `public/assets/projects/<slug>.webp`. Aim for 400 KB or less.
7. Record the slug, URL, date, size and bytes in `src/content/project-captures.json`. It stays out of `public/`, and the section's server component reads it to know which captures exist.

**Behave as a visitor:**

- close or reject any cookie banner, as `ref-shots.mjs` does;
- never sign in, submit or type anything.

**Options:**

- `--only=<slug>` redoes one page.
- `--tiles` captures a page as three viewport shots instead, at 0, 900 and 1,800 px. It waits 1.2 s at each. On the second and third, it hides only fixed or sticky bars pinned to the top edge (top at 0 or above, under about 160px tall), so sticky storytelling panels stay. Then it composites the shots with sharp into 1440 × 2700.

  Use it for a page whose full-page capture fails the eye check. The usual causes are reveals that reverse on the way back up, and fixed backgrounds that paint only the first screen.

**Check every capture by eye** before using it:

- no blank bands;
- no half-faded elements;
- no banners;
- nothing cut off at the top.

Redo any that fail, and name them in the report. Commit the script, the eight WebP files and `project-captures.json`.

## 5. Check, commit, report

Run the brief's check list, with verify-shots into `docs/v3/after/07-projects` and `--section=#projects`. Also:

- **Stage screenshots:** add a `--scroll=<selector>@<fraction>` option to `verify-shots.mjs`. It scrolls so the selector's top sits at that fraction of the viewport height, waits 600 ms and saves a viewport shot; `window.scrollTo` works with Lenis. Take:
  - `#project-rabia-al-basri h3@0.78`: mid-wipe;
  - `#project-hdt-systems h3@0.5`: a mockup;
  - `#project-device-app h3@0.5`: the phone shell;
  - `#projects-more@0.3`: More work.

  In NOTES.md, set the mid-wipe shot beside Darkroom's flow capture from part 1, in a two-image table.
- **Motion,** in Chrome, with the sampler. Log each title's `top / innerHeight` and `scrollY` with every sample. Drive the scroll with `window.__lenis.scrollTo(y, { duration: 5, easing: (t) => t })`. Check that:
  - the wipe starts as the title passes 98% and ends at 58%;
  - it reverses when you scroll back;
  - each capture scrolls its whole height once, while its layer is fully uncovered;
  - the index strip follows the active chapter.
- **Reduced motion:** screens switch with no wipe, captures stay at their top, and nothing reveals.
- **Frame rate:** during that 5 s scripted scroll, count `requestAnimationFrame` callbacks and report the longest gap between frames. The count should hold the display's refresh rate.
- **Layout shift:** a `layout-shift` PerformanceObserver running during the scroll records nothing from the section.
- **Loading:** in the network panel, no capture loads before the section is near. After that, captures arrive one ahead of the active chapter.
- **Images removed:** with `--assets-off`, each frame shows its fallback and every chapter still reads.
- **Duplicate ids:** there are none on the page.
- **Lighthouse:** three runs per preset again. Compare the medians with part 1's baseline: they should be within 2 points.
- **Production** (`npm run start -- -p 3100`): check the table in part 3. There are no TBC values, no draft links, and no capture entry without a confirmed client or "Concept".

Commit: `v3(07): projects stage with live captures and illustrated confidential work`.

**The report lists:**

- every TBC and draft value in this section;
- each capture's file size, and any page that needed `--tiles`;
- which offers have no project yet (today, APIs and bot deployments);
- the questions for Mehdi:
  - for each landing page: made for a client or as a concept? If a client, can they be named? What year?
  - can Bukhait Sefrar and Asaan Nikah be named?
  - should the live pages be linked, given their addresses are `v0-….vercel.app`?
  - is an illustrated access review right for HDT Systems' chapter?
  - are these the right projects for the stage, in this order?

## Acceptance

- **The stage:** a frame sticks beside the featured chapters (seven in dev). Each next screen wipes up from the bottom as its title arrives, reverses on the way back, and uses transforms only.
- **Screens:**
  - Mehdi's landing pages appear as captures that scroll inside the frame while fully in view.
  - Confidential work appears as mockups tagged "Illustration", with no names, numbers, states or results.
  - The device app appears as a phone shell.
- **More work** lists the remaining entries without images.
- **Below 1024px,** chapters stack with their screens and nothing sticks. Reduced motion is still.
- **Loading:** captures load one ahead, and none twice. The section has no layout shift and still reads with every image removed.
- **Production** follows part 3's table: no TBC values, no unconfirmed links, and no client shown without consent.
