import React from 'react';
import { motion } from 'framer-motion';
import type { SkillCategory } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { useCompileStore } from '../../store/useCompileStore';

interface SkillsProps {
  categories: SkillCategory[];
}

export const Skills: React.FC<SkillsProps> = ({ categories }) => {
  const setHoveredSkillNode = useCompileStore((state) => state.setHoveredSkillNode);

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
            <span>STAGE 02 /// NETWORK.GRAPH</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl text-white font-bold tracking-tight">
            <ScatterText>Technical Arsenal.</ScatterText>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-grotesk text-[#d8dde6]/70 max-w-md leading-relaxed">
          Distributed capability clusters connected across full-stack runtimes, machine intelligence, and systems programming.
        </p>
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
                    CLUSTER_0{idx}
                  </span>
                </div>

                {/* Skills List with Hairlines */}
                <div className="space-y-3 divide-y divide-[#d8dde6]/5">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.name}
                      onMouseEnter={() => setHoveredSkillNode(skill.name)}
                      onMouseLeave={() => setHoveredSkillNode(null)}
                      className="pt-2.5 flex items-center justify-between font-mono text-xs group cursor-default hover:text-[#ff5b1f] transition-colors"
                    >
                      <span className="text-[#d8dde6]/85 group-hover:text-white transition-colors">
                        {skill.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-mono text-[#ff5b1f] font-semibold">
                        {skill.level}
                      </span>
                    </div>
                  ))}
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
    </section>
  );
};
