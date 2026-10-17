import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SKILL_CLUSTER_CENTERS, SKILL_CLUSTER_EDGES } from './layoutGenerators';
import { useCompileStore } from '../../store/useCompileStore';

export const NetworkGraphEdges: React.FC = () => {
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
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
    // Opacity based on proximity to Stage 2 (scrollProgress 0.38 -> 0.62)
    // Peak at 0.50
    let opacity = 0;
    if (scrollProgress >= 0.28 && scrollProgress <= 0.72) {
      const dist = Math.abs(scrollProgress - 0.50);
      opacity = Math.max(0, 1.0 - dist / 0.18);
    }

    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = opacity * 0.45;
      lineRef.current.visible = opacity > 0.02;
    }

    if (pulsesRef.current && opacity > 0.02) {
      pulsesRef.current.visible = true;
      const mat = pulsesRef.current.material as THREE.PointsMaterial;
      mat.opacity = opacity * 0.85;

      const posAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < pulseCount; i++) {
        const p = pulseData[i];
        p.t = (p.t + delta * p.speed) % 1.0;

        const [iA, iB] = SKILL_CLUSTER_EDGES[p.edgeIdx];
        const pA = SKILL_CLUSTER_CENTERS[iA];
        const pB = SKILL_CLUSTER_CENTERS[iB];

        arr[i * 3 + 0] = THREE.MathUtils.lerp(pA.x, pB.x, p.t);
        arr[i * 3 + 1] = THREE.MathUtils.lerp(pA.y, pB.y, p.t);
        arr[i * 3 + 2] = THREE.MathUtils.lerp(pA.z, pB.z, p.t);
      }
      posAttr.needsUpdate = true;
    } else if (pulsesRef.current) {
      pulsesRef.current.visible = false;
    }
  });

  return (
    <group>
      {/* 1. Additive Line Segments */}
      <lineSegments ref={lineRef} geometry={lineGeo}>
        <lineBasicMaterial
          color="#ff5b1f"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 2. Traveling Pulse Points */}
      <points ref={pulsesRef} geometry={pulseGeo}>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
