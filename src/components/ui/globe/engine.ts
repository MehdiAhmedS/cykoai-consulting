/**
 * The hero globe's engine (v3 step 05b): plain three.js, ported from the
 * Cowork study (docs/v3/references/globe/study/index.html) with Mehdi's picks:
 * overlapping arcs, the sway, all nine places, neutral dots, a hairline rim.
 * Arcs fly out from Muscat, back to it, and between the other places (27 Sep).
 *
 * Client-only. HeroGlobe loads it with a dynamic import() after the headline
 * settles, so three sits in its own chunk and phones never download it.
 * Imports from "three" by name only, so the chunk carries only what the
 * globe uses. Every value is in ./constants.
 */
import {
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ColorManagement,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  LineSegments,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  getConsoleFunction,
  setConsoleFunction,
  type Material,
  type Object3D,
} from "three";
import type { GlobeLocation } from "@/content/site";
import { whenIdle } from "@/lib/idle";
import {
  ARC,
  CADENCE,
  CAMERA,
  DRAW_ORDER,
  GRATICULE,
  GUARD,
  HEAD,
  LABEL,
  LAND,
  LANDING,
  MARKER,
  PULSE,
  RENDERER,
  RING,
  ROUTES,
  RUN,
  SPHERE,
  STILL,
  SWAY,
  TARGET,
  TILT,
} from "./constants";

export interface GlobeDebugState {
  fps: number;
  frameCost: { n: number; mean: number; p95: number };
  calls: number;
  frame: number;
  front: number;
  pixelRatio: number;
  elapsed: number;
  running: boolean;
  size: { w: number; h: number };
  arcs: { name: string; t: number; landed: boolean; points: [number, number][] }[];
  label: { name: string; opacity: number } | null;
}

declare global {
  interface Window {
    __globe?: { state: () => GlobeDebugState };
  }
}

export interface GlobeOptions {
  /** Receives a fresh <canvas>; its layout size sizes the renderer. */
  host: HTMLElement;
  /** The single caption chip, for client names. */
  caption: HTMLElement;
  /** Arcs land inside it, and drawing pauses while it is off screen. */
  hero: HTMLElement;
  /** The headline's text (`[data-hero-lines]`): arcs keep off its line boxes. */
  headline: HTMLElement | null;
  /** From site.ts, in order; only confirmed places are drawn. */
  places: GlobeLocation[];
  /** globe-land.bin: Int16 pairs of latitude × 100 and longitude × 100. */
  land: ArrayBuffer;
  debug: boolean;
  onFirstFrame: () => void;
  /** No WebGL 2 context, or the renderer could not start. */
  onFail: () => void;
  /** The context was lost without a deliberate teardown. */
  onLost: () => void;
}

const D2R = Math.PI / 180;
const TAU = Math.PI * 2;
const Z = new Vector3(0, 0, 1);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Front longitude t seconds after the globe appears: the sway. */
const frontAt = (t: number) => SWAY.centre - SWAY.amplitude * Math.sin((TAU * t) / SWAY.period);

/** The study's convention: x = cos(lat)·sin(lng), y = sin(lat), z = cos(lat)·cos(lng). */
function toVec(lat: number, lng: number, out = new Vector3()) {
  const la = lat * D2R;
  const lo = lng * D2R;
  return out.set(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo));
}

/** Great-circle interpolation between two unit vectors. */
function slerp(a: Vector3, b: Vector3, t: number, out = new Vector3()) {
  const w = Math.acos(Math.min(1, Math.max(-1, a.dot(b))));
  if (w < 1e-6) return out.copy(a);
  const s = Math.sin(w);
  return out.copy(a).multiplyScalar(Math.sin((1 - t) * w) / s).addScaledVector(b, Math.sin(t * w) / s);
}

/** Places `obj` at radius r above unit vector v, its +z facing outward. */
function onSurface<T extends Object3D>(obj: T, v: Vector3, r: number) {
  obj.position.copy(v).multiplyScalar(r);
  obj.quaternion.setFromUnitVectors(Z, v);
  return obj;
}

/**
 * Creates the WebGL 2 context itself and hands it to three, so a missing
 * context never makes three log an error (verify-shots fails on any). Anything
 * three reports while it starts is downgraded to a warning.
 */
function createRenderer(canvas: HTMLCanvasElement, preserveDrawingBuffer: boolean) {
  const attributes: WebGLContextAttributes = {
    alpha: true,
    depth: true,
    stencil: false,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer,
    powerPreference: "high-performance",
  };
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", attributes);
  } catch {
    return null;
  }
  if (!gl) return null;
  const previous = getConsoleFunction();
  setConsoleFunction((type, message, ...params) => (type === "log" ? console.log : console.warn)(message, ...params));
  try {
    // Hex values render as written.
    ColorManagement.enabled = false;
    const renderer = new WebGLRenderer({ canvas, context: gl, ...attributes });
    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    return renderer;
  } catch {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  } finally {
    setConsoleFunction(previous);
  }
}

