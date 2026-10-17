import React from 'react';
import { ChevronsUp } from 'lucide-react';
import { SPINE_MONTHS } from './roadmapData';

interface MonthSpineProps {
  currentMonthFloat: number; // 0 to 48 (continuous)
  milestoneSegmentProgress: number; // 0 to 1 progress within current milestone segment
  activeMilestoneIndex: number;
}

const ITEM_HEIGHT = 46; // px per month item on vertical desktop spine
const ITEM_WIDTH_MOBILE = 68; // px per month item on horizontal mobile strip

export const MonthSpine: React.FC<MonthSpineProps> = ({
  currentMonthFloat,
  milestoneSegmentProgress,
}) => {
  // SVG circle circumference for 56px node (r = 24)
  const radius = 24;
  const circumference = 2 * Math.PI * radius; // ~150.796
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(milestoneSegmentProgress, 0), 1));

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* ========================================================
          DESKTOP VERTICAL SPINE (Hidden on mobile < md)
         ======================================================== */}
      <div className="hidden md:flex relative w-full h-full items-center justify-center">
        {/* Continuous 1px Vertical Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#d8dde6]/10 pointer-events-none" />

        {/* Dynamic Highlighted Progress Line (passed portion) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-[#ff5b1f]/20 via-[#ff5b1f] to-[#ff5b1f] pointer-events-none z-0"
          style={{
            height: '50%',
            opacity: currentMonthFloat > 0.5 ? 1 : 0.4,
          }}
        />

        {/* Scrolling Months Spine Track */}
        <div
          className="absolute left-0 right-0 will-change-transform flex flex-col items-center pointer-events-none"
          style={{
            transform: `translateY(calc(50% - ${(currentMonthFloat + 0.5) * ITEM_HEIGHT}px))`,
          }}
        >
          {SPINE_MONTHS.map((item, idx) => {
            const dist = Math.abs(idx - currentMonthFloat);
            const isPassed = idx <= Math.floor(currentMonthFloat);

            // Opacity calculation based on user requirements:
            // - Month at node: 1.0 (white & bold)
            // - Neighbors: ~0.60
            // - Rest fade to 0.15 with distance
            let opacity = 0.15;
            let scale = 1.0;
            let isCurrent = false;

            if (dist < 0.6) {
              opacity = 1.0;
              scale = 1.08;
              isCurrent = true;
            } else if (dist < 1.6) {
              opacity = 0.6;
              scale = 1.0;
            } else if (dist < 3.2) {
              opacity = 0.35;
            }

            return (
              <div
                key={idx}
                className="relative w-full flex items-center justify-center transition-opacity duration-150"
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                {/* Left Side: Month Label & Quarter */}
                <div className="w-[110px] text-right pr-6 flex flex-col items-end">
                  <span
                    className={`font-mono text-xs tracking-mono transition-colors ${
                      isCurrent
                        ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                        : isPassed
                        ? 'text-[#ff5b1f]/90'
                        : 'text-[#d8dde6]/60'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isCurrent && (
                    <span className="font-mono text-[9px] text-[#ff5b1f] tracking-widest uppercase">
                      {item.quarter}
                    </span>
                  )}
                </div>

                {/* Center Tick Mark across 1px spine */}
                <div className="relative flex items-center justify-center w-6">
                  <div
                    className={`h-[1.5px] transition-all duration-200 ${
                      isCurrent
                        ? 'w-4 bg-[#ff5b1f] shadow-[0_0_8px_#ff5b1f]'
                        : isPassed
                        ? 'w-2.5 bg-[#ff5b1f]/80'
                        : 'w-2 bg-[#d8dde6]/25'
                    }`}
                  />
                </div>

                {/* Right Side: Index Tag */}
                <div className="w-[90px] pl-4 text-left">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-mono ${
                      isCurrent
                        ? 'text-[#ff5b1f] font-semibold'
                        : isPassed
                        ? 'text-[#ff5b1f]/40'
                        : 'text-[#d8dde6]/20'
                    }`}
                  >
                    M·{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            FIXED CENTER NODE (56px dark circle, progress ring, chevrons)
           ======================================================== */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#0b0c10] border border-[#ff5b1f]/40 flex items-center justify-center z-20 shadow-[0_0_28px_rgba(255,91,31,0.42),inset_0_0_14px_rgba(255,91,31,0.18)]"
          aria-hidden="true"
        >
          {/* Thin Orange SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            {/* Background Track */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="rgba(216, 221, 230, 0.1)"
              strokeWidth="2"
              fill="transparent"
            />
            {/* Animated Progress Stroke */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="#ff5b1f"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-100 ease-out"
            />
          </svg>

          {/* Double Chevron Rotated Up */}
          <div className="relative flex items-center justify-center text-[#ff5b1f] animate-pulse">
            <ChevronsUp className="w-5 h-5 drop-shadow-[0_0_6px_rgba(255,91,31,0.8)]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE HORIZONTAL STRIP (Visible on mobile < md)
         ======================================================== */}
      <div className="md:hidden relative w-full h-16 flex items-center justify-center border-b border-[#d8dde6]/10 bg-[#07070a]/90 backdrop-blur-md">
        {/* Horizontal Spine Track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#d8dde6]/15 pointer-events-none" />

        <div
          className="absolute top-0 bottom-0 flex items-center will-change-transform pointer-events-none"
          style={{
            transform: `translateX(calc(50% - ${(currentMonthFloat + 0.5) * ITEM_WIDTH_MOBILE}px))`,
          }}
        >
          {SPINE_MONTHS.map((item, idx) => {
            const dist = Math.abs(idx - currentMonthFloat);
            const isPassed = idx <= Math.floor(currentMonthFloat);
            const isCurrent = dist < 0.6;
            const opacity = isCurrent ? 1 : dist < 1.6 ? 0.6 : 0.2;

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center transition-opacity"
                style={{
                  width: `${ITEM_WIDTH_MOBILE}px`,
                  opacity,
                }}
              >
                <span
                  className={`font-mono text-[10px] tracking-mono ${
                    isCurrent ? 'text-white font-bold' : isPassed ? 'text-[#ff5b1f]' : 'text-[#d8dde6]/50'
                  }`}
                >
                  {item.label}
                </span>
                <div
                  className={`w-[1px] mt-1 ${
                    isCurrent ? 'h-3 bg-[#ff5b1f]' : 'h-1.5 bg-[#d8dde6]/30'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Mobile Center Node Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0b0c10] border border-[#ff5b1f] flex items-center justify-center z-10 shadow-[0_0_14px_rgba(255,91,31,0.5)]">
          <ChevronsUp className="w-3.5 h-3.5 text-[#ff5b1f]" />
        </div>
      </div>
    </div>
  );
};

