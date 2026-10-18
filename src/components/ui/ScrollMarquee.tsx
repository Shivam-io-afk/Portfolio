/**
 * ScrollMarquee — two crossing, scroll-reactive marquee bands.
 *
 *  Band A (front, tilted -3°):  DEPLOY TO PRODUCTION. ✦ Let's Build Together. ✦ …   → drifts left
 *  Band B (back,  tilted +2.5°): OPEN TO WORK ✦ FULL-STACK ✦ FREELANCE ✦ …  (outlined) → drifts right
 *
 * Scroll reactions (no React re-renders — everything runs through refs in one rAF loop):
 *  - speed jumps with scroll velocity, then eases back to a slow idle drift
 *  - direction follows the scroll direction (scroll up → bands reverse)
 *  - text leans (skewX) into the motion, ✦ stars spin with the distance travelled
 *  - on entering the viewport the bands unfold from flat to their tilt and wipe in
 *  - hovering slows the bands down so they can be read
 * Loop only runs while visible. Respects prefers-reduced-motion.
 */
import { useEffect, useRef, type ReactElement } from 'react';

export type ScrollMarqueeProps = {
  /** front band: alternating bold / italic phrases */
  front?: string[];
  /** back band: outlined words */
  back?: string[];
  accent?: string;
};

const css = `
.smq{--o:#ff5b1f;position:relative;height:clamp(190px,24vw,300px);overflow:hidden;margin:24px 0;
  font-family:"Space Grotesk",Inter,system-ui,sans-serif}
.smq-band{position:absolute;left:-6%;right:-6%;top:50%;display:flex;overflow:hidden;will-change:transform;
  transition:transform 1.1s cubic-bezier(.2,.8,.2,1),clip-path 1.1s cubic-bezier(.2,.8,.2,1);clip-path:inset(0 50% 0 50%)}
.smq.is-in .smq-band{clip-path:inset(0 0 0 0)}
.smq-a{z-index:2;transform:translateY(-50%) rotate(0deg);background:rgba(10,11,14,.88);
  border-top:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09);
  box-shadow:0 18px 50px rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.smq.is-in .smq-a{transform:translateY(-50%) rotate(-3deg)}
.smq-b{z-index:1;transform:translateY(-50%) rotate(0deg);background:var(--o);transition-delay:.12s}
.smq.is-in .smq-b{transform:translateY(-50%) rotate(2.5deg)}
.smq-track{display:flex;flex:none;align-items:center;white-space:nowrap;will-change:transform}
.smq-row{display:flex;flex:none;align-items:center}
.smq-a .smq-row{padding:clamp(14px,1.6vw,22px) 0}
.smq-b .smq-row{padding:clamp(8px,.9vw,12px) 0}
.smq-bold{font-weight:700;text-transform:uppercase;letter-spacing:-.01em;color:#fff;font-size:clamp(30px,4.6vw,64px);padding:0 .45em;line-height:1}
.smq-ital{font-family:"Instrument Serif",Georgia,serif;font-style:italic;color:var(--o);font-size:clamp(32px,4.9vw,68px);padding:0 .45em;line-height:1}
.smq-star{display:inline-block;color:var(--o);font-size:clamp(20px,2.6vw,36px);padding:0 .25em;line-height:1}
.smq-out{font-weight:700;text-transform:uppercase;letter-spacing:.04em;font-size:clamp(18px,2.4vw,32px);padding:0 .6em;line-height:1;
  color:transparent;-webkit-text-stroke:1.2px #170802}
.smq-b .smq-star{color:#170802;font-size:clamp(14px,1.7vw,22px)}
.smq-skew{display:flex;align-items:center;will-change:transform}
@media (max-width:640px){.smq{height:220px}.smq-a{top:42%}.smq-b{top:66%}}
@media (prefers-reduced-motion:reduce){.smq-band{transition:none;clip-path:none}}
`;

