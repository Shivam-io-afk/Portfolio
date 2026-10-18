/**
 * SiteNav — one slim floating glass bar for the COMPILE portfolio.
 *
 *  [SM] Shivam Mishra      01 Works  02 Arsenal  03 Trajectory  04 Contact      ● 06:54 IST   Résumé   HIRE ME ↗
 *  ───────────────────────────────── scroll progress ─────────────────────────────────
 *
 * - Sliding orange pill marks the section you're in (updates only when the section changes).
 * - Thin progress line along the bottom edge (updated via ref, no React re-render on scroll).
 * - Compacts slightly after you start scrolling.
 * - Phones: logo + HIRE ME + menu button → full-screen menu with big numbered links.
 * - Self-contained styles (no Tailwind classes), so nothing can silently go missing.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { DirectionalButton } from '../ui/DirectionalButton';

export type NavLink = { id: string; label: string };

export type SiteNavProps = {
  name?: string;
  tagline?: string;
  initials?: string;
  links?: NavLink[];
  resumeHref?: string;
  hireTarget?: string; // section id the HIRE ME button scrolls to
  email?: string;
};

const DEFAULT_LINKS: NavLink[] = [
  { id: 'projects', label: 'Works' },
  { id: 'skills', label: 'Arsenal' },
  { id: 'experience', label: 'Trajectory' },
  { id: 'contact', label: 'Contact' },
];

const css = `
.snav{--o:#ff5b1f;--ink:#07070a;--tx:#eef0f3;--mu:#8a8f99;--line:rgba(255,255,255,.08);
  position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:60;width:min(1180px,calc(100% - 28px));
  font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;}
.snav-bar{position:relative;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;
  height:58px;padding:0 10px 0 10px;border-radius:16px;background:rgba(11,12,16,.72);
  border:1px solid var(--line);box-shadow:0 12px 32px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05);
  backdrop-filter:blur(14px) saturate(140%);-webkit-backdrop-filter:blur(14px) saturate(140%);
  transition:height .35s cubic-bezier(.2,.8,.2,1),background .35s;overflow:hidden}
.snav.is-compact .snav-bar{height:50px;background:rgba(9,10,13,.84)}
.snav-brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--tx);padding:4px 6px;border-radius:10px}
.snav-mono{position:relative;width:34px;height:34px;display:grid;place-items:center;border-radius:9px;
  background:linear-gradient(145deg,#1a1c22,#0e0f13);border:1px solid rgba(255,91,31,.35);
  color:var(--o);font-weight:700;font-size:12px;letter-spacing:.04em;box-shadow:0 0 18px rgba(255,91,31,.18)}
.snav-mono::after{content:"";position:absolute;right:-3px;bottom:-3px;width:8px;height:8px;border-radius:50%;
  background:var(--o);box-shadow:0 0 10px var(--o)}
.snav-name{display:flex;flex-direction:column;line-height:1.15}
.snav-name b{font-family:"Space Grotesk",Inter,system-ui,sans-serif;font-weight:600;font-size:14px;letter-spacing:.01em;white-space:nowrap}
.snav-name small{font-size:10px;color:var(--mu);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.snav-links{position:relative;justify-self:center;display:flex;align-items:center;gap:2px;padding:4px;border-radius:12px;
  background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}
.snav-pill{position:absolute;top:4px;bottom:4px;left:0;width:0;border-radius:9px;background:rgba(255,91,31,.13);
  border:1px solid rgba(255,91,31,.4);box-shadow:0 0 22px rgba(255,91,31,.18) inset;opacity:0;
  transition:transform .5s cubic-bezier(.2,.8,.2,1),width .5s cubic-bezier(.2,.8,.2,1),opacity .3s}
.snav-link{position:relative;z-index:1;display:flex;align-items:baseline;gap:7px;padding:9px 14px;border-radius:9px;
  color:#b9bec8;text-decoration:none;font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;
  transition:color .25s}
.snav-link span{color:var(--o);opacity:.65;font-size:10px;letter-spacing:.06em;transition:opacity .25s}
.snav-link:hover{color:#fff}.snav-link:hover span{opacity:1}
.snav-link[aria-current="true"]{color:#fff}.snav-link[aria-current="true"] span{opacity:1}
.snav-right{display:flex;align-items:center;gap:8px}
.snav-clock{display:flex;align-items:center;gap:8px;padding:8px 10px;color:#c9cdd5;font-size:11px;letter-spacing:.08em;white-space:nowrap}
.snav-dot{width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80;animation:snavPulse 2s infinite}
.snav-clock em{font-style:normal;color:var(--mu)}
.snav-ghost{display:flex;align-items:center;gap:7px;height:38px;padding:0 13px;border-radius:10px;color:#dfe2e8;text-decoration:none;
  font-size:11px;letter-spacing:.12em;text-transform:uppercase;border:1px solid rgba(255,255,255,.1);white-space:nowrap;
  transition:border-color .25s,background .25s,color .25s}
.snav-ghost:hover{border-color:rgba(255,91,31,.5);background:rgba(255,91,31,.08);color:#fff}
.snav-hire{display:flex;align-items:center;gap:8px;height:38px;padding:0 8px 0 15px;border-radius:10px;border:0;cursor:pointer;
  background:var(--o);color:#140803;font:700 11.5px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;
  white-space:nowrap;box-shadow:0 6px 22px rgba(255,91,31,.35);transition:transform .25s,box-shadow .25s}
.snav-hire i{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;background:rgba(0,0,0,.18);font-style:normal;
  transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.snav-hire:hover{transform:translateY(-1px);box-shadow:0 10px 30px rgba(255,91,31,.5)}
.snav-hire:hover i{transform:translate(2px,-2px) rotate(-8deg)}
.snav-progress{position:absolute;left:14px;right:14px;bottom:0;height:2px;border-radius:2px;background:rgba(255,255,255,.05);overflow:hidden}
.snav-progress b{position:absolute;inset:0;transform-origin:0 50%;transform:scaleX(0);
  background:linear-gradient(90deg,rgba(255,91,31,.2),var(--o) 70%,#ffb38f);box-shadow:0 0 12px var(--o)}
.snav-menu{display:none;width:40px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:transparent;cursor:pointer;
  position:relative}
.snav-menu b{position:absolute;left:11px;right:11px;height:1.5px;background:#eef0f3;border-radius:2px;transition:transform .35s,top .35s}
.snav-menu b:nth-child(1){top:14px}.snav-menu b:nth-child(2){top:22px}
.snav.is-open .snav-menu b:nth-child(1){top:18px;transform:rotate(45deg)}
.snav.is-open .snav-menu b:nth-child(2){top:18px;transform:rotate(-45deg)}
.snav-a:focus-visible{outline:2px solid var(--o);outline-offset:2px}
.snav-sheet{position:fixed;inset:0;z-index:55;background:rgba(7,7,10,.97);display:flex;flex-direction:column;justify-content:center;
  padding:110px 28px 40px;opacity:0;pointer-events:none;transition:opacity .35s}
.snav-sheet.is-open{opacity:1;pointer-events:auto}
.snav-sheet a.big{display:flex;align-items:baseline;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07);
  color:#eef0f3;text-decoration:none;font:600 clamp(30px,9vw,44px)/1.05 "Space Grotesk",Inter,system-ui,sans-serif;
  opacity:0;transform:translateY(16px);transition:opacity .45s,transform .45s cubic-bezier(.2,.8,.2,1)}
.snav-sheet a.big span{font:500 12px "JetBrains Mono",monospace;color:var(--o);letter-spacing:.08em}
.snav-sheet.is-open a.big{opacity:1;transform:none}
.snav-sheet-foot{margin-top:28px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-family:"JetBrains Mono",monospace}
@keyframes snavPulse{0%,100%{opacity:1}50%{opacity:.35}}
@media (max-width:1100px){.snav-bar .snav-clock{display:none}}
@media (max-width:920px){.snav-links,.snav-bar .snav-ghost{display:none}.snav-menu{display:block}.snav-bar{grid-template-columns:1fr auto}}
@media (max-width:420px){.snav-name small{display:none}.snav-hire{padding:0 8px 0 12px;letter-spacing:.1em}}
@media (prefers-reduced-motion:reduce){.snav *,.snav-sheet *{transition:none!important;animation:none!important}}
`;

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const iv = window.setInterval(() => setT(new Date()), 1000 * 15);
    return () => window.clearInterval(iv);
  }, []);
  const time = t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
  return (
    <div className="snav-clock" title="My local time · usually replies within 24h">
      <i className="snav-dot" aria-hidden="true" />
      {time} <em>IST</em>
    </div>
  );
}

export default function SiteNav({
  name = 'Shivam Mishra',
  tagline = 'MERN · Creative Tech',
  initials = 'SM',
  links = DEFAULT_LINKS,
  resumeHref = '/resume.pdf',
  hireTarget = 'contact',
  email = 'shivam.m28737@gmail.com',
}: SiteNavProps) {
  const [active, setActive] = useState(-1);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const linkEls = useRef<(HTMLAnchorElement | null)[]>([]);

  /* scroll: progress (ref), compact + active section (state only when they change) */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (progRef.current) progRef.current.style.transform = `scaleX(${p})`;
      const c = window.scrollY > 40;
      setCompact((prev) => (prev === c ? prev : c));
      const mid = window.innerHeight * 0.45;
      let idx = -1;
      links.forEach((l, i) => {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      });
      setActive((prev) => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [links]);

  /* move the pill under the active link */
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const wrap = linksRef.current;
    const el = active >= 0 ? linkEls.current[active] : null;
    if (!pill || !wrap) return;
    if (!el) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.opacity = '1';
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [active, compact]);

  /* mobile sheet: Esc closes, lock page scroll */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setOpen(false);
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } }).lenis;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <>
      <style>{css}</style>
      <nav className={`snav${compact ? ' is-compact' : ''}${open ? ' is-open' : ''}`} aria-label="Main">
        <div className="snav-bar" ref={barRef}>
          <a className="snav-brand snav-a" href="#hero" onClick={go('hero')} aria-label={`${name} — back to top`}>
            <span className="snav-mono">{initials}</span>
            <span className="snav-name">
              <b>{name}</b>
              <small>{tagline}</small>
            </span>
          </a>

          <div className="snav-links" ref={linksRef}>
            <span className="snav-pill" ref={pillRef} aria-hidden="true" />
            {links.map((l, i) => (
              <a
                key={l.id}
                ref={(el) => {
                  linkEls.current[i] = el;
                }}
                className="snav-link snav-a"
                href={`#${l.id}`}
                onClick={go(l.id)}
                aria-current={active === i ? 'true' : undefined}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {l.label}
              </a>
            ))}
          </div>

          <div className="snav-right">
            <Clock />
            <DirectionalButton
              as="a"
              href={resumeHref}
              download
              fillColor="orange"
              className="snav-ghost snav-a"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Résumé</span>
              </span>
            </DirectionalButton>
            <DirectionalButton
              as="button"
              type="button"
              onClick={(e) => go(hireTarget)(e)}
              fillColor="white"
              className="snav-hire snav-a"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                Hire me <i aria-hidden="true">↗</i>
              </span>
            </DirectionalButton>
            <button
              className="snav-menu snav-a"
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <b />
              <b />
            </button>
          </div>

          <div className="snav-progress" aria-hidden="true">
            <b ref={progRef} />
          </div>
        </div>
      </nav>

      <div className={`snav-sheet${open ? ' is-open' : ''}`} aria-hidden={!open}>
        {links.map((l, i) => (
          <a
            key={l.id}
            className="big snav-a"
            href={`#${l.id}`}
            onClick={go(l.id)}
            tabIndex={open ? 0 : -1}
            style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            {l.label}
          </a>
        ))}
        <div className="snav-sheet-foot">
          <a className="snav-ghost snav-a" href={resumeHref} download tabIndex={open ? 0 : -1}>
            Résumé ↓
          </a>
          <a className="snav-ghost snav-a" href={`mailto:${email}`} tabIndex={open ? 0 : -1}>
            Email ↗
          </a>
          <Clock />
        </div>
      </div>
    </>
  );
}
