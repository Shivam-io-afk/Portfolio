import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const EmberParticles: React.FC<{ count?: number }> = ({ count = 160 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, speeds, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const sz  = new Float32Array(count);

    const emberColor1 = new THREE.Color('#ff3b00');
    const emberColor2 = new THREE.Color('#ffaa22');
    const emberColor3 = new THREE.Color('#ff0044');

    for (let i = 0; i < count; i++) {
      // Swirling vortex distribution around molten core
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 3.2;
      
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // Color variation across fire gradient
      const choice = Math.random();
      const chosenColor = choice > 0.6 ? emberColor2 : (choice > 0.3 ? emberColor1 : emberColor3);
      col[i * 3]     = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      spd[i] = Math.random() * 0.45 + 0.25;
      sz[i]  = Math.random() * 0.08 + 0.03;
    }
    return [pos, col, spd, sz];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Upward convection + slight horizontal swirling
      posArray[i * 3 + 1] += speeds[i] * delta;
      
      const angle = Math.atan2(posArray[i * 3 + 2], posArray[i * 3]);
      const radius = Math.sqrt(posArray[i * 3] * posArray[i * 3] + posArray[i * 3 + 2] * posArray[i * 3 + 2]);
      const newAngle = angle + delta * 0.15;
      
      posArray[i * 3]     = Math.cos(newAngle) * radius;
      posArray[i * 3 + 2] = Math.sin(newAngle) * radius;

      // Recycle embers when drifting out of bounds
      if (posArray[i * 3 + 1] > 3.2) {
        posArray[i * 3 + 1] = -3.2;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors={true}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
