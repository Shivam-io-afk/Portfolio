import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Send } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';
import { SwashText } from '../ui/SwashText';
import { PrimaryButton, SecondaryButton } from '../ui/FloraButton';

interface ContactProps {
  personal: PortfolioData['personal'];
}

export const Contact: React.FC<ContactProps> = ({ personal }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

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

  return (
    <section id="contact" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-left max-w-3xl mb-16"
      >
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-flora-lime tracking-wideflora mb-2">
          <span className="w-2 h-2 bg-flora-lime" />
          <span><SwashText>CONNECT A NODE // PROTOCOL HOP</SwashText></span>
        </div>
        <h2 className="font-display font-bold text-4xl sm:text-6xl uppercase tracking-flora text-ice-white mb-4">
          <SwashText>INITIATE TRANSMISSION</SwashText>
        </h2>
        <p className="text-xs sm:text-sm font-mono text-ice-muted leading-relaxed uppercase tracking-flora">
          Direct private relay channel. Available for full-time engineering appointments, high-scale web systems, and creative technology initiatives.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact info card */}
        <SpotlightCard className="space-y-7">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-2">
              <SwashText>DIRECT TRANSMISSION POINT</SwashText>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-black/40 border border-glass-border">
              <span className="font-mono text-xs sm:text-sm text-flora-lime">{personal.email}</span>
              <button
                type="button"
                onClick={copyEmail}
                className="px-2.5 py-1 bg-glass-surface hover:bg-flora-lime/20 border border-glass-border text-xs font-mono text-ice-white hover:text-flora-lime transition-all flex items-center gap-1.5 focus-visible:outline-none"
                title="Copy email"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-flora-lime" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-2">
              <SwashText>COORDINATES // RELAY LOCATION</SwashText>
            </div>
            <div className="font-mono text-xs text-ice-muted flex items-center gap-2">
              <span className="w-2 h-2 bg-flora-lime shadow-[0_0_8px_#b8f57a]" />
              <span>{personal.location}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-4">
              <SwashText>COMMUNICATION PORTALS</SwashText>
            </div>
            <div className="flex flex-wrap gap-3">
              <SecondaryButton href={personal.socials.github} target="_blank" rel="noreferrer">
                GITHUB REPO
              </SecondaryButton>
              {personal.socials.linkedin && (
                <SecondaryButton href={personal.socials.linkedin} target="_blank" rel="noreferrer">
                  LINKEDIN
                </SecondaryButton>
              )}
            </div>
          </div>
        </SpotlightCard>

        {/* Form */}
        <SpotlightCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-2">
                IDENTITY // SENDER NAME
              </label>
              <input
                required
                type="text"
                placeholder="NAME OR ORGANIZATION"
                className="w-full px-4 py-2.5 bg-black/40 border border-glass-border text-xs font-mono text-ice-white placeholder:text-ice-dim focus:border-flora-lime focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-2">
                SIGNAL // RETURN ADDRESS
              </label>
              <input
                required
                type="email"
                placeholder="CONTACT@DOMAIN.COM"
                className="w-full px-4 py-2.5 bg-black/40 border border-glass-border text-xs font-mono text-ice-white placeholder:text-ice-dim focus:border-flora-lime focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wideflora text-ice-dim mb-2">
                PAYLOAD // INQUIRY BRIEF
              </label>
              <textarea
                required
                rows={4}
                placeholder="SPECIFY PROTOCOL SCOPE, TECH REQUIREMENTS & TIMELINE..."
                className="w-full px-4 py-2.5 bg-black/40 border border-glass-border text-xs font-mono text-ice-white placeholder:text-ice-dim focus:border-flora-lime focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit">
                {status === 'sent' ? 'TRANSMISSION SENT' : 'TRANSMIT SIGNAL'}
              </PrimaryButton>
            </div>
          </form>
        </SpotlightCard>
      </div>
    </section>
  );
};
