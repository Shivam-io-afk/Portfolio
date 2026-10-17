import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioData } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { ArrowUpRight } from 'lucide-react';

interface HeroProps {
  data: PortfolioData;
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  const keywords = [
    'MERN Stack Developer',
    'Full-Stack Engineering',
    'React.js & Node.js',
    'REST APIs & MongoDB',
    'Intelligent AI Apps',
    'Interactive 3D & Creative Canvas',
    'Clean Architecture',
    'Rewa, MP, India',
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-24 sm:pt-36 pb-8 sm:pb-12 px-6 sm:px-12 max-w-7xl mx-auto z-10"
    >
      {/* Top Eyebrow / Coordinates */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange animate-pulse" />
          <span>{data.personal.role}</span>
          <span className="text-white/30 hidden sm:inline">///</span>
          <span className="text-white/50 hidden sm:inline">{data.personal.location}</span>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-mono text-kumo-orange">
          <span>SCENE 01 / AUTUMN AVENUE</span>
        </div>
      </div>

      {/* Main Grid: Bottom-Left Headline + Bottom-Right Subtext & Japanese Accent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end my-auto py-4 sm:py-10">
        {/* Left Column: Giant Amarante Headline (~7vw, sentence case, ending in period) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange flex items-center gap-2">
            <span>PORTFOLIO SEED // 2026</span>
          </div>

          <h1 className="font-serif text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            <span className="block">
              <ScatterText>Shivam</ScatterText>
            </span>
            <span className="block text-white/95 sm:pl-12">
              <ScatterText>Mishra.</ScatterText>
            </span>
          </h1>

          {/* Minimal Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-mono text-white/70">
            {data.metrics.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-kumo-orange font-bold text-sm">{m.value}</span>
                <span className="text-[10px] uppercase tracking-mono text-white/50">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Subtext + Japanese Vertical Text + CTAs */}
        <div className="lg:col-span-4 flex flex-row lg:flex-col justify-between items-end gap-6">
          {/* Vertical Japanese Accent */}
          <div className="flex items-start gap-3 order-2 lg:order-1 self-start lg:self-end">
            <div className="writing-v-rl font-jp text-lg sm:text-xl text-white/80 tracking-widest border-r border-white/15 pr-2 py-1 select-none">
              秋の雲流れる
            </div>
            <div className="text-[9px] font-mono tracking-mono uppercase text-white/40 writing-v-rl">
              DRIFTING CLOUDS
            </div>
          </div>

          {/* Subtext Paragraph */}
          <div className="space-y-4 max-w-sm order-1 lg:order-2 bg-kumo-ink/60 backdrop-blur-md p-5 border border-white/10 shadow-soft-card">
            <p className="text-xs sm:text-sm font-sans text-white/85 leading-relaxed font-normal">
              {data.personal.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-kumo-ink font-mono text-[11px] font-semibold tracking-mono uppercase hover:bg-kumo-orange hover:text-white transition-all shadow-md group"
              >
                <span>View Works</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href={data.personal.socials.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-white/20 hover:border-kumo-orange text-white hover:text-kumo-orange font-mono text-[11px] tracking-mono uppercase transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny Mono Infinite Ticker Along Bottom of Hero */}
      <div className="relative border-y border-white/10 py-2.5 overflow-hidden bg-kumo-ink/40 backdrop-blur-sm">
        <div className="flex items-center whitespace-nowrap animate-marquee">
          {Array.from({ length: 4 }).flatMap(() => keywords).map((kw, i) => (
            <span key={i} className="inline-flex items-center mx-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange mr-3 inline-block" />
              {kw}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
