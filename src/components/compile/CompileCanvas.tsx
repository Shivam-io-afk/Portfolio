import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { CompileBitsMesh } from './CompileBitsMesh';
import { HeroCoreStage0 } from './HeroCoreStage0';
import { ConstellationNetwork } from './ConstellationNetwork';
import { AtmosphereElements } from './AtmosphereElements';
import { HolographicTowerLabel } from './HolographicTowerLabel';
import { ProceduralEnvironment } from './ProceduralEnvironment';
import { AdaptiveFramePacer } from './AdaptiveFramePacer';
import { TIER_CONFIGS } from '../../config/gpuTiers';
import { useCompileStore } from '../../store/useCompileStore';

/**
 * Pre-warm Shaders: Compiles all shaders upfront to eliminate mid-scroll jank
 */
const PrewarmShaders: React.FC = () => {
  const { gl, scene, camera, invalidate } = useThree();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        scene.updateMatrixWorld(true);
        gl.compile(scene, camera);
        if ((gl as any).compileAsync) {
          (gl as any).compileAsync(scene, camera).catch(() => {});
        }
        invalidate();
      } catch (e) {
        // Prewarm fallback
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [gl, scene, camera, invalidate]);

  return null;
};

/**
 * Camera & Stage Morph Controller (ZERO React re-renders)
 * Reads scrollProgress & cursorPos directly via getState() in useFrame
 */
const CameraRig: React.FC = () => {
  const targetPos = useRef(new THREE.Vector3(0, 0, 7.6));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, delta) => {
    const { scrollProgress, activeTower, cursorPos } = useCompileStore.getState();

    // Mouse parallax offset
    const mx = (cursorPos.x / (window.innerWidth || 1440) - 0.5) * 0.6;
    const my = -(cursorPos.y / (window.innerHeight || 900) - 0.5) * 0.45;

    const p = scrollProgress;
    let cx = mx;
    let cy = my;
    let cz = 7.6;
    let lx = 0;
    let ly = 0;

    if (p < 0.04) {
      // Stage 0: Hero Fibonacci Sphere (Centered at X=0.95, Y=0.35)
      cx += 0;
      cy += 0;
      cz = 7.6;
      lx = 0.5;
      ly = 0.2;
    } else if (p < 0.08) {
      // Transition Stage 0 -> Stage 1
      const t = (p - 0.04) / 0.04;
      cx += THREE.MathUtils.lerp(0, 0, t);
      cy += THREE.MathUtils.lerp(0, 0.4, t);
      cz = THREE.MathUtils.lerp(7.6, 8.2, t);
      lx = THREE.MathUtils.lerp(0.5, 2.0, t);
      ly = 0.2;
    } else if (p < 0.39) {
      // Stage 1: BUILD Towers (Camera frames the active tower beside its card)
      // Card 0 (Onbuggy, Left) -> Tower on Right (+3.2) -> Look right (lx = +2.2)
      // Card 1 (TaskFlow, Right) -> Tower on Left (-3.2) -> Look left (lx = -2.2)
      // Card 2 (Khatabook, Left) -> Tower on Right (+3.2) -> Look right (lx = +2.2)
      // Card 3 (Zoom, Right) -> Tower on Left (-3.2) -> Look left (lx = -2.2)
      // Card 4 (ShelterMap, Left) -> Tower on Right (+3.2) -> Look right (lx = +2.2)
      const towerLookTargets = [2.2, -2.2, 2.2, -2.2, 2.2];
      const targetLook = towerLookTargets[activeTower] ?? 2.2;

      cx += 0;
      cy += 0.4;
      cz = 8.2;
      lx = targetLook;
      ly = 0.2;
    } else if (p < 0.42) {
      // Transition Stage 1 -> Stage 2
      const t = (p - 0.39) / 0.03;
      cx += 0;
      cy += THREE.MathUtils.lerp(0.4, 0.2, t);
      cz = THREE.MathUtils.lerp(8.2, 9.4, t);
      lx = THREE.MathUtils.lerp(2.2, 0, t);
      ly = 0;
    } else if (p < 0.51) {
      // Stage 2: NETWORK Skills graph (centered, wide view)
      cx += 0;
      cy += 0.2;
      cz = 9.4;
      lx = 0;
      ly = 0;
    } else if (p < 0.53) {
      // Transition Stage 2 -> Stage 3
      const t = (p - 0.51) / 0.02;
      cx += 0;
      cy += THREE.MathUtils.lerp(0.2, 0.4, t);
      cz = THREE.MathUtils.lerp(9.4, 8.8, t);
      lx = 0;
      ly = THREE.MathUtils.lerp(0, 0.2, t);
    } else if (p < 0.93) {
      // Stage 3: RUNTIME Timeline Helix (Double Helix along +Y)
      cx += 0;
      cy += 0.4;
      cz = 8.8;
      lx = 0;
      ly = 0.2;
    } else if (p < 0.96) {
      // Transition Stage 3 -> Stage 4
      const t = (p - 0.93) / 0.03;
      cx += 0;
      cy += THREE.MathUtils.lerp(0.4, 0.6, t);
      cz = THREE.MathUtils.lerp(8.8, 8.2, t);
      lx = THREE.MathUtils.lerp(0, 1.8, t);
      ly = THREE.MathUtils.lerp(0.2, -0.6, t);
    } else {
      // Stage 4: DEPLOY Beacon at X = +3.6 (Look towards the right, keeping form clear)
      cx += 0;
      cy += 0.6;
      cz = 8.2;
      lx = 1.8;
      ly = -0.6;
    }

    // 1.2s camera flight into active project tower when deep-dive is open
    if (useCompileStore.getState().isDeepDiveOpen) {
      const towerX = activeTower % 2 === 1 ? -3.2 : 3.2;
      cx = towerX;
      cy = 0.4;
      cz = 3.6;
      lx = towerX;
      ly = 0.4;
    }

    targetPos.current.set(cx, cy, cz);
    targetLookAt.current.set(lx + mx * 0.25, ly + my * 0.25, 0);

    // Frame-rate independent damp with real delta
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3.8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3.8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3.8, delta);

    camera.lookAt(targetLookAt.current);
  });

  return null;
};

