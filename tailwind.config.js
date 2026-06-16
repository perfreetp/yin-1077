/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C42',
          light: '#FFB074',
          dark: '#E67320',
        },
        forest: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
        },
        sky: {
          DEFAULT: '#64B5F6',
          light: '#90CAF9',
          dark: '#42A5F5',
        },
        gold: {
          DEFAULT: '#FFD54F',
          light: '#FFE082',
          dark: '#FFC107',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF8A80',
          dark: '#E53935',
        },
        cream: {
          DEFAULT: '#FFF8E7',
          dark: '#F5EDDA',
        },
        lava: {
          DEFAULT: '#FF5722',
          light: '#FF8A65',
          dark: '#E64A19',
        },
        cosmos: {
          DEFAULT: '#7C4DFF',
          light: '#B388FF',
          dark: '#651FFF',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'game': '16px',
        'card': '20px',
        'button': '12px',
      },
      boxShadow: {
        'game': '0 4px 0 rgba(0,0,0,0.15)',
        'game-lg': '0 6px 0 rgba(0,0,0,0.15)',
        'game-hover': '0 2px 0 rgba(0,0,0,0.15)',
        'card': '0 4px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'walk': 'walk 0.6s steps(4) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'coin-fly': 'coinFly 0.6s ease-out forwards',
        'star-pop': 'starPop 0.5s ease-out forwards',
        'obstacle': 'obstacle 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255,140,66,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(255,140,66,0.8)' },
        },
        walk: {
          '0%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-3px)' },
          '50%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(-3px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        coinFly: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.5) translateY(-40px)', opacity: '0' },
        },
        starPop: {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        obstacle: {
          '0%': { transform: 'scale(0) rotate(-90deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
