import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import CustomShaderMaterial from 'three-custom-shader-material';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { QualityTier, TIER_CONFIGS } from '../../config/gpuTiers';
import { generateLayoutPositions } from './layoutGenerators';
import { generateTextBitPositions } from './textToBits';
import { getReposForSkill, CONSTELLATION_REPOS } from '../../data/repoConstellationData';
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
  attribute vec3 aPosText;
  attribute vec4 aParams; // x: seed, y: isHot, z: scale, w: towerIdx + repoIdx * 10

  uniform float uScrollProgress;
  uniform float uTime;
  uniform float uActiveTower;
  uniform float uHoveredSkill;
  uniform vec3 uMousePos;
  uniform float uShockwaveProgress;
  uniform float uScanBeamProgress;
  uniform float uTextMorph;
  uniform float uRepoHighlight[17];
  uniform float uVelocity;
  uniform float uMatrixMode;
  uniform float uIs404;
  uniform vec3 uAccentColor;

  varying float vIsHot;
  varying float vIsActiveTower;
  varying float vIsRepoHighlight;
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
    float aSeed = aParams.x;
    float aIsHot = aParams.y;
    float aScale = aParams.z;
    float aTowerIdx = mod(aParams.w, 10.0);
    float aRepoIdx = floor(aParams.w / 10.0);

    vIsHot = aIsHot;

    // Constellation repo highlight in Stage 2
    float repoHigh = 0.0;
    int rIdx = int(aRepoIdx);
    for (int j = 0; j < 17; j++) {
      if (j == rIdx) {
        repoHigh = uRepoHighlight[j];
        break;
      }
    }
    vIsRepoHighlight = repoHigh;

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

    // Interactive Core: cursor repels bits on Hero sphere
    if (p < 0.08) {
      float distToMouse = length(blendedPos.xy - uMousePos.xy);
      if (distToMouse < 1.7) {
        vec2 repelDir = normalize(blendedPos.xy - uMousePos.xy + vec2(0.0001, 0.0001));
        float force = (1.0 - distToMouse / 1.7) * 0.7;
        blendedPos.xy += repelDir * force;
      }
    }

    // Shockwave on click
    if (uShockwaveProgress > 0.001) {
      float waveRadius = uShockwaveProgress * 4.8;
      float waveDist = abs(length(blendedPos - vec3(0.95, 0.35, 0.0)) - waveRadius);
      if (waveDist < 0.7) {
        float push = (1.0 - waveDist / 0.7) * 0.5;
        blendedPos += normalize(blendedPos - vec3(0.95, 0.35, 0.0)) * push;
        vIsHot = 1.0;
      }
    }

    // Scan beam sweep flicker
    if (uScanBeamProgress > 0.001) {
      float scanY = (0.5 - uScanBeamProgress) * 7.0;
      float distToScan = abs(blendedPos.y - scanY);
      if (distToScan < 0.9) {
        vIsHot = 1.0;
      }
    }

    // Text to bits morphing (SHIVAM / THANKS)
    if (uTextMorph > 0.001) {
      float ease = smoothstep(0.0, 1.0, uTextMorph);
      blendedPos = mix(blendedPos, aPosText, ease);
    }

    // Highlighted constellation repo burst & scale
    float activeScale = aScale;
    if (repoHigh > 0.01) {
      activeScale *= (1.0 + repoHigh * 1.1);
      float burstWave = sin(uTime * 9.0 + aSeed * 6.28) * 0.14 * repoHigh;
      blendedPos += normalize(blendedPos + vec3(0.001)) * burstWave;
      vIsHot = 1.0;
    }

    // Subtle micro-float
    blendedPos += vec3(
      sin(uTime * 0.6 + aSeed * 6.28) * 0.02,
      cos(uTime * 0.5 + aSeed * 4.14) * 0.02,
      sin(uTime * 0.7 + aSeed * 3.14) * 0.02
    );

    // Matrix Rain easter egg: bits rain down vertically
    if (uMatrixMode > 0.001) {
      float rainSpeed = 5.0 + aSeed * 7.0;
      float rainY = mod(blendedPos.y - uTime * rainSpeed + 6.0, 12.0) - 6.0;
      blendedPos.y = mix(blendedPos.y, rainY, uMatrixMode);
      blendedPos.x += sin(blendedPos.z * 3.0 + aSeed * 10.0) * 0.15 * uMatrixMode;
    }

    // 404 Segfault Mode: bits collapse into a chaotic pile on the floor
    if (uIs404 > 0.001) {
      float floorY = -4.2 + sin(aSeed * 25.0) * 0.35;
      blendedPos.y = mix(blendedPos.y, floorY, uIs404);
      blendedPos.x = mix(blendedPos.x, blendedPos.x * 1.6 + sin(aSeed * 45.0) * 2.8, uIs404);
      blendedPos.z = mix(blendedPos.z, blendedPos.z * 1.6 + cos(aSeed * 45.0) * 2.8, uIs404);
    }

    // Velocity stretch: bits stretch along the scroll direction (up to 3x)
    float absVel = clamp(abs(uVelocity) * 0.05, 0.0, 2.0); // stretch factor up to 3x (1.0 + 2.0)
    vec3 bitShape = position;
    bitShape.y *= (1.0 + absVel);
    bitShape.xz *= (1.0 / sqrt(1.0 + absVel)); // volume preservation

    // Fast GPU Frustum & Back-Camera culling
    vec4 mvPos = modelViewMatrix * vec4(blendedPos, 1.0);
    float cull = (mvPos.z > -0.3 || mvPos.z < -35.0) ? 0.0 : 1.0;

    vec3 transformedPos = bitShape * (activeScale * cull) + blendedPos;
    csm_Position = transformedPos;
    vWorldPos = transformedPos;
  }
