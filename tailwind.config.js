/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1F2937',
          dark: '#111827',
          light: '#374151',
          card: '#1F2937',
          surface: '#18212F',
        },
        gold: {
          DEFAULT: '#D4A017',
          hover: '#B8860B',
          light: '#FDE68A',
          dark: '#997300',
          muted: '#8A6D1C',
        }
      }
    },
  },
  plugins: [],
}
