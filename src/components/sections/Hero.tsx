import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioData } from '../../data/portfolioData';
import { SwashText } from '../ui/SwashText';
import { PrimaryButton, SecondaryButton } from '../ui/FloraButton';

interface HeroProps {
  data: PortfolioData;
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between pt-32 pb-16 px-6 sm:px-12 max-w-7xl mx-auto z-10 pointer-events-none">
      
      {/* 1. TOP-LEFT: Subtext + Role + Primary Actions (Interactive pointer-events-auto) */}
      <motion.div
        initial={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: 0.2 }}
        className="max-w-lg pointer-events-auto space-y-5"
      >
        {/* Protocol/Role Eyebrow */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wideflora uppercase text-flora-lime">
          <span className="w-2 h-2 bg-flora-lime shadow-[0_0_8px_#b8f57a]" />
          <span><SwashText>{data.personal.role}</SwashText></span>
        </div>

        {/* Subtext Paragraph */}
        <p className="text-xs sm:text-sm text-ice-muted font-normal leading-relaxed uppercase tracking-flora">
          {data.personal.subheadline}
        </p>

        {/* Buttons: Primary (White rect + Lime arrow) & Secondary (Glass + Lime border) */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <PrimaryButton href="#projects">
            EXPLORE WORKS
          </PrimaryButton>
          <SecondaryButton href={data.personal.socials.github} target="_blank" rel="noreferrer">
            SOURCE CODE
          </SecondaryButton>
        </div>

        {/* Telemetry Indicator Chip */}
        <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-glass-surface backdrop-blur-glass border border-glass-border text-[11px] font-mono text-ice-muted mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-flora-lime animate-pulse" />
          <span>COORDINATES: {data.personal.location}</span>
        </div>
      </motion.div>

      {/* 2. BOTTOM-LEFT: Giant ~9vw Lime Headline with Second Line Indented */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="mt-20 sm:mt-24 pointer-events-auto"
      >
        <h1 className="font-display font-bold text-[clamp(2.75rem,8.5vw,7.5rem)] leading-[0.92] text-flora-lime uppercase tracking-tight">
          <div className="overflow-hidden">
            <span className="block">
              <SwashText>SHIVAM</SwashText>
            </span>
          </div>
          <div className="overflow-hidden pl-8 sm:pl-20 md:pl-32">
            <span className="block text-ice-white hover:text-flora-lime transition-colors">
              <SwashText>MISHRA.</SwashText>
            </span>
          </div>
        </h1>

        {/* Minimal metrics row anchored at bottom right on desktop */}
        <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-glass-border max-w-xl text-xs font-mono text-ice-muted uppercase tracking-wideflora">
          {data.metrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-flora-lime font-bold">{m.value}</span>
              <span className="text-[10px] text-ice-dim">{m.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </section>
  );
};
