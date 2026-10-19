# Project Documentation & Architecture Guide

## Tech Stack
- **Framework**: React 18+ / Vite + TypeScript
- **Styling**: Tailwind CSS, custom GLSL / CSS filters, glassmorphic backdrop filters
- **3D & WebGL**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animation**: `framer-motion`
- **Icons**: `lucide-react`

## Project Structure
```
c:\WEB\React\3d'ss\portfolio
├── public/                 # Static assets, fonts, icons, 3D gltf models
├── src/
│   ├── assets/             # Audio, images, textures
│   ├── components/
│   │   ├── 3d/             # Three.js / React Three Fiber scenes & shaders
│   │   │   ├── MoltenCore.tsx        # Procedural interactive molten sphere / lava mesh
│   │   │   ├── EmberParticles.tsx    # Rising floating magma sparks
│   │   │   └── LavaCanvas.tsx        # Canvas wrapper with camera & lighting
│   │   ├── ui/             # Reusable aesthetic UI atoms (SpotlightCard, Badge, Button)
│   │   ├── sections/       # Primary page sections (Hero, Works, About, Skills, Contact)
│   │   ├── layout/         # Header/HUD, Footer, FilmGrainOverlay, CursorFollower
│   │   └── data/           # Configurable portfolio data (portfolioData.ts)
│   ├── hooks/              # Custom hooks (useMousePosition, useAudio, useScroll)
│   ├── index.css           # Global typography, dark lava custom utility classes
│   ├── App.tsx             # Main orchestrated layout
│   └── main.tsx            # Root mounting point
├── CONTEXT.md              # Long-term persistent memory for design & roadmap
├── README.md               # User instructions & deployment guide
└── tailwind.config.js      # Custom theme colors (lava, obsidian, magma)
```

## Running the Application
```bash
npm run dev
```
Open [https://shivam-io-afk.github.io/Portfolio/](https://shivam-io-afk.github.io/Portfolio/) in your browser.