/* ---------- shaders (the study's) ---------- */

const SPHERE_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

// Half-Lambert light-to-shade ramp, then the hairline rim over the last of the Fresnel term.
const SPHERE_FRAG = /* glsl */ `
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uRim;
uniform float uRimAmount;
uniform float uRimFrom;
uniform vec2 uRamp;
uniform vec3 uLight;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 n = normalize(vN);
  float l = dot(n, uLight) * 0.5 + 0.5;
  vec3 c = mix(uShade, uLit, smoothstep(uRamp.x, uRamp.y, l));
  float f = 1.0 - clamp(dot(n, normalize(vV)), 0.0, 1.0);
  c = mix(c, uRim, smoothstep(uRimFrom, 1.0, f) * uRimAmount);
  gl_FragColor = vec4(c, 1.0);
}`;

// "Facing": the outward normal against the direction to the camera, not the normal's z.
const DOT_VERT = /* glsl */ `
uniform float uFadeTo;
varying float vA;
void main() {
  vec4 c = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 o = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vA = smoothstep(0.0, uFadeTo, dot(normalize(c.xyz - o.xyz), normalize(-c.xyz)));
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`;

const GRID_VERT = /* glsl */ `
uniform float uFadeTo;
varying float vA;
void main() {
  vec4 c = modelViewMatrix * vec4(position, 1.0);
  vec4 o = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vA = smoothstep(0.0, uFadeTo, dot(normalize(c.xyz - o.xyz), normalize(-c.xyz)));
  gl_Position = projectionMatrix * c;
}`;

