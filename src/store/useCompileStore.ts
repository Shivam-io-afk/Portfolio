import { create } from 'zustand';

export type StageId = 0 | 1 | 2 | 3 | 4;

export interface CompileState {
  scrollProgress: number; // 0.0 to 1.0
  activeStage: StageId;
  activeTower: number; // 0: Onbuggy, 1: TaskFlow, 2: Khatabook, 3: Zoom
  hoveredSkillNode: string | null;
  cursorPos: { x: number; y: number };
  terminalLogs: string[];
  
  setScrollProgress: (progress: number) => void;
  setActiveStage: (stage: StageId) => void;
  setActiveTower: (tower: number) => void;
  setHoveredSkillNode: (skill: string | null) => void;
  setCursorPos: (x: number, y: number) => void;
  addTerminalLog: (log: string) => void;
}

export const useCompileStore = create<CompileState>((set) => ({
  scrollProgress: 0,
  activeStage: 0,
  activeTower: 0,
  hoveredSkillNode: null,
  cursorPos: { x: 0, y: 0 },
  terminalLogs: [
    'INIT_SYSTEM: Initializing runtime pipeline...',
    'RESOLVE: Host architecture [x86_64-win32-v8]',
    'ATTACH: WebGL2 context initialized @ 12000 bits',
    'SOURCE: Stage 0 mounted. Ready for compilation.',
  ],

  setScrollProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    // Determine activeStage from progress (0 to 1 across 5 segments)
    // 0: [0, 0.2), 1: [0.2, 0.4), 2: [0.4, 0.65), 3: [0.65, 0.85), 4: [0.85, 1.0]
    let stage: StageId = 0;
    if (clamped >= 0.85) stage = 4;
    else if (clamped >= 0.62) stage = 3;
    else if (clamped >= 0.38) stage = 2;
    else if (clamped >= 0.15) stage = 1;
    else stage = 0;

    set({ scrollProgress: clamped, activeStage: stage });
  },

  setActiveStage: (stage) => set({ activeStage: stage }),
  setActiveTower: (tower) => set({ activeTower: tower }),
  setHoveredSkillNode: (skill) => set({ hoveredSkillNode: skill }),
  setCursorPos: (x, y) => set({ cursorPos: { x, y } }),
  addTerminalLog: (log) =>
    set((state) => ({
      terminalLogs: [...state.terminalLogs.slice(-25), log],
    })),
}));
