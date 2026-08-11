# Cykoai — minimal static site

A zero-build, dependency-free version of the Cykoai marketing site: plain
`index.html` + `styles.css` + `script.js`. No Node, no npm install, no build
step — just three files you can upload anywhere. Use this to get something
live quickly while the full Next.js/Three.js version (in `../src`) keeps
evolving.

## Preview locally

Open `index.html` directly in a browser, or serve the folder so relative
paths behave exactly like production:

```
npx serve minimal
```

## Deploy — pick whichever you already use

**Firebase Hosting** (same setup as the portfolio site):

```
firebase init hosting   # set "public" directory to this minimal/ folder
firebase deploy
```

**Netlify**: drag the `minimal` folder onto https://app.netlify.com/drop.

**Vercel**: `npx vercel --cwd minimal --prod` (or import the repo and set
the root directory to `minimal` in project settings).

**GitHub Pages**: push this folder's contents to a `gh-pages` branch (or
enable Pages on the `minimal/` folder via repo settings).

## What to edit before going live

- **Contact form** (`script.js`, `handleSubmit`): currently opens a
  pre-filled `mailto:` link since there's no backend. Swap in a POST to
  Formspree, Netlify Forms, or your own API when you want submissions
  delivered automatically instead.
- Swap `info@cykoai.com` for your real inbox everywhere it appears.
- Add a LinkedIn (or other social) link back to the footer once you have one live.

Note: the Work/Case Studies and Testimonials sections have been removed for
now (nav/footer links plus the sections themselves) — their CSS in
`styles.css` (`.case`, `.case-list`, `.testimonials`, `.quote-wrap`, etc.)
was intentionally left in place so it's easy to paste either section back
in later.

## Why this exists

Same brand, copy, and structure as the full site, deliberately without
Three.js / GSAP / Lenis / a build pipeline — so it can be hosted on literally
any static host in under a minute and will run smoothly on anything.

The one exception is the Philosophy section: it reproduces the main site's
pinned, line-by-line scroll reveal, but with plain CSS (`position: sticky`
inside a tall wrapper does the actual "pinning" for free) plus a small
rAF-throttled scroll listener in `script.js` that just toggles which line
is active — no animation library required.
