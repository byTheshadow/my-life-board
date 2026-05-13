/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.55)',
          dark:  'rgba(20,20,30,0.55)',
          border: 'rgba(255,255,255,0.25)',
          'border-dark': 'rgba(255,255,255,0.08)',
        },
      },
    },
  },
  plugins: [],
}
