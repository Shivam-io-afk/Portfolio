import React, { useEffect, useState } from 'react';

export const CursorGlow: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button'
      );
    };

    const updateTrail = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.12,
        y: prev.y + (pos.y - prev.y) * 0.12,
      }));
      animId = requestAnimationFrame(updateTrail);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [pos.x, pos.y]);

  return (
    <>
      {/* 1. Large Atmospheric Heat Haze Aura */}
      <div
        className="pointer-events-none fixed z-20 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
          width: isPointer ? '480px' : '380px',
          height: isPointer ? '480px' : '380px',
          background: 'radial-gradient(circle, rgba(255, 59, 0, 0.12) 0%, rgba(230, 0, 57, 0.05) 45%, transparent 70%)',
          filter: 'blur(35px)',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
      />

      {/* 2. Sharp Magma Spark Point */}
      <div
        className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isPointer ? '12px' : '6px',
          height: isPointer ? '12px' : '6px',
          borderRadius: '50%',
          backgroundColor: '#ffaa33',
          boxShadow: '0 0 16px 2px #ff3b00',
          transition: 'width 0.2s, height 0.2s',
        }}
      />
    </>
  );
};