const FADE_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vA;
void main() {
  gl_FragColor = vec4(uColor, uOpacity * vA);
}`;

// uv.x runs from a route's first place to its second; uReverse flies it the other way.
const ARC_VERT = /* glsl */ `
uniform float uReverse;
varying float vT;
void main() {
  vT = mix(uv.x, 1.0 - uv.x, uReverse);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// uv.x runs along the arc: only [tail, head] is lit. uFlat draws the still frame's full, even arcs.
const ARC_FRAG = /* glsl */ `
uniform float uHead;
uniform float uTail;
uniform float uAlpha;
uniform float uFlat;
uniform float uFlatAlpha;
uniform float uTailAlpha;
uniform float uRampTo;
uniform float uHotFrom;
uniform vec3 uColor;
uniform vec3 uHot;
varying float vT;
void main() {
  if (vT > uHead || vT < uTail) discard;
  float k = clamp((vT - uTail) / max(uHead - uTail, 1e-4), 0.0, 1.0);
  float a = mix(uTailAlpha + (1.0 - uTailAlpha) * smoothstep(0.0, uRampTo, k), uFlatAlpha, uFlat);
  vec3 c = mix(uColor, uHot, smoothstep(uHotFrom, 1.0, k) * step(uHead, 0.999) * (1.0 - uFlat));
  gl_FragColor = vec4(c, a * uAlpha);
}`;

/* ---------- the scene ---------- */

interface Place {
  loc: GlobeLocation;
  /** Unit vector. */
  v: Vector3;
  size: number;
  marker: Mesh;
  /** Elapsed time of the last landing here. */
  bump: number;
}

/** A great circle between two places, built once and flown either way. */
interface Route {
  a: Place;
  b: Place;
  /** Runs from a to b. */
  curve: CatmullRomCurve3;
  tube: TubeGeometry;
  /** The headline guard's sample points (the same either way). */
  guard: Vector3[];
}

interface Flight {
  route: Route;
  from: Place;
  to: Place;
  /** Flown from b to a. */
  reverse: boolean;
}

function buildWorld(locations: GlobeLocation[], land: ArrayBuffer) {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const geo = <T extends BufferGeometry>(g: T) => (geometries.push(g), g);
  const mat = <T extends Material>(m: T) => (materials.push(m), m);
  const layer = { transparent: true, depthWrite: false } as const;

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
  camera.position.set(0, 0, CAMERA.distance);
  camera.updateMatrixWorld();
  const tilt = new Group();
  tilt.rotation.x = TILT * D2R;
  scene.add(tilt);
  const earth = new Group();
  tilt.add(earth);

  const sphere = new Mesh(
    geo(new SphereGeometry(1, SPHERE.widthSegments, SPHERE.heightSegments)),
    mat(
      new ShaderMaterial({
        uniforms: {
          uLit: { value: new Color(SPHERE.lit) },
          uShade: { value: new Color(SPHERE.shade) },
          uRim: { value: new Color(SPHERE.rim) },
          uRimAmount: { value: SPHERE.rimAmount },
          uRimFrom: { value: SPHERE.rimFrom },
          uRamp: { value: [SPHERE.rampFrom, SPHERE.rampTo] },
          uLight: { value: new Vector3(...SPHERE.light).normalize() },
        },
        vertexShader: SPHERE_VERT,
        fragmentShader: SPHERE_FRAG,
      })
    )
  );
  sphere.renderOrder = DRAW_ORDER.sphere;
  earth.add(sphere);

  // Land: one instanced draw of outward-facing hexagons.
  const view = new DataView(land);
  const count = Math.floor(land.byteLength / 4);
  const dots = new InstancedMesh(
    geo(new CircleGeometry(LAND.dotRadius, LAND.dotSides)),
    mat(
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(LAND.color) },
          uOpacity: { value: LAND.opacity },
          uFadeTo: { value: LAND.fadeTo },
        },
        vertexShader: DOT_VERT,
        fragmentShader: FADE_FRAG,
        ...layer,
      })
    ),
    count
  );
  const m = new Matrix4();
  const q = new Quaternion();
  const n = new Vector3();
  const p = new Vector3();
  const one = new Vector3(1, 1, 1);
  for (let i = 0; i < count; i++) {
    toVec(view.getInt16(i * 4, true) / 100, view.getInt16(i * 4 + 2, true) / 100, n);
    dots.setMatrixAt(i, m.compose(p.copy(n).multiplyScalar(LAND.radius), q.setFromUnitVectors(Z, n), one));
  }
  dots.instanceMatrix.needsUpdate = true;
  dots.renderOrder = DRAW_ORDER.dots;
  earth.add(dots);

  // Graticule: meridians every 30°, the listed parallels, one draw.
  const pos: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const segment = (lat0: number, lng0: number, lat1: number, lng1: number) => {
    toVec(lat0, lng0, a).multiplyScalar(GRATICULE.radius);
    toVec(lat1, lng1, b).multiplyScalar(GRATICULE.radius);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };
  const s = GRATICULE.sample;
  for (let lng = -180; lng < 180; lng += GRATICULE.meridianStep) {
    for (let lat = -90; lat < 90; lat += s) segment(lat, lng, lat + s, lng);
  }
  for (const lat of GRATICULE.parallels) {
    for (let lng = -180; lng < 180; lng += s) segment(lat, lng, lat, lng + s);
  }
  const gridGeo = geo(new BufferGeometry());
  gridGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  const grid = new LineSegments(
    gridGeo,
    mat(
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(1, 1, 1) },
          uOpacity: { value: GRATICULE.opacity },
          uFadeTo: { value: GRATICULE.fadeTo },
        },
        vertexShader: GRID_VERT,
        fragmentShader: FADE_FRAG,
        ...layer,
      })
    )
  );
  grid.renderOrder = DRAW_ORDER.graticule;
  earth.add(grid);

  // Markers: Muscat, clients, and decorative places at 70%.
  const disc = geo(new CircleGeometry(1, MARKER.segments));
  const markerMat = {
    origin: mat(new MeshBasicMaterial({ color: MARKER.origin.color, opacity: MARKER.origin.opacity, ...layer })),
    client: mat(new MeshBasicMaterial({ color: MARKER.client.color, opacity: MARKER.client.opacity, ...layer })),
    decorative: mat(
      new MeshBasicMaterial({ color: MARKER.decorative.color, opacity: MARKER.decorative.opacity, ...layer })
    ),
  };
  const places: Place[] = locations
    .filter((l) => l.status === "confirmed")
    .map((loc) => {
      const v = toVec(loc.lat, loc.lng);
      const size = MARKER[loc.role].size;
      const marker = onSurface(new Mesh(disc, markerMat[loc.role]), v, MARKER.radius);
      marker.scale.setScalar(size);
      marker.renderOrder = DRAW_ORDER.markers;
      earth.add(marker);
      return { loc, v, size, marker, bump: -Infinity };
    });
  const origin = places.find((pl) => pl.loc.role === "origin") ?? null;
  const targets = origin ? places.filter((pl) => pl !== origin) : places;

  // Arcs: one great circle per pair of places, higher the farther it goes. Built once, flown either way.
  const routes: Route[] = [];
  for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) {
      const a = places[i];
      const b = places[j];
      const lift = Math.min(ARC.liftMax, Math.max(ARC.liftMin, ARC.liftPerRadian * a.v.angleTo(b.v)));
      const pts: Vector3[] = [];
      for (let k = 0; k < ARC.points; k++) {
        const u = k / (ARC.points - 1);
        pts.push(slerp(a.v, b.v, u).multiplyScalar(ARC.baseRadius + lift * Math.sin(Math.PI * u)));
      }
      const curve = new CatmullRomCurve3(pts, false, "centripetal");
      const tube = geo(new TubeGeometry(curve, ARC.tubularSegments, ARC.tubeRadius, ARC.radialSegments, false));
      const guard = Array.from({ length: GUARD.samples }, (_, k) => curve.getPointAt(k / (GUARD.samples - 1)));
      routes.push({ a, b, curve, tube, guard });
    }
  }

  const ringGeo = geo(new RingGeometry(RING.inner, RING.outer, RING.segments));
  const pulse = new Mesh(ringGeo, mat(new MeshBasicMaterial({ color: PULSE.color, opacity: 0, ...layer })));
  pulse.renderOrder = DRAW_ORDER.rings;
  pulse.visible = false;
  if (origin) earth.add(onSurface(pulse, origin.v, RING.radius));

  const arcMaterial = (flat: boolean) =>
    mat(
      new ShaderMaterial({
        uniforms: {
          uHead: { value: flat ? 1 : 0 },
          uTail: { value: 0 },
          uReverse: { value: 0 },
          uAlpha: { value: 1 },
          uFlat: { value: flat ? 1 : 0 },
          uFlatAlpha: { value: STILL.arcOpacity },
          uTailAlpha: { value: ARC.tailOpacity },
          uRampTo: { value: ARC.rampTo },
          uHotFrom: { value: ARC.hotFrom },
          uColor: { value: new Color(ARC.color) },
          uHot: { value: new Color(ARC.hot) },
        },
        vertexShader: ARC_VERT,
        fragmentShader: ARC_FRAG,
        ...layer,
      })
    );

  return {
    scene,
    camera,
    earth,
    places,
    origin,
    targets,
    routes,
    pulse,
    ringGeo,
    arcMaterial,
    mat,
    geo,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const x of materials) x.dispose();
    },
  };
}

