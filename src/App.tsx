import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { portfolioData } from './data/portfolioData';
import { KumoFilmCanvas } from './components/kumo/KumoFilmCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { ExperienceAndCredentials } from './components/sections/ExperienceAndCredentials';
import { Contact } from './components/sections/Contact';

export const App: React.FC = () => {
  const data = portfolioData;
  const [sceneLabel, setSceneLabel] = useState<string>('SC 01');
  const [isLightBg, setIsLightBg] = useState<boolean>(false);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Inertia Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash, { immediate: true });
      }, 120);
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-kumo-ink text-white overflow-x-hidden selection:bg-kumo-orange selection:text-white font-sans antialiased">
      {/* 1. Fine Scanlines Overlay (1px line every 3px, ~6% opacity) */}
      <div className="kumo-scanlines" />

      {/* 2. Animated Film Grain (~5% opacity) */}
      <div className="kumo-grain" />

      {/* 3. Soft Vignette */}
      <div className="kumo-vignette" />

      {/* 4. Fixed Full-Screen Canvas Scrubbing Image Sequence from /public/frames/ */}
      <KumoFilmCanvas
        onSceneChange={(scene, _idx, light) => {
          setSceneLabel(scene);
          setIsLightBg(light);
        }}
      />

      {/* 5. Header / HUD with Corner Brackets, Live Clock & Active Scene Indicator */}
      <Navbar
        availability={data.personal.availability}
        sceneLabel={sceneLabel}
        isLight={isLightBg}
      />

      {/* 6. Landing Page Content Layer */}
      <main className="relative z-10">
        <Hero data={data} />
        <Projects projects={data.projects} />
        <Skills categories={data.skills} />
        <ExperienceAndCredentials
          experience={data.experience}
          certifications={data.certifications}
          education={data.education}
        />
        <Contact personal={data.personal} />
      </main>

      {/* 7. Minimalist Ambient Kumo Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-kumo-ink/80 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-12 gap-6">
          <div className="flex items-center gap-3">
            <span className="font-jp text-sm text-kumo-orange">雲</span>
            <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
            <span className="font-mono text-xs uppercase tracking-mono text-white/80">
              Shivam Mishra • Full-Stack Developer & Creative Technologist
            </span>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-mono text-white/40">
            Rewa, MP, India • &copy; {new Date().getFullYear()} • Kumo Film Atmosphere System
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
