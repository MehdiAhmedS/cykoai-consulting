#!/usr/bin/env node
/**
 * The hero globe's still frame (v3 step 05b), rendered by the globe engine itself.
 *
 * Usage (with `npm run dev` running):
 *   node scripts/render-globe-still.mjs [--url=http://localhost:3000/?globe-still]
 *
 * Opens the page with the dev-only `?globe-still` flag, which renders the
 * scene (72° east, the three client arcs in full at 80%, transparent
 * background) at 1600 × 1600 and sets `window.__globeStill` to WebP data URLs
 * at 1600 and 800 px. Chrome encodes the WebP. Writes
 * public/assets/gen/globe-still-1600.webp and globe-still-800.webp.
 *
 * Set PW_CHROMIUM to a Chrome binary to render on the real GPU instead of
 * Playwright's software WebGL (as ref-shots does).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const URL = typeof args.url === "string" ? args.url : "http://localhost:3000/?globe-still";

const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: "networkidle" });
  const handle = await page.waitForFunction(() => window.__globeStill, null, { timeout: 60_000 });
  const still = await handle.jsonValue();
  if (still.error) throw new Error(`the page could not render the still frame: ${still.error}`);
  for (const size of [1600, 800]) {
    const data = still[size];
    if (!data?.startsWith("data:image/webp;base64,")) throw new Error(`no WebP at ${size} px (got ${data?.slice(0, 30)})`);
    const buf = Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
    const out = resolve(`public/assets/gen/globe-still-${size}.webp`);
    writeFileSync(out, buf);
    console.log(`${size} px: ${buf.length} bytes → ${out}`);
  }
} finally {
  await browser.close();
}
