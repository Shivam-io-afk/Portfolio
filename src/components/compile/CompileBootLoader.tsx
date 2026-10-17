import React, { useEffect, useState } from 'react';
import { useCompileStore } from '../../store/useCompileStore';

export const CompileBootLoader: React.FC = () => {
  const isBooting = useCompileStore((state) => state.isBooting);
  const setBootComplete = useCompileStore((state) => state.setBootComplete);
  const spellWord = useCompileStore((state) => state.spellWord);

  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!isBooting) return;

    // Terminal typing timeline:
    // 0.3s -> line 1
    // 0.9s -> line 2
    // 1.5s -> line 3 (compiling 100%)
    // 2.0s -> fade overlay & spell SHIVAM
    // 2.6s -> complete
    const t1 = setTimeout(() => setStep(1), 300);
    const t2 = setTimeout(() => setStep(2), 900);
    const t3 = setTimeout(() => setStep(3), 1500);

    const t4 = setTimeout(() => {
      setFading(true);
      spellWord('SHIVAM', 1600);
    }, 2000);

    const t5 = setTimeout(() => {
      setBootComplete();
    }, 2700);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBootComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBooting, setBootComplete, spellWord]);

  if (!isBooting) return null;

  return (
    <div
      onClick={() => setBootComplete()}
      className={`fixed inset-0 z-50 bg-[#07070a] flex flex-col justify-center items-center font-mono cursor-pointer transition-opacity duration-700 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="max-w-md w-full px-6 space-y-3">
        {/* Terminal Header */}
        <div className="flex items-center justify-between text-[11px] text-[#d8dde6]/40 uppercase tracking-mono pb-2 border-b border-[#d8dde6]/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5b1f] animate-pulse" />
            <span>COMPILE_V3.BOOT</span>
          </div>
          <span>[ESC TO SKIP]</span>
        </div>

        {/* Lines */}
        <div className="space-y-2 text-xs sm:text-sm font-mono text-[#d8dde6]/90">
          {step >= 1 && (
            <div className="flex items-center gap-2 text-white">
              <span className="text-[#ff5b1f]">&gt;</span>
              <span>init shivam.dev</span>
            </div>
          )}
          {step >= 2 && (
            <div className="flex items-center gap-2 text-[#d8dde6]/80">
              <span className="text-[#ff5b1f]">&gt;</span>
              <span>resolving 5 projects · 17 repos</span>
            </div>
          )}
          {step >= 3 && (
            <div className="flex items-center gap-2 text-[#4ade80]">
              <span className="text-[#ff5b1f]">&gt;</span>
              <span>compiling ██████████ 100%</span>
            </div>
          )}
        </div>

        {/* Pulsing prompt cursor */}
        <div className="pt-2 flex items-center gap-2 font-mono text-xs text-[#ff5b1f]">
          <span className="w-2 h-4 bg-[#ff5b1f] inline-block animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-[#d8dde6]/40">
            Streaming bits...
          </span>
        </div>
      </div>
    </div>
  );
};

