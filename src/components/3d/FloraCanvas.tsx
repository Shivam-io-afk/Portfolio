import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { DandelionSeedHead } from './DandelionSeedHead';
import { StarfieldField } from './StarfieldField';

export const FloraCanvas: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / maxScroll)));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 3, 4]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={1.5} color="#55ee99" />
        <pointLight position={[0, 0, 1]} intensity={2.5} color="#ffdd66" />

        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
          <DandelionSeedHead scrollProgress={scrollProgress} mouse={mouse} />
        </Float>

        <StarfieldField count={300} />
      </Canvas>
    </div>
  );
};

