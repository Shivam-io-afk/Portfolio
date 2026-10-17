import { create } from 'zustand';
import { QualityTier } from '../config/gpuTiers';

export type StageId = 0 | 1 | 2 | 3 | 4;

export interface CompileState {
  scrollProgress: number; // 0.0 to 1.0 (read via getState() inside useFrame/GSAP)
  activeStage: StageId;
  activeTower: number; // 0: Onbuggy, 1: TaskFlow, 2: Khatabook, 3: Zoom, 4: ShelterMap
  hoveredSkillNode: string | null;
  cursorPos: { x: number; y: number };
  terminalLogs: string[];
  qualityTier: QualityTier;
  fps: number;
  drawCalls: number;

  // Signature Moments
  isBooting: boolean;
  bootComplete: boolean;
  textSpellTarget: 'NONE' | 'SHIVAM' | 'THANKS';
  textSpellProgress: number; // 0.0 -> 1.0
  shockwaveProgress: number; // 0.0 -> 1.0
  scanBeamProgress: number;  // 0.0 -> 1.0

  // Phase 3: Projects That Impress
  activeDeepDiveId: string | null;
  isDeepDiveOpen: boolean;
  towerAssemblyProgress: number; // 0.0 -> 1.0
  openDeepDive: (projectId: string) => void;
  closeDeepDive: () => void;

  // Phase 4: Arsenal Repo Constellation
  hoveredRepoId: string | null;
  setHoveredRepoId: (id: string | null) => void;

  // Phase 5: Scripted Ask Shivam Terminal
  isTerminalOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;
  toggleTerminal: () => void;
  
  setScrollProgress: (progress: number) => void;
  setActiveStage: (stage: StageId) => void;
  setActiveTower: (tower: number) => void;
  setHoveredSkillNode: (skill: string | null) => void;
  setCursorPos: (x: number, y: number) => void;
  addTerminalLog: (log: string) => void;
  setQualityTier: (tier: QualityTier) => void;
  degradeQualityTier: () => void;
  setFps: (fps: number) => void;
  setDrawCalls: (calls: number) => void;

  setBootComplete: () => void;
  triggerShockwave: () => void;
  triggerScanBeam: () => void;
  spellWord: (target: 'SHIVAM' | 'THANKS', durationMs?: number) => void;
}

const checkInitialBootState = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    const booted = window.sessionStorage?.getItem('compile_booted');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    return !!booted || !!reducedMotion;
  } catch {
    return false;
  }
};

