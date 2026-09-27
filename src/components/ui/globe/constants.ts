/**
 * Hero globe values (v3 step 05b), from the Cowork study
 * (docs/v3/references/globe/study/index.html) as written out in
 * docs/v3/prompts/05b-globe-threejs.md. Plain values only: HeroGlobe imports
 * this file, so it must never import three.
 *
 * Units: lengths are in sphere radii (the globe is a unit sphere), angles in
 * degrees, times in seconds, screen distances in CSS px.
 */

/** The engine runs from this viewport width up; below it the hero shows the still frame. */
export const ENGINE_MIN_WIDTH = 900;

export const LAND_URL = "/assets/globe-land.bin";

export const RENDERER = {
  maxPixelRatio: 2,
  /** Lower pixel ratios, tried in turn while the mean frame time stays too long. */
  pixelRatioTiers: [1.5, 1],
  qualityWindow: 3,
  qualityMaxMeanMs: 20,
} as const;

/** From 4.18 units, fov 30° makes the sphere fill 92% of the canvas height. */
export const CAMERA = { fov: 30, distance: 4.18, near: 0.1, far: 50 } as const;

/** North toward the viewer (the tilt group's rotation.x). */
export const TILT = 13;

/** Front longitude = centre − amplitude · sin(2πt / period): 62° to 100° east. */
export const SWAY = { centre: 81, amplitude: 19, period: 44 } as const;

export const SPHERE = {
  widthSegments: 128,
  heightSegments: 96,
  lit: "#1a2a49",
  shade: "#0e1930",
  /** smoothstep range over the half-Lambert term. */
  rampFrom: 0.15,
  rampTo: 0.95,
  rim: "#aeb8c8",
  rimAmount: 0.3,
  /** Fresnel from which the rim colour mixes in. */
  rimFrom: 0.93,
  /** Fixed in view space. */
  light: [-0.55, 0.62, 0.56],
} as const;

export const LAND = {
  radius: 1.0015,
  dotRadius: 0.0043,
  dotSides: 6,
  color: "#aeb8c8",
  opacity: 0.46,
  /** Dots fade toward the rim: smoothstep(0, fadeTo, facing). */
  fadeTo: 0.5,
} as const;

export const GRATICULE = {
  radius: 1.002,
  meridianStep: 30,
  parallels: [-60, -30, 0, 30, 60],
  /** Segment length along each line. */
  sample: 2,
  opacity: 0.075,
  fadeTo: 0.4,
} as const;

export const MARKER = {
  radius: 1.0035,
  segments: 40,
  origin: { color: "#d4b483", size: 0.017, opacity: 1 },
  client: { color: "#ad8752", size: 0.0105, opacity: 1 },
  decorative: { color: "#ad8752", size: 0.0105, opacity: 0.7 },
} as const;

/** Rings (Muscat's pulse and landings) share one geometry: inner 0.8, outer 1. */
export const RING = { inner: 0.8, outer: 1, segments: 64, radius: 1.004 } as const;

export const PULSE = {
  color: "#d4b483",
  period: 4,
  duration: 2.6,
  /** Grows from Muscat's marker size to this many times it. */
  scaleTo: 3.8,
  opacity: 0.42,
} as const;

export const ARC = {
  /** The ends sit just above the surface so the tube doesn't sink into it. */
  baseRadius: 1.004,
  /** H = clamp(liftPerRadian × angle, liftMin, liftMax). */
  liftPerRadian: 0.4,
  liftMin: 0.03,
  liftMax: 0.2,
  points: 65,
  tubularSegments: 160,
  radialSegments: 8,
  tubeRadius: 0.0033,
  color: "#bb9259",
  hot: "#f3e2c2",
  /** The last 16% of the lit span warms while drawing. */
  hotFrom: 0.84,
  tailOpacity: 0.2,
  /** Opacity reaches 1 over this share of the lit span. */
  rampTo: 0.6,
  draw: 1.5,
  tailAt: 2.1,
  tail: 1.0,
  life: 3.1,
} as const;

export const HEAD = {
  color: "#f3e2c2",
  opacity: 0.95,
  /** Sprite scale; the disc fills `disc` of the quad, about 8 px across at 1440 × 900. */
  scale: 0.022,
  disc: 0.76,
  texture: 64,
  fade: 0.3,
} as const;

export const LANDING = {
  color: "#d4b483",
  from: 0.011,
  to: 0.071,
  duration: 1.3,
  opacity: 0.55,
  /** The destination marker swells to this and back (a sine bump). */
  bump: 1.7,
  bumpDuration: 0.8,
} as const;

export const CADENCE = { first: 0.9, every: 1.3, retry: 0.8, maxInFlight: 3 } as const;

export const TARGET = {
  minFacing: 0.3,
  originMinFacing: 0.15,
  /** Space to spare inside the hero, in CSS px. */
  left: 16,
  right: 30,
  top: 10,
  bottom: 10,
} as const;

/** Points projected along an arc, now and `ahead` seconds on, against the headline's line boxes grown by `grow`. */
export const GUARD = { samples: 9, ahead: 3.1, grow: 24 } as const;

export const LABEL = {
  gap: 12,
  edge: 12,
  fadeIn: 0.25,
  outAt: 2.6,
  fadeOut: 0.3,
  replace: 0.2,
  /** Hysteresis on facing: shows from `show`, hides below `hide`. */
  show: 0.12,
  hide: 0.02,
} as const;

export const RUN = { maxDt: 0.05, pauseMargin: 160 } as const;

export const DRAW_ORDER = { sphere: 0, dots: 1, graticule: 2, arcs: 3, markers: 4, rings: 5, heads: 6 } as const;

/** The pre-rendered still frame: phones, reduced motion, no WebGL. */
export const STILL = {
  front: 72,
  arcOpacity: 0.8,
  size: 1600,
  small: 800,
  quality: 0.8,
  files: { 800: "/assets/gen/globe-still-800.webp", 1600: "/assets/gen/globe-still-1600.webp" },
} as const;
