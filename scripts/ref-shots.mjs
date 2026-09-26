#!/usr/bin/env node
/**
 * ref-shots: capture a reference website so it can be studied, not copied.
 *
 * Usage:
 *   node scripts/ref-shots.mjs <section> <url> [options]
 *
 *   <section>        folder name under docs/v3/references/ (e.g. projects, nav, hero-text)
 *   <url>            the page to study
 *
 * Options:
 *   --at="text"      scroll to the first element containing this text and capture it
 *                    three times (on arrival, +0.7s, +2.2s) to catch scroll-triggered reveals
 *   --frames         capture the first 2.5s after load (0, 250, 600, 1000, 1600, 2500 ms)
 *                    to see how the page animates in
 *   --flow[=N]       scroll through the page, one capture per ~0.9 viewport (default 8)
 *   --mobile         repeat everything at 390x844 as well as 1440x900
 *   --probe          save measured styles (header/nav, h1, first h2, plus --probe-sel)
 *                    and the list of loaded fonts to manifest.json
 *   --probe-sel=".a,.b"  extra CSS selectors to measure with --probe
 *   --full           also save one full-page capture (can be very tall)
 *   --wait=ms        settle time after load before the first capture (default 2500)
 *
 * Output: docs/v3/references/<section>/live/<host>/<viewport>-<kind>[-n].jpg
 *         and manifest.json in the same folder (url, options, files, probes, errors).
 *
 * House rules: study layout, hierarchy, spacing, type and motion; never copy a
 * reference's code, text, images or brand assets. The script never logs in or
 * submits forms; for cookie banners it only ever clicks a reject/necessary-only
 * option or closes the banner.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  argv
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const i = a.indexOf("=");
      return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)];
    })
);

const [section, url] = positional;
if (!section || !url) {
  console.error('Usage: node scripts/ref-shots.mjs <section> <url> [--at="text"] [--frames] [--flow[=N]] [--mobile] [--probe] [--full]');
  process.exit(2);
}

const WAIT = Number(flags.wait ?? 2500);
const FLOW = flags.flow === undefined ? 0 : flags.flow === true ? 8 : Number(flags.flow);
const FRAME_TIMES = [0, 250, 600, 1000, 1600, 2500];
const host = new URL(url).host.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "-");
const pathSlug = new URL(url).pathname.replace(/\/+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
const OUT = resolve("docs/v3/references", section, "live", pathSlug ? `${host}-${pathSlug}` : host);
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" },
  ...(flags.mobile ? [{ name: "mobile", width: 390, height: 844, ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", mobile: true }] : []),
];

const manifest = { url, section, capturedAt: new Date().toISOString(), options: flags, files: [], probes: {}, errors: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, vp, kind, n) {
  const file = join(OUT, `${vp.name}-${kind}${n === undefined ? "" : `-${n}`}.jpg`);
  try {
    await page.screenshot({ path: file, type: "jpeg", quality: 80, fullPage: kind === "full" });
    manifest.files.push(file);
    console.log("saved", file);
  } catch (e) {
    manifest.errors.push(`${vp.name} ${kind}: ${e.message.split("\n")[0]}`);
  }
}

// Privacy-preserving consent handling: reject / necessary-only first, otherwise close.
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

async function probe(page) {
  const extra = typeof flags["probe-sel"] === "string" ? flags["probe-sel"].split(",").map((s) => s.trim()).filter(Boolean) : [];
  return page.evaluate((selectors) => {
    const props = ["font-family", "font-weight", "font-size", "letter-spacing", "line-height", "font-stretch", "font-variation-settings", "text-transform", "color", "background-color", "backdrop-filter", "border-bottom", "border-radius", "box-shadow", "position", "top", "height", "mix-blend-mode", "transition"];
    const out = {};
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out[sel] = Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]).filter(([, v]) => v && v !== "none" && v !== "normal" && v !== "auto"));
      out[sel]["text"] = (el.textContent || "").trim().slice(0, 80);
    }
    const fonts = [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family.replace(/"/g, "")} ${f.weight} ${f.stretch}`))];
    const tech = {
      canvas: document.querySelectorAll("canvas").length,
      webgl: [...document.querySelectorAll("canvas")].some((c) => { try { return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }),
      scripts: [...document.scripts].map((s) => s.src).filter((s) => /three|cobe|globe|mapbox|gsap|lenis|locomotive|framer-motion|splittext/i.test(s)).slice(0, 12),
    };
    return { elements: out, fonts, tech };
  }, ["header", "nav", "h1", "h2", ...extra]).catch((e) => ({ error: e.message }));
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.PW_CHROMIUM || undefined });
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.ua,
      isMobile: !!vp.mobile,
      hasTouch: !!vp.mobile,
      locale: "en-US",
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    try {
      if (flags.frames) {
        const t0 = Date.now();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
        for (const [i, t] of FRAME_TIMES.entries()) {
          const wait = t - (Date.now() - t0);
          if (wait > 0) await sleep(wait);
          await shot(page, vp, "frame", `${i}-${t}ms`);
        }
      } else {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      }
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await sleep(WAIT);
      manifest[`consent-${vp.name}`] = await dismissConsent(page);
      await shot(page, vp, "top");

      if (typeof flags.at === "string") {
        const target = page.getByText(flags.at, { exact: false }).first();
        try {
          await target.scrollIntoViewIfNeeded({ timeout: 8000 });
          await shot(page, vp, "at", 0);
          await sleep(700);
          await shot(page, vp, "at", 1);
          await sleep(1500);
          await shot(page, vp, "at", 2);
        } catch (e) {
          manifest.errors.push(`${vp.name} --at "${flags.at}": not found or not scrollable`);
        }
      }

      if (FLOW > 0) {
        await page.mouse.move(vp.width / 2, vp.height / 2);
        await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
        await sleep(600);
        let lastY = -1;
        for (let i = 0; i < FLOW; i++) {
          await page.mouse.wheel(0, Math.round(vp.height * 0.9));
          await sleep(1100);
          const y = await page.evaluate(() => window.scrollY).catch(() => null);
          await shot(page, vp, "flow", String(i + 1).padStart(2, "0"));
          if (y !== null && y === lastY) break; // reached the bottom (or the page scrolls itself)
          lastY = y;
        }
      }

      if (flags.full) await shot(page, vp, "full");
      if (flags.probe) manifest.probes[vp.name] = await probe(page);
    } catch (e) {
      manifest.errors.push(`${vp.name}: ${e.message.split("\n")[0]}`);
      await shot(page, vp, "error-state");
    }
    await context.close();
  }
} finally {
  await browser.close();
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\n${manifest.files.length} captures in ${OUT}`);
  if (manifest.errors.length) console.log("Issues:\n- " + manifest.errors.join("\n- "));
}
