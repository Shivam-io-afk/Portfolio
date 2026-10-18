import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompileStore } from '../../store/useCompileStore';

interface Message {
  id: string;
  sender: 'user' | 'shivam' | 'system';
  text: string;
  isStreaming?: boolean;
}

const PRESET_CHIPS = [
  'What are you best at?',
  'Are you available for hire?',
  'Tell me about Onbuggy',
  'Explain your AI approach',
  'Education & location',
  'How was this site built?',
];

const PRESET_ANSWERS: Record<string, string> = {
  'What are you best at?':
    'I specialize in Full-Stack MERN Architecture with reactive modern frontends (React, TypeScript, Three.js, Tailwind CSS) and hardened backend APIs (Node.js, Express, MongoDB, WebSockets). I turn complex distributed requirements into fast, intuitive software with zero fluff.',

  'Are you available for hire?':
    'YES! I am actively available for Full-Time SWE roles and select high-impact Contract / Freelance engineering. Ready to onboard immediately with high autonomy and rapid shipping velocity. Reach me at shivam.m28737@gmail.com.',

  'Tell me about Onbuggy':
    'Onbuggy is a production-grade hyper-local multi-vendor commerce platform engineered like Swiggy/Zomato. Built on MERN with multi-vendor cart segregation, state persistence, dynamic store catalogues, and sub-80ms API response latency.',

  'Explain your AI approach':
    'I do not train foundational models from scratch; I engineer production AI features by integrating state-of-the-art LLMs via REST APIs. I treat model APIs as non-deterministic external microservices: wrapping prompts with strict schema validation, defensive fallbacks, and low-latency client streaming.',

  'Education & location':
    'Based in Rewa, Madhya Pradesh, India (IST / UTC+5:30). Graduating with a Bachelor of Technology in Computer Science & Engineering from University Teaching Department (UTD), CSVTU (2022–2026, 7.85 CGPA).',

  'How was this site built?':
    'The "COMPILE" portfolio is an interactive WebGL architecture built with Vite, React, TypeScript, and Three.js / React Three Fiber. All 12,000 bits are rendered in a single GPU draw call using custom GLSL shaders (CSM), morphing across 5 distinct topological stages without long animation frames.',
};

