import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  availability?: string;
  sceneLabel?: string;
  isLight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  availability = 'AVAILABLE FOR ROLES',
  sceneLabel = 'SC 01',
  isLight = false,
}) => {
  const [time, setTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="fixed top-5 inset-x-0 z-50 px-5 sm:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-none transition-colors duration-500">
        {/* 1. Left: Logo framed with four corner-bracket marks + Kanji */}
        <a
          href="#hero"
          className="pointer-events-auto relative group px-3.5 py-2 flex items-center gap-2.5 backdrop-blur-md bg-kumo-ink/60 border border-white/10 hover:border-kumo-orange/50 transition-all shadow-soft-card"
        >
          {/* Four Corner Brackets */}
          <span className="absolute -top-1 -left-1 text-[10px] text-kumo-orange font-mono select-none">⌜</span>
          <span className="absolute -top-1 -right-1 text-[10px] text-kumo-orange font-mono select-none">⌝</span>
          <span className="absolute -bottom-1 -left-1 text-[10px] text-kumo-orange font-mono select-none">⌞</span>
          <span className="absolute -bottom-1 -right-1 text-[10px] text-kumo-orange font-mono select-none">⌟</span>

          {/* Kanji Accent */}
          <span className="font-jp text-sm text-kumo-orange/90 font-medium">雲</span>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-mono text-white/95 font-semibold group-hover:text-kumo-orange transition-colors">
              Shivam Mishra
            </span>
            <span className="font-mono text-[9px] uppercase tracking-mono text-white/50">
              Creative Tech // MERN
            </span>
          </div>
        </a>

        {/* 2. Center: 2-3 Small Columns of Links (Desktop) */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-8 px-6 py-2 bg-kumo-ink/65 backdrop-blur-md border border-white/10 shadow-soft-card">
          {/* Column 1 */}
          <div className="flex flex-col gap-1 text-left">
            <a
              href="#projects"
              className="group flex items-center gap-2 text-[10px] font-mono tracking-mono uppercase text-white/70 hover:text-kumo-orange transition-colors"
            >
              <span className="text-white/40 group-hover:text-kumo-orange">01</span>
              <span>Works</span>
            </a>
            <a
              href="#skills"
              className="group flex items-center gap-2 text-[10px] font-mono tracking-mono uppercase text-white/70 hover:text-kumo-orange transition-colors"
            >
              <span className="text-white/40 group-hover:text-kumo-orange">02</span>
              <span>Arsenal</span>
            </a>
          </div>

          <div className="w-[1px] h-6 bg-white/15" />

          {/* Column 2 */}
          <div className="flex flex-col gap-1 text-left">
            <a
              href="#experience"
              className="group flex items-center gap-2 text-[10px] font-mono tracking-mono uppercase text-white/70 hover:text-kumo-orange transition-colors"
            >
              <span className="text-white/40 group-hover:text-kumo-orange">03</span>
              <span>Trajectory</span>
            </a>
            <a
              href="#contact"
              className="group flex items-center gap-2 text-[10px] font-mono tracking-mono uppercase text-white/70 hover:text-kumo-orange transition-colors"
            >
              <span className="text-white/40 group-hover:text-kumo-orange">04</span>
              <span>Transmission</span>
            </a>
          </div>

          <div className="w-[1px] h-6 bg-white/15" />

          {/* 3. Live Clock in 1px outlined box with mono scene label underneath */}
          <div className="flex flex-col items-center">
            <div className="px-2.5 py-0.5 border border-white/20 bg-black/40 font-mono text-[10px] tracking-mono text-white/90">
              {time || '12:00:00'}
            </div>
            <div className="text-[9px] font-mono tracking-wide text-kumo-orange uppercase font-bold mt-0.5">
              {sceneLabel}
            </div>
          </div>
        </nav>

        {/* 4. Right: Main CTA with small pulsing orange dot */}
        <div className="pointer-events-auto flex items-center gap-3">
          <a
            href="#contact"
            className="flex items-center gap-2.5 px-4 py-2 bg-kumo-ink/65 backdrop-blur-md border border-white/10 hover:border-kumo-orange/60 hover:bg-black/50 transition-all shadow-soft-card group"
          >
            <span className="w-2 h-2 rounded-full bg-kumo-orange animate-pulse shadow-[0_0_8px_#e8772e]" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-white/90 group-hover:text-kumo-orange transition-colors">
              Initiate Contact
            </span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-kumo-ink/70 backdrop-blur-md border border-white/10 text-white hover:text-kumo-orange transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-kumo-ink/95 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <span className="font-mono text-xs tracking-mono uppercase text-kumo-orange">
              Directory // {sceneLabel}
            </span>
            <span className="font-mono text-xs tracking-mono text-white/60">
              {time}
            </span>
          </div>

          <div className="space-y-6">
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-baseline justify-between text-2xl font-serif text-white hover:text-kumo-orange transition-colors border-b border-white/10 pb-3"
            >
              <span>Selected Works.</span>
              <span className="font-mono text-xs tracking-mono text-white/40">01</span>
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-baseline justify-between text-2xl font-serif text-white hover:text-kumo-orange transition-colors border-b border-white/10 pb-3"
            >
              <span>Technical Arsenal.</span>
              <span className="font-mono text-xs tracking-mono text-white/40">02</span>
            </a>
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-baseline justify-between text-2xl font-serif text-white hover:text-kumo-orange transition-colors border-b border-white/10 pb-3"
            >
              <span>Trajectory & Credentials.</span>
              <span className="font-mono text-xs tracking-mono text-white/40">03</span>
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-baseline justify-between text-2xl font-serif text-white hover:text-kumo-orange transition-colors border-b border-white/10 pb-3"
            >
              <span>Initiate Transmission.</span>
              <span className="font-mono text-xs tracking-mono text-white/40">04</span>
            </a>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kumo-orange" />
              <span className="font-mono text-[10px] uppercase tracking-mono text-white/70">
                {availability}
              </span>
            </div>
            <span className="font-jp text-sm text-white/40">秋雲</span>
          </div>
        </div>
      )}
    </>
  );
};
