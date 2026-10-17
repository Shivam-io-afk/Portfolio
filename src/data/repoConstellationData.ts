export interface LanguageGalaxy {
  id: string;
  name: string;
  color: string;
  center: [number, number, number];
}

export interface ConstellationRepo {
  index: number;
  id: string;
  name: string;
  language: string;
  galaxyId: string;
  githubUrl: string;
  description: string;
  skills: string[];
  position: [number, number, number];
}

export const GALAXY_CONSTELLATIONS: LanguageGalaxy[] = [
  {
    id: 'typescript',
    name: 'TYPESCRIPT',
    color: '#3178c6',
    center: [-3.4, 2.0, 0.4],
  },
  {
    id: 'javascript',
    name: 'JAVASCRIPT',
    color: '#f7df1e',
    center: [3.4, 1.8, -0.3],
  },
  {
    id: 'python',
    name: 'PYTHON',
    color: '#4b8bbe',
    center: [-3.5, -1.8, 0.5],
  },
  {
    id: 'c-systems',
    name: 'C & SYSTEMS',
    color: '#00599c',
    center: [3.3, -1.9, 0.3],
  },
  {
    id: 'shell',
    name: 'SHELL',
    color: '#89e051',
    center: [0.0, 3.4, -0.6],
  },
  {
    id: 'data-vcs',
    name: 'DATA & VCS',
    color: '#e34c26',
    center: [0.0, -2.8, -0.3],
  },
];

