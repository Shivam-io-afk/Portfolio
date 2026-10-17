import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CustomShaderMaterial from 'three-custom-shader-material';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { QualityTier, TIER_CONFIGS } from '../../config/gpuTiers';
import { generateLayoutPositions } from './layoutGenerators';
import { useCompileStore } from '../../store/useCompileStore';

interface CompileBitsMeshProps {
  tier: QualityTier;
}

const vertexShader = `
  attribute vec3 aPos0;
  attribute vec3 aPos1;
  attribute vec3 aPos2;
  attribute vec3 aPos3;
  attribute vec3 aPos4;
  attribute float aSeed;
  attribute float aIsHot;
  attribute float aScale;
  attribute float aTowerIdx;

  uniform float uScrollProgress;
  uniform float uTime;
  uniform float uActiveTower;
  uniform float uHoveredSkill;

  varying float vIsHot;
  varying float vIsActiveTower;
  varying vec3 vWorldPos;

  vec3 morphBetween(vec3 pA, vec3 pB, float t, float seed) {
    float staggeredT = clamp((t - seed * 0.25) / 0.75, 0.0, 1.0);
    float ease = smoothstep(0.0, 1.0, staggeredT);
    vec3 mid = mix(pA, pB, ease);
    float burst = sin(ease * 3.14159) * (0.35 + seed * 0.4);
    vec3 dir = normalize(mid + vec3(sin(seed * 6.28), cos(seed * 6.28), sin(seed * 3.14)) * 0.5);
    return mid + dir * burst;
  }

  void main() {
    vIsHot = aIsHot;

    float p = clamp(uScrollProgress, 0.0, 1.0);

    // Exact stage boundaries aligned to DOM sections:
    // Stage 0 (Hero): 0.00 to 0.04
    // Stage 1 (Works): 0.08 to 0.39
    // Stage 2 (Skills): 0.42 to 0.51
    // Stage 3 (Roadmap): 0.53 to 0.93
    // Stage 4 (Contact): 0.96 to 1.00
    float s = 0.0;
    if (p < 0.04) {
      s = 0.0;
    } else if (p < 0.08) {
      s = smoothstep(0.04, 0.08, p);
    } else if (p < 0.39) {
      s = 1.0;
    } else if (p < 0.42) {
      s = 1.0 + smoothstep(0.39, 0.42, p);
    } else if (p < 0.51) {
      s = 2.0;
    } else if (p < 0.53) {
      s = 2.0 + smoothstep(0.51, 0.53, p);
    } else if (p < 0.93) {
      s = 3.0;
    } else if (p < 0.96) {
      s = 3.0 + smoothstep(0.93, 0.96, p);
    } else {
      s = 4.0;
    }

    int stageIdx = int(floor(s));
    if (stageIdx > 3) stageIdx = 3;
    float segProg = fract(s);
    if (s >= 4.0) {
      stageIdx = 3;
      segProg = 1.0;
    }

    vec3 blendedPos = aPos0;
    if (stageIdx == 0) {
      blendedPos = morphBetween(aPos0, aPos1, segProg, aSeed);
    } else if (stageIdx == 1) {
      blendedPos = morphBetween(aPos1, aPos2, segProg, aSeed);
    } else if (stageIdx == 2) {
      blendedPos = morphBetween(aPos2, aPos3, segProg, aSeed);
    } else {
      blendedPos = morphBetween(aPos3, aPos4, segProg, aSeed);
    }

    // Active tower glow in Stage 1
    if (stageIdx == 1 && segProg < 0.1 && abs(aTowerIdx - uActiveTower) < 0.5) {
      vIsActiveTower = 1.0;
    } else {
      vIsActiveTower = 0.0;
    }

    // Subtle micro-float
    blendedPos += vec3(
      sin(uTime * 0.6 + aSeed * 6.28) * 0.02,
      cos(uTime * 0.5 + aSeed * 4.14) * 0.02,
      sin(uTime * 0.7 + aSeed * 3.14) * 0.02
    );

    // Fast GPU Frustum & Back-Camera culling
    vec4 mvPos = modelViewMatrix * vec4(blendedPos, 1.0);
    float cull = (mvPos.z > -0.3 || mvPos.z < -35.0) ? 0.0 : 1.0;

    vec3 transformedPos = position * (aScale * cull) + blendedPos;
    csm_Position = transformedPos;
    vWorldPos = transformedPos;
  }
`;

