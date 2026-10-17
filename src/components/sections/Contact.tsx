import React, { useState } from 'react';
import { Mail, Copy, Check, Send, Code2, Globe, Share2 } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { SpotlightCard } from '../ui/SpotlightCard';

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
    <section id="contact" className="relative py-28 px-6 max-w-5xl mx-auto z-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-magma-base tracking-widest mb-3">
          <span className="w-2 h-2 rounded-full bg-magma-base" />
          <span>Ignition Point</span>
        </div>
        <h2 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-white mb-4">
          Start A Project
        </h2>
        <p className="text-sm font-mono text-smoke-300">
          Have an ambitious idea, high-end design brief, or creative tech collaboration in mind? Let’s forge it into reality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact info card */}
        <SpotlightCard className="space-y-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-smoke-500 mb-2">Direct Transmission</div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="font-mono text-xs sm:text-sm text-smoke-100">{personal.email}</span>
              <button
                onClick={copyEmail}
                className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/10 text-smoke-300 hover:text-white transition-all"
                title="Copy email"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-smoke-500 mb-3">Current Coordinates</div>
            <div className="font-mono text-xs text-smoke-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-magma-base" />
              <span>{personal.location}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-smoke-500 mb-4">Portals & Networks</div>
            <div className="flex items-center gap-3">
              <a
                href={personal.socials.github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-magma-base/40 text-smoke-300 hover:text-white transition-all"
                title="GitHub"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href={personal.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-magma-base/40 text-smoke-300 hover:text-white transition-all"
                title="LinkedIn"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href={personal.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-magma-base/40 text-smoke-300 hover:text-white transition-all"
                title="X / Social"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SpotlightCard>

        {/* Form */}
        <SpotlightCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-smoke-500 mb-2">Name / Identity</label>
              <input
                required
                type="text"
                placeholder="Jane Doe or Acme Corp"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-smoke-100 placeholder:text-smoke-700 focus:outline-none focus:border-magma-base/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-smoke-500 mb-2">Contact Signal</label>
              <input
                required
                type="email"
                placeholder="jane@company.com"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-smoke-100 placeholder:text-smoke-700 focus:outline-none focus:border-magma-base/60 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-smoke-500 mb-2">Brief / Vision</label>
              <textarea
                required
                rows={4}
                placeholder="Tell me about your project scope, timeline, and vision..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-smoke-100 placeholder:text-smoke-700 focus:outline-none focus:border-magma-base/60 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-magma-base text-white text-xs font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-magma-bright transition-all shadow-[0_0_20px_rgba(255,59,0,0.35)]"
            >
              {status === 'sent' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Signal Transmitted</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </SpotlightCard>
      </div>
    </section>
  );
};
