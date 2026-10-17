import React, { useEffect, useRef } from 'react';

interface PixelBloomCanvasProps {
  activeMilestoneIndex: number;
  className?: string;
}

export const PixelBloomCanvas: React.FC<PixelBloomCanvasProps> = ({
  activeMilestoneIndex,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef<boolean>(false);
  const waveRef = useRef<{ active: boolean; startTime: number; duration: number }>({
    active: false,
    startTime: 0,
    duration: 650,
  });
  const prevIndexRef = useRef<number>(activeMilestoneIndex);

  // Trigger wave ripple on milestone index change
  useEffect(() => {
    if (prevIndexRef.current !== activeMilestoneIndex) {
      prevIndexRef.current = activeMilestoneIndex;
      waveRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 650,
      };
    }
  }, [activeMilestoneIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number = 0;
    let lastDraw = 0;
    const FRAME_INTERVAL = 33.33; // Exactly 30 FPS cap

    // Offscreen canvas for one-time static background draw
    let offscreenCanvas: HTMLCanvasElement | null = document.createElement('canvas');
    let offCtx = offscreenCanvas.getContext('2d', { alpha: true });

    // Typed arrays for high-performance memory layout
    let cellCount = 0;
    let cellX: Float32Array;
    let cellY: Float32Array;
    let cellType: Uint8Array; // 0: graphite, 1: orange, 2: white
    let cellBaseAlpha: Float32Array;
    let twinkleIndices: Uint16Array;
    let twinklePhases: Float32Array;
    let twinkleSpeeds: Float32Array;
    let lastWidth = 0;
    let lastHeight = 0;

    const rebuildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;

      // Cap DPR strictly at 1 for zero-overhead 2D fill
      canvas.width = width;
      canvas.height = height;

      if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offCtx = offscreenCanvas.getContext('2d', { alpha: true });
      }
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      const cellSize = 9;
      const gap = 3;
      const pitch = cellSize + gap;
      const cols = Math.ceil(width / pitch);
      const rows = Math.ceil(height / pitch);
      const maxPossible = cols * rows;

      // Temporary arrays to collect spawned cells
      const tempX: number[] = [];
      const tempY: number[] = [];
      const tempType: number[] = [];
      const tempAlpha: number[] = [];
      const tempTwinklers: number[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const normX = c / cols;
          // Density increases toward the right edge
          const spawnChance = 0.12 + Math.pow(normX, 1.3) * 0.72;
          if (Math.random() > spawnChance) continue;

          const roll = Math.random();
          let type = 0; // graphite
          if (roll < 0.15) {
            type = 1; // orange
          } else if (roll < 0.18) {
            type = 2; // white
          }

          const baseAlpha = 0.08 + normX * 0.42;
          const idx = tempX.length;

          tempX.push(c * pitch);
          tempY.push(r * pitch);
          tempType.push(type);
          tempAlpha.push(baseAlpha);

          // Only ~3.5% of cells are designated to twinkle
          if (Math.random() < 0.035) {
            tempTwinklers.push(idx);
          }
        }
      }

      cellCount = tempX.length;
      cellX = new Float32Array(tempX);
      cellY = new Float32Array(tempY);
      cellType = new Uint8Array(tempType);
      cellBaseAlpha = new Float32Array(tempAlpha);

      const twCount = tempTwinklers.length;
      twinkleIndices = new Uint16Array(tempTwinklers);
      twinklePhases = new Float32Array(twCount);
      twinkleSpeeds = new Float32Array(twCount);

      for (let i = 0; i < twCount; i++) {
        twinklePhases[i] = Math.random() * Math.PI * 2;
        twinkleSpeeds[i] = 1.0 + Math.random() * 1.5;
      }

      // Draw base static grid ONCE to offscreen canvas in 3 grouped fill batches
      if (offCtx) {
        offCtx.clearRect(0, 0, width, height);

        // Batch 1: Graphite
        offCtx.fillStyle = 'rgba(175, 185, 200, 0.15)';
        for (let i = 0; i < cellCount; i++) {
          if (cellType[i] === 0) {
            offCtx.fillRect(cellX[i], cellY[i], cellSize, cellSize);
          }
        }

        // Batch 2: Orange
        offCtx.fillStyle = 'rgba(255, 91, 31, 0.32)';
        for (let i = 0; i < cellCount; i++) {
          if (cellType[i] === 1) {
            offCtx.fillRect(cellX[i], cellY[i], cellSize, cellSize);
          }
        }

        // Batch 3: White sparks
        offCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < cellCount; i++) {
          if (cellType[i] === 2) {
            offCtx.fillRect(cellX[i], cellY[i], cellSize, cellSize);
          }
        }

        // Pre-warm GPU texture upload immediately on setup so mid-scroll frame doesn't hitch
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(offscreenCanvas, 0, 0);
      }
    };

    const render = (now: number) => {
      if (!isVisibleRef.current) {
        // Stop the RAF loop completely when section is off-screen
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(render);

      if (now - lastDraw < FRAME_INTERVAL) return;
      lastDraw = now;

      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0 || !offscreenCanvas) return;

      // 1. Hardware accelerated single blit of base pre-drawn grid (takes <0.05ms)
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      // 2. Overdraw ONLY the ~3.5% twinkling cells
      const tSec = now * 0.001;
      const twCount = twinkleIndices ? twinkleIndices.length : 0;

      // Batch twinkle orange
      ctx.fillStyle = 'rgba(255, 91, 31, 0.85)';
      for (let i = 0; i < twCount; i++) {
        const idx = twinkleIndices[i];
        if (cellType[idx] === 1) {
          const sine = Math.sin(tSec * twinkleSpeeds[i] + twinklePhases[i]);
          if (sine > 0.3) {
            ctx.fillRect(cellX[idx], cellY[idx], 9, 9);
          }
        }
      }

      // Batch twinkle white
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      for (let i = 0; i < twCount; i++) {
        const idx = twinkleIndices[i];
        if (cellType[idx] === 2) {
          const sine = Math.sin(tSec * twinkleSpeeds[i] + twinklePhases[i]);
          if (sine > 0.4) {
            ctx.fillRect(cellX[idx], cellY[idx], 9, 9);
          }
        }
      }

      // 3. Ripple wave on milestone transition (only draws cells within 100px wave band)
      const wave = waveRef.current;
      if (wave.active) {
        const elapsed = now - wave.startTime;
        const progress = elapsed / wave.duration;
        if (progress >= 1) {
          wave.active = false;
        } else {
          const waveFront = progress * (width * 1.25);
          ctx.fillStyle = 'rgba(255, 91, 31, 0.65)';
          for (let i = 0; i < cellCount; i += 3) {
            const dist = Math.abs(cellX[i] - waveFront);
            if (dist < 90) {
              ctx.fillRect(cellX[i], cellY[i], 9, 9);
            }
          }
        }
      }
    };

    // Setup intersection observer: pauses loop completely when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isIntersecting = entry ? entry.isIntersecting : false;
        isVisibleRef.current = isIntersecting;

        if (isIntersecting && !animId) {
          lastDraw = performance.now();
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const resizeObserver = new ResizeObserver(() => {
      rebuildGrid();
    });
    resizeObserver.observe(canvas);
    rebuildGrid();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      resizeObserver.disconnect();
      offscreenCanvas = null;
      offCtx = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};
