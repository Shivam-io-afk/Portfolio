import React, { useRef, useState, useEffect } from 'react';

export interface DirectionalButtonProps {
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  download?: boolean | string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  fillColor?: 'orange' | 'white';
  textColorClass?: string;
  className?: string;
  children: React.ReactNode;
  'data-cursor'?: string;
  'aria-label'?: string;
}

type Edge = 'top' | 'right' | 'bottom' | 'left';

function getClosestEdge(e: React.MouseEvent<HTMLElement>, el: HTMLElement): Edge {
  const rect = el.getBoundingClientRect();
  const dTop = Math.abs(e.clientY - rect.top);
  const dBottom = Math.abs(e.clientY - rect.bottom);
  const dLeft = Math.abs(e.clientX - rect.left);
  const dRight = Math.abs(e.clientX - rect.right);
  const min = Math.min(dTop, dBottom, dLeft, dRight);
  if (min === dTop) return 'top';
  if (min === dRight) return 'right';
  if (min === dBottom) return 'bottom';
  return 'left';
}

function getTranslateForEdge(edge: Edge): string {
  switch (edge) {
    case 'top':
      return 'translate3d(0, -101%, 0)';
    case 'bottom':
      return 'translate3d(0, 101%, 0)';
    case 'left':
      return 'translate3d(-101%, 0, 0)';
    case 'right':
      return 'translate3d(101%, 0, 0)';
  }
}

export const DirectionalButton: React.FC<DirectionalButtonProps> = ({
  as = 'button',
  href,
  target,
  rel,
  type = 'button',
  download,
  disabled,
  onClick,
  fillColor = 'orange',
  textColorClass,
  className = '',
  children,
  'data-cursor': dataCursor,
  'aria-label': ariaLabel,
}) => {
  const buttonRef = useRef<HTMLElement | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchOrReduced(isTouch || reducedMotion);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || isTouchOrReduced || !buttonRef.current || !fillRef.current) {
      setIsHovered(true);
      return;
    }
    const edge = getClosestEdge(e, buttonRef.current);
    const initialTranslate = getTranslateForEdge(edge);

    // Position fill at entering edge without transition
    const fillEl = fillRef.current;
    fillEl.style.transition = 'none';
    fillEl.style.transform = initialTranslate;
    fillEl.style.opacity = '1';

    // Force reflow and slide in
    void fillEl.offsetHeight;

    requestAnimationFrame(() => {
      fillEl.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
      fillEl.style.transform = 'translate3d(0, 0, 0)';
      setIsHovered(true);
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled || isTouchOrReduced || !buttonRef.current || !fillRef.current) {
      setIsHovered(false);
      return;
    }
    const edge = getClosestEdge(e, buttonRef.current);
    const exitTranslate = getTranslateForEdge(edge);

    const fillEl = fillRef.current;
    fillEl.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
    fillEl.style.transform = exitTranslate;
    setIsHovered(false);
  };

  const fillBg = fillColor === 'white' ? '#ffffff' : '#ff5b1f';

  const commonProps = {
    ref: (el: any) => {
      buttonRef.current = el;
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
    'data-cursor': dataCursor,
    'aria-label': ariaLabel,
    className: `directional-button relative overflow-hidden inline-flex items-center justify-center select-none group transition-colors duration-200 ${className}`,
    style: {
      willChange: 'transform',
    },
  };

  const content = (
    <>
      {/* Directional Fill Span */}
      <span
        ref={fillRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 origin-center"
        style={{
          backgroundColor: fillBg,
          transform: 'translate3d(0, -101%, 0)',
          opacity: 0,
        }}
      />
      {/* Interactive Content */}
      <span
        className={`relative z-10 w-full h-full flex items-center justify-center transition-colors duration-200 ${
          isHovered
            ? 'text-[#07080a]'
            : textColorClass || ''
        }`}
      >
        {children}
      </span>
    </>
  );

  if (as === 'a' && href) {
    return (
      <a
        {...commonProps}
        href={href}
        target={target}
        rel={rel}
        download={download}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...commonProps}
      type={type}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default DirectionalButton;

