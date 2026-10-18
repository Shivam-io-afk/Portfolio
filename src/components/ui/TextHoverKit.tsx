/**
 * TextHoverKit — hover effects for text, built for the COMPILE portfolio.
 *
 *   <BitDissolve as="h2" text="Selected" accent="Works." />    letters near the cursor break into tiny bits that drift away, then snap back
 *   <WordmarkSpotlight text="SHIVAM" />                         giant outlined footer word; the cursor is a spotlight showing it filled in orange
 *   <BracketLink href="…">GitHub</BracketLink>                  [ brackets ] slide in around the text, text turns orange
 *   <TypeSwap text="STAGE 02 /// NETWORK" alt="24 skills · 17 repos" />   label backspaces and retypes a fact on hover
 *   <RollNumber value="7.0" />                                  digits roll once like a split-flap board on hover
 *
 * All effects: desktop / fine pointers only, nothing runs until hovered, no layout shift,
 * prefers-reduced-motion → plain text. No dependencies.
 */
import { useEffect, useRef, useState, type AnchorHTMLAttributes, type CSSProperties, type ElementType, type ReactNode } from 'react';

const O = '#ff5b1f';

const css = `
.thk-bd{position:relative}
.thk-bd-w{display:inline-block;white-space:nowrap}
.thk-bd-c{display:inline-block}
.thk-bd-accent{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;color:var(--thk-o,${O})}
.thk-bd canvas{position:absolute;pointer-events:none}

.thk-wm{position:relative;display:block;width:100%;overflow:hidden;line-height:.8;user-select:none;
  font-family:"Space Grotesk",Inter,system-ui,sans-serif;font-weight:700;letter-spacing:-.04em;font-size:var(--thk-wm-size,22vw)}
.thk-wm span{display:block;white-space:nowrap;text-align:center}
.thk-wm-out{color:transparent;-webkit-text-stroke:1px rgba(238,240,243,.2)}
.thk-wm-fill{position:absolute;inset:0;color:var(--thk-o,${O});
  clip-path:circle(var(--r,0px) at var(--x,50%) var(--y,50%));-webkit-clip-path:circle(var(--r,0px) at var(--x,50%) var(--y,50%));
  text-shadow:0 0 40px rgba(255,91,31,.35)}

.thk-bl{position:relative;display:inline-flex;align-items:center;gap:0;color:inherit;text-decoration:none;transition:color .25s}
.thk-bl::before,.thk-bl::after{font-family:"JetBrains Mono",ui-monospace,monospace;color:var(--thk-o,${O});opacity:0;
  transition:opacity .2s,transform .3s cubic-bezier(.2,.8,.2,1)}
.thk-bl::before{content:"[";margin-right:.35em;transform:translateX(.6em)}
.thk-bl::after{content:"]";margin-left:.35em;transform:translateX(-.6em)}
.thk-bl:hover,.thk-bl:focus-visible{color:var(--thk-o,${O})}
.thk-bl:hover::before,.thk-bl:hover::after,.thk-bl:focus-visible::before,.thk-bl:focus-visible::after{opacity:1;transform:none}

.thk-ts{display:inline-block;white-space:pre;font-variant-ligatures:none}
.thk-ts-caret{display:inline-block;width:.55em;margin-left:1px;color:var(--thk-o,${O});opacity:0}
.thk-ts.is-typing .thk-ts-caret{opacity:1;animation:thkBlink .7s steps(1) infinite}

.thk-rn{display:inline-flex;align-items:flex-end;font-variant-numeric:tabular-nums}
.thk-rn-d{display:inline-block;height:1em;line-height:1;overflow:hidden;vertical-align:bottom}
.thk-rn-col{display:flex;flex-direction:column;transform:translateY(calc(var(--i) * -1em))}
.thk-rn-col span{height:1em;line-height:1}
.thk-rn.is-rolling .thk-rn-col{transition:transform .9s cubic-bezier(.16,1,.3,1);transition-delay:var(--dl)}

@keyframes thkBlink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.thk-bl::before,.thk-bl::after{transition:none}.thk-rn.is-rolling .thk-rn-col{transition:none}}
`;
let injected = false;
function useKitCss() {
  useEffect(() => {
    if (injected || typeof document === 'undefined') return;
    injected = true;
    const s = document.createElement('style');
    s.setAttribute('data-text-hover-kit', '');
    s.textContent = css;
    document.head.appendChild(s);
  }, []);
}
const canHover = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ═════════════════════════ 1. BitDissolve ═════════════════════════ */

