import React from 'react';
import { motion } from 'framer-motion';
import type { SkillCategory } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';
import { SwashText } from '../ui/SwashText';

interface SkillsProps {
  categories: SkillCategory[];
}

export const Skills: React.FC<SkillsProps> = ({ categories }) => {
  return (
    <section id="skills" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-flora-lime tracking-wideflora mb-2">
          <span className="w-2 h-2 bg-flora-lime" />
          <span><SwashText>CORE CAPABILITIES // PROTOCOLS</SwashText></span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-flora text-ice-white">
          <SwashText>TECHNICAL ARSENAL</SwashText>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, idx) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
          >
            <SpotlightCard className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                <div className="w-2.5 h-2.5 bg-flora-lime" />
                <h3 className="font-display font-semibold text-base uppercase tracking-wideflora text-ice-white">
                  <SwashText>{category.title}</SwashText>
                </h3>
              </div>

              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-ice-muted">{skill.name}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 bg-white/[0.04] text-flora-lime border border-white/[0.06] font-bold">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