export const AskShivamTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    (window as any).__openAskShivam = () => setIsOpen(true);
    (window as any).__closeAskShivam = () => setIsOpen(false);
    return () => {
      delete (window as any).__openAskShivam;
      delete (window as any).__closeAskShivam;
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'system',
      text: 'SHIVAM_OS [Version 2.6.0] // Interactive Scripted Shell\nType a command, query, or select a preset chip below.',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);

  // Global '/' keyboard shortcut to open terminal, 'Escape' to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in standard inputs or textareas outside terminal
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === '/' && !isInput && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const streamResponse = (fullText: string, onFinish?: () => void) => {
    setIsTyping(true);
    const msgId = 'msg-' + Date.now();

    setMessages((prev) => [
      ...prev,
      { id: msgId, sender: 'shivam', text: '', isStreaming: true },
    ]);

    const startTime = performance.now();
    const duration = Math.min(1100, Math.max(250, fullText.length * 4.5));
    let lastLength = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const chars = Math.floor(progress * fullText.length);

      if (chars !== lastLength || progress >= 1) {
        lastLength = chars;
        const slice = fullText.slice(0, chars);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, text: slice, isStreaming: progress < 1 } : m
          )
        );
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsTyping(false);
        if (onFinish) onFinish();
      }
    };

    requestAnimationFrame(tick);
  };

  const processQuery = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query || isTyping) return;

    // Add user message
    const userMsgId = 'user-' + Date.now();
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: query }]);
    setInputVal('');

    // Check exact preset match first
    if (PRESET_ANSWERS[query]) {
      setTimeout(() => streamResponse(PRESET_ANSWERS[query]), 80);
      return;
    }

    const q = query.toLowerCase();

    // Hidden sudo hire command
    if (q === 'sudo hire shivam' || q === 'sudo hire') {
      setTimeout(() => {
        streamResponse(
          'ACCESS GRANTED: Elevated authorization confirmed.\nShivam Mishra is ready to build with you. Launching direct communication mailto:shivam.m28737@gmail.com...',
          () => {
            setTimeout(() => {
              try {
                window.open(
                  'mailto:shivam.m28737@gmail.com?subject=Opportunity%20Discussion%20with%20Shivam',
                  '_blank'
                );
              } catch {}
            }, 600);
          }
        );
      }, 80);
      return;
    }

    // Clear command
    if (q === 'clear' || q === 'cls') {
      setMessages([
        {
          id: 'cleared-' + Date.now(),
          sender: 'system',
          text: 'Terminal buffer cleared. System ready.',
        },
      ]);
      return;
    }

    // Help command
    if (q === 'help' || q === '?') {
      const helpText =
        'SUPPORTED COMMANDS:\n' +
        '  • projects    - Overview of 5 featured full-stack projects\n' +
        '  • repos       - 17 public repositories across 6 language galaxies\n' +
        '  • hire        - Availability, compensation & roles\n' +
        '  • stack       - Technical skills, runtimes & libraries\n' +
        '  • resume      - Download latest verified curriculum vitae\n' +
        '  • email       - Direct mail protocol to shivam.m28737@gmail.com\n' +
        '  • clear       - Flush terminal buffer\n' +
        '  • sudo hire shivam - Instant recruitment shortcut';
      setTimeout(() => streamResponse(helpText), 80);
      return;
    }

    // Keyword matching
    if (q.includes('hire') || q.includes('available') || q.includes('job') || q.includes('work') || q.includes('opportunity')) {
      setTimeout(
        () =>
          streamResponse(
            'STATUS: Available for Full-Time SWE Roles & Select High-Impact Contracts.\n' +
            'Location: Open to Remote worldwide or On-Site relocation.\n' +
            'Email: shivam.m28737@gmail.com\n' +
            'Let\'s build something extraordinary together!'
          ),
        80
      );
      return;
    }

    if (q.includes('salary') || q.includes('rate') || q.includes('compensation') || q.includes('cost')) {
      setTimeout(
        () =>
          streamResponse(
            'COMPENSATION: Competitive market rates tailored to role scope, equity structure, and team velocity. Always open to transparent discussion aligned with mutual value creation.'
          ),
        80
      );
      return;
    }

    if (q.includes('stack') || q.includes('skill') || q.includes('tech') || q.includes('tools')) {
      setTimeout(
        () =>
          streamResponse(
            'CORE ARSENAL:\n' +
            '  • Frontend: React, TypeScript, Three.js / WebGL, Tailwind CSS, Redux, GSAP\n' +
            '  • Backend: Node.js, Express.js, MongoDB, Mongoose, PostgreSQL, WebSockets\n' +
            '  • Systems & AI: C / C++, Python, REST APIs, Structured LLM Prompting & Schema Defenses'
          ),
        80
      );
      return;
    }

    if (q.includes('shelter') || q.includes('sheltermap')) {
      setTimeout(
        () =>
          streamResponse(
            'SHELTERMAP (Project 05):\n' +
            'Interactive crisis management & disaster relief platform built with TypeScript, React, and Leaflet. Features real-time incident pins, emergency shelter availability metrics, and geospatial route coordinates.'
          ),
        80
      );
      return;
    }

    if (q.includes('onbuggy')) {
      setTimeout(() => streamResponse(PRESET_ANSWERS['Tell me about Onbuggy']), 80);
      return;
    }

    if (q.includes('resume') || q.includes('cv')) {
      setTimeout(
        () =>
          streamResponse(
            'RESUME ACCESS: Download latest PDF from /resume.pdf\n' +
            'Drive Mirror: https://drive.google.com/file/d/1zZPCChlTaYZSdnu78lJLoZvV-AgCJFJJ/view\n' +
            'Click the "RESUME" button in the navigation bar to download.'
          ),
        80
      );
      return;
    }

    if (q.includes('github') || q.includes('repo') || q.includes('code')) {
      setTimeout(
        () =>
          streamResponse(
            'GITHUB CONSTELLATION:\n' +
            '17 public repositories across TypeScript, JavaScript, Python, C, and Shell.\n' +
            'Profile URL: https://github.com/Shivam-io-afk\n' +
            'Explore Stage 02 in the portfolio to interact with the 3D repo star clusters!'
          ),
        80
      );
      return;
    }

    if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('touch')) {
      setTimeout(
        () =>
          streamResponse(
            'DIRECT CONTACT:\n' +
            '  • Email: shivam.m28737@gmail.com\n' +
            '  • GitHub: https://github.com/Shivam-io-afk\n' +
            '  • Location: Rewa, Madhya Pradesh, India (IST)'
          ),
        80
      );
      return;
    }

    if (q.includes('why hire') || q.includes('why you') || q.includes('reason')) {
      setTimeout(
        () =>
          streamResponse(
            'WHY HIRE SHIVAM:\n' +
            '1. Full-Stack Agency: I build the complete vertical slice from database schema to WebGL shader.\n' +
            '2. Honest Velocity: Production code with real error handling, not AI wrappers or broken prototypes.\n' +
            '3. Relentless Execution: Proven track record of shipping end-to-end multi-tenant systems.'
          ),
        80
      );
      return;
    }

    if (q.includes('projects')) {
      setTimeout(
        () =>
          streamResponse(
            'FEATURED PROJECTS:\n' +
            '  01. ONBUGGY      - Multi-Vendor E-Commerce Platform (MERN)\n' +
            '  02. TASKFLOW     - Collaborative Project & Kanban Suite (React & Firebase)\n' +
            '  03. KHATABOOK    - Cloud Digital Ledger & Accounts Microservice (Node/Express)\n' +
            '  04. ZOOM CLONE   - Real-Time WebRTC Video Conferencing Engine\n' +
            '  05. SHELTERMAP   - Geospatial Disaster Crisis Map & Shelter Tracker'
          ),
        80
      );
      return;
    }

    // Default fallback
    setTimeout(
      () =>
        streamResponse(
          `Command not recognized: "${query}"\nTry: help, projects, repos, resume, hire, clear`
        ),
      80
    );
  };

  const handleChipClick = (chipText: string) => {
    processQuery(chipText);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(inputVal);
  };

  useEffect(() => {
    (window as any).__submitAskShivam = (q: string) => processQuery(q);
    return () => {
      delete (window as any).__submitAskShivam;
    };
  });

  return (
    <div id="ask-shivam-portal" className="fixed bottom-6 right-6 z-50">
      {/* Floating Pill Button (Bottom-Right) */}
      <button
        type="button"
        id="ask-shivam-toggle-btn"
        onClick={() => {
          console.log('AskShivamTerminal: BUTTON CLICKED! previous isOpen =', isOpen);
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-2.5 px-3.5 py-2 bg-[#090b0e]/95 border border-[#ff5b1f]/50 hover:border-[#ff5b1f] hover:scale-105 active:scale-95 text-white font-mono text-xs shadow-2xl rounded-sm transition-all duration-200 group cursor-pointer"
        title="Open interactive terminal (Press /)"
      >
        <span className="w-2 h-2 rounded-full bg-[#ff5b1f] animate-pulse" />
        <span className="text-[#ff5b1f] font-bold">&gt;</span>
        <span className="text-[#d8dde6]/90 group-hover:text-white transition-colors">
          ask_shivam
        </span>
        <span className="text-[10px] text-[#d8dde6]/40 px-1 py-0.5 bg-[#141820] border border-[#d8dde6]/10 rounded">
          /
        </span>
      </button>

      {/* Floating Terminal Window */}
      {isOpen && (
        <div
          id="shivam-terminal-window"
          className="absolute bottom-12 right-0 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[560px] h-[520px] bg-[#07090c]/98 border border-[#ff5b1f]/60 rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Terminal Title Bar */}
          <div className="px-4 py-2.5 bg-[#0d1017] border-b border-[#ff5b1f]/30 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5 font-mono text-xs text-[#d8dde6]">
              <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <span className="text-white font-bold">&gt; SHIVAM_SHELL</span>
              <span className="text-[#ff5b1f] text-[10px]">v2.6.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-[#d8dde6]/40 uppercase tracking-mono hidden sm:inline">
                ESC TO CLOSE
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-5 h-5 flex items-center justify-center font-mono text-xs text-[#d8dde6]/60 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable Message Buffer */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3.5 divide-y-0 text-[#d8dde6]/90 select-text"
          >
            {messages.map((m) => (
              <div key={m.id} className="leading-relaxed">
                {m.sender === 'user' ? (
                  <div className="flex items-start gap-2 text-[#ff5b1f]">
                    <span className="font-bold select-none">&gt;</span>
                    <span className="text-white font-medium">{m.text}</span>
                  </div>
                ) : m.sender === 'system' ? (
                  <div className="p-2.5 bg-[#0f131a] border border-[#d8dde6]/10 rounded-sm text-[#d8dde6]/70 text-[11px] whitespace-pre-wrap">
                    {m.text}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-[#d8dde6]/95">
                    <span className="text-[#4ade80] select-none font-bold">#</span>
                    <div className="whitespace-pre-wrap text-[11px] text-[#d8dde6]/90">
                      {m.text}
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-3 ml-1 bg-[#ff5b1f] animate-pulse align-middle" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Preset Query Chips */}
          <div className="px-3 py-2 bg-[#0a0d12] border-t border-[#d8dde6]/10 flex gap-1.5 overflow-x-auto no-scrollbar">
            {PRESET_CHIPS.map((chip) => (
              <button
                key={chip}
                disabled={isTyping}
                onClick={() => handleChipClick(chip)}
                className="shrink-0 px-2.5 py-1 bg-[#121620] hover:bg-[#ff5b1f]/20 hover:border-[#ff5b1f]/50 border border-[#d8dde6]/10 text-[10px] font-mono text-[#d8dde6]/80 hover:text-white rounded-sm transition-all disabled:opacity-40"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Command Input Prompt */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-[#0d1017] border-t border-[#ff5b1f]/30 flex items-center gap-2"
          >
            <span className="font-mono text-sm text-[#ff5b1f] font-bold select-none">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={isTyping ? 'Streaming response...' : 'Type question or command (e.g. help, hire)...'}
              disabled={isTyping}
              className="flex-1 bg-transparent border-0 outline-none font-mono text-xs text-white placeholder-[#d8dde6]/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="px-2.5 py-1 bg-[#ff5b1f] text-black font-mono text-[10px] font-bold rounded-sm uppercase tracking-mono hover:bg-[#ff723f] disabled:opacity-30 transition-all"
            >
              RUN
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
