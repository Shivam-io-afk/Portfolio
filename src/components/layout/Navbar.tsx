import React from 'react';
import { SwashText } from '../ui/SwashText';

interface NavbarProps {
  availability: string;
}

export const Navbar: React.FC<NavbarProps> = ({ availability }) => {
  return (
    <header className="fixed top-6 inset-x-0 z-50 flex items-center justify-between px-6 sm:px-10 max-w-7xl mx-auto pointer-events-none">
      {/* 1. Left: Glass Chip with Lime Square Icon */}
      <a
        href="#hero"
        className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 bg-glass-surface backdrop-blur-glass border border-glass-border hover:border-flora-lime/40 transition-colors"
      >
        <div className="w-3.5 h-3.5 bg-flora-lime shrink-0 shadow-[0_0_10px_#b8f57a]" />
        <span className="font-display font-semibold text-xs tracking-wideflora uppercase text-ice-white">
          <SwashText>SHIVAM MISHRA</SwashText>
        </span>
      </a>

      {/* 2. Center: Dark Glass Pill with 2px Lime Vertical Bars on Left & Right Edges */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-7 px-8 py-2 bg-glass-surface backdrop-blur-glass border-y border-glass-border border-l-2 border-r-2 border-l-flora-lime border-r-flora-lime">
        <a
          href="#projects"
          className="text-xs uppercase tracking-wideflora text-ice-muted hover:text-flora-lime transition-colors font-display"
        >
          <SwashText>WORKS</SwashText>
        </a>
        <a
          href="#skills"
          className="text-xs uppercase tracking-wideflora text-ice-muted hover:text-flora-lime transition-colors font-display"
        >
          <SwashText>ARSENAL</SwashText>
        </a>
        <a
          href="#experience"
          className="text-xs uppercase tracking-wideflora text-ice-muted hover:text-flora-lime transition-colors font-display"
        >
          <SwashText>TRAJECTORY</SwashText>
        </a>
        <a
          href="#contact"
          className="text-xs uppercase tracking-wideflora text-ice-muted hover:text-flora-lime transition-colors font-display"
        >
          <SwashText>CONTACT</SwashText>
        </a>
      </nav>

      {/* 3. Right: Glass Button with Lime Edge Bar + Small Lime Count/Status Badge */}
      <a
        href="#contact"
        className="pointer-events-auto flex items-center gap-3 px-4 py-2 bg-glass-surface backdrop-blur-glass border border-glass-border border-r-2 border-r-flora-lime hover:bg-flora-lime/10 transition-all group"
      >
        <span className="text-xs font-display font-semibold uppercase tracking-wideflora text-ice-white group-hover:text-flora-lime transition-colors">
          <SwashText>CONNECT</SwashText>
        </span>
        <span className="px-1.5 py-0.5 bg-flora-lime text-black font-mono text-[10px] font-bold">
          24/7
        </span>
      </a>
    </header>
  );
};
