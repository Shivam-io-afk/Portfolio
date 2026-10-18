import React, { useEffect, useRef } from 'react';
import { useCompileStore } from '../../store/useCompileStore';

type CursorMode = 'default' | 'text' | 'open' | 'frame' | 'hero-bit' | 'hidden';

export const CrosshairCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const bitLabelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isVisible = useRef(false);
  const currentMode = useRef<CursorMode>('hidden');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) {
      document.body.classList.remove('has-custom-cursor');
      return;
    }

    let rafId: number;
    let bitTimer = 0;
    let currentBitId = 4021;

    // Cycle random 4-digit bit ID every 300ms ONLY when in hero-bit mode & tab is visible
    const startBitTimer = () => {
      if (bitTimer || document.hidden || currentMode.current !== 'hero-bit') return;
      bitTimer = window.setInterval(() => {
        currentBitId = Math.floor(1000 + Math.random() * 9000);
        if (bitLabelRef.current) {
          bitLabelRef.current.textContent = `BIT #${currentBitId}`;
        }
      }, 300);
    };

    const stopBitTimer = () => {
      if (bitTimer) {
        window.clearInterval(bitTimer);
        bitTimer = 0;
      }
    };

    const setMode = (newMode: CursorMode) => {
      if (currentMode.current === newMode) return;
      currentMode.current = newMode;

      if (!containerRef.current || !circleRef.current || !caretRef.current || !openRef.current || !bitLabelRef.current || !frameRef.current) {
        return;
      }

      if (newMode === 'hidden') {
        containerRef.current.style.opacity = '0';
        return;
      }

      containerRef.current.style.opacity = '1';

      // 1. Circle Outline
      const showCircle = newMode === 'default' || newMode === 'hero-bit';
      circleRef.current.style.opacity = showCircle ? '1' : '0';
      circleRef.current.style.transform = showCircle ? 'scale(1)' : 'scale(0.5)';

      // 2. Caret (|)
      caretRef.current.style.opacity = newMode === 'text' ? '1' : '0';
      caretRef.current.style.transform = newMode === 'text' ? 'scale(1)' : 'scale(0.5)';

      // 3. OPEN 64px disc
      openRef.current.style.opacity = newMode === 'open' ? '1' : '0';
      openRef.current.style.transform = newMode === 'open' ? 'scale(1)' : 'scale(0.4)';

      // 4. Hero Bit Label
      const isHeroBit = newMode === 'hero-bit';
      bitLabelRef.current.style.opacity = isHeroBit ? '1' : '0';
      if (isHeroBit) {
        startBitTimer();
      } else {
        stopBitTimer();
      }

      // 5. Button corner brackets frame
      frameRef.current.style.opacity = newMode === 'frame' ? '1' : '0';
    };

    const handleMouseMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        document.body.classList.add('has-custom-cursor');
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Check if hovering BitDissolve / text hover headings (always text caret)
      const isTextHeading = !!target.closest('.thk-bd, .dt, [data-text-hover-kit], [data-decode-text]');
      if (isTextHeading) {
        setMode('text');
        return;
      }

      // 2. Check if hovering navbar, open case study modal, terminal or overlay
      const isOverNav = !!target.closest('.snav, .snav-sheet, nav, header, [aria-label="Main"]');
      const isOverOverlay = !!target.closest('[data-lenis-prevent], dialog, .terminal-shell, #terminal');
      if (isOverNav || isOverOverlay) {
        setMode('hidden');
        return;
      }

      // 3. Check if hovering button or link (takes precedence over card inner)
      const buttonEl = target.closest('a, button, [role="button"], input[type="submit"]') as HTMLElement | null;
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        if (frameRef.current) {
          const pad = 6;
          frameRef.current.style.width = `${rect.width + pad * 2}px`;
          frameRef.current.style.height = `${rect.height + pad * 2}px`;
          frameRef.current.style.transform = `translate3d(${rect.left - pad}px, ${rect.top - pad}px, 0)`;
        }
        setMode('frame');
        return;
      }

      // 4. Check if hovering project card with data-cursor="open"
      const cardEl = target.closest('[data-cursor="open"]');
      if (cardEl) {
        setMode('open');
        return;
      }

      // 5. Check if hovering text elements
      const isText = !!target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote');
      if (isText) {
        setMode('text');
        return;
      }

      // 5. Check if in Hero stage over 3D canvas / background
      const activeStage = useCompileStore.getState().activeStage;
      if (activeStage === 0) {
        setMode('hero-bit');
        return;
      }

      // 6. Default reticle circle
      setMode('default');
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      stopBitTimer();
      document.body.classList.remove('has-custom-cursor');
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
      }
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
      document.body.classList.add('has-custom-cursor');
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
      }
      if (currentMode.current === 'hero-bit' && !document.hidden) {
        startBitTimer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopBitTimer();
      } else if (currentMode.current === 'hero-bit') {
        startBitTimer();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Restore native cursor for keyboard tabbing
        document.body.classList.remove('has-custom-cursor');
        if (containerRef.current) {
          containerRef.current.style.opacity = '0';
        }
      }
    };

    const loop = () => {
      // Lerp trailing ring with 0.25 factor in rAF
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.25;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.25;

      // 1. Zero-lag 4px orange dot placed directly at pointer
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.current.x - 2}px, ${pos.current.y - 2}px, 0)`;
      }

      // 2. Lerped Reticle Ring Container
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopBitTimer();
      cancelAnimationFrame(rafId);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="context-cursor-system fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none opacity-0 transition-opacity duration-150"
      aria-hidden="true"
    >
      {/* 1. Zero-lag 4px Orange Dot at exact pointer */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1 h-1 rounded-full bg-[#ff5b1f] pointer-events-none shadow-[0_0_8px_#ff5b1f] will-change-transform"
      />

      {/* 2. Lerped Reticle Ring Container (follows with lerp 0.25) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
      >
        {/* State A: Default 26px Circle Thin Outline */}
        <div
          ref={circleRef}
          className="absolute -top-[13px] -left-[13px] w-[26px] h-[26px] rounded-full border border-white/50 pointer-events-none transition-[opacity,transform] duration-200 ease-out"
        />

        {/* State B: Blinking Orange Text Caret (|) */}
        <div
          ref={caretRef}
          className="absolute -top-[11px] -left-[1px] w-[2px] h-[22px] bg-[#ff5b1f] rounded-[1px] pointer-events-none opacity-0 transition-[opacity,transform] duration-200 ease-out shadow-[0_0_8px_#ff5b1f] animate-cursor-caret"
        />

        {/* State C: 64px Filled Orange Disc with 'OPEN ↗' */}
        <div
          ref={openRef}
          className="absolute -top-[32px] -left-[32px] w-[64px] h-[64px] rounded-full bg-[#ff5b1f] shadow-[0_0_24px_rgba(255,91,31,0.65)] pointer-events-none opacity-0 transition-[opacity,transform] duration-200 ease-out flex items-center justify-center"
        >
          <span className="font-mono text-[10px] font-bold tracking-mono text-[#07080a] whitespace-nowrap">
            OPEN ↗
          </span>
        </div>

        {/* State D: Hero Bit Readout Label (underneath circle) */}
        <div
          ref={bitLabelRef}
          className="absolute top-[16px] -left-[28px] px-1.5 py-0.5 rounded-[2px] bg-[#07070a]/90 border border-white/15 font-mono text-[9px] text-[#ff5b1f] tracking-mono whitespace-nowrap pointer-events-none opacity-0 transition-opacity duration-150 shadow-sm"
        >
          BIT #4021
        </div>
      </div>

      {/* 3. Corner Brackets Frame (snaps to button's bounding box +6px padding, animated over 0.2s) */}
      <div
        ref={frameRef}
        className="fixed top-0 left-0 pointer-events-none opacity-0 transition-[transform,width,height,opacity] duration-200 ease-out will-change-[transform,width,height]"
      >
        {/* Top-Left Bracket */}
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-[#ff5b1f]" />
        {/* Top-Right Bracket */}
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] border-[#ff5b1f]" />
        {/* Bottom-Left Bracket */}
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] border-[#ff5b1f]" />
        {/* Bottom-Right Bracket */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-[#ff5b1f]" />
      </div>
    </div>
  );
};

export default CrosshairCursor;
