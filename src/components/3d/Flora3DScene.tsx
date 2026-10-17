import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Flora3DSceneProps {
  scrollProgress: number; // 0 to 1
  mouse: { x: number; y: number };
}

// Simple curl noise approximation
function computeCurlNoise(x: number, y: number, z: number, t: number) {
  const eps = 0.1;
  const n1 = Math.sin(y * 1.5 + t) * Math.cos(z * 1.2 + t);
  const n2 = Math.cos(x * 1.5 + t) * Math.sin(z * 1.2 + t);
  const n3 = Math.sin(x * 1.5 + t) * Math.cos(y * 1.2 + t);
  return [n1, n2, n3];
}

export const Flora3DScene: React.FC<Flora3DSceneProps> = ({ scrollProgress, mouse }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Sub-elements
  const dandelionSeedsRef = useRef<THREE.Points>(null);
  const dandelionStemsRef = useRef<THREE.LineSegments>(null);
  const goldCoreRef = useRef<THREE.Mesh>(null);
  const stemMeshRef = useRef<THREE.Mesh>(null);
  
  const orbitalRingsRef = useRef<THREE.Group>(null);
  const nebulaParticlesRef = useRef<THREE.Points>(null);
  const wireframeFlowerRef = useRef<THREE.Group>(null);
  const irisRingRef = useRef<THREE.Points>(null);

  // 1. Dandelion Geometry & Seeds
  const seedCount = 700;
  const stemLineCount = 180;

  const [initialSeeds, seedDrift] = useMemo(() => {
    const pos = new Float32Array(seedCount * 3);
    const drift = new Float32Array(seedCount * 3);

    for (let i = 0; i < seedCount; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / seedCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const radius = 1.35 + (Math.random() - 0.5) * 0.35;
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.cos(phi) * radius;
      const z = Math.sin(phi) * Math.sin(theta) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      drift[i * 3] = (x / radius) * (1.5 + Math.random() * 2.5);
      drift[i * 3 + 1] = (y / radius) * (1.5 + Math.random() * 2.5) + (Math.random() * 0.8);
      drift[i * 3 + 2] = (z / radius) * (1.5 + Math.random() * 2.5);
    }
    return [pos, drift];
  }, [seedCount]);

  const stemFilamentPositions = useMemo(() => {
    const lines = new Float32Array(stemLineCount * 6);
    for (let i = 0; i < stemLineCount; i++) {
      const idx = Math.floor(Math.random() * seedCount);
      lines[i * 6] = 0;
      lines[i * 6 + 1] = 0;
      lines[i * 6 + 2] = 0;
      lines[i * 6 + 3] = initialSeeds[idx * 3] * 0.95;
      lines[i * 6 + 4] = initialSeeds[idx * 3 + 1] * 0.95;
      lines[i * 6 + 5] = initialSeeds[idx * 3 + 2] * 0.95;
    }
    return lines;
  }, [stemLineCount, initialSeeds]);

  // 2. Nebula Particles (Scene 4)
  const nebulaCount = 450;
  const nebulaPositions = useMemo(() => {
    const pos = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 2.4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, [nebulaCount]);

  // 3. Iris Ring (Scene 6)
  const irisCount = 360;
  const [irisPositions, irisInitAngles] = useMemo(() => {
    const pos = new Float32Array(irisCount * 3);
    const angles = new Float32Array(irisCount);
    for (let i = 0; i < irisCount; i++) {
      const a = (i / irisCount) * Math.PI * 2;
      angles[i] = a;
      pos[i * 3] = Math.cos(a) * 2.2;
      pos[i * 3 + 1] = Math.sin(a) * 2.2;
      pos[i * 3 + 2] = 0;
    }
    return [pos, angles];
  }, [irisCount]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Natural plant sway + mouse parallax
    if (groupRef.current) {
      const swayX = Math.sin(t * 0.7) * 0.06 + mouse.x * 0.35;
      const swayY = Math.cos(t * 0.5) * 0.04 + mouse.y * 0.25;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, swayX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, swayY, 0.05);
    }

    // --- SCENE 2 & 3: DANDELION & SEED DRIFT WITH CURL NOISE ---
    if (dandelionSeedsRef.current) {
      const pos = dandelionSeedsRef.current.geometry.attributes.position.array as Float32Array;
      // Dispersal starts at scrollProgress > 0.15 (Hero -> Projects)
      const disperseFactor = Math.max(0, (scrollProgress - 0.12) / 0.35);

      for (let i = 0; i < seedCount; i++) {
        const [cx, cy, cz] = computeCurlNoise(initialSeeds[i * 3], initialSeeds[i * 3 + 1], initialSeeds[i * 3 + 2], t * 0.6);

        pos[i * 3] = initialSeeds[i * 3] + seedDrift[i * 3] * disperseFactor * 3.5 + cx * disperseFactor * 1.2;
        pos[i * 3 + 1] = initialSeeds[i * 3 + 1] + seedDrift[i * 3 + 1] * disperseFactor * 3.5 + cy * disperseFactor * 1.2;
        pos[i * 3 + 2] = initialSeeds[i * 3 + 2] + seedDrift[i * 3 + 2] * disperseFactor * 3.5 + cz * disperseFactor * 1.2;
      }
      dandelionSeedsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Dandelion filaments & stem visibility fade
    if (dandelionStemsRef.current && stemMeshRef.current) {
      const stemOpacity = Math.max(0, 0.45 - scrollProgress * 1.2);
      (dandelionStemsRef.current.material as THREE.LineBasicMaterial).opacity = stemOpacity;
      (stemMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.75 - scrollProgress * 1.5);
    }

    // --- SCENE 4: GOLD PARTICLE NEBULA WITH 5 TILTED ORBITAL DUST RINGS ---
    // Peaks around scrollProgress 0.45 -> 0.75 (Skills)
    const nebulaWeight = THREE.MathUtils.smoothstep(scrollProgress, 0.28, 0.55) * (1 - THREE.MathUtils.smoothstep(scrollProgress, 0.75, 0.95));

    if (orbitalRingsRef.current) {
      orbitalRingsRef.current.children.forEach((ringMesh, idx) => {
        ringMesh.rotation.x += delta * (0.15 + idx * 0.08);
        ringMesh.rotation.y += delta * (0.2 - idx * 0.05);
        ringMesh.scale.setScalar(THREE.MathUtils.lerp(0.001, 1, nebulaWeight));
        const mat = (ringMesh as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = nebulaWeight * (0.8 - idx * 0.1);
      });
    }

    if (nebulaParticlesRef.current) {
      nebulaParticlesRef.current.rotation.y += delta * 0.12;
      const mat = nebulaParticlesRef.current.material as THREE.PointsMaterial;
      mat.opacity = nebulaWeight * 0.85;
    }

    // --- SCENE 5: WIREFRAME LIGHT FLOWER OPENING ON STEM ---
    // Peaks around scrollProgress 0.6 -> 0.85 (Experience & Credentials)
    const flowerWeight = THREE.MathUtils.smoothstep(scrollProgress, 0.55, 0.75) * (1 - THREE.MathUtils.smoothstep(scrollProgress, 0.88, 1.0));

    if (wireframeFlowerRef.current) {
      wireframeFlowerRef.current.rotation.z += delta * 0.1;
      wireframeFlowerRef.current.scale.setScalar(THREE.MathUtils.lerp(0.001, 1.35, flowerWeight));
      wireframeFlowerRef.current.children.forEach((petal) => {
        const mat = (petal as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = flowerWeight * 0.55;
      });
    }

    // --- SCENE 6: BREATHING IRIS RING ---
    // Peaks around scrollProgress 0.8 -> 1.0 (Contact & Footer)
    const irisWeight = THREE.MathUtils.smoothstep(scrollProgress, 0.78, 0.95);

    if (irisRingRef.current) {
      const pos = irisRingRef.current.geometry.attributes.position.array as Float32Array;
      const breath = 1.8 + Math.sin(t * 2.2) * 0.22;

      for (let i = 0; i < irisCount; i++) {
        const a = irisInitAngles[i] + t * 0.15;
        pos[i * 3] = Math.cos(a) * breath;
        pos[i * 3 + 1] = Math.sin(a) * breath;
      }
      irisRingRef.current.geometry.attributes.position.needsUpdate = true;
      (irisRingRef.current.material as THREE.PointsMaterial).opacity = irisWeight * 0.9;
    }
  });

  return (
    <group ref={groupRef} position={[0.7, 0.1, 0]}>
      {/* SCENE 2: Luminous Gold Core */}
      <mesh ref={goldCoreRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#ffcf6a" />
      </mesh>

      {/* SCENE 2: Stem */}
      <mesh ref={stemMeshRef} position={[0, -2.5, 0]} rotation={[0, 0, 0.03]}>
        <cylinderGeometry args={[0.02, 0.035, 4.8, 16]} />
        <meshBasicMaterial color="#38ef7d" transparent opacity={0.7} />
      </mesh>

      {/* SCENE 2: Radial Stem Filaments */}
      <lineSegments ref={dandelionStemsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stemFilamentPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#d8eaff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* SCENE 2 & 3: Dandelion Seed Particles (Ice White with Curl Noise Dispersal) */}
      <points ref={dandelionSeedsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(initialSeeds), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#e8f0ff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* SCENE 4: 5 Tilted Orbital Dust Rings */}
      <group ref={orbitalRingsRef}>
        {[
          { radius: 0.85, tilt: [0.8, 0.3, 0] },
          { radius: 1.25, tilt: [-0.6, 0.7, 0.4] },
          { radius: 1.65, tilt: [1.2, -0.5, 0.9] },
          { radius: 2.15, tilt: [-0.9, -0.4, 0.2] },
          { radius: 2.65, tilt: [0.3, 1.1, -0.6] },
        ].map((ring, idx) => (
          <mesh key={idx} rotation={ring.tilt as [number, number, number]}>
            <torusGeometry args={[ring.radius, 0.012, 16, 90]} />
            <meshBasicMaterial color="#ffcf6a" transparent opacity={0} wireframe={true} />
          </mesh>
        ))}
      </group>

      {/* SCENE 4: Gold Particle Nebula */}
      <points ref={nebulaParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nebulaPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          color="#ffcf6a"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* SCENE 5: Wireframe Light Flower Opening on Stem */}
      <group ref={wireframeFlowerRef} scale={[0.001, 0.001, 0.001]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((petalIdx) => {
          const rotZ = (petalIdx / 8) * Math.PI * 2;
          return (
            <mesh key={petalIdx} rotation={[0.4, 0, rotZ]} position={[0, 0, 0]}>
              <ringGeometry args={[0.3, 1.4, 6]} />
              <meshBasicMaterial
                color="#b8f57a"
                transparent
                opacity={0}
                wireframe={true}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* SCENE 6: Breathing Iris Ring */}
      <points ref={irisRingRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[irisPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.075}
          color="#b8f57a"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
