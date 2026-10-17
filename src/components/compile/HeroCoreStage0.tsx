import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCompileStore } from '../../store/useCompileStore';

export const HeroCoreStage0: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.LineLoop>(null);
  const ring2Ref = useRef<THREE.LineLoop>(null);
  const ring3Ref = useRef<THREE.LineLoop>(null);
  const groupRef = useRef<THREE.Group>(null);

  const scrollProgress = useCompileStore((state) => state.scrollProgress);

  // Generate 3 circular ring geometries
  const ringGeo1 = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * 2.8, Math.sin(theta) * 2.8, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const ringGeo2 = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * 3.3, 0, Math.sin(theta) * 3.3));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const ringGeo3 = React.useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(0, Math.cos(theta) * 3.7, Math.sin(theta) * 3.7));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Fade out and scale down as user scrolls beyond Stage 0 (0.0 -> 0.25)
      const fade = Math.max(0, 1.0 - scrollProgress * 4.5);
      groupRef.current.scale.setScalar(fade);
      groupRef.current.visible = fade > 0.01;
    }

    if (coreRef.current) {
      const time = performance.now() * 0.001;
      const pulse = 0.95 + Math.sin(time * 2.5) * 0.06;
      coreRef.current.scale.setScalar(pulse);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.25;
      ring1Ref.current.rotation.x += delta * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * -0.2;
      ring2Ref.current.rotation.z += delta * 0.08;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.18;
      ring3Ref.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Glowing orange core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#ff5b1f" wireframe={false} />
      </mesh>

      {/* Intense Point Light from Core */}
      <pointLight color="#ff5b1f" intensity={18} distance={12} decay={2} />

      {/* Inner Wireframe Shell */}
      <mesh>
        <sphereGeometry args={[0.95, 16, 16]} />
        <meshBasicMaterial color="#ff5b1f" wireframe transparent opacity={0.35} />
      </mesh>

      {/* 2. 3 Thin White Orbit Rings */}
      <primitive ref={ring1Ref} object={new THREE.LineLoop(ringGeo1, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25 }))} />
      <primitive ref={ring2Ref} object={new THREE.LineLoop(ringGeo2, new THREE.LineBasicMaterial({ color: '#ff5b1f', transparent: true, opacity: 0.35 }))} />
      <primitive ref={ring3Ref} object={new THREE.LineLoop(ringGeo3, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.18 }))} />
    </group>
  );
};

