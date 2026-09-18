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
      },
      keyframes: {
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        },
        'radar-ping': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '70%, 100%': { transform: 'scale(2.2)', opacity: '0' }
        },
        'border-beam': {
          '0%': { 'offset-distance': '0%' },
          '100%': { 'offset-distance': '100%' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'blob': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-ping': 'radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blob': 'blob 7s infinite'
      }
    },
  },
  plugins: [],
}