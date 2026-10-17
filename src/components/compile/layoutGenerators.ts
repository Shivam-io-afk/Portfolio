import * as THREE from 'three';
import { CONSTELLATION_REPOS, CONSTELLATION_CONNECTIONS } from '../../data/repoConstellationData';

export const SKILL_CLUSTER_CENTERS = [
  new THREE.Vector3(-4.2, 2.2, 0.8),   // Frontend
  new THREE.Vector3(4.0, 2.4, -0.6),   // Backend & DB
  new THREE.Vector3(-3.2, -2.6, 1.4),  // Languages
  new THREE.Vector3(3.6, -2.2, 1.2),   // Emerging AI
  new THREE.Vector3(0, 3.8, -1.6),     // Tools
];

export const SKILL_CLUSTER_EDGES: [number, number][] = [
  [0, 1], // Frontend <-> Backend
  [0, 2], // Frontend <-> Languages
  [1, 3], // Backend <-> AI
  [2, 3], // Languages <-> AI
  [0, 4], // Frontend <-> Tools
  [1, 4], // Backend <-> Tools
  [2, 4], // Languages <-> Tools
  [3, 4], // AI <-> Tools
];

/**
 * Generate 5 layout position arrays for N instances.
 * Returns { pos0, pos1, pos2, pos3, pos4, seeds, hotFlags, scales, towerIdxs, repoIdxs }
 */
