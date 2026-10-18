/**
 * CompileScene — drop-in 3D background for the COMPILE portfolio.
 *
 * One fixed full-screen canvas. N chrome "bits" morph on the GPU between 5 layouts,
 * driven by where the visitor is on the page (reads the section ids directly):
 *   #hero       → 0 SOURCE  : reactor core — noisy bit shell, glowing core, energy cage, orbit rings
 *   #projects   → 1 BUILD   : 5 project towers (Onbuggy, Taskflow, Khatabook, Zoom, ShelterMap); camera pans tower→tower
 *   #skills     → 2 NETWORK : 6 language galaxies made of repo clusters, joined by bit "edges"
 *   #experience → 3 RUNTIME : double helix with milestone rings; camera climbs it
 *   #contact    → 4 DEPLOY  : beacon column + floor rings with travelling light waves; core rises to the top
 *
 * Effects: GPU morph with staggered swirl, compile scan-beam on every stage change,
 * cursor repulsion on the core, scroll-velocity stretch, twinkling hot bits, bloom + vignette.
 *
 * No React state on scroll, no Suspense, no external assets (fonts/HDRs/models) → it can't stall.
 * Requires: three, @react-three/fiber, @react-three/postprocessing (+ postprocessing).
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/* ───────────────────────── config ───────────────────────── */

export type CompileSceneProps = {
  /** section ids in page order (must exist in the DOM) */
  sections?: string[];
  /** number of bits; default 12000 desktop / 5000 mobile */
  count?: number;
  /** accent colour (hot bits, core, waves) */
  accent?: string;
  background?: string;
  bloom?: boolean;
  /** overall brightness of bits, glow and grid (1 = original, default 1.6) */
  brightness?: number;
};

const DEFAULT_SECTIONS = ['hero', 'projects', 'skills', 'experience', 'contact'];
const TOWER_X = [-14, -7, 0, 7, 14];
const FLOOR_Y = -2;
const SKILL_CENTERS = [0, 1, 2, 3, 4, 5].map((k) => {
  const a = (k / 6) * Math.PI * 2;
  const v = new THREE.Vector3(Math.cos(a) * 3.6, k % 2 ? 0.9 : -0.7, Math.sin(a) * 3.0);
  if (k === 0) v.multiplyScalar(0.85);
  return v;
});

/* ───────────────────────── helpers ───────────────────────── */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** split n into parts proportional to weights (sums exactly to n) */
function split(n: number, weights: number[]) {
  const total = weights.reduce((a, b) => a + b, 0);
  const out = weights.map((w) => Math.floor((n * w) / total));
  let rest = n - out.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % out.length, rest--) out[i]++;
  return out;
}

type Writer = { buf: Float32Array; i: number; push: (x: number, y: number, z: number) => void };
function writer(n: number): Writer {
  const w: Writer = {
    buf: new Float32Array(n * 3),
    i: 0,
    push(x, y, z) {
      if (w.i >= n) return;
      w.buf[w.i * 3] = x;
      w.buf[w.i * 3 + 1] = y;
      w.buf[w.i * 3 + 2] = z;
      w.i++;
    },
  };
  return w;
}

/* ───────────────────────── layouts ───────────────────────── */

const GA = Math.PI * (3 - Math.sqrt(5));

function layoutSource(n: number, r: () => number) {
  const w = writer(n);
  const [shell, rings] = split(n, [84, 16]);
  for (let i = 0; i < shell; i++) {
    const y = 1 - (2 * (i + 0.5)) / shell;
    const rad = Math.sqrt(1 - y * y);
    const th = i * GA;
    const x = Math.cos(th) * rad;
    const z = Math.sin(th) * rad;
    // lumpy, slightly thick shell
    const lump = 1 + 0.07 * Math.sin(x * 4.1 + y * 2.3) * Math.cos(z * 3.7 - y * 1.9);
    const R = 2.05 * lump * (0.93 + r() * 0.1);
    w.push(x * R, y * R, z * R);
  }
  const ringDefs = [
    { R: 3.0, tx: 1.15, tz: 0.2 },
    { R: 3.45, tx: -0.5, tz: 0.9 },
    { R: 3.95, tx: 0.3, tz: -1.1 },
  ];
  const per = split(rings, [1, 1, 1]);
  ringDefs.forEach((d, k) => {
    const e = new THREE.Euler(d.tx, 0, d.tz);
    const v = new THREE.Vector3();
    for (let i = 0; i < per[k]; i++) {
      const a = (i / per[k]) * Math.PI * 2;
      v.set(Math.cos(a) * d.R, (r() - 0.5) * 0.06, Math.sin(a) * d.R).applyEuler(e);
      w.push(v.x, v.y, v.z);
    }
  });
  return w.buf;
}