export default function ScrollMarquee({
  front = ['Deploy to production.', "Let's build together."],
  back = ['Open to work', 'Full-stack', 'Freelance', 'MERN', 'Rewa · India'],
  accent = '#ff5b1f',
}: ScrollMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const trackA = useRef<HTMLDivElement>(null);
  const trackB = useRef<HTMLDivElement>(null);
  const skewA = useRef<HTMLDivElement>(null);
  const skewB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let visible = false;
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let vel = 0; // smoothed scroll velocity, px/ms
    let dir = 1; // 1 = page scrolling down
    let posA = 0;
    let posB = 0;
    let hover = 0;
    let hoverTarget = 0;
    const stars = () => el.querySelectorAll<HTMLElement>('.smq-star');

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          el.classList.add('is-in');
          last = performance.now();
          lastY = window.scrollY;
          if (!raf) raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    const onEnter = () => (hoverTarget = 1);
    const onLeave = () => (hoverTarget = 0);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    function loop(now: number) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(now - last, 50);
      last = now;

      const y = window.scrollY;
      const raw = (y - lastY) / Math.max(dt, 1);
      lastY = y;
      vel += (raw - vel) * Math.min(1, dt / 90);
      if (Math.abs(raw) > 0.02) dir = raw > 0 ? 1 : -1;
      hover += (hoverTarget - hover) * Math.min(1, dt / 160);

      const speed = reduced ? 0.03 : 0.05 + Math.min(Math.abs(vel) * 0.9, 2.2); // px/ms
      const slow = 1 - hover * 0.8;
      posA -= dir * speed * slow * dt;
      posB += dir * speed * 0.8 * slow * dt;

      const wA = (trackA.current?.scrollWidth ?? 0) / 2;
      const wB = (trackB.current?.scrollWidth ?? 0) / 2;
      if (wA > 0) posA = ((posA % wA) - wA) % wA;
      if (wB > 0) posB = ((posB % wB) - wB) % wB;

      if (trackA.current) trackA.current.style.transform = `translate3d(${posA}px,0,0)`;
      if (trackB.current) trackB.current.style.transform = `translate3d(${posB}px,0,0)`;

      const lean = reduced ? 0 : Math.max(-14, Math.min(14, -vel * 9));
      if (skewA.current) skewA.current.style.transform = `skewX(${lean}deg)`;
      if (skewB.current) skewB.current.style.transform = `skewX(${-lean * 0.7}deg)`;

      const spin = (posA * 0.6) % 360;
      stars().forEach((s, i) => (s.style.transform = `rotate(${i % 2 ? -spin : spin}deg) scale(${1 + Math.min(Math.abs(vel) * 0.25, 0.35)})`));

      raf = requestAnimationFrame(loop);
    }

    return () => {
      io.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const rowA = (k: number) => (
    <div className="smq-row" key={k} aria-hidden={k > 0}>
      {front.map((t, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span className={i % 2 === 0 ? 'smq-bold' : 'smq-ital'}>{t}</span>
          <span className="smq-star">✦</span>
        </span>
      ))}
    </div>
  );
  const rowB = (k: number) => (
    <div className="smq-row" key={k} aria-hidden="true">
      {back.map((t, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span className="smq-out">{t}</span>
          <span className="smq-star">✦</span>
        </span>
      ))}
    </div>
  );

  // repeat enough rows to cover wide screens; tracks are 2 identical halves for seamless looping
  const half = (fn: (k: number) => ReactElement, base: number) => [0, 1, 2].map((i) => fn(base + i));

  return (
    <div className="smq" ref={root} style={{ ['--o' as string]: accent }}>
      <style>{css}</style>
      <div className="smq-band smq-b" aria-hidden="true">
        <div className="smq-skew" ref={skewB}>
          <div className="smq-track" ref={trackB}>
            {half(rowB, 0)}
            {half(rowB, 3)}
          </div>
        </div>
      </div>
      <div className="smq-band smq-a" role="marquee" aria-label={front.join(' ')}>
        <div className="smq-skew" ref={skewA}>
          <div className="smq-track" ref={trackA}>
            {half(rowA, 0)}
            {half(rowA, 3)}
          </div>
        </div>
      </div>
    </div>
  );
}
