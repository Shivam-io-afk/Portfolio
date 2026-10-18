import React, { useEffect, useRef, useState } from 'react';

interface HeroStatCounterProps {
  value: string;
  label: string;
}

const GLYPHS = '01<>/{}[]=+*#ABCDEFXYZ';

interface FlapDigitProps {
  targetDigit: string;
  trigger: boolean;
  reducedMotion: boolean;
  staggerMs: number;
}

const FlapDigit: React.FC<FlapDigitProps> = ({
  targetDigit,
  trigger,
  reducedMotion,
  staggerMs,
}) => {
  const [displayDigit, setDisplayDigit] = useState(reducedMotion ? targetDigit : '0');
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (reducedMotion || !trigger) return;

    const timeout = setTimeout(() => {
      setIsFlipping(true);
      const targetNum = parseInt(targetDigit, 10);
      let step = 0;
      const totalSteps = 6;
      const interval = setInterval(() => {
        step++;
        if (step >= totalSteps) {
          clearInterval(interval);
          setDisplayDigit(targetDigit);
          setIsFlipping(false);
        } else {
          setDisplayDigit(String(Math.floor(Math.random() * 10)));
        }
      }, 55);

      return () => clearInterval(interval);
    }, staggerMs);

    return () => clearTimeout(timeout);
  }, [trigger, targetDigit, reducedMotion, staggerMs]);

  if (reducedMotion) {
    return <span className="text-[#ff5b1f] font-mono font-bold">{targetDigit}</span>;
  }

  return (
    <span
      className="relative inline-flex flex-col items-center justify-center select-none mx-[1px]"
      style={{ perspective: '300px', display: 'inline-flex' }}
    >
      <span className="relative inline-block w-[0.62em] h-[1.15em] bg-[#12131a] border border-[#d8dde6]/20 rounded-[2px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.6)] align-middle">
        {/* Upper Half */}
        <span className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-[#1a1b24] to-[#12131a] flex items-end justify-center">
          <span
            className={`absolute top-0 text-[#ff5b1f] font-mono font-bold leading-none ${
              isFlipping ? 'animate-split-flap-top' : ''
            }`}
            style={{ transform: 'translateY(12%)' }}
          >
            {displayDigit}
          </span>
        </span>

        {/* Lower Half */}
        <span className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-b from-[#0e0f14] to-[#14151e] flex items-start justify-center border-t border-black/80">
          <span
            className="absolute bottom-0 text-[#ff5b1f] font-mono font-bold leading-none"
            style={{ transform: 'translateY(-12%)' }}
          >
            {displayDigit}
          </span>
        </span>

        {/* Physical Center Flap Slit line */}
        <span className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />
      </span>
    </span>
  );
};

export const HeroStatCounter: React.FC<HeroStatCounterProps> = ({ value, label }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Scramble text state for non-digit characters
  const [scrambleChars, setScrambleChars] = useState<string[]>(value.split(''));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setReducedMotion(true);
      setTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            setTriggered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [triggered]);

  // Handle scramble resolve for text parts (like "MERN", "+ Yrs", " CGPA")
  useEffect(() => {
    if (!triggered || reducedMotion) return;

    const chars = value.split('');
    const nonDigitIndices: number[] = [];
    chars.forEach((c, i) => {
      if (!/\d/.test(c) && c !== ' ') {
        nonDigitIndices.push(i);
      }
    });

    if (nonDigitIndices.length === 0) return;

    // Start with random scrambled characters
    const currentChars = [...chars];
    nonDigitIndices.forEach((idx) => {
      currentChars[idx] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    });
    setScrambleChars([...currentChars]);

    let frame = 0;
    const totalFrames = 15;
    const interval = setInterval(() => {
      frame++;
      const resolvedCount = Math.floor((frame / totalFrames) * nonDigitIndices.length);

      nonDigitIndices.forEach((charIdx, i) => {
        if (i < resolvedCount) {
          currentChars[charIdx] = chars[charIdx];
        } else {
          currentChars[charIdx] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      });

      setScrambleChars([...currentChars]);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setScrambleChars(chars);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [triggered, value, reducedMotion]);

  let digitCount = 0;

  return (
    <div ref={containerRef} className="flex items-baseline gap-2 font-mono">
      <div className="flex items-baseline text-base sm:text-lg font-bold text-[#ff5b1f] tracking-tight">
        {value.split('').map((char, index) => {
          const isDigit = /\d/.test(char);
          if (isDigit) {
            const stagger = digitCount * 80;
            digitCount++;
            return (
              <FlapDigit
                key={index}
                targetDigit={char}
                trigger={triggered}
                reducedMotion={reducedMotion}
                staggerMs={stagger}
              />
            );
          }

          // Non-digit character
          return (
            <span
              key={index}
              className={char === ' ' ? 'inline-block w-1.5' : 'inline-block'}
            >
              {triggered ? scrambleChars[index] || char : char}
            </span>
          );
        })}
      </div>
      <span className="text-[10px] uppercase tracking-mono text-[#d8dde6]/50">
        {label}
      </span>
    </div>
  );
};

