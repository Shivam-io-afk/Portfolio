/**
 * DecodeText — "decompile lens" hover effect for headings.
 *
 * Letters near the cursor lift slightly, and the closest ones flip into flickering
 * orange monospace code glyphs (their "source"). As the cursor moves on, they compile
 * back into the real letters. Nothing changes until you hover; no layout shift
 * (the real letters stay in place, the glyphs are an overlay).
 *
 *   <DecodeText as="h2" text="Selected" accent="Works." className="…existing classes…" />
 *
 * - Desktop / fine pointers only. Touch devices and prefers-reduced-motion get plain text.
 * - Runs only while the pointer is over the text (one rAF loop, no React state per frame).
 */
import { useEffect, useRef, type CSSProperties, type ElementType } from 'react';

export type DecodeTextProps = {
  text: string;
  /** italic accent word(s), rendered after `text` */
  accent?: string;
  accentOnNewLine?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** lens radius in px (default 120) */
  radius?: number;
  accentColor?: string;
};

const GLYPHS = '01<>/{}[]=+*#$%&ABCDEFXYZ';

const css = `
.dt{position:relative}
.dt-w{display:inline-block;white-space:nowrap}
.dt-c{position:relative;display:inline-block;transform-origin:50% 85%;will-change:transform}
.dt-r{display:inline-block;transition:opacity .18s ease}
.dt-g{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;pointer-events:none;
  font-family:"JetBrains Mono",ui-monospace,monospace;font-style:normal;font-weight:600;font-size:.62em;letter-spacing:0;
  color:var(--dt-o,#ff5b1f);text-shadow:0 0 14px rgba(255,91,31,.55);transition:opacity .15s ease}
.dt-accent{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;color:var(--dt-o,#ff5b1f)}
.dt-line{position:absolute;left:0;bottom:-.08em;height:2px;width:100%;transform:scaleX(0);transform-origin:0 50%;
  background:linear-gradient(90deg,transparent,var(--dt-o,#ff5b1f),transparent);opacity:.7;pointer-events:none;
  transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.dt.is-hot .dt-line{transform:scaleX(1)}
`;
let injected = false;
const injectCss = () => {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const s = document.createElement('style');
  s.setAttribute('data-decode-text', '');
  s.textContent = css;
  document.head.appendChild(s);
};

export default function DecodeText({
  text,
  accent,
  accentOnNewLine = false,
  as: Tag = 'h2',
  className,
  style,
  radius = 120,
  accentColor = '#ff5b1f',
}: DecodeTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    injectCss();
    const root = ref.current;
    if (!root) return;
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>('.dt-c'));
    const real = chars.map((c) => c.querySelector<HTMLElement>('.dt-r')!);
    const glyph = chars.map((c) => c.querySelector<HTMLElement>('.dt-g')!);
    const n = chars.length;
    const cx = new Float32Array(n);
    const cy = new Float32Array(n);
    const infl = new Float32Array(n); // smoothed influence 0..1
    const lastSwap = new Float32Array(n);
    let px = -1e4;
    let py = -1e4;
    let hovering = false;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const r = root.getBoundingClientRect();
      chars.forEach((c, i) => {
        const b = c.getBoundingClientRect();
        cx[i] = b.left - r.left + b.width / 2;
        cy[i] = b.top - r.top + b.height / 2;
      });
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;
      const r = root.getBoundingClientRect();
      const mx = px - r.left;
      const my = py - r.top;
      const k = 1 - Math.exp(-dt / 70); // easing speed
      let active = false;
      for (let i = 0; i < n; i++) {
        const d = Math.hypot(cx[i] - mx, (cy[i] - my) * 1.4);
        let t = hovering ? Math.max(0, 1 - d / radius) : 0;
        t = t * t * (3 - 2 * t);
        infl[i] += (t - infl[i]) * k;
        const v = infl[i];
        if (v > 0.002) active = true;
        chars[i].style.transform = v > 0.002 ? `translateY(${(-v * 0.09).toFixed(3)}em) scale(${(1 + v * 0.06).toFixed(3)})` : '';
        const decoded = v > 0.55;
        real[i].style.opacity = decoded ? '0' : v > 0.002 ? (1 - v * 0.35).toFixed(2) : '';
        glyph[i].style.opacity = decoded ? '1' : '0';
        if (decoded && now - lastSwap[i] > 55 + (i % 3) * 15) {
          lastSwap[i] = now;
          glyph[i].textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      if (hovering || active) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      hovering = true;
      root.classList.add('is-hot');
      measure();
      px = e.clientX;
      py = e.clientY;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      kick();
    };
    const onLeave = () => {
      hovering = false;
      root.classList.remove('is-hot');
      kick();
    };
    const onScroll = () => {
      if (hovering) measure();
    };

    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [text, accent, radius]);

  const letters = (s: string, keyBase: string) =>
    s.split(' ').map((word, wi, arr) => (
      <span key={`${keyBase}${wi}`}>
        <span className="dt-w">
          {[...word].map((ch, ci) => (
            <span className="dt-c" key={ci}>
              <span className="dt-r">{ch}</span>
              <span className="dt-g" aria-hidden="true">
                {ch}
              </span>
            </span>
          ))}
        </span>
        {wi < arr.length - 1 ? ' ' : ''}
      </span>
    ));

  const full = accent ? `${text} ${accent}` : text;
  return (
    <Tag
      ref={ref}
      className={`dt ${className ?? ''}`}
      style={{ ['--dt-o' as string]: accentColor, ...style }}
      aria-label={full}
    >
      <span aria-hidden="true">
        {letters(text, 't')}
        {accent && (
          <>
            {accentOnNewLine ? <br /> : ' '}
            <span className="dt-accent">{letters(accent, 'a')}</span>
          </>
        )}
      </span>
      <span className="dt-line" aria-hidden="true" />
    </Tag>
  );
}
