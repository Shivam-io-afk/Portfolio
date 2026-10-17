import React, { useEffect, useRef } from 'react';

interface PixelBloomCanvasProps {
  activeMilestoneIndex: number;
  className?: string;
}

interface PixelCell {
  x: number;
  y: number;
  size: number;
  type: 'graphite' | 'orange' | 'white';
  baseAlpha: number;
  phase: number;
  speed: number;
}

export const PixelBloomCanvas: React.FC<PixelBloomCanvasProps> = ({
  activeMilestoneIndex,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cellsRef = useRef<PixelCell[]>([]);
  const isVisibleRef = useRef<boolean>(true);
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

    let animId: number;
    let lastDraw = 0;
    const FRAME_INTERVAL = 33.3; // ~30 FPS throttle for GPU/CPU efficiency

    // Setup intersection observer to pause when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry ? entry.isIntersecting : false;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const rebuildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = rect.width;
      const height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cellSize = 9;
      const gap = 3;
      const pitch = cellSize + gap;
      const cols = Math.ceil(width / pitch);
      const rows = Math.ceil(height / pitch);

      const cells: PixelCell[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const normX = c / cols; // 0 (left) to 1 (right)
          // Density increases toward the right: left edge ~10% probability, right edge ~80%
          const spawnChance = 0.12 + Math.pow(normX, 1.3) * 0.72;
          if (Math.random() > spawnChance) continue;

          // Type distribution: 15% orange, 3% white spark, 82% graphite
          const roll = Math.random();
          let type: 'graphite' | 'orange' | 'white' = 'graphite';
          if (roll < 0.15) {
            type = 'orange';
          } else if (roll < 0.18) {
            type = 'white';
          }

          // Base alpha also increases rightward
          const baseAlpha = 0.08 + normX * 0.42;

          cells.push({
            x: c * pitch,
            y: r * pitch,
            size: cellSize,
            type,
            baseAlpha,
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 1.4,
          });
        }
      }

      cellsRef.current = cells;
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuildGrid();
    });
    resizeObserver.observe(canvas);
    rebuildGrid();

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      if (!isVisibleRef.current) return;
      if (now - lastDraw < FRAME_INTERVAL) return;
      lastDraw = now;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      const cells = cellsRef.current;
      const wave = waveRef.current;
      let waveFront = -1;
      let waveActive = false;

      if (wave.active) {
        const elapsed = now - wave.startTime;
        const progress = Math.min(elapsed / wave.duration, 1);
        if (progress >= 1) {
          wave.active = false;
        } else {
          waveActive = true;
          // Sweep from x = 0 to x = width * 1.2
          waveFront = progress * (width * 1.25);
        }
      }

      const tSec = now * 0.001;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // Slow subtle twinkle
        const twinkle = 0.65 + 0.35 * Math.sin(tSec * cell.speed + cell.phase);
        let alpha = cell.baseAlpha * twinkle;

        // Wave sweep effect: distance from wave front
        if (waveActive) {
          const dist = Math.abs(cell.x - waveFront);
          const waveRadius = 140;
          if (dist < waveRadius) {
            const waveBoost = (1 - dist / waveRadius);
            alpha = Math.min(alpha + waveBoost * 0.6, 0.95);
          }
        }

        // Draw crisp rectangle (zero CSS filters, pure 2D fill)
        if (cell.type === 'orange') {
          ctx.fillStyle = `rgba(255, 91, 31, ${alpha * 1.3})`;
        } else if (cell.type === 'white') {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.5})`;
        } else {
          ctx.fillStyle = `rgba(180, 190, 205, ${alpha * 0.55})`;
        }

        ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      resizeObserver.disconnect();
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