export function generateLayoutPositions(count: number) {
  const pos0 = new Float32Array(count * 3);
  const pos1 = new Float32Array(count * 3);
  const pos2 = new Float32Array(count * 3);
  const pos3 = new Float32Array(count * 3);
  const pos4 = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const hotFlags = new Float32Array(count);
  const scales = new Float32Array(count);
  const towerIdxs = new Float32Array(count);
  const repoIdxs = new Float32Array(count);

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // -------------------------------------------------------------
  // LAYOUT 0: SOURCE (Fibonacci Sphere radius ~1.85, shifted to X=0.95, Y=0.35)
  // Keeps clear of right-hand intro card and left headline
  // -------------------------------------------------------------
  for (let i = 0; i < count; i++) {
    seeds[i] = Math.random();
    hotFlags[i] = Math.random() < 0.08 ? 1.0 : 0.0;
    scales[i] = 0.045 + Math.random() * 0.035;

    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = (2 * Math.PI * i) / goldenRatio;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Displaced sphere with high-frequency surface wave
    const disp = Math.sin(x * 3.5 + y * 2.5) * Math.cos(z * 3.5) * 0.22;
    const r = 1.85 + disp;

    pos0[i * 3 + 0] = x * r + 0.95;
    pos0[i * 3 + 1] = y * r + 0.35;
    pos0[i * 3 + 2] = z * r;
  }

  // -------------------------------------------------------------
  // LAYOUT 1: BUILD (5 Distinct Project Towers framing beside cards)
  // Tower 0: Onbuggy ring of shop stalls (Right side X = +3.2, Card on Left)
  // Tower 1: TaskFlow 3 kanban columns (Left side X = -3.2, Card on Right)
  // Tower 2: Khatabook ledger page fan (Right side X = +3.2, Card on Left)
  // Tower 3: Zoom 3x3 screen grid matrix (Left side X = -3.2, Card on Right)
  // Tower 4: ShelterMap map grid + alert pins (Right side X = +3.2, Card on Left)
  // -------------------------------------------------------------
  const perTower = Math.floor(count / 5);
  const shelterPinCenters = [
    [-0.9, -0.7],
    [0.75, -0.5],
    [0.0, 0.3],
    [-0.65, 0.85],
    [0.9, 0.8],
  ];

  for (let i = 0; i < count; i++) {
    const towerIdx = Math.min(4, Math.floor(i / perTower));
    towerIdxs[i] = towerIdx;
    const localIdx = i % perTower;
    const norm = localIdx / perTower;

    let x = 0, y = 0, z = 0;

    if (towerIdx === 0) {
      // Tower 0 (Onbuggy): Ring of shop stalls / vendor market perimeter (Right X = +3.2)
      const stallIdx = Math.floor(norm * 12);
      const stallAngle = (stallIdx / 12) * Math.PI * 2;
      const stallRadius = 1.9 + (localIdx % 3) * 0.28;
      const jitterAngle = (localIdx % 10 - 5) * 0.04;
      x = 3.2 + Math.cos(stallAngle + jitterAngle) * stallRadius;
      y = ((localIdx % 24) / 24) * 3.2 - 1.4; // vendor stall vertical volume
      z = Math.sin(stallAngle + jitterAngle) * stallRadius;
    } else if (towerIdx === 1) {
      // Tower 1 (TaskFlow): 3 Kanban board columns (Left X = -3.2)
      const col = localIdx % 3; // 0, 1, 2
      const colX = -3.2 + (col - 1) * 1.35;
      const cardSlot = Math.floor(localIdx / 3) % 10;
      const cardY = (cardSlot / 10) * 4.4 - 2.2;
      x = colX + (Math.random() - 0.5) * 0.75;
      y = cardY + (Math.random() - 0.5) * 0.25;
      z = (Math.random() - 0.5) * 0.45;
    } else if (towerIdx === 2) {
      // Tower 2 (Khatabook): Ledger page fan (Right X = +3.2)
      const pageIdx = Math.floor(norm * 8); // 8 fanned pages
      const pageAngle = (pageIdx / 8 - 0.5) * 1.45; // -40deg to +40deg
      const pageU = (localIdx % 80) / 80;
      const pageV = (Math.floor(localIdx / 80) % 25) / 25;
      const rad = 0.6 + pageU * 1.7;
      x = 3.2 + Math.sin(pageAngle) * rad;
      y = pageV * 4.2 - 2.1;
      z = Math.cos(pageAngle) * rad * 0.8;
    } else if (towerIdx === 3) {
      // Tower 3 (Zoom): 3x3 screen video wall matrix (Left X = -3.2)
      const screenIdx = localIdx % 9; // 0 to 8
      const screenCol = screenIdx % 3;
      const screenRow = Math.floor(screenIdx / 3);
      const screenCenterX = -3.2 + (screenCol - 1) * 1.35;
      const screenCenterY = (screenRow - 1) * 1.25;
      const u = (localIdx % 28) / 28 - 0.5;
      const v = (Math.floor(localIdx / 28) % 18) / 18 - 0.5;
      x = screenCenterX + u * 1.15;
      y = screenCenterY + v * 0.85;
      z = (Math.random() - 0.5) * 0.22;
    } else {
      // Tower 4 (ShelterMap): Geospatial map grid + rising pulsing alert pins (Right X = +3.2)
      const isPin = localIdx % 5 === 0;
      if (isPin) {
        const pinIdx = Math.floor(localIdx / 5) % shelterPinCenters.length;
        const [pinX, pinZ] = shelterPinCenters[pinIdx];
        const pinH = ((localIdx % 36) / 36) * 3.4;
        x = 3.2 + pinX + (Math.random() - 0.5) * 0.12;
        y = -1.2 + pinH;
        z = pinZ + (Math.random() - 0.5) * 0.12;
        hotFlags[i] = 1.0; // Glow alert pin in signal orange
      } else {
        const gridCol = (localIdx % 28) - 14;
        const gridRow = Math.floor((localIdx % 784) / 28) - 14;
        x = 3.2 + gridCol * 0.14 + (Math.random() - 0.5) * 0.04;
        z = gridRow * 0.14 + (Math.random() - 0.5) * 0.04;
        y = -1.2 + Math.sin(gridCol * 0.22) * Math.cos(gridRow * 0.22) * 0.3 + (localIdx % 4) * 0.04;
      }
    }

    pos1[i * 3 + 0] = x;
    pos1[i * 3 + 1] = y;
    pos1[i * 3 + 2] = z;
  }

  // -------------------------------------------------------------
  // LAYOUT 2: NETWORK (17-Repo Constellation across 6 Language Galaxies)
  // 9350 bits form dense star clusters per repo; 2650 bits form filaments
  // -------------------------------------------------------------
  const perRepo = Math.floor((count * 0.78) / CONSTELLATION_REPOS.length); // ~550 bits per repo
  const clusterTotal = perRepo * CONSTELLATION_REPOS.length;

  for (let i = 0; i < count; i++) {
    if (i < clusterTotal) {
      const rIdx = Math.min(CONSTELLATION_REPOS.length - 1, Math.floor(i / perRepo));
      repoIdxs[i] = rIdx;
      const repo = CONSTELLATION_REPOS[rIdx];
      const localIdx = i % perRepo;
      const isCore = localIdx < 45;

      let rad: number;
      if (isCore) {
        rad = Math.pow(Math.random(), 1.5) * 0.28;
        hotFlags[i] = 1.0; // Bright stellar core
      } else {
        rad = 0.18 + Math.pow(Math.random(), 0.7) * 0.82;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos2[i * 3 + 0] = repo.position[0] + rad * Math.sin(phi) * Math.cos(theta);
      pos2[i * 3 + 1] = repo.position[1] + rad * Math.sin(phi) * Math.sin(theta);
      pos2[i * 3 + 2] = repo.position[2] + rad * Math.cos(phi);
    } else {
      repoIdxs[i] = 25.0; // Filament / connector bit
      const edge = CONSTELLATION_CONNECTIONS[(i - clusterTotal) % CONSTELLATION_CONNECTIONS.length];
      const repoA = CONSTELLATION_REPOS[edge[0]];
      const repoB = CONSTELLATION_REPOS[edge[1]];
      const t = ((i - clusterTotal) % 80) / 80;
      const jitter = (Math.random() - 0.5) * 0.08;

      pos2[i * 3 + 0] = THREE.MathUtils.lerp(repoA.position[0], repoB.position[0], t) + jitter;
      pos2[i * 3 + 1] = THREE.MathUtils.lerp(repoA.position[1], repoB.position[1], t) + jitter;
      pos2[i * 3 + 2] = THREE.MathUtils.lerp(repoA.position[2], repoB.position[2], t) + jitter;
    }
  }

  // -------------------------------------------------------------
  // LAYOUT 3: RUNTIME (Double Helix along +Y, R=1.6, 6 turns, height 14)
  // -------------------------------------------------------------
  for (let i = 0; i < count; i++) {
    const strand = i % 2 === 0 ? 0 : Math.PI;
    const progress = i / count;
    const angle = progress * Math.PI * 12 + strand;
    const rad = 1.6 + (Math.random() - 0.5) * 0.25;
    const y = progress * 14.0 - 7.0;

    const isRing = (i % 80) < 18;
    if (isRing) {
      const ringHeights = [-4.0, -1.5, 1.5, 4.5];
      const targetH = ringHeights[i % ringHeights.length];
      const ringAngle = (i % 60) * ((Math.PI * 2) / 60);
      pos3[i * 3 + 0] = Math.cos(ringAngle) * 2.3;
      pos3[i * 3 + 1] = targetH + (Math.random() - 0.5) * 0.15;
      pos3[i * 3 + 2] = Math.sin(ringAngle) * 2.3;
    } else {
      pos3[i * 3 + 0] = Math.cos(angle) * rad;
      pos3[i * 3 + 1] = y;
      pos3[i * 3 + 2] = Math.sin(angle) * rad;
    }
  }

  // -------------------------------------------------------------
  // LAYOUT 4: DEPLOY (Beacon column + floor ripple rings shifted to RIGHT X = +3.6)
  // Keeps clear of the contact form on the left
  // -------------------------------------------------------------
  for (let i = 0; i < count; i++) {
    const isColumn = i < count * 0.55;
    if (isColumn) {
      // Beacon cylinder standing at X = +3.6
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.5) * 0.45;
      const y = (i / (count * 0.55)) * 6.5 - 3.0;

      pos4[i * 3 + 0] = Math.cos(angle) * radius + 3.6;
      pos4[i * 3 + 1] = y;
      pos4[i * 3 + 2] = Math.sin(angle) * radius;
    } else {
      // Concentric ripple rings on the floor centered at X = +3.6
      const ringIdx = (i % 6) + 1;
      const ringRadius = ringIdx * 0.85 + (Math.random() - 0.5) * 0.12;
      const angle = Math.random() * Math.PI * 2;

      pos4[i * 3 + 0] = Math.cos(angle) * ringRadius + 3.6;
      pos4[i * 3 + 1] = -2.8 + (Math.random() - 0.5) * 0.08;
      pos4[i * 3 + 2] = Math.sin(angle) * ringRadius;
    }
  }

  return { pos0, pos1, pos2, pos3, pos4, seeds, hotFlags, scales, towerIdxs, repoIdxs };
}
