import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei';
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
import { useCompileStore } from '../../store/useCompileStore';
import { TIER_CONFIGS } from '../../config/gpuTiers';

/**
 * Camera controller reacting to scroll progress & active tower positioning
 * Uses MathUtils.damp for silky smooth inertia
 */
const CameraRig: React.FC = () => {
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const activeTower = useCompileStore((state) => state.activeTower);
  const cursorPos = useCompileStore((state) => state.cursorPos);

  const targetPos = useRef(new THREE.Vector3(0, 0, 7.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, delta) => {
    // Normal mouse offset
    const mx = (cursorPos.x / window.innerWidth - 0.5) * 1.0;
    const my = -(cursorPos.y / window.innerHeight - 0.5) * 0.8;

    const p = scrollProgress;
    let cx = mx;
    let cy = my;
    let cz = 7.5;
    let lx = 0;
    let ly = 0;

    if (p < 0.15) {
      // Stage 0: Hero Fibonacci Sphere centered
      const t = p / 0.15;
      cx += THREE.MathUtils.lerp(0, 0, t);
      cy += THREE.MathUtils.lerp(0, 0.4, t);
      cz = THREE.MathUtils.lerp(7.5, 8.5, t);
    } else if (p < 0.38) {
      // Stage 1: BUILD Towers
      // Tower 0: Onbuggy (x=-5.0) -> Camera shifts right (cx=2.8), looking at tower (-4.5)
      // Tower 1: TaskFlow (x=-1.8) -> Camera shifts right (cx=2.0), looking at tower (-1.8)
      // Tower 2: Khatabook (x=1.8) -> Camera shifts left (cx=-2.0), looking at tower (1.8)
      // Tower 3: Zoom (x=5.0) -> Camera shifts left (cx=-2.8), looking at tower (4.5)
      const towerCamX = [2.6, 2.0, -2.0, -2.6];
      const towerLookX = [-4.5, -1.8, 1.8, 4.5];

      const activeX = towerCamX[activeTower] || 0;
      const targetLook = towerLookX[activeTower] || 0;

      cx += activeX;
      cy += 0.8;
      cz = 9.2;
      lx = targetLook;
      ly = 0.2;
    } else if (p < 0.62) {
      // Stage 2: NETWORK Skills graph (centered, wide view)
      const t = (p - 0.38) / 0.24;
      cx += THREE.MathUtils.lerp(0, 0.3, t);
      cy += THREE.MathUtils.lerp(0.8, 0.3, t);
      cz = THREE.MathUtils.lerp(9.2, 8.8, t);
      lx = 0;
      ly = 0;
    } else if (p < 0.85) {
      // Stage 3: RUNTIME Timeline Helix
      const t = (p - 0.62) / 0.23;
      cx += THREE.MathUtils.lerp(0.3, -0.4, t);
      cy += THREE.MathUtils.lerp(0.3, 0.8, t);
      cz = THREE.MathUtils.lerp(8.8, 8.2, t);
      lx = 0;
      ly = 0.3;
    } else {
      // Stage 4: DEPLOY Beacon + contact
      const t = (p - 0.85) / 0.15;
      cx += THREE.MathUtils.lerp(-0.4, 0, t);
      cy += THREE.MathUtils.lerp(0.8, 1.0, t);
      cz = THREE.MathUtils.lerp(8.2, 7.2, t);
      lx = 0;
      ly = -0.4;
    }

    targetPos.current.set(cx, cy, cz);
    targetLookAt.current.set(lx + mx * 0.4, ly + my * 0.4, 0);

    // Damped interpolation without jumps
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3.5, delta);

    camera.lookAt(targetLookAt.current);
  });

  return null;
};

/**
 * Performance & Draw Call Monitor inside canvas
 */
const RenderMonitor: React.FC = () => {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 500) {
      const calculatedFps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      const elFps = document.getElementById('perf-hud-fps');
      if (elFps) {
        elFps.textContent = `${calculatedFps} FPS`;
        elFps.className = `font-bold ${
          calculatedFps >= 50 ? 'text-[#4ade80]' : calculatedFps >= 30 ? 'text-amber-400' : 'text-red-500'
        }`;
      }
      const elCalls = document.getElementById('perf-hud-drawcalls');
      if (elCalls) {
        elCalls.textContent = String(gl.info.render.calls);
      }
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
};

export const CompileCanvas: React.FC = () => {
  const qualityTier = useCompileStore((state) => state.qualityTier);
  const degradeQualityTier = useCompileStore((state) => state.degradeQualityTier);
  const config = TIER_CONFIGS[qualityTier];

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        gl={{
          antialias: qualityTier === 'HIGH',
          powerPreference: 'high-performance',
          alpha: false,
          depth: true,
          stencil: false,
        }}
        dpr={config.dpr}
      >
        <color attach="background" args={['#07070a']} />
        <fog attach="fog" args={['#07070a', 7, 24]} />

        {/* drei PerformanceMonitor: Drops tier automatically if FPS drops below 50 */}
        <PerformanceMonitor
          factor={1}
          onChange={({ factor }) => {
            if (factor < 0.6) {
              degradeQualityTier();
            }
          }}
        />

        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={50} />
        <CameraRig />
        <RenderMonitor />

        {/* Environment Preset for Physical/Standard Reflection Maps */}
        <Environment preset="night" />

        {/* Ambient base lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 10, 4]} intensity={1.1} color="#d8dde6" />
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

        {/* The Bits Instanced Mesh (Configured per tier) */}
        <CompileBitsMesh tier={qualityTier} />

        {/* Postprocessing Stack: Tuned per GPU Tier */}
        {config.bloomEnabled && (
          <EffectComposer multisampling={0} resolutionScale={config.bloomResolutionScale}>
            <Bloom
              intensity={qualityTier === 'HIGH' ? 1.05 : 0.85}
              luminanceThreshold={0.28}
              luminanceSmoothing={0.8}
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
