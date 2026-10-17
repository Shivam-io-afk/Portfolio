import React, { useEffect, useState, useRef } from 'react';

interface SplitFlapCounterProps {
  value: number;
  suffix?: string;
  label: string;
  isReducedMotion?: boolean;
}

interface SplitFlapCharProps {
  char: string;
  prevChar: string;
  isDigit: boolean;
  staggerDelayMs: number;
  isReducedMotion: boolean;
}

const SplitFlapChar: React.FC<SplitFlapCharProps> = ({
  char,
  isDigit,
  isReducedMotion,
}) => {
  if (!isDigit || isReducedMotion) {
    return (
      <span className="inline-block text-[#ff5b1f] font-grotesk font-bold select-none leading-none px-0.5">
        {char}
      </span>
    );
  }

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center select-none mx-[1px] sm:mx-[2px]"
      style={{ perspective: '400px' }}
    >
      {/* Flap Box Container */}
      <div className="relative w-[0.62em] h-[1.08em] bg-[#111218] border border-[#d8dde6]/15 rounded-[3px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.5)]">
        {/* Upper Half */}
        <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-[#181922] to-[#12131a] flex items-end justify-center">
          <span
            key={`top-${char}`}
            className="absolute top-0 text-white font-grotesk font-bold leading-none tracking-tight"
            style={{ transform: 'translateY(4%)' }}
          >
            {char}
          </span>
        </div>

        {/* Lower Half */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-b from-[#0f1015] to-[#14151e] flex items-start justify-center border-t border-black/80">
          <span
            key={`bot-${char}`}
            className="absolute bottom-0 text-white font-grotesk font-bold leading-none tracking-tight"
            style={{ transform: 'translateY(-4%)' }}
          >
            {char}
          </span>
        </div>

        {/* Physical Center Flap Slit line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] z-10 pointer-events-none" />

        {/* Edge rivets / notch details */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[3px] bg-black/80 z-20" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-[3px] bg-black/80 z-20" />
      </div>
    </div>
  );
};

export const SplitFlapCounter: React.FC<SplitFlapCounterProps> = ({
  value,
  suffix = '',
  label,
  isReducedMotion = false,
}) => {
  const fullStr = `${value}${suffix}`;
  const prevStrRef = useRef<string>(fullStr);
  const [chars, setChars] = useState<string[]>(fullStr.split(''));

  useEffect(() => {
    setChars(fullStr.split(''));
    prevStrRef.current = fullStr;
  }, [fullStr]);

  // Count total digits for right-to-left stagger calculation
  const digitIndices: number[] = [];
  chars.forEach((c, idx) => {
    if (/\d/.test(c)) digitIndices.push(idx);
  });
  const totalDigits = digitIndices.length;

  return (
    <div className="flex flex-col items-start gap-2">
      <style>{`
        @keyframes splitFlapRoll {
          0% {
            transform: rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: rotateX(-90deg);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Huge Counter Numerals */}
      <div className="flex items-center text-6xl sm:text-8xl md:text-[105px] font-bold tracking-tight text-white font-grotesk leading-none tabular-nums">
        {chars.map((char, index) => {
          const isDigit = /\d/.test(char);
          const digitPos = digitIndices.indexOf(index);
          // Stagger right-to-left: rightmost flips first
          const rightToLeftIndex = digitPos !== -1 ? totalDigits - 1 - digitPos : 0;
          const staggerDelayMs = rightToLeftIndex * 40;

          const prevChars = prevStrRef.current.split('');
          const prevChar = prevChars[index] || char;

          return (
            <SplitFlapChar
              key={`${index}-${char}`}
              char={char}
              prevChar={prevChar}
              isDigit={isDigit}
              staggerDelayMs={staggerDelayMs}
              isReducedMotion={isReducedMotion}
            />
          );
        })}
      </div>

      {/* Counter Descriptor Label Underneath */}
      <div className="flex items-center gap-2 mt-1 pl-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f]" />
        <span className="font-mono text-xs sm:text-sm uppercase tracking-mono text-[#d8dde6]/70">
          {label}
        </span>
      </div>
    </div>
  );
};

