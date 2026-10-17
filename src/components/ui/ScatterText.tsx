import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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
  const characters = useMemo(() => {
    return children.split('').map((char, index) => {
      // Deterministic pseudo-random seed per index
      const seed = Math.sin(index * 999) * 10000;
      const randomDelay = (Math.abs(seed - Math.floor(seed)) * 0.45);
      const randomY = (Math.abs(Math.cos(index * 333)) - 0.5) * 14;
      return { char, delay: randomDelay, y: randomY };
    });
  }, [children]);

  const Tag = as as any;

  return (
    <Tag className={`inline-block ${className}`}>
      {characters.map((item, idx) => {
        if (item.char === ' ') {
          return <span key={idx}>&nbsp;</span>;
        }

        return (
          <motion.span
            key={idx}
            initial={{
              opacity: 0,
              filter: 'blur(8px)',
              y: item.y,
              scale: 0.94,
            }}
            whileInView={{
              opacity: 1,
              filter: 'blur(0px)',
              y: 0,
              scale: 1,
            }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.55,
              delay: item.delay,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="inline-block will-change-transform will-change-filter"
          >
            {item.char}
          </motion.span>
        );
      })}
    </Tag>
  );
};