const fragmentShader = `
  varying float vIsHot;
  varying float vIsActiveTower;
  varying vec3 vWorldPos;
  uniform float uTime;

  void main() {
    if (vIsHot > 0.5) {
      float pulse = 0.85 + 0.25 * sin(uTime * 3.0 + vWorldPos.x * 2.0);
      csm_Emissive = vec3(1.0, 0.357, 0.12) * 2.4 * pulse;
    } else if (vIsActiveTower > 0.5) {
      float glow = 0.55 + 0.35 * sin(uTime * 4.0 + vWorldPos.y * 2.0);
      csm_Emissive = vec3(1.0, 0.4, 0.15) * glow;
    }
  }
`;

export const CompileBitsMesh: React.FC<CompileBitsMeshProps> = ({ tier }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<any>(null);

  const config = TIER_CONFIGS[tier];
  const count = config.bitCount; // Full 12000 count on ALL tiers

  // Compute geometry & buffers based on Tier
  const { geometry, uniforms } = useMemo(() => {
    let baseGeo: THREE.BufferGeometry;
    if (config.boxSegments > 0) {
      baseGeo = new RoundedBoxGeometry(1, 1, 1, 1, 0.15);
    } else {
      baseGeo = new THREE.BoxGeometry(1, 1, 1);
    }

    const instGeo = new THREE.InstancedBufferGeometry().copy(baseGeo as any);
    const data = generateLayoutPositions(count);

    instGeo.setAttribute('aPos0', new THREE.InstancedBufferAttribute(data.pos0, 3));
    instGeo.setAttribute('aPos1', new THREE.InstancedBufferAttribute(data.pos1, 3));
    instGeo.setAttribute('aPos2', new THREE.InstancedBufferAttribute(data.pos2, 3));
    instGeo.setAttribute('aPos3', new THREE.InstancedBufferAttribute(data.pos3, 3));
    instGeo.setAttribute('aPos4', new THREE.InstancedBufferAttribute(data.pos4, 3));
    instGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(data.seeds, 1));
    instGeo.setAttribute('aIsHot', new THREE.InstancedBufferAttribute(data.hotFlags, 1));
    instGeo.setAttribute('aScale', new THREE.InstancedBufferAttribute(data.scales, 1));
    instGeo.setAttribute('aTowerIdx', new THREE.InstancedBufferAttribute(data.towerIdxs, 1));

    const uniforms = {
      uScrollProgress: { value: 0 },
      uTime: { value: 0 },
      uActiveTower: { value: 0 },
      uHoveredSkill: { value: 0 },
    };

    return { geometry: instGeo, uniforms };
  }, [count, config.boxSegments]);

  // Frame tick updates using MathUtils.damp - reads store directly with getState (ZERO React re-renders!)
  useFrame((_, delta) => {
    if (materialRef.current) {
      const { scrollProgress, activeTower } = useCompileStore.getState();

      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uScrollProgress.value,
        scrollProgress,
        4.0,
        delta
      );
      materialRef.current.uniforms.uActiveTower.value = activeTower;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.015;
    }
  });

  const BaseMaterial =
    config.materialType === 'physical'
      ? THREE.MeshPhysicalMaterial
      : config.materialType === 'standard'
      ? THREE.MeshStandardMaterial
      : THREE.MeshBasicMaterial;

  const CSMComponent = CustomShaderMaterial as any;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <CSMComponent
        ref={materialRef}
        baseMaterial={BaseMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        metalness={config.materialType === 'basic' ? undefined : 1.0}
        roughness={config.materialType === 'basic' ? undefined : 0.32}
        clearcoat={config.materialType === 'physical' ? 1.0 : undefined}
        clearcoatRoughness={config.materialType === 'physical' ? 0.1 : undefined}
        color={new THREE.Color('#d8dde6')}
      />
    </instancedMesh>
  );
};
