import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { ChevronsUp } from 'lucide-react';
import { SPINE_MONTHS } from './roadmapData';

export interface MonthSpineHandle {
  updateProgress: (monthFloat: number, segmentProgress: number) => void;
}

interface MonthSpineProps {
  activeMilestoneIndex: number;
}

const ITEM_HEIGHT = 46; // px per month item on vertical desktop spine
const ITEM_WIDTH_MOBILE = 68; // px per month item on horizontal mobile strip
const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~150.796

export const MonthSpine = forwardRef<MonthSpineHandle, MonthSpineProps>(
  ({ activeMilestoneIndex }, ref) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const mobileTrackRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<SVGCircleElement>(null);
    const passedLineRef = useRef<HTMLDivElement>(null);
    const monthRowsRef = useRef<(HTMLDivElement | null)[]>([]);

    useImperativeHandle(ref, () => ({
      updateProgress: (monthFloat: number, segmentProgress: number) => {
        // 1. Direct GPU transform on desktop spine track (zero React renders!)
        if (trackRef.current) {
          trackRef.current.style.transform = `translateY(calc(50% - ${(monthFloat + 0.5) * ITEM_HEIGHT}px))`;
        }

        // 2. Direct GPU transform on mobile horizontal track
        if (mobileTrackRef.current) {
          mobileTrackRef.current.style.transform = `translateX(calc(50% - ${(monthFloat + 0.5) * ITEM_WIDTH_MOBILE}px))`;
        }

        // 3. Direct strokeDashoffset update on SVG circle
        if (ringRef.current) {
          const clamped = Math.min(Math.max(segmentProgress, 0), 1);
          ringRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - clamped));
        }

        // 4. Update passed line opacity
        if (passedLineRef.current) {
          passedLineRef.current.style.opacity = monthFloat > 0.5 ? '1' : '0.4';
        }

        // 5. Dynamic Month Label Fade: node month 100% white bold, neighbours ~60%, distant fading to 15%
        if (monthRowsRef.current) {
          for (let i = 0; i < SPINE_MONTHS.length; i++) {
            const row = monthRowsRef.current[i];
            if (!row) continue;
            const dist = Math.abs(i - monthFloat);
            if (dist <= 0.5) {
              row.style.opacity = '1.0';
              row.style.color = '#ffffff';
              row.style.fontWeight = '700';
            } else if (dist <= 1.5) {
              const op = Math.max(0.50, 0.65 - (dist - 0.5) * 0.15);
              row.style.opacity = op.toFixed(2);
              row.style.color = '#d8dde6';
              row.style.fontWeight = '500';
            } else {
              const op = Math.max(0.15, 0.45 - (dist - 1.5) * 0.08);
              row.style.opacity = op.toFixed(2);
              row.style.color = '#d8dde6';
              row.style.fontWeight = '400';
            }
          }
        }
      },
    }));

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
            ref={passedLineRef}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-[#ff5b1f]/20 via-[#ff5b1f] to-[#ff5b1f] pointer-events-none z-0 opacity-40 transition-opacity duration-300"
            style={{ height: '50%' }}
          />

          {/* Scrolling Months Spine Track */}
          <div
            ref={trackRef}
            className="absolute left-0 right-0 will-change-transform flex flex-col items-center pointer-events-none"
            style={{
              transform: `translateY(calc(50% - ${0.5 * ITEM_HEIGHT}px))`,
            }}
          >
            {SPINE_MONTHS.map((item, idx) => {
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    monthRowsRef.current[idx] = el;
                  }}
                  className="relative w-full flex items-center justify-center"
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    opacity: idx === 0 ? 1 : 0.15,
                    color: idx === 0 ? '#ffffff' : '#d8dde6',
                    fontWeight: idx === 0 ? '700' : '400',
                  }}
                >
                  {/* Left Side: Month Label & Quarter */}
                  <div className="w-[110px] text-right pr-6 flex flex-col items-end">
                    <span className="font-mono text-xs tracking-mono">
                      {item.label}
                    </span>
                    <span className="font-mono text-[9px] text-[#ff5b1f]/60 tracking-widest uppercase">
                      {item.quarter}
                    </span>
                  </div>

                  {/* Center Tick Mark across 1px spine */}
                  <div className="relative flex items-center justify-center w-6">
                    <div className="h-[1.5px] w-2 bg-[#d8dde6]/25" />
                  </div>

                  {/* Right Side: Index Tag */}
                  <div className="w-[90px] pl-4 text-left">
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/30">
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
              <circle
                cx="28"
                cy="28"
                r={RADIUS}
                stroke="rgba(216, 221, 230, 0.1)"
                strokeWidth="2"
                fill="transparent"
              />
              <circle
                ref={ringRef}
                cx="28"
                cy="28"
                r={RADIUS}
                stroke="#ff5b1f"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-75 ease-out"
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
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#d8dde6]/15 pointer-events-none" />

          <div
            ref={mobileTrackRef}
            className="absolute top-0 bottom-0 flex items-center will-change-transform pointer-events-none"
            style={{
              transform: `translateX(calc(50% - ${0.5 * ITEM_WIDTH_MOBILE}px))`,
            }}
          >
            {SPINE_MONTHS.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center opacity-70"
                style={{ width: `${ITEM_WIDTH_MOBILE}px` }}
              >
                <span className="font-mono text-[10px] tracking-mono text-[#d8dde6]">
                  {item.label}
                </span>
                <div className="w-[1px] mt-1 h-2 bg-[#d8dde6]/30" />
              </div>
            ))}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0b0c10] border border-[#ff5b1f] flex items-center justify-center z-10 shadow-[0_0_14px_rgba(255,91,31,0.5)]">
            <ChevronsUp className="w-3.5 h-3.5 text-[#ff5b1f]" />
          </div>
        </div>
      </div>
    );
  }
);

MonthSpine.displayName = 'MonthSpine';
