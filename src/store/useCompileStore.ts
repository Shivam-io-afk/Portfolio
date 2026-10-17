import { create } from 'zustand';
import { QualityTier } from '../config/gpuTiers';

export type StageId = 0 | 1 | 2 | 3 | 4;

export interface CompileState {
  scrollProgress: number; // 0.0 to 1.0 (read via getState() inside useFrame/GSAP)
  activeStage: StageId;
  activeTower: number; // 0: Onbuggy, 1: TaskFlow, 2: Khatabook, 3: Zoom
  hoveredSkillNode: string | null;
  cursorPos: { x: number; y: number };
  terminalLogs: string[];
  qualityTier: QualityTier;
  fps: number;
  drawCalls: number;
  
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
}

export const useCompileStore = create<CompileState>((set, get) => ({
  scrollProgress: 0,
  activeStage: 0,
  activeTower: 0,
  hoveredSkillNode: null,
  cursorPos: { x: 0, y: 0 },
  qualityTier: 'HIGH',
  fps: 60,
  drawCalls: 0,
  terminalLogs: [
    'INIT_SYSTEM: Initializing runtime pipeline...',
    'RESOLVE: Host architecture [x86_64-win32-v8]',
    'ATTACH: WebGL2 context initialized @ HIGH tier',
    'SOURCE: Stage 0 mounted. Ready for compilation.',
  ],

  setScrollProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    // Direct assignment to avoid triggering re-renders for consumers reading via getState() in useFrame
    (get() as any).scrollProgress = clamped;

    // Determine activeStage from progress (matching section scroll ratios)
    let stage: StageId = 0;
    if (clamped >= 0.94) stage = 4;
    else if (clamped >= 0.52) stage = 3;
    else if (clamped >= 0.40) stage = 2;
    else if (clamped >= 0.08) stage = 1;
    else stage = 0;

    // Also determine activeTower if in Stage 1 (0.08 -> 0.39)
    let tower = get().activeTower;
    if (clamped >= 0.08 && clamped < 0.39) {
      const towerNorm = (clamped - 0.08) / 0.31;
      tower = Math.min(3, Math.max(0, Math.floor(towerNorm * 4)));
    }

    // ONLY notify Zustand subscribers when stage or tower index ACTUALLY changes
    if (stage !== get().activeStage || tower !== get().activeTower) {
      set({ scrollProgress: clamped, activeStage: stage, activeTower: tower });
    }
  },

  setActiveStage: (stage) => set({ activeStage: stage }),
  setActiveTower: (tower) => set({ activeTower: tower }),
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
}));
