#!/usr/bin/env node
/**
 * capture-projects: capture Mehdi's live landing pages for the Projects stage (v3 step 07).
 *
 * Usage:
 *   node scripts/capture-projects.mjs [--only=<slug>] [--tiles]
 *
 *   --only=<slug>   redo one page
 *   --tiles         capture three viewport shots (0, 900, 1800 px) and composite them,
 *                   for a page whose full-page capture fails the eye check (reveals that
 *                   reverse on the way back up, fixed backgrounds that paint one screen)
 *
 * Each page: 1440x900 at device scale 1, light colour scheme, ref-shots' desktop Chrome
 * user agent. Load, settle, wheel down to 3,600 px and back so scroll reveals fire as
 * they do for a visitor, then take the top 1440x2700 (three screens) and encode it as
 * WebP q80 to public/assets/projects/<slug>.webp. src/content/project-captures.json
 * records what exists; the Projects section reads it and renders only those images.
 *
 * Behaves as a visitor: cookie banners are rejected or closed; it never signs in,
 * submits or types anything.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const PAGES = [
  { slug: "bukhait-sefrar", url: "https://v0-bukhait-sefrar-landing-page.vercel.app/" },
  { slug: "rabia-al-basri", url: "https://v0-rabia-al-basri-website.vercel.app/" },
  { slug: "mono", url: "https://v0-mono-housing-landing.vercel.app/" },
  { slug: "asaan-nikah", url: "https://v0-asaan-nikah-landing-page.vercel.app/" },
  { slug: "optimus", url: "https://v0-optimus-the-ai-landing.vercel.app/" },
  { slug: "gigi-energy", url: "https://v0-energy-drink-landing-gigi.vercel.app/" },
  { slug: "voss-architects", url: "https://v0-minimal-architecture-landing.vercel.app/" },
  { slug: "hously", url: "https://v0-hously-modern-architecture-landing.vercel.app/" },
];

const WIDTH = 1440;
const HEIGHT = 900;
const CAPTURE_HEIGHT = 2700;
// Same desktop Chrome user agent as scripts/ref-shots.mjs (some sites serve headless browsers differently).
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const flags = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const i = a.indexOf("=");
      return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)];
    })
);
const ONLY = typeof flags.only === "string" ? flags.only : null;
const TILES = Boolean(flags.tiles);

const pages = ONLY ? PAGES.filter((p) => p.slug === ONLY) : PAGES;
if (!pages.length) {
  console.error(`Unknown slug "${ONLY}". Slugs: ${PAGES.map((p) => p.slug).join(", ")}`);
  process.exit(2);
}

const OUT_DIR = resolve("public/assets/projects");
const MANIFEST = resolve("src/content/project-captures.json");
mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Privacy-preserving consent handling, as in ref-shots: reject / necessary-only first, otherwise close.
async function dismissConsent(page) {
  const reject = /^(reject( all)?|decline( all)?|deny( all)?|only necessary|necessary only|use necessary cookies only|essential only|refuse( all)?)$/i;
  for (const role of ["button", "link"]) {
    const btn = page.getByRole(role, { name: reject }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ timeout: 2000 }).catch(() => {});
      await sleep(500);
      return "rejected";
    }
  }
  const closed = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("div,section,aside,dialog")].filter((el) => {
      const cs = getComputedStyle(el);
      return (cs.position === "fixed" || cs.position === "sticky") && /cookie|consent|privacy/i.test(el.textContent || "") && el.getBoundingClientRect().height < window.innerHeight * 0.6;
    });
    for (const el of nodes) {
      const close = [...el.querySelectorAll("button,[role=button]")].find((b) => /close|dismiss|×|✕/i.test(b.getAttribute("aria-label") || b.textContent || ""));
      if (close) { close.click(); return "closed"; }
    }
    return "none";
  }).catch(() => "none");
  await sleep(300);
  return closed;
}

// 300 px mouse-wheel steps, 250 ms apart: the pages' scroll reveals fire as they do for a visitor.
async function wheelPass(page) {
  await page.mouse.move(WIDTH / 2, HEIGHT / 2);
  for (let y = 0; y < 3600; y += 300) { await page.mouse.wheel(0, 300); await sleep(250); }
  for (let y = 0; y < 3600; y += 300) { await page.mouse.wheel(0, -300); await sleep(250); }
}

async function settle(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  await sleep(1200);
}

async function fullPage(page) {
  await wheelPass(page);
  await settle(page);
  return page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: WIDTH, height: CAPTURE_HEIGHT } });
}

// Hides bars fixed or sticky to the top edge (top at 0 or just below it, as floating
// pill navs sit, and under ~160px tall), so they don't repeat in the second and third
// tiles. Sticky storytelling panels are taller and stay. Opacity, not visibility, so a
// child that sets visibility itself is hidden too; transitions off, so a bar with
// `transition-all` doesn't fade out during the shot.
async function hideTopBars(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.top >= -1 && r.top <= 40 && r.height > 0 && r.height < 160) {
        el.style.setProperty("transition", "none", "important");
        el.style.setProperty("opacity", "0", "important");
      }
    }
  });
  await sleep(100);
}

async function tiles(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.fonts.ready);
  const shots = [];
  for (const [i, y] of [0, HEIGHT, HEIGHT * 2].entries()) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await sleep(1200);
    if (i > 0) await hideTopBars(page);
    shots.push({ input: await page.screenshot(), top: y, left: 0 });
  }
  return sharp({ create: { width: WIDTH, height: CAPTURE_HEIGHT, channels: 3, background: "#ffffff" } })
    .composite(shots)
    .png()
    .toBuffer();
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : [];
const browser = await chromium.launch();
const failures = [];

try {
  for (const { slug, url } of pages) {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: "light",
      userAgent: UA,
      locale: "en-US",
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await sleep(1500);
      const consent = await dismissConsent(page);

      const png = TILES ? await tiles(page) : await fullPage(page);
      const { width, height } = await sharp(png).metadata();
      if (width !== WIDTH || height !== CAPTURE_HEIGHT) throw new Error(`capture is ${width}x${height}, expected ${WIDTH}x${CAPTURE_HEIGHT}`);

      const file = resolve(OUT_DIR, `${slug}.webp`);
      await sharp(png).webp({ quality: 80, effort: 6 }).toFile(file);
      const bytes = statSync(file).size;
      const entry = { slug, url, date: new Date().toISOString().slice(0, 10), width, height, bytes, mode: TILES ? "tiles" : "full-page" };
      const at = manifest.findIndex((m) => m.slug === slug);
      if (at === -1) manifest.push(entry); else manifest[at] = entry;
      console.log(`saved ${slug}.webp  ${(bytes / 1024).toFixed(0)} KB  ${entry.mode}  consent: ${consent}${bytes > 400 * 1024 ? "  (over 400 KB)" : ""}`);
    } catch (e) {
      failures.push(`${slug}: ${e.message.split("\n")[0]}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  const order = PAGES.map((p) => p.slug);
  manifest.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  if (failures.length) {
    console.error("Failed:\n- " + failures.join("\n- "));
    process.exitCode = 1;
  }
}
