import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioData } from '../../data/portfolioData';
import { CompileHeading } from '../ui/CompileHeading';
import { CompileLabel } from '../ui/CompileLabel';

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
    <section id="experience" className="relative py-28 px-4 sm:px-10 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-start">
        {/* Left Column: Field Experience + Certifications */}
        <div className="space-y-12 sm:space-y-16">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] shrink-0" />
              <CompileLabel text="STAGE 03 /// RUNTIME.TRAJECTORY" />
            </div>
            <CompileHeading
              as="h2"
              text="Field"
              accent="Experience."
              className="font-grotesk text-3xl sm:text-4xl text-white font-bold tracking-tight mb-8"
            />

            <div className="compile-card p-6 sm:p-8 space-y-0 divide-y divide-[#d8dde6]/10">
              {experience.map((exp, idx) => (
                <div key={idx} className="py-6 first:pt-0 last:pb-0 group">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#ff5b1f] font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-grotesk text-lg sm:text-xl text-white group-hover:text-[#ff5b1f] transition-colors font-semibold">
                        {exp.role}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/60 border border-[#d8dde6]/10 px-2 py-0.5">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-2 mt-4 text-xs font-grotesk text-[#d8dde6]/80 leading-relaxed list-none pl-5 border-l border-[#ff5b1f]/30">
                    {exp.points.map((pt, pIdx) => (
                      <li key={pIdx} className="relative before:content-['—'] before:absolute before:-left-4 before:text-[#ff5b1f]">
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <CompileHeading
              as="h3"
              text="Verified"
              accent="Credentials."
              className="font-grotesk text-2xl sm:text-3xl text-white font-bold tracking-tight mb-6"
            />

            <div className="compile-card p-6 sm:p-8 space-y-0 divide-y divide-[#d8dde6]/10">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="pr-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] text-[#ff5b1f]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-grotesk text-sm sm:text-base text-white group-hover:text-[#ff5b1f] transition-colors font-medium">
                        {cert.title}
                      </h4>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-mono text-[#d8dde6]/50 mt-1 pl-4">
                      {cert.issuer} {cert.date && `• ${cert.date}`}
                    </div>
                  </div>

                  {cert.verificationUrl && (
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#d8dde6]/20 hover:border-[#ff5b1f] text-white hover:text-[#ff5b1f] font-mono text-[10px] uppercase tracking-mono transition-all shrink-0"
                    >
                      <span>Verify</span>
                      <ArrowUpRight className="w-3 h-3 text-[#ff5b1f]" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Education */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5b1f] shrink-0" />
            <CompileLabel text="ACADEMIC FOUNDATIONS" />
          </div>
          <CompileHeading
            as="h2"
            text="Education"
            accent="History."
            className="font-grotesk text-3xl sm:text-4xl text-white font-bold tracking-tight mb-8"
          />

          <div className="compile-card p-6 sm:p-8 space-y-0 divide-y divide-[#d8dde6]/10">
            {education.map((edu, idx) => (
              <div key={idx} className="py-5 first:pt-0 last:pb-0 group">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#ff5b1f] font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-grotesk text-lg sm:text-xl text-white group-hover:text-[#ff5b1f] transition-colors font-semibold">
                        {edu.degree}
                      </h3>
                      <p className="font-grotesk text-xs text-[#d8dde6]/60 mt-0.5">
                        {edu.institution}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-[#ff5b1f] font-semibold border border-[#ff5b1f]/30 px-2 py-0.5 shrink-0 bg-[#ff5b1f]/10">
                    {edu.score}
                  </span>
                </div>

                <div className="mt-3 pl-6 flex items-center justify-between text-[10px] font-mono tracking-mono text-[#d8dde6]/40 uppercase">
                  <span>TIMELINE</span>
                  <span className="text-[#d8dde6]/70">{edu.period}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
