import React from 'react';
import { Award, GraduationCap, Briefcase, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { SpotlightCard } from '../ui/SpotlightCard';
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
    <section id="experience" className="relative py-24 px-6 max-w-6xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Experience & Certifications Column */}
        <div className="space-y-12">
          {/* Experience Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-magma-base tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-magma-base" />
              <span>Career Trajectory</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white mb-6 flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-magma-bright" />
              <span>Experience</span>
            </h2>

            {experience.map((exp, idx) => (
              <SpotlightCard key={idx} className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                    {exp.role}
                  </h3>
                  <span className="text-xs font-mono text-magma-ember px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05]">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-2 mt-4 text-xs font-light text-smoke-300 leading-relaxed list-disc list-inside">
                  {exp.points.map((pt, pIdx) => (
                    <li key={pIdx} className="text-smoke-300">
                      <span className="text-smoke-100">{pt}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            ))}
          </div>

          {/* Certifications Block */}
          <div>
            <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white mb-5 flex items-center gap-3">
              <Award className="w-6 h-6 text-magma-base" />
              <span>Verified Certifications</span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {certifications.map((cert, idx) => (
                <SpotlightCard key={idx} className="p-5 flex items-center justify-between group">
                  <div>
                    <h4 className="font-display font-bold text-base text-white uppercase group-hover:text-magma-bright transition-colors">
                      {cert.title}
                    </h4>
                    <div className="font-mono text-xs text-smoke-500 mt-1 flex items-center gap-2">
                      <span>{cert.issuer}</span>
                      {cert.date && <span>• {cert.date}</span>}
                    </div>
                  </div>

                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-magma-base/20 border border-white/[0.08] hover:border-magma-base/50 text-xs font-mono text-smoke-100 hover:text-white transition-all ml-4 shrink-0"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>

        {/* Education Column */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-magma-base tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-magma-base" />
            <span>Academic Foundations</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white mb-6 flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-magma-bright" />
            <span>Education</span>
          </h2>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <SpotlightCard key={idx} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                      {edu.degree}
                    </h3>
                    <p className="font-mono text-xs text-smoke-300 mt-1">
                      {edu.institution}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-magma-base/10 text-magma-bright border border-magma-base/20 shrink-0">
                    {edu.score}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-[11px] font-mono text-smoke-500">
                  <Calendar className="w-3.5 h-3.5 text-magma-base" />
                  <span>{edu.period}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

