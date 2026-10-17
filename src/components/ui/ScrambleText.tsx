import React, { useState, useEffect } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
}

const CHARS = 'ABCDEF0123456789_<>[]#$*+-~%^';

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  className = '',
  trigger = true,
}) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const totalFrames = text.length * 2.5;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration / 2.5) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      iteration += 1;
      if (iteration > totalFrames) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [text, trigger]);

  return <span className={className}>{displayText}</span>;
};

