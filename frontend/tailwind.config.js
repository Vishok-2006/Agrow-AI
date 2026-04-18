/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agrow: {
          dark: '#020617',
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#A78BFA',
          text: '#E2E8F0',
        },
        slate: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
        },
        indigo: {
          500: '#6366F1',
          400: '#818CF8',
          300: '#A5B4FC',
        },
        violet: {
          500: '#8B5CF6',
          400: '#A78BFA',
        },
      },
    },
  },
  plugins: [],
}
