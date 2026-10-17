/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flora: {
          lime: '#b8f57a',
          limeGlow: 'rgba(184, 245, 122, 0.45)',
          gold: '#ffcf6a',
          ice: '#e8f0ff',
          stem: '#38ef7d',
        },
        navy: {
          night: '#0a1a4a',
          dark: '#060507',
          deep: '#040b1e',
        },
        glass: {
          surface: 'rgba(10, 14, 30, 0.55)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(184, 245, 122, 0.4)',
        },
        ice: {
          white: '#e8f0ff',
          muted: '#8ea2c6',
          dim: '#4f6080',
        }
      },
      fontFamily: {
        sans: ['"Chakra Petch"', 'sans-serif'],
        display: ['"Chakra Petch"', 'sans-serif'],
        script: ['"Pinyon Script"', 'cursive'],
        mono: ['"Chakra Petch"', 'monospace'],
      },
      letterSpacing: {
        flora: '0.08em',
        wideflora: '0.14em',
      },
      backdropBlur: {
        glass: '14px',
      }
    },
  },
  plugins: [],
}
