import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { SkillCategory } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { useCompileStore } from '../../store/useCompileStore';
import {
  CONSTELLATION_REPOS,
  GALAXY_CONSTELLATIONS,
  getReposForSkill,
} from '../../data/repoConstellationData';

interface SkillsProps {
  categories: SkillCategory[];
}

export const Skills: React.FC<SkillsProps> = ({ categories }) => {
  const [localSkill, setLocalSkill] = useState<string | null>(null);
  const hoveredSkillNode = useCompileStore((state) => state.hoveredSkillNode);
  const setHoveredSkillNode = useCompileStore((state) => state.setHoveredSkillNode);
  const hoveredRepoId = useCompileStore((state) => state.hoveredRepoId);
  const setHoveredRepoId = useCompileStore((state) => state.setHoveredRepoId);

  const effectiveSkill = hoveredSkillNode || localSkill;
  const matchingRepoIndices = useMemo(() => {
    return effectiveSkill ? getReposForSkill(effectiveSkill) : [];
  }, [effectiveSkill]);

  return (
    <section id="skills" className="relative py-28 px-4 sm:px-10 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 pb-6 border-b border-[#d8dde6]/10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-[#ff5b1f] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f]" />
            <span>STAGE 02 /// ARSENAL.CONSTELLATION</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl text-white font-bold tracking-tight">
            <ScatterText>Technical Arsenal.</ScatterText>
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <p className="text-xs sm:text-sm font-grotesk text-[#d8dde6]/70 max-w-md leading-relaxed md:text-right">
            17 public repositories mapped into 6 language galaxies across WebGL coordinate space.
          </p>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-mono text-[#ff5b1f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-pulse" />
            <span>WEBGL CONSTELLATION ONLINE</span>
          </div>
        </div>
      </motion.div>

      {/* Solid Compile Cards without heavy backdrop blur */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {categories.map((category, idx) => {
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="compile-card p-6 sm:p-7 border-t-2 border-t-[#ff5b1f] flex flex-col justify-between"
            >
              <div>
                {/* Index + Title */}
                <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-[#d8dde6]/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-[#ff5b1f] font-bold">
                      {indexFormatted}
                    </span>
                    <h3 className="font-grotesk text-lg sm:text-xl text-white font-semibold">
                      {category.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[9px] tracking-mono text-[#d8dde6]/40 uppercase">
                    CLUSTER_0{idx + 1}
                  </span>
                </div>

                {/* Skills List with Hairlines */}
                <div className="space-y-3 divide-y divide-[#d8dde6]/5">
                  {category.skills.map((skill) => {
                    const isHovered = effectiveSkill === skill.name;
                    const repoCount = getReposForSkill(skill.name).length;

                    return (
                      <div
                        key={skill.name}
                        onMouseEnter={() => {
                          setLocalSkill(skill.name);
                          setHoveredSkillNode(skill.name);
                        }}
                        onMouseLeave={() => {
                          setLocalSkill(null);
                          setHoveredSkillNode(null);
                        }}
                        className={`pt-2.5 flex items-center justify-between font-mono text-xs group cursor-pointer transition-all ${
                          isHovered ? 'text-[#ff5b1f] pl-1' : 'hover:text-[#ff5b1f]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1 h-1 rounded-full transition-colors ${
                              isHovered ? 'bg-[#ff5b1f]' : 'bg-[#d8dde6]/20'
                            }`}
                          />
                          <span
                            className={`transition-colors ${
                              isHovered ? 'text-white font-semibold' : 'text-[#d8dde6]/85'
                            }`}
                          >
                            {skill.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {repoCount > 0 && (
                            <span className="text-[9px] font-mono text-[#d8dde6]/30 group-hover:text-[#ff5b1f]/70">
                              {repoCount}r
                            </span>
                          )}
                          <span className="text-[10px] uppercase tracking-mono text-[#ff5b1f] font-semibold">
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Node Meta */}
              <div className="pt-5 mt-6 border-t border-[#d8dde6]/10 flex items-center justify-between text-[9px] font-mono tracking-mono text-[#d8dde6]/40 uppercase">
                <span>GRAPH NODE</span>
                <span className="text-[#4ade80]">READY</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 17 Public Repository Constellation Deck */}
      <motion.div
        id="constellation-deck"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-12 compile-card p-6 border-t-2 border-t-[#3178c6]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#d8dde6]/10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#ff5b1f] font-bold">04</span>
            <div>
              <h3 className="font-grotesk text-lg text-white font-semibold flex items-center gap-2">
                Repository Constellation
                <span className="font-mono text-[10px] text-[#4ade80] px-1.5 py-0.5 bg-[#4ade80]/10 rounded font-normal">
                  17 REPOS LIVE
                </span>
              </h3>
              <p className="font-mono text-[10px] text-[#d8dde6]/50 uppercase tracking-mono">
                Grouped by Language Galaxies // Hover skill to illuminate star clusters
              </p>
            </div>
          </div>
          {effectiveSkill && matchingRepoIndices.length > 0 && (
            <div id="constellation-badge" className="flex items-center gap-2 px-3 py-1 bg-[#ff5b1f]/10 border border-[#ff5b1f]/40 rounded-sm font-mono text-[10px] text-[#ff5b1f]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-ping" />
              <span>
                {matchingRepoIndices.length} {matchingRepoIndices.length === 1 ? 'REPO' : 'REPOS'} LINKED TO [{effectiveSkill.toUpperCase()}]
              </span>
            </div>
          )}
        </div>

        {/* 17 Repo Grid Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {CONSTELLATION_REPOS.map((repo) => {
            const isSkillMatch = matchingRepoIndices.includes(repo.index);
            const isHovered = hoveredRepoId === repo.id;
            const galaxy = GALAXY_CONSTELLATIONS.find((g) => g.id === repo.galaxyId);

            return (
              <a
                key={repo.id}
                href={repo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredRepoId(repo.id)}
                onMouseLeave={() => setHoveredRepoId(null)}
                className={`p-2.5 rounded-sm border transition-all text-left flex flex-col justify-between group ${
                  isSkillMatch || isHovered
                    ? 'bg-[#ff5b1f]/20 border-[#ff5b1f] shadow-lg shadow-[#ff5b1f]/20 scale-[1.03]'
                    : 'bg-[#0f1319]/80 border-[#d8dde6]/10 hover:border-[#d8dde6]/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="font-mono text-[8px] uppercase tracking-mono font-semibold"
                      style={{ color: galaxy?.color || '#ff5b1f' }}
                    >
                      {repo.language}
                    </span>
                    <span className="font-mono text-[8px] text-[#d8dde6]/40 group-hover:text-[#ff5b1f] transition-colors">
                      ↗
                    </span>
                  </div>
                  <h4 className="font-mono text-xs text-white font-medium truncate group-hover:text-[#ff5b1f] transition-colors">
                    {repo.name}
                  </h4>
                </div>
                <div className="mt-2 pt-1 border-t border-[#d8dde6]/5 flex items-center justify-between text-[8px] font-mono text-[#d8dde6]/40">
                  <span>#{String(repo.index + 1).padStart(2, '0')}</span>
                  <span className={isSkillMatch || isHovered ? 'text-[#ff5b1f] font-bold' : ''}>
                    {isSkillMatch ? 'BURST' : 'NODE'}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

