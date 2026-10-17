import React from 'react';
import type { SkillCategory } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';
import { Cpu, Layers, Terminal } from 'lucide-react';

interface SkillsProps {
  categories: SkillCategory[];
}

export const Skills: React.FC<SkillsProps> = ({ categories }) => {
  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Layers className="w-4 h-4 text-magma-base" />;
      case 1:
        return <Cpu className="w-4 h-4 text-magma-bright" />;
      default:
        return <Terminal className="w-4 h-4 text-magma-ember" />;
    }
  };

  return (
    <section id="skills" className="relative py-24 px-6 max-w-6xl mx-auto z-10">
      <div className="mb-14">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-magma-base tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-magma-base" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
          Technical Arsenal
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <SpotlightCard key={category.title} className="flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
              {getIcon(idx)}
              <h3 className="font-display font-bold text-lg uppercase tracking-wider text-white">
                {category.title}
              </h3>
            </div>

            <div className="space-y-4">
              {category.skills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between text-xs font-mono">
                  <span className="text-smoke-300">{skill.name}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/[0.04] text-magma-ember border border-white/[0.05]">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};
