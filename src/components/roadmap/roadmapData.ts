export interface Milestone {
  id: string;
  tag: string;
  monthLabel: string; // e.g. "JUN '22"
  monthSpineIndex: number; // 0 to 48
  title: string;
  subtitle: string;
  description: string;
  counterValue: number;
  counterSuffix?: string;
  counterLabel: string;
  chips: string[];
  isHireMe?: boolean;
}

export interface MonthItem {
  year: number;
  monthIndex: number;
  label: string;
  fullLabel: string;
  quarter: string;
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Generate 49 consecutive months from Jun 2022 to Jun 2026
 */
export const SPINE_MONTHS: MonthItem[] = (() => {
  const list: MonthItem[] = [];
  let m = 5; // Jun
  let y = 2022;

  while (y < 2026 || (y === 2026 && m <= 5)) {
    const shortYear = String(y).slice(-2);
    const q = Math.floor(m / 3) + 1;
    list.push({
      year: y,
      monthIndex: m,
      label: `${MONTH_NAMES[m]} '${shortYear}`,
      fullLabel: `${MONTH_NAMES[m]} ${y}`,
      quarter: `Q${q} · ${y}`,
    });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return list;
})();

/**
 * Real milestone data mapping Shivam's journey from Jun 2022 to 2026
 */
export const MILESTONES: Milestone[] = [
  {
    id: 'freelance-start',
    tag: 'Q2 · 2022',
    monthLabel: "JUN '22",
    monthSpineIndex: 0,
    title: 'First Line Shipped.',
    subtitle: 'Independent Freelance Tenure',
    description: 'Started freelance web development architecting responsive client systems with React.js, Node.js, and MongoDB.',
    counterValue: 10,
    counterSuffix: '+',
    counterLabel: 'client web builds delivered',
    chips: ['REACT.JS', 'NODE.JS', 'MONGODB', 'FREELANCE'],
  },
  {
    id: 'bca-graduation',
    tag: 'Q3 · 2022',
    monthLabel: "JUL '22",
    monthSpineIndex: 1,
    title: 'BCA Graduation.',
    subtitle: 'APS University',
    description: 'Completed Bachelor of Computer Applications with distinction, grounding core algorithms, DBMS, and OOP foundations.',
    counterValue: 72,
    counterSuffix: '%',
    counterLabel: '% final academic score',
    chips: ['APS UNIVERSITY', 'BCA DEGREE', 'DISTINCTION', 'DATA STRUCTURES'],
  },
  {
    id: 'khatabook-clone',
    tag: 'Q1 · 2023',
    monthLabel: "FEB '23",
    monthSpineIndex: 8,
    title: 'Khatabook Clone.',
    subtitle: 'Ledger & Transaction Engine',
    description: 'Engineered full MVC accounting ledger tracking credit/debit transaction logs with custom Mongoose schema validation.',
    counterValue: 18,
    counterLabel: 'API routes & MVC views',
    chips: ['NODE.JS', 'EXPRESS.JS', 'MONGODB', 'EJS', 'MVC PATTERN'],
  },
  {
    id: 'zoom-clone',
    tag: 'Q3 · 2023',
    monthLabel: "SEP '23",
    monthSpineIndex: 15,
    title: 'Zoom Meet Clone.',
    subtitle: 'Real-Time Video Rooms',
    description: 'Constructed real-time video conferencing engine with Express.js backend services and dynamic socket lifecycle routing.',
    counterValue: 4,
    counterLabel: 'core video & socket modules',
    chips: ['WEBSOCKETS', 'REAL-TIME WEB', 'SOCKET.IO', 'EJS TEMPLATES'],
  },
  {
    id: 'mca-induction',
    tag: 'Q3 · 2024',
    monthLabel: "JUL '24",
    monthSpineIndex: 25,
    title: 'MCA Scholars Track.',
    subtitle: 'Central University of Haryana',
    description: 'Admitted to Central University of Haryana for Master of Computer Applications, leading advanced web system modules.',
    counterValue: 7.0,
    counterSuffix: '',
    counterLabel: 'CGPA academic grade',
    chips: ['CENTRAL UNIV OF HARYANA', 'MCA', '7.0 CGPA', 'SYSTEMS ARCHITECTURE'],
  },
  {
    id: 'onbuggy-platform',
    tag: 'Q3 · 2024',
    monthLabel: "AUG '24",
    monthSpineIndex: 26,
    title: 'Onbuggy Platform.',
    subtitle: 'Multi-Vendor Commerce Ecosystem',
    description: 'Hyper-local e-commerce platform engineered with vendor segregation, cart persistence, and modular REST services.',
    counterValue: 16,
    counterLabel: 'REST endpoints & schemas',
    chips: ['MERN STACK', 'MULTI-VENDOR', 'RESTFUL SERVICES', 'REACT.JS'],
  },
  {
    id: 'taskflow-suite',
    tag: 'Q4 · 2024',
    monthLabel: "OCT '24",
    monthSpineIndex: 28,
    title: 'Taskflow Suite.',
    subtitle: 'Collaborative Project Workspace',
    description: 'Production Kanban task suite featuring Firebase Authentication, project calendar scheduling, and reactive Tailwind UI.',
    counterValue: 12,
    counterLabel: 'Kanban & auth components',
    chips: ['FIREBASE AUTH', 'TAILWIND CSS', 'KANBAN PIPELINE', 'STATE MANAGEMENT'],
  },
  {
    id: 'open-to-work',
    tag: 'Q2 · 2026',
    monthLabel: "JUN '26",
    monthSpineIndex: 48,
    title: 'Open to Work.',
    subtitle: 'Ready for High-Impact Roles',
    description: 'Available for full-time software engineering appointments, resilient full-stack systems, and web apps with integrated AI features.',
    counterValue: 17,
    counterSuffix: '',
    counterLabel: 'public GitHub repositories live',
    chips: ['FULL-TIME READY', 'MERN STACK', 'CREATIVE TECH', 'GSAP MOTION', 'IMMEDIATE'],
    isHireMe: true,
  },
];

