import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, GitBranch, Layers } from 'lucide-react';
import type { Project } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';
import { useCompileStore } from '../../store/useCompileStore';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimOverlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topBorderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotReelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const openDeepDive = useCompileStore((state) => state.openDeepDive);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const updateActiveState = (activeIdx: number) => {
        // 1. Update 3D active tower in store without React re-renders
        useCompileStore.getState().setActiveTower(activeIdx);

        // 2. Update progress rail dots: active dot stretches into pill
        dotRefs.current.forEach((dot, dIdx) => {
          if (!dot) return;
          if (dIdx === activeIdx) {
            dot.style.height = '24px';
            dot.style.backgroundColor = '#ff5b1f';
            dot.style.boxShadow = '0 0 12px rgba(255, 91, 31, 0.6)';
          } else {
            dot.style.height = '6px';
            dot.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            dot.style.boxShadow = 'none';
          }
        });

        // 3. Slot-roll count up for active cards
        slotReelRefs.current.forEach((reel, rIdx) => {
          if (!reel) return;
          if (rIdx <= activeIdx) {
            reel.style.transform = 'translateY(-50%)';
          } else {
            reel.style.transform = 'translateY(0%)';
          }
        });
      };

      // Initial active state for card 0
      updateActiveState(0);

      // Card 0 orange top border: grows when entering Works section
      if (topBorderRefs.current[0]) {
        gsap.fromTo(
          topBorderRefs.current[0],
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: slotRefs.current[0],
              start: 'top 80%',
              end: 'top 30%',
              scrub: true,
            },
          }
        );
      }

      // Incoming animations for cards 1..N:
      // incoming card rises with rotateX(8deg) -> 0, translateY(60px) -> 0, growing shadow, and top border 0 -> 100%
      for (let i = 1; i < projects.length; i++) {
        const slot = slotRefs.current[i];
        const inner = cardInnerRefs.current[i];
        const topBorder = topBorderRefs.current[i];
        if (!slot || !inner) continue;

        gsap.fromTo(
          inner,
          {
            rotateX: 8,
            y: 60,
            transformPerspective: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          },
          {
            rotateX: 0,
            y: 0,
            transformPerspective: 1000,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
            ease: 'none',
            scrollTrigger: {
              trigger: slot,
              start: 'top bottom',
              end: 'top center',
              scrub: true,
            },
          }
        );

        if (topBorder) {
          gsap.fromTo(
            topBorder,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: slot,
                start: 'top bottom',
                end: 'top center',
                scrub: true,
              },
            }
          );
        }
      }

      // Outgoing animations for card i when card i+1 slides over it:
      // card N scales 1 -> 0.92, moves up 14px, overlay opacity 0 -> 0.55, content opacity 1 -> 0.4
      for (let i = 0; i < projects.length - 1; i++) {
        const nextSlot = slotRefs.current[i + 1];
        const inner = cardInnerRefs.current[i];
        const dim = dimOverlayRefs.current[i];
        const content = cardContentRefs.current[i];
        if (!nextSlot || !inner) continue;

        gsap.to(inner, {
          scale: 0.92,
          y: -14,
          ease: 'none',
          scrollTrigger: {
            trigger: nextSlot,
            start: 'top bottom-=60',
            end: 'top center',
            scrub: true,
          },
        });

        if (dim) {
          gsap.to(dim, {
            opacity: 0.55,
            ease: 'none',
            scrollTrigger: {
              trigger: nextSlot,
              start: 'top bottom-=60',
              end: 'top center',
              scrub: true,
            },
          });
        }

        if (content) {
          gsap.to(content, {
            opacity: 0.4,
            ease: 'none',
            scrollTrigger: {
              trigger: nextSlot,
              start: 'top bottom-=60',
              end: 'top center',
              scrub: true,
            },
          });
        }
      }

      // Active state trigger for each slot
      projects.forEach((_, idx) => {
        const slot = slotRefs.current[idx];
        if (!slot) return;

        ScrollTrigger.create({
          trigger: slot,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) {
              updateActiveState(idx);
            }
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section id="projects" ref={sectionRef} className="relative py-28 px-4 sm:px-10 max-w-7xl mx-auto z-10">
      {/* Section Eyebrow & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 pb-6 border-b border-[#d8dde6]/10">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-[#ff5b1f] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-pulse" />
            <span>STAGE 01 /// BUILD.TOWERS</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl text-white font-bold tracking-tight">
            <ScatterText>Selected Works.</ScatterText>
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-grotesk text-[#d8dde6]/70 max-w-md leading-relaxed">
          Production full-stack applications, real-time architectures, and modular systems compiled on modern web infrastructure.
        </p>
      </div>

      {/* Cards Almanac: Sticky Stacked-Card Deck Column */}
      <div className="relative w-full max-w-[640px] mr-auto">
        {/* Small vertical progress rail on the right of the stack */}
        <div
          className="hidden md:flex absolute right-[-32px] top-6 bottom-24 w-4 pointer-events-none z-30"
          aria-hidden="true"
        >
          <div className="sticky top-[180px] flex flex-col items-center gap-2 py-2">
            {projects.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className={`w-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? 'h-6 bg-[#ff5b1f] shadow-signal-glow-sm' : 'h-1.5 bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 5 Card Slots: 100vh slots (last 60vh) - each slot is sticky with staggered top offset */}
        {projects.map((project, idx) => {
          const isLast = idx === projects.length - 1;
          const indexFormatted = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={project.id}
              ref={(el) => {
                slotRefs.current[idx] = el;
              }}
              className={`w-full sticky pointer-events-none ${
                isLast ? 'h-[60vh]' : 'h-[100vh]'
              } [@media(prefers-reduced-motion:reduce)]:static [@media(prefers-reduced-motion:reduce)]:h-auto [@media(prefers-reduced-motion:reduce)]:mb-8`}
              style={{
                top: `calc(var(--sticky-base, 76px) + ${idx} * var(--sticky-gap, 10px))`,
                zIndex: idx + 1,
              }}
            >
              {/* Card Inner: Dark Glass, 18px Radius, 1px White/8% Border */}
              <div
                ref={(el) => {
                  cardInnerRefs.current[idx] = el;
                }}
                onClick={() => openDeepDive(project.id)}
                className="relative w-full pointer-events-auto rounded-[18px] bg-[rgba(14,15,20,0.9)] border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md overflow-hidden p-6 sm:p-8 cursor-pointer group will-change-transform"
              >
                  {/* Growing Thin Orange Top Border (0 -> 100% width on activate) */}
                  <div
                    ref={(el) => {
                      topBorderRefs.current[idx] = el;
                    }}
                    className="absolute top-0 left-0 right-0 h-[2px] bg-[#ff5b1f] origin-left pointer-events-none"
                    style={{ transform: idx === 0 ? 'scaleX(1)' : 'scaleX(0)', willChange: 'transform' }}
                  />

                  {/* Darkening Overlay Div (0 -> 0.55 opacity as next card slides over, NOT filter: brightness) */}
                  <div
                    ref={(el) => {
                      dimOverlayRefs.current[idx] = el;
                    }}
                    className="absolute inset-0 rounded-[18px] bg-black pointer-events-none opacity-0 transition-opacity duration-150"
                  />

                  {/* Card Content (fades to 0.4 when covered) */}
                  <div
                    ref={(el) => {
                      cardContentRefs.current[idx] = el;
                    }}
                    className="relative z-10 space-y-4"
                  >
                    {/* Top Row: Index Slot-Roll + Year + Category + Tower Tag */}
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2 font-mono">
                        {/* Vertical Slot-Roll Container */}
                        <div className="h-[28px] overflow-hidden inline-flex flex-col">
                          <div
                            ref={(el) => {
                              slotReelRefs.current[idx] = el;
                            }}
                            className="flex flex-col transition-transform duration-500 ease-out"
                            style={{ transform: idx === 0 ? 'translateY(-50%)' : 'translateY(0%)' }}
                          >
                            <span className="h-[28px] flex items-center text-lg sm:text-xl font-bold text-[#ff5b1f]">
                              0{idx}
                            </span>
                            <span className="h-[28px] flex items-center text-lg sm:text-xl font-bold text-[#ff5b1f]">
                              {indexFormatted}
                            </span>
                          </div>
                        </div>

                        <span className="text-sm font-bold text-white/40">/ 05</span>
                        <span className="text-[11px] uppercase tracking-mono text-[#d8dde6]/40 ml-1.5">
                          /{project.year}
                        </span>
                        <span className="text-[11px] text-[#d8dde6]/20">·</span>
                        <span className="text-[11px] uppercase tracking-mono text-[#d8dde6]/70 truncate max-w-[140px] sm:max-w-none">
                          {project.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[9px] uppercase tracking-mono px-2 py-0.5 bg-[#ff5b1f]/10 text-[#ff5b1f] border border-[#ff5b1f]/20">
                          TOWER_0{idx}
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-mono text-[#ff5b1f] opacity-80 group-hover:opacity-100 transition-opacity">
                          <Layers className="w-2.5 h-2.5" />
                          DEEP DIVE
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-grotesk text-2xl sm:text-3xl font-bold text-white group-hover:text-[#ff5b1f] transition-colors leading-tight mb-1">
                        {project.title}
                      </h3>
                      <div className="font-mono text-xs text-[#ff5b1f]/90 mb-2">
                        {project.subtitle}
                      </div>
                      <p className="font-grotesk text-xs sm:text-sm text-[#d8dde6]/80 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    {project.highlights && (
                      <div className="space-y-1.5 border-l border-[#ff5b1f]/30 pl-3">
                        {project.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="text-[11px] sm:text-xs font-grotesk text-[#d8dde6]/70">
                            • {h}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags & Action Links */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border border-white/[0.08] text-[#d8dde6]/60 uppercase tracking-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121318] border border-white/[0.15] hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] font-mono text-[10px] sm:text-[11px] uppercase tracking-mono transition-all"
                          >
                            <GitBranch className="w-3 h-3 text-[#ff5b1f]" />
                            <span>CODE</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openDeepDive(project.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#ff5b1f] text-black font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-mono hover:bg-white transition-all shadow-sm cursor-pointer"
                        >
                          <span>CASE STUDY</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
    </section>
  );
};

export default Projects;