`;

const fragmentShader = `
  varying float vIsHot;
  varying float vIsActiveTower;
  varying float vIsRepoHighlight;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uScanBeamProgress;
  uniform float uMatrixMode;
  uniform float uIs404;
  uniform vec3 uAccentColor;

  void main() {
    if (uMatrixMode > 0.01) {
      // Matrix Easter Egg: phosphorescent neon green
      float matrixGlow = 1.0 + 0.5 * sin(uTime * 12.0 + vWorldPos.y * 4.0);
      csm_Emissive = vec3(0.13, 0.95, 0.35) * 3.8 * matrixGlow * uMatrixMode;
    } else if (uIs404 > 0.01) {
      // 404 Mode: segmentation fault glitch red
      csm_Emissive = vec3(1.0, 0.18, 0.18) * 2.6 * uIs404;
    } else if (vIsRepoHighlight > 0.01) {
      float burstGlow = 1.2 + 0.6 * sin(uTime * 8.0 + vWorldPos.x * 3.0);
      csm_Emissive = uAccentColor * 3.2 * burstGlow * vIsRepoHighlight;
    } else if (vIsHot > 0.5) {
      float pulse = 0.85 + 0.25 * sin(uTime * 3.0 + vWorldPos.x * 2.0);
      csm_Emissive = uAccentColor * 2.4 * pulse;
    } else if (vIsActiveTower > 0.5) {
      float glow = 0.55 + 0.35 * sin(uTime * 4.0 + vWorldPos.y * 2.0);
      csm_Emissive = uAccentColor * 2.0 * glow;
    }

    if (uScanBeamProgress > 0.001) {
      float scanY = (0.5 - uScanBeamProgress) * 7.0;
      float distToScan = abs(vWorldPos.y - scanY);
      if (distToScan < 0.9) {
        csm_Emissive += vec3(1.0, 0.9, 0.75) * (1.0 - distToScan / 0.9) * 2.5;
      }
    }
  }