/** A hard-edged disc for the arc's head point: no soft falloff, since nothing on the page glows. */
function discTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = HEAD.texture;
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(HEAD.texture / 2, HEAD.texture / 2, (HEAD.texture * HEAD.disc) / 2, 0, TAU);
    g.fill();
  }
  return new CanvasTexture(c);
}

/* ---------- the running globe ---------- */

interface ArcSlot {
  mesh: Mesh<BufferGeometry, ShaderMaterial>;
  head: Sprite;
  flight: Flight | null;
  t0: number;
  landed: boolean;
}

interface RingSlot {
  mesh: Mesh<RingGeometry, MeshBasicMaterial>;
  t0: number;
  active: boolean;
}

interface LabelOwner {
  place: Place;
  /** The arc's launch time. */
  t0: number;
  /** When this label started to fade in. */
  shownAt: number;
}

/**
 * Starts the globe in `o.host` and returns its teardown. The scene is built
 * now; the shaders compile in an idle slot of their own; then the first frame
 * is drawn and `onFirstFrame` fires.
 */
export function startGlobe(o: GlobeOptions): () => void {
  // A fresh canvas every start: one that has lost its context can't be reused.
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%";
  const renderer = createRenderer(canvas, false);
  if (!renderer) {
    o.onFail();
    return () => {};
  }
  o.host.append(canvas);

  const world = buildWorld(o.places, o.land);
  const { scene, camera, origin, targets, routes, pulse } = world;
  const caption = o.caption;
  const debug = o.debug;

  const dpr = Math.min(window.devicePixelRatio || 1, RENDERER.maxPixelRatio);
  const tiers: number[] = RENDERER.pixelRatioTiers.filter((r) => r < dpr);
  renderer.setPixelRatio(dpr);
  let w = 0;
  let h = 0;
  /** From layout, never getBoundingClientRect() under the parallax transform. */
  const size = () => {
    const nw = o.host.clientWidth;
    const nh = o.host.clientHeight;
    if (!nw || !nh || (nw === w && nh === h)) return false;
    w = nw;
    h = nh;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  };
  size();

  const tex = discTexture();
  const layer = { transparent: true, depthWrite: false } as const;
  const arcs: ArcSlot[] = Array.from({ length: CADENCE.maxInFlight }, () => {
    const mesh = new Mesh<BufferGeometry, ShaderMaterial>(
      routes[0]?.tube ?? world.geo(new BufferGeometry()),
      world.arcMaterial(false)
    );
    mesh.renderOrder = DRAW_ORDER.arcs;
    mesh.visible = false;
    world.earth.add(mesh);
    const head = new Sprite(world.mat(new SpriteMaterial({ map: tex, color: HEAD.color, opacity: HEAD.opacity, ...layer })));
    head.scale.setScalar(HEAD.scale);
    head.renderOrder = DRAW_ORDER.heads;
    head.visible = false;
    world.earth.add(head);
    return { mesh, head, flight: null, t0: 0, landed: false };
  });
  const rings: RingSlot[] = Array.from({ length: CADENCE.maxInFlight }, () => {
    const mesh = new Mesh(world.ringGeo, world.mat(new MeshBasicMaterial({ color: LANDING.color, opacity: 0, ...layer })));
    mesh.renderOrder = DRAW_ORDER.rings;
    mesh.visible = false;
    world.earth.add(mesh);
    return { mesh, t0: 0, active: false };
  });

  /* ---- projection ---- */

  const tiltM = new Matrix4().makeRotationX(TILT * D2R);
  /** The earth group's world matrix for a front longitude (the sway is deterministic). */
  const earthAt = (lng: number, out: Matrix4) => out.makeRotationY(-lng * D2R).premultiply(tiltM);
  const mNow = new Matrix4();
  const mAhead = new Matrix4();
  const wp = new Vector3();
  const tmp = new Vector3();
  const toCam = new Vector3();
  const pt = { x: 0, y: 0 };
  /** The study's facing(): the outward normal against the unit vector to the camera. */
  const facing = (world: Vector3) => tmp.copy(world).normalize().dot(toCam.copy(camera.position).sub(world).normalize());
  /** Canvas px of a world point. */
  const toCanvas = (world: Vector3) => {
    tmp.copy(world).project(camera);
    pt.x = (tmp.x * 0.5 + 0.5) * w;
    pt.y = (-tmp.y * 0.5 + 0.5) * h;
    return pt;
  };

  /** The headline's line boxes, from its text nodes (tight to the text, unlike the lines' block boxes). */
  const headlineBoxes = () => {
    const out: DOMRect[] = [];
    if (!o.headline) return out;
    const range = document.createRange();
    const walker = document.createTreeWalker(o.headline, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent?.trim()) continue;
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) if (r.width && r.height) out.push(r);
    }
    return out;
  };

  /** Whether the route, now or GUARD.ahead seconds on, passes over the headline. */
  const crossesHeadline = (route: Route, boxes: DOMRect[], box: DOMRect) => {
    if (!boxes.length) return false;
    const g = GUARD.grow;
    for (const m of [mNow, earthAt(frontAt(elapsed + GUARD.ahead), mAhead)]) {
      for (const local of route.guard) {
        toCanvas(wp.copy(local).applyMatrix4(m));
        const x = box.left + pt.x;
        const y = box.top + pt.y;
        for (const r of boxes) {
          if (x >= r.left - g && x <= r.right + g && y >= r.top - g && y <= r.bottom + g) return true;
        }
      }
    }
    return false;
  };

  /* ---- state ---- */

  let elapsed = 0;
  let front = frontAt(0);
  let nextLaunch: number = CADENCE.first;

  const routeOf = new Map<Place, Map<Place, Route>>();
  for (const r of routes) {
    if (!routeOf.has(r.a)) routeOf.set(r.a, new Map());
    if (!routeOf.has(r.b)) routeOf.set(r.b, new Map());
    routeOf.get(r.a)!.set(r.b, r);
    routeOf.get(r.b)!.set(r.a, r);
  }

  type Kind = (typeof ROUTES.order)[number];
  // Candidate pairs per kind, in site.ts order. "between" steps through every
  // offset in turn, so consecutive picks rarely share a starting place.
  const pairs: Record<Kind, [Place, Place][]> = {
    out: origin ? targets.map((t): [Place, Place] => [origin, t]) : [],
    in: origin ? targets.map((t): [Place, Place] => [t, origin]) : [],
    between: [],
  };
  for (let d = 1; d < targets.length; d++) {
    targets.forEach((a, i) => pairs.between.push([a, targets[(i + d) % targets.length]]));
  }
  const cursor: Record<Kind, number> = { out: -1, in: -1, between: -1 };
  let kindAt = -1;
  /** Places an arc from Muscat has reached: arcs back to Muscat start from these first. */
  const returns: Place[] = [];

  /**
   * The next flight: kinds in ROUTES.order, each stepping through its pairs.
   * A flight leaves a place that faces the viewer, lands on one that faces it
   * inside the hero with the study's margins, keeps off the headline, and
   * takes neither a route already in flight nor a place another arc is about
   * to land on.
   */
  const pickFlight = (): Flight | null => {
    const box = o.host.getBoundingClientRect();
    const hero = o.hero.getBoundingClientRect();
    let boxes: DOMRect[] | null = null;
    const fly = (from: Place, to: Place): Flight | null => {
      const route = routeOf.get(from)?.get(to);
      if (!route) return null;
      if (arcs.some((s) => s.flight && (s.flight.route === route || (!s.landed && s.flight.to === to)))) return null;
      if (facing(wp.copy(from.v).applyMatrix4(mNow)) < TARGET.fromMinFacing) return null;
      wp.copy(to.v).applyMatrix4(mNow);
      if (facing(wp) < TARGET.minFacing) return null;
      toCanvas(wp);
      const x = box.left + pt.x;
      const y = box.top + pt.y;
      if (x < hero.left + TARGET.left || x > hero.right - TARGET.right) return null;
      if (y < hero.top + TARGET.top || y > hero.bottom - TARGET.bottom) return null;
      boxes ??= headlineBoxes();
      if (crossesHeadline(route, boxes, box)) return null;
      return { route, from, to, reverse: from !== route.a };
    };
    const kinds = ROUTES.order;
    for (let k = 1; k <= kinds.length; k++) {
      const kind = kinds[(kindAt + k) % kinds.length];
      if (kind === "in" && origin) {
        for (let i = 0; i < returns.length; i++) {
          const f = fly(returns[i], origin);
          if (!f) continue;
          returns.splice(i, 1);
          kindAt = (kindAt + k) % kinds.length;
          return f;
        }
      }
      const list = pairs[kind];
      for (let j = 1; j <= list.length; j++) {
        const index = (cursor[kind] + j) % list.length;
        const f = fly(...list[index]);
        if (!f) continue;
        cursor[kind] = index;
        kindAt = (kindAt + k) % kinds.length;
        return f;
      }
    }
    return null;
  };

  const launch = (f: Flight) => {
    const s = arcs.find((a) => !a.flight);
    if (!s) return;
    s.flight = f;
    s.t0 = elapsed;
    s.landed = false;
    s.mesh.geometry = f.route.tube;
    s.mesh.material.uniforms.uHead.value = 0;
    s.mesh.material.uniforms.uTail.value = 0;
    s.mesh.material.uniforms.uReverse.value = f.reverse ? 1 : 0;
    s.mesh.visible = true;
  };

  /* ---- the label: one caption element, clients only ---- */

  let owner: LabelOwner | null = null;
  let next: LabelOwner | null = null;
  let replaceAt = 0;
  let replaceFrom = 0;
  let labelOn = false;
  let labelOpacity = 0;
  let captionLive = false;
  let chipW = 0;
  let chipH = 0;
  let boxLeft = 0;
  let viewW = 0;

  const hideLabel = () => {
    labelOpacity = 0;
    if (!captionLive) return;
    captionLive = false;
    caption.style.opacity = "0";
    caption.style.willChange = "";
  };

  const setOwner = (n: LabelOwner) => {
    owner = n;
    labelOn = false;
    caption.textContent = n.place.loc.name;
    chipW = caption.offsetWidth;
    chipH = caption.offsetHeight;
    // Parallax only moves the globe vertically, so its left edge is exact here.
    boxLeft = o.host.getBoundingClientRect().left;
    viewW = document.documentElement.clientWidth;
  };

  /** A new landing replaces the current label, which fades out first. */
  const landLabel = (place: Place, t0: number) => {
    const n = { place, t0, shownAt: elapsed };
    if (owner && labelOpacity > 0) {
      next = n;
      replaceAt = elapsed;
      replaceFrom = labelOpacity;
    } else setOwner(n);
  };

  const updateLabel = () => {
    if (next && elapsed - replaceAt >= LABEL.replace) {
      const n: LabelOwner = next;
      next = null;
      n.shownAt = elapsed;
      setOwner(n);
    }
    if (!owner) return hideLabel();
    const e = elapsed - owner.t0;
    if (e >= LABEL.outAt + LABEL.fadeOut) {
      owner = null;
      return hideLabel();
    }
    wp.copy(owner.place.v).applyMatrix4(mNow);
    const f = facing(wp);
    labelOn = labelOn ? f >= LABEL.hide : f >= LABEL.show;
    let op = labelOn
      ? Math.min((elapsed - owner.shownAt) / LABEL.fadeIn, 1 - (e - LABEL.outAt) / LABEL.fadeOut, 1)
      : 0;
    if (next) op = Math.min(op, replaceFrom * (1 - (elapsed - replaceAt) / LABEL.replace));
    op = clamp01(op);
    if (op <= 0) return hideLabel();
    labelOpacity = op;
    toCanvas(wp);
    // Right of the point; left only where the viewport's edge would cut it.
    const x = boxLeft + pt.x + LABEL.gap + chipW > viewW - LABEL.edge ? pt.x - LABEL.gap - chipW : pt.x + LABEL.gap;
    caption.style.transform = `translate3d(${x.toFixed(1)}px, ${(pt.y - chipH / 2).toFixed(1)}px, 0)`;
    caption.style.opacity = op.toFixed(3);
    if (!captionLive) {
      captionLive = true;
      caption.style.willChange = "transform, opacity";
    }
  };

  /* ---- one step of the scene ---- */

  const land = (s: ArcSlot, f: Flight) => {
    const p = f.to;
    s.landed = true;
    if (f.from === origin && !returns.includes(p)) returns.push(p);
    const r = rings.find((x) => !x.active);
    if (r) {
      r.active = true;
      r.t0 = elapsed;
      onSurface(r.mesh, p.v, RING.radius);
      r.mesh.visible = true;
    }
    p.bump = elapsed;
    if (p.loc.role === "client") landLabel(p, s.t0);
  };

  const step = (dt: number) => {
    elapsed += dt;
    front = frontAt(elapsed);
    world.earth.rotation.y = -front * D2R;
    earthAt(front, mNow);

    if (origin) {
      const ph = (elapsed % PULSE.period) / PULSE.duration;
      pulse.visible = ph <= 1;
      if (pulse.visible) {
        pulse.scale.setScalar(origin.size * (1 + (PULSE.scaleTo - 1) * easeOutCubic(ph)));
        pulse.material.opacity = PULSE.opacity * (1 - ph);
      }
    }

    if (elapsed >= nextLaunch && arcs.some((s) => !s.flight)) {
      const f = pickFlight();
      if (f) {
        launch(f);
        nextLaunch = elapsed + CADENCE.every;
      } else nextLaunch = elapsed + CADENCE.retry;
    }

    for (const s of arcs) {
      const f = s.flight;
      if (!f) continue;
      const e = elapsed - s.t0;
      if (e >= ARC.life) {
        s.flight = null;
        s.mesh.visible = false;
        s.head.visible = false;
        continue;
      }
      const head = easeInOutCubic(clamp01(e / ARC.draw));
      const tail = e < ARC.tailAt ? 0 : easeInOutCubic(clamp01((e - ARC.tailAt) / ARC.tail));
      s.mesh.material.uniforms.uHead.value = head;
      s.mesh.material.uniforms.uTail.value = tail;
      s.head.visible = e < ARC.draw + HEAD.fade;
      if (s.head.visible) {
        const u = Math.min(head, 1);
        f.route.curve.getPointAt(f.reverse ? 1 - u : u, s.head.position);
        s.head.material.opacity = HEAD.opacity * (e < ARC.draw ? 1 : 1 - (e - ARC.draw) / HEAD.fade);
      }
      if (!s.landed && e >= ARC.draw) land(s, f);
    }

    for (const r of rings) {
      if (!r.active) continue;
      const q = (elapsed - r.t0) / LANDING.duration;
      if (q >= 1) {
        r.active = false;
        r.mesh.visible = false;
        continue;
      }
      r.mesh.scale.setScalar(LANDING.from + (LANDING.to - LANDING.from) * easeOutCubic(q));
      r.mesh.material.opacity = LANDING.opacity * (1 - q);
    }

    for (const p of world.places) {
      const b = (elapsed - p.bump) / LANDING.bumpDuration;
      p.marker.scale.setScalar(p.size * (b >= 0 && b < 1 ? 1 + (LANDING.bump - 1) * Math.sin(Math.PI * b) : 1));
    }

    updateLabel();
  };

  /* ---- the loop ---- */

  let stopped = false;
  let started = false;
  let running = false;
  let inView = true;
  let raf = 0;
  let last = -1;
  let qSum = 0;
  let qFrames = 0;
  const costs: number[] = [];
  let fps = 0;
  let fpsFrames = 0;
  let fpsAt = 0;

  /** GitHub's tiers, simplified: a mean frame time over 20 ms for 3 s drops the pixel ratio a step. */
  const quality = (dt: number) => {
    qSum += dt;
    qFrames++;
    if (qSum < RENDERER.qualityWindow) return;
    if ((qSum / qFrames) * 1000 > RENDERER.qualityMaxMeanMs && tiers.length) renderer.setPixelRatio(tiers.shift()!);
    qSum = 0;
    qFrames = 0;
  };

  const frame = (now: number) => {
    raf = 0;
    const t = debug ? performance.now() : 0;
    const raw = last < 0 ? 0 : (now - last) / 1000;
    last = now;
    if (raw > 0) quality(raw);
    // Time-based, dt capped, so 60 and 120 Hz screens look the same.
    step(Math.min(raw, RUN.maxDt));
    renderer.render(scene, camera);
    if (debug) {
      costs.push(performance.now() - t);
      if (costs.length > 600) costs.shift();
      fpsFrames++;
      if (now - fpsAt >= 1000) {
        fps = (fpsFrames * 1000) / (now - fpsAt);
        fpsFrames = 0;
        fpsAt = now;
      }
    }
    if (running) raf = requestAnimationFrame(frame);
  };

  /** Runs only while the hero is near the viewport and the tab is visible; resumes where it left off. */
  const sync = () => {
    const should = started && !stopped && inView && !document.hidden;
    if (should && !running) {
      running = true;
      last = -1;
      qSum = 0;
      qFrames = 0;
      fpsFrames = 0;
      fpsAt = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { rootMargin: `${RUN.pauseMargin}px 0px` }
  );
  const ro = new ResizeObserver(() => {
    if (size() && started && !running) renderer.render(scene, camera);
  });
  ro.observe(o.host);

  const onLost = () => {
    if (!stopped) o.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  /** Compiles every shader before the first frame, or they compile mid-arc. */
  const warm = () => {
    const s = arcs[0];
    const r = rings[0];
    if (routes[0]) s.mesh.geometry = routes[0].tube;
    s.mesh.material.uniforms.uAlpha.value = 0;
    s.head.material.opacity = 0;
    r.mesh.material.opacity = 0;
    s.mesh.visible = s.head.visible = r.mesh.visible = true;
    renderer.compile(scene, camera);
    renderer.initTexture(tex);
    s.mesh.visible = s.head.visible = r.mesh.visible = false;
    s.mesh.material.uniforms.uAlpha.value = 1;
  };

  whenIdle(1000).then(() => {
    if (stopped) return;
    warm();
    // Drawn straight away, not in rAF, so it shows even in a tab that opened in the background.
    step(0);
    renderer.render(scene, camera);
    started = true;
    o.onFirstFrame();
    io.observe(o.hero);
    document.addEventListener("visibilitychange", sync);
    sync();
  });

  if (debug) {
    const litPoints = (s: ArcSlot): [number, number][] => {
      const box = o.host.getBoundingClientRect();
      const u = s.mesh.material.uniforms;
      const head = u.uHead.value as number;
      const tail = u.uTail.value as number;
      const local = new Vector3();
      const f = s.flight!;
      return Array.from({ length: GUARD.samples }, (_, k) => {
        const along = tail + ((head - tail) * k) / (GUARD.samples - 1);
        f.route.curve.getPointAt(f.reverse ? 1 - along : along, local);
        toCanvas(wp.copy(local).applyMatrix4(mNow));
        return [box.left + pt.x, box.top + pt.y];
      });
    };
    window.__globe = {
      state: () => {
        const sorted = [...costs].sort((x, y) => x - y);
        return {
          fps,
          frameCost: {
            n: sorted.length,
            mean: sorted.reduce((sum, v) => sum + v, 0) / (sorted.length || 1),
            p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
          },
          calls: renderer.info.render.calls,
          frame: renderer.info.render.frame,
          front,
          pixelRatio: renderer.getPixelRatio(),
          elapsed,
          running,
          size: { w, h },
          arcs: arcs
            .filter((s) => s.flight)
            .map((s) => ({
              name: `${s.flight!.from.loc.name} → ${s.flight!.to.loc.name}`,
              t: elapsed - s.t0,
              landed: s.landed,
              points: litPoints(s),
            })),
          label: owner && captionLive ? { name: owner.place.loc.name, opacity: labelOpacity } : null,
        };
      },
    };
  }

  return () => {
    if (stopped) return;
    // Deliberate: the context loss forced below is not a failure to rebuild from.
    stopped = true;
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", sync);
    canvas.removeEventListener("webglcontextlost", onLost);
    hideLabel();
    world.dispose();
    tex.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    if (debug) delete window.__globe;
  };
}

/**
 * The still frame for phones, reduced motion and no WebGL: the same scene at
 * 72° east with the three client arcs from Muscat drawn in full at 80%, no
 * heads, rings, pulse or labels, on a transparent background. (A still can't
 * show direction, and the routes between clients bunch up over Germany.) Returns WebP data URLs at
 * 1600 and 800 px (dev only, via `?globe-still` and
 * scripts/render-globe-still.mjs), or null without WebGL 2.
 */
export function renderStill(places: GlobeLocation[], land: ArrayBuffer): Record<800 | 1600, string> | null {
  const canvas = document.createElement("canvas");
  // Read back in the same task as the render; the preserved buffer makes that certain.
  const renderer = createRenderer(canvas, true);
  if (!renderer) return null;
  renderer.setPixelRatio(1);
  renderer.setSize(STILL.size, STILL.size, false);
  const world = buildWorld(places, land);
  world.earth.rotation.y = -STILL.front * D2R;
  for (const r of world.routes) {
    const other = r.a === world.origin ? r.b : r.b === world.origin ? r.a : null;
    if (other?.loc.role !== "client") continue;
    const arc = new Mesh(r.tube, world.arcMaterial(true));
    arc.renderOrder = DRAW_ORDER.arcs;
    world.earth.add(arc);
  }
  renderer.render(world.scene, world.camera);
  const large = canvas.toDataURL("image/webp", STILL.quality);
  const small = document.createElement("canvas");
  small.width = small.height = STILL.small;
  const g = small.getContext("2d");
  let smallUrl = "";
  if (g) {
    g.imageSmoothingQuality = "high";
    g.drawImage(canvas, 0, 0, STILL.small, STILL.small);
    smallUrl = small.toDataURL("image/webp", STILL.quality);
  }
  world.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  return { 1600: large, 800: smallUrl };
}
