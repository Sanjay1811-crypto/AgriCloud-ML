/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f2f9f3',
          100: '#e1f2e5',
          200: '#c4e5cc',
          300: '#97d1a4',
          400: '#64b576',
          500: '#3f9953',
          600: '#2f7c40',
          700: '#276235',
          800: '#234f2d',
          900: '#1e4127',
          950: '#0c2313',
        },
        leaf: {
          dark: '#143422',
          DEFAULT: '#2d6a4f',
          light: '#52b788',
          accent: '#74c69d',
          pale: '#d8f3dc'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(16, 24, 40, 0.06), 0 2px 6px -1px rgba(16, 24, 40, 0.04)',
        'elevated': '0 12px 32px -4px rgba(16, 24, 40, 0.08), 0 4px 12px -2px rgba(16, 24, 40, 0.03)',
      }
    },
  },
  plugins: [],
}
