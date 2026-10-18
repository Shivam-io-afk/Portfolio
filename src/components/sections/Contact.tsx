import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Copy, Check, ArrowRight, ArrowUpRight, GitBranch } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { CompileHeading } from '../ui/CompileHeading';
import { CompileLabel } from '../ui/CompileLabel';
import { MagneticButton } from '../ui/MagneticButton';
import { DirectionalButton } from '../ui/DirectionalButton';
import { ResumeBundlerButton } from '../ui/ResumeBundlerButton';
import ScrollMarquee from '../ui/ScrollMarquee';
import { BracketLink } from '../ui/TextHoverKit';
import { useCompileStore } from '../../store/useCompileStore';

interface ContactProps {
  personal: PortfolioData['personal'];
}

export const Contact: React.FC<ContactProps> = ({ personal }) => {
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'delivered'>('idle');
  const submitBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch {}
    }, 450);
    return () => clearTimeout(t);
  }, [deployState]);

  const copyEmail = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(personal.email).catch(() => {});
      }
    } catch {}
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name.trim() || !isEmailValid || !message.trim()) {
      // Validation failure: shake submit button (x ±6px 3 times) and keep form open
      if (submitBtnRef.current && !reduced) {
        gsap.killTweensOf(submitBtnRef.current);
        gsap.fromTo(
          submitBtnRef.current,
          { x: -6 },
          {
            x: 6,
            duration: 0.07,
            repeat: 5,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => {
              gsap.set(submitBtnRef.current, { x: 0 });
            },
          }
        );
      }
      return;
    }

    // Deploy sequence: collapse fields (height -> 0, opacity -> 0, 0.4s) into terminal line
    setDeployState('deploying');
    try {
      window.dispatchEvent(new CustomEvent('deploy-burst'));
    } catch {}

    const delay = reduced ? 100 : 1200;
    setTimeout(() => {
      setDeployState('delivered');
      try {
        useCompileStore.getState().spellWord('THANKS', 2500);
      } catch {}
    }, delay);
  };

  return (
    <section id="contact" className="relative pt-24 pb-28 overflow-hidden z-10">
      {/* Crossing, scroll-reactive marquee bands */}
      <ScrollMarquee
        front={['Deploy to production.', "Let's build together."]}
        back={['Open to work', 'Full-stack', 'Freelance', 'MERN', 'Rewa · India']}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-10 relative">
        {/* Eyebrow & Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] shrink-0" />
            <CompileLabel text="STAGE 04 /// DEPLOY.TRANSMISSION" alt="replies within 24h" />
          </div>
          <CompileHeading
            as="h2"
            text="Get in"
            accent="Touch."
            className="font-grotesk text-3xl sm:text-5xl text-white font-bold tracking-tight mb-4"
          />
          <p className="font-grotesk text-xs sm:text-sm text-[#d8dde6]/80 leading-relaxed">
            Direct channel open for full-time engineering appointments, scalable web applications, and creative technology initiatives.
          </p>
        </motion.div>

        {/* Contact Link with Arrow + Minimal Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Email + External Links */}
          <div className="lg:col-span-5 space-y-6">
            <div className="compile-card p-6 sm:p-7 space-y-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50 mb-2">
                  DIRECT TRANSMISSION CHANNEL
                </div>
                <div className="relative">
                  {/* Tooltip: 'copy ⌘C' on hover, 'copied ✓' in green for 1.5s on click */}
                  <div
                    aria-live="polite"
                    className={`absolute -top-7 left-0 pointer-events-none font-mono text-[10px] tracking-mono px-2 py-0.5 rounded border transition-all duration-150 z-20 ${
                      emailCopied
                        ? 'opacity-100 translate-y-0 text-[#4ade80] border-[#4ade80]/50 bg-[#07080a]/95 shadow-[0_0_12px_rgba(74,222,128,0.3)]'
                        : emailHovered
                        ? 'opacity-100 translate-y-0 text-[#d8dde6]/90 border-[#ff5b1f]/40 bg-[#07080a]/95'
                        : 'opacity-0 translate-y-1'
                    }`}
                  >
                    {emailCopied ? 'copied ✓' : 'copy ⌘C'}
                  </div>

                  {/* Email link with prominent arrow */}
                  <a
                    href={`mailto:${personal.email}`}
                    onClick={(e) => copyEmail(e)}
                    onMouseEnter={() => setEmailHovered(true)}
                    onMouseLeave={() => setEmailHovered(false)}
                    className="group flex items-center justify-between text-base sm:text-lg font-mono text-white hover:text-[#ff5b1f] transition-colors pb-3 border-b border-[#d8dde6]/10 relative cursor-pointer"
                  >
                    <span className="break-all">{personal.email}</span>
                    <ArrowRight className="w-5 h-5 text-[#ff5b1f] group-hover:translate-x-1.5 transition-transform shrink-0 ml-3" />
                  </a>
                </div>

                {/* Quick Copy Action */}
                <div className="pt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
                    ONE-CLICK COPY
                  </span>
                  <button
                    type="button"
                    onClick={(e) => copyEmail(e)}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/80 hover:text-[#ff5b1f] px-2.5 py-1 border border-[#d8dde6]/10 hover:border-[#ff5b1f] transition-all bg-[#07070a]/60 cursor-pointer"
                  >
                    {emailCopied ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                    <span className={emailCopied ? 'text-[#4ade80]' : ''}>{emailCopied ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50 mb-1.5">
                  LOCATION & TIMEZONE
                </div>
                <div className="font-mono text-xs text-white/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f]" />
                  <span>{personal.location} (IST / UTC+5:30)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d8dde6]/10 space-y-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50 mb-3">
                    RESUME ARTIFACT
                  </div>
                  <ResumeBundlerButton variant="full" />
                </div>

                <div>
                  <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50 mb-3">
                    EXTERNAL PORTALS
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <BracketLink
                      href={personal.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-[#d8dde6]/15 bg-[#07070a]/60 text-[#d8dde6] font-mono text-[11px] uppercase tracking-mono px-3 py-1.5"
                    >
                      <span className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-[#ff5b1f]" />
                        <span>GitHub</span>
                        <ArrowUpRight className="w-3 h-3 arrow-nudge" />
                      </span>
                    </BracketLink>

                    {personal.socials.linkedin && (
                      <BracketLink
                        href={personal.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-[#d8dde6]/15 bg-[#07070a]/60 text-[#d8dde6] font-mono text-[11px] uppercase tracking-mono px-3 py-1.5"
                      >
                        <span className="flex items-center gap-2">
                          <span>LinkedIn</span>
                          <ArrowUpRight className="w-3 h-3 text-[#ff5b1f] arrow-nudge" />
                        </span>
                      </BracketLink>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transmission Form */}
          <div id="contact-form" className="lg:col-span-7 scroll-mt-24">
            <div className="compile-card p-6 sm:p-8">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#d8dde6]/10">
                <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60">
                  TRANSMISSION PROTOCOL // INQUIRY FORM
                </span>
                <span className="font-mono text-[10px] text-[#ff5b1f] tracking-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-pulse" />
                  DIRECT DISPATCH
                </span>
              </div>
              <AnimatePresence mode="wait">
                {deployState === 'idle' && (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60 mb-2">
                          01 // Identity / Name
                        </label>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="NAME OR ORGANIZATION"
                          className="w-full px-4 py-2.5 bg-[#07070a] border border-[#d8dde6]/20 text-xs font-mono text-white placeholder:text-[#d8dde6]/35 focus:border-[#ff5b1f] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60 mb-2">
                          02 // Return Signal / Email
                        </label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="CONTACT@DOMAIN.COM"
                          className="w-full px-4 py-2.5 bg-[#07070a] border border-[#d8dde6]/20 text-xs font-mono text-white placeholder:text-[#d8dde6]/35 focus:border-[#ff5b1f] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60 mb-2">
                        03 // Inquiry Brief / Scope
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="DESCRIBE PROJECT GOALS, TECH STACK, TIMELINES & COLLABORATION SCOPE..."
                        className="w-full px-4 py-2.5 bg-[#07070a] border border-[#d8dde6]/20 text-xs font-mono text-white placeholder:text-[#d8dde6]/35 focus:border-[#ff5b1f] focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/40">
                        ENCRYPTION: SSL / DIRECT DISPATCH
                      </span>
                      <div ref={submitBtnRef}>
                        <MagneticButton>
                          <DirectionalButton
                            as="button"
                            type="submit"
                            fillColor="orange"
                            className="border border-[#ff5b1f] bg-[#ff5b1f] text-black font-mono text-xs font-bold uppercase tracking-mono shadow-md"
                          >
                            <div className="flex items-center gap-2 px-6 py-2.5">
                              <span>SEND MESSAGE</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </DirectionalButton>
                        </MagneticButton>
                      </div>
                    </div>
                  </motion.form>
                )}

                {deployState === 'deploying' && (
                  <motion.div
                    key="deploying-terminal"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="py-16 px-4 flex items-center gap-2 font-mono text-sm sm:text-base text-white/90"
                  >
                    <span className="text-[#ff5b1f] font-bold text-lg leading-none">›</span>
                    <span>deploying message…</span>
                    <span className="inline-block w-2 h-4 bg-[#ff5b1f] animate-pulse ml-0.5 align-middle" />
                  </motion.div>
                )}

                {deployState === 'delivered' && (
                  <motion.div
                    key="delivered-terminal"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-14 px-4 space-y-5"
                  >
                    <div className="flex items-center gap-2.5 font-mono text-sm sm:text-base text-[#d8dde6]/80">
                      <span className="text-[#ff5b1f] font-bold text-lg leading-none">✓</span>
                      <span>delivered — I'll reply within 24h</span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeployState('idle');
                          setName('');
                          setEmail('');
                          setMessage('');
                        }}
                        className="inline-flex items-center gap-2 font-mono text-xs text-[#ff5b1f] hover:text-[#ff7844] uppercase tracking-mono px-3 py-1.5 border border-[#ff5b1f]/30 hover:border-[#ff5b1f] transition-all bg-[#ff5b1f]/5 cursor-pointer"
                      >
                        <span>↺ send another</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
