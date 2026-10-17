import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCompileStore } from '../../store/useCompileStore';

export const HeroCoreStage0: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.LineLoop>(null);
  const ring2Ref = useRef<THREE.LineLoop>(null);
  const ring3Ref = useRef<THREE.LineLoop>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Generate 3 circular ring geometries once
  const ringGeo1 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * 2.3, Math.sin(theta) * 2.3, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const ringGeo2 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * 2.7, 0, Math.sin(theta) * 2.7));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const ringGeo3 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 90;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(0, Math.cos(theta) * 3.1, Math.sin(theta) * 3.1));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Frame tick without React state re-renders
  useFrame((_, delta) => {
    const scrollProgress = useCompileStore.getState().scrollProgress;

    if (groupRef.current) {
      // Fade out and scale down as user scrolls beyond Stage 0
      const fade = Math.max(0, 1.0 - scrollProgress * 14.0);
      groupRef.current.scale.setScalar(fade);
      groupRef.current.visible = fade > 0.01;
    }

    if (coreRef.current) {
      const time = performance.now() * 0.001;
      const pulse = 0.95 + Math.sin(time * 2.5) * 0.05;
      coreRef.current.scale.setScalar(pulse);
    }

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.35;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 0.28;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.22;
  });

  return (
    <group ref={groupRef} position={[0.95, 0.35, 0]}>
      {/* 1. Glowing warm orange core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ff5b1f" wireframe={false} />
      </mesh>

      {/* Balanced Point Light from Core */}
      <pointLight color="#ff5b1f" intensity={7} distance={9} decay={2} />

      {/* Inner Wireframe Shell */}
      <mesh>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshBasicMaterial color="#ff5b1f" wireframe transparent opacity={0.3} />
      </mesh>

      {/* 2. 3 Thin Orbit Rings */}
      <primitive
        ref={ring1Ref}
        object={new THREE.LineLoop(ringGeo1, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.2 }))}
      />
      <primitive
        ref={ring2Ref}
        object={new THREE.LineLoop(ringGeo2, new THREE.LineBasicMaterial({ color: '#ff5b1f', transparent: true, opacity: 0.3 }))}
      />
      <primitive
        ref={ring3Ref}
        object={new THREE.LineLoop(ringGeo3, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.15 }))}
      />
    </group>
  );
};
