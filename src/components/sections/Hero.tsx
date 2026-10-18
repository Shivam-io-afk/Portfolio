import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioData } from '../../data/portfolioData';
import { CompileHeading } from '../ui/CompileHeading';
import { CompileLabel } from '../ui/CompileLabel';
import { HeroStatCounter } from '../ui/HeroStatCounter';
import { ArrowUpRight, GitBranch, Terminal } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import { DirectionalButton } from '../ui/DirectionalButton';

interface HeroProps {
  data: PortfolioData;
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-28 sm:pt-36 pb-12 sm:pb-16 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Top Eyebrow: Stage 00 / SOURCE + Build Pipeline tag */}
      <div className="flex items-center justify-between border-b border-[#d8dde6]/10 pb-3">
        <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-[#d8dde6]/80">
          <span className="w-2 h-2 rounded-full bg-[#ff5b1f] shadow-signal-glow-sm animate-pulse shrink-0" />
          <CompileLabel text="STAGE 00 /// SOURCE.INIT" />
          <span className="text-[#d8dde6]/30 hidden sm:inline">///</span>
          <span className="text-[#d8dde6]/50 hidden sm:inline">{data.personal.location}</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50">
          <Terminal className="w-3.5 h-3.5 text-[#ff5b1f]" />
          <span>FIBONACCI SPHERE · 12K BITS</span>
        </div>
      </div>

      {/* Main Hero Body: Headline with Space Grotesk caps + Instrument Serif italic accents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end my-auto py-8 sm:py-16">
        {/* Left Col: Giant Name & Title (max-w 42% / <= 420px to prevent sphere overlap) */}
        <div className="lg:col-span-5 w-full max-w-[420px] lg:max-w-[42%] space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121318]/90 border border-[#ff5b1f]/30 font-mono text-[10px] uppercase tracking-wide text-[#ff5b1f]">
            <span>// ARCHITECTURE ENTRY POINT</span>
          </div>

          <CompileHeading
            as="h1"
            text="SHIVAM"
            accent="Mishra."
            accentOnNewLine
            delay={0.3}
            speed={0.75}
            className="text-[clamp(2.6rem,5.5vw,5.6rem)] leading-[0.94] tracking-tight font-grotesk text-white font-bold block"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-grotesk text-base sm:text-xl text-[#d8dde6]/90 font-light leading-snug"
          >
            MERN Stack Developer & Creative Technologist <span className="text-[#ff5b1f]">crafting</span> high-performance web apps, with AI features integrated through APIs.
          </motion.p>

          {/* Minimal Key Metrics Row with Split-Flap and Scramble Numbers */}
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-[#d8dde6]/10">
            {data.metrics.map((m, idx) => (
              <HeroStatCounter key={idx} value={m.value} label={m.label} />
            ))}
          </div>
        </div>

        {/* Center Space for 3D Fibonacci Sphere */}
        <div className="hidden lg:block lg:col-span-3 pointer-events-none" aria-hidden="true" />

        {/* Right Col: Subtext Glass Card + CTAs (Solid background & high z-index to stay clear of 3D sphere) */}
        <div className="lg:col-span-4 flex flex-col justify-end gap-6 relative z-20">
          <div className="bg-[#0c0d14]/95 border border-[#d8dde6]/15 shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#d8dde6]/10 pb-2">
              <span className="font-mono text-[10px] uppercase tracking-mono text-[#ff5b1f]">
                INIT_MANIFEST.JSON
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            </div>

            <p className="text-xs sm:text-sm font-grotesk text-[#d8dde6]/85 leading-relaxed font-normal">
              {data.personal.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <MagneticButton>
                <DirectionalButton
                  as="a"
                  href="#projects"
                  fillColor="orange"
                  className="border border-[#ff5b1f] bg-white text-[#07070a] font-mono text-[11px] font-bold uppercase tracking-mono shadow-sm"
                >
                  <span className="px-4 py-2.5 flex items-center">VIEW WORKS</span>
                  <span className="p-2.5 bg-[#ff5b1f] text-black flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </DirectionalButton>
              </MagneticButton>

              <MagneticButton>
                <DirectionalButton
                  as="a"
                  href={data.personal.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  fillColor="orange"
                  className="border border-[#d8dde6]/20 bg-[#121318] text-[#d8dde6] font-mono text-[11px] uppercase tracking-mono shadow-sm"
                >
                  <div className="flex items-center gap-2 px-3.5 py-2.5">
                    <GitBranch className="w-3.5 h-3.5 text-[#ff5b1f]" />
                    <span>GITHUB</span>
                  </div>
                </DirectionalButton>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker: Infinite Build Pipeline Log */}
      <div className="border-t border-[#d8dde6]/10 pt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
        <div className="flex items-center gap-3">
          <span className="text-[#ff5b1f]">STATUS:</span>
          <span>COMPILING PORTFOLIO PIPELINE... SCROLL TO ADVANCE</span>
        </div>
        <div className="hidden sm:block">
          <span>STATUS: READY · 12K BITS · WEBGL</span>
        </div>
      </div>
    </section>
  );
};
