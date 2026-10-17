import React from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  hasLiveDot?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  hasLiveDot = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#0a0e1e]/75 backdrop-blur-glass border border-glass-border border-l-2 border-l-flora-lime p-7 transition-all duration-300 hover:border-l-flora-lime hover:border-glass-borderHover hover:shadow-[0_0_30px_rgba(184,245,122,0.12)] ${className}`}
    >
      {/* Live Status Indicator (if present) */}
      {hasLiveDot && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[10px] font-mono text-flora-lime uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-flora-lime animate-ping" />
          <span>LIVE</span>
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
