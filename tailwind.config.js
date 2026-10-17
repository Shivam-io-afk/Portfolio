/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#07070a',
        graphite: '#121318',
        chrome: '#d8dde6',
        signal: '#ff5b1f',
        ok: '#4ade80',
        compile: {
          bg: '#07070a',
          card: '#121318',
          cardBorder: 'rgba(216, 221, 230, 0.08)',
          cardBorderHover: 'rgba(255, 91, 31, 0.35)',
          muted: 'rgba(216, 221, 230, 0.55)',
          hairline: 'rgba(216, 221, 230, 0.12)',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        mono: '0.12em',
        code: '0.08em',
        wide: '0.18em',
      },
      boxShadow: {
        'signal-glow': '0 0 35px rgba(255, 91, 31, 0.45)',
        'signal-glow-sm': '0 0 16px rgba(255, 91, 31, 0.3)',
        'ok-glow': '0 0 15px rgba(74, 222, 128, 0.4)',
      },
    },
  },
  plugins: [],
};
