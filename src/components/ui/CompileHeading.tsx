import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export interface CompileHeadingProps {
  text: string;
  accent?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
  className?: string;
  delay?: number; // in seconds, default 0
  speed?: number; // multiplier, default 1
  accentOnNewLine?: boolean;
  onCompiled?: () => void;
}

interface GhostCharInfo {
  char: string;
  isAccent: boolean;
  isSpace: boolean;
  isNewline: boolean;
  index: number;
}

interface MeasuredChar {
  index: number;
  char: string;
  isAccent: boolean;
  isSpace: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  lineIndex: number;
  compiled: boolean;
  spanEl: HTMLSpanElement | null;
}

interface LineInfo {
  index: number;
  y: number;
  height: number;
  startX: number;
  endX: number;
  chars: MeasuredChar[];
}

const SCRAMBLE_GLYPHS = '01<>/{}[]=+*#ABCDEFXYZ';

export const CompileHeading: React.FC<CompileHeadingProps> = ({
  text,
  accent,
  as: Component = 'h2',
  className = '',
  delay = 0,
  speed = 1,
  accentOnNewLine = false,
  onCompiled,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const ghostRef = useRef<HTMLSpanElement | null>(null);
  const liveRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  // Initialize reducedMotion directly on first render to avoid mounting cursor in reduced motion
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  });

  const isMeasuredRef = useRef(false);
  const hasIntersectedRef = useRef(false);
  const animStartedRef = useRef(false);

  const scrambleIntervalRef = useRef<number | null>(null);
  const measuredCharsRef = useRef<MeasuredChar[]>([]);
  const linesRef = useRef<LineInfo[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Full accessible label
  const fullText = accent
    ? accentOnNewLine
      ? `${text} ${accent}`
      : `${text} ${accent}`
    : text;

  // Build character list
  const charList: GhostCharInfo[] = [];
  let charCounter = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    charList.push({
      char: ch,
      isAccent: false,
      isSpace: ch === ' ',
      isNewline: false,
      index: charCounter++,
    });
  }

  if (accent) {
    if (accentOnNewLine) {
      charList.push({
        char: '\n',
        isAccent: false,
        isSpace: true,
        isNewline: true,
        index: charCounter++,
      });
    } else if (text.length > 0 && !text.endsWith(' ')) {
      charList.push({
        char: ' ',
        isAccent: false,
        isSpace: true,
        isNewline: false,
        index: charCounter++,
      });
    }

    for (let i = 0; i < accent.length; i++) {
      const ch = accent[i];
      charList.push({
        char: ch,
        isAccent: true,
        isSpace: ch === ' ',
        isNewline: false,
        index: charCounter++,
      });
    }
  }

  // Listen for reduced motion change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setReducedMotion(true);
        setIsCompleted(true);
      }
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Character compile action
  const compileChar = (ch: MeasuredChar) => {
    if (ch.compiled || !ch.spanEl) return;
    ch.compiled = true;

    const span = ch.spanEl;
    span.textContent = ch.isSpace ? '\u00A0' : ch.char;
    span.style.fontFamily = ch.isAccent
      ? '"Instrument Serif", serif'
      : '"Space Grotesk", sans-serif';
    span.style.fontStyle = ch.isAccent ? 'italic' : 'normal';
    span.style.letterSpacing = 'normal';
    span.style.lineHeight = 'inherit';

    const finalColor = ch.isAccent ? '#ff5b1f' : '#ffffff';

    // 1-frame white flash (#fff) + overshoot (scale 1.06 -> 1) over 0.18s
    gsap.fromTo(
      span,
      {
        fontSize: '1em',
        scale: 1.06,
        color: '#ffffff',
      },
      {
        scale: 1.0,
        color: finalColor,
        duration: 0.18,
        ease: 'power2.out',
      }
    );
  };

  // Character uncompile action (supports scrubbing backwards)
  const uncompileChar = (ch: MeasuredChar) => {
    if (!ch.compiled || !ch.spanEl) return;
    ch.compiled = false;
    const span = ch.spanEl;
    span.style.fontFamily = '"JetBrains Mono", monospace';
    span.style.fontSize = '0.42em';
    span.style.color = 'rgba(238, 240, 243, 0.28)';
    span.style.letterSpacing = '0.08em';
    span.style.transformOrigin = 'bottom left';
    span.style.fontStyle = 'normal';
    span.style.transform = 'none';
    span.textContent = ch.isSpace
      ? '\u00A0'
      : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
  };

  // Execution: Scramble loop + Cursor Timeline
  const startAnimation = () => {
    if (animStartedRef.current || isCompleted || reducedMotion) return;
    animStartedRef.current = true;

    const lines = linesRef.current;
    const cursor = cursorRef.current;
    if (lines.length === 0 || !cursor) {
      setIsCompleted(true);
      return;
    }

    // 1. Scramble timer every ~60ms on uncompiled characters
    scrambleIntervalRef.current = window.setInterval(() => {
      measuredCharsRef.current.forEach((ch) => {
        if (!ch.compiled && !ch.isSpace && ch.spanEl) {
          if (Math.random() < 0.4) {
            ch.spanEl.textContent = ch.char;
          } else {
            ch.spanEl.textContent =
              SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
          }
        }
      });
    }, 60);

    // 2. Cursor sweep timeline across lines
    const baseDuration = Math.max(0.4, 0.7 / speed);
    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        // Clear scramble loop
        if (scrambleIntervalRef.current) {
          clearInterval(scrambleIntervalRef.current);
          scrambleIntervalRef.current = null;
        }

        // Ensure all remaining chars compiled
        measuredCharsRef.current.forEach((ch) => compileChar(ch));

        // When accent finishes: cursor flashes (opacity 1 -> 0 -> 1 -> 0 over 0.25s) and is removed
        gsap.to(cursor, {
          opacity: 0,
          repeat: 1,
          yoyo: true,
          duration: 0.125,
          ease: 'power1.inOut',
          onComplete: () => {
            if (cursor) {
              cursor.style.display = 'none';
            }
            // Trigger compile-pulse event & onCompiled
            try {
              window.dispatchEvent(new CustomEvent('compile-pulse'));
            } catch {
              // ignore
            }
            onCompiled?.();

            // After completion, replace LIVE layer with plain final text (clean up spans)
            setIsCompleted(true);
          },
        });
      },
    });

    timelineRef.current = tl;
    if (containerRef.current) {
      (containerRef.current as any).__compileTimeline = tl;
    }

    // Distribute duration across lines
    const totalSpanWidth = lines.reduce(
      (sum, l) => sum + Math.max(50, l.endX - l.startX),
      0
    );

    lines.forEach((line) => {
      const lineWidth = Math.max(50, line.endX - line.startX);
      const lineDuration = baseDuration * (lineWidth / totalSpanWidth);

      // Line setup: place cursor at line start
      tl.call(() => {
        cursor.style.top = `${line.y}px`;
        cursor.style.height = `${line.height}px`;
        cursor.style.left = `${line.startX}px`;
        cursor.style.opacity = '1';
      });

      // Cursor sweep from startX to endX + 8px
      const sweepTracker = { x: line.startX };
      tl.to(sweepTracker, {
        x: line.endX + 6,
        duration: lineDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const curX = sweepTracker.x;
          cursor.style.left = `${curX}px`;

          // Compile characters as cursor sweeps past them, or uncompile if scrubbing back
          line.chars.forEach((ch) => {
            if (curX >= ch.x + ch.width * 0.3) {
              if (!ch.compiled) compileChar(ch);
            } else {
              if (ch.compiled) uncompileChar(ch);
            }
          });
        },
      });
    });
  };

  const tryStart = () => {
    if (animStartedRef.current || isCompleted || reducedMotion) return;
    if (isMeasuredRef.current && hasIntersectedRef.current) {
      startAnimation();
    }
  };

  // Measure ghost character positions
  const measure = () => {
    if (!containerRef.current || !ghostRef.current || !liveRef.current) return;
    if (isCompleted || animStartedRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const ghostSpans = ghostRef.current.querySelectorAll<HTMLSpanElement>('[data-gchar]');
    if (ghostSpans.length === 0) return;

    const measured: MeasuredChar[] = [];

    ghostSpans.forEach((span) => {
      const idx = parseInt(span.getAttribute('data-gidx') || '-1', 10);
      if (idx === -1) return;

      const charItem = charList.find((c) => c.index === idx);
      if (!charItem || charItem.isNewline) return;

      const rect = span.getBoundingClientRect();
      measured.push({
        index: idx,
        char: charItem.char,
        isAccent: charItem.isAccent,
        isSpace: charItem.isSpace,
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: Math.max(rect.width, charItem.isSpace ? 8 : 4),
        height: rect.height,
        lineIndex: 0,
        compiled: false,
        spanEl: null,
      });
    });

    if (measured.length === 0) return;

    // Group into lines based on Y coordinate (within 8px tolerance)
    measured.sort((a, b) => (Math.abs(a.y - b.y) > 8 ? a.y - b.y : a.x - b.x));

    const lines: LineInfo[] = [];
    measured.forEach((ch) => {
      let line = lines.find((l) => Math.abs(l.y - ch.y) <= 8);
      if (!line) {
        line = {
          index: lines.length,
          y: ch.y,
          height: ch.height,
          startX: ch.x,
          endX: ch.x + ch.width,
          chars: [],
        };
        lines.push(line);
      } else {
        line.startX = Math.min(line.startX, ch.x);
        line.endX = Math.max(line.endX, ch.x + ch.width);
        line.height = Math.max(line.height, ch.height);
      }
      ch.lineIndex = line.index;
      line.chars.push(ch);
    });

    lines.sort((a, b) => a.y - b.y);
    lines.forEach((line) => line.chars.sort((a, b) => a.x - b.x));

    measuredCharsRef.current = measured;
    linesRef.current = lines;

    // Populate LIVE layer with initial monospace spans
    const liveEl = liveRef.current;
    liveEl.innerHTML = '';

    measured.forEach((item) => {
      const span = document.createElement('span');
      span.setAttribute('data-lidx', String(item.index));
      span.style.position = 'absolute';
      span.style.left = `${item.x}px`;
      span.style.top = `${item.y}px`;
      span.style.width = `${item.width}px`;
      span.style.height = `${item.height}px`;
      span.style.fontFamily = '"JetBrains Mono", monospace';
      span.style.fontSize = '0.42em';
      span.style.color = 'rgba(238, 240, 243, 0.28)';
      span.style.letterSpacing = '0.08em';
      span.style.transformOrigin = 'bottom left';
      span.style.display = 'inline-block';
      span.style.lineHeight = '1';
      span.style.userSelect = 'none';

      if (item.isSpace) {
        span.textContent = '\u00A0';
      } else {
        // Initial random source code glyph (40% real char)
        span.textContent =
          Math.random() < 0.4
            ? item.char
            : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
      }

      liveEl.appendChild(span);
      item.spanEl = span;
    });

    // Initial position cursor at line 0 start
    if (cursorRef.current && lines.length > 0) {
      const firstLine = lines[0];
      cursorRef.current.style.top = `${firstLine.y}px`;
      cursorRef.current.style.height = `${firstLine.height}px`;
      cursorRef.current.style.left = `${firstLine.startX}px`;
      cursorRef.current.style.opacity = '1';
    }

    isMeasuredRef.current = true;
    tryStart();
  };

  // Wait for fonts & measure on mount / resize
  useEffect(() => {
    if (reducedMotion || isCompleted) return;

    let mounted = true;
    const runMeasure = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 200)),
          ]);
        }
      } catch {
        // ignore
      }
      if (!mounted) return;
      measure();
    };

    runMeasure();

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready
        .then(() => {
          if (mounted && !animStartedRef.current && !isCompleted) {
            measure();
          }
        })
        .catch(() => {});
    }

    let resizeTimer: number;
    const onResize = () => {
      if (animStartedRef.current || isCompleted) return;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (mounted) measure();
      }, 150);
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, [reducedMotion, isCompleted]);

  // IntersectionObserver trigger (threshold 0.4)
  useEffect(() => {
    if (reducedMotion || isCompleted || !containerRef.current) return;

    let rafId: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            hasIntersectedRef.current = true;
            observer.disconnect();
            tryStart();
          }
        });
      },
      { threshold: 0.4 }
    );

    // Defer observation by two animation frames to ensure full CSS layout is computed
    rafId = requestAnimationFrame(() => {
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          observer.observe(containerRef.current);
        }
      });
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [reducedMotion, isCompleted]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <Component
      ref={containerRef as any}
      className={`relative inline-block ${className}`}
      aria-label={fullText}
    >
      {/* 
        GHOST layer: reserves exact final dimensions.
        When isCompleted is true, it becomes visible with zero layout shift.
      */}
      <span
        ref={ghostRef}
        className="compile-ghost"
        style={{
          visibility: isCompleted || reducedMotion ? 'visible' : 'hidden',
          display: 'inline-block',
          width: '100%',
        }}
        aria-hidden="true"
      >
        <span className="font-grotesk">
          {charList
            .filter((c) => !c.isAccent && !c.isNewline)
            .map((c) => (
              <span
                key={`gt-${c.index}`}
                data-gchar={c.char}
                data-gidx={c.index}
                className="inline"
              >
                {c.isSpace ? '\u00A0' : c.char}
              </span>
            ))}
        </span>

        {accent && (
          <>
            {accentOnNewLine ? (
              <br />
            ) : (
              <span data-gchar=" " data-gidx={text.length} className="inline">
                {'\u00A0'}
              </span>
            )}
            <span className="italic font-serif text-[#ff5b1f] sm:pl-3 font-normal inline-block">
              {charList
                .filter((c) => c.isAccent)
                .map((c) => (
                  <span
                    key={`ga-${c.index}`}
                    data-gchar={c.char}
                    data-gidx={c.index}
                    className="inline"
                  >
                    {c.isSpace ? '\u00A0' : c.char}
                  </span>
                ))}
            </span>
          </>
        )}
      </span>

      {/* 
        LIVE layer: animated character spans (removed when completed)
      */}
      {!isCompleted && !reducedMotion && (
        <span
          ref={liveRef}
          className="compile-live absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* 
        Orange scanning cursor: 2px bar with glowing box-shadow
      */}
      {!isCompleted && !reducedMotion && (
        <span
          ref={cursorRef}
          className="compile-cursor absolute pointer-events-none z-20"
          style={{
            width: '2px',
            backgroundColor: '#ff5b1f',
            boxShadow: '0 0 12px #ff5b1f',
            top: 0,
            left: 0,
            height: '1.2em',
            opacity: 0,
            transform: 'translateX(-50%)',
            transition: 'top 0.15s ease, height 0.15s ease',
          }}
          aria-hidden="true"
        />
      )}
    </Component>
  );
};
