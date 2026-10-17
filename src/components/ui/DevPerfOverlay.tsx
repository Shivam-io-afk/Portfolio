import React, { useState, useEffect } from 'react';
import { useCompileStore } from '../../store/useCompileStore';
import { QualityTier } from '../../config/gpuTiers';

export const DevPerfOverlay: React.FC = () => {
  const fps = useCompileStore((state) => state.fps);
  const drawCalls = useCompileStore((state) => state.drawCalls);
  const qualityTier = useCompileStore((state) => state.qualityTier);
  const setQualityTier = useCompileStore((state) => state.setQualityTier);
  const scrollProgress = useCompileStore((state) => state.scrollProgress);
  const activeStage = useCompileStore((state) => state.activeStage);

  const [isDebug, setIsDebug] = useState(false);
  const [minimized, setMinimized] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
      setIsDebug(true);
      setMinimized(false);
    }
  }, []);

  const stageNames = ['0 SOURCE', '1 BUILD', '2 NETWORK', '3 RUNTIME', '4 DEPLOY'];

  // If not ?debug in URL and minimized, show only a tiny 1-line pill bottom-left
  if (!isDebug && minimized) {
    return (
      <aside
        id="perf-hud-overlay"
        aria-label="Compile Status Indicator"
        onClick={() => setMinimized(false)}
        className="fixed bottom-3 left-3 z-50 font-mono text-[10px] tracking-mono text-[#d8dde6]/60 bg-[#07070a]/75 border border-[#d8dde6]/10 px-2.5 py-1 rounded-sm backdrop-blur-sm pointer-events-auto cursor-pointer hover:border-[#ff5b1f]/40 hover:text-white transition-all select-none"
      >
        <span className="text-[#ff5b1f] font-bold mr-1.5">[COMPILE]</span>
        <span id="perf-hud-fps" className="text-[#4ade80] font-semibold">{fps} FPS</span>
      </aside>
    );
  }

  return (
    <aside
      id="perf-hud-overlay"
      aria-label="Development Performance Overlay"
      className="fixed bottom-3 left-3 z-50 font-mono text-[11px] bg-[#07070a]/90 border border-[#d8dde6]/20 p-3 shadow-xl backdrop-blur-md pointer-events-auto select-none rounded-sm"
    >
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#d8dde6]/10 mb-2">
        <span className="text-[#ff5b1f] font-bold">PERF_HUD</span>
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-[#d8dde6]/50 hover:text-white px-1 text-xs"
          title="Toggle HUD size"
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
              className={`font-bold ${
                fps >= 50 ? 'text-[#4ade80]' : fps >= 30 ? 'text-amber-400' : 'text-red-500'
              }`}
            >
              {fps} FPS
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#d8dde6]/60">DRAWCALLS:</span>
            <span id="perf-hud-drawcalls" className="text-white font-medium">{drawCalls || 1}</span>
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
