import React from 'react';
import { motion } from 'framer-motion';
import { SpotlightCard } from '../ui/SpotlightCard';
import { SwashText } from '../ui/SwashText';
import { PrimaryButton } from '../ui/FloraButton';
import type { PortfolioData } from '../../data/portfolioData';

interface ExperienceAndCredentialsProps {
  experience: PortfolioData['experience'];
  certifications: PortfolioData['certifications'];
  education: PortfolioData['education'];
}

export const ExperienceAndCredentials: React.FC<ExperienceAndCredentialsProps> = ({
  experience,
  certifications,
  education,
}) => {
  return (
    <section id="experience" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10 bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Experience + Certifications */}
        <div className="space-y-12">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-flora-lime tracking-wideflora mb-2">
              <span className="w-2 h-2 bg-flora-lime" />
              <span><SwashText>TRAJECTORY // EXPERIENCE</SwashText></span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-flora text-ice-white mb-6">
              <SwashText>FIELD EXPERIENCE</SwashText>
            </h2>

            {experience.map((exp, idx) => (
              <SpotlightCard key={idx} hasLiveDot={false}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-display font-bold text-lg uppercase tracking-wideflora text-ice-white">
                    <SwashText>{exp.role}</SwashText>
                  </h3>
                  <span className="text-xs font-mono text-flora-gold px-2.5 py-0.5 bg-white/[0.04] border border-white/[0.06]">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-2 mt-4 text-xs font-normal text-ice-muted leading-relaxed list-disc list-inside">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx}>
                      <span className="text-ice-white/90">{pt}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            ))}
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-display font-bold text-2xl uppercase tracking-flora text-ice-white mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-flora-lime" />
              <span><SwashText>VERIFIED CERTIFICATIONS</SwashText></span>
            </h3>

            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <SpotlightCard key={idx} className="p-5 flex items-center justify-between group">
                  <div>
                    <h4 className="font-display font-bold text-sm text-ice-white uppercase group-hover:text-flora-lime transition-colors">
                      <SwashText>{cert.title}</SwashText>
                    </h4>
                    <div className="font-mono text-xs text-ice-dim mt-1">
                      {cert.issuer} {cert.date && `• ${cert.date}`}
                    </div>
                  </div>

                  <PrimaryButton href={cert.verificationUrl} target="_blank" rel="noreferrer">
                    VERIFY
                  </PrimaryButton>
                </SpotlightCard>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Education */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-flora-lime tracking-wideflora mb-2">
            <span className="w-2 h-2 bg-flora-lime" />
            <span><SwashText>ACADEMIC RECORD // CREDENTIALS</SwashText></span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-flora text-ice-white mb-6">
            <SwashText>EDUCATION</SwashText>
          </h2>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <SpotlightCard key={idx} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-ice-white uppercase tracking-wideflora">
                      <SwashText>{edu.degree}</SwashText>
                    </h3>
                    <p className="font-mono text-xs text-ice-muted mt-1">
                      {edu.institution}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-flora-lime/10 text-flora-lime border border-flora-lime/30 font-bold shrink-0">
                    {edu.score}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-glass-border flex items-center justify-between text-[11px] font-mono text-ice-dim">
                  <span>TIMELINE</span>
                  <span className="text-flora-gold">{edu.period}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
