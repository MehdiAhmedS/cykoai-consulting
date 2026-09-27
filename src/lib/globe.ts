/**
 * Hero globe maths and timings (v3 step 05).
 *
 * The projection reproduces cobe 2.0.1 exactly (node_modules/cobe/dist/
 * index.esm.js: `U()` for latitude/longitude and `O()` for the rotation and
 * screen mapping), so HeroGlobe's 2D overlay lands on cobe's own markers.
 * WorldCanvas, the no-WebGL fallback, uses the same functions, so both draw
 * the same correctly handed globe (v1's was mirrored east–west).
 */

export type Vec3 = readonly [number, number, number];
/** Row-major 3×3 rotation, as cobe's `O()` applies it. */
export type Rotation = readonly [number, number, number, number, number, number, number, number, number];

const { PI, sin, cos, acos, pow } = Math;
const D2R = PI / 180;
export const TAU = PI * 2;

/** North pole toward the viewer by 13° (Mehdi, 27 Sep): cobe's positive theta. */
export const THETA = 13 * D2R;
/** One turn every 110 s (v1's pace), driven by elapsed time, never per frame. */
export const PERIOD_MS = 110_000;
/**
 * The animated start turns the origin this far west of centre, onto the
 * uncropped side: far enough that all three client arcs (6.7 s each) play
 * before the origin turns under the hero's right-edge crop.
 */
export const START_OFFSET_DEG = 45;
/** cobe's `scale` option. */
export const GLOBE_SCALE = 1;
/** cobe's sphere radius in its own units (the shader's `a<=.64`). */
export const SPHERE = 0.8;
/**
 * cobe 2 draws markers as discs of radius size·scale·height/4, about three
 * times the area of 0.6's soft dots for the same number (Mehdi, 27 Sep:
 * match the intended look). Roughly 14 px and 8 px across at 810 px.
 */
export const MARKER_SIZE = { origin: 0.035, client: 0.02 } as const;

/** v1's arc lifecycle: one at a time, draw → hold → fade → gap (ms). */
export const ARC = {
  first: 1200,
  retry: 2000,
  draw: 3200,
  hold: 900,
  fade: 1200,
  gap: 1400,
  lift: 0.07,
  segments: 64,
} as const;

/** v1's origin pulse: a Driftwood ring every 4 s. */
export const PULSE = { period: 4000, grow: 14, alpha: 0.3 } as const;

/** v1's arc easing: cubic ease-out. */
export const easeOutCubic = (t: number) => 1 - pow(1 - t, 3);

/** cobe's `U()`: latitude and longitude in degrees → unit vector. */
export function toXYZ(lat: number, lng: number): Vec3 {
  const r = lat * D2R;
  const a = lng * D2R - PI;
  const o = cos(r);
  return [-o * cos(a), sin(r), o * sin(a)];
}

/** cobe's `O()` rotation: phi about the vertical axis, then theta. z > 0 faces the viewer. */
export function rotation(phi: number, theta: number): Rotation {
  const cT = cos(theta);
  const cP = cos(phi);
  const sT = sin(theta);
  const sP = sin(phi);
  return [cP, 0, sP, sP * sT, cT, -cP * sT, -sP * cT, sT, cP * cT];
}

export function rotate(m: Rotation, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/** The phi that turns longitude `lng` (degrees) to face the viewer. Increasing phi slides land left to right. */
export const phiFacing = (lng: number) => -PI / 2 - lng * D2R;

/** Sphere radius on screen, in CSS px, for a globe canvas `height` px tall. */
export const sphereRadius = (height: number, scale = GLOBE_SCALE) => (SPHERE / 2) * scale * height;

/** Marker disc radius on screen, in CSS px (cobe 2's marker quad). */
export const markerRadius = (size: number, height: number, scale = GLOBE_SCALE) => (size * scale * height) / 4;

/**
 * cobe's `O()` screen mapping (offset 0) for a rotated unit vector scaled by
 * `k` (1 on the surface): CSS px within a `w`×`h` canvas whose backing store
 * has the ratio `aspect`.
 */
export function screen(p: Vec3, w: number, h: number, aspect: number, k = 1, scale = GLOBE_SCALE): [number, number] {
  const x = p[0] * SPHERE * k;
  const y = p[1] * SPHERE * k;
  return [((x / aspect) * scale + 1) * 0.5 * w, (-y * scale + 1) * 0.5 * h];
}

/** Great-circle interpolation between two unit vectors. */
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const d = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = acos(d);
  const so = sin(om) || 1e-6;
  const s0 = sin((1 - t) * om) / so;
  const s1 = sin(t * om) / so;
  return [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1];
}
