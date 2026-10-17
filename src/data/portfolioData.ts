export interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  highlights?: string[];
  tags: string[];
  metrics?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface SkillCategory {
  title: string;
  skills: { name: string; level: string; icon?: string }[];
}

export interface Certification {
  title: string;
  issuer: string;
  date?: string;
  verificationUrl: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  score: string;
}

export interface PortfolioData {
  personal: {
    name: string;
    role: string;
    headline: string;
    subheadline: string;
    summary: string;
    availability: string;
    location: string;
    email: string;
    socials: {
      github: string;
      linkedin?: string;
      twitter?: string;
    };
  };
  metrics: { label: string; value: string; detail: string }[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  education: EducationItem[];
  experience: {
    role: string;
    period: string;
    points: string[];
  }[];
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "SHIVAM MISHRA",
    role: "MERN Stack Developer & Creative Technologist",
    headline: "FORGING RESILIENT FULL-STACK & AI-POWERED WEB ARTIFACTS",
    subheadline: "MCA Scholar & MERN Stack Developer specializing in responsive architectures, high-performance web animations with GSAP, and intelligent LLM-integrated web applications.",
    summary: "MCA student at Central University of Haryana with hands-on experience developing full-stack web applications using React.js, Node.js, Express.js, and MongoDB, alongside modern UI/UX design, REST APIs, and emerging AI technologies.",
    availability: "Available for Full-Time Roles & High-Impact Projects",
    location: "Rewa, Madhya Pradesh, India",
    email: "shivam.m28737@gmail.com",
    socials: {
      github: "https://github.com/Shivam-io-afk",
      linkedin: "https://linkedin.com",
    },
  },
  metrics: [
    { label: "Core Stack", value: "MERN", detail: "React • Node • Express • Mongo" },
    { label: "Freelance Tenure", value: "2+ Yrs", detail: "Mid 2022 – Mid 2024 Client Delivery" },
    { label: "Academic Grade", value: "7.0 CGPA", detail: "Master of Computer Applications (MCA)" },
  ],
  projects: [
    {
      id: "onbuggy",
      title: "ONBUGGY",
      subtitle: "Multi-Vendor E-Commerce Ecosystem",
      category: "Full-Stack MERN",
      year: "2024",
      description: "Hyper-local multi-vendor commerce platform engineered like Swiggy/Zomato, empowering users to discover and order daily essentials from local vendors.",
      highlights: [
        "Crafted mobile-first, high-responsiveness front-end interfaces focused on fluid UX",
        "Engineered vendor-based order segregation, cart state persistence, and dynamic catalogs",
        "Built resilient RESTful MERN stack service architecture"
      ],
      tags: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "UI/UX Design"],
      metrics: "Multi-Vendor Architecture",
      githubUrl: "https://github.com/Shivam-io-afk",
      featured: true,
    },
    {
      id: "taskflow",
      title: "TASKFLOW",
      subtitle: "Collaborative Project & Task Suite",
      category: "React & Firebase",
      year: "2024",
      description: "Team-oriented project management suite featuring role-based workflows, live task tracking, integrated project calendar, and bespoke alert/error dispatch systems.",
      highlights: [
        "Integrated Firebase Authentication with Email/Password & Google Sign-In protocols",
        "Crafted reactive Tailwind CSS UI with interactive state notifications for warning/error/info",
        "Architected Kanban-style task tracking and calendar scheduling"
      ],
      tags: ["React.js", "Firebase Auth", "Tailwind CSS", "State Management", "JavaScript"],
      metrics: "Firebase Auth & Realtime",
      githubUrl: "https://github.com/Shivam-io-afk/TaskMaster",
      featured: true,
    },
    {
      id: "khatabook-clone",
      title: "KHATABOOK CLONE",
      subtitle: "Ledger & Accounts Transaction Engine",
      category: "Backend & MVC",
      year: "2023",
      description: "Digital accounting and ledger tracking system structured on clean MVC patterns to record debit/credit transactions, account ledgers, and audit trails.",
      highlights: [
        "Developed full MVC server-rendered views with Node.js, Express.js, and EJS",
        "Designed relational-style Mongoose schemas for ledger balances and transactions",
        "Implemented robust data validation and error handling middleware"
      ],
      tags: ["Node.js", "Express.js", "MongoDB", "Mongoose", "EJS", "MVC Architecture"],
      metrics: "Full MVC Ledger",
      githubUrl: "https://github.com/Shivam-io-afk/KhatabookMongoDB",
      featured: true,
    },
    {
      id: "zoom-clone",
      title: "ZOOM MEET CLONE",
      subtitle: "Real-Time Video Conferencing Engine",
      category: "Real-Time Web",
      year: "2023",
      description: "Real-time communication backend handling video meeting rooms, participant sessions, and dynamic view routing.",
      highlights: [
        "Constructed video room routing engine with Express.js backend services",
        "Integrated dynamic EJS meeting room templating and socket lifecycle handling",
        "Built modular server endpoints for session creation and meeting security"
      ],
      tags: ["Node.js", "Express.js", "EJS", "WebSockets / Real-Time", "JavaScript"],
      metrics: "Real-Time Sessions",
      githubUrl: "https://github.com/Shivam-io-afk/Zoom_meet-Clone",
      featured: true,
    },
  ],
  skills: [
    {
      title: "Frontend Engineering & Motion",
      skills: [
        { name: "React.js & Redux Toolkit", level: "Advanced" },
        { name: "GSAP & Web Animations", level: "Proficient" },
        { name: "Locomotive Scroll & Micro-interactions", level: "Proficient" },
        { name: "Tailwind CSS & Modern CSS3", level: "Expert" },
        { name: "HTML5 & Responsive UI/UX", level: "Expert" },
        { name: "React Router & jQuery", level: "Advanced" },
      ]
    },
    {
      title: "Backend, Database & APIs",
      skills: [
        { name: "Node.js & Express.js", level: "Advanced" },
        { name: "MongoDB & Mongoose ODM", level: "Advanced" },
        { name: "RESTful API Architecture", level: "Expert" },
        { name: "Authentication & Authorization (JWT)", level: "Advanced" },
        { name: "MVC Pattern & Server-Side Rendering", level: "Advanced" },
        { name: "API Testing (Postman)", level: "Proficient" },
      ]
    },
    {
      title: "Languages, AI & Tooling",
      skills: [
        { name: "JavaScript (ES6+)", level: "Expert" },
        { name: "C & C++ Programming", level: "Proficient" },
        { name: "Prompt Engineering & LLM Integration", level: "Intermediate" },
        { name: "Git, GitHub & Version Control", level: "Advanced" },
        { name: "Unit Testing (Jest)", level: "Intermediate" },
        { name: "UI/UX Design with AI Tools", level: "Proficient" },
      ]
    }
  ],
  certifications: [
    {
      title: "Backend Development",
      issuer: "Sheryians Coding School",
      date: "Dec 2025 – Feb 2026",
      verificationUrl: "https://classroom.sheryians.com/certificate/108747224249453252719e06",
    },
    {
      title: "Frontend Development",
      issuer: "Sheryians Coding School",
      date: "Certified",
      verificationUrl: "https://sheryians.com/certificate/10846522990930281acafb54",
    }
  ],
  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "Central University of Haryana",
      period: "2024 – 2026",
      score: "CGPA 7.0",
    },
    {
      degree: "Bachelor of Computer Applications (BCA)",
      institution: "APS University",
      period: "2019 – 2022",
      score: "72.00%",
    },
    {
      degree: "Senior Secondary (XII), Commerce",
      institution: "Rose Petal Hr. Sec. School",
      period: "2019",
      score: "CGPA 6.60 / 10",
    },
    {
      degree: "Secondary (X), CBSE",
      institution: "Kendriya Vidyalaya",
      period: "2017",
      score: "CGPA 7.80 / 10",
    }
  ],
  experience: [
    {
      role: "Freelance Web Developer",
      period: "Mid 2022 – Mid 2024",
      points: [
        "Architected and deployed production web applications and responsive client sites using React.js, Node.js, and MongoDB.",
        "Integrated custom REST APIs and database models while prioritizing performance, SEO, and accessible user experiences.",
        "Collaborated directly with clients to translate business requirements into intuitive UI/UX workflows."
      ]
    }
  ]
};
