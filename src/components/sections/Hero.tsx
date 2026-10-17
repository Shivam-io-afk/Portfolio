import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioData } from '../../data/portfolioData';
import { ScrambleText } from '../ui/ScrambleText';
import { ArrowUpRight, GitBranch, Terminal } from 'lucide-react';

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
          <span className="w-2 h-2 rounded-full bg-[#ff5b1f] shadow-signal-glow-sm animate-pulse" />
          <span className="text-white font-semibold">STAGE 00</span>
          <span className="text-[#d8dde6]/30">///</span>
          <span className="text-[#ff5b1f] font-mono">SOURCE.INIT</span>
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
        {/* Left Col: Giant Name & Title (max-w 45% / 5 cols) */}
        <div className="lg:col-span-5 max-w-[480px] xl:max-w-[520px] space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121318]/90 border border-[#ff5b1f]/30 font-mono text-[10px] uppercase tracking-wide text-[#ff5b1f]">
            <span>// ARCHITECTURE ENTRY POINT</span>
          </div>

          <h1 className="text-[clamp(2.6rem,5.5vw,5.6rem)] leading-[0.94] tracking-tight font-grotesk text-white">
            <span className="block uppercase font-bold text-[#d8dde6]">
              <ScrambleText text="SHIVAM" />
            </span>
            <span className="block italic font-serif text-[#ff5b1f] sm:pl-4 text-[1.05em] font-normal tracking-normal">
              Mishra.
            </span>
          </h1>

          <p className="font-grotesk text-base sm:text-xl text-[#d8dde6]/90 font-light leading-snug">
            MERN Stack Developer & Creative Technologist <span className="text-[#ff5b1f]">crafting</span> high-performance web apps, with AI features integrated through APIs.
          </p>

          {/* Minimal Key Metrics Row */}
          <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-[#d8dde6]/10">
            {data.metrics.map((m, idx) => (
              <div key={idx} className="flex items-baseline gap-2 font-mono">
                <span className="text-[#ff5b1f] font-bold text-base sm:text-lg">{m.value}</span>
                <span className="text-[10px] uppercase tracking-mono text-[#d8dde6]/50">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Space for 3D Fibonacci Sphere */}
        <div className="hidden lg:block lg:col-span-3 pointer-events-none" aria-hidden="true" />

        {/* Right Col: Subtext Glass Card + CTAs (Solid background & high z-index to stay clear of 3D sphere) */}
        <div className="lg:col-span-4 flex flex-col justify-end gap-6 relative z-20">
          <div className="bg-[#0c0d14]/95 border border-[#d8dde6]/15 shadow-[0_16px_48px_rgba(0,0,0,0.85)] p-6 space-y-5 backdrop-blur-md">
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
              <a
                href="#projects"
                className="group flex items-center bg-white hover:bg-[#d8dde6] text-[#07070a] font-mono text-[11px] font-bold uppercase tracking-mono transition-all shadow-sm"
              >
                <span className="px-4 py-2.5">VIEW WORKS</span>
                <span className="p-2.5 bg-[#ff5b1f] text-black group-hover:bg-[#ff723f] transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>

              <a
                href={data.personal.socials.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 border border-[#d8dde6]/20 bg-[#121318] text-[#d8dde6] font-mono text-[11px] uppercase tracking-mono hover:border-[#ff5b1f] hover:text-[#ff5b1f] transition-all"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#ff5b1f]" />
                <span>GITHUB</span>
              </a>
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
          <span>LATENCY: 0.14ms · 60 FPS · GL_INSTANCING</span>
        </div>
      </div>
    </section>
  );
};
