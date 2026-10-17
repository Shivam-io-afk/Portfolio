import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';

interface ContactProps {
  personal: PortfolioData['personal'];
}

export const Contact: React.FC<ContactProps> = ({ personal }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const [scrollSpeed, setScrollSpeed] = useState(1);
  const lastScrollY = useRef(0);
  const lastTime = useRef(Date.now());

  const copyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sent');
    setTimeout(() => setStatus('idle'), 4000);
  };

  // Track scroll velocity to adjust marquee speed & dynamic blur
  useEffect(() => {
    let animId: number;
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastTime.current);
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      const velocity = dy / dt; // pixels per ms
      lastScrollY.current = window.scrollY;
      lastTime.current = now;

      // Map velocity to speed factor (1 to 5) and subtle blur
      const speed = Math.min(4.5, 1 + velocity * 1.8);
      setScrollSpeed(speed);
    };

    const decay = () => {
      setScrollSpeed((prev) => {
        if (prev <= 1.05) return 1;
        return prev * 0.94;
      });
      animId = requestAnimationFrame(decay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animId = requestAnimationFrame(decay);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  const blurAmount = Math.max(0, (scrollSpeed - 1) * 1.5);

  return (
    <section id="contact" className="relative pt-24 pb-32 z-10">
      {/* 1. HUGE AMARANTE HORIZONTAL MARQUEE BETWEEN TWO HAIRLINES (Speed & Blur react to scroll velocity) */}
      <div className="relative border-y border-white/20 py-8 overflow-hidden bg-kumo-ink/50 backdrop-blur-md mb-20 select-none">
        <div
          className="flex whitespace-nowrap animate-marquee items-center"
          style={{
            animationDuration: `${24 / scrollSpeed}s`,
            filter: blurAmount > 0.3 ? `blur(${blurAmount.toFixed(1)}px)` : 'none',
            transition: 'filter 0.2s ease-out',
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="font-serif text-4xl sm:text-7xl lg:text-8xl text-white/90 uppercase tracking-tight px-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                Initiate Transmission.
              </span>
              <span className="text-kumo-orange text-3xl sm:text-5xl px-4">✦</span>
              <span className="font-serif text-4xl sm:text-7xl lg:text-8xl text-white/40 uppercase tracking-tight px-6">
                Let&apos;s Build Together.
              </span>
              <span className="text-kumo-orange text-3xl sm:text-5xl px-4">✦</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Eyebrow & Intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
            <span>SCENE 05 // OPEN SKY & DIRECT RELAY</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl text-white tracking-tight mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            <ScatterText>Get in Touch.</ScatterText>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-white/75 leading-relaxed">
            Direct channel open for full-time engineering appointments, scalable web applications, and creative technology initiatives.
          </p>
        </motion.div>

        {/* Contact Link with Arrow + Minimal Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Email with Arrow + Socials */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-7 bg-kumo-ink/65 backdrop-blur-md border border-white/10 shadow-soft-card space-y-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-mono text-white/50 mb-2">
                  DIRECT TRANSMISSION CHANNEL
                </div>
                {/* Email link with prominent arrow */}
                <a
                  href={`mailto:${personal.email}`}
                  className="group flex items-center justify-between text-base sm:text-lg font-mono text-white hover:text-kumo-orange transition-colors pb-3 border-b border-white/15"
                >
                  <span className="break-all">{personal.email}</span>
                  <ArrowRight className="w-5 h-5 text-kumo-orange group-hover:translate-x-1.5 transition-transform shrink-0 ml-3" />
                </a>

                {/* Quick Copy Action */}
                <div className="pt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-mono text-white/40">
                    ONE-CLICK COPY
                  </span>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-mono text-white/80 hover:text-kumo-orange px-2.5 py-1 border border-white/10 hover:border-kumo-orange transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-kumo-orange" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Address'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-mono text-white/50 mb-1.5">
                  LOCATION & TIMEZONE
                </div>
                <div className="font-mono text-xs text-white/85 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
                  <span>{personal.location} (IST / UTC+5:30)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="font-mono text-[10px] uppercase tracking-mono text-white/50 mb-3">
                  EXTERNAL PORTALS
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={personal.socials.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/15 hover:border-kumo-orange text-white hover:text-kumo-orange font-mono text-[11px] uppercase tracking-mono transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 text-kumo-orange" />
                  </a>

                  {personal.socials.linkedin && (
                    <a
                      href={personal.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/15 hover:border-kumo-orange text-white hover:text-kumo-orange font-mono text-[11px] uppercase tracking-mono transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m-1.39 9.74h2.78v-8.37H5.07v8.37z" />
                      </svg>
                      <span>LinkedIn</span>
                      <ArrowUpRight className="w-3 h-3 text-kumo-orange" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transmission Form */}
          <div className="lg:col-span-7">
            <div className="p-8 bg-kumo-ink/65 backdrop-blur-md border border-white/10 shadow-soft-card">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-mono text-white/60 mb-2">
                      01 // Identity / Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="NAME OR ORGANIZATION"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:border-kumo-orange focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-mono text-white/60 mb-2">
                      02 // Return Signal / Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="CONTACT@DOMAIN.COM"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:border-kumo-orange focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-mono text-white/60 mb-2">
                    03 // Inquiry Brief / Scope
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="DESCRIBE PROJECT GOALS, TECH STACK, TIMELINES & COLLABORATION SCOPE..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/15 text-xs font-mono text-white placeholder:text-white/30 focus:border-kumo-orange focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-mono text-white/40">
                    ENCRYPTION: SSL / DIRECT DISPATCH
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-kumo-orange text-white font-mono text-xs font-semibold uppercase tracking-mono hover:bg-white hover:text-kumo-ink transition-all shadow-md group"
                  >
                    <span>{status === 'sent' ? 'Transmission Dispatched' : 'Send Message'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
