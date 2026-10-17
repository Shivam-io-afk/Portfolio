/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#030305',
          900: '#07070a',
          800: '#0e0e14',
          700: '#161622',
        },
        magma: {
          base: '#ff3b00',
          crimson: '#e60039',
          bright: '#ff5e00',
          ember: '#ffaa33',
          glow: 'rgba(255, 60, 0, 0.45)',
        },
        smoke: {
          100: '#e0e0e8',
          300: '#a2a2b0',
          500: '#68687a',
          700: '#32323e',
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        sans: ['"Onest"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heat-drift': 'heatDrift 8s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        heatDrift: {
          '0%': { transform: 'translateY(0px) scale(1)' },
          '100%': { transform: 'translateY(-12px) scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
