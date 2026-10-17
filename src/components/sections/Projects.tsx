import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code2, ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';
import { SwashText } from '../ui/SwashText';
import { PrimaryButton } from '../ui/FloraButton';

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section id="projects" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10 bg-transparent">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-flora-lime tracking-wideflora mb-2">
            <span className="w-2 h-2 bg-flora-lime" />
            <span><SwashText>SYSTEM NODES // ARTIFACTS</SwashText></span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-flora text-ice-white">
            <SwashText>SELECTED WORKS</SwashText>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-mono text-ice-muted max-w-md uppercase tracking-flora leading-relaxed">
          Production full-stack applications, real-time engines, and responsive web systems engineered on modern architectures.
        </p>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <SpotlightCard hasLiveDot={true} className="flex flex-col justify-between h-full">
              <div>
                {/* Top metadata */}
                <div className="flex items-center justify-between text-xs font-mono text-ice-dim mb-4">
                  <span className="text-flora-lime tracking-widest">{project.year}</span>
                  <span className="text-[10px] uppercase text-ice-muted">
                    {project.category}
                  </span>
                </div>

                {/* Title & subtitle */}
                <h3 className="font-display font-bold text-2xl uppercase tracking-wideflora text-ice-white hover:text-flora-lime transition-colors">
                  <SwashText>{project.title}</SwashText>
                </h3>
                
                <div className="font-mono text-xs text-flora-gold mt-1 mb-4">
                  {project.subtitle}
                </div>

                <p className="text-xs text-ice-muted leading-relaxed mb-6 font-normal">
                  {project.description}
                </p>

                {/* Highlights */}
                {project.highlights && (
                  <div className="space-y-1.5 mb-6 pt-3 border-t border-glass-border">
                    {project.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-[11px] font-mono text-ice-muted">
                        <span className="w-1.5 h-1.5 bg-flora-lime mt-1.5 shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.04] text-ice-muted border border-white/[0.06] uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Bottom Action Row */}
                <div className="flex items-center justify-between pt-4 border-t border-glass-border text-xs font-mono">
                  {project.githubUrl && (
                    <PrimaryButton href={project.githubUrl} target="_blank" rel="noreferrer">
                      REPOSITORY
                    </PrimaryButton>
                  )}
                  {project.metrics && (
                    <span className="text-[11px] font-mono text-flora-gold px-2 py-0.5 bg-white/[0.02] border border-white/5">
                      {project.metrics}
                    </span>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
