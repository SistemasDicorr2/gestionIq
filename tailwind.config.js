// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // **ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:**
  // Esto le dice a Tailwind que use la estrategia de clase para el modo oscuro.
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B213C',
          'navy-dark': '#07162A',
          'navy-light': '#16375F',
          cyan: '#086F92',
          'cyan-dark': '#065571',
          'cyan-light': '#0CA0D2',
          'bg-light': '#F7F8FA',
          surface: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}