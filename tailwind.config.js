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
          creme: '#F8F0E9',
          rose: '#C98291',
          cacau: '#6D4A4A',
          mauve: '#B88D91',
          berry: '#8E5365',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ["Montserrat", 'system-ui', 'sans-serif'],
        display: ["Playfair Display", 'Georgia', 'serif'],
        script: ["Dancing Script", 'cursive'],
      },
    },
  },
  plugins: [],
},
