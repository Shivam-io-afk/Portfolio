import React, { useState, useEffect } from 'react';

interface ScatterTextProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div' | 'p';
}

export const ScatterText: React.FC<ScatterTextProps> = ({
  children,
  className = '',
  as = 'span',
}) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Reveal letters quickly, then convert to plain text to avoid persistent GPU layers
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const Tag = as as any;

  if (revealed) {
    return <Tag className={`inline-block ${className}`}>{children}</Tag>;
  }

  return (
    <Tag className={`inline-block ${className}`}>
      {children.split('').map((char, idx) => (
        <span
          key={idx}
          style={{
            display: 'inline-block',
            animation: `fadeInUp 0.35s ease forwards ${(idx * 0.02).toFixed(2)}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Tag>
  );
};
