import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import CustomShaderMaterial from 'three-custom-shader-material';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { generateLayoutPositions } from './layoutGenerators';
import { useCompileStore } from '../../store/useCompileStore';

interface CompileBitsMeshProps {
  count?: number;
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

  uniform float uScrollProgress; // 0.0 to 1.0
  uniform float uTime;
  uniform float uActiveTower;
  uniform float uHoveredSkill;

  varying float vIsHot;
  varying vec3 vWorldPos;
  varying float vStaggerT;

  // Simplex-style 3D curl approximation
  vec3 curlNoise(vec3 p) {
    float x = sin(p.y * 3.0 + uTime * 0.8) * cos(p.z * 2.5);
    float y = sin(p.z * 3.0 + uTime * 0.9) * cos(p.x * 2.5);
    float z = sin(p.x * 3.0 + uTime * 0.7) * cos(p.y * 2.5);
    return vec3(x, y, z);
  }

  // Linear blend between 2 stages with staggered progress & curl offset
  vec3 morphBetween(vec3 pStart, vec3 pEnd, float segProg, float seed) {
    float t = smoothstep(0.0, 1.0, clamp((segProg * 1.6) - seed * 0.6, 0.0, 1.0));
    vec3 mid = mix(pStart, pEnd, t);
    // Curl noise offset scaled by sin(pi * t) * 0.8
    float swirl = sin(3.14159265 * t);
    vec3 curl = curlNoise(mid * 0.7) * swirl * 0.8;
    return mid + curl;
  }

  void main() {
    vIsHot = aIsHot;

    // Segment progress across 4 transitions:
    // 0: 0.00 -> 0.25 (p0 -> p1)
    // 1: 0.25 -> 0.50 (p1 -> p2)
    // 2: 0.50 -> 0.75 (p2 -> p3)
    // 3: 0.75 -> 1.00 (p3 -> p4)
    float p = clamp(uScrollProgress, 0.0, 1.0);
    float stageFloat = p * 4.0;
    int stageIdx = int(floor(stageFloat));
    if (stageIdx > 3) stageIdx = 3;
    float segProg = fract(stageFloat);
    if (p >= 1.0) segProg = 1.0;

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

    // Gentle micro-float idle oscillation
    blendedPos += vec3(
      sin(uTime * 0.7 + aSeed * 6.28) * 0.03,
      cos(uTime * 0.6 + aSeed * 4.14) * 0.03,
      sin(uTime * 0.8 + aSeed * 3.14) * 0.03
    );

    // Apply instanced scale + transformed vertex
    vec3 transformedPos = position * aScale + blendedPos;
    csm_Position = transformedPos;

    vWorldPos = transformedPos;
  }
`;

const fragmentShader = `
  varying float vIsHot;
  varying vec3 vWorldPos;
  uniform float uTime;

  void main() {
    // If instance is tagged hot, boost emissive signal orange (#ff5b1f)
    if (vIsHot > 0.5) {
      float pulse = 0.85 + 0.25 * sin(uTime * 3.0 + vWorldPos.x * 2.0);
      csm_Emissive = vec3(1.0, 0.357, 0.12) * 2.6 * pulse;
    }
  }
`;

export const CompileBitsMesh: React.FC<CompileBitsMeshProps> = ({ count = 12000 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<any>(null);

  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const activeTower = useCompileStore((state) => state.activeTower);

  // Compute geometry & buffers
  const { geometry, uniforms } = useMemo(() => {
    // Base box geometry: RoundedBoxGeometry(1, 1, 1, 2, 0.15)
    const baseGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.15);
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

    const uniforms = {
      uScrollProgress: { value: 0 },
      uTime: { value: 0 },
      uActiveTower: { value: 0 },
      uHoveredSkill: { value: 0 },
    };

    return { geometry: instGeo, uniforms };
  }, [count]);

  // Frame tick updates
  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // Smooth lerp to scrollProgress
      materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uScrollProgress.value,
        scrollProgress,
        0.12
      );
      materialRef.current.uniforms.uActiveTower.value = activeTower;
    }

    if (meshRef.current) {
      // Slow global rotation of the whole field
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <CustomShaderMaterial
        ref={materialRef}
        baseMaterial={THREE.MeshPhysicalMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        metalness={1.0}
        roughness={0.18}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        color={new THREE.Color('#d8dde6')}
      />
    </instancedMesh>
  );
};
