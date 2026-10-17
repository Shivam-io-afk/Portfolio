import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxDistance?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxDistance = 8,
  className = '',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchOrReduced(isTouch || reducedMotion);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchOrReduced || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const distance = Math.hypot(dx, dy);
    if (distance === 0) return;

    // Pull toward cursor up to maxDistance
    const factor = Math.min(1, distance / (rect.width * 0.8));
    const pullX = (dx / distance) * factor * maxDistance;
    const pullY = (dy / distance) * factor * maxDistance;

    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseEnter = () => {
    if (!isTouchOrReduced) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `translate3d(${offset.x}px, ${offset.y}px, 0)`
          : 'translate3d(0, 0, 0)',
        transition: isHovered
          ? 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)'
          : 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

