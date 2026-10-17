import * as THREE from 'three';

/**
 * Generate 5 layout position arrays for N instances.
 * Returns { pos0, pos1, pos2, pos3, pos4, seeds, hotFlags, scales }
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

  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // -------------------------------------------------------------
  // LAYOUT 0: SOURCE (Fibonacci Sphere radius 2.2 + simplex noise)
  // -------------------------------------------------------------
  for (let i = 0; i < count; i++) {
    // Random per-instance seed & hot bit assignment (~8%)
    seeds[i] = Math.random();
    hotFlags[i] = Math.random() < 0.08 ? 1.0 : 0.0;
    // Scale 0.045 to 0.08
    scales[i] = 0.045 + Math.random() * 0.035;

    // Fibonacci sphere distribution
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = 2 * Math.PI * i / goldenRatio;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    // Displaced sphere with high-frequency bump
    const disp = Math.sin(x * 3.5 + y * 2.5) * Math.cos(z * 3.5) * 0.25;
    const r = 2.2 + disp;

    pos0[i * 3 + 0] = x * r;
    pos0[i * 3 + 1] = y * r;
    pos0[i * 3 + 2] = z * r;
  }

  // -------------------------------------------------------------
  // LAYOUT 1: BUILD (4 Towers along X on reflective floor Y=0)
  // Tower 0: Onbuggy shop ring (X = -4.5)
  // Tower 1: TaskFlow kanban columns (X = -1.5)
  // Tower 2: Khatabook ledger page fan (X = 1.5)
  // Tower 3: Zoom 3x3 screen grid (X = 4.5)
  // -------------------------------------------------------------
  const perTower = Math.floor(count / 4);
  for (let i = 0; i < count; i++) {
    const towerIdx = Math.min(3, Math.floor(i / perTower));
    const localIdx = i % perTower;
    const norm = localIdx / perTower;

    let x = 0, y = 0, z = 0;

    if (towerIdx === 0) {
      // Onbuggy: Shop circular ring tower
      const angle = norm * Math.PI * 16; // multiple ring wraps
      const ringRadius = 1.0 + Math.sin(norm * 20) * 0.2;
      x = -4.5 + Math.cos(angle) * ringRadius;
      y = norm * 5.5 - 2.5;
      z = Math.sin(angle) * ringRadius;
    } else if (towerIdx === 1) {
      // TaskFlow: 3 kanban columns
      const col = localIdx % 3;
      const colHeight = Math.floor(localIdx / 3) / (perTower / 3);
      x = -1.5 + (col - 1) * 0.6 + (Math.random() - 0.5) * 0.15;
      y = colHeight * 5.5 - 2.5;
      z = (Math.random() - 0.5) * 0.6;
    } else if (towerIdx === 2) {
      // Khatabook: Ledger page fan
      const fanAngle = (norm - 0.5) * 1.2;
      const fanRad = 1.2 * (0.3 + (localIdx % 10) * 0.08);
      x = 1.5 + Math.sin(fanAngle) * fanRad;
      y = norm * 5.5 - 2.5;
      z = Math.cos(fanAngle) * fanRad * 0.6;
    } else {
      // Zoom: 3x3 screen grid array
      const cell = localIdx % 9;
      const row = Math.floor(cell / 3);
      const col = cell % 3;
      const depth = Math.floor(localIdx / 9) / (perTower / 9);
      x = 4.5 + (col - 1) * 0.55 + (Math.random() - 0.5) * 0.1;
      y = (row - 1) * 0.8 + depth * 3.5 - 1.5;
      z = (Math.random() - 0.5) * 0.4;
    }

    pos1[i * 3 + 0] = x;
    pos1[i * 3 + 1] = y;
    pos1[i * 3 + 2] = z;
  }

  // -------------------------------------------------------------
  // LAYOUT 2: NETWORK (Skills clusters on Fibonacci sphere R=4.0)
  // -------------------------------------------------------------
  const clusterCenters = [
    new THREE.Vector3(-2.8, 1.8, 0.5),   // Frontend
    new THREE.Vector3(2.5, 1.6, -0.6),   // Backend & DB
    new THREE.Vector3(-1.8, -1.8, 1.2),  // Languages
    new THREE.Vector3(2.4, -1.5, 0.8),   // Emerging AI
    new THREE.Vector3(0, 2.6, -1.2),     // Tools
  ];

  for (let i = 0; i < count; i++) {
    // 70% in skill cluster clouds, 30% along interconnecting arcs
    const inCluster = i < count * 0.72;
    if (inCluster) {
      const clusterIdx = i % clusterCenters.length;
      const center = clusterCenters[clusterIdx];
      // Gaussian-ish ball
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const rad = Math.pow(Math.random(), 0.6) * 1.1;

      pos2[i * 3 + 0] = center.x + rad * Math.sin(phi) * Math.cos(theta);
      pos2[i * 3 + 1] = center.y + rad * Math.sin(phi) * Math.sin(theta);
      pos2[i * 3 + 2] = center.z + rad * Math.cos(phi);
    } else {
      // Along line segments between cluster pairs
      const pA = clusterCenters[i % clusterCenters.length];
      const pB = clusterCenters[(i + 1) % clusterCenters.length];
      const t = (i % 100) / 100;
      const jitter = (Math.random() - 0.5) * 0.2;
      pos2[i * 3 + 0] = THREE.MathUtils.lerp(pA.x, pB.x, t) + jitter;
      pos2[i * 3 + 1] = THREE.MathUtils.lerp(pA.y, pB.y, t) + jitter;
      pos2[i * 3 + 2] = THREE.MathUtils.lerp(pA.z, pB.z, t) + jitter;
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
    const y = progress * 14.0 - 7.0; // from -7 to +7

    // Also inject 4 milestone torus rings at y = -4, -1.5, 1.5, 4.5
    const isRing = (i % 30 < 4);
    if (isRing) {
      const ringHeights = [-4.2, -1.4, 1.6, 4.4];
      const targetH = ringHeights[i % ringHeights.length];
      const ringAngle = (i % 60) * (Math.PI * 2 / 60);
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
  // LAYOUT 4: DEPLOY (Thin beacon column 0.4x6 + ripple disc floor)
  // -------------------------------------------------------------
  for (let i = 0; i < count; i++) {
    const isColumn = i < count * 0.55;
    if (isColumn) {
      // Beacon cylinder
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.5) * 0.45;
      const y = (i / (count * 0.55)) * 6.5 - 3.0;

      pos4[i * 3 + 0] = Math.cos(angle) * radius;
      pos4[i * 3 + 1] = y;
      pos4[i * 3 + 2] = Math.sin(angle) * radius;
    } else {
      // Expanding concentric ripple rings on the floor Y = -2.8
      const ringIdx = (i % 6) + 1; // 6 rings
      const ringRadius = ringIdx * 0.85 + (Math.random() - 0.5) * 0.12;
      const angle = Math.random() * Math.PI * 2;

      pos4[i * 3 + 0] = Math.cos(angle) * ringRadius;
      pos4[i * 3 + 1] = -2.8 + (Math.random() - 0.5) * 0.08;
      pos4[i * 3 + 2] = Math.sin(angle) * ringRadius;
    }
  }

  return { pos0, pos1, pos2, pos3, pos4, seeds, hotFlags, scales };
}
