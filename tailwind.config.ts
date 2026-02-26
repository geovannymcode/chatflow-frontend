// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        surface: {
          900: '#1a1a2e',
          800: '#1e1e35',
          700: '#25253e',
          600: '#2d2d48',
          500: '#3a3a55',
          400: '#4a4a65',
          300: '#6b6b85',
          200: '#9090a5',
          100: '#b5b5c5',
          50: '#e0e0ea',
        },
        bubble: {
          own: '#d1fae5',
          green: '#d1fae5',
          pink: '#fce4ec',
          blue: '#e0f2fe',
          yellow: '#fef9c3',
          purple: '#f3e8ff',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}