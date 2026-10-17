import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { ScatterText } from '../ui/ScatterText';

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
    <section id="experience" className="relative py-28 px-6 sm:px-12 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Column: Field Experience + Certifications */}
        <div className="space-y-16">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
              <span>SCENE 04 // TRAJECTORY & EXPERIENCE</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
              <ScatterText>Field Experience.</ScatterText>
            </h2>

            <div className="space-y-0 divide-y divide-white/15">
              {experience.map((exp, idx) => (
                <div key={idx} className="py-7 group">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-kumo-orange font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-kumo-orange transition-colors">
                        {exp.role}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-mono text-white/50 border border-white/10 px-2 py-0.5">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2 mt-4 text-xs font-sans text-white/70 leading-relaxed list-none pl-6 border-l border-white/15">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx} className="relative before:content-['—'] before:absolute before:-left-5 before:text-kumo-orange">
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-tight mb-6 flex items-center gap-2">
              <ScatterText>Verified Credentials.</ScatterText>
            </h3>

            <div className="space-y-0 divide-y divide-white/15">
              {certifications.map((cert, idx) => (
                <div key={idx} className="py-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                  <div className="pr-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-kumo-orange">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-serif text-base sm:text-lg text-white group-hover:text-kumo-orange transition-colors">
                        {cert.title}
                      </h4>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-mono text-white/50 mt-1 pl-5">
                      {cert.issuer} {cert.date && `• ${cert.date}`}
                    </div>
                  </div>

                  {cert.verificationUrl && (
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 border border-white/15 hover:border-kumo-orange text-white hover:text-kumo-orange font-mono text-[10px] uppercase tracking-mono transition-all shrink-0"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="w-3 h-3 text-kumo-orange" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Education */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-mono text-kumo-orange mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-kumo-orange" />
            <span>ACADEMIC FOUNDATIONS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-tight mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            <ScatterText>Education History.</ScatterText>
          </h2>

          <div className="space-y-0 divide-y divide-white/15">
            {education.map((edu, idx) => (
              <div key={idx} className="py-6 group">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-kumo-orange font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-white group-hover:text-kumo-orange transition-colors">
                        {edu.degree}
                      </h3>
                      <p className="font-sans text-xs text-white/60 mt-0.5">
                        {edu.institution}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-kumo-orange font-semibold border border-kumo-orange/30 px-2 py-0.5 shrink-0">
                    {edu.score}
                  </span>
                </div>

                <div className="mt-3 pl-7 flex items-center justify-between text-[10px] font-mono tracking-mono text-white/40 uppercase">
                  <span>TIMELINE</span>
                  <span className="text-white/60">{edu.period}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
