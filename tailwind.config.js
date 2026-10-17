/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kumo-ink': '#1b1a19',
        'kumo-orange': '#e8772e',
        'kumo-sky': '#8fb3e0',
        'kumo-cream': '#f3ece0',
        kumo: {
          ink: '#1b1a19',
          orange: '#e8772e',
          sky: '#8fb3e0',
          cream: '#f3ece0',
          border: 'rgba(255, 255, 255, 0.12)',
          borderInk: 'rgba(27, 26, 25, 0.15)',
        },
        flora: {
          lime: '#e8772e',
        },
      },
      fontFamily: {
        display: ['Amarante', 'serif'],
        serif: ['Amarante', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        jp: ['"Noto Serif JP"', 'serif'],
      },
      letterSpacing: {
        mono: '0.12em',
        kumo: '0.08em',
        wide: '0.16em',
      },
      boxShadow: {
        'soft-text': '0 2px 10px rgba(0, 0, 0, 0.65)',
        'soft-card': '0 4px 20px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
