/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Egyptian theme colors
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B8941E',
          light: '#F4E4A6',
        },
        blue: {
          deep: '#1A3A52',
          sky: '#4A90A4',
          dark: '#0D1F2D',
        },
        sand: {
          DEFAULT: '#E5C89E',
          light: '#F5E5D3',
          dark: '#C4A574',
        },
        terracotta: '#C65D3B',
        turquoise: '#30D5C8',
        papyrus: '#F5F5DC',
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-intense': '0 0 30px rgba(212, 175, 55, 0.8)',
        'egyptian': '0 4px 20px rgba(26, 58, 82, 0.3)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8941E 100%)',
        'gradient-blue': 'linear-gradient(135deg, #1A3A52 0%, #0D1F2D 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'unlock': 'unlock 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 1)' },
        },
        'unlock': {
          '0%': { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