export type BitDissolveProps = {
  text: string;
  accent?: string;
  accentOnNewLine?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** influence radius in px (default 130) */
  radius?: number;
  /** size of one bit in CSS px (default 3) */
  bit?: number;
};

type Particle = { x: number; y: number; r: number; rnd: number };
type Glyph = { el: HTMLElement; cx: number; cy: number; parts: Particle[]; color: string; infl: number };

export function BitDissolve({
  text,
  accent,
  accentOnNewLine = false,
  as: Tag = 'h2',
  className,
  style,
  radius = 130,
  bit = 3,
}: BitDissolveProps) {
  useKitCss();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !canHover()) return;
    const PAD = 60;
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    root.appendChild(cv);
    const ctx = cv.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let glyphs: Glyph[] = [];
    let built = false;
    let hovering = false;
    let raf = 0;
    let last = 0;
    let mx = -1e4;
    let my = -1e4;

    const build = () => {
      const r = root.getBoundingClientRect();
      cv.style.left = `${-PAD}px`;
      cv.style.top = `${-PAD}px`;
      cv.style.width = `${r.width + PAD * 2}px`;
      cv.style.height = `${r.height + PAD * 2}px`;
      cv.width = Math.round((r.width + PAD * 2) * dpr);
      cv.height = Math.round((r.height + PAD * 2) * dpr);
      const off = document.createElement('canvas');
      const octx = off.getContext('2d', { willReadFrequently: true })!;
      glyphs = Array.from(root.querySelectorAll<HTMLElement>('.thk-bd-c')).map((el) => {
        const b = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const w = Math.ceil(b.width) + 4;
        const h = Math.ceil(b.height) + 4;
        off.width = w;
        off.height = h;
        octx.clearRect(0, 0, w, h);
        octx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        octx.fillStyle = '#fff';
        octx.textBaseline = 'alphabetic';
        const m = octx.measureText(el.textContent || '');
        const asc = m.fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8;
        const desc = m.fontBoundingBoxDescent ?? parseFloat(cs.fontSize) * 0.2;
        const base = 2 + (b.height - (asc + desc)) / 2 + asc;
        octx.fillText(el.textContent || '', 2, base);
        const data = octx.getImageData(0, 0, w, h).data;
        const parts: Particle[] = [];
        for (let y = 0; y < h; y += bit) {
          for (let x = 0; x < w; x += bit) {
            if (data[(y * w + x) * 4 + 3] > 110) {
              parts.push({ x: b.left - r.left + x - 2 + PAD, y: b.top - r.top + y - 2 + PAD, r: Math.random(), rnd: Math.random() });
            }
          }
        }
        return { el, cx: b.left - r.left + b.width / 2 + PAD, cy: b.top - r.top + b.height / 2 + PAD, parts, color: cs.color, infl: 0 };
      });
      built = true;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(64, now - (last || now));
      last = now;
      const k = 1 - Math.exp(-dt / 90);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      let active = false;
      const t = now / 1000;
      for (const g of glyphs) {
        const d = Math.hypot(g.cx - mx, (g.cy - my) * 1.3);
        let target = hovering ? Math.max(0, 1 - d / radius) : 0;
        target = target * target * (3 - 2 * target);
        g.infl += (target - g.infl) * k;
        const v = g.infl;
        if (v < 0.01) {
          g.el.style.opacity = '';
          continue;
        }
        active = true;
        const show = Math.min(1, (v - 0.01) / 0.18); // crossfade real letter → bits
        g.el.style.opacity = String(1 - show);
        ctx.globalAlpha = show;
        ctx.fillStyle = g.color;
        for (const p of g.parts) {
          let dx = p.x - mx;
          let dy = p.y - my;
          const len = Math.hypot(dx, dy) || 1;
          dx /= len;
          dy /= len;
          const push = v * v * (14 + p.r * 34);
          const wob = v * 2.2 * Math.sin(t * 6 + p.rnd * 40);
          const sz = bit * (1 - v * 0.35 * p.rnd);
          ctx.fillRect(p.x + dx * push + wob, p.y + dy * push - wob * 0.6, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
      if (hovering || active) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const toLocal = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      mx = e.clientX - r.left + PAD;
      my = e.clientY - r.top + PAD;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      hovering = true;
      if (!built) build();
      toLocal(e);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      toLocal(e);
      kick();
    };
    const onLeave = () => {
      hovering = false;
      kick();
    };
    const rebuild = () => {
      built = false;
    };
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', rebuild);
    document.fonts?.ready.then(rebuild);
    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', rebuild);
      if (raf) cancelAnimationFrame(raf);
      cv.remove();
      glyphs.forEach((g) => (g.el.style.opacity = ''));
    };
  }, [text, accent, radius, bit]);

  const letters = (s: string, kb: string) =>
    s.split(' ').map((w, wi, arr) => (
      <span key={kb + wi}>
        <span className="thk-bd-w">
          {[...w].map((ch, ci) => (
            <span className="thk-bd-c" key={ci}>
              {ch}
            </span>
          ))}
        </span>
        {wi < arr.length - 1 ? ' ' : ''}
      </span>
    ));
  const full = accent ? `${text} ${accent}` : text;
  return (
    <Tag ref={ref} className={`thk-bd ${className ?? ''}`} style={style} aria-label={full}>
      <span aria-hidden="true">
        {letters(text, 't')}
        {accent && (
          <>
            {accentOnNewLine ? <br /> : ' '}
            <span className="thk-bd-accent">{letters(accent, 'a')}</span>
          </>
        )}
      </span>
    </Tag>
  );
}