function boxSurface(w: Writer, r: () => number, cx: number, y0: number, cz: number, sx: number, sy: number, sz: number) {
  // random point on the surface of a box (bottom at y0)
  const areas = [sx * sy, sx * sy, sy * sz, sy * sz, sx * sz, sx * sz];
  const tot = areas.reduce((a, b) => a + b, 0);
  let k = r() * tot;
  let f = 0;
  while (k > areas[f]) k -= areas[f++];
  const u = r() - 0.5;
  const v = r() - 0.5;
  let x = 0,
    y = 0,
    z = 0;
  if (f < 2) {
    x = u * sx;
    y = (v + 0.5) * sy;
    z = (f === 0 ? -0.5 : 0.5) * sz;
  } else if (f < 4) {
    z = u * sz;
    y = (v + 0.5) * sy;
    x = (f === 2 ? -0.5 : 0.5) * sx;
  } else {
    x = u * sx;
    z = v * sz;
    y = f === 4 ? 0 : sy;
  }
  w.push(cx + x, y0 + y, cz + z);
}

function layoutBuild(n: number, r: () => number) {
  const w = writer(n);
  const parts = split(n, [1, 1, 1, 1, 1]);

  // 01 ONBUGGY — central hub + ring of 12 shop stacks
  {
    const cx = TOWER_X[0];
    const [hub, shops] = split(parts[0], [30, 70]);
    for (let i = 0; i < hub; i++) {
      const a = r() * Math.PI * 2;
      const y = FLOOR_Y + r() * 3.4;
      w.push(cx + Math.cos(a) * 0.5, y, Math.sin(a) * 0.5);
    }
    const heights = Array.from({ length: 12 }, () => 0.6 + r() * 1.3);
    for (let i = 0; i < shops; i++) {
      const k = i % 12;
      const a = (k / 12) * Math.PI * 2;
      boxSurface(w, r, cx + Math.cos(a) * 2.1, FLOOR_Y, Math.sin(a) * 2.1, 0.55, heights[k], 0.55);
    }
  }
  // 02 TASKFLOW — 3 kanban columns of card slabs
  {
    const cx = TOWER_X[1];
    const cols = [7, 5, 6];
    const cards: [number, number][] = [];
    cols.forEach((c, ci) => {
      for (let k = 0; k < c; k++) cards.push([(ci - 1) * 1.3, FLOOR_Y + 0.15 + k * 0.42]);
    });
    for (let i = 0; i < parts[1]; i++) {
      const [x, y] = cards[i % cards.length];
      boxSurface(w, r, cx + x, y, 0, 1.0, 0.12, 0.6);
    }
  }
  // 03 KHATABOOK — fanned stack of ledger pages
  {
    const cx = TOWER_X[2];
    const pages = 34;
    for (let i = 0; i < parts[2]; i++) {
      const k = i % pages;
      const a = k * 0.022 - 0.35;
      const u = (r() - 0.5) * 1.8;
      const v = (r() - 0.5) * 1.25;
      const x = u * Math.cos(a) - v * Math.sin(a);
      const z = u * Math.sin(a) + v * Math.cos(a);
      w.push(cx + x, FLOOR_Y + 0.1 + k * 0.095, z);
    }
  }
  // 04 ZOOM — 3×3 wall of hollow screens
  {
    const cx = TOWER_X[3];
    const size = 0.95;
    const b = 0.13;
    for (let i = 0; i < parts[3]; i++) {
      const k = i % 9;
      const gx = ((k % 3) - 1) * 1.15;
      const gy = FLOOR_Y + 0.75 + Math.floor(k / 3) * 1.15;
      // point on the frame border
      const side = Math.floor(r() * 4);
      const t = (r() - 0.5) * size;
      const d = (r() - 0.5) * b;
      let x = 0,
        y = 0;
      if (side === 0) [x, y] = [t, size / 2 + d];
      else if (side === 1) [x, y] = [t, -size / 2 + d];
      else if (side === 2) [x, y] = [size / 2 + d, t];
      else [x, y] = [-size / 2 + d, t];
      w.push(cx + gx + x, gy + y, (r() - 0.5) * 0.12);
    }
  }
  // 05 SHELTERMAP — map grid with alert pins
  {
    const cx = TOWER_X[4];
    const [grid, pins] = split(parts[4], [62, 38]);
    for (let i = 0; i < grid; i++) {
      const gx = Math.round((r() - 0.5) * 18) * 0.21;
      const gz = Math.round((r() - 0.5) * 18) * 0.21;
      w.push(cx + gx, FLOOR_Y + 0.02 + r() * 0.04, gz);
    }
    const pinPos = Array.from({ length: 7 }, () => [(r() - 0.5) * 3.2, (r() - 0.5) * 3.2, 0.8 + r() * 1.8]);
    for (let i = 0; i < pins; i++) {
      const [px, pz, h] = pinPos[i % pinPos.length];
      const t = r();
      if (t < 0.7) {
        w.push(cx + px + (r() - 0.5) * 0.08, FLOOR_Y + t / 0.7 * h, pz + (r() - 0.5) * 0.08);
      } else {
        // pin head: small sphere
        const a = r() * Math.PI * 2;
        const c = r() * 2 - 1;
        const s = Math.sqrt(1 - c * c) * 0.22;
        w.push(cx + px + Math.cos(a) * s, FLOOR_Y + h + 0.2 + c * 0.22, pz + Math.sin(a) * s);
      }
    }
  }
  return w.buf;
}