export const CONSTELLATION_REPOS: ConstellationRepo[] = [
  // --- TYPESCRIPT GALAXY ---
  {
    index: 0,
    id: 'portfolio',
    name: 'Portfolio',
    language: 'TypeScript',
    galaxyId: 'typescript',
    githubUrl: 'https://github.com/Shivam-io-afk/Portfolio',
    description: 'Compile 3D interactive portfolio architecture built with Three.js, R3F & custom shaders.',
    skills: ['React', 'TypeScript', 'Three.js / WebGL', 'Tailwind CSS', 'UI/UX Design'],
    position: [-3.4, 2.4, 0.5],
  },
  {
    index: 1,
    id: 'sheltermap',
    name: 'ShelterMap',
    language: 'TypeScript',
    galaxyId: 'typescript',
    githubUrl: 'https://github.com/Shivam-io-afk/ShelterMap',
    description: 'Geospatial disaster crisis mapping platform with real-time incident pins & Leaflet tiles.',
    skills: ['TypeScript', 'React', 'Leaflet', 'REST APIs', 'UI/UX Design'],
    position: [-4.2, 1.8, 0.1],
  },
  {
    index: 2,
    id: 'syncmeet',
    name: 'SyncMeet',
    language: 'TypeScript',
    galaxyId: 'typescript',
    githubUrl: 'https://github.com/Shivam-io-afk/SyncMeet',
    description: 'Real-time collaborative video conferencing suite with WebSockets & state synchronization.',
    skills: ['TypeScript', 'React', 'WebSockets', 'REST APIs', 'Node.js'],
    position: [-2.7, 1.7, 0.6],
  },

  // --- JAVASCRIPT GALAXY ---
  {
    index: 3,
    id: 'onbuggy',
    name: 'Onbuggy',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/Onbuggy',
    description: 'Hyper-local multi-vendor e-commerce platform with reactive cart & vendor segregation.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'UI/UX Design'],
    position: [3.4, 2.6, -0.2],
  },
  {
    index: 4,
    id: 'task-flow',
    name: 'Task-Flow',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/Task-Flow',
    description: 'Collaborative project management board with drag-and-drop workflow automation.',
    skills: ['React', 'Tailwind CSS', 'JavaScript', 'State Management'],
    position: [4.2, 2.2, -0.6],
  },
  {
    index: 5,
    id: 'khatabook-app',
    name: 'Khatabook-App',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/Khatabook-App',
    description: 'Digital credit ledger client with instant debtor reconciliations and Firebase persistence.',
    skills: ['React', 'Firebase', 'JavaScript', 'UI/UX Design'],
    position: [2.7, 2.1, 0.1],
  },
  {
    index: 6,
    id: 'zoom-meet-clone',
    name: 'Zoom_meet-Clone',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/Zoom_meet-Clone',
    description: 'WebRTC peer-to-peer audio/video streaming room with multi-tenant socket signalling.',
    skills: ['JavaScript', 'WebSockets', 'Node.js', 'Express.js'],
    position: [4.4, 1.4, -0.4],
  },
  {
    index: 7,
    id: 'khatabook',
    name: 'Khatabook',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/Khatabook',
    description: 'Financial ledger backend microservice with transactional integrity and MongoDB schemas.',
    skills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    position: [3.3, 1.3, -0.8],
  },
  {
    index: 8,
    id: 'taskmaster',
    name: 'TaskMaster',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/TaskMaster',
    description: 'Personal task and workflow optimization suite with localized telemetry and priorities.',
    skills: ['JavaScript', 'React', 'UI/UX Design', 'Tailwind CSS'],
    position: [2.5, 1.2, 0.4],
  },
  {
    index: 9,
    id: 'tempmailer',
    name: 'TempMailer',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/TempMailer',
    description: 'Disposable inbox API client with automated email validation and rapid retrieval.',
    skills: ['JavaScript', 'REST APIs', 'AI API Integration (prompting, responses, UX)'],
    position: [3.9, 0.7, 0.0],
  },
  {
    index: 10,
    id: 'learningreact',
    name: 'learningReact',
    language: 'JavaScript',
    galaxyId: 'javascript',
    githubUrl: 'https://github.com/Shivam-io-afk/learningReact',
    description: 'Deep dive repository into React lifecycle patterns, hooks, and virtual DOM reconciliations.',
    skills: ['React', 'JavaScript', 'State Management'],
    position: [2.8, 0.6, -0.5],
  },

  // --- PYTHON GALAXY ---
  {
    index: 11,
    id: 'gaucher',
    name: 'GAUCHER',
    language: 'Python',
    galaxyId: 'python',
    githubUrl: 'https://github.com/Shivam-io-afk/GAUCHER',
    description: 'Medical diagnostic classification and predictive pipeline evaluating lysosomal storage patterns.',
    skills: ['Python', 'AI API Integration (prompting, responses, UX)', 'REST APIs'],
    position: [-3.5, -1.8, 0.5],
  },

  // --- C / SYSTEMS GALAXY ---
  {
    index: 12,
    id: 'depthc',
    name: 'DepthC',
    language: 'C',
    galaxyId: 'c-systems',
    githubUrl: 'https://github.com/Shivam-io-afk/DepthC',
    description: 'Exhaustive exploration of low-level C memory models, pointer arithmetic, and syscalls.',
    skills: ['C / C++', 'Algorithms & Data Structures'],
    position: [3.1, -1.6, 0.4],
  },
  {
    index: 13,
    id: 'dsa',
    name: 'DSA',
    language: 'C',
    galaxyId: 'c-systems',
    githubUrl: 'https://github.com/Shivam-io-afk/DSA',
    description: 'Rigorous implementation of balanced trees, graphs, heaps, dynamic programming & sorting.',
    skills: ['C / C++', 'Algorithms & Data Structures'],
    position: [3.7, -2.2, 0.1],
  },

  // --- SHELL GALAXY ---
  {
    index: 14,
    id: 'shellscripting',
    name: 'ShellScripting',
    language: 'Shell',
    galaxyId: 'shell',
    githubUrl: 'https://github.com/Shivam-io-afk/ShellScripting',
    description: 'Automated UNIX deployment recipes, cron pipelines, and server provisioning toolchains.',
    skills: ['Linux / Bash', 'Git / GitHub', 'Docker'],
    position: [0.0, 3.4, -0.6],
  },

  // --- DATA & VCS GALAXY ---
  {
    index: 15,
    id: 'dbms-practical',
    name: 'DBMS-Practical',
    language: 'SQL',
    galaxyId: 'data-vcs',
    githubUrl: 'https://github.com/Shivam-io-afk/DBMS-Practical',
    description: 'Relational query optimization, ACID transaction scripts, and normalized entity blueprints.',
    skills: ['PostgreSQL', 'MongoDB', 'REST APIs'],
    position: [-0.6, -2.8, -0.2],
  },
  {
    index: 16,
    id: 'gitrepo',
    name: 'gitRepo',
    language: 'Git',
    galaxyId: 'data-vcs',
    githubUrl: 'https://github.com/Shivam-io-afk/gitRepo',
    description: 'Production version control branch conventions, rebase strategies, and git automation hooks.',
    skills: ['Git / GitHub'],
    position: [0.7, -2.9, -0.4],
  },
];

// Faint intra-galaxy and inter-galaxy connector lines
export const CONSTELLATION_CONNECTIONS: [number, number][] = [
  // TypeScript intra
  [0, 1],
  [0, 2],
  [1, 2],

  // JavaScript intra
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [3, 10],

  // C / Systems intra
  [12, 13],

  // Data & VCS intra
  [15, 16],

  // Inter-galaxy bridges (faint backbone)
  [0, 3],   // Portfolio (TS) <-> Onbuggy (JS)
  [2, 14],  // SyncMeet (TS) <-> ShellScripting
  [3, 14],  // Onbuggy (JS) <-> ShellScripting
  [1, 11],  // ShelterMap (TS) <-> Gaucher (Python)
  [11, 15], // Gaucher (Python) <-> DBMS
  [13, 16], // DSA (C) <-> gitRepo
  [7, 15],  // Khatabook (JS) <-> DBMS
  [12, 7],  // DepthC <-> Khatabook backend
];

/**
 * Returns list of repo indices associated with a given skill name
 */
export function getReposForSkill(skillName: string): number[] {
  if (!skillName) return [];
  const s = skillName.toLowerCase();
  
  return CONSTELLATION_REPOS.filter(repo => {
    return repo.skills.some(repoSkill => {
      const rs = repoSkill.toLowerCase();
      return rs.includes(s) || s.includes(rs);
    });
  }).map(r => r.index);
}

