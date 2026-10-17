import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DandelionSeedHeadProps {
  scrollProgress: number; // 0 to 1
  mouse: { x: number; y: number };
}

export const DandelionSeedHead: React.FC<DandelionSeedHeadProps> = ({ scrollProgress, mouse }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const seedsRef = useRef<THREE.Points>(null);
  const stemsRef = useRef<THREE.LineSegments>(null);

  // Generate dandelion seed geometry
  const seedCount = 650;
  const stemCount = 180;

  const [initialSeeds, seedVelocities] = useMemo(() => {
    const pos = new Float32Array(seedCount * 3);
    const vels = new Float32Array(seedCount * 3);

    for (let i = 0; i < seedCount; i++) {
      // Fibonacci sphere distribution for natural floral seedhead
      const phi = Math.acos(1 - 2 * (i + 0.5) / seedCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

      const radius = 1.35 + (Math.random() - 0.5) * 0.35;
      const x = Math.sin(phi) * Math.cos(theta) * radius;
      const y = Math.cos(phi) * radius;
      const z = Math.sin(phi) * Math.sin(theta) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Expansion drift direction
      vels[i * 3] = (x / radius) * (1.2 + Math.random() * 2.2);
      vels[i * 3 + 1] = (y / radius) * (1.2 + Math.random() * 2.2) + (Math.random() * 0.5);
      vels[i * 3 + 2] = (z / radius) * (1.2 + Math.random() * 2.2);
    }
    return [pos, vels];
  }, [seedCount]);

  // Generate radial stem filaments from center out to seeds
  const stemPositions = useMemo(() => {
    const lines = new Float32Array(stemCount * 6);
    for (let i = 0; i < stemCount; i++) {
      const idx = Math.floor(Math.random() * seedCount);
      // Origin at center
      lines[i * 6] = 0;
      lines[i * 6 + 1] = 0;
      lines[i * 6 + 2] = 0;
      // Target at seed tip
      lines[i * 6 + 3] = initialSeeds[idx * 3] * 0.95;
      lines[i * 6 + 4] = initialSeeds[idx * 3 + 1] * 0.95;
      lines[i * 6 + 5] = initialSeeds[idx * 3 + 2] * 0.95;
    }
    return lines;
  }, [stemCount, initialSeeds]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Natural plant sway + mouse parallax
      const swayX = Math.sin(t * 0.8) * 0.08 + mouse.x * 0.35;
      const swayY = Math.cos(t * 0.6) * 0.05 + mouse.y * 0.25;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, swayX, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, swayY - scrollProgress * 0.4, 0.06);

      // Camera push / scale with scroll
      const targetScale = THREE.MathUtils.lerp(1.2, 1.85, scrollProgress);
      groupRef.current.scale.set(targetScale, targetScale, targetScale);
    }

    // Interactive Seed Dispersal on Scroll
    if (seedsRef.current) {
      const positions = seedsRef.current.geometry.attributes.position.array as Float32Array;
      const disperseFactor = Math.pow(scrollProgress, 1.6) * 3.5;

      for (let i = 0; i < seedCount; i++) {
        const vx = seedVelocities[i * 3];
        const vy = seedVelocities[i * 3 + 1];
        const vz = seedVelocities[i * 3 + 2];

        // Disperse outwards while floating in breeze
        positions[i * 3] = initialSeeds[i * 3] + vx * disperseFactor + Math.sin(t * 1.5 + i) * 0.04;
        positions[i * 3 + 1] = initialSeeds[i * 3 + 1] + vy * disperseFactor + Math.cos(t * 1.2 + i) * 0.04;
        positions[i * 3 + 2] = initialSeeds[i * 3 + 2] + vz * disperseFactor;
      }
      seedsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Golden core gyroscopic nested rings
    if (ringRef.current) {
      ringRef.current.children.forEach((child, idx) => {
        child.rotation.x += delta * (0.2 + idx * 0.1);
        child.rotation.y += delta * (0.25 - idx * 0.08);
      });
    }

    // Stems fade out as dandelion seeds take flight
    if (stemsRef.current) {
      const mat = stemsRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = Math.max(0.05, 0.45 - scrollProgress * 0.6);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Luminous Golden Core (Center Receptacle) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#ffe885" />
      </mesh>

      {/* 2. Gyroscopic Golden Orbit Rings (Stemline cryptographic node) */}
      <group ref={ringRef}>
        <mesh rotation={[0.4, 0.2, 0]}>
          <torusGeometry args={[0.55, 0.009, 16, 80]} />
          <meshBasicMaterial color="#ffdf65" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[-0.6, 0.8, 0.3]}>
          <torusGeometry args={[0.72, 0.008, 16, 80]} />
          <meshBasicMaterial color="#ffe895" transparent opacity={0.65} />
        </mesh>
        <mesh rotation={[1.1, -0.4, 0.9]}>
          <torusGeometry args={[0.9, 0.007, 16, 80]} />
          <meshBasicMaterial color="#ffd850" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* 3. Radial Golden/Ethereal Stem Filaments */}
      <lineSegments ref={stemsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stemPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#bfe8ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* 4. Bioluminescent Dandelion Seed Particles (Fluff / Pappus) */}
      <points ref={seedsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(initialSeeds), 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color="#dbeefc"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 5. Natural Green/Ethereal Main Stem */}
      <mesh position={[0, -2.2, 0]} rotation={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.022, 0.035, 4.2, 16]} />
        <meshBasicMaterial color="#44dd88" transparent opacity={0.65} />
      </mesh>
    </group>
  );
};