/**
 * Performance & Draw Call Monitor inside canvas (Updates DOM element directly without React renders)
 */
const RenderMonitor: React.FC = () => {
  const { gl } = useThree();

  useFrame(() => {
    const elCalls = document.getElementById('perf-hud-drawcalls');
    if (elCalls) {
      const calls = gl.info.render.calls;
      if (elCalls.textContent !== String(calls)) {
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
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
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

        {/* Ambient base lighting (balanced for specular chrome without blown-out white) */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[6, 10, 6]} intensity={0.65} color="#d8dde6" />
        <directionalLight position={[-6, -4, -4]} intensity={0.3} color="#ff5b1f" />

        {/* Floating atmospheric dust & floor */}
        <AtmosphereElements
          dustCount={config.dustCount}
          reflectiveFloor={config.reflectiveFloor}
        />

        {/* Stage 0 Core + Orbit Rings */}
        <HeroCoreStage0 />

        {/* Stage 2 Arsenal 17-Repo Constellation Network & Galaxy Titles */}
        <ConstellationNetwork />

        {/* Stage 1 Holographic Tower Label floating above active project */}
        <HolographicTowerLabel />

        {/* The Bits Instanced Mesh (12,000 bits morphing across all 5 layouts) */}
        <CompileBitsMesh tier={qualityTier} />

        {/* Postprocessing Stack: Tuned per GPU Tier */}
        {config.bloomEnabled && (
          <EffectComposer multisampling={0} resolutionScale={config.bloomResolutionScale}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.78}
              luminanceSmoothing={0.35}
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

        {/* Pre-warm all scene shaders and postprocessing passes upfront */}
        <PrewarmShaders />
      </Canvas>
    </div>
  );
};