function layoutNetwork(n: number, r: () => number) {
  const w = writer(n);
  // language galaxies: JS 10 repos, TS 2, C 2, Python 1, Shell 1, HTML/CSS 2
  const repos = [10, 2, 2, 1, 1, 2];
  const centers = repos.map((_, k) => {
    const a = (k / repos.length) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * 3.6, (k % 2 ? 0.9 : -0.7), Math.sin(a) * 3.0);
  });
  centers[0].multiplyScalar(0.85);
  const clusters: { c: THREE.Vector3; rad: number }[] = [];
  repos.forEach((cnt, k) => {
    for (let j = 0; j < cnt; j++) {
      const off =
        cnt === 1
          ? new THREE.Vector3()
          : new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.55 + r() * 0.65);
      clusters.push({ c: centers[k].clone().add(off), rad: j === 0 ? 0.42 : 0.2 + r() * 0.14 });
    }
  });
  const [nodes, edges, hub] = split(n, [74, 22, 4]);
  for (let i = 0; i < nodes; i++) {
    const cl = clusters[i % clusters.length];
    const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(cl.rad * Math.cbrt(r()));
    w.push(cl.c.x + v.x, cl.c.y + v.y, cl.c.z + v.z);
  }
  const links: [THREE.Vector3, THREE.Vector3][] = [];
  centers.forEach((c, k) => {
    links.push([c, centers[(k + 1) % centers.length]]);
    links.push([c, new THREE.Vector3()]);
  });
  clusters.forEach((cl, k) => links.push([cl.c, centers[Math.min(repos.length - 1, repoGalaxy(k, repos))]]));
  for (let i = 0; i < edges; i++) {
    const [a, b] = links[i % links.length];
    const t = r();
    w.push(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  }
  for (let i = 0; i < hub; i++) {
    const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(0.38);
    w.push(v.x, v.y, v.z);
  }
  return w.buf;
}
function repoGalaxy(clusterIndex: number, repos: number[]) {
  let acc = 0;
  for (let k = 0; k < repos.length; k++) {
    acc += repos[k];
    if (clusterIndex < acc) return k;
  }
  return repos.length - 1;
}

function layoutRuntime(n: number, r: () => number) {
  const w = writer(n);
  const [strands, rungs, rings] = split(n, [58, 14, 28]);
  const H = 12;
  const turns = 4.5;
  const R = 1.6;
  for (let i = 0; i < strands; i++) {
    const t = r();
    const s = i % 2;
    const a = t * turns * Math.PI * 2 + s * Math.PI;
    const j = 0.09;
    w.push(Math.cos(a) * R + (r() - 0.5) * j, -H / 2 + t * H + (r() - 0.5) * j, Math.sin(a) * R + (r() - 0.5) * j);
  }
  const rungCount = 30;
  for (let i = 0; i < rungs; i++) {
    const k = i % rungCount;
    const t = (k + 0.5) / rungCount;
    const a = t * turns * Math.PI * 2;
    const u = r() * 2 - 1;
    w.push(Math.cos(a) * R * u, -H / 2 + t * H, Math.sin(a) * R * u);
  }
  const ringCount = 7;
  for (let i = 0; i < rings; i++) {
    const k = i % ringCount;
    const y = -H / 2 + ((k + 0.5) / ringCount) * H;
    const a = r() * Math.PI * 2;
    const b = r() * Math.PI * 2;
    const rr = 2.35 + Math.cos(b) * 0.07;
    w.push(Math.cos(a) * rr, y + Math.sin(b) * 0.07, Math.sin(a) * rr);
  }
  return w.buf;
}

function layoutDeploy(n: number, r: () => number) {
  const w = writer(n);
  const [column, rings, sparks] = split(n, [36, 50, 14]);
  for (let i = 0; i < column; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.34 * Math.sqrt(r());
    w.push(Math.cos(a) * rad, FLOOR_Y + r() * 6.6, Math.sin(a) * rad);
  }
  const ringCount = 6;
  for (let i = 0; i < rings; i++) {
    const k = i % ringCount;
    const a = r() * Math.PI * 2;
    const rr = 1.2 + k * 0.9 + (r() - 0.5) * 0.08;
    w.push(Math.cos(a) * rr, FLOOR_Y + 0.02, Math.sin(a) * rr);
  }
  for (let i = 0; i < sparks; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.15 + r() * 0.9 * r();
    w.push(Math.cos(a) * rad, FLOOR_Y + 6.8 + r() * 3.5, Math.sin(a) * rad);
  }
  return w.buf;
}

