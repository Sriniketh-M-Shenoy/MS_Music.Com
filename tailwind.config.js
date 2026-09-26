/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#000000',
          card: '#0c0c0e',
          cardHover: '#141417',
          subtle: '#161619',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.2)',
          text: '#f5f5f7',
          muted: '#86868b',
          dim: '#6e6e73',
          gold: '#F5C451',
          goldGlow: 'rgba(245, 196, 81, 0.15)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        widestApple: '0.2em',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(15px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%': { opacity: 0.3, transform: 'scale(1)' },
          '100%': { opacity: 0.6, transform: 'scale(1.08)' },
        }
      }
    },
  },
  plugins: [],
}
