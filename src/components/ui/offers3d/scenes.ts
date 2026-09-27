/**
 * The six Offers pieces (v3 step 06), ported from the Cowork study
 * (docs/v3/references/offers/study/index.html): the same geometry, cameras,
 * opacities and timings, with the colours from ./constants. Each builder
 * returns its scene, camera, an update(t, dt) in seconds of elapsed time,
 * and the time of its still pose. `snap` lands eased state on its pose at
 * once (the study's reduced-motion path), for the still images.
 */
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Euler,
  ExtrudeGeometry,
  Float32BufferAttribute,
  FrontSide,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineCurve3,
  LineLoop,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Quaternion,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type Side,
} from "three";
import { CAMERA, COLOR, RAMP, SOLID, type PieceKey } from "./constants";

export interface Piece {
  scene: Scene;
  camera: PerspectiveCamera;
  update: (t: number, dt?: number) => void;
  /** The still image's time. */
  still: number;
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const C = (h: string) => new Color(h);
const LIGHT = new Vector3(...RAMP.light).normalize();

/* ---------- shared materials ---------- */

// Half-Lambert ramp with an n300 rim; instancing and instance colours; back faces shaded as front.
function ramp({
  lit = SOLID.base.lit,
  shade = SOLID.base.shade,
  rim = RAMP.rim,
  opacity = 1,
  side = FrontSide,
}: { lit?: string; shade?: string; rim?: number; opacity?: number; side?: Side } = {}) {
  return new ShaderMaterial({
    uniforms: {
      uLit: { value: C(lit) },
      uShade: { value: C(shade) },
      uRim: { value: C(RAMP.rimColor) },
      uRimAmt: { value: rim },
      uOpacity: { value: opacity },
      uLight: { value: LIGHT },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vC;
      void main(){
        vec4 p = vec4(position, 1.0); vec3 nn = normal; vC = vec3(1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p; nn = mat3(instanceMatrix) * nn;
        #endif
        #ifdef USE_INSTANCING_COLOR
          vC = instanceColor;
        #endif
        vec4 mv = modelViewMatrix * p;
        vN = normalize(normalMatrix * nn); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uLit; uniform vec3 uShade; uniform vec3 uRim; uniform vec3 uLight;
      uniform float uRimAmt; uniform float uOpacity;
      varying vec3 vN; varying vec3 vV; varying vec3 vC;
      void main(){
        vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        float hl = dot(n, uLight) * 0.5 + 0.5;
        vec3 c = mix(uShade, uLit, smoothstep(${RAMP.from.toFixed(2)}, ${RAMP.to.toFixed(2)}, hl)) * vC;
        float f = 1.0 - max(dot(n, normalize(vV)), 0.0);
        c = mix(c, uRim, smoothstep(${RAMP.rimFrom.toFixed(2)}, ${RAMP.rimTo.toFixed(2)}, f) * uRimAmt);
        gl_FragColor = vec4(c, uOpacity);
      }`,
    transparent: opacity < 1,
    depthWrite: opacity >= 1,
    side,
  });
}
const lineMat = (color: string = COLOR.white, opacity = 0.3) =>
  new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
const basic = (color: string, opacity = 1) =>
  new MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
const edges = (geo: BufferGeometry, mat: LineBasicMaterial, thr = 20) => new LineSegments(new EdgesGeometry(geo, thr), mat);
const lineFrom = (pts: Vector3[], mat: LineBasicMaterial, loop = false) => {
  const g = new BufferGeometry().setFromPoints(pts);
  return loop ? new LineLoop(g, mat) : new Line(g, mat);
};
const rectXZ = (w: number, d: number, y = 0) => [
  new Vector3(-w / 2, y, -d / 2),
  new Vector3(w / 2, y, -d / 2),
  new Vector3(w / 2, y, d / 2),
  new Vector3(-w / 2, y, d / 2),
];
const rectXY = (w: number, h: number, x = 0, y = 0, z = 0) => [
  new Vector3(x - w / 2, y - h / 2, z),
  new Vector3(x + w / 2, y - h / 2, z),
  new Vector3(x + w / 2, y + h / 2, z),
  new Vector3(x - w / 2, y + h / 2, z),
];
const circlePts = (r: number, n = 64, plane: "xy" | "yz" | "xz" = "xy") =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a) * r;
    const s = Math.sin(a) * r;
    return plane === "xy" ? new Vector3(c, s, 0) : plane === "yz" ? new Vector3(0, c, s) : new Vector3(c, 0, s);
  });
function makeCam(pos: [number, number, number], look: [number, number, number] = [0, 0, 0]) {
  const cam = new PerspectiveCamera(CAMERA.fov, CAMERA.aspect, CAMERA.near, CAMERA.far);
  cam.position.set(...pos);
  cam.lookAt(new Vector3(...look));
  return cam;
}
const M = new Matrix4();
const Q = new Quaternion();
const S = new Vector3();
const P = new Vector3();
const E = new Euler();
const setInst = (mesh: InstancedMesh, i: number, x: number, y: number, z: number, s = 1, rx = 0, ry = 0, rz = 0) => {
  P.set(x, y, z);
  S.set(s, s, s);
  Q.setFromEuler(E.set(rx, ry, rz));
  M.compose(P, Q, S);
  mesh.setMatrixAt(i, M);
};
const quad = (a: Vector3, b: Vector3, lift: number) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.y += lift;
  return new QuadraticBezierCurve3(a.clone(), mid, b.clone());
};
function roundedRect(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* ---------- Security reviews: layers under a scan ---------- */
function sceneSecurity(): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 2.3, 4.6], [0, -0.2, 0]);
  const root = new Group();
  scene.add(root);
  const plateGeo = new BoxGeometry(2.3, 0.06, 1.44);
  const plateMat = ramp({ ...SOLID.plate, rim: 0.22 });
  const edgeMat = lineMat(COLOR.white, 0.34);
  const ys = [0.62, 0, -0.62];
  const dotGeo = new SphereGeometry(0.034, 12, 8);
  const dots = new InstancedMesh(dotGeo, basic(COLOR.white), 45);
  const dotPos: Vector3[] = [];
  ys.forEach((y) => {
    const plate = new Mesh(plateGeo, plateMat);
    plate.position.y = y;
    root.add(plate);
    const e = edges(plateGeo, edgeMat);
    e.position.y = y;
    root.add(e);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) dotPos.push(new Vector3(-0.84 + i * 0.42, y + 0.052, -0.42 + j * 0.42));
  });
  const base = C(COLOR.n500);
  const hot = C(COLOR.driftwoodSoft);
  const col = new Color();
  dotPos.forEach((p, i) => {
    setInst(dots, i, p.x, p.y, p.z);
    dots.setColorAt(i, base);
  });
  root.add(dots);
  // data paths between layers
  const vpos: number[] = [];
  [
    [0, 0],
    [2, 1],
    [4, 2],
    [1, 2],
    [3, 0],
  ].forEach(([i, j]) => {
    const k = i * 3 + j;
    for (let pl = 0; pl < 2; pl++) {
      const a = dotPos[pl * 15 + k];
      const b = dotPos[(pl + 1) * 15 + k];
      vpos.push(a.x, a.y, a.z, b.x, b.y + 0.02, b.z);
    }
  });
  const vg = new BufferGeometry();
  vg.setAttribute("position", new Float32BufferAttribute(vpos, 3));
  root.add(new LineSegments(vg, lineMat(COLOR.white, 0.13)));
  // scanner
  const scanGeo = new PlaneGeometry(2.64, 1.78);
  scanGeo.rotateX(-Math.PI / 2);
  const scanMat = basic(COLOR.driftwoodSoft, 0.08);
  scanMat.side = DoubleSide;
  const scanEdgeMat = lineMat(COLOR.driftwoodSoft, 0.9);
  const scan = new Group();
  scan.add(new Mesh(scanGeo, scanMat), lineFrom(rectXZ(2.64, 1.78), scanEdgeMat, true));
  root.add(scan);
  // findings per layer (indices within a layer) and their rings
  const flags = [[3, 11], [7], [1, 13]];
  const flagAt = new Array<number>(45).fill(-99);
  const ringGeo = new RingGeometry(0.9, 1, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = flags.map(() => {
    const m = new Mesh(ringGeo, basic(COLOR.driftwoodSoft, 0));
    m.material.side = DoubleSide;
    root.add(m);
    return { m, at: -99 };
  });
  const T = 4.8;
  let prevY = 2;
  function update(t: number) {
    root.rotation.y = -0.42 + 0.16 * Math.sin(t * 0.3);
    const c = t % T;
    const y = c < 3.0 ? lerp(1.02, -1.02, easeInOut(c / 3.0)) : -1.02;
    const a = c < 0.3 ? c / 0.3 : c < 3.0 ? 1 : 1 - clamp((c - 3.0) / 0.35);
    scan.position.y = y;
    scanMat.opacity = 0.08 * a;
    scanEdgeMat.opacity = 0.9 * a;
    ys.forEach((ly, li) => {
      if (prevY > ly + 0.05 && y <= ly + 0.05) {
        flags[li].forEach((k) => (flagAt[li * 15 + k] = t));
        rings[li].at = t;
        const p = dotPos[li * 15 + flags[li][0]];
        rings[li].m.position.set(p.x, p.y - 0.01, p.z);
      }
    });
    prevY = c < 3.0 ? y : 2;
    for (let i = 0; i < 45; i++) {
      const age = t - flagAt[i];
      const w = age >= 0 && age < 3 ? 1 - smooth(1.7, 2.6, age) : 0;
      col.copy(base).lerp(hot, w);
      dots.setColorAt(i, col);
      const s = 1 + 0.7 * (age >= 0 && age < 0.45 ? Math.sin((age / 0.45) * Math.PI) : 0) + 0.25 * w;
      const p = dotPos[i];
      setInst(dots, i, p.x, p.y, p.z, s);
    }
    dots.instanceColor!.needsUpdate = true;
    dots.instanceMatrix.needsUpdate = true;
    rings.forEach((r) => {
      const age = t - r.at;
      const k = clamp(age / 1.1);
      r.m.visible = age >= 0 && age < 1.1;
      r.m.scale.setScalar(lerp(0.05, 0.3, easeOut(k)));
      r.m.material.opacity = 0.85 * (1 - k);
    });
  }
  return { scene, camera, update, still: 1.4 };
}

/* ---------- Workspace hardening: accounts inside a shell ---------- */
function sceneWorkspace(): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 0.5, 4.7]);
  const tilt = new Group();
  tilt.rotation.x = 0.2;
  scene.add(tilt);
  const root = new Group();
  tilt.add(root);
  root.add(new Mesh(new IcosahedronGeometry(0.3, 4), ramp({ ...SOLID.core, rim: 0.32 })));
  const N = 22;
  const R = 1.02;
  const nodes: Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) * 2) / N;
    const r = Math.sqrt(1 - y * y);
    const th = i * Math.PI * (3 - Math.sqrt(5));
    nodes.push(new Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R));
  }
  const freelancers = [2, 6, 11, 15, 19];
  const staff = C(COLOR.n300);
  const soft = C(COLOR.driftwoodSoft);
  const dim = C(COLOR.n700);
  const grey = C(COLOR.n500);
  const col = new Color();
  const dots = new InstancedMesh(new SphereGeometry(0.052, 14, 10), basic(COLOR.white), N);
  nodes.forEach((p, i) => {
    setInst(dots, i, p.x, p.y, p.z);
    dots.setColorAt(i, freelancers.includes(i) ? soft : staff);
  });
  root.add(dots);
  const lpos = new Float32Array(N * 6);
  const lcol = new Float32Array(N * 6);
  const lg = new BufferGeometry();
  lg.setAttribute("position", new BufferAttribute(lpos, 3));
  lg.setAttribute("color", new BufferAttribute(lcol, 3));
  const links = new LineSegments(lg, new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false }));
  root.add(links);
  const shellGeo = new IcosahedronGeometry(1.46, 1);
  const shell = new Group();
  shell.add(new Mesh(shellGeo, ramp({ ...SOLID.core, rim: 0.2, opacity: 0.07, side: DoubleSide })));
  shell.add(edges(shellGeo, lineMat(COLOR.white, 0.17), 1));
  tilt.add(shell);
  const CYCLE = 3.2;
  const HOLD = 7.2;
  function stateOf(i: number, t: number) {
    // returns {cut: 0..1, hl: 0..1, s: scale}
    const fi = freelancers.indexOf(i);
    if (fi < 0) return { cut: 0, hl: 0, s: 1 };
    const period = CYCLE * freelancers.length;
    const a = (((t - fi * CYCLE) % period) + period) % period;
    if (a < 0.7) return { cut: 0, hl: Math.sin((a / 0.7) * Math.PI), s: 1 + 0.7 * Math.sin((a / 0.7) * Math.PI) };
    if (a < 1.6) {
      const k = easeInOut((a - 0.7) / 0.9);
      return { cut: k, hl: 0, s: lerp(1, 0.6, k) };
    }
    if (a < 1.6 + HOLD) return { cut: 1, hl: 0, s: 0.6 };
    if (a < 2.6 + HOLD) {
      const k = easeInOut((a - 1.6 - HOLD) / 1.0);
      return { cut: 1 - k, hl: 0, s: lerp(0.6, 1, k) };
    }
    return { cut: 0, hl: 0, s: 1 };
  }
  function update(t: number) {
    root.rotation.y = t * 0.14;
    shell.rotation.y = -t * 0.05;
    shell.rotation.z = t * 0.02;
    let squeeze = 0;
    nodes.forEach((p, i) => {
      const st = stateOf(i, t);
      const free = freelancers.includes(i);
      const core = p.clone().normalize().multiplyScalar(0.3);
      const end = p.clone().lerp(core, st.cut);
      lpos.set([core.x, core.y, core.z, end.x, end.y, end.z], i * 6);
      col.copy(free ? soft : grey);
      if (free) col.lerp(dim, st.cut);
      lcol.set([col.r * 0.6, col.g * 0.6, col.b * 0.6, col.r, col.g, col.b], i * 6);
      col.copy(free ? soft : staff);
      if (free) col.lerp(dim, st.cut);
      dots.setColorAt(i, col);
      setInst(dots, i, p.x, p.y, p.z, st.s);
      if (free && st.cut > 0 && st.cut < 1) squeeze = Math.max(squeeze, Math.sin(st.cut * Math.PI));
    });
    shell.scale.setScalar(1 - 0.03 * squeeze);
    lg.attributes.position.needsUpdate = true;
    lg.attributes.color.needsUpdate = true;
    dots.instanceColor!.needsUpdate = true;
    dots.instanceMatrix.needsUpdate = true;
  }
  return { scene, camera, update, still: 8.5 };
}

/* ---------- AI automation: lanes through a gate ---------- */
function sceneAutomation(): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 1.45, 3.75], [0, -0.04, 0]);
  const root = new Group();
  scene.add(root);
  const lanes = [-0.85, 0, 0.85].map(
    (z) =>
      new CatmullRomCurve3(
        [new Vector3(-1.72, 0, z), new Vector3(-1.15, 0, z * 0.92), new Vector3(-0.7, 0, z * 0.45), new Vector3(-0.42, 0, 0)],
        false,
        "centripetal"
      )
  );
  const out = new LineCurve3(new Vector3(0.42, 0, 0), new Vector3(1.72, 0, 0));
  lanes.forEach((c) => root.add(lineFrom(c.getPoints(48), lineMat(COLOR.white, 0.2))));
  root.add(lineFrom(out.getPoints(2), lineMat(COLOR.driftwoodSoft, 0.55)));
  const gate = new Group();
  root.add(gate);
  const torus = new Mesh(new TorusGeometry(0.4, 0.05, 18, 72), ramp({ ...SOLID.torus, rim: 0.34 }));
  torus.rotation.y = Math.PI / 2;
  gate.add(torus);
  const orbit = new Group();
  gate.add(orbit);
  const ring1 = lineFrom(circlePts(0.5, 72, "yz"), lineMat(COLOR.driftwoodSoft, 0.8), true);
  ring1.rotation.z = 0.45;
  orbit.add(ring1);
  const bead = new Mesh(new SphereGeometry(0.03, 12, 8), basic(COLOR.driftwoodSoft));
  bead.position.set(0, 0.5, 0);
  ring1.add(bead);
  const orbit2 = lineFrom(circlePts(0.5, 72, "yz"), lineMat(COLOR.white, 0.22), true);
  orbit2.rotation.z = 0.9;
  gate.add(orbit2);
  const discMat = basic(COLOR.driftwoodSoft, 0.07);
  discMat.side = DoubleSide;
  const disc = new Mesh(new CircleGeometry(0.33, 48), discMat);
  disc.rotation.y = Math.PI / 2;
  gate.add(disc);
  const MAX = 30;
  const ins = new InstancedMesh(new BoxGeometry(0.15, 0.15, 0.15), ramp({ ...SOLID.task, rim: 0.2 }), MAX);
  const outs = new InstancedMesh(new SphereGeometry(0.085, 16, 12), basic(COLOR.driftwoodSoft), MAX);
  root.add(ins, outs);
  type Item = { lane: number; u: number; sp: number; r: [number, number, number]; w: number };
  let items: Item[] = [];
  let emitted: { u: number }[] = [];
  let queue = 0;
  let nextSpawn = 0;
  let lastEmit = -9;
  let clock = 0;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function step(dt: number) {
    clock += dt;
    if (clock >= nextSpawn && items.length < MAX - 2 && queue < 6) {
      items.push({ lane: Math.floor(rnd() * 3), u: 0, sp: 0.27 + rnd() * 0.12, r: [rnd() * 6, rnd() * 6, rnd() * 6], w: rnd() * 6 });
      nextSpawn = clock + 0.28 + rnd() * 0.65;
    }
    items.forEach((it) => (it.u += it.sp * dt));
    const done = items.filter((it) => it.u >= 1);
    queue += done.length;
    items = items.filter((it) => it.u < 1);
    if (queue > 0 && clock - lastEmit >= 0.52) {
      emitted.push({ u: 0 });
      queue--;
      lastEmit = clock;
    }
    emitted.forEach((o) => (o.u += 0.3 * dt));
    emitted = emitted.filter((o) => o.u < 1);
  }
  // Pre-run so the lanes start full.
  for (let k = 0; k < 400; k++) step(1 / 30);
  function draw() {
    for (let i = 0; i < MAX; i++) {
      const it = items[i];
      if (!it) {
        setInst(ins, i, 0, -99, 0, 0.0001);
        continue;
      }
      const p = lanes[it.lane].getPoint(it.u);
      const s = smooth(0, 0.08, it.u) * (1 - smooth(0.9, 1, it.u) * 0.6);
      setInst(ins, i, p.x, p.y + 0.07 + 0.025 * Math.sin(clock * 3 + it.w), p.z, s, it.r[0] + clock * 1.3, it.r[1] + clock, it.r[2]);
    }
    for (let i = 0; i < MAX; i++) {
      const o = emitted[i];
      if (!o) {
        setInst(outs, i, 0, -99, 0, 0.0001);
        continue;
      }
      const q = out.getPoint(o.u);
      setInst(outs, i, q.x, q.y + 0.07, q.z, smooth(0, 0.06, o.u) * (1 - smooth(0.9, 1, o.u)));
    }
    ins.instanceMatrix.needsUpdate = true;
    outs.instanceMatrix.needsUpdate = true;
  }
  let lastT: number | null = null;
  function update(t: number, dt?: number) {
    const d = dt ?? (lastT == null ? 0 : t - lastT);
    lastT = t;
    if (d > 0) step(Math.min(d, 0.05));
    orbit.rotation.x = t * 1.1;
    orbit2.rotation.x = -t * 0.6;
    root.rotation.y = -0.12 + 0.08 * Math.sin(t * 0.25);
    draw();
  }
  return { scene, camera, update, still: 0 };
}

/* ---------- Mobile apps and device integrations ---------- */
function sceneMobile(): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 0.3, 4.7]);
  const root = new Group();
  scene.add(root);
  const phone = new Group();
  phone.rotation.set(-0.06, 0.38, 0);
  root.add(phone);
  const bodyGeo = new ExtrudeGeometry(roundedRect(0.8, 1.6, 0.13), {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 10,
  });
  bodyGeo.center();
  phone.add(new Mesh(bodyGeo, ramp({ ...SOLID.device, rim: 0.3 })));
  const zf = 0.045;
  phone.add(
    lineFrom(
      roundedRect(0.824, 1.624, 0.14)
        .getPoints(12)
        .map((p) => new Vector3(p.x, p.y, zf)),
      lineMat(COLOR.white, 0.4),
      true
    )
  );
  const screen = new Mesh(new ShapeGeometry(roundedRect(0.68, 1.44, 0.08), 8), basic(COLOR.windsor));
  screen.position.z = zf + 0.002;
  phone.add(screen);
  const ui = new Group();
  ui.position.z = zf + 0.005;
  phone.add(ui);
  const bar = (w: number, h: number, x: number, y: number, c: string, o = 1) => {
    const m = new Mesh(new PlaneGeometry(w, h), basic(c, o));
    m.position.set(x, y, 0);
    ui.add(m);
    return m;
  };
  bar(0.22, 0.03, -0.18, 0.6, COLOR.n500);
  ui.add(lineFrom(rectXY(0.56, 0.34, 0, 0.3), lineMat(COLOR.white, 0.3), true));
  const gauge = new Mesh(new RingGeometry(0.075, 0.09, 40), basic(COLOR.driftwoodSoft));
  gauge.position.set(-0.14, 0.3, 0);
  ui.add(gauge);
  bar(0.2, 0.025, 0.1, 0.35, COLOR.n300, 0.7);
  bar(0.14, 0.02, 0.07, 0.29, COLOR.n500);
  bar(0.17, 0.02, 0.085, 0.24, COLOR.n500);
  ui.add(lineFrom(rectXY(0.56, 0.22, 0, -0.05), lineMat(COLOR.white, 0.22), true));
  bar(0.3, 0.022, -0.06, -0.02, COLOR.n300, 0.6);
  bar(0.2, 0.02, -0.11, -0.09, COLOR.n500);
  const uiDot = new Mesh(new CircleGeometry(0.022, 20), basic(COLOR.driftwoodSoft));
  uiDot.position.set(0.2, -0.05, 0);
  ui.add(uiDot);
  [-0.3, -0.39, -0.48, -0.57].forEach((y, i) => bar(i % 2 ? 0.34 : 0.44, 0.018, -0.03 - (i % 2) * 0.05, y, COLOR.n700));
  // devices
  const devMat = ramp({ ...SOLID.device, rim: 0.3 });
  const devEdge = lineMat(COLOR.white, 0.32);
  const devices: { g: Group; dot: Mesh<SphereGeometry, MeshBasicMaterial>; at: number }[] = [];
  const addDevice = (geo: BufferGeometry, pos: Vector3, rot: [number, number, number], dotOff: Vector3, thr = 20) => {
    const g = new Group();
    g.position.copy(pos);
    g.rotation.set(...rot);
    g.add(new Mesh(geo, devMat), edges(geo, devEdge, thr));
    const dot = new Mesh(new SphereGeometry(0.036, 12, 8), basic(COLOR.n700));
    dot.position.copy(dotOff);
    g.add(dot);
    root.add(g);
    devices.push({ g, dot, at: -99 });
  };
  addDevice(new BoxGeometry(0.34, 0.34, 0.34), new Vector3(1.5, 0.5, -0.35), [0.2, 0.5, 0], new Vector3(0, 0.2, 0));
  addDevice(new CylinderGeometry(0.25, 0.25, 0.1, 48), new Vector3(1.38, -0.6, 0.25), [0.18, 0, 0], new Vector3(0, 0.07, 0), 30);
  addDevice(new BoxGeometry(0.44, 0.44, 0.05), new Vector3(-1.5, -0.3, -0.1), [0.15, -0.55, 0], new Vector3(0, 0, 0.045));
  const anchor = new Vector3(0.12, 0.12, 0.12);
  const curves = devices.map((d) => quad(anchor, d.g.position, 0.55));
  curves.forEach((c) => root.add(lineFrom(c.getPoints(40), lineMat(COLOR.white, 0.2))));
  const packets = curves.map(() => {
    const m = new Mesh(new SphereGeometry(0.046, 14, 10), basic(COLOR.driftwoodSoft));
    root.add(m);
    return m;
  });
  const hot = C(COLOR.driftwoodSoft);
  const idle = C(COLOR.n700);
  const white = C(COLOR.white);
  const PER = 3.0;
  function update(t: number) {
    root.rotation.y = 0.12 * Math.sin(t * 0.35);
    phone.position.y = 0.04 * Math.sin(t * 0.9);
    curves.forEach((c, i) => {
      const a = (((t + i * 1.0) % PER) + PER) % PER;
      const pk = packets[i];
      const d = devices[i];
      if (a < 1.1) {
        const k = easeInOut(a / 1.1);
        pk.visible = true;
        pk.position.copy(c.getPoint(k));
        pk.material.color.copy(hot);
        if (a > 1.05 && d.at < t - 1) d.at = t;
      } else if (a > 1.45 && a < 2.55) {
        const k = easeInOut((a - 1.45) / 1.1);
        pk.visible = true;
        pk.position.copy(c.getPoint(1 - k));
        pk.material.color.copy(white);
      } else pk.visible = false;
      const age = t - d.at;
      d.dot.material.color.copy(idle).lerp(hot, age >= 0 && age < 1.2 ? 1 - smooth(0.5, 1.2, age) : 0);
    });
    uiDot.visible = Math.sin(t * 2.4) > -0.6;
  }
  return { scene, camera, update, still: 0.6 };
}

/* ---------- APIs and bot deployments: a bot in its container ---------- */
function sceneBot(snap: boolean): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 1.75, 4.4], [0, -0.22, 0]);
  const root = new Group();
  scene.add(root);
  // the container: a deployed unit
  const cageGeo = new BoxGeometry(0.92, 0.92, 0.92);
  const cage = new Group();
  root.add(cage);
  cage.add(new Mesh(cageGeo, ramp({ ...SOLID.core, rim: 0.2, opacity: 0.08, side: DoubleSide })));
  const cageEdgeMat = lineMat(COLOR.white, 0.42);
  cage.add(edges(cageGeo, cageEdgeMat));
  const cornerGeo = new SphereGeometry(0.022, 10, 8);
  const cornerMat = basic(COLOR.n300);
  [-1, 1].forEach((x) =>
    [-1, 1].forEach((y) =>
      [-1, 1].forEach((z) => {
        const d = new Mesh(cornerGeo, cornerMat);
        d.position.set(x * 0.46, y * 0.46, z * 0.46);
        cage.add(d);
      })
    )
  );
  // the bot
  const bot = new Group();
  cage.add(bot);
  bot.add(new Mesh(new CapsuleGeometry(0.19, 0.2, 8, 28), ramp({ ...SOLID.bot, rim: 0.36 })));
  const visor = new Mesh(new TorusGeometry(0.196, 0.014, 8, 48, Math.PI * 0.62), basic(COLOR.driftwoodSoft));
  visor.rotation.set(Math.PI / 2, 0, Math.PI / 2 - Math.PI * 0.31);
  visor.position.y = 0.07;
  bot.add(visor);
  bot.add(lineFrom([new Vector3(0, 0.29, 0), new Vector3(0, 0.4, 0)], lineMat(COLOR.white, 0.5)));
  const tip = new Mesh(new SphereGeometry(0.03, 12, 8), basic(COLOR.driftwoodSoft));
  tip.position.y = 0.41;
  bot.add(tip);
  // the services around it, each on a socket
  const svcMat = ramp({ ...SOLID.device, rim: 0.3 });
  const svcEdge = lineMat(COLOR.white, 0.3);
  const R = 1.5;
  const services: { g: Group; a: number; sockMat: LineBasicMaterial; wireMat: LineBasicMaterial; from: Vector3; to: Vector3 }[] = [];
  const mk = (build: (g: Group) => void, i: number) => {
    const a = (i / 6) * Math.PI * 2 + 0.26;
    const g = new Group();
    g.position.set(Math.sin(a) * R, -0.14, Math.cos(a) * R);
    g.rotation.y = a + Math.PI;
    build(g);
    root.add(g);
    const sockMat = lineMat(COLOR.white, 0.22);
    const sock = lineFrom(circlePts(0.22, 48, "xz"), sockMat, true);
    sock.position.set(g.position.x, -0.34, g.position.z);
    root.add(sock);
    const from = new Vector3(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5);
    const to = g.position.clone().setY(-0.05);
    const wireMat = lineMat(COLOR.white, 0.1);
    root.add(lineFrom([from, to], wireMat));
    services.push({ g, a, sockMat, wireMat, from, to });
  };
  const solid = (g: Group, geo: BufferGeometry, x = 0, y = 0, z = 0, thr = 20) => {
    const m = new Mesh(geo, svcMat);
    const e = edges(geo, svcEdge, thr);
    m.position.set(x, y, z);
    e.position.set(x, y, z);
    g.add(m, e);
    return m;
  };
  // database
  mk((g) => {
    const c = new CylinderGeometry(0.15, 0.15, 0.07, 40);
    [0, 0.09, 0.18].forEach((y) => solid(g, c, 0, y - 0.1, 0, 30));
  }, 0);
  // messaging
  mk((g) => {
    const geo = new ExtrudeGeometry(roundedRect(0.36, 0.26, 0.05), { depth: 0.05, bevelEnabled: false, curveSegments: 6 });
    geo.center();
    solid(g, geo, 0, 0, 0, 30);
    [0.05, -0.02].forEach((y, k) => {
      const b = new Mesh(new PlaneGeometry(k ? 0.14 : 0.22, 0.022), basic(COLOR.n300, 0.7));
      b.position.set(-0.03 - k * 0.04, y, 0.027);
      g.add(b);
    });
  }, 1);
  // web
  mk((g) => {
    solid(g, new SphereGeometry(0.15, 28, 18), 0, 0, 0, 90);
    g.add(lineFrom(circlePts(0.152, 48, "xz"), svcEdge, true));
    const m = lineFrom(circlePts(0.152, 48, "yz"), svcEdge, true);
    g.add(m);
  }, 2);
  // payments
  mk((g) => {
    solid(g, new BoxGeometry(0.36, 0.23, 0.025));
    const s = new Mesh(new PlaneGeometry(0.36, 0.04), basic(COLOR.driftwoodSoft));
    s.position.set(0, 0.05, 0.014);
    g.add(s);
  }, 3);
  // files
  mk((g) => {
    const b = new BoxGeometry(0.26, 0.02, 0.32);
    [0, 0.05, 0.1].forEach((y, k) => solid(g, b, k * 0.02, y - 0.06, -k * 0.02));
  }, 4);
  // events
  mk((g) => {
    solid(g, new OctahedronGeometry(0.16), 0, 0, 0, 1);
  }, 5);
  const packet = new Mesh(new SphereGeometry(0.045, 14, 10), basic(COLOR.driftwoodSoft));
  root.add(packet);
  const order = [0, 3, 1, 4, 2, 5];
  const SLOT = 2.2;
  const hot = C(COLOR.driftwoodSoft);
  const white = C(COLOR.white);
  let heading = 0;
  function update(t: number) {
    root.rotation.y = 0.35 + t * 0.07;
    cage.rotation.y = 0;
    bot.position.y = 0.03 * Math.sin(t * 1.4);
    const n = Math.floor(t / SLOT);
    const a = t - n * SLOT;
    const sv = services[order[((n % 6) + 6) % 6]];
    // turn the bot's visor toward the service it is calling (visor faces +z)
    const target = sv.a;
    let d = target - heading;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    heading += d * (snap ? 1 : 0.12);
    bot.rotation.y = heading;
    services.forEach((s) => {
      s.sockMat.color.copy(white);
      s.sockMat.opacity = 0.22;
      s.wireMat.opacity = 0.1;
      s.g.position.y = -0.14;
    });
    packet.visible = false;
    if (a > 0.35 && a < 1.2) {
      const k = easeInOut((a - 0.35) / 0.85);
      packet.visible = true;
      packet.material.color.copy(hot);
      packet.position.lerpVectors(sv.from, sv.to, k);
      sv.wireMat.opacity = 0.42;
    } else if (a >= 1.2 && a < 1.45) {
      sv.sockMat.color.copy(hot);
      sv.sockMat.opacity = 0.9;
      sv.wireMat.opacity = 0.42;
      sv.g.position.y = -0.14 + 0.04 * Math.sin(((a - 1.2) / 0.25) * Math.PI);
    } else if (a >= 1.45 && a < 2.15) {
      const k = easeInOut((a - 1.45) / 0.7);
      packet.visible = true;
      packet.material.color.copy(white);
      packet.position.lerpVectors(sv.to, sv.from, k);
      sv.sockMat.color.copy(hot);
      sv.sockMat.opacity = 0.9 * (1 - k);
      sv.wireMat.opacity = 0.42;
    }
    const pulse = a < 0.35 ? Math.sin((a / 0.35) * Math.PI) : 0;
    tip.scale.setScalar(1 + 0.8 * pulse);
    cageEdgeMat.opacity = 0.42 + 0.2 * pulse;
  }
  return { scene, camera, update, still: 0.8 };
}

/* ---------- Landing pages (the study's "Company profiles"): a page in layers ---------- */
function sceneProfile(): Piece {
  const scene = new Scene();
  const camera = makeCam([0, 0.3, 3.8]);
  const tilt = new Group();
  tilt.rotation.x = 0.12;
  scene.add(tilt);
  const root = new Group();
  tilt.add(root);
  const W = 1.6;
  const H = 1.0;
  const pageGeo = new BoxGeometry(W, H, 0.02);
  const pageMat = ramp({ ...SOLID.page, rim: 0.2 });
  const pages: { g: Group; c: Group }[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new Group();
    g.add(new Mesh(pageGeo, pageMat));
    g.add(lineFrom(rectXY(W, H, 0, 0, 0.011), lineMat(COLOR.white, 0.36), true));
    const c = new Group();
    c.position.z = 0.012;
    g.add(c);
    root.add(g);
    pages.push({ g, c });
  }
  const plane = (grp: Group, w: number, h: number, x: number, y: number, color: string, o = 1) => {
    const m = new Mesh(new PlaneGeometry(w, h), basic(color, o));
    m.position.set(x, y, 0.001);
    grp.add(m);
  };
  const box = (grp: Group, w: number, h: number, x: number, y: number, o = 0.3) =>
    grp.add(lineFrom(rectXY(w, h, x, y, 0.001), lineMat(COLOR.white, o), true));
  // grid
  const gp: number[] = [];
  for (let i = 0; i <= 12; i++) {
    const x = -0.7 + i * (1.4 / 12);
    gp.push(x, -0.42, 0.001, x, 0.42, 0.001);
  }
  for (let j = 0; j <= 6; j++) {
    const y = -0.42 + j * 0.14;
    gp.push(-0.7, y, 0.001, 0.7, y, 0.001);
  }
  const gg = new BufferGeometry();
  gg.setAttribute("position", new Float32BufferAttribute(gp, 3));
  pages[0].c.add(new LineSegments(gg, lineMat(COLOR.white, 0.1)));
  // layout
  box(pages[1].c, 1.4, 0.08, 0, 0.38);
  plane(pages[1].c, 0.78, 0.36, -0.3, 0.1, COLOR.n700);
  box(pages[1].c, 0.5, 0.36, 0.45, 0.1);
  [-0.47, 0, 0.47].forEach((x) => box(pages[1].c, 0.42, 0.2, x, -0.28, 0.24));
  // type
  plane(pages[2].c, 0.86, 0.075, -0.26, 0.24, COLOR.white, 0.85);
  plane(pages[2].c, 0.58, 0.075, -0.4, 0.13, COLOR.white, 0.85);
  [-0.02, -0.08, -0.14, -0.2].forEach((y, i) => plane(pages[2].c, i === 3 ? 0.5 : 0.84, 0.02, i === 3 ? -0.44 : -0.27, y, COLOR.n500));
  plane(pages[2].c, 0.24, 0.05, -0.57, -0.33, COLOR.n300, 0.8);
  // brand
  plane(pages[3].c, 0.62, 0.44, 0.34, 0.04, COLOR.driftwood);
  pages[3].c.add(
    lineFrom(
      circlePts(0.07, 40).map((p) => p.add(new Vector3(-0.6, 0.33, 0.001))),
      lineMat(COLOR.driftwoodSoft, 0.9),
      true
    )
  );
  (
    [
      [COLOR.windsor, -0.6],
      [COLOR.white, -0.47],
      [COLOR.driftwoodSoft, -0.34],
    ] as const
  ).forEach(([c, x]) => {
    plane(pages[3].c, 0.1, 0.1, x, -0.33, c);
    box(pages[3].c, 0.1, 0.1, x, -0.33, 0.3);
  });
  plane(pages[3].c, 0.46, 0.05, -0.37, 0.14, COLOR.white, 0.85);
  plane(pages[3].c, 0.32, 0.05, -0.44, 0.05, COLOR.white, 0.85);
  const T = 7.2;
  function update(t: number) {
    root.rotation.y = -0.62 + 0.1 * Math.sin(t * 0.3);
    const a = t % T;
    const k = a < 1.2 ? 0 : a < 2.9 ? easeInOut((a - 1.2) / 1.7) : a < 5.4 ? 1 : a < 7.1 ? 1 - easeInOut((a - 5.4) / 1.7) : 0;
    pages.forEach((p, i) => {
      const o = i - 1.5;
      p.g.position.set(o * 0.14 * k, o * 0.05 * k, lerp(o * 0.028, o * 0.5, k));
      p.g.rotation.y = 0.08 * o * k;
    });
  }
  return { scene, camera, update, still: 3.8 };
}

/** The six builders, by piece. */
export const builders: Record<PieceKey, (snap: boolean) => Piece> = {
  security: sceneSecurity,
  workspace: sceneWorkspace,
  automation: sceneAutomation,
  mobile: sceneMobile,
  bot: sceneBot,
  profile: sceneProfile,
};
