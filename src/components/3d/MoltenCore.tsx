import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ultra-realistic Volcanic Magma Shader with Multi-Octave Noise, Voronoi Cracks & Fresnel Glow
const vertexShader = `
  uniform float uTime;
  uniform float uDistortion;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Classic Simplex 3D Noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;

    // Multi-octave displacement
    float time = uTime * 0.45;
    float n1 = snoise(position * 1.8 + vec3(time));
    float n2 = snoise(position * 3.6 - vec3(time * 0.7));
    float n3 = snoise(position * 7.2 + vec3(time * 0.4));
    
    float totalDisplacement = (n1 * 0.38 + n2 * 0.18 + n3 * 0.06) * uDistortion;
    vDisplacement = totalDisplacement;

    vec3 newPos = position + normal * totalDisplacement;
    vPosition = newPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
    
    // Volcanic Color Spectrum
    vec3 basaltCrust = vec3(0.03, 0.03, 0.05);   // Dark chilled volcanic crust
    vec3 magmaRed    = vec3(0.92, 0.06, 0.08);   // Molten crimson
    vec3 glowingAmber= vec3(1.0, 0.38, 0.0);     // Blazing neon amber
    vec3 coreWhite   = vec3(1.0, 0.95, 0.75);    // White-hot inner core

    // Animated convective lava currents
    float flow = sin(vPosition.y * 3.2 + vPosition.x * 2.1 + uTime * 1.2) * 0.5 + 0.5;
    float crackPattern = sin(vDisplacement * 18.0 + uTime * 0.8) * 0.5 + 0.5;

    // Mix between dark cooled basalt crust and deep fiery magma
    vec3 baseColor = mix(basaltCrust, magmaRed, smoothstep(0.1, 0.65, flow + vDisplacement * 0.8));
    
    // Core thermal fissures (veins of white-hot lava through cracks)
    float fissure = pow(crackPattern, 5.0) * (vDisplacement + 0.5);
    baseColor = mix(baseColor, glowingAmber, smoothstep(0.2, 0.8, fissure));
    baseColor = mix(baseColor, coreWhite, pow(fissure, 3.5) * 1.2);

    // Fresnel rim lighting
    baseColor += glowingAmber * fresnel * 1.4;
    baseColor += coreWhite * pow(fresnel, 5.0) * 0.9;

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

interface MoltenCoreProps {
  mouse: { x: number; y: number };
}

export const MoltenCore: React.FC<MoltenCoreProps> = ({ mouse }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistortion: { value: 1.1 },
  }), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    uniforms.uTime.value = state.clock.getElapsedTime();
    
    // Primary core rotation with mouse tracking
    meshRef.current.rotation.y += delta * 0.22;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouse.y * 0.5,
      0.04
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      mouse.x * 0.5,
      0.04
    );

    // Orbiting planetary lava ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
      ringRef.current.rotation.x = THREE.MathUtils.lerp(
        ringRef.current.rotation.x,
        0.8 + mouse.y * 0.3,
        0.04
      );
      ringRef.current.rotation.y = THREE.MathUtils.lerp(
        ringRef.current.rotation.y,
        mouse.x * 0.3,
        0.04
      );
    }
  });

  return (
    <group>
      {/* 1. Main Molten Core */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={1.85}>
        <icosahedronGeometry args={[1, 70]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* 2. Floating Kinetic Energy Accretion Ring */}
      <mesh ref={ringRef} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[2.7, 0.025, 16, 120]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.45}
          wireframe={true}
        />
      </mesh>
    </group>
  );
};
