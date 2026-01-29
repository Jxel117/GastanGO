/** @type {import('tailwindcss').Config} */
export default {
  // Esta es la línea mágica que habilita el botón manual:
  darkMode: 'class', 
  
  // Esto le dice a Tailwind dónde buscar tus clases (vital en Vite):
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}