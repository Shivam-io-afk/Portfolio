import React, { useEffect, useRef, useState } from 'react';

export const CrosshairCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isPointerOverInteractive, setIsPointerOverInteractive] = useState<boolean>(false);
  const [bitId, setBitId] = useState<number>(4021);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) {
      setIsDisabled(true);
      return;
    }
    setIsDisabled(false);

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering link, button or input
      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest('a, button, input, textarea, select, [role="button"]');
      setIsPointerOverInteractive(isInteractive);

      // Compute pseudo-random bit id from screen coordinates
      const calculatedBit = (Math.abs(Math.floor(e.clientX * 7.1 + e.clientY * 13.3)) % 12000) + 1;
      setBitId(calculatedBit);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const loop = () => {
      // Lerp trailing ring
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringPos.current.x + 14}px, ${ringPos.current.y + 14}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (isDisabled || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none">
      {/* 1. Precise Center Crosshair Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-[#ff5b1f] pointer-events-none shadow-[0_0_8px_#ff5b1f]"
        style={{ willChange: 'transform' }}
      />

      {/* 2. Lerped Trailing Reticle Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none border transition-[width,height,margin,border-color,background-color] duration-200 ease-out ${
          isPointerOverInteractive
            ? '-ml-4 -mt-4 w-8 h-8 rounded-full border-[#ff5b1f] bg-[#ff5b1f]/10 backdrop-blur-[1px]'
            : '-ml-3 -mt-3 w-6 h-6 rounded-full border-[#d8dde6]/40 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      >
        {/* Reticle tick marks */}
        {!isPointerOverInteractive && (
          <>
            <span className="absolute top-1/2 -left-1 w-1 h-[1px] bg-[#d8dde6]/60 -translate-y-1/2" />
            <span className="absolute top-1/2 -right-1 w-1 h-[1px] bg-[#d8dde6]/60 -translate-y-1/2" />
            <span className="absolute -top-1 left-1/2 w-[1px] h-1 bg-[#d8dde6]/60 -translate-x-1/2" />
            <span className="absolute -bottom-1 left-1/2 w-[1px] h-1 bg-[#d8dde6]/60 -translate-x-1/2" />
          </>
        )}
      </div>

      {/* 3. Tiny Live Bit Readout */}
      {!isPointerOverInteractive && (
        <div
          ref={labelRef}
          className="fixed top-0 left-0 pointer-events-none px-1.5 py-0.5 rounded-[2px] bg-[#07070a]/85 border border-[#d8dde6]/15 font-mono text-[9px] text-[#ff5b1f] tracking-mono whitespace-nowrap backdrop-blur-sm"
          style={{ willChange: 'transform' }}
        >
          BIT #{bitId}
        </div>
      )}
    </div>
  );
};
