import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
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
import { NetworkGraphEdges } from './NetworkGraphEdges';
import { ProceduralEnvironment } from './ProceduralEnvironment';
import { AdaptiveFramePacer } from './AdaptiveFramePacer';
import { useCompileStore } from '../../store/useCompileStore';
import { TIER_CONFIGS } from '../../config/gpuTiers';

/**
 * Camera controller reacting to scroll progress & active tower positioning
 * Uses MathUtils.damp with real delta time for identical smooth movement at 30 and 60fps
 */
const CameraRig: React.FC = () => {
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const activeTower = useCompileStore((state) => state.activeTower);
  const cursorPos = useCompileStore((state) => state.cursorPos);

  const targetPos = useRef(new THREE.Vector3(0, 0, 7.6));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, delta) => {
    // Normal mouse offset
    const mx = (cursorPos.x / window.innerWidth - 0.5) * 0.8;
    const my = -(cursorPos.y / window.innerHeight - 0.5) * 0.6;

    const p = scrollProgress;
    let cx = mx;
    let cy = my;
    let cz = 7.6;
    let lx = 0;
    let ly = 0;

    if (p < 0.14) {
      // Stage 0: Hero Fibonacci Sphere shifted to X=1.8 (framed clearly on right half)
      cx += 0;
      cy += 0;
      cz = 7.6;
      lx = 0;
      ly = 0;
    } else if (p < 0.22) {
      // Transition Stage 0 -> Stage 1
      const t = (p - 0.14) / 0.08;
      cx += THREE.MathUtils.lerp(0, 1.8, t);
      cy += THREE.MathUtils.lerp(0, 0.6, t);
      cz = THREE.MathUtils.lerp(7.6, 8.8, t);
      lx = THREE.MathUtils.lerp(0, -4.5, t);
      ly = 0.2;
    } else if (p < 0.38) {
      // Stage 1: BUILD Towers (Camera frames the active tower)
      const towerCamX = [1.8, 1.2, -1.2, -1.8];
      const towerLookX = [-4.5, -1.5, 1.5, 4.5];

      const activeX = towerCamX[activeTower] ?? 1.8;
      const targetLook = towerLookX[activeTower] ?? -4.5;

      cx += activeX;
      cy += 0.6;
      cz = 8.8;
      lx = targetLook;
      ly = 0.2;
    } else if (p < 0.46) {
      // Transition Stage 1 -> Stage 2
      const t = (p - 0.38) / 0.08;
      cx += THREE.MathUtils.lerp(0.5, 0, t);
      cy += THREE.MathUtils.lerp(0.6, 0.2, t);
      cz = THREE.MathUtils.lerp(8.8, 9.5, t);
      lx = THREE.MathUtils.lerp(0, 0, t);
      ly = 0;
    } else if (p < 0.62) {
      // Stage 2: NETWORK Skills graph (centered, wide view)
      cx += 0;
      cy += 0.2;
      cz = 9.5;
      lx = 0;
      ly = 0;
    } else if (p < 0.70) {
      // Transition Stage 2 -> Stage 3
      const t = (p - 0.62) / 0.08;
      cx += THREE.MathUtils.lerp(0, 0, t);
      cy += THREE.MathUtils.lerp(0.2, 0.4, t);
      cz = THREE.MathUtils.lerp(9.5, 8.8, t);
      lx = 0;
      ly = THREE.MathUtils.lerp(0, 0.2, t);
    } else if (p < 0.84) {
      // Stage 3: RUNTIME Timeline Helix (Double Helix along +Y)
      cx += 0;
      cy += 0.4;
      cz = 8.8;
      lx = 0;
      ly = 0.2;
    } else if (p < 0.92) {
      // Transition Stage 3 -> Stage 4
      const t = (p - 0.84) / 0.08;
      cx += 0;
      cy += THREE.MathUtils.lerp(0.4, 0.8, t);
      cz = THREE.MathUtils.lerp(8.8, 8.2, t);
      lx = 0;
      ly = THREE.MathUtils.lerp(0.2, -0.8, t);
    } else {
      // Stage 4: DEPLOY Beacon + expanding floor ring waves
      cx += 0;
      cy += 0.8;
      cz = 8.2;
      lx = 0;
      ly = -0.8;
    }

    targetPos.current.set(cx, cy, cz);
    targetLookAt.current.set(lx + mx * 0.3, ly + my * 0.3, 0);

    // Frame-rate independent damp with real delta
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3.8, delta);

    camera.lookAt(targetLookAt.current);
  });

  return null;
};

/**
 * Performance & Draw Call Monitor inside canvas
 */
const RenderMonitor: React.FC = () => {
  const { gl } = useThree();
  const setDrawCalls = useCompileStore((state) => state.setDrawCalls);
  const lastCalls = useRef(-1);

  useFrame(() => {
    const calls = gl.info.render.calls;
    if (calls !== lastCalls.current) {
      lastCalls.current = calls;
      setDrawCalls(calls);
      const elCalls = document.getElementById('perf-hud-drawcalls');
      if (elCalls) {
        elCalls.textContent = String(calls);
      }
    }
  });

  return null;
};

export const CompileCanvas: React.FC = () => {
  const qualityTier = useCompileStore((state) => state.qualityTier);
  const config = TIER_CONFIGS[qualityTier];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        frameloop="demand"
        gl={{
          antialias: qualityTier === 'HIGH',
          powerPreference: 'high-performance',
          alpha: false,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: true,
        }}
        dpr={config.dpr}
      >
        <color attach="background" args={['#07070a']} />
        <fog attach="fog" args={['#07070a', 7, 26]} />

        {/* Adaptive Frame Pacer: measures FPS for 2s, locks steady 30fps if <58, else 60fps */}
        <AdaptiveFramePacer />

        <PerspectiveCamera makeDefault position={[0, 0, 7.6]} fov={50} />
        <CameraRig />
        <RenderMonitor />

        {/* 100% Procedural Environment Map (0 network requests, 0 Suspense delay) */}
        <ProceduralEnvironment />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 10, 6]} intensity={0.8} color="#d8dde6" />
        <directionalLight position={[-6, -4, -4]} intensity={0.35} color="#ff5b1f" />

        {/* Floating atmospheric dust & floor */}
        <AtmosphereElements
          dustCount={config.dustCount}
          reflectiveFloor={config.reflectiveFloor}
        />

        {/* Stage 0 Core + Orbit Rings */}
        <HeroCoreStage0 />

        {/* Stage 2 Network Graph Lines + Light Pulses */}
        <NetworkGraphEdges />

        {/* The Bits Instanced Mesh (12,000 bits morphing across all 5 layouts) */}
        <CompileBitsMesh tier={qualityTier} />

        {/* Postprocessing Stack: Tuned per GPU Tier */}
        {config.bloomEnabled && (
          <EffectComposer multisampling={0} resolutionScale={config.bloomResolutionScale}>
            <Bloom
              intensity={0.7}
              luminanceThreshold={0.58}
              luminanceSmoothing={0.75}
              mipmapBlur={config.bloomMipmapBlur}
            />
            {config.chromaticAberration && (
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.0006, 0.0006)}
                radialModulation={false}
                modulationOffset={0}
              />
            )}
            {config.noiseEnabled && (
              <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.03} />
            )}
            {config.vignetteEnabled && (
              <Vignette eskil={false} offset={0.15} darkness={0.55} />
            )}
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
};
