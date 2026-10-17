import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, GitBranch } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { useCompileStore } from '../../store/useCompileStore';

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const activeTower = useCompileStore((state) => state.activeTower);
  const setActiveTower = useCompileStore((state) => state.setActiveTower);

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

      {/* Alternating Project Cards (Max 520px) positioned so opposite active tower is visible */}
      <div className="space-y-16 sm:space-y-24">
        {projects.map((project, idx) => {
          const indexFormatted = String(idx + 1).padStart(2, '0');
          // Alternate cards: even on the left, odd on the right
          const isRight = idx % 2 === 1;
          const isActive = activeTower === idx;

          return (
            <div
              key={project.id}
              onMouseEnter={() => setActiveTower(idx)}
              className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className={`compile-card p-6 sm:p-8 max-w-[520px] w-full transition-all duration-300 ${
                  isActive ? 'border-[#ff5b1f]/60 shadow-signal-glow-sm' : ''
                }`}
              >
                {/* Meta Row: Index + Year + Category */}
                <div className="flex items-center justify-between border-b border-[#d8dde6]/10 pb-3 mb-4">
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

                  <span className="font-mono text-[9px] uppercase tracking-mono px-2 py-0.5 bg-[#ff5b1f]/10 text-[#ff5b1f] border border-[#ff5b1f]/20">
                    TOWER_0{idx}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-grotesk text-xl sm:text-2xl font-bold text-white mb-1">
                  {project.title}
                </h3>
                <div className="font-mono text-xs text-[#ff5b1f]/90 mb-3">
                  {project.subtitle}
                </div>
                <p className="font-grotesk text-xs sm:text-sm text-[#d8dde6]/80 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Highlights */}
                {project.highlights && (
                  <div className="space-y-1.5 mb-5 border-l border-[#ff5b1f]/30 pl-3">
                    {project.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="text-[11px] font-grotesk text-[#d8dde6]/70">
                        • {h}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags & Action Link */}
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
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
