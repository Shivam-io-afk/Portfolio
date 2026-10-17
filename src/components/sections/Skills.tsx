import React from 'react';
import { motion } from 'framer-motion';
import type { SkillCategory } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';

interface SkillsProps {
  categories: SkillCategory[];
}

export const Skills: React.FC<SkillsProps> = ({ categories }) => {
  return (
    <section id="skills" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 pb-6 border-b border-white/10"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
          <span>SCENE 03 // THROUGH CLOUDS & ATMOSPHERE</span>
        </div>
        <h2 className="font-display text-4xl sm:text-6xl text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          <ScatterText>Technical Arsenal.</ScatterText>
        </h2>
      </motion.div>

      {/* Minimal Hairline Layout with Cream Cloud Panels (Text switched to Ink for clouds) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((category, idx) => {
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-kumo-cream/95 text-kumo-ink backdrop-blur-md p-7 border-t-2 border-kumo-orange shadow-soft-card flex flex-col justify-between"
            >
              <div>
                {/* Index + Title */}
                <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-kumo-ink/15">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-kumo-orange font-bold tracking-mono">
                      {indexFormatted}
                    </span>
                    <h3 className="font-display text-xl text-kumo-ink font-semibold">
                      {category.title}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] tracking-mono text-kumo-ink/40 uppercase">
                    CAPABILITY
                  </span>
                </div>

                {/* Skills List with Hairlines */}
                <div className="space-y-3.5 divide-y divide-kumo-ink/10">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="pt-2.5 flex items-center justify-between font-mono text-xs"
                    >
                      <span className="text-kumo-ink/85 font-medium">{skill.name}</span>
                      <span className="text-[10px] uppercase tracking-mono text-kumo-orange font-bold">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Micro Caption */}
              <div className="pt-6 mt-6 border-t border-kumo-ink/10 flex items-center justify-between text-[9px] font-mono tracking-mono text-kumo-ink/50 uppercase">
                <span>SYSTEM NODE</span>
                <span>VERIFIED</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