/* ───────────────────────── shaders ───────────────────────── */

const bitsVert = /* glsl */ `
  attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4;
  attribute vec4 aRnd; // x seed, y spin, z scale, w hot
  uniform float uTime, uStage, uVel, uScanY, uScanOn, uWave, uMotion, uSpin;
  uniform vec3 uMouse; uniform float uMouseOn;
  uniform float uFocusX, uFocusBoost;
  uniform vec3 uSkillCenter; uniform float uSkillBoost;
  varying vec3 vN; varying vec3 vW; varying float vHot; varying float vFlash;

  vec3 pick(float i){ return i < 0.5 ? aP0 : i < 1.5 ? aP1 : i < 2.5 ? aP2 : i < 3.5 ? aP3 : aP4; }
  mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
  mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

  void main(){
    float st = clamp(uStage, 0.0, 4.0);
    float i0 = min(floor(st), 3.0);
    float f = st - i0;
    float t = clamp(f * 1.75 - aRnd.x * 0.75, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(pick(i0), pick(i0 + 1.0), t);

    // hero: slow spin + breathing
    float w0 = 1.0 - clamp(st, 0.0, 1.0);
    p = rotY(uSpin * w0) * p;
    p += normalize(p + 1e-4) * w0 * 0.07 * sin(uTime * 1.6 + aRnd.x * 12.0) * uMotion;

    // swirl while travelling between layouts
    float sw = sin(3.14159 * t) * uMotion;
    p += sw * 1.3 * vec3(sin(aRnd.x * 41.0 + uTime * 0.9), cos(aRnd.y * 37.0 + uTime * 1.2), sin(aRnd.x * 23.0 - uTime * 0.7));

    // cursor repulsion (hero)
    vec3 d = p - uMouse;
    float dl = length(d);
    p += normalize(d + 1e-4) * uMouseOn * w0 * 1.1 * exp(-dl * dl * 0.9);

    // BUILD stage tower focus highlight & slight expansion (stage 1)
    float distFocus = abs(p.x - uFocusX);
    float inTower = (1.0 - smoothstep(0.0, 2.8, distFocus)) * uFocusBoost;
    float stage1Weight = clamp(1.0 - abs(st - 1.0) * 1.4, 0.0, 1.0);
    float towerBoost = inTower * stage1Weight;
    p += normalize(vec3(p.x - uFocusX, p.y, p.z) + 1e-4) * (towerBoost * 0.22 * uMotion);

    // NETWORK stage skill cluster focus (stage 2)
    float stage2Weight = clamp(1.0 - abs(st - 2.0) * 1.4, 0.0, 1.0);
    float distSkill = length(p - uSkillCenter);
    float skillBoost = (1.0 - smoothstep(0.0, 2.2, distSkill)) * uSkillBoost * stage2Weight;
    p += normalize(p - uSkillCenter + 1e-4) * (skillBoost * 0.18 * uMotion);

    // the cube itself
    float a = uTime * (0.15 + aRnd.y * 0.5) * uMotion + aRnd.x * 6.2831;
    mat3 R = rotY(a) * rotX(a * 0.7);
    vec3 lp = R * (position * aRnd.z);
    vec3 n = R * normal;
    lp.y *= 1.0 + min(abs(uVel) * 0.9, 3.0) * uMotion; // scroll-velocity stretch

    vec3 wp = p + lp;
    float baseHot = aRnd.w * (0.65 + 0.35 * sin(uTime * 2.3 + aRnd.x * 60.0));
    vHot = clamp(baseHot + towerBoost * 2.0 + skillBoost * 2.0, 0.0, 2.5);

    // compile scan beam + deploy waves
    vFlash = uScanOn * exp(-pow((wp.y - uScanY) * 2.6, 2.0));
    float rr = length(wp.xz);
    vFlash += uWave * exp(-pow((rr - mod(uTime * 2.4, 8.5)) * 2.2, 2.0)) * (1.0 - smoothstep(-1.5, -0.5, wp.y));

    vN = n;
    vW = wp;
    gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  }
`;