`;

export const CompileBitsMesh: React.FC<CompileBitsMeshProps> = ({ tier }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<any>(null);
  const currentTextTargetRef = useRef<string>('NONE');

  const { raycaster, pointer, camera } = useThree();
  const mousePlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const mouseHitPoint = useMemo(() => new THREE.Vector3(100, 100, 0), []);

  const config = TIER_CONFIGS[tier];
  const count = config.bitCount; // Full 12000 count on ALL tiers

  // Precompute text layouts
  const { posTextShivam, posTextThanks } = useMemo(() => {
    const shivam = generateTextBitPositions('SHIVAM', count, { fontSize: 210, scale: 0.024 });
    const thanks = generateTextBitPositions('THANKS ✓', count, { fontSize: 180, scale: 0.020 });
    return { posTextShivam: shivam, posTextThanks: thanks };
  }, [count]);

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
    instGeo.setAttribute('aPosText', new THREE.InstancedBufferAttribute(new Float32Array(posTextShivam), 3));

    // Pack single-float attributes into a single vec4 attribute to respect WebGL 16-attrib limit
    const params = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      params[i * 4 + 0] = data.seeds[i];
      params[i * 4 + 1] = data.hotFlags[i];
      params[i * 4 + 2] = data.scales[i];
      params[i * 4 + 3] = data.towerIdxs[i] + (data.repoIdxs ? data.repoIdxs[i] * 10.0 : 0);
    }
    instGeo.setAttribute('aParams', new THREE.InstancedBufferAttribute(params, 4));

    const uniforms = {
      uScrollProgress: { value: 0 },
      uTime: { value: 0 },
      uActiveTower: { value: 0 },
      uHoveredSkill: { value: 0 },
      uMousePos: { value: new THREE.Vector3(100, 100, 0) },
      uShockwaveProgress: { value: 0 },
      uScanBeamProgress: { value: 0 },
      uTextMorph: { value: 0 },
      uRepoHighlight: { value: new Float32Array(17) },
      uVelocity: { value: 0 },
      uMatrixMode: { value: 0 },
      uIs404: { value: 0 },
      uAccentColor: { value: new THREE.Color('#ff5b1f') },
    };

    return { geometry: instGeo, uniforms };
  }, [count, config.boxSegments, posTextShivam]);

  // Frame tick updates using MathUtils.damp - reads store directly with getState (ZERO React re-renders!)
  useFrame((_, delta) => {
    // Project mouse onto 3D z=0 plane
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(mousePlane, mouseHitPoint);

    if (materialRef.current) {
      const {
        scrollProgress,
        scrollVelocity,
        activeTower,
        shockwaveProgress,
        scanBeamProgress,
        textSpellProgress,
        textSpellTarget,
        hoveredSkillNode,
        hoveredRepoId,
        matrixProgress,
        is404,
        localTimeTheme,
      } = useCompileStore.getState();

      // Constellation repo highlighting in Stage 2
      const highlightArr = materialRef.current.uniforms.uRepoHighlight.value as Float32Array;
      let activeIndices: number[] = [];
      if (hoveredSkillNode) {
        activeIndices = getReposForSkill(hoveredSkillNode);
      } else if (hoveredRepoId) {
        const repo = CONSTELLATION_REPOS.find((r) => r.id === hoveredRepoId);
        if (repo) activeIndices = [repo.index];
      }

      for (let r = 0; r < 17; r++) {
        const target = activeIndices.includes(r) ? 1.0 : 0.0;
        highlightArr[r] = THREE.MathUtils.damp(highlightArr[r], target, 12.0, delta);
      }

      // Swap text buffer if spell target changed
      if (currentTextTargetRef.current !== textSpellTarget) {
        currentTextTargetRef.current = textSpellTarget;
        const attr = geometry.attributes.aPosText as THREE.BufferAttribute;
        if (textSpellTarget === 'SHIVAM') {
          attr.copyArray(posTextShivam);
          attr.needsUpdate = true;
        } else if (textSpellTarget === 'THANKS') {
          attr.copyArray(posTextThanks);
          attr.needsUpdate = true;
        }
      }

      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uScrollProgress.value,
        scrollProgress,
        4.0,
        delta
      );
      materialRef.current.uniforms.uVelocity.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uVelocity.value,
        scrollVelocity || 0,
        6.0,
        delta
      );
      materialRef.current.uniforms.uMatrixMode.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uMatrixMode.value,
        matrixProgress || 0,
        8.0,
        delta
      );
      materialRef.current.uniforms.uIs404.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uIs404.value,
        is404 ? 1.0 : 0.0,
        5.0,
        delta
      );
      if (localTimeTheme?.color) {
        materialRef.current.uniforms.uAccentColor.value.set(localTimeTheme.color);
      }
      materialRef.current.uniforms.uActiveTower.value = activeTower;
      materialRef.current.uniforms.uMousePos.value.copy(mouseHitPoint);
      materialRef.current.uniforms.uShockwaveProgress.value = shockwaveProgress;
      materialRef.current.uniforms.uScanBeamProgress.value = scanBeamProgress;
      materialRef.current.uniforms.uTextMorph.value = textSpellProgress;
    }

    if (meshRef.current) {
      const { deviceTilt } = useCompileStore.getState();
      const tiltX = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(deviceTilt?.beta || 0, -10, 10));
      const tiltZ = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(deviceTilt?.gamma || 0, -10, 10));
      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, tiltX, 4.0, delta);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, -tiltZ, 4.0, delta);
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
      onPointerDown={(e) => {
        // Trigger shockwave when clicking the 3D bits
        e.stopPropagation();
        useCompileStore.getState().triggerShockwave();
      }}
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
