import React from 'react';
import { motion } from 'framer-motion';

export const MagmaMarquee: React.FC = () => {
  const items = [
    "REACT.JS",
    "NODE.JS & EXPRESS",
    "MONGODB & MONGOOSE",
    "GSAP & LOCOMOTIVE",
    "REST APIS & JWT",
    "THREE.JS & SHADERS",
    "FULL-STACK MERN",
    "LLM & AI INTEGRATION",
    "HIGH-PERFORMANCE UI/UX",
  ];

  return (
    <div className="relative w-full overflow-hidden border-y border-white/[0.08] bg-obsidian-900/60 py-4 backdrop-blur-md my-12 z-10">
      {/* Molten edge gradient fades */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-obsidian-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-obsidian-950 to-transparent z-10" />

      <motion.div
        className="flex whitespace-nowrap gap-12 font-display text-xs sm:text-sm font-extrabold uppercase tracking-widest text-smoke-500"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ ease: 'linear', duration: 25, repeat: Infinity }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 hover:text-magma-bright transition-colors">
            <span>{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-magma-base/60 shadow-[0_0_8px_#ff3b00]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

