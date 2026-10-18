import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, CheckCircle2, ChevronRight, X, ArrowUpRight } from 'lucide-react';
import { MILESTONES, Milestone } from './roadmapData';
import { MonthSpine, MonthSpineHandle } from './MonthSpine';
import { SplitFlapCounter } from './SplitFlapCounter';
import { PixelBloomCanvas } from './PixelBloomCanvas';
import { CompileHeading } from '../ui/CompileHeading';
import { CompileLabel } from '../ui/CompileLabel';
import type { PortfolioData } from '../../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface RoadmapAscentProps {
  certifications?: PortfolioData['certifications'];
  education?: PortfolioData['education'];
  experience?: PortfolioData['experience'];
}

export const RoadmapAscent: React.FC<RoadmapAscentProps> = ({ certifications = [] }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const spineRef = useRef<MonthSpineHandle | null>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeIndexRef = useRef<number>(0);

  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [showCredsModal, setShowCredsModal] = useState<boolean>(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // GSAP ScrollTrigger Pinning Setup with anticipatePin: 0 and standard pinSpacing
  useEffect(() => {
    if (isReducedMotion || !containerRef.current || !pinRef.current) return;

    const totalMilestones = MILESTONES.length;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        pin: pinRef.current,
        start: 'top top',
        end: '+=350%',
        pinSpacing: true,
        anticipatePin: 0,
        scrub: 0.6,
        onUpdate: (self) => {
          const progress = self.progress; // 0 to 1
          const rawIndex = progress * (totalMilestones - 1);
          const baseIndex = Math.min(Math.floor(rawIndex), totalMilestones - 2);
          const localProgress = rawIndex - baseIndex;

          const currM = MILESTONES[baseIndex];
          const nextM = MILESTONES[baseIndex + 1];

          // Dwell + smooth transition between milestones:
          // 0.0 to 0.20: dwell on current milestone's month
          // 0.20 to 0.80: smooth glide to next milestone's month
          // 0.80 to 1.00: dwell on next milestone's month
          const ease = localProgress < 0.2 ? 0 : localProgress > 0.8 ? 1 : (localProgress - 0.2) / 0.6;
          const smoothT = ease * ease * (3 - 2 * ease);

          // Interpolate spine month continuous float
          const monthFloat =
            currM.monthSpineIndex +
            (nextM.monthSpineIndex - currM.monthSpineIndex) * smoothT;

          // Zero-render direct GPU update on spine
          if (spineRef.current) {
            spineRef.current.updateProgress(monthFloat, localProgress);
          }

          // Derive active milestone card: switches at midpoint so card always matches the node month
          const targetIndex = localProgress >= 0.5 ? baseIndex + 1 : baseIndex;
          const closestIndex = Math.min(targetIndex, totalMilestones - 1);

          // ONLY update React state when the milestone index actually changes (8 times total)
          if (closestIndex !== activeIndexRef.current) {
            activeIndexRef.current = closestIndex;
            setActiveIndex(closestIndex);
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isReducedMotion]);

  const activeMilestone: Milestone = MILESTONES[activeIndex] || MILESTONES[0];

  const handleHireMeClick = () => {
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView();
    } else {
      window.location.href = 'mailto:shivam.m28737@gmail.com?subject=Full-Stack%20Role%20Inquiry';
    }
  };

  // ========================================================
  // ACCESSIBILITY FALLBACK: prefers-reduced-motion
  // ========================================================
  if (isReducedMotion) {
    return (
      <section id="experience" className="relative py-24 px-4 sm:px-10 max-w-6xl mx-auto z-10 text-[#d8dde6]">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] shrink-0" />
          <CompileLabel text="STAGE 03 /// ROADMAP.ASCENT" />
        </div>
        <CompileHeading
          as="h2"
          text="Milestone"
          accent="Trajectory (2022–2026)."
          className="font-grotesk text-3xl sm:text-4xl text-white font-bold tracking-tight mb-12"
        />

        <div className="space-y-8 divide-y divide-[#d8dde6]/10">
          {MILESTONES.map((item, idx) => (
            <div key={idx} className="pt-8 first:pt-0">
              <div className="flex items-center gap-3 text-xs font-mono text-[#ff5b1f] mb-2">
                <span>{item.tag}</span>
                <span>•</span>
                <span>{item.monthLabel}</span>
              </div>
              <h3 className="font-grotesk text-2xl font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm font-mono text-[#d8dde6]/60 mb-2">{item.subtitle}</p>
              <p className="text-sm text-[#d8dde6]/80 max-w-xl mb-4 leading-relaxed">{item.description}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-grotesk text-3xl font-bold text-white">
                  {item.counterValue}
                  {item.counterSuffix || ''}
                </span>
                <span className="font-mono text-xs text-[#d8dde6]/60 uppercase">{item.counterLabel}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.chips.map((chip, cIdx) => (
                  <span
                    key={cIdx}
                    className="font-mono text-[10px] uppercase tracking-mono px-2 py-0.5 bg-[#121318] border border-[#d8dde6]/10 text-[#d8dde6]/70"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ========================================================
  // PINNED "ROADMAP ASCENT" SECTION
  // ========================================================
  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative w-full z-10"
    >
      {/* Pinned Fullscreen Viewport Layer */}
      <div
        ref={pinRef}
        className="w-full h-screen overflow-hidden relative flex flex-col justify-between pt-20 sm:pt-24 z-20"
      >
        {/* Subtle Top Header bar inside pinned view */}
        <div className="w-full px-6 sm:px-12 py-3 flex items-center justify-between border-b border-[#d8dde6]/10 z-20 bg-[#07070a]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff5b1f] animate-ping shrink-0" />
              <CompileLabel text="STAGE 03 /// RUNTIME.TRAJECTORY" />
            </div>
            <span className="hidden sm:inline text-[#d8dde6]/20 font-mono">|</span>
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-mono text-[#d8dde6]/60">
              ROADMAP ASCENT [ JUN &apos;22 &rarr; JUN &apos;26 ]
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Verified Credentials modal button */}
            {certifications.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCredsModal(true)}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121318] hover:bg-[#ff5b1f]/10 border border-[#d8dde6]/15 hover:border-[#ff5b1f]/40 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-[#d8dde6]/90 hover:text-[#ff5b1f] transition-all cursor-pointer shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-[#ff5b1f]" />
                <span>Verified Credentials [{certifications.length}]</span>
              </button>
            )}

            {/* Stage Counter Progress */}
            <span className="font-mono text-xs text-white tracking-widest">
              0{activeIndex + 1} <span className="text-[#d8dde6]/30">/ 0{MILESTONES.length}</span>
            </span>
          </div>
        </div>

        {/* Main Ascent Area: Left 35% Spine, Right 65% Milestone Panel */}
        <div className="relative flex-1 w-full flex flex-col md:flex-row overflow-hidden">
          {/* ========================================================
              LEFT COLUMN (35% width desktop): Vertical Month Spine
             ======================================================== */}
          <div className="w-full md:w-[35%] h-auto md:h-full relative shrink-0 z-10 border-b md:border-b-0 md:border-r border-[#d8dde6]/10">
            <MonthSpine
              ref={spineRef}
              activeMilestoneIndex={activeIndex}
            />
          </div>

          {/* ========================================================
              RIGHT COLUMN (65% width desktop): Milestone Panel & 2D Pixel Bloom
             ======================================================== */}
          <div className="relative flex-1 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 z-10 overflow-hidden">
            {/* 2D Canvas Pixel-Bloom Background behind right column */}
            <PixelBloomCanvas
              activeMilestoneIndex={activeIndex}
              className="absolute inset-0 w-full h-full opacity-80 md:opacity-100"
            />

            {/* Glass panel container for crisp text contrast */}
            <div className="relative z-10 max-w-2xl bg-[#0c0d12]/95 p-5 sm:p-7 border border-[#d8dde6]/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              {/* 1. Pill tag with small orange pulsing dot */}
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#151620] border border-[#ff5b1f]/30 rounded-full font-mono text-xs uppercase tracking-mono text-[#ff5b1f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-pulse" />
                  <span>{activeMilestone.tag}</span>
                </div>
                <span className="font-mono text-xs text-[#d8dde6]/40 uppercase tracking-widest">
                  // {activeMilestone.monthLabel}
                </span>
              </div>

              {/* Mask-Up Transition Keyframe Container */}
              <div key={activeIndex} className="animate-roadmap-mask space-y-2">
                {/* 2. Title (Space Grotesk 600, ~44px) */}
                <h3 className="font-grotesk text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
                  {activeMilestone.title}
                </h3>

                {/* Subtitle / Organisation */}
                <p className="font-mono text-xs uppercase tracking-mono text-[#ff5b1f]/90">
                  {activeMilestone.subtitle}
                </p>

                {/* 3. One-line description (muted, 15px) */}
                <p className="font-grotesk text-xs sm:text-sm text-[#d8dde6]/75 leading-relaxed">
                  {activeMilestone.description}
                </p>
              </div>

              {/* 4. HUGE Split-Flap Counter */}
              <div className="my-4 sm:my-5 pt-3 border-t border-[#d8dde6]/10">
                <SplitFlapCounter
                  value={activeMilestone.counterValue}
                  suffix={activeMilestone.counterSuffix}
                  label={activeMilestone.counterLabel}
                  isReducedMotion={isReducedMotion}
                />
              </div>

              {/* 5. Tech / Meta Chips (mono) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeMilestone.chips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-[10px] sm:text-[11px] uppercase tracking-mono px-2 py-0.5 bg-[#121318] border border-[#d8dde6]/15 text-[#d8dde6]/70 hover:border-[#ff5b1f]/40 transition-colors"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* 6. Final milestone HIRE ME button */}
              {activeMilestone.isHireMe && (
                <div className="mt-5 pt-3 border-t border-[#ff5b1f]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-mono text-white/90 block">
                      Immediate Availability
                    </span>
                    <span className="font-grotesk text-xs text-[#d8dde6]/60">
                      Software Engineer / Full-Stack MERN appointments
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleHireMeClick}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff5b1f] hover:bg-[#ff6e36] text-black font-grotesk font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_24px_rgba(255,91,31,0.45)] hover:shadow-[0_0_35px_rgba(255,91,31,0.7)] cursor-pointer"
                  >
                    <span>HIRE ME</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status bar inside pinned container */}
        <div className="w-full px-6 sm:px-12 py-3 flex items-center justify-between border-t border-[#d8dde6]/10 bg-[#07070a]/90 backdrop-blur-sm z-20 shrink-0">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50">
            <span>SCROLL TO ASCEND</span>
            <span className="text-[#ff5b1f]">&darr;</span>
          </div>

          <div className="flex items-center gap-2">
            {MILESTONES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 bg-[#ff5b1f] shadow-[0_0_8px_#ff5b1f]'
                    : i < activeIndex
                    ? 'w-2 bg-[#ff5b1f]/50'
                    : 'w-2 bg-[#d8dde6]/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          VERIFIED CREDENTIALS MODAL DRAWER
         ======================================================== */}
      {showCredsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0c0d14] border border-[#ff5b1f]/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(255,91,31,0.25)]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowCredsModal(false)}
              className="absolute top-4 right-4 text-[#d8dde6]/60 hover:text-white p-1 hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close credentials modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-mono text-[#ff5b1f] mb-2">
              <Award className="w-4 h-4" />
              <span>ACCREDITATION ARCHIVE</span>
            </div>
            <h3 className="font-grotesk text-2xl font-bold text-white mb-6">
              Verified Credentials.
            </h3>

            {/* Certification Cards */}
            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#14151e] border border-[#d8dde6]/10 hover:border-[#ff5b1f]/40 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#ff5b1f] shrink-0" />
                      <h4 className="font-grotesk font-semibold text-white text-base">
                        {cert.title}
                      </h4>
                    </div>
                    <p className="font-mono text-xs text-[#d8dde6]/60 pl-6">
                      {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
                    </p>
                  </div>

                  {cert.verificationUrl && (
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ff5b1f]/10 border border-[#ff5b1f]/30 hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] font-mono text-[10px] uppercase tracking-mono transition-all shrink-0"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="w-3 h-3 text-[#ff5b1f]" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#d8dde6]/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCredsModal(false)}
                className="px-4 py-2 bg-[#121318] hover:bg-white/10 font-mono text-xs uppercase tracking-mono text-[#d8dde6] transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for mask-up swap */}
      <style>{`
        @keyframes roadmapMaskUp {
          0% {
            clip-path: inset(100% 0 0 0);
            transform: translateY(12px);
            opacity: 0;
          }
          100% {
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-roadmap-mask {
          animation: roadmapMaskUp 200ms cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
};
