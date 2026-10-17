import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { MoltenCore } from './MoltenCore';
import { EmberParticles } from './EmberParticles';

export const LavaCanvas: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse to [-1, 1]
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#ff4400" />
        <pointLight position={[-5, -3, -2]} intensity={0.8} color="#990022" />
        
        <Float
          speed={1.5}
          rotationIntensity={0.6}
          floatIntensity={0.8}
        >
          <MoltenCore mouse={mouse} />
        </Float>
        
        <EmberParticles count={80} />
      </Canvas>
    </div>
  );
};