/* ═════════════════════════ 2. WordmarkSpotlight ═════════════════════════ */

export type WordmarkSpotlightProps = {
  text?: string;
  /** spotlight radius in px (default 190) */
  radius?: number;
  /** CSS font-size (default 22vw) */
  size?: string;
  className?: string;
  style?: CSSProperties;
};

export function WordmarkSpotlight({ text = 'SHIVAM', radius = 190, size = '22vw', className, style }: WordmarkSpotlightProps) {
  useKitCss();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover()) return;
    let raf = 0;
    let cur = 0;
    let target = 0;
    let x = 0;
    let y = 0;
    const tick = () => {
      raf = 0;
      cur += (target - cur) * 0.16;
      el.style.setProperty('--r', `${cur.toFixed(1)}px`);
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
      if (Math.abs(target - cur) > 0.5) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const pos = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = Math.round(e.clientX - r.left);
      y = Math.round(e.clientY - r.top);
    };
    const onEnter = (e: PointerEvent) => {
      pos(e);
      target = radius;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      pos(e);
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
    };
    const onLeave = () => {
      target = 0;
      kick();
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [radius]);
  return (
    <div
      ref={ref}
      className={`thk-wm ${className ?? ''}`}
      style={{ ['--thk-wm-size' as string]: size, ...style }}
      role="img"
      aria-label={text}
    >
      <span className="thk-wm-out" aria-hidden="true">
        {text}
      </span>
      <span className="thk-wm-fill" aria-hidden="true">
        {text}
      </span>
    </div>
  );
}

/* ═════════════════════════ 3. BracketLink ═════════════════════════ */

