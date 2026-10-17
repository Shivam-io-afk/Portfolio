import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SKILL_CLUSTER_CENTERS, SKILL_CLUSTER_EDGES } from './layoutGenerators';
import { useCompileStore } from '../../store/useCompileStore';

export const NetworkGraphEdges: React.FC = () => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pulsesRef = useRef<THREE.Points>(null);

  // Generate static line segment points
  const lineGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const [iA, iB] of SKILL_CLUSTER_EDGES) {
      pts.push(SKILL_CLUSTER_CENTERS[iA]);
      pts.push(SKILL_CLUSTER_CENTERS[iB]);
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Traveling pulses along edges
  const pulseCount = 36;
  const { pulseGeo, pulseData } = useMemo(() => {
    const positions = new Float32Array(pulseCount * 3);
    const data: { edgeIdx: number; t: number; speed: number }[] = [];

    for (let i = 0; i < pulseCount; i++) {
      data.push({
        edgeIdx: i % SKILL_CLUSTER_EDGES.length,
        t: Math.random(),
        speed: 0.2 + Math.random() * 0.35,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { pulseGeo: geo, pulseData: data };
  }, []);

  useFrame((_, delta) => {
    const scrollProgress = useCompileStore.getState().scrollProgress;

    // Opacity based on proximity to Stage 2 (scrollProgress 0.38 -> 0.54)
    // Peak at 0.46
    let opacity = 0;
    if (scrollProgress >= 0.36 && scrollProgress <= 0.58) {
      const dist = Math.abs(scrollProgress - 0.46);
      opacity = Math.max(0, 1.0 - dist / 0.10);
    }

    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = opacity * 0.45;
    }

    if (pulsesRef.current) {
      const mat = pulsesRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * 0.85;

      if (opacity > 0.01) {
        const posAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;

        for (let i = 0; i < pulseCount; i++) {
          const item = pulseData[i];
          item.t += delta * item.speed;
          if (item.t > 1.0) item.t = 0;

          const edge = SKILL_CLUSTER_EDGES[item.edgeIdx];
          const pA = SKILL_CLUSTER_CENTERS[edge[0]];
          const pB = SKILL_CLUSTER_CENTERS[edge[1]];

          array[i * 3 + 0] = THREE.MathUtils.lerp(pA.x, pB.x, item.t);
          array[i * 3 + 1] = THREE.MathUtils.lerp(pA.y, pB.y, item.t);
          array[i * 3 + 2] = THREE.MathUtils.lerp(pA.z, pB.z, item.t);
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* 1. Subtle glowing interconnect lines between skills */}
      <lineSegments ref={lineRef} geometry={lineGeo}>
        <lineBasicMaterial
          color="#ff5b1f"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Traveling pulses */}
      <points ref={pulsesRef} geometry={pulseGeo}>
        <pointsMaterial
          color="#ffffff"
          size={0.12}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
