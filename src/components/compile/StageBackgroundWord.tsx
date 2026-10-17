import React, { useEffect, useRef } from 'react';
import { useCompileStore } from '../../store/useCompileStore';

const STAGE_WORDS = [
  'SOURCE',
  'BUILD',
  'NETWORK',
  'RUNTIME',
  'DEPLOY',
] as const;

export const StageBackgroundWord: React.FC = () => {
  const activeStage = useCompileStore((state) => state.activeStage);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animId: number = 0;

    const tick = () => {
      if (containerRef.current) {
        const { scrollProgress } = useCompileStore.getState();
        // Slow subtle vertical parallax offset
        const parallaxY = (scrollProgress - 0.5) * -120;
        containerRef.current.style.transform = `translate3d(0, ${parallaxY}px, 0)`;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const word = STAGE_WORDS[activeStage] || 'SOURCE';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-[1] will-change-transform"
      aria-hidden="true"
    >
      <span
        key={word}
        className="font-mono font-black text-[24vw] leading-none tracking-tighter uppercase text-transparent transition-opacity duration-700 opacity-60"
        style={{
          WebkitTextStroke: '2px rgba(216, 221, 230, 0.06)',
          letterSpacing: '-0.04em',
        }}
      >
        {word}
      </span>
    </div>
  );
};

