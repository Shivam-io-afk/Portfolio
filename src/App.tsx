import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioData } from './data/portfolioData';
import { CompileCanvas } from './components/compile/CompileCanvas';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { RoadmapAscent } from './components/roadmap/RoadmapAscent';
import { Contact } from './components/sections/Contact';
import { DevPerfOverlay } from './components/ui/DevPerfOverlay';
import { CompileBootLoader } from './components/compile/CompileBootLoader';
import { StageBackgroundWord } from './components/compile/StageBackgroundWord';
import { ProjectDeepDiveModal } from './components/sections/ProjectDeepDiveModal';
import { useCompileStore } from './store/useCompileStore';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const data = portfolioData;

  useEffect(() => {
    // 1. Configure ScrollTrigger to ignore mobile address-bar resize layout thrashing
    ScrollTrigger.config({ ignoreMobileResize: true });

    // 2. Initialize Lenis with lerp 0.08, autoRaf: false (driven strictly by gsap.ticker)
    const lenis = new Lenis({
      lerp: 0.08,
      autoRaf: false,
      smoothWheel: true,
    });

    // Strictly nothing else runs inside lenis.on('scroll')
    lenis.on('scroll', ScrollTrigger.update);

    // Cache total scrollable height (zero layout thrashing during scroll)
    let cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const updateDimensions = () => {
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Refresh ScrollTrigger once after web fonts load
    document.fonts.ready.then(() => {
      updateDimensions();
      ScrollTrigger.refresh();
    });

    // Drive Lenis via GSAP ticker with lagSmoothing(0)
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
      const scrollY = lenis.scroll || window.scrollY || 0;
      const progress = scrollY / cachedMaxScroll;
      useCompileStore.getState().setScrollProgress(progress);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    if (window.location.hash) {
      setTimeout(() => {
        lenis.scrollTo(window.location.hash, { immediate: true });
      }, 120);
    }

    // Track mouse position directly into store without React renders
    const handleMouseMove = (e: MouseEvent) => {
      useCompileStore.getState().setCursorPos(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-[#d8dde6] overflow-x-hidden selection:bg-[#ff5b1f] selection:text-black font-grotesk antialiased">
      {/* Dev Performance HUD Overlay (Only rendered if ?debug is in URL) */}
      <DevPerfOverlay />

      {/* High-Tech Terminal Boot Sequence (Skippable on click / skipped on return visit) */}
      <CompileBootLoader />

      {/* Giant 25vw Outlined Stage Background Words (SOURCE / BUILD / NETWORK / RUNTIME / DEPLOY) */}
      <StageBackgroundWord />

      {/* Fixed Full-Screen Three.js Canvas with Tier-Adaptive Bits Instanced Mesh */}
      <CompileCanvas />

      {/* Header / HUD Navigation with Monogram [ SM ], Build Passing Pill, IST Clock */}
      <Navbar availability={data.personal.availability} />

      {/* Full-Screen Architectural Deep Dive Case Study Overlay */}
      <ProjectDeepDiveModal projects={data.projects} />

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
