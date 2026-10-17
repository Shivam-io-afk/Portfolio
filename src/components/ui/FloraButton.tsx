import React from 'react';
import { SwashText } from './SwashText';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  target?: string;
  rel?: string;
  children: string;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  href,
  target,
  rel,
  children,
  className = '',
  ...props
}) => {
  const content = (
    <div className={`inline-flex items-stretch group cursor-pointer ${className}`}>
      {/* White Rectangle with Black Uppercase text */}
      <span className="px-5 py-2.5 bg-white text-black font-display font-semibold text-xs tracking-wideflora uppercase transition-colors group-hover:bg-flora-ice flex items-center">
        <SwashText>{children}</SwashText>
      </span>
      {/* Attached Lime Square Arrow Button */}
      <span className="w-10 bg-flora-lime text-black flex items-center justify-center font-bold text-sm transition-transform group-hover:translate-x-0.5 group-hover:bg-[#a6ec65]">
        →
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block focus-visible:outline-none">
        {content}
      </a>
    );
  }

  return (
    <button {...props} className="inline-block focus-visible:outline-none">
      {content}
    </button>
  );
};

export const SecondaryButton: React.FC<PrimaryButtonProps> = ({
  href,
  target,
  rel,
  children,
  className = '',
  ...props
}) => {
  const content = (
    <div
      className={`px-5 py-2.5 bg-glass-surface backdrop-blur-glass border border-flora-lime/50 text-flora-lime hover:border-flora-lime hover:bg-flora-lime/10 font-display font-semibold text-xs tracking-wideflora uppercase transition-all flex items-center gap-2 ${className}`}
    >
      <SwashText>{children}</SwashText>
    </div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className="inline-block focus-visible:outline-none">
        {content}
      </a>
    );
  }

  return (
    <button {...props} className="inline-block focus-visible:outline-none">
      {content}
    </button>
  );
};