const bitsFrag = /* glsl */ `
  uniform vec3 uAccent; uniform vec3 uBg; uniform float uBright;
  varying vec3 vN; varying vec3 vW; varying float vHot; varying float vFlash;
  void main(){
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);
    vec3 R = reflect(-V, N);
    // fake studio environment: dark floor, bright soft top, warm key light from the core side
    vec3 env = mix(vec3(0.03, 0.035, 0.045), vec3(0.78, 0.82, 0.9), smoothstep(-0.15, 0.85, R.y));
    env += uAccent * 0.9 * pow(max(dot(R, normalize(vec3(-0.7, 0.15, 0.6))), 0.0), 10.0);
    env += vec3(0.55, 0.65, 1.0) * 0.35 * pow(max(dot(R, normalize(vec3(0.8, 0.3, -0.4))), 0.0), 14.0);
    float diff = max(dot(N, normalize(vec3(0.4, 0.85, 0.45))), 0.0) * 0.55 + 0.45;
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 col = (env * diff * 0.62 + vec3(0.55, 0.6, 0.72) * fres * 0.45 + vec3(0.05, 0.055, 0.07)) * uBright;
    col = mix(col, uAccent * 2.4 * (0.55 + 0.45 * uBright), clamp(vHot, 0.0, 1.0));
    col += vec3(1.0, 0.97, 0.92) * vFlash * 1.6 + uAccent * vFlash * 0.6;
    float fog = smoothstep(11.0, 30.0, length(cameraPosition - vW));
    gl_FragColor = vec4(mix(col, uBg, fog), 1.0);
  }
`;

const coreVert = /* glsl */ `
  varying vec3 vN; varying vec3 vW;
  void main(){
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const coreFrag = /* glsl */ `
  uniform vec3 uAccent; uniform float uTime; uniform float uPulse;
  varying vec3 vN; varying vec3 vW;
  void main(){
    vec3 V = normalize(cameraPosition - vW);
    float f = max(dot(normalize(vN), V), 0.0);
    float flick = 0.92 + 0.08 * sin(uTime * 7.0) + uPulse * 0.6;
    vec3 col = uAccent * mix(0.9, 3.4, pow(f, 1.6)) + vec3(1.0, 0.92, 0.8) * pow(f, 7.0) * 2.4;
    gl_FragColor = vec4(col * flick, 1.0);
  }
`;
const haloVert = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const haloFrag = /* glsl */ `
  uniform vec3 uAccent; uniform float uOpacity; uniform float uBright;
  varying vec2 vUv;
  void main(){
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(max(1.0 - d, 0.0), 2.4);
    float core = pow(max(1.0 - d * 2.2, 0.0), 3.0);
    gl_FragColor = vec4((uAccent * a * 1.1 + vec3(1.0, 0.85, 0.7) * core * 0.9) * uOpacity * (0.6 + 0.4 * uBright), 1.0);
  }
`;
const floorVert = /* glsl */ `
  varying vec3 vW;
  void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
`;
const floorFrag = /* glsl */ `
  uniform vec3 uAccent; uniform float uTime, uOpacity, uWave, uBright;
  varying vec3 vW;
  void main(){
    vec2 c = vW.xz * 0.5;
    vec2 g = abs(fract(c) - 0.5) / fwidth(c);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float dist = length(cameraPosition - vW);
    float fade = 1.0 - smoothstep(6.0, 26.0, dist);
    float rr = length(vW.xz);
    float ring = uWave * exp(-pow((rr - mod(uTime * 2.4, 8.5)) * 1.6, 2.0));
    vec3 col = vec3(0.32, 0.34, 0.4) * line * 0.32 * uBright + uAccent * (ring * 1.1 + uWave * 0.18 * exp(-rr * 0.45));
    gl_FragColor = vec4(col * fade * uOpacity, 1.0);
  }
`;
const starVert = /* glsl */ `
  attribute float aSeed; uniform float uTime; varying float vA;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0));
    gl_PointSize = (1.2 + aSeed * 2.2) * (30.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const starFrag = /* glsl */ `
  varying float vA;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(0.75, 0.8, 0.95) * vA * (1.0 - d * 2.0), 1.0);
  }
`;

/* ───────────────────────── scroll tracking (no React state) ───────────────────────── */

type ScrollState = { stage: number; sub: number[]; vel: number };

function useScrollStage(ids: string[]) {
  const state = useRef<ScrollState>({ stage: 0, sub: ids.map(() => 0), vel: 0 });
  useEffect(() => {
    let tops: number[] = [];
    let heights: number[] = [];
    const measure = () => {
      tops = [];
      heights = [];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) {
          tops.push(Number.NaN);
          heights.push(0);
          return;
        }
        const r = el.getBoundingClientRect();
        tops.push(r.top + window.scrollY);
        heights.push(r.height);
      });
    };
    let lastY = window.scrollY;
    let lastT = performance.now();
    const update = () => {
      const vh = window.innerHeight;
      const center = window.scrollY + vh * 0.5;
      let stage = 0;
      for (let i = 0; i < ids.length; i++) {
        if (Number.isNaN(tops[i])) continue;
        const local = center - tops[i];
        state.current.sub[i] = clamp01(local / Math.max(1, heights[i]));
        if (local >= 0) {
          // short sections get a shorter morph zone so their layout can settle first
          const blend = Math.min(vh * 0.7, heights[i] * 0.35);
          const end = heights[i] - blend;
          stage = i + (i < ids.length - 1 ? smooth((local - end) / blend) : 0);
        }
      }
      state.current.stage = Math.min(stage, ids.length - 1);
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      const v = (window.scrollY - lastY) / dt; // px per ms
      state.current.vel = v;
      lastY = window.scrollY;
      lastT = now;
    };
    measure();
    update();
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(document.body);
    const onScroll = () => update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    const iv = window.setInterval(measure, 1500); // late-loading content / fonts
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.clearInterval(iv);
    };
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

