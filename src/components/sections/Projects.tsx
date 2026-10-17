import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, GitBranch, Layers } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { useCompileStore } from '../../store/useCompileStore';

interface ProjectsProps {
  projects: Project[];
}

interface ProjectCardProps {
  project: Project;
  idx: number;
}

const ProjectCardItem: React.FC<ProjectCardProps> = ({ project, idx }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isActive = useCompileStore((state) => state.activeTower === idx);
  const openDeepDive = useCompileStore((state) => state.openDeepDive);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const indexFormatted = String(idx + 1).padStart(2, '0');
  const isRight = idx % 2 === 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Subtle 3D tilt (max 4 degrees)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    setTilt({
      x: -normY * 3.5, // rotateX
      y: normX * 3.5,  // rotateY
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseEnter={() => useCompileStore.getState().setActiveTower(idx)}
      className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => openDeepDive(project.id)}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: mousePos ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        }}
        className={`compile-card p-6 sm:p-8 max-w-[520px] w-full transition-all duration-300 relative overflow-hidden cursor-pointer group ${
          isActive ? 'border-[#ff5b1f]/60 shadow-signal-glow-sm' : ''
        }`}
      >
        {/* Cursor Spotlight Radial Highlight */}
        {mousePos && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 91, 31, 0.12), transparent 75%)`,
            }}
          />
        )}

        <div className="relative z-10 space-y-4">
          {/* Meta Row: Index + Year + Category */}
          <div className="flex items-center justify-between border-b border-[#d8dde6]/10 pb-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-[#ff5b1f] font-bold">
                {indexFormatted}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
                /{project.year}
              </span>
              <span className="font-mono text-[10px] text-[#d8dde6]/20">·</span>
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/70">
                {project.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-mono px-2 py-0.5 bg-[#ff5b1f]/10 text-[#ff5b1f] border border-[#ff5b1f]/20">
                TOWER_0{idx}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-mono text-[#ff5b1f] opacity-80 group-hover:opacity-100 transition-opacity">
                <Layers className="w-2.5 h-2.5" />
                DEEP DIVE
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="font-grotesk text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-[#ff5b1f] transition-colors">
              {project.title}
            </h3>
            <div className="font-mono text-xs text-[#ff5b1f]/90 mb-2">
              {project.subtitle}
            </div>
            <p className="font-grotesk text-xs sm:text-sm text-[#d8dde6]/80 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Highlights */}
          {project.highlights && (
            <div className="space-y-1.5 border-l border-[#ff5b1f]/30 pl-3">
              {project.highlights.map((h, hIdx) => (
                <div key={hIdx} className="text-[11px] font-grotesk text-[#d8dde6]/70">
                  • {h}
                </div>
              ))}
            </div>
          )}

          {/* Tags & Action Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#d8dde6]/10">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] px-2 py-0.5 border border-[#d8dde6]/10 text-[#d8dde6]/60 uppercase tracking-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121318] border border-[#d8dde6]/20 hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] font-mono text-[10px] uppercase tracking-mono transition-all"
                >
                  <GitBranch className="w-3 h-3 text-[#ff5b1f]" />
                  <span>CODE</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={() => openDeepDive(project.id)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff5b1f] text-black font-mono text-[10px] font-bold uppercase tracking-mono hover:bg-white transition-all shadow-sm"
              >
                <span>CASE STUDY</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section id="projects" className="relative py-28 px-4 sm:px-10 max-w-7xl mx-auto z-10">
      {/* Section Eyebrow & Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-[#d8dde6]/10"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-[#ff5b1f] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f]" />
            <span>STAGE 01 /// BUILD.TOWERS</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl text-white font-bold tracking-tight">
            <ScatterText>Selected Works.</ScatterText>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-grotesk text-[#d8dde6]/70 max-w-md leading-relaxed">
          Production full-stack applications, real-time architectures, and modular systems compiled on modern web infrastructure.
        </p>
      </motion.div>

      {/* Alternating Project Cards */}
      <div className="space-y-16 sm:space-y-24">
        {projects.map((project, idx) => (
          <ProjectCardItem key={project.id} project={project} idx={idx} />
        ))}
      </div>
    </section>
  );
};
