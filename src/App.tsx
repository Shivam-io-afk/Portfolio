import React, { useState } from 'react';
import { portfolioData } from './data/portfolioData';
import { LavaCanvas } from './components/3d/LavaCanvas';
import { FloraCanvas } from './components/3d/FloraCanvas';
import { Navbar } from './components/layout/Navbar';
import { CursorGlow } from './components/layout/CursorGlow';
import { Hero } from './components/sections/Hero';
import { MagmaMarquee } from './components/ui/MagmaMarquee';
import { Projects } from './components/sections/Projects';
import { Skills } from './components/sections/Skills';
import { ExperienceAndCredentials } from './components/sections/ExperienceAndCredentials';
import { Contact } from './components/sections/Contact';
import { ThemeSwitcher, VisualMode } from './components/ui/ThemeSwitcher';

export const App: React.FC = () => {
  const data = portfolioData;
  const [visualMode, setVisualMode] = useState<VisualMode>('flora');

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-smoke-100 overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* 1. Global Film Grain Noise Overlay */}
      <div className="film-grain" />

      {/* 2. Deep Volcanic/Nocturnal Vignette */}
      <div className="volcanic-vignette" />

      {/* 3. Interactive Mouse Atmospheric Glow + Cursor Spark */}
      <CursorGlow />

      {/* 4. Active 3D WebGL Canvas (Flora Dandelion or Molten Lava) */}
      {visualMode === 'flora' ? <FloraCanvas /> : <LavaCanvas />}

      {/* 5. Floating Glassmorphism HUD Navigation */}
      <Navbar availability={data.personal.availability} />

      {/* 6. Main Orchestrated Sections */}
      <main className="relative z-10">
        <Hero data={data} />
        <MagmaMarquee />
        <Projects projects={data.projects} />
        <Skills categories={data.skills} />
        <ExperienceAndCredentials
          experience={data.experience}
          certifications={data.certifications}
          education={data.education}
        />
        <Contact personal={data.personal} />
      </main>

      {/* 7. Theme Switcher Mode Pill (Flora vs Magma) */}
      <ThemeSwitcher mode={visualMode} onToggle={setVisualMode} />

      {/* 8. Ambient Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 text-center text-xs font-mono text-smoke-500 bg-obsidian-950/90 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto px-6 gap-6">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse" />
            <span className="text-smoke-300 font-mono tracking-wide">
              Forged by Shivam Mishra • MERN & Creative Technologist
            </span>
          </div>
          <div className="text-smoke-500 text-[11px]">
            Rewa, MP, India • &copy; {new Date().getFullYear()} • Inspired by GetLayers Flora & Creative Director
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
