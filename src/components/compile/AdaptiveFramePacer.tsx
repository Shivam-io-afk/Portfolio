import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useCompileStore } from '../../store/useCompileStore';

/**
 * Adaptive Frame Pacer:
 * - Operates with R3F frameloop="demand"
 * - Measures FPS for the first 2 seconds
 * - If the device cannot hold 58+ FPS, locks rendering to a steady 30 FPS
 *   (evenly spaced ~33.3ms intervals, rendering every 2nd rAF or time-paced)
 * - Devices that hold 58+ stay at smooth 60 FPS
 * - Pauses rendering when document is hidden (tab inactive)
 */
export const AdaptiveFramePacer: React.FC = () => {
  const { invalidate } = useThree();
  const setFps = useCompileStore((state) => state.setFps);

  useEffect(() => {
    let animId: number;
    let windowStart = performance.now();
    let frameCount = 0;
    let sampleTime = 0;
    let lock30 = false;
    let lastRenderTime = performance.now();
    let isHidden = typeof document !== 'undefined' ? document.hidden : false;

    const handleVisibility = () => {
      isHidden = document.hidden;
      if (!isHidden) {
        lastRenderTime = performance.now();
        invalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);

      if (isHidden) return;

      frameCount++;
      const elapsedWindow = now - windowStart;

      // Evaluation phase: Measure first 2 seconds
      if (sampleTime < 2000 && elapsedWindow >= 2000) {
        const measuredFps = (frameCount * 1000) / elapsedWindow;
        sampleTime += elapsedWindow;
        if (measuredFps < 58) {
          lock30 = true;
          setFps(30);
        } else {
          lock30 = false;
          setFps(60);
        }
        frameCount = 0;
        windowStart = now;
      } else if (elapsedWindow >= 1000) {
        const measuredFps = (frameCount * 1000) / elapsedWindow;
        setFps(Math.round(measuredFps));
        frameCount = 0;
        windowStart = now;
      }

      if (lock30) {
        // Enforce steady 30 FPS: render only when >= 31.5ms elapsed since last render
        if (now - lastRenderTime >= 31.5) {
          lastRenderTime = now;
          invalidate();
        }
      } else {
        // Full 60 FPS
        lastRenderTime = now;
        invalidate();
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [invalidate, setFps]);

  return null;
};

