#!/usr/bin/env node
/**
 * Land dots for the hero globe (v3 step 05b).
 *
 * Usage: node scripts/gen-globe-land.mjs
 *
 * Lays a Fibonacci lattice of 42,000 points over the sphere, keeps those on
 * land (world-atlas land-50m) north of 60°S, and writes them to
 * public/assets/globe-land.bin as little-endian Int16 pairs: latitude × 100,
 * longitude × 100. Point i of N: y = 1 − (i + 0.5)·2/N, r = √(1 − y²),
 * θ = i·π(3 − √5), x = cos θ·r, z = sin θ·r. The globe's convention is
 * x = cos(lat)·sin(lng), y = sin(lat), z = cos(lat)·cos(lng), so a point's
 * longitude is atan2(x, z).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { feature } from "topojson-client";
import { geoBounds, geoContains } from "d3-geo";

const N = 42_000;
const SOUTH_LIMIT = -60;
const OUT = resolve("public/assets/globe-land.bin");
const R2D = 180 / Math.PI;

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8"));
const land = feature(topo, topo.objects.land);
const geometries = (land.type === "FeatureCollection" ? land.features : [land]).map((f) => f.geometry);

// One feature per polygon with its bounds, so each point is only tested
// against the few polygons that could contain it.
const rings = geometries.flatMap((g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates));
const polygons = rings.map((coordinates) => {
  const f = { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates } };
  const [[west, south], [east, north]] = geoBounds(f);
  return { f, west, south, east, north };
});

const inBounds = (p, lng, lat) => {
  if (lat < p.south || lat > p.north) return false;
  // Bounds that cross the antimeridian have west > east.
  return p.west <= p.east ? lng >= p.west && lng <= p.east : lng >= p.west || lng <= p.east;
};

const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - ((i + 0.5) * 2) / N;
  const r = Math.sqrt(1 - y * y);
  const t = i * golden;
  const x = Math.cos(t) * r;
  const z = Math.sin(t) * r;
  const lat = Math.asin(y) * R2D;
  const lng = Math.atan2(x, z) * R2D;
  if (lat <= SOUTH_LIMIT) continue;
  if (polygons.some((p) => inBounds(p, lng, lat) && geoContains(p.f, [lng, lat]))) {
    out.push(Math.round(lat * 100), Math.round(lng * 100));
  }
}

const buf = Buffer.alloc(out.length * 2);
out.forEach((v, k) => buf.writeInt16LE(v, k * 2));
writeFileSync(OUT, buf);
console.log(`${out.length / 2} land points, ${buf.length} bytes → ${OUT}`);
