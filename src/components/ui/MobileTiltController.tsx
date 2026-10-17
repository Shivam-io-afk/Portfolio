import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useCompileStore } from '../../store/useCompileStore';

export const MobileTiltController: React.FC = () => {
  const [showPermissionChip, setShowPermissionChip] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    // Check iOS permission requirement
    const DeviceOrientation = (window as any).DeviceOrientationEvent;
    if (DeviceOrientation && typeof DeviceOrientation.requestPermission === 'function') {
      setShowPermissionChip(true);
      return;
    }

    // Direct listener for Android and other mobile browsers
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = Math.max(-10, Math.min(10, (e.gamma || 0) * 0.4));
      const beta = Math.max(-10, Math.min(10, ((e.beta || 0) - 45) * 0.4));
      useCompileStore.getState().setDeviceTilt(gamma, beta);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const requestPermission = async () => {
    try {
      const DeviceOrientation = (window as any).DeviceOrientationEvent;
      if (typeof DeviceOrientation.requestPermission === 'function') {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setShowPermissionChip(false);
          const handleOrientation = (e: DeviceOrientationEvent) => {
            const gamma = Math.max(-10, Math.min(10, (e.gamma || 0) * 0.4));
            const beta = Math.max(-10, Math.min(10, ((e.beta || 0) - 45) * 0.4));
            useCompileStore.getState().setDeviceTilt(gamma, beta);
          };
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        }
      }
    } catch {
      setShowPermissionChip(false);
    }
  };

  if (!showPermissionChip) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 md:hidden animate-fade-in">
      <button
        onClick={requestPermission}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#121318]/90 border border-[#ff5b1f]/50 text-[#ff5b1f] font-mono text-[10px] tracking-mono uppercase shadow-lg backdrop-blur-md rounded-sm"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Enable Motion</span>
      </button>
    </div>
  );
};

