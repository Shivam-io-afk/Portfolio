import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { CompileBitsMesh } from './CompileBitsMesh';
import { HeroCoreStage0 } from './HeroCoreStage0';
import { AtmosphereElements } from './AtmosphereElements';
import { useCompileStore } from '../../store/useCompileStore';

/**
 * Camera controller reacting to scroll progress & mouse coordinates
 */
const CameraRig: React.FC = () => {
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const cursorPos = useCompileStore((state) => state.cursorPos);
  const targetPos = useRef(new THREE.Vector3(0, 0, 7.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }) => {
    // Normal mouse offset
    const mx = (cursorPos.x / window.innerWidth - 0.5) * 1.2;
    const my = -(cursorPos.y / window.innerHeight - 0.5) * 1.0;

    // Camera waypoint trajectory across stages 0 to 4:
    // Stage 0 (0.0): [0, 0, 7.5]
    // Stage 1 (0.25): [0, 2.0, 10.0] looking slightly down at towers
    // Stage 2 (0.50): [0, 0.5, 9.0]
    // Stage 3 (0.75): [0, scrollH, 8.5]
    // Stage 4 (1.0): [0, 1.2, 7.0]
    const p = scrollProgress;
    let cx = mx;
    let cy = my;
    let cz = 7.5;
    let ly = 0;

    if (p < 0.25) {
      const t = p / 0.25;
      cx += THREE.MathUtils.lerp(0, 0, t);
      cy += THREE.MathUtils.lerp(0, 1.2, t);
      cz = THREE.MathUtils.lerp(7.5, 9.5, t);
    } else if (p < 0.5) {
      const t = (p - 0.25) / 0.25;
      cx += THREE.MathUtils.lerp(0, 0.5, t);
      cy += THREE.MathUtils.lerp(1.2, 0.2, t);
      cz = THREE.MathUtils.lerp(9.5, 9.0, t);
    } else if (p < 0.75) {
      const t = (p - 0.5) / 0.25;
      cx += THREE.MathUtils.lerp(0.5, -0.4, t);
      cy += THREE.MathUtils.lerp(0.2, 0.8, t);
      cz = THREE.MathUtils.lerp(9.0, 8.8, t);
    } else {
      const t = (p - 0.75) / 0.25;
      cx += THREE.MathUtils.lerp(-0.4, 0, t);
      cy += THREE.MathUtils.lerp(0.8, 1.0, t);
      cz = THREE.MathUtils.lerp(8.8, 7.2, t);
      ly = THREE.MathUtils.lerp(0, -0.5, t);
    }

    targetPos.current.set(cx, cy, cz);
    camera.position.lerp(targetPos.current, 0.08);

    targetLookAt.current.set(mx * 0.5, ly + my * 0.5, 0);
    camera.lookAt(targetLookAt.current);
  });

  return null;
};

export const CompileCanvas: React.FC = () => {
  // Mobile / desktop bit counts
  const bitCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 4000 : 12000;

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#07070a']} />
        <fog attach="fog" args={['#07070a', 6, 22]} />

        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={50} />
        <CameraRig />

        {/* Drei Night Environment Preset for Physical Chrome Reflections */}
        <Environment preset="night" />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 10, 4]} intensity={1.2} color="#d8dde6" />
        <directionalLight position={[-6, -4, -4]} intensity={0.4} color="#ff5b1f" />

        {/* Floating atmospheric dust & floor grid */}
        <AtmosphereElements />

        {/* Stage 0 Core + Orbit Rings */}
        <HeroCoreStage0 />

        {/* The 12000 Bits Instanced Mesh */}
        <CompileBitsMesh count={bitCount} />

        {/* Postprocessing Stack: Bloom, Chromatic Aberration, Noise, Vignette */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.8}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={new THREE.Vector2(0.0006, 0.0006)}
            radialModulation={false}
            modulationOffset={0}
          />
          <Noise
            blendFunction={BlendFunction.OVERLAY}
            opacity={0.04}
          />
          <Vignette
            eskil={false}
            offset={0.15}
            darkness={0.55}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
