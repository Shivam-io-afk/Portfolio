import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioData } from './data/portfolioData';
import CompileScene from './components/compile/CompileScene';
import SiteNav from './components/layout/SiteNav';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { RoadmapAscent } from './components/roadmap/RoadmapAscent';
import { Contact } from './components/sections/Contact';
import { DevPerfOverlay } from './components/ui/DevPerfOverlay';
import { CompileBootLoader } from './components/compile/CompileBootLoader';
import { StageBackgroundWord } from './components/compile/StageBackgroundWord';
import { ProjectDeepDiveModal } from './components/sections/ProjectDeepDiveModal';
import { AskShivamTerminal } from './components/ui/AskShivamTerminal';
import { CrosshairCursor } from './components/ui/CrosshairCursor';
import { GitLogFooter } from './components/ui/GitLogFooter';
import { SegmentationFault404 } from './components/ui/SegmentationFault404';
import { MobileTiltController } from './components/ui/MobileTiltController';
import { useCompileStore, StageId } from './store/useCompileStore';

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
    (window as any).lenis = lenis;
    (window as any).__lenis = lenis;

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
    ScrollTrigger.addEventListener('refresh', updateDimensions);

    // Refresh ScrollTrigger once after web fonts load
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
      updateDimensions();
    });

    // 5 Section ScrollTriggers: derive activeStage (0 -> 4) from section visibility
    const stageTriggersConfig: { id: string; stage: StageId; start?: string; end?: string }[] = [
      { id: '#hero', stage: 0, start: 'top top', end: 'bottom center' },
      { id: '#projects', stage: 1, start: 'top center', end: 'bottom center' },
      { id: '#skills', stage: 2, start: 'top center', end: 'bottom center' },
      { id: '#experience', stage: 3, start: 'top center', end: 'bottom center' },
      { id: '#contact', stage: 4, start: 'top center', end: 'bottom bottom' },
    ];

    const stageTriggers = stageTriggersConfig.map(({ id, stage, start, end }) => {
      return ScrollTrigger.create({
        trigger: id,
        start: start || 'top center',
        end: end || 'bottom center',
        onToggle: (self) => {
          if (self.isActive) {
            useCompileStore.getState().setActiveStage(stage);
          }
        },
      });
    });

    // Track visible headings with IntersectionObserver (never write on <html>/body)
    const visibleHeadings = new Set<HTMLElement>();
    let appliedVelSplit = 0;

    const headingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            visibleHeadings.add(el);
            if (appliedVelSplit > 0) {
              el.style.setProperty('--vel-split', `${appliedVelSplit}px`);
            }
          } else {
            visibleHeadings.delete(el);
            el.style.removeProperty('--vel-split');
          }
        });
      },
      { rootMargin: '40px 0px', threshold: 0 }
    );

    const observeHeadings = () => {
      document.querySelectorAll<HTMLElement>('h1, h2, .rgb-split-target').forEach((el) => {
        headingObserver.observe(el);
      });
    };
    observeHeadings();
    document.fonts.ready.then(observeHeadings);

    // Drive Lenis via GSAP ticker with lagSmoothing(0)
    let currentVelSplit = 0;
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
      const scrollY = lenis.scroll || window.scrollY || 0;
      const progress = scrollY / cachedMaxScroll;
      useCompileStore.getState().setScrollProgress(progress);

      // Scroll-velocity reactions: update velocity uniform & heading RGB split
      const vel = lenis.velocity || 0;
      useCompileStore.getState().setScrollVelocity(vel);
      const targetSplit = Math.min(3.5, Math.abs(vel) * 0.07);
      currentVelSplit += (targetSplit - currentVelSplit) * 0.15;

      // Quantize to 0.5px steps; when velocity is ~0, set to 0 once and stop writing
      const isVelNearZero = Math.abs(vel) < 0.05 && currentVelSplit < 0.25;
      const quantizedSplit = isVelNearZero ? 0 : Math.round(currentVelSplit * 2) / 2;

      if (quantizedSplit !== appliedVelSplit) {
        appliedVelSplit = quantizedSplit;
        if (quantizedSplit > 0) {
          const val = `${quantizedSplit}px`;
          visibleHeadings.forEach((el) => el.style.setProperty('--vel-split', val));
        } else {
          // Zero velocity: clear once, no further writes
          visibleHeadings.forEach((el) => el.style.removeProperty('--vel-split'));
        }
      }
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

    // Keyboard navigation (1-5 for stages, arrows for projects) & Konami code
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.getAttribute('contenteditable') === 'true';
      if (isInput) return;
      if (useCompileStore.getState().isTerminalOpen) return;

      // 1. Konami Code Easter Egg (Matrix mode)
      const key = e.key.toLowerCase();
      if (key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          konamiIndex = 0;
          useCompileStore.getState().triggerMatrixMode();
          return;
        }
      } else {
        konamiIndex = key === konamiCode[0] ? 1 : 0;
      }

      // 2. Stage jump keys 1-5
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const targets = ['#hero', '#projects', '#skills', '#experience', '#contact'];
        const idx = parseInt(e.key, 10) - 1;
        const targetId = targets[idx];
        if (targetId) {
          lenis.scrollTo(targetId, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
        return;
      }

      // 3. Arrow keys left/right to cycle active project tower
      if (e.key === 'ArrowLeft') {
        const currentTower = useCompileStore.getState().activeTower;
        if (currentTower > 0) {
          useCompileStore.getState().setActiveTower(currentTower - 1);
        }
        return;
      }
      if (e.key === 'ArrowRight') {
        const currentTower = useCompileStore.getState().activeTower;
        if (currentTower < 4) {
          useCompileStore.getState().setActiveTower(currentTower + 1);
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      stageTriggers.forEach((t) => t.kill());
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.removeEventListener('refresh', updateDimensions);
      headingObserver.disconnect();
      visibleHeadings.forEach((el) => el.style.removeProperty('--vel-split'));
      document.documentElement.style.removeProperty('--vel-split');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07070a] text-[#d8dde6] overflow-x-clip selection:bg-[#ff5b1f] selection:text-black font-grotesk antialiased">
      {/* Dev Performance HUD Overlay (Only rendered if ?debug is in URL) */}
      <DevPerfOverlay />

      {/* High-Tech Terminal Boot Sequence (Skippable on click / skipped on return visit) */}
      <CompileBootLoader />

      {/* Giant 25vw Outlined Stage Background Words (SOURCE / BUILD / NETWORK / RUNTIME / DEPLOY) */}
      <StageBackgroundWord />

      {/* Tested continuous 3D background with GPU morphing bits across 5 stages */}
      <CompileScene sections={['hero', 'projects', 'skills', 'experience', 'contact']} />

      {/* Slim floating glass bar SiteNav with sliding pill, progress line and mobile drawer */}
      <SiteNav
        resumeHref="https://drive.google.com/file/d/1zZPCChlTaYZSdnu78lJLoZvV-AgCJFJJ/view?usp=sharing"
        hireTarget="contact-form"
        links={[{ id: 'projects', label: 'Works' }, { id: 'skills', label: 'Arsenal' }, { id: 'experience', label: 'Trajectory' }, { id: 'contact', label: 'Contact' }]}
      />

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
      <footer className="relative z-10 border-t border-[#d8dde6]/10 py-12 bg-[#07070a]/90">
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

        {/* Real GitHub Git Log cached 1hr */}
        <GitLogFooter />
      </footer>

      {/* Interactive Scripted 'Ask Shivam' Terminal Shell (Press /) */}
      <AskShivamTerminal />

      {/* Interactive Desktop Crosshair Cursor with Bit Readout */}
      <CrosshairCursor />

      {/* Custom 404 Exception Overlay (SIGSEGV / Floor bit collapse) */}
      <SegmentationFault404 />

      {/* Mobile DeviceOrientation Gyro Controller (±10° tilt) */}
      <MobileTiltController />
    </div>
  );
};

export default App;
