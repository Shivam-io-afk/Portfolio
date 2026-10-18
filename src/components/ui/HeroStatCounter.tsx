import React, { useEffect, useRef, useState } from 'react';
import { RollNumber } from './TextHoverKit';

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
  isActive: boolean;
}

const FlapDigit: React.FC<FlapDigitProps> = ({
  targetDigit,
  trigger,
  reducedMotion,
  staggerMs,
  isActive,
}) => {
  const [displayDigit, setDisplayDigit] = useState(reducedMotion ? targetDigit : '0');
  const [isFlipping, setIsFlipping] = useState(false);
  const stepRef = useRef(0);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || !trigger || isCompleteRef.current) return;

    let intervalId: any = 0;
    let timeoutId: any = 0;
    const totalSteps = 6;

    const tick = () => {
      if (document.hidden || !isActive) return;
      stepRef.current++;
      if (stepRef.current >= totalSteps) {
        if (intervalId) clearInterval(intervalId);
        intervalId = 0;
        isCompleteRef.current = true;
        setDisplayDigit(targetDigit);
        setIsFlipping(false);
      } else {
        setDisplayDigit(String(Math.floor(Math.random() * 10)));
      }
    };

    if (isActive) {
      if (stepRef.current === 0) {
        timeoutId = setTimeout(() => {
          setIsFlipping(true);
          intervalId = setInterval(tick, 55);
        }, staggerMs);
      } else if (!isCompleteRef.current) {
        setIsFlipping(true);
        intervalId = setInterval(tick, 55);
      }
    }

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [trigger, targetDigit, reducedMotion, staggerMs, isActive]);

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
  const [isInView, setIsInView] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  // Scramble text state for non-digit characters
  const [scrambleChars, setScrambleChars] = useState<string[]>(value.split(''));
  const scrambleCompleteRef = useRef(false);
  const scrambleFrameRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setReducedMotion(true);
      setTriggered(true);
      return;
    }

    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting && !triggered && !document.hidden) {
            setTriggered(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [triggered]);

  const isActive = triggered && isInView && isTabVisible;

  // Handle scramble resolve for text parts (like "MERN", "+ Yrs", " CGPA")
  useEffect(() => {
    if (!triggered || reducedMotion || scrambleCompleteRef.current) return;

    const chars = value.split('');
    const nonDigitIndices: number[] = [];
    chars.forEach((c, i) => {
      if (!/\d/.test(c) && c !== ' ') {
        nonDigitIndices.push(i);
      }
    });

    if (nonDigitIndices.length === 0) return;

    // Start with random scrambled characters if first frame
    if (scrambleFrameRef.current === 0) {
      const currentChars = [...chars];
      nonDigitIndices.forEach((idx) => {
        currentChars[idx] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setScrambleChars([...currentChars]);
    }

    if (!isActive) return;

    const totalFrames = 15;
    const interval = setInterval(() => {
      if (document.hidden || !isInView) return;

      scrambleFrameRef.current++;
      const frame = scrambleFrameRef.current;
      const resolvedCount = Math.floor((frame / totalFrames) * nonDigitIndices.length);

      const currentChars = [...chars];
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
        scrambleCompleteRef.current = true;
        setScrambleChars(chars);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [triggered, value, reducedMotion, isActive, isInView]);

  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (!triggered) return;
    if (reducedMotion) {
      setIsSettled(true);
      return;
    }
    const timer = setTimeout(() => {
      setIsSettled(true);
    }, 750);
    return () => clearTimeout(timer);
  }, [triggered, reducedMotion]);

  // Match numeric stats like "2+ Yrs" -> ["2+", "Yrs"] or "7.0 CGPA" -> ["7.0", "CGPA"]
  const match = value.match(/^([\d.+]+)\s*(.*)$/);

  let digitCount = 0;

  return (
    <div ref={containerRef} className="flex items-baseline gap-2 font-mono group">
      <div className="flex items-baseline text-base sm:text-lg font-bold text-[#ff5b1f] tracking-tight cursor-default">
        {isSettled && match ? (
          <>
            <RollNumber value={match[1]} />
            {match[2] && <span className="ml-1 inline-block">{match[2]}</span>}
          </>
        ) : isSettled && !match ? (
          <span className="inline-block">{value}</span>
        ) : (
          value.split('').map((char, index) => {
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
                  isActive={isActive}
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
          })
        )}
      </div>
      <span className="text-[10px] uppercase tracking-mono text-[#d8dde6]/50">
        {label}
      </span>
    </div>
  );
};

