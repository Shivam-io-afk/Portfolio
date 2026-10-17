import React, { useState } from 'react';
import { useCompileStore } from '../../store/useCompileStore';
import { QualityTier } from '../../config/gpuTiers';

export const DevPerfOverlay: React.FC = () => {
  const fps = useCompileStore((state) => state.fps);
  const drawCalls = useCompileStore((state) => state.drawCalls);
  const qualityTier = useCompileStore((state) => state.qualityTier);
  const setQualityTier = useCompileStore((state) => state.setQualityTier);
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const activeStage = useCompileStore((state) => state.activeStage);

  const [minimized, setMinimized] = useState(false);

  // Available in both dev and preview for verification

  const stageNames = ['0 SOURCE', '1 BUILD', '2 NETWORK', '3 RUNTIME', '4 DEPLOY'];

  return (
    <aside
      aria-label="Development Performance Overlay"
      className="fixed bottom-4 left-4 z-50 font-mono text-[11px] bg-[#07070a]/90 border border-[#d8dde6]/20 p-3 shadow-xl backdrop-blur-md pointer-events-auto select-none"
    >
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#d8dde6]/10 mb-2">
        <span className="text-[#ff5b1f] font-bold">PERF_HUD</span>
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-[#d8dde6]/50 hover:text-white px-1"
        >
          {minimized ? '+' : '−'}
        </button>
      </div>

      {!minimized && (
        <div className="space-y-1.5 min-w-[210px]">
          <div className="flex justify-between items-center">
            <span className="text-[#d8dde6]/60">FPS:</span>
            <span
              id="perf-hud-fps"
              className="font-bold text-[#4ade80]"
            >
              60 FPS
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#d8dde6]/60">DRAWCALLS:</span>
            <span id="perf-hud-drawcalls" className="text-white font-medium">1</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#d8dde6]/60">TIER:</span>
            <div className="flex gap-1">
              {(['HIGH', 'MEDIUM', 'LOW'] as QualityTier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setQualityTier(t)}
                  className={`px-1.5 py-0.5 text-[9px] border transition-colors ${
                    qualityTier === t
                      ? 'border-[#ff5b1f] bg-[#ff5b1f]/20 text-[#ff5b1f] font-bold'
                      : 'border-[#d8dde6]/20 text-[#d8dde6]/60 hover:text-white'
                  }`}
                >
                  {t[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-[#d8dde6]/10">
            <span className="text-[#d8dde6]/60">STAGE:</span>
            <span className="text-[#ff5b1f]">{stageNames[activeStage]}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#d8dde6]/60">SCROLL:</span>
            <span className="text-[#d8dde6]">{(scrollProgress * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </aside>
  );
};
