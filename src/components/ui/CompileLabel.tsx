import React, { useEffect, useRef } from 'react';

export interface CompileLabelProps {
  text: string;
  className?: string;
}

export const CompileLabel: React.FC<CompileLabelProps> = ({
  text,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const checkRef = useRef<HTMLSpanElement | null>(null);

  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasAnimatedRef.current) return;

    const pad = (n: number) => String(n).padStart(2, '0');
    const getNowFormatted = () => {
      const now = new Date();
      return `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}] `;
    };

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      hasAnimatedRef.current = true;
      if (timeRef.current) timeRef.current.textContent = getNowFormatted();
      if (textRef.current) textRef.current.textContent = text;
      if (checkRef.current) checkRef.current.textContent = ' ✓';
      if (caretRef.current) caretRef.current.style.display = 'none';
      return;
    }

    let rafId: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            observer.disconnect();

            // Set visitor's local timestamp prefix
            if (timeRef.current) {
              timeRef.current.textContent = getNowFormatted();
            }

            if (caretRef.current) {
              caretRef.current.style.display = 'inline';
            }

            // Type text at 18ms per character driven by requestAnimationFrame (immune to timer throttling)
            const startTime = performance.now();
            const tick = (now: number) => {
              const elapsed = now - startTime;
              const charIndex = Math.min(text.length, Math.floor(elapsed / 18));

              if (textRef.current) {
                textRef.current.textContent = text.slice(0, charIndex);
              }

              if (charIndex < text.length) {
                rafId = requestAnimationFrame(tick);
              } else {
                // Done: remove caret, append green " ✓"
                if (caretRef.current) {
                  caretRef.current.style.display = 'none';
                }
                if (checkRef.current) {
                  checkRef.current.textContent = ' ✓';
                }
              }
            };

            rafId = requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      className={`font-mono text-[11px] uppercase tracking-mono inline-flex items-center ${className}`}
    >
      {/* Timestamp in muted grey */}
      <span ref={timeRef} className="text-[#d8dde6]/40 select-none" />

      {/* Main label text */}
      <span ref={textRef} className="text-[#ff5b1f] font-mono" />

      {/* Block caret while typing */}
      <span
        ref={caretRef}
        className="text-[#ff5b1f] font-mono select-none"
        style={{ display: 'none' }}
      >
        ▍
      </span>

      {/* Completion checkmark in bright signal green */}
      <span
        ref={checkRef}
        className="text-[#4ade80] font-bold select-none font-mono"
      />
    </span>
  );
};
