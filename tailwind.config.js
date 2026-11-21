/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FDF9F9',
          surface: '#FFFFFF',
          'surface-alt': '#F9EFEF',
          primary: '#C46D7C',
          'primary-hover': '#A85665',
          secondary: '#F29CAB',
          chocolate: '#7A4426',
          'text-primary': '#3B231E',
          'text-muted': '#7D6462',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}