/* ───────────────────────── the world ───────────────────────── */

function World({ ids, count, accent, background, brightness }: { ids: string[]; count: number; accent: string; background: string; brightness: number }) {
  const scroll = useScrollStage(ids);
  const { camera, size } = useThree();
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const accentC = useMemo(() => new THREE.Color(accent), [accent]);
  const bgC = useMemo(() => new THREE.Color(background), [background]);

  /* bits geometry with 5 layouts as instanced attributes */
  const bits = useMemo(() => {
    const rng = mulberry32(20261017);
    const box = new THREE.BoxGeometry(1, 1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = box.index;
    g.setAttribute('position', box.getAttribute('position'));
    g.setAttribute('normal', box.getAttribute('normal'));
    const layouts = [layoutSource, layoutBuild, layoutNetwork, layoutRuntime, layoutDeploy].map((fn, k) =>
      fn(count, mulberry32(1000 + k)),
    );
    layouts.forEach((arr, k) => g.setAttribute(`aP${k}`, new THREE.InstancedBufferAttribute(arr, 3)));
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      rnd[i * 4] = rng();
      rnd[i * 4 + 1] = rng();
      rnd[i * 4 + 2] = 0.036 + rng() * 0.03;
      rnd[i * 4 + 3] = rng() < 0.045 ? 1 : 0;
    }
    g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 4));
    g.instanceCount = count;
    return g;
  }, [count]);

  const bitsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bitsVert,
        fragmentShader: bitsFrag,
        uniforms: {
          uTime: { value: 0 },
          uStage: { value: 0 },
          uVel: { value: 0 },
          uScanY: { value: 100 },
          uScanOn: { value: 0 },
          uWave: { value: 0 },
          uMotion: { value: reduced ? 0 : 1 },
          uSpin: { value: 0 },
          uMouse: { value: new THREE.Vector3(99, 99, 99) },
          uMouseOn: { value: 0 },
          uFocusX: { value: 999 },
          uFocusBoost: { value: 0 },
          uSkillCenter: { value: new THREE.Vector3(999, 999, 999) },
          uSkillBoost: { value: 0 },
          uAccent: { value: accentC },
          uBg: { value: bgC },
          uBright: { value: brightness },
        },
      }),
    [accentC, bgC, reduced, brightness],
  );

  const coreMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coreVert,
        fragmentShader: coreFrag,
        uniforms: { uAccent: { value: accentC }, uTime: { value: 0 }, uPulse: { value: 0 } },
      }),
    [accentC],
  );
  const haloMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        uniforms: { uAccent: { value: accentC }, uOpacity: { value: 1 }, uBright: { value: brightness } },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    [accentC, brightness],
  );
  const floorMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: floorVert,
        fragmentShader: floorFrag,
        uniforms: { uAccent: { value: accentC }, uTime: { value: 0 }, uOpacity: { value: 0.4 }, uWave: { value: 0 }, uBright: { value: brightness } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [accentC, brightness],
  );
  const cageGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.15, 1)), []);
  const cageMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: accentC, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
    [accentC],
  );

  const stars = useMemo(() => {
    const rng = mulberry32(7);
    const n = 1400;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize().multiplyScalar(28 + rng() * 30);
      pos.set([v.x, v.y, v.z], i * 3);
      seed[i] = rng();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: starVert,
      fragmentShader: starFrag,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { g, m };
  }, []);

  const coreGroup = useRef<THREE.Group>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const halo = useRef<THREE.Mesh>(null);

  /* pointer → world (window listener so the canvas can stay pointer-events:none) */
  const pointer = useRef({ x: 0, y: 0, last: -1e9 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.last = performance.now();
    };
    const onDown = () => {
      pulse.current = 1;
    };
    const onPulse = () => {
      pulse.current = 1;
    };
    const onTowerFocus = (e: Event) => {
      const custom = e as CustomEvent<{ index: number }>;
      towerFocusIdx.current = custom.detail?.index ?? -1;
    };
    const onSkillFocus = (e: Event) => {
      const custom = e as CustomEvent<{ index: number }>;
      skillFocusIdx.current = custom.detail?.index ?? -1;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('compile-pulse', onPulse);
    window.addEventListener('tower-focus', onTowerFocus);
    window.addEventListener('skill-focus', onSkillFocus);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('compile-pulse', onPulse);
      window.removeEventListener('tower-focus', onTowerFocus);
      window.removeEventListener('skill-focus', onSkillFocus);
    };
  }, []);

  const towerFocusIdx = useRef(-1);
  const smoothFocusBoost = useRef(0);
  const smoothFocusX = useRef(999);
  const skillFocusIdx = useRef(-1);
  const smoothSkillBoost = useRef(0);

  const pulse = useRef(0);
  const lastStageIdx = useRef(0);
  const scanStart = useRef(-10);
  const smoothStage = useRef(0);
  const smoothVel = useRef(0);
  const spin = useRef(0);
  const camPos = useMemo(() => new THREE.Vector3(-2.3, 0.3, 8.6), []);
  const camLook = useMemo(() => new THREE.Vector3(-2.3, 0, 0), []);
  const tmpA = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  const tmpB = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  }, [camera, camPos, camLook]);

  const target = (stage: number, out: { p: THREE.Vector3; l: THREE.Vector3 }, time: number) => {
    const portrait = size.width / size.height < 0.9;
    const sub = scroll.current.sub;
    switch (stage) {
      case 0:
        if (portrait) {
          out.p.set(0, 1.0, 11.5);
          out.l.set(0, 1.4, 0);
        } else {
          out.p.set(-2.4, 0.4, 8.6);
          out.l.set(-2.4, 0.05, 0);
        }
        break;
      case 1: {
        const kf = clamp01((sub[1] - 0.1) / 0.68) * 4; // 0..4 across the five towers
        const cx = TOWER_X[0] + kf * 7;
        const side = portrait ? 0 : 2.6 * Math.cos(Math.PI * kf);
        out.p.set(cx - side, 1.1, portrait ? 10.5 : 8.4);
        out.l.set(cx - side, -0.2, 0);
        break;
      }
      case 2: {
        const a = time * 0.04 + sub[2] * 1.4;
        const R = portrait ? 13 : 10.5;
        out.p.set(Math.sin(a) * R, 1.6, Math.cos(a) * R);
        out.l.set(0, 0, 0);
        break;
      }
      case 3: {
        const y = -5 + sub[3] * 10;
        out.p.set(portrait ? 0 : -3.2, y + 1.2, portrait ? 9 : 7.2);
        out.l.set(portrait ? 0 : -2.6, y, 0);
        break;
      }
      default:
        if (portrait) {
          out.p.set(0, 3.4, 13.5);
          out.l.set(0, 3.6, 0);
        } else {
          out.p.set(-4.6, 1.6, 11);
          out.l.set(-4.6, 1.1, 0);
        }
    }
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.25);
    const time = state.clock.elapsedTime;
    const raw = scroll.current.stage;
    smoothStage.current = THREE.MathUtils.damp(smoothStage.current, raw, 4.5, dt);
    const s = smoothStage.current;
    smoothVel.current = THREE.MathUtils.damp(smoothVel.current, scroll.current.vel, 6, dt);
    scroll.current.vel *= Math.pow(0.02, dt); // decay when no scroll events arrive

    // stage change → compile scan beam
    const idx = Math.round(raw);
    if (idx !== lastStageIdx.current) {
      lastStageIdx.current = idx;
      scanStart.current = time;
    }
    const st = time - scanStart.current;
    const scanOn = st < 1.1 && !reduced ? 1 - st / 1.1 : 0;

    const w0 = 1 - smooth(s);
    const w4 = smooth(s - 3);
    spin.current += dt * 0.12 * (reduced ? 0 : 1);
    pulse.current = Math.max(0, pulse.current - dt * 1.8);

    // pointer → plane z=0
    const active = performance.now() - pointer.current.last < 2500 ? 1 : 0;
    ray.setFromCamera(new THREE.Vector2(pointer.current.x, pointer.current.y), camera);
    if (ray.ray.intersectPlane(plane, hit)) bitsMat.uniforms.uMouse.value.copy(hit);

    // Tower focus damping over ~0.3s
    const targetFocusX = towerFocusIdx.current >= 0 && towerFocusIdx.current < TOWER_X.length
      ? TOWER_X[towerFocusIdx.current]
      : 999;
    const targetFocusBoost = towerFocusIdx.current >= 0 ? 1.0 : 0.0;
    smoothFocusBoost.current = THREE.MathUtils.damp(smoothFocusBoost.current, targetFocusBoost, 8.0, dt);
    smoothFocusX.current = THREE.MathUtils.damp(smoothFocusX.current, targetFocusX, 10.0, dt);

    // Skill focus damping over ~0.3s
    const targetSkillBoost = skillFocusIdx.current >= 0 ? 1.0 : 0.0;
    smoothSkillBoost.current = THREE.MathUtils.damp(smoothSkillBoost.current, targetSkillBoost, 8.0, dt);

    const u = bitsMat.uniforms;
    u.uTime.value = time;
    u.uStage.value = s;
    u.uVel.value = reduced ? 0 : smoothVel.current;
    u.uScanY.value = 7 - st * 14;
    u.uScanOn.value = scanOn;
    u.uWave.value = w4;
    u.uSpin.value = spin.current;
    u.uMouseOn.value = THREE.MathUtils.damp(u.uMouseOn.value, active && !reduced ? 1 : 0, 3, dt);
    u.uFocusX.value = smoothFocusX.current;
    u.uFocusBoost.value = smoothFocusBoost.current;
    u.uSkillBoost.value = smoothSkillBoost.current;
    if (skillFocusIdx.current >= 0 && skillFocusIdx.current < SKILL_CENTERS.length) {
      u.uSkillCenter.value.copy(SKILL_CENTERS[skillFocusIdx.current]);
    }

    coreMat.uniforms.uTime.value = time;
    coreMat.uniforms.uPulse.value = pulse.current;
    floorMat.uniforms.uTime.value = time;
    floorMat.uniforms.uWave.value = w4;
    floorMat.uniforms.uOpacity.value = 0.25 + 0.75 * smooth(s);
    stars.m.uniforms.uTime.value = time;

    // core: hero centre → beacon top
    const coreW = Math.max(w0, w4);
    if (coreGroup.current) {
      coreGroup.current.visible = coreW > 0.01;
      coreGroup.current.position.set(0, THREE.MathUtils.lerp(0, FLOOR_Y + 7.0, w4), 0);
      const sc = coreW * (1 + pulse.current * 0.25 + 0.03 * Math.sin(time * 3));
      coreGroup.current.scale.setScalar(Math.max(sc, 0.0001));
    }
    if (cage.current) {
      cage.current.rotation.y += dt * 0.35;
      cage.current.rotation.x += dt * 0.18;
    }
    if (halo.current) halo.current.quaternion.copy(camera.quaternion);
    haloMat.uniforms.uOpacity.value = 0.9 + pulse.current;

    // camera: blend the two stage targets around s, then damp
    const i0 = Math.min(Math.floor(s), 3);
    const f = smooth(s - i0);
    target(i0, tmpA, time);
    target(i0 + 1, tmpB, time);
    tmpA.p.lerp(tmpB.p, f);
    tmpA.l.lerp(tmpB.l, f);
    // gentle parallax from the pointer
    tmpA.p.x += pointer.current.x * 0.35;
    tmpA.p.y += pointer.current.y * 0.2;
    const k = reduced ? 10 : 3.2;
    camPos.x = THREE.MathUtils.damp(camPos.x, tmpA.p.x, k, dt);
    camPos.y = THREE.MathUtils.damp(camPos.y, tmpA.p.y, k, dt);
    camPos.z = THREE.MathUtils.damp(camPos.z, tmpA.p.z, k, dt);
    camLook.x = THREE.MathUtils.damp(camLook.x, tmpA.l.x, k, dt);
    camLook.y = THREE.MathUtils.damp(camLook.y, tmpA.l.y, k, dt);
    camLook.z = THREE.MathUtils.damp(camLook.z, tmpA.l.z, k, dt);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  });

  return (
    <>
      <mesh geometry={bits} material={bitsMat} frustumCulled={false} />
      <group ref={coreGroup}>
        <mesh material={coreMat}>
          <sphereGeometry args={[0.7, 48, 48]} />
        </mesh>
        <lineSegments ref={cage} geometry={cageGeo} material={cageMat} />
        <mesh ref={halo} material={haloMat} renderOrder={2}>
          <planeGeometry args={[7.5, 7.5]} />
        </mesh>
      </group>
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y - 0.06} material={floorMat} renderOrder={1}>
        <planeGeometry args={[90, 90]} />
      </mesh>
      <points geometry={stars.g} material={stars.m} frustumCulled={false} />
    </>
  );
}

/* ───────────────────────── public component ───────────────────────── */

export default function CompileScene({
  sections = DEFAULT_SECTIONS,
  count,
  accent = '#ff5b1f',
  background = '#07070a',
  bloom = true,
  brightness = 1.6,
}: CompileSceneProps) {
  const n = useMemo(() => {
    if (count) return count;
    if (typeof window === 'undefined') return 12000;
    return window.innerWidth < 768 ? 5000 : 12000;
  }, [count]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 120, position: [-2.3, 0.3, 8.6] }}
        gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      >
        <color attach="background" args={[background]} />
        <World ids={sections} count={n} accent={accent} background={background} brightness={brightness} />
        {bloom && (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.9 + 0.35 * brightness} luminanceThreshold={0.58} luminanceSmoothing={0.25} radius={0.75} />
            <Vignette offset={0.3} darkness={0.45} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
