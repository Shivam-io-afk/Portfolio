import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, GitBranch, ChevronLeft, ChevronRight, Server, Database, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { useCompileStore } from '../../store/useCompileStore';

interface ProjectDeepDiveModalProps {
  projects: Project[];
}

export const ProjectDeepDiveModal: React.FC<ProjectDeepDiveModalProps> = ({ projects }) => {
  const isDeepDiveOpen = useCompileStore((state) => state.isDeepDiveOpen);
  const activeDeepDiveId = useCompileStore((state) => state.activeDeepDiveId);
  const closeDeepDive = useCompileStore((state) => state.closeDeepDive);
  const openDeepDive = useCompileStore((state) => state.openDeepDive);

  const [carouselIndex, setCarouselIndex] = useState(0);

  // Sync with URL hash #project/<id>
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project/')) {
        const id = hash.replace('#project/', '');
        openDeepDive(id);
      } else if (isDeepDiveOpen) {
        closeDeepDive();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // check on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard Esc handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDeepDiveOpen) {
        closeDeepDive();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeepDiveOpen, closeDeepDive]);

  const activeProject =
    projects.find((p) => p.id === activeDeepDiveId) || projects[0];

  if (!isDeepDiveOpen || !activeProject) return null;

  const mockScreenshots = [
    { title: 'Architecture Overview & Core Dashboard', tag: 'SYSTEM_VIEW_01' },
    { title: 'Live Transaction & State Flow Monitor', tag: 'PIPELINE_VIEW_02' },
    { title: 'Responsive Mobile Client & API Handshake', tag: 'MOBILE_VIEW_03' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07070a]/95 backdrop-blur-xl flex flex-col justify-start">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-20 border-b border-[#d8dde6]/10 bg-[#07070a]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={closeDeepDive}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-mono text-[#d8dde6] hover:text-[#ff5b1f] px-3 py-1.5 border border-[#d8dde6]/20 hover:border-[#ff5b1f] transition-all bg-[#121318]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&larr; BACK TO COMPILER [ESC]</span>
          </button>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-[#ff5b1f]">PROJECT_DEEP_DIVE:</span>
            <span className="text-white font-bold">{activeProject.title}</span>
            <span className="px-2 py-0.5 text-[10px] bg-[#ff5b1f]/10 text-[#ff5b1f] border border-[#ff5b1f]/20 uppercase">
              {activeProject.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeProject.githubUrl && (
              <a
                href={activeProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5b1f] text-black font-mono text-xs font-bold uppercase tracking-mono hover:bg-white transition-all shadow-sm"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>SOURCE REPO</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-w-6xl mx-auto px-6 py-10 w-full space-y-12">
          {/* Header Title Banner */}
          <div className="space-y-3">
            <div className="font-mono text-[11px] text-[#ff5b1f] uppercase tracking-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5b1f] animate-pulse" />
              <span>COMPILATION CASE STUDY /// {activeProject.id.toUpperCase()}</span>
            </div>
            <h1 className="font-grotesk text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {activeProject.title}
            </h1>
            <p className="font-mono text-sm sm:text-base text-[#ff5b1f]">
              // {activeProject.subtitle}
            </p>
            <p className="font-grotesk text-sm sm:text-base text-[#d8dde6]/85 max-w-3xl leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          {/* Section A: Animated SVG Architecture Diagram */}
          <div className="compile-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#d8dde6]/10 pb-3">
              <span className="font-mono text-xs uppercase tracking-mono text-[#ff5b1f] flex items-center gap-2">
                <Zap className="w-4 h-4" />
                SYSTEM ARCHITECTURE TOPOLOGY
              </span>
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
                DATA_PACKETS: TRANSMITTING (60 FPS)
              </span>
            </div>

            {/* Interactive Animated SVG Flow */}
            <div className="relative w-full h-56 bg-[#0a0b10] border border-[#d8dde6]/10 flex items-center justify-around px-4 sm:px-12 overflow-hidden">
              {/* Connecting Wave lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Line 1: Client -> API */}
                <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#d8dde6" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="4 4" />
                {/* Line 2: API -> Database */}
                <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="#d8dde6" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="4 4" />

                {/* Animated Orange Data Packets */}
                <circle r="4" fill="#ff5b1f">
                  <animate attributeName="cx" from="25%" to="50%" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="50%;50%" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#ff5b1f">
                  <animate attributeName="cx" from="50%" to="75%" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="50%;50%" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                </circle>
                <circle r="3" fill="#ffffff">
                  <animate attributeName="cx" from="75%" to="50%" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="50%;50%" dur="2.2s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Node 1: Client */}
              <div className="relative z-10 flex flex-col items-center gap-2 p-4 bg-[#121318] border border-[#ff5b1f]/40 w-36 sm:w-44 text-center shadow-lg">
                <Smartphone className="w-5 h-5 text-[#ff5b1f]" />
                <span className="font-mono text-xs font-bold text-white">Client UI Layer</span>
                <span className="font-mono text-[9px] text-[#d8dde6]/60">React • Tailwind • State</span>
              </div>

              {/* Node 2: Gateway */}
              <div className="relative z-10 flex flex-col items-center gap-2 p-4 bg-[#121318] border border-[#ff5b1f]/70 w-36 sm:w-44 text-center shadow-lg">
                <Server className="w-5 h-5 text-[#ff5b1f]" />
                <span className="font-mono text-xs font-bold text-white">API Gateway & Auth</span>
                <span className="font-mono text-[9px] text-[#d8dde6]/60">Node.js • Express • JWT</span>
              </div>

              {/* Node 3: Database */}
              <div className="relative z-10 flex flex-col items-center gap-2 p-4 bg-[#121318] border border-[#ff5b1f]/40 w-36 sm:w-44 text-center shadow-lg">
                <Database className="w-5 h-5 text-[#ff5b1f]" />
                <span className="font-mono text-xs font-bold text-white">Storage & State</span>
                <span className="font-mono text-[9px] text-[#d8dde6]/60">MongoDB / Firebase ODM</span>
              </div>
            </div>
          </div>

          {/* Section B: Problem -> Approach -> Result blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="compile-card p-6 space-y-3 border-l-2 border-l-[#ff5b1f]">
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#ff5b1f]">
                01 // THE CHALLENGE (PROBLEM)
              </span>
              <h3 className="font-grotesk text-lg font-bold text-white">
                Scalability & Fragmentation
              </h3>
              <p className="font-grotesk text-xs text-[#d8dde6]/75 leading-relaxed">
                Handling concurrent client state transactions, cross-vendor order persistence, and low-latency API handshakes without causing memory leaks or UI frame drops.
              </p>
            </div>

            <div className="compile-card p-6 space-y-3 border-l-2 border-l-[#ff5b1f]">
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#ff5b1f]">
                02 // THE ARCHITECTURE (APPROACH)
              </span>
              <h3 className="font-grotesk text-lg font-bold text-white">
                Modular RESTful Decoupling
              </h3>
              <p className="font-grotesk text-xs text-[#d8dde6]/75 leading-relaxed">
                Separated monolithic concerns into localized controllers, integrated defensive input validation, structured relational Mongoose schemas, and bound reactive state management.
              </p>
            </div>

            <div className="compile-card p-6 space-y-3 border-l-2 border-l-[#4ade80]">
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#4ade80]">
                03 // BENCHMARK (RESULT)
              </span>
              <h3 className="font-grotesk text-lg font-bold text-white">
                Deterministic High Performance
              </h3>
              <p className="font-grotesk text-xs text-[#d8dde6]/75 leading-relaxed">
                Sub-80ms API response latency, zero unhandled promise rejections, automated input sanitization, and seamless responsive client rendering across all device viewport tiers.
              </p>
            </div>
          </div>

          {/* Section C: Key Technical Decisions */}
          <div className="compile-card p-6 sm:p-8 space-y-4">
            <span className="font-mono text-xs uppercase tracking-mono text-[#ff5b1f] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              KEY ARCHITECTURAL & TECHNICAL DECISIONS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#0a0b10] border border-[#d8dde6]/10 space-y-2">
                <span className="font-mono text-[10px] text-[#ff5b1f] uppercase tracking-mono">DECISION 01</span>
                <div className="font-grotesk text-sm font-bold text-white">Stateless JWT + Secure HttpOnly</div>
                <p className="font-grotesk text-xs text-[#d8dde6]/60">Mitigated cross-site scripting risks while ensuring frictionless session routing across server reloads.</p>
              </div>

              <div className="p-4 bg-[#0a0b10] border border-[#d8dde6]/10 space-y-2">
                <span className="font-mono text-[10px] text-[#ff5b1f] uppercase tracking-mono">DECISION 02</span>
                <div className="font-grotesk text-sm font-bold text-white">Optimistic UI State Mutation</div>
                <p className="font-grotesk text-xs text-[#d8dde6]/60">Updated client interfaces instantly on user intent with background retry queues for transient network drops.</p>
              </div>

              <div className="p-4 bg-[#0a0b10] border border-[#d8dde6]/10 space-y-2">
                <span className="font-mono text-[10px] text-[#ff5b1f] uppercase tracking-mono">DECISION 03</span>
                <div className="font-grotesk text-sm font-bold text-white">Defensive Schema Validation</div>
                <p className="font-grotesk text-xs text-[#d8dde6]/60">Enforced strict type guards on both boundary middleware and database layers to guarantee zero corrupt records.</p>
              </div>
            </div>
          </div>

          {/* Section D: Screenshot / Mock Carousel */}
          <div className="compile-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-mono text-[#ff5b1f]">
                INTERFACE ARTIFACTS [{carouselIndex + 1} / {mockScreenshots.length}]
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev > 0 ? prev - 1 : mockScreenshots.length - 1))}
                  className="p-1.5 border border-[#d8dde6]/20 hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev < mockScreenshots.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 border border-[#d8dde6]/20 hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-80 w-full bg-[#07070a] border border-[#d8dde6]/15 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              <div className="font-mono text-xs uppercase tracking-widest text-[#ff5b1f]">
                {mockScreenshots[carouselIndex].tag}
              </div>
              <div className="font-grotesk text-xl sm:text-2xl font-bold text-white">
                {mockScreenshots[carouselIndex].title}
              </div>
              <p className="font-mono text-xs text-[#d8dde6]/50 max-w-md">
                Production interface mockup and real-time state telemetry rendered for {activeProject.title}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
