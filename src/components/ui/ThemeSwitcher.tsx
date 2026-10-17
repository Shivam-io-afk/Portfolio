import React, { useState } from 'react';
import { Eye, Flame, Sparkles } from 'lucide-react';

export type VisualMode = 'flora' | 'magma';

interface ThemeSwitcherProps {
  mode: VisualMode;
  onToggle: (mode: VisualMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ mode, onToggle }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center p-1 rounded-full bg-obsidian-900/90 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/80">
      <button
        onClick={() => onToggle('flora')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
          mode === 'flora'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
            : 'text-smoke-500 hover:text-smoke-300'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Flora Dandelion</span>
      </button>

      <button
        onClick={() => onToggle('magma')}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
          mode === 'magma'
            ? 'bg-magma-base text-white shadow-[0_0_20px_rgba(255,59,0,0.5)]'
            : 'text-smoke-500 hover:text-smoke-300'
        }`}
      >
        <Flame className="w-3.5 h-3.5" />
        <span>Molten Lava</span>
      </button>
    </div>
  );
};

