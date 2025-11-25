/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Playfair Display"', 'serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      colors: {
        'paper': '#fdfbf7',
        'ink': '#2c1810',
        'gold': '#b8860b',
        'cinnabar': '#8b0000',
        'jade': '#e8f5e9',
        'stone-light': '#e6e2d3',
        'wood': '#1a110d',
      },
      backgroundImage: {
        'texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        'wood-pattern': "url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
      },
      animation: {
        'flip-next': 'bookFlipNext 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'flip-prev': 'bookFlipPrev 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'slide-up': 'slideInBottom 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'slide-down': 'slideInTop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        bookFlipNext: {
          '0%': { transform: 'rotateY(85deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        bookFlipPrev: {
          '0%': { transform: 'rotateY(-85deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      }
    }
  },
  plugins: [],
}