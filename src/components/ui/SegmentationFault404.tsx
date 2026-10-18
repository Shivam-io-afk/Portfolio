import React, { useEffect } from 'react';
import { AlertOctagon, Undo2 } from 'lucide-react';
import { useCompileStore } from '../../store/useCompileStore';
import { MagneticButton } from './MagneticButton';

export const SegmentationFault404: React.FC = () => {
  const is404 = useCompileStore((state) => state.is404);
  const setIs404 = useCompileStore((state) => state.setIs404);

  // Check URL hash for #404 or #/404
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        if (hash === '#404' || hash === '#/404' || hash.includes('404')) {
          setIs404(true);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    window.addEventListener('popstate', checkHash);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('popstate', checkHash);
    };
  }, [setIs404]);

  const handleCheckoutHome = () => {
    setIs404(false);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!is404) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="segfault-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#07070a]/90 animate-fade-in"
    >
      <div className="max-w-xl w-full p-8 border border-red-500/40 bg-[#0d0e14]/95 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-red-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-mono text-xs text-red-400 tracking-mono uppercase">
              EXCEPTION: SIGSEGV (0x00000000)
            </span>
          </div>
          <span className="font-mono text-[10px] text-red-500/50">EXIT CODE 139</span>
        </div>

        {/* Big Glitch Headline */}
        <div className="space-y-3 mb-8">
          <h1
            id="segfault-title"
            className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3"
          >
            <span>SEGMENTATION FAULT</span>
            <span className="text-red-500 text-lg font-normal">(core dumped)</span>
          </h1>
          <p className="font-mono text-xs text-[#d8dde6]/70 leading-relaxed">
            The requested memory address could not be resolved in the COMPILE pipeline.
            Bits have collapsed into the floor buffer. Stack trace recorded at 0x7fff5fbff8e0.
          </p>
        </div>

        {/* Stack trace snippet */}
        <div className="p-3 mb-8 bg-black/60 border border-white/10 font-mono text-[11px] text-red-400/80 space-y-1">
          <div>&gt; [0x00401000] vmlinux!do_page_fault+0x14a</div>
          <div>&gt; [0x004024b8] compile!render_stage_mesh+0x219</div>
          <div>&gt; [0x004038c0] route_not_found (uri: {typeof window !== 'undefined' ? window.location.hash || '/404' : '/404'})</div>
        </div>

        {/* Checkout home button */}
        <div className="flex justify-end">
          <MagneticButton>
            <button
              onClick={handleCheckoutHome}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-mono text-xs uppercase tracking-mono font-semibold transition-all shadow-md"
            >
              <Undo2 className="w-4 h-4" />
              <span>git checkout home</span>
            </button>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};
