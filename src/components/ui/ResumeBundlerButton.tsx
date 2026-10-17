import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

interface ResumeBundlerButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const ResumeBundlerButton: React.FC<ResumeBundlerButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const [bundling, setBundling] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [complete, setComplete] = useState<boolean>(false);

  const fallbackUrl = 'https://drive.google.com/file/d/1zZPCChlTaYZSdnu78lJLoZvV-AgCJFJJ/view';

  const handleDownload = () => {
    if (bundling) return;
    setBundling(true);
    setProgress(0);
    setComplete(false);

    const totalSteps = 8;
    let step = 0;
    const intervalTime = 800 / totalSteps; // 800ms total duration

    const timer = setInterval(() => {
      step++;
      setProgress(step / totalSteps);

      if (step >= totalSteps) {
        clearInterval(timer);
        setComplete(true);

        // Trigger file download
        try {
          const link = document.createElement('a');
          link.href = '/resume.pdf';
          link.download = 'Shivam_Mishra_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch {
          window.open(fallbackUrl, '_blank');
        }

        setTimeout(() => {
          setBundling(false);
          setComplete(false);
          setProgress(0);
        }, 2200);
      }
    }, intervalTime);
  };

  const getProgressBlocks = () => {
    const totalBlocks = 8;
    const filled = Math.round(progress * totalBlocks);
    return '█'.repeat(filled) + '░'.repeat(totalBlocks - filled);
  };

  return (
    <MagneticButton>
      <button
        onClick={handleDownload}
        disabled={bundling}
        className={`group relative flex items-center gap-2 font-mono text-[11px] uppercase tracking-mono transition-all border ${
          complete
            ? 'border-[#4ade80]/60 bg-[#4ade80]/10 text-[#4ade80]'
            : bundling
            ? 'border-[#ff5b1f]/60 bg-[#121318] text-[#ff5b1f]'
            : 'border-[#d8dde6]/15 hover:border-[#ff5b1f]/60 bg-[#121318]/90 text-[#d8dde6]/90 hover:text-white'
        } ${className}`}
        aria-label="Download resume"
      >
        {bundling ? (
          <div className="flex items-center gap-2 px-3 py-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] animate-ping" />
            <span>bundling resume.pdf {getProgressBlocks()} {Math.round(progress * 100)}%</span>
            {complete && <Check className="w-3.5 h-3.5 text-[#4ade80]" />}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Download className="w-3.5 h-3.5 text-[#ff5b1f] group-hover:translate-y-0.5 transition-transform" />
            <span>{variant === 'compact' ? 'RESUME' : 'DOWNLOAD RESUME'}</span>
            <span className="text-[9px] text-[#d8dde6]/40 hidden sm:inline">[.PDF]</span>
          </div>
        )}
      </button>
    </MagneticButton>
  );
};

