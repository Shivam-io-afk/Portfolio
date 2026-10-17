import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface AtmosphereElementsProps {
  dustCount?: number;
  reflectiveFloor?: boolean;
}

export const AtmosphereElements: React.FC<AtmosphereElementsProps> = ({
  dustCount = 600,
  reflectiveFloor = false,
}) => {
  const dustRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    const vel = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.004 + 0.0015;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    return { positions: pos, velocities: vel };
  }, [dustCount]);

  useFrame(() => {
    if (dustRef.current) {
      const geo = dustRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < dustCount; i++) {
        array[i * 3 + 0] += velocities[i * 3 + 0];
        array[i * 3 + 1] += velocities[i * 3 + 1];
        array[i * 3 + 2] += velocities[i * 3 + 2];

        if (array[i * 3 + 1] > 10) array[i * 3 + 1] = -10;
        if (array[i * 3 + 1] < -10) array[i * 3 + 1] = 10;
        if (array[i * 3 + 0] > 12) array[i * 3 + 0] = -12;
        if (array[i * 3 + 0] < -12) array[i * 3 + 0] = 12;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Drifting Dust Particles */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#d8dde6"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Dark Floor Plane at Y = -3.5 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#07070a" />
      </mesh>

      {/* 3. Fake Soft Flipped Reflection Plane (cheap GPU fake reflection for MEDIUM) */}
      {!reflectiveFloor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.49, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshBasicMaterial
            color="#ff5b1f"
            transparent
            opacity={0.035}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 4. Floor Grid fading into darkness */}
      <gridHelper args={[40, 40, '#ff5b1f', '#d8dde6']} position={[0, -3.48, 0]}>
        <lineBasicMaterial
          attach="material"
          color="#d8dde6"
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </gridHelper>
    </group>
  );
};
