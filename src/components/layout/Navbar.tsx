import React from 'react';
import { Sparkles, Terminal, Flame, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  availability: string;
}

export const Navbar: React.FC<NavbarProps> = ({ availability }) => {
  return (
    <header className="fixed top-5 inset-x-0 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-6 px-5 py-2.5 rounded-full bg-obsidian-900/70 border border-white/10 backdrop-blur-md shadow-2xl shadow-black/80">
        {/* Brand / Logo */}
        <a href="#hero" className="flex items-center gap-2 text-smoke-100 hover:text-magma-bright transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-magma-base animate-pulse shadow-[0_0_12px_#ff3b00]" />
          <span className="font-display font-bold tracking-wider text-sm uppercase">PORTFOLIO</span>
        </a>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Links */}
        <div className="hidden md:flex items-center gap-5 text-xs uppercase tracking-widest text-smoke-300 font-mono">
          <a href="#projects" className="hover:text-smoke-100 transition-colors">Works</a>
          <a href="#skills" className="hover:text-smoke-100 transition-colors">Arsenal</a>
          <a href="#about" className="hover:text-smoke-100 transition-colors">Ethos</a>
          <a href="#contact" className="hover:text-smoke-100 transition-colors">Contact</a>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Status Beacon */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-smoke-300 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{availability}</span>
        </div>

        {/* CTA Button */}
        <a
          href="#contact"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-magma-base text-white text-xs font-mono font-semibold tracking-wider hover:bg-magma-bright transition-all shadow-[0_0_20px_rgba(255,59,0,0.35)] hover:shadow-[0_0_30px_rgba(255,59,0,0.6)]"
        >
          <span>INITIATE</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </nav>
    </header>
  );
};

