import React, { useEffect, useRef, useState, useCallback } from 'react';

interface KumoFilmCanvasProps {
  onSceneChange?: (sceneName: string, sceneIndex: number, isLight: boolean) => void;
}

const TOTAL_FRAMES = 90;
const PRELOAD_COUNT = 30;

export const KumoFilmCanvas: React.FC<KumoFilmCanvasProps> = ({ onSceneChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const currentFrameRef = useRef<number>(-1);
  const [loadedCount, setLoadedCount] = useState<number>(0);

  // Helper to format frame path
  const getFramePath = (index: number) => {
    const padded = String(index).padStart(3, '0');
    return `/frames/frame_${padded}.jpg`;
  };

  // Draw frame to canvas with cover-fit
  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Avoid redundant draw
    if (currentFrameRef.current === frameIdx && loadedCount > 0) return;

    const img = imagesRef.current.get(frameIdx);
    if (img && img.complete && img.naturalWidth > 0) {
      currentFrameRef.current = frameIdx;
      renderImage(ctx, canvas, img);
      return;
    }

    // Fallback: draw nearest loaded frame searching entire sequence
    for (let offset = 1; offset <= TOTAL_FRAMES; offset++) {
      const fallbackBefore = imagesRef.current.get(frameIdx - offset);
      if (fallbackBefore && fallbackBefore.complete && fallbackBefore.naturalWidth > 0) {
        renderImage(ctx, canvas, fallbackBefore);
        return;
      }
      const fallbackAfter = imagesRef.current.get(frameIdx + offset);
      if (fallbackAfter && fallbackAfter.complete && fallbackAfter.naturalWidth > 0) {
        renderImage(ctx, canvas, fallbackAfter);
        return;
      }
    }
  }, [loadedCount]);

  const renderImage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    // Cover-fit math
    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const nw = iw * ratio;
    const nh = ih * ratio;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, nx, ny, nw, nh);
  };

  // 1. Initial preload of first 30 frames PLUS keyframes for each section
  useEffect(() => {
    let active = true;

    const loadFrame = (idx: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesRef.current.has(idx)) {
          resolve(imagesRef.current.get(idx)!);
          return;
        }
        const img = new Image();
        img.src = getFramePath(idx);
        img.onload = () => {
          if (active) {
            imagesRef.current.set(idx, img);
            setLoadedCount((c) => c + 1);
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx && (currentFrameRef.current === idx || currentFrameRef.current === -1)) {
                currentFrameRef.current = idx;
                renderImage(ctx, canvas, img);
              }
            }
          }
          resolve(img);
        };
        img.onerror = () => resolve(img);
      });
    };

    // Preload initial frames + keyframes (Scene 1: 1..20, Scene 2: 35, Scene 3: 55, Scene 4: 70, Scene 5: 85, 90)
    const keyframes = [1, 5, 10, 15, 20, 25, 30, 35, 45, 55, 65, 75, 85, 90];
    Promise.all(keyframes.map(loadFrame)).then(() => {
      if (!active) return;
      // Stagger load all remaining frames
      const remaining: number[] = [];
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (!imagesRef.current.has(i)) remaining.push(i);
      }
      let rIdx = 0;
      const loadNext = () => {
        if (!active || rIdx >= remaining.length) return;
        loadFrame(remaining[rIdx]).then(() => {
          rIdx++;
          setTimeout(loadNext, 12);
        });
      };
      loadNext();
    });

    return () => {
      active = false;
    };
  }, [drawFrame]);

  // 2. Resize listener & DPR handling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2.0);

      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      // Redraw current frame
      if (currentFrameRef.current > 0) {
        drawFrame(currentFrameRef.current);
      } else {
        drawFrame(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // 3. Scroll tracking & frame scrubbing
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      // Map progress to frame 1..90
      const targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));

      // Determine scene
      let scene = 'SC 01';
      let sceneIdx = 1;
      let isLight = false;

      if (progress < 0.22) {
        scene = 'SC 01'; // Autumn Avenue
        sceneIdx = 1;
        isLight = false;
      } else if (progress < 0.45) {
        scene = 'SC 02'; // Rooftops
        sceneIdx = 2;
        isLight = false;
      } else if (progress < 0.68) {
        scene = 'SC 03'; // Through Clouds
        sceneIdx = 3;
        isLight = true; // light clouds!
      } else if (progress < 0.88) {
        scene = 'SC 04'; // High Atmosphere
        sceneIdx = 4;
        isLight = false;
      } else {
        scene = 'SC 05'; // Open Sky
        sceneIdx = 5;
        isLight = false;
      }

      if (onSceneChange) {
        onSceneChange(scene, sceneIdx, isLight);
      }

      drawFrame(targetFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame, onSceneChange]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/frames/frame_001.jpg')",
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover will-change-transform"
      />
    </div>
  );
};
