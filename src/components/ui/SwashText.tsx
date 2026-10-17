import React from 'react';

interface SwashTextProps {
  children: string;
  className?: string;
}

export const SwashText: React.FC<SwashTextProps> = ({ children, className = '' }) => {
  if (typeof children !== 'string') return <span className={className}>{children}</span>;

  // Split on letters S and s
  const parts = children.split(/([Ss])/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part === 'S' || part === 's') {
          return (
            <span
              key={index}
              className="font-script inline-block text-[1.28em] leading-none transform translate-y-[-0.03em] font-normal normal-case text-inherit tracking-normal"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

