import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useCompileStore } from '../../store/useCompileStore';

// Custom Fresnel Glow Shader for volumetric core
const CoreFresnelShader = {
  uniforms: {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color('#ff5b1f') },
    uRimColor: { value: new THREE.Color('#ffffff') },
    uRimPower: { value: 2.2 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uRimColor;
    uniform float uRimPower;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), uRimPower);
      float pulse = 0.85 + 0.15 * sin(uTime * 3.5);
      vec3 finalColor = mix(uBaseColor * pulse * 1.6, uRimColor, fresnel * 0.9);
      gl_FragColor = vec4(finalColor, 0.95);
    }
  `,
};

export const HeroCoreStage0: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null);
  const fresnelMatRef = useRef<THREE.ShaderMaterial>(null);
  const ring1Ref = useRef<THREE.LineLoop>(null);
  const ring2Ref = useRef<THREE.LineLoop>(null);
  const ring3Ref = useRef<THREE.LineLoop>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Procedural additive halo sprite texture (zero images, zero network requests)
  const haloTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 91, 31, 0.9)');
    grad.addColorStop(0.25, 'rgba(255, 125, 65, 0.5)');
    grad.addColorStop(0.65, 'rgba(255, 91, 31, 0.15)');
    grad.addColorStop(1, 'rgba(255, 91, 31, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  }, []);

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

    if (fresnelMatRef.current) {
      fresnelMatRef.current.uniforms.uTime.value += delta;
    }

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.35;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 0.28;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.22;
  });

  return (
    <group ref={groupRef} position={[1.50, 0.35, 0]}>
      {/* 1. Glowing warm orange core sphere with Fresnel Shader */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.52, 32, 32]} />
        <shaderMaterial
          ref={fresnelMatRef}
          args={[CoreFresnelShader]}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Soft Additive Sprite Halo */}
      {haloTexture && (
        <sprite scale={[3.8, 3.8, 1]}>
          <spriteMaterial
            map={haloTexture}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            opacity={0.7}
          />
        </sprite>
      )}

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
