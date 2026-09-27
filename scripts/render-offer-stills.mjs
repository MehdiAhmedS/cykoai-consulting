#!/usr/bin/env node
/**
 * The Offers pieces' still images (v3 step 06), rendered by the Offers engine itself.
 *
 * Usage (with `npm run dev` running):
 *   node scripts/render-offer-stills.mjs [--url=http://localhost:3000/?offers-still]
 *
 * Opens the page with the dev-only `?offers-still` flag at 1440 × 900 with
 * motion allowed. The page builds each scene fresh, snaps it to its still
 * pose (the study's `still` time), renders it at 1600 × 1000 on a transparent
 * background and sets `window.__offerStills` to one WebP data URL per offer.
 * Chrome encodes the WebP. Writes public/assets/gen/offer-<id>-1600.webp.
 *
 * Set PW_CHROMIUM to a Chrome binary to render on the real GPU instead of
 * Playwright's software WebGL (as ref-shots does).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const flag = a.replace(/^--/, "");
    const i = flag.indexOf("=");
    return i === -1 ? [flag, true] : [flag.slice(0, i), flag.slice(i + 1)];
  })
);
const URL = typeof args.url === "string" ? args.url : "http://localhost:3000/?offers-still";

const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM || undefined });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const handle = await page.waitForFunction(() => window.__offerStills, null, { timeout: 60_000 });
  const stills = await handle.jsonValue();
  if (stills.error) throw new Error(`the page could not render the stills: ${stills.error}`);
  const ids = Object.keys(stills);
  if (ids.length !== 6) throw new Error(`expected six stills, got ${ids.length}`);
  for (const id of ids) {
    const data = stills[id];
    if (!data?.startsWith("data:image/webp;base64,")) throw new Error(`no WebP for ${id} (got ${data?.slice(0, 30)})`);
    const buf = Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
    const out = resolve(`public/assets/gen/offer-${id}-1600.webp`);
    writeFileSync(out, buf);
    console.log(`${id}: ${buf.length} bytes → ${out}`);
  }
} finally {
  await browser.close();
}
