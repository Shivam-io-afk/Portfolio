import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCompileStore } from '../../store/useCompileStore';

const TOWER_NAMES = [
  '01 // ONBUGGY',
  '02 // TASKFLOW',
  '03 // KHATABOOK',
  '04 // ZOOM MEET',
  '05 // SHELTERMAP',
];

export const HolographicTowerLabel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>(null);

  useFrame((_, delta) => {
    const { scrollProgress, activeTower } = useCompileStore.getState();

    if (!groupRef.current) return;

    // Only visible in Stage 1 (BUILD Towers: 0.08 -> 0.40)
    const inStage = scrollProgress >= 0.07 && scrollProgress <= 0.41;
    const fade = inStage ? 1.0 : 0.0;

    // Tower X coordinates:
    // 0, 2, 4 on Right (+3.2)
    // 1, 3 on Left (-3.2)
    const targetX = activeTower % 2 === 1 ? -3.2 : 3.2;
    const targetY = 2.4;
    const targetZ = 0.2;

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      5.0,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY,
      5.0,
      delta
    );
    groupRef.current.position.z = targetZ;

    if (textRef.current) {
      // Subtle holographic flicker
      const flicker = 0.85 + 0.15 * Math.sin(performance.now() * 0.015);
      textRef.current.fillOpacity = fade * flicker;
      textRef.current.text = TOWER_NAMES[activeTower] || '';
    }
  });

  return (
    <group ref={groupRef} position={[3.2, 2.4, 0]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={textRef}
          fontSize={0.24}
          color="#ff5b1f"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          01 // ONBUGGY
        </Text>
      </Billboard>
    </group>
  );
};
