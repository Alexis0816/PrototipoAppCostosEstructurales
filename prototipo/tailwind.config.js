/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1628',
          900: '#111e35',
          800: '#1e3a5f',
          700: '#2a4a6f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'diagonal-wave': {
          '0%':   { transform: 'translateX(-70%) skewX(-20deg)', opacity: '0' },
          '25%':  { opacity: '.6' },
          '100%': { transform: 'translateX(280%) skewX(-20deg)', opacity: '0' },
        },
        'wave-bob': {
          '0%':   { transform: 'scaleY(1) scaleX(1)' },
          '28%':  { transform: 'scaleY(0.8) scaleX(1.06)' },
          '52%':  { transform: 'scaleY(1.15) scaleX(0.97)' },
          '72%':  { transform: 'scaleY(0.94) scaleX(1.02)' },
          '100%': { transform: 'scaleY(1) scaleX(1)' },
        },
      },
      animation: {
        'diagonal-wave': 'diagonal-wave .85s cubic-bezier(.4,0,.2,1)',
        'diagonal-wave-2': 'diagonal-wave 1.05s cubic-bezier(.4,0,.2,1) .1s',
        'wave-bob': 'wave-bob .7s cubic-bezier(.45,0,.4,1)',
      },
    },
  },
  plugins: [],
};
