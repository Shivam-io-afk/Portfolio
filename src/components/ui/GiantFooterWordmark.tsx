import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const GiantFooterWordmark: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      if (fillRef.current) {
        fillRef.current.style.clipPath = 'inset(0 0% 0 0)';
      }
      return;
    }

    if (!containerRef.current || !fillRef.current) return;

    // As visitor scrolls through the last 100vh of the page, scrub X from 100% -> 0%
    const trigger = ScrollTrigger.create({
      start: () => Math.max(0, ScrollTrigger.maxScroll(window) - window.innerHeight),
      end: () => ScrollTrigger.maxScroll(window),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const x = (1 - self.progress) * 100;
        if (fillRef.current) {
          fillRef.current.style.clipPath = `inset(0 ${x.toFixed(2)}% 0 0)`;
        }
      },
    });

    if (containerRef.current) {
      (containerRef.current as any).__scrollTrigger = trigger;
    }

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label="SHIVAM"
      className="relative w-full overflow-hidden select-none pointer-events-none mt-10 sm:mt-16 h-[18vw] sm:h-[15vw] flex items-start justify-center"
    >
      {/* Base Outlined Layer: Space Grotesk 700 with 1px hairline stroke */}
      <div
        className="font-grotesk font-bold uppercase tracking-tight text-center leading-[0.8] whitespace-nowrap text-[26vw] sm:text-[22vw] w-full"
        style={{
          WebkitTextStroke: '1px rgba(238, 240, 243, 0.18)',
          color: 'transparent',
        }}
        aria-hidden="true"
      >
        SHIVAM
      </div>

      {/* Top Solid Orange Layer: Sweeps left -> right via clip-path */}
      <div
        ref={fillRef}
        className="absolute inset-0 font-grotesk font-bold uppercase tracking-tight text-center leading-[0.8] whitespace-nowrap text-[26vw] sm:text-[22vw] text-[#ff5b1f] w-full will-change-[clip-path]"
        style={{
          clipPath: 'inset(0 100% 0 0)',
          WebkitTextStroke: '0px',
        }}
        aria-hidden="true"
      >
        SHIVAM
      </div>
    </div>
  );
};