export function BracketLink({ children, className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  useKitCss();
  return (
    <a className={`thk-bl ${className ?? ''}`} {...rest}>
      {children}
    </a>
  );
}

/* ═════════════════════════ 4. TypeSwap ═════════════════════════ */

export type TypeSwapProps = {
  text: string;
  /** what to type on hover */
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** ms per character (default 22) */
  speed?: number;
};

export function TypeSwap({ text, alt, className, style, speed = 22 }: TypeSwapProps) {
  useKitCss();
  const box = useRef<HTMLSpanElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = box.current;
    const o = out.current;
    if (!el || !o) return;
    // reserve the wider of the two strings so nothing around it moves
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    el.appendChild(probe);
    probe.textContent = text;
    const w1 = probe.getBoundingClientRect().width;
    probe.textContent = alt;
    const w2 = probe.getBoundingClientRect().width;
    probe.remove();
    el.style.minWidth = `${Math.ceil(Math.max(w1, w2)) + 8}px`;
    if (!canHover()) return;

    let timer = 0;
    let shown = text;
    const run = (to: string) => {
      window.clearTimeout(timer);
      el.classList.add('is-typing');
      const step = () => {
        if (!to.startsWith(shown)) {
          shown = shown.slice(0, -1); // backspace until it matches the target's start
          o.textContent = shown;
          timer = window.setTimeout(step, speed * 0.6);
        } else if (shown.length < to.length) {
          shown = to.slice(0, shown.length + 1);
          o.textContent = shown;
          timer = window.setTimeout(step, speed);
        } else {
          el.classList.remove('is-typing');
        }
      };
      step();
    };
    const host = (el.closest('a,button') as HTMLElement) ?? el;
    const enter = () => run(alt);
    const leave = () => run(text);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    host.addEventListener('focus', enter);
    host.addEventListener('blur', leave);
    return () => {
      window.clearTimeout(timer);
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
      host.removeEventListener('focus', enter);
      host.removeEventListener('blur', leave);
      o.textContent = text;
    };
  }, [text, alt, speed]);
  return (
    <span ref={box} className={`thk-ts ${className ?? ''}`} style={style} aria-label={text} title={alt}>
      <span ref={out} aria-hidden="true">
        {text}
      </span>
      <span className="thk-ts-caret" aria-hidden="true">
        ▍
      </span>
    </span>
  );
}

/* ═════════════════════════ 5. RollNumber ═════════════════════════ */

export type RollNumberProps = {
  value: string | number;
  className?: string;
  style?: CSSProperties;
};

export function RollNumber({ value, className, style }: RollNumberProps) {
  useKitCss();
  const ref = useRef<HTMLSpanElement>(null);
  const [turn, setTurn] = useState(0); // 0 = at rest, 1 = rolled one full turn
  const [rolling, setRolling] = useState(false);
  const chars = String(value).split('');
  useEffect(() => {
    const el = ref.current;
    if (!el || !canHover()) return;
    const host = (el.closest('a,button') as HTMLElement) ?? el;
    let busy = false;
    let t1 = 0;
    let t2 = 0;
    const enter = () => {
      if (busy) return;
      busy = true;
      setRolling(true);
      // next frame: move one full turn forward (with transition)
      t1 = window.setTimeout(() => setTurn(1), 20);
      // after it lands: snap back to the same digit without transition
      t2 = window.setTimeout(() => {
        setRolling(false);
        setTurn(0);
        busy = false;
      }, 20 + 900 + chars.length * 70 + 60);
    };
    host.addEventListener('pointerenter', enter);
    return () => {
      host.removeEventListener('pointerenter', enter);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [chars.length]);
  let digitIndex = 0;
  const digits = chars.filter((c) => /\d/.test(c)).length;
  return (
    <span ref={ref} className={`thk-rn${rolling ? ' is-rolling' : ''} ${className ?? ''}`} style={style} aria-label={String(value)}>
      {chars.map((c, i) => {
        if (!/\d/.test(c))
          return (
            <span key={i} aria-hidden="true">
              {c}
            </span>
          );
        const d = +c;
        const order = digits - 1 - digitIndex++; // rightmost digit rolls first
        return (
          <span className="thk-rn-d" key={i} aria-hidden="true">
            <span className="thk-rn-col" style={{ ['--i' as string]: d + 10 * turn, ['--dl' as string]: `${order * 70}ms` }}>
              {Array.from({ length: 20 }, (_, k) => (
                <span key={k}>{k % 10}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
