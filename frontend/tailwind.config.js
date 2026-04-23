/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agrow: {
          bg: '#0B0F1A',
          card: '#111827',
          primary: '#10B981', // Emerald 500
          secondary: '#059669', // Emerald 600
          accent: '#34D399', // Emerald 400
          text: '#F9FAFB', // Gray 50
          muted: '#94A3B8', // Slate 400
        },
      },
    },
  },
  plugins: [],
}
