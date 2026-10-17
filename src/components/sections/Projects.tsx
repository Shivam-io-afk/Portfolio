import React from 'react';
import { ExternalLink, Code2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section id="projects" className="relative py-28 px-6 max-w-6xl mx-auto z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-magma-base tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-magma-base" />
            <span>Engineered Artifacts</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
            Featured Projects
          </h2>
        </div>
        <p className="text-sm font-mono text-smoke-300 max-w-sm">
          Production MERN platforms, real-time communications, and MVC architectures with high-fidelity UI/UX.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <SpotlightCard key={project.id} className="flex flex-col justify-between group">
            <div>
              {/* Top metadata */}
              <div className="flex items-center justify-between text-xs font-mono text-smoke-500 mb-5">
                <span className="text-magma-base font-semibold tracking-widest">{project.year}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[10px] uppercase border border-white/[0.05] text-smoke-300">
                  {project.category}
                </span>
              </div>

              {/* Title & subtitle */}
              <h3 className="font-display font-bold text-2xl uppercase tracking-tight text-white group-hover:text-magma-bright transition-colors flex items-center justify-between">
                <span>{project.title}</span>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/[0.04] text-magma-base hover:text-white hover:bg-magma-base/30 transition-all"
                    title="View Source on GitHub"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </h3>
              
              <div className="font-mono text-xs text-magma-ember mt-1 mb-3">
                {project.subtitle}
              </div>

              <p className="text-xs text-smoke-300 leading-relaxed mb-5 font-light">
                {project.description}
              </p>

              {/* Highlights bullet points */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="space-y-1.5 mb-6 pt-3 border-t border-white/[0.05]">
                  {project.highlights.map((highlight, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-[11px] font-mono text-smoke-300">
                      <span className="w-1 h-1 rounded-full bg-magma-base mt-1.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-smoke-300 border border-white/[0.04]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-smoke-100 hover:text-magma-bright transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-magma-base" />
                    <span>Explore Repository</span>
                  </a>
                )}
                {project.metrics && (
                  <span className="ml-auto text-[11px] text-magma-ember font-mono px-2 py-0.5 rounded bg-magma-base/10 border border-magma-base/20">
                    {project.metrics}
                  </span>
                )}
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};
