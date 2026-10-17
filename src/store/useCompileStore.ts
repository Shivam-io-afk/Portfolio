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

  // Phase 6: Alive Details
  scrollVelocity: number;
  matrixMode: boolean;
  matrixProgress: number;
  is404: boolean;
  localTimeTheme: { period: string; color: string; tag: string };
  deviceTilt: { gamma: number; beta: number };
  setScrollVelocity: (v: number) => void;
  triggerMatrixMode: () => void;
  setIs404: (val: boolean) => void;
  setDeviceTilt: (gamma: number, beta: number) => void;
  
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

export const getLocalTimeTheme = () => {
  const hour = new Date().getHours();
  // 5–9 dawn gold #ffb347
  // 9–17 signal orange #ff5b1f
  // 17–20 sunset coral #ff7a59
  // 20–5 night blue #5b8cff
  if (hour >= 5 && hour < 9) {
    return { period: 'DAWN BUILD', color: '#ffb347', tag: 'DAWN' };
  } else if (hour >= 9 && hour < 17) {
    return { period: 'DAY BUILD', color: '#ff5b1f', tag: 'DAY' };
  } else if (hour >= 17 && hour < 20) {
    return { period: 'SUNSET BUILD', color: '#ff7a59', tag: 'SUNSET' };
  } else {
    return { period: 'NIGHT BUILD', color: '#5b8cff', tag: 'NIGHT' };
  }
};

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

    // Phase 6: Alive Details
    scrollVelocity: 0,
    matrixMode: false,
    matrixProgress: 0,
    is404: false,
    localTimeTheme: (() => {
      const theme = getLocalTimeTheme();
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--accent-color', theme.color);
      }
      return theme;
    })(),
    deviceTilt: { gamma: 0, beta: 0 },
    setScrollVelocity: (v) => {
      (get() as any).scrollVelocity = v;
    },
    setDeviceTilt: (gamma, beta) => {
      (get() as any).deviceTilt = { gamma, beta };
    },
    setIs404: (val) => set({ is404: val }),
    triggerMatrixMode: () => {
      set({ matrixMode: true });
      (get() as any).matrixProgress = 1.0;
      get().addTerminalLog('EASTER_EGG: Matrix rain protocol engaged [5s]');
      setTimeout(() => {
        let start: number | null = null;
        const dur = 800;
        const fadeOut = (ts: number) => {
          if (!start) start = ts;
          const p = Math.max(0, 1 - (ts - start) / dur);
          (get() as any).matrixProgress = p;
          if (p > 0) {
            requestAnimationFrame(fadeOut);
          } else {
            set({ matrixMode: false });
            (get() as any).matrixProgress = 0;
          }
        };
        requestAnimationFrame(fadeOut);
      }, 5000);
    },

    terminalLogs: [
      'INIT_SYSTEM: Initializing runtime pipeline...',
      'RESOLVE: Host architecture [x86_64-win32-v8]',
      'ATTACH: WebGL2 context initialized @ HIGH tier',
      'SOURCE: Stage 0 mounted. Ready for compilation.',
    ],

    setScrollProgress: (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));

      let tower = get().activeTower;
      if (clamped >= 0.07 && clamped < 0.38) {
        const towerNorm = (clamped - 0.07) / 0.31;
        tower = Math.min(4, Math.max(0, Math.floor(towerNorm * 5)));
      }

      if (Math.abs(get().scrollProgress - clamped) < 0.00001 && get().activeTower === tower) {
        return;
      }

      const updates: Partial<CompileState> = { scrollProgress: clamped };

      if (tower !== get().activeTower) {
        updates.activeTower = tower;
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

      set(updates);
    },

    setActiveStage: (stage) => {
      if (get().activeStage !== stage) {
        get().triggerScanBeam();
        set({ activeStage: stage });
      }
    },
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
      set({ isDeepDiveOpen: true, activeDeepDiveId: projectId });
    },
    closeDeepDive: () => {
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

