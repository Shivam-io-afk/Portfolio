import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
  const shatterCleanupRef = useRef<(() => void) | null>(null);

  const setupHeroShatter = () => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    requestAnimationFrame(() => {
      if (shatterCleanupRef.current) {
        shatterCleanupRef.current();
        shatterCleanupRef.current = null;
      }

      const headingEl = document.querySelector('#hero h1');
      if (!headingEl) return;

      // Get all per-letter character spans from ghost/live layer
      const letterEls = Array.from(headingEl.querySelectorAll<HTMLSpanElement>('[data-gchar]'))
        .filter((el) => el.textContent && el.textContent.trim() !== '');

      if (letterEls.length === 0) return;

      letterEls.forEach((el) => {
        el.style.display = 'inline-block';
        el.style.willChange = 'transform, opacity';
      });

    // "SHIVAM" has 6 chars (0..5), "Mishra." has 7 chars (6..12)
    const shivamLetters = letterEls.slice(0, 6);
    const mishraLetters = letterEls.slice(6);

    const getDistanceFromEdge = (arr: HTMLSpanElement[]) => {
      const len = arr.length;
      return arr.map((el, idx) => {
        const distFromCenter = Math.abs(idx - (len - 1) / 2);
        return { el, distFromCenter };
      });
    };

    // Stagger from outer letters inward (outer letters have higher distFromCenter)
    const allWeighted = [
      ...getDistanceFromEdge(shivamLetters),
      ...getDistanceFromEdge(mishraLetters),
    ].sort((a, b) => b.distFromCenter - a.distFromCenter);

    const tl = gsap.timeline({ paused: true });

    // Target 3D core position on screen (~65% x, 48% y on desktop, 50% x on mobile)
    const targetCoreX = window.innerWidth * (window.innerWidth < 1024 ? 0.5 : 0.65);
    const targetCoreY = window.innerHeight * 0.48;

    allWeighted.forEach(({ el }, rank) => {
      const rect = el.getBoundingClientRect();
      const currentX = rect.left + rect.width / 2;
      const currentY = rect.top + rect.height / 2;
      const dx = targetCoreX - currentX;
      const dy = targetCoreY - currentY;

      // Random curved path (x/y offset ±80px mid-way)
      const midOffsetX = (Math.random() - 0.5) * 160;
      const midOffsetY = (Math.random() - 0.5) * 160;
      const midX = dx * 0.5 + midOffsetX;
      const midY = dy * 0.5 + midOffsetY;

      // Rotate ±90°
      const rot = (Math.random() > 0.5 ? 1 : -1) * (75 + Math.random() * 30);

      tl.to(
        el,
        {
          keyframes: [
            {
              x: midX,
              y: midY,
              rotation: rot * 0.4,
              scale: 0.65,
              opacity: 0.85,
              duration: 0.5,
              ease: 'power1.in',
            },
            {
              x: dx,
              y: dy,
              rotation: rot,
              scale: 0.1,
              opacity: 0,
              duration: 0.5,
              ease: 'power2.in',
            },
          ],
          duration: 1,
        },
        rank * 0.02
      );
    });

    let hasPulsed = false;
    const trigger = ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: '+=60%',
      scrub: 0.6,
      animation: tl,
      onUpdate: (self) => {
        if (self.progress >= 0.8 && !hasPulsed && self.direction > 0) {
          hasPulsed = true;
          try {
            window.dispatchEvent(new CustomEvent('compile-pulse'));
          } catch {}
        } else if (self.progress < 0.7 && hasPulsed) {
          hasPulsed = false;
        }
      },
    });

    shatterCleanupRef.current = () => {
      trigger.kill();
      tl.kill();
      letterEls.forEach((el) => {
        gsap.set(el, { clearProps: 'all' });
      });
    };
    });
  };

  useEffect(() => {
    return () => {
      if (shatterCleanupRef.current) {
        shatterCleanupRef.current();
      }
    };
  }, []);

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
        {/* Left Col: Giant Name & Title (widened to max-w 520px so paragraph doesn't break awkwardly) */}
        <div className="lg:col-span-6 w-full max-w-[520px] space-y-6">
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
            onCompiled={setupHeroShatter}
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
        <div className="hidden lg:block lg:col-span-2 pointer-events-none" aria-hidden="true" />

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
