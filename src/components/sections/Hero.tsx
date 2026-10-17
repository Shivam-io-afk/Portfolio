import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowDown, ExternalLink, Code2 } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';

interface HeroProps {
  data: PortfolioData;
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 pointer-events-none lava-radial-gradient z-0 opacity-80" />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-smoke-300 mb-6 backdrop-blur-md"
        >
          <Flame className="w-3.5 h-3.5 text-magma-base animate-pulse" />
          <span className="tracking-widest uppercase">{data.personal.role}</span>
        </motion.div>

        {/* Hero Title with Bold Editorial Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.92] uppercase text-white mb-6"
        >
          {data.personal.name}
        </motion.h1>

        {/* Headline & Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display font-bold text-sm sm:text-base uppercase tracking-widest text-magma-bright mb-4 max-w-2xl"
        >
          {data.personal.headline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-sm sm:text-base text-smoke-300 max-w-2xl font-light mb-10 leading-relaxed"
        >
          {data.personal.subheadline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#projects"
            className="px-7 py-3 rounded-full bg-magma-base text-white font-mono text-xs uppercase tracking-widest font-semibold hover:bg-magma-bright transition-all shadow-[0_0_25px_rgba(255,59,0,0.4)] hover:shadow-[0_0_40px_rgba(255,59,0,0.7)]"
          >
            Explore Projects
          </a>
          <a
            href={data.personal.socials.github}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 text-smoke-100 font-mono text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2"
          >
            <Code2 className="w-3.5 h-3.5 text-magma-base" />
            <span>GitHub Profile</span>
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 text-smoke-100 font-mono text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            Get In Touch
          </a>
        </motion.div>

        {/* Metrics Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl"
        >
          {data.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-obsidian-900/40 border border-white/[0.06] backdrop-blur-md text-left"
            >
              <div className="font-display font-bold text-2xl text-magma-base">
                {metric.value}
              </div>
              <div className="font-mono text-xs text-smoke-100 uppercase tracking-wider mt-1">
                {metric.label}
              </div>
              <div className="text-[11px] text-smoke-500 mt-0.5">
                {metric.detail}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-14 text-smoke-500 flex flex-col items-center gap-2 text-xs font-mono"
        >
          <span className="uppercase tracking-widest text-[10px]">Explore works & credentials</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-magma-base" />
        </motion.div>
      </div>
    </section>
  );
};
