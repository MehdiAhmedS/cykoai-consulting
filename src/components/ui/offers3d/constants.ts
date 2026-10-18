/**
 * Offers pieces values (v3 step 06), from the Cowork study
 * (docs/v3/references/offers/study/index.html) as written out in
 * docs/v3/prompts/06-offers.md. Plain values only: the Offers list imports
 * this file, so it must never import three.
 *
 * Colours are hex strings, rendered as written (the engine turns three's
 * colour management off). Geometry, opacities and timings stay in the
 * builders (./scenes), ported from the study as they are.
 */

/** The engine runs from this viewport width up; below it each piece is a still image. */
export const ENGINE_MIN_WIDTH = 900;

export const COLOR = {
  white: "#FFFFFF",
  n300: "#B4B9C4",
  n500: "#6B7385",
  n700: "#3A4356",
  windsor: "#0B1527",
  driftwood: "#AD8752",
  driftwoodSoft: "#D4B483",
} as const;

/** Lit and shade pairs for the solids' ramp, by what they are. */
export const SOLID = {
  /** The study's ramp default. */
  base: { lit: "#2A4170", shade: "#101B31" },
  plate: { lit: "#26406B", shade: "#0F1A30" },
  /** The workspace core and shell, and the bot's container. */
  core: { lit: "#36548A", shade: "#13203A" },
  torus: { lit: "#3A5A93", shade: "#13203A" },
  task: { lit: "#5A6D93", shade: "#1D2C4B" },
  /** The phone, the devices and the bot's services. */
  device: { lit: "#2C4574", shade: "#101B31" },
  bot: { lit: "#3E5F99", shade: "#13203A" },
  page: { lit: "#22365C", shade: "#101B31" },
  /** HDT Systems' locked rings and shield: Driftwood-soft, and the gold's shade. */
  gold: { lit: COLOR.driftwoodSoft, shade: "#6E5530" },
} as const;

/**
 * The solids' shading, as the globe's: half-Lambert blended shade → lit over
 * smoothstep(from, to), light fixed in view space, an n300 rim over Fresnel
 * rimFrom → rimTo. `rim` is the study's default amount.
 */
export const RAMP = { light: [-0.55, 0.62, 0.56], from: 0.15, to: 0.95, rimFrom: 0.55, rimTo: 1.0, rimColor: COLOR.n300, rim: 0.26 } as const;

export const CAMERA = { fov: 30, aspect: 1.6, near: 0.1, far: 60 } as const;

export const DRAW = {
  /** At most this many pieces draw at once: the open rows nearest the viewport's centre. */
  max: 3,
  /** A piece draws while its canvas is within this many CSS px of the viewport. */
  edge: 40,
  /** Elapsed time advances by at most 50 ms a frame. */
  maxDt: 0.05,
  maxPixelRatio: 2,
} as const;

/** Rows open when their top rises above 66% of the viewport, and close below 78%. */
export const OPEN = { at: 0.66, closeAt: 0.78 } as const;

export const REFRESH = {
  debounce: 150,
  /** A refresh slower than this defers later ones until Lenis stops. */
  slow: 8,
  /** A jump's glide lets rows open but not close, for at most this long. */
  holdMax: 2500,
} as const;

/** How long the engine waits for the globe before loading anyway. */
export const GLOBE_WAIT = 3000;

/** The still images: phones, reduced motion, no WebGL 2, `?offers-fallback`. */
export const STILL = { width: 1600, height: 1000, quality: 0.8 } as const;
export const stillFile = (id: string) => `/assets/gen/offer-${id}-1600.webp`;

export type PieceKey = "security" | "workspace" | "automation" | "mobile" | "bot" | "profile";

/** Offer id (site.ts) → the study's builder. */
export const PIECES: Record<string, PieceKey> = {
  "security-reviews": "security",
  "workspace-hardening": "workspace",
  "ai-automation": "automation",
  "mobile-iot": "mobile",
  "apis-bots": "bot",
  "landing-pages": "profile",
};

/* ---- The Projects stage piece (v3 step 07b) ---- */

export type StagePieceKey = "hdt";

export const stagePieceStill = (key: StagePieceKey) => `/assets/gen/project-${key}-1600.webp`;

export const STAGE = {
  /** The sequence clock starts when the layer's wipe reaches this. */
  startAt: 0.5,
  /** The piece draws while the stage is within this many CSS px of the viewport. */
  edge: 40,
} as const;
