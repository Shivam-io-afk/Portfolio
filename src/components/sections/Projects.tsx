import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section id="projects" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10">
      {/* Eyebrow & Headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-white/10"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
            <span>SCENE 02 // ROOFTOPS & ARCHITECTURE</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            <ScatterText>Selected Works.</ScatterText>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-sans text-white/75 max-w-md leading-relaxed">
          Production full-stack applications, real-time engines, and responsive web systems engineered on modern architectures.
        </p>
      </motion.div>

      {/* Minimal Hairline List Layout (No heavy boxes) */}
      <div className="space-y-0 divide-y divide-white/15">
        {projects.map((project, idx) => {
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="py-10 group hover:bg-white/[0.02] transition-colors"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Index + Year + Category */}
                <div className="lg:col-span-3 flex lg:flex-col justify-between items-start gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs sm:text-sm text-kumo-orange font-semibold tracking-mono">
                      {indexFormatted}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-mono text-white/40">
                      /{project.year}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-mono text-white/60">
                    {project.category}
                  </div>
                  {project.metrics && (
                    <span className="font-mono text-[10px] text-kumo-orange/90 tracking-mono mt-1">
                      {project.metrics}
                    </span>
                  )}
                </div>

                {/* Title + Subtitle + Description */}
                <div className="lg:col-span-6 space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl text-white group-hover:text-kumo-orange transition-colors">
                    {project.title}
                  </h3>
                  <div className="font-mono text-xs text-kumo-sky/90 tracking-mono">
                    {project.subtitle}
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed max-w-xl">
                    {project.description}
                  </p>

                  {/* Highlights */}
                  {project.highlights && (
                    <div className="space-y-1.5 pt-2">
                      {project.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 text-[11px] font-sans text-white/60">
                          <span className="text-kumo-orange mt-0.5">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border border-white/10 text-white/60 uppercase tracking-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action / Link */}
                <div className="lg:col-span-3 flex lg:justify-end items-center pt-2 lg:pt-0">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/20 hover:border-kumo-orange text-white hover:text-kumo-orange font-mono text-[11px] tracking-mono uppercase transition-all group-hover:translate-x-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Code</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-kumo-orange" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
