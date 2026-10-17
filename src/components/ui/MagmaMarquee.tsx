import React from 'react';
import { motion } from 'framer-motion';
import { SwashText } from './SwashText';

export const MagmaMarquee: React.FC = () => {
  const items = [
    "STEMLINE CARRIES YOUR TRANSACTION",
    "REACT.JS & REDUX ARCHITECTURE",
    "NODE.JS & EXPRESS SERVICES",
    "MONGODB & MONGOOSE DATASTORE",
    "GSAP & LOCOMOTIVE SCROLL ANIMATIONS",
    "REST APIS & JWT AUTHENTICATION",
    "THREE.JS WEBGL PARTICLE ENGINES",
    "LLM & AI-POWERED WEB AGENTS",
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-glass-border bg-glass-surface/50 py-3 backdrop-blur-glass my-8 z-10">
      <div className="pointer-events-none absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-navy-dark to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-navy-dark to-transparent z-10" />

      <motion.div
        className="flex whitespace-nowrap gap-12 font-display text-xs font-semibold uppercase tracking-wideflora text-ice-muted"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
      >
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 hover:text-flora-lime transition-colors">
            <span><SwashText>{item}</SwashText></span>
            <span className="w-1.5 h-1.5 bg-flora-lime shadow-[0_0_8px_#b8f57a]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
