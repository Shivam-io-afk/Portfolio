import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { portfolioData } from './data/portfolioData';
import { CompileCanvas } from './components/compile/CompileCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { RoadmapAscent } from './components/roadmap/RoadmapAscent';
import { Contact } from './components/sections/Contact';
import { DevPerfOverlay } from './components/ui/DevPerfOverlay';
import { useCompileStore } from './store/useCompileStore';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const App: React.FC = () => {
  const data = portfolioData;
  const setScrollProgress = useCompileStore((state) => state.setScrollProgress);
  const setCursorPos = useCompileStore((state) => state.setCursorPos);

  useEffect(() => {
    // 1. Initialize Lenis with lerp 0.08, synchronized with gsap.ticker
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    lenis.on('scroll', (e: any) => {
      ScrollTrigger.update();
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollable > 0) {
        const progress = e.scroll / totalScrollable;
        setScrollProgress(progress);
      }
    });

    // Drive Lenis via GSAP ticker for frame-locked synchronization
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);

    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash, { immediate: true });
      }, 120);
    }

    // 2. Track mouse position for camera parallax
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [setScrollProgress, setCursorPos]);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-[#d8dde6] overflow-x-hidden selection:bg-[#ff5b1f] selection:text-black font-grotesk antialiased">
      {/* Dev Performance HUD Overlay (FPS, drawcalls, tier switch, active stage) */}
      <DevPerfOverlay />

      {/* Fixed Full-Screen Three.js Canvas with Tier-Adaptive Bits Instanced Mesh */}
      <CompileCanvas />

      {/* Header / HUD Navigation with Monogram [ SM ], Build Passing Pill, IST Clock */}
      <Navbar availability={data.personal.availability} />

      {/* Landing Page Content Layers */}
      <main className="relative z-10">
        <Hero data={data} />
        <Projects projects={data.projects} />
        <Skills categories={data.skills} />
        <RoadmapAscent
          certifications={data.certifications}
          education={data.education}
          experience={data.experience}
        />
        <Contact personal={data.personal} />
      </main>

      {/* Minimal COMPILE Terminal Footer */}
      <footer className="relative z-10 border-t border-[#d8dde6]/10 py-12 bg-[#07070a]/90 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px-12 gap-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#ff5b1f]">[ SM ]</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f]" />
            <span className="font-mono text-xs uppercase tracking-mono text-[#d8dde6]/80">
              Shivam Mishra • MERN Stack & Creative Technologist
            </span>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
            Rewa, MP, India • &copy; {new Date().getFullYear()} • COMPILE ARCHITECTURE SYSTEM
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
