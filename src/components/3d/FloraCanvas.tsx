import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, Vignette, EffectComposer } from '@react-three/postprocessing';
import { Flora3DScene } from './Flora3DScene';
import { StarfieldField } from './StarfieldField';

export const FloraCanvas: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dpr, setDpr] = useState(1.5);

  useEffect(() => {
    // Cap DPR at 1.75 for performance
    setDpr(Math.min(window.devicePixelRatio || 1, 1.75));

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
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 4, 3]} intensity={2.0} color="#e8f0ff" />
        <pointLight position={[-3, -3, 2]} intensity={1.8} color="#b8f57a" />
        <pointLight position={[0, 0, 1]} intensity={2.2} color="#ffcf6a" />

        {/* Mapped 3D Flora Scenes */}
        <Flora3DScene scrollProgress={scrollProgress} mouse={mouse} />

        {/* Deep Starfield Background */}
        <StarfieldField count={280} />

        {/* Post-Processing: Bloom ~1.2 & Vignette 0.6 */}
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.3}
            mipmapBlur={true}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.6} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
