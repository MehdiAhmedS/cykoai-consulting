#!/usr/bin/env node
/**
 * §5 verification loop screenshots (REDESIGN_PLAN.md).
 *
 * Usage:
 *   node scripts/verify-shots.mjs [--url=http://localhost:3000] [--out=DIR]
 *     [--section=#services]   scope shots to one element (default: full page)
 *     [--reduced]             also run the prefers-reduced-motion pass
 *     [--assets-off]          also run with [data-gen-asset] display:none
 *     [--full]                full matrix (= --reduced --assets-off)
 *
 * Every run covers 390 / 768 / 1440 widths and captures console output;
 * any console error fails the run (exit 1).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const URL = args.url ?? "http://localhost:3000";
const OUT = resolve(args.out ?? "shots");
const SECTION = typeof args.section === "string" ? args.section : null;
const RUN_REDUCED = Boolean(args.reduced || args.full);
const RUN_ASSETS_OFF = Boolean(args["assets-off"] || args.full);

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const ASSETS_OFF_CSS = "[data-gen-asset]{display:none !important}";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const consoleErrors = [];
let shots = 0;

async function capture(page, label) {
  if (SECTION) {
    const el = page.locator(SECTION).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900); // let reveals settle
    await el.screenshot({ path: `${OUT}/${label}.png` });
  } else {
    await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });
  }
  shots++;
}

async function run({ reduced, assetsOff }) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: reduced ? "reduce" : "no-preference",
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`[${vp.name}] ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(`[${vp.name}] pageerror: ${err.message}`);
    });

    await page.goto(URL, { waitUntil: "networkidle" });
    if (assetsOff) await page.addStyleTag({ content: ASSETS_OFF_CSS });
    // Scroll the whole page once so lazy content and reveals fire.
    await page.evaluate(async () => {
      const step = window.innerHeight / 2;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    // The hero globe loads after idle and fades in after the headline (v3 step 05).
    await page
      .waitForFunction(() => !document.querySelector('[data-globe="loading"]'), null, { timeout: 8000 })
      .catch(() => {});
    await page.waitForTimeout(600);

    const suffix = `${reduced ? "-rm" : ""}${assetsOff ? "-noassets" : ""}`;
    await capture(page, `${SECTION ? SECTION.replace(/[^a-z0-9-]/gi, "") + "-" : ""}${vp.name}${suffix}`);
    await context.close();
  }
}

await run({ reduced: false, assetsOff: false });
if (RUN_REDUCED) await run({ reduced: true, assetsOff: false });
if (RUN_ASSETS_OFF) await run({ reduced: false, assetsOff: true });

await browser.close();

console.log(`${shots} screenshots → ${OUT}`);
if (consoleErrors.length) {
  console.error(`\nCONSOLE ERRORS (${consoleErrors.length}):`);
  for (const e of consoleErrors) console.error("  " + e);
  process.exit(1);
}
console.log("console clean");