export const useCompileStore = create<CompileState>((set, get) => {
  const initialBooted = checkInitialBootState();

  return {
    scrollProgress: 0,
    activeStage: 0,
    activeTower: 0,
    hoveredSkillNode: null,
    cursorPos: { x: 0, y: 0 },
    qualityTier: 'HIGH',
    fps: 60,
    drawCalls: 0,

    isBooting: !initialBooted,
    bootComplete: initialBooted,
    textSpellTarget: 'NONE',
    textSpellProgress: 0,
    shockwaveProgress: 0,
    scanBeamProgress: 0,

    activeDeepDiveId: null,
    isDeepDiveOpen: false,
    towerAssemblyProgress: 1.0,

    hoveredRepoId: null,
    setHoveredRepoId: (id) => set({ hoveredRepoId: id }),

    terminalLogs: [
      'INIT_SYSTEM: Initializing runtime pipeline...',
      'RESOLVE: Host architecture [x86_64-win32-v8]',
      'ATTACH: WebGL2 context initialized @ HIGH tier',
      'SOURCE: Stage 0 mounted. Ready for compilation.',
    ],

    setScrollProgress: (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));
      (get() as any).scrollProgress = clamped;

      let stage: StageId = 0;
      if (clamped >= 0.94) stage = 4;
      else if (clamped >= 0.52) stage = 3;
      else if (clamped >= 0.40) stage = 2;
      else if (clamped >= 0.08) stage = 1;
      else stage = 0;

      let tower = get().activeTower;
      if (clamped >= 0.08 && clamped < 0.39) {
        const towerNorm = (clamped - 0.08) / 0.31;
        tower = Math.min(4, Math.max(0, Math.floor(towerNorm * 5)));
      }

      if (stage !== get().activeStage || tower !== get().activeTower) {
        // Trigger scan beam animation when stage changes
        if (stage !== get().activeStage) {
          get().triggerScanBeam();
        }
        if (tower !== get().activeTower) {
          (get() as any).towerAssemblyProgress = 0.01;
          let start: number | null = null;
          const dur = 600;
          const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min(1, (ts - start) / dur);
            (get() as any).towerAssemblyProgress = p;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
        set({ scrollProgress: clamped, activeStage: stage, activeTower: tower });
      }
    },

    setActiveStage: (stage) => set({ activeStage: stage }),
    setActiveTower: (tower) => {
      if (tower !== get().activeTower) {
        (get() as any).towerAssemblyProgress = 0.01;
        let start: number | null = null;
        const dur = 600;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / dur);
          (get() as any).towerAssemblyProgress = p;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        set({ activeTower: tower });
      }
    },
    openDeepDive: (projectId) => {
      try {
        if (typeof window !== 'undefined') {
          window.location.hash = `#project/${projectId}`;
        }
      } catch {}
      set({ isDeepDiveOpen: true, activeDeepDiveId: projectId });
    },
    closeDeepDive: () => {
      try {
        if (typeof window !== 'undefined') {
          window.history.pushState(null, '', window.location.pathname + window.location.search);
        }
      } catch {}
      set({ isDeepDiveOpen: false, activeDeepDiveId: null });
    },

    isTerminalOpen: false,
    openTerminal: () => set({ isTerminalOpen: true }),
    closeTerminal: () => set({ isTerminalOpen: false }),
    toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
    setHoveredSkillNode: (skill) => set({ hoveredSkillNode: skill }),
    setCursorPos: (x, y) => {
      (get() as any).cursorPos = { x, y };
    },
    addTerminalLog: (log) =>
      set((state) => ({
        terminalLogs: [...state.terminalLogs.slice(-25), log],
      })),
    setQualityTier: (tier) => {
      set({ qualityTier: tier });
      get().addTerminalLog(`GPU_TIER: Quality shifted to [${tier}]`);
    },
    degradeQualityTier: () => {
      const current = get().qualityTier;
      if (current === 'HIGH') {
        get().setQualityTier('MEDIUM');
      } else if (current === 'MEDIUM') {
        get().setQualityTier('LOW');
      }
    },
    setFps: (fps) => set({ fps }),
    setDrawCalls: (calls) => set({ drawCalls: calls }),

    setBootComplete: () => {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('compile_booted', 'true');
        }
      } catch {}
      set({ isBooting: false, bootComplete: true });
    },

    triggerShockwave: () => {
      (get() as any).shockwaveProgress = 0.01;
      let start: number | null = null;
      const duration = 750; // ms

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min(1, elapsed / duration);
        (get() as any).shockwaveProgress = p;

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          (get() as any).shockwaveProgress = 0;
        }
      };
      requestAnimationFrame(step);
    },

    triggerScanBeam: () => {
      (get() as any).scanBeamProgress = 0.01;
      let start: number | null = null;
      const duration = 650; // ms

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const p = Math.min(1, elapsed / duration);
        (get() as any).scanBeamProgress = p;

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          (get() as any).scanBeamProgress = 0;
        }
      };
      requestAnimationFrame(step);
    },

    spellWord: (target, durationMs = 2000) => {
      set({ textSpellTarget: target });
      (get() as any).textSpellProgress = 0.01;

      // Animate 0 -> 1 -> hold -> 0
      let start: number | null = null;
      const rampUp = 450;
      const hold = durationMs - 900;
      const rampDown = 450;
      const total = rampUp + Math.max(0, hold) + rampDown;

      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;

        let p = 0;
        if (elapsed < rampUp) {
          p = elapsed / rampUp;
        } else if (elapsed < rampUp + hold) {
          p = 1.0;
        } else if (elapsed < total) {
          p = 1.0 - (elapsed - rampUp - hold) / rampDown;
        } else {
          p = 0;
        }

        (get() as any).textSpellProgress = p;

        if (elapsed < total) {
          requestAnimationFrame(step);
        } else {
          (get() as any).textSpellProgress = 0;
          set({ textSpellTarget: 'NONE' });
        }
      };
      requestAnimationFrame(step);
    },
  };
});

if (typeof window !== 'undefined') {
  (window as any).__compileStore = useCompileStore;
}

