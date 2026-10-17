import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useCompileStore } from '../../store/useCompileStore';
import { MagneticButton } from '../ui/MagneticButton';
import { ResumeBundlerButton } from '../ui/ResumeBundlerButton';

interface NavbarProps {
  availability?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  availability = 'AVAILABLE FOR ROLES',
}) => {
  const [time, setTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const activeStage = useCompileStore((state) => state.activeStage);
  const localTimeTheme = useCompileStore((state) => state.localTimeTheme);

  const stageLabels = ['00 / SOURCE', '01 / BUILD', '02 / NETWORK', '03 / RUNTIME', '04 / DEPLOY'];

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Format as IST (India Standard Time)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Top Scrim Gradient (120px tall) */}
      <div className="fixed top-0 inset-x-0 h-32 pointer-events-none z-40 bg-gradient-to-b from-[#07070a] via-[#07070a]/70 to-transparent" />

      <header className="fixed top-5 inset-x-0 z-50 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-none">
        {/* 1. Left: Monogram [ SM ] */}
        <a
          href="#hero"
          className="pointer-events-auto group px-3 py-1.5 flex items-center gap-2 bg-[#121318]/90 backdrop-blur-md border border-[#d8dde6]/10 hover:border-[#ff5b1f]/60 transition-all"
        >
          <span className="font-mono text-xs text-[#ff5b1f]">[</span>
          <span className="font-mono text-xs font-bold tracking-widest text-[#d8dde6] group-hover:text-white transition-colors">
            SM
          </span>
          <span className="font-mono text-xs text-[#ff5b1f]">]</span>
          <span className="hidden sm:inline-block w-[1px] h-3 bg-[#d8dde6]/20 mx-1" />
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60">
            COMPILE v2.6
          </span>
        </a>

        {/* 2. Center: Nav ticks + 5-step Progress Rail + Build Status Pill */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-5 px-5 py-2 bg-[#121318]/90 backdrop-blur-md border border-[#d8dde6]/10">
          <a
            href="#projects"
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-mono uppercase transition-colors ${
              activeStage === 1 ? 'text-[#ff5b1f] font-semibold' : 'text-[#d8dde6]/70 hover:text-[#ff5b1f]'
            }`}
          >
            <span className={activeStage === 1 ? 'text-[#ff5b1f]' : 'text-[#ff5b1f]/70'}>01</span>
            <span>WORKS</span>
          </a>
          <span className="text-[#d8dde6]/20">·</span>

          <a
            href="#skills"
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-mono uppercase transition-colors ${
              activeStage === 2 ? 'text-[#ff5b1f] font-semibold' : 'text-[#d8dde6]/70 hover:text-[#ff5b1f]'
            }`}
          >
            <span className={activeStage === 2 ? 'text-[#ff5b1f]' : 'text-[#ff5b1f]/70'}>02</span>
            <span>ARSENAL</span>
          </a>
          <span className="text-[#d8dde6]/20">·</span>

          <a
            href="#experience"
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-mono uppercase transition-colors ${
              activeStage === 3 ? 'text-[#ff5b1f] font-semibold' : 'text-[#d8dde6]/70 hover:text-[#ff5b1f]'
            }`}
          >
            <span className={activeStage === 3 ? 'text-[#ff5b1f]' : 'text-[#ff5b1f]/70'}>03</span>
            <span>TRAJECTORY</span>
          </a>
          <span className="text-[#d8dde6]/20">·</span>

          <a
            href="#contact"
            className={`flex items-center gap-1.5 font-mono text-[11px] tracking-mono uppercase transition-colors ${
              activeStage === 4 ? 'text-[#ff5b1f] font-semibold' : 'text-[#d8dde6]/70 hover:text-[#ff5b1f]'
            }`}
          >
            <span className={activeStage === 4 ? 'text-[#ff5b1f]' : 'text-[#ff5b1f]/70'}>04</span>
            <span>CONTACT</span>
          </a>

          <div className="w-[1px] h-3.5 bg-[#d8dde6]/15 mx-1" />

          {/* 5-Step Progress Rail (00 -> 04) */}
          <div className="flex items-center gap-1" title={`Stage ${activeStage}: ${stageLabels[activeStage]}`}>
            {[0, 1, 2, 3, 4].map((sIdx) => (
              <div
                key={sIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  sIdx === activeStage
                    ? 'w-4 bg-[#ff5b1f] shadow-[0_0_8px_#ff5b1f]'
                    : sIdx < activeStage
                    ? 'w-1.5 bg-[#ff5b1f]/50'
                    : 'w-1.5 bg-[#d8dde6]/20'
                }`}
              />
            ))}
          </div>

          <div className="w-[1px] h-3.5 bg-[#d8dde6]/15 mx-1" />

          {/* Status Pill: BUILD #2026 · PASSING */}
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/30 font-mono text-[10px] tracking-mono text-[#4ade80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            <span>BUILD #2026 · PASSING</span>
          </div>
        </nav>

        {/* 3. Right: Live IST Clock + Resume Bundler + HIRE ME Button */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Live Clock with Local-time theme period */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-[#121318]/90 backdrop-blur-md border border-[#d8dde6]/10">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: localTimeTheme?.color || '#ff5b1f' }}
              />
              <span className="font-mono text-[11px] text-[#d8dde6] font-medium tracking-mono">
                {time || '00:00:00'} IST
              </span>
              <span className="text-[#d8dde6]/30 text-[10px]">·</span>
              <span
                className="font-mono text-[10px] font-semibold tracking-mono"
                style={{ color: localTimeTheme?.color || '#ff5b1f' }}
              >
                {localTimeTheme?.period || 'DAY BUILD'}
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-mono text-[#ff5b1f]">
              {stageLabels[activeStage]}
            </span>
          </div>

          {/* Download Resume Bundler Button in Header */}
          <div className="hidden sm:block">
            <ResumeBundlerButton variant="compact" />
          </div>

          {/* Main CTA: White rectangle with ink text + orange arrow */}
          <MagneticButton>
            <a
              href="#contact"
              className="group flex items-center bg-[#d8dde6] hover:bg-white text-[#07070a] font-mono text-[11px] uppercase tracking-mono font-semibold transition-all shadow-sm"
            >
              <span className="px-3.5 py-2">HIRE ME</span>
              <span className="w-7 h-full py-2 flex items-center justify-center bg-[#ff5b1f] text-black group-hover:bg-[#ff723f] transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </MagneticButton>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#121318]/90 border border-[#d8dde6]/15 text-[#d8dde6]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#ff5b1f]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#07070a]/95 backdrop-blur-2xl flex flex-col justify-between p-8 pt-24">
          <div className="flex flex-col gap-6">
            <div className="font-mono text-xs uppercase tracking-mono text-[#ff5b1f]">
              Navigation // Compilation Pipeline
            </div>
            {[
              { href: '#projects', label: '01 WORKS' },
              { href: '#skills', label: '02 ARSENAL' },
              { href: '#experience', label: '03 TRAJECTORY' },
              { href: '#contact', label: '04 CONTACT' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-2xl font-bold tracking-tight text-[#d8dde6] hover:text-[#ff5b1f] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="border-t border-[#d8dde6]/10 pt-6 flex flex-col gap-2 font-mono text-xs text-[#d8dde6]/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              <span>BUILD #2026 · PASSING</span>
            </div>
            <div>STATUS: {availability}</div>
            <div>TIME: {time} IST</div>
          </div>
        </div>
      )}
    </>
  );
};
