/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1e293b',
        },
        primary: '#3b82f6',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e'
      }
    },
  },
  plugins: [],
}
