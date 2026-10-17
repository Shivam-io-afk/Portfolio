import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const AtmosphereElements: React.FC = () => {
  const dustRef = useRef<THREE.Points>(null);

  // 1500 drifting dust points in volume [-12, 12]
  const { positions, velocities } = useMemo(() => {
    const count = 1500;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      vel[i * 3 + 0] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005 + 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }

    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (dustRef.current) {
      const geo = dustRef.current.geometry;
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < 1500; i++) {
        array[i * 3 + 0] += velocities[i * 3 + 0];
        array[i * 3 + 1] += velocities[i * 3 + 1];
        array[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around bounds
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
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#d8dde6"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Floor Grid fading into darkness at Y = -3.5 */}
      <gridHelper
        args={[40, 40, '#ff5b1f', '#d8dde6']}
        position={[0, -3.5, 0]}
      >
        <lineBasicMaterial
          attach="material"
          color="#d8dde6"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </gridHelper>
    </group>
  );
};
