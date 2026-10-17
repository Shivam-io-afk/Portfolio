import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { portfolioData } from './data/portfolioData';
import { FloraCanvas } from './components/3d/FloraCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { MagmaMarquee } from './components/ui/MagmaMarquee';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { ExperienceAndCredentials } from './components/sections/ExperienceAndCredentials';
import { Contact } from './components/sections/Contact';

export const App: React.FC = () => {
  const data = portfolioData;
  const [keyholeRadius, setKeyholeRadius] = useState(100);

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

    // 2. Keyhole Mask Reveal driven by initial scroll
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Keyhole starts open and expands seamlessly
      const radius = Math.min(150, 45 + scrollY * 0.35);
      setKeyholeRadius(radius);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen bg-navy-night text-ice-white overflow-x-hidden selection:bg-flora-lime selection:text-black font-sans"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0a1a4a 0%, #060507 90%)',
      }}
    >
      {/* 1. Global Film Grain Overlay */}
      <div className="film-grain" />

      {/* 2. Deep Nocturnal Vignette */}
      <div className="flora-vignette" />

      {/* 3. Diagonal Blue Light Beam */}
      <div className="flora-light-beam" />

      {/* 4. Faint Orange Fire Horizon Glow */}
      <div className="flora-horizon-glow" />

      {/* 5. Fixed 3D WebGL Canvas (Bloom ~1.2, Dandelion, Nebula & Iris) */}
      <FloraCanvas />

      {/* 6. Floating Glassmorphism HUD Navbar */}
      <Navbar availability={data.personal.availability} />

      {/* 7. Landing Page Content with Keyhole Mask Reveal */}
      <main
        className="relative z-10 keyhole-mask"
        style={{
          // @ts-ignore
          '--mask-radius': `${keyholeRadius}%`,
        }}
      >
        <Hero data={data} />
        <MagmaMarquee />
        <Projects projects={data.projects} />
        <Skills categories={data.skills} />
        <ExperienceAndCredentials
          experience={data.experience}
          certifications={data.certifications}
          education={data.education}
        />
        <Contact personal={data.personal} />
      </main>

      {/* 8. Minimalist Ambient Footer */}
      <footer className="relative z-10 border-t border-glass-border py-12 text-center text-xs font-mono text-ice-dim bg-navy-dark/80 backdrop-blur-glass">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-12 gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 bg-flora-lime shadow-[0_0_10px_#b8f57a]" />
            <span className="text-ice-muted font-display tracking-wideflora uppercase">
              SHIVAM MISHRA • MERN STACK & CREATIVE TECHNOLOGIST
            </span>
          </div>
          <div className="text-ice-dim text-[11px] uppercase tracking-wideflora">
            REWA, MP, INDIA • &copy; {new Date().getFullYear()} • STEMLINE RELAY FLORA PROTOCOL
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
