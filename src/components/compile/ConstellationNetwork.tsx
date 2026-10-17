import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  GALAXY_CONSTELLATIONS,
  CONSTELLATION_REPOS,
  CONSTELLATION_CONNECTIONS,
  ConstellationRepo,
} from '../../data/repoConstellationData';
import { useCompileStore } from '../../store/useCompileStore';

export const ConstellationNetwork: React.FC = () => {
  const lineMeshRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const hoveredRepo = useCompileStore((state) => state.hoveredRepoId);
  const setHoveredRepoId = useCompileStore((state) => state.setHoveredRepoId);

  // Generate line geometry between connected repos
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    CONSTELLATION_CONNECTIONS.forEach(([iA, iB]) => {
      const repoA = CONSTELLATION_REPOS[iA];
      const repoB = CONSTELLATION_REPOS[iB];
      if (repoA && repoB) {
        positions.push(...repoA.position);
        positions.push(...repoB.position);
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, []);

  // Fade in / out based on Stage 2 progress
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const progress = useCompileStore.getState().scrollProgress;

    // Stage 2 (Network / Skills) active window: ~0.38 to 0.54
    let targetOpacity = 0.0;
    if (progress >= 0.38 && progress <= 0.54) {
      if (progress < 0.42) {
        targetOpacity = (progress - 0.38) / 0.04;
      } else if (progress > 0.50) {
        targetOpacity = 1.0 - (progress - 0.50) / 0.04;
      } else {
        targetOpacity = 1.0;
      }
    }

    // Smoothly scale & fade group
    const curOpacity = (groupRef.current as any).materialOpacity ?? 0;
    const nextOpacity = THREE.MathUtils.damp(curOpacity, targetOpacity, 8, delta);
    (groupRef.current as any).materialOpacity = nextOpacity;

    groupRef.current.visible = nextOpacity > 0.01;

    if (lineMeshRef.current) {
      const mat = lineMeshRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = nextOpacity * 0.35;
    }
  });

  const activeHoveredRepo = useMemo(() => {
    return CONSTELLATION_REPOS.find((r) => r.id === hoveredRepo) || null;
  }, [hoveredRepo]);

  return (
    <group ref={groupRef} visible={false}>
      {/* Faint Constellation Connector Lines */}
      <lineSegments ref={lineMeshRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#ff5b1f"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Floating 3D Galaxy Titles */}
      {GALAXY_CONSTELLATIONS.map((galaxy) => (
        <group key={galaxy.id} position={[galaxy.center[0], galaxy.center[1] + 0.65, galaxy.center[2]]}>
          <Text
            fontSize={0.22}
            color={galaxy.color}
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_ad06-gnVBa.woff"
            letterSpacing={0.12}
            anchorX="center"
            anchorY="middle"
          >
            {galaxy.name}
          </Text>
          <Text
            position={[0, -0.18, 0]}
            fontSize={0.09}
            color="#8c9aa8"
            font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_ad06-gnVBa.woff"
            letterSpacing={0.15}
            anchorX="center"
            anchorY="middle"
          >
            GALAXY_CLUSTER
          </Text>
        </group>
      ))}

      {/* 17 Interactive Repo Star Anchors */}
      {CONSTELLATION_REPOS.map((repo) => (
        <ConstellationStarAnchor
          key={repo.id}
          repo={repo}
          isHovered={hoveredRepo === repo.id}
          onHover={() => setHoveredRepoId(repo.id)}
          onUnhover={() => {
            if (hoveredRepo === repo.id) setHoveredRepoId(null);
          }}
        />
      ))}

      {/* Interactive Floating 3D Tooltip for Hovered Repo */}
      {activeHoveredRepo && (
        <group position={activeHoveredRepo.position}>
          <Html
            position={[0, 0.45, 0]}
            center
            distanceFactor={9}
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="bg-[#090b0e]/95 border border-[#ff5b1f]/80 p-3.5 rounded-sm shadow-2xl backdrop-blur-md w-72 text-left cursor-pointer transition-all hover:scale-105"
              onClick={() => window.open(activeHoveredRepo.githubUrl, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex items-center justify-between border-b border-[#ff5b1f]/30 pb-1.5 mb-2">
                <span className="font-mono text-[9px] uppercase tracking-mono text-[#ff5b1f] font-bold">
                  REPO_NODE [#{String(activeHoveredRepo.index + 1).padStart(2, '0')}]
                </span>
                <span className="font-mono text-[9px] text-[#4ade80] px-1 py-0.5 bg-[#4ade80]/10 rounded">
                  {activeHoveredRepo.language}
                </span>
              </div>
              <h4 className="font-mono text-sm text-white font-bold mb-1 hover:text-[#ff5b1f] flex items-center justify-between">
                {activeHoveredRepo.name}
                <span className="text-xs text-[#ff5b1f]">↗</span>
              </h4>
              <p className="font-mono text-[10px] text-[#d8dde6]/70 leading-relaxed mb-2.5">
                {activeHoveredRepo.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {activeHoveredRepo.skills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="font-mono text-[8px] px-1.5 py-0.5 bg-[#141820] text-[#d8dde6]/80 rounded border border-[#d8dde6]/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="pt-1.5 border-t border-[#d8dde6]/10 flex items-center justify-between font-mono text-[8px] text-[#ff5b1f]">
                <span>github.com/Shivam-io-afk</span>
                <span className="underline">OPEN REPO ↗</span>
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

interface StarAnchorProps {
  repo: ConstellationRepo;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}

const ConstellationStarAnchor: React.FC<StarAnchorProps> = ({
  repo,
  isHovered,
  onHover,
  onUnhover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetScale = isHovered ? 1.8 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 12);
  });

  return (
    <mesh
      ref={meshRef}
      position={repo.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover();
      }}
      onPointerOut={() => {
        onUnhover();
      }}
      onClick={(e) => {
        e.stopPropagation();
        window.open(repo.githubUrl, '_blank', 'noopener,noreferrer');
      }}
    >
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial
        color={isHovered ? '#ff5b1f' : '#ffffff'}
        wireframe={false}
        transparent
        opacity={isHovered ? 1.0 : 0.75}
      />
    </mesh>
  );
};
