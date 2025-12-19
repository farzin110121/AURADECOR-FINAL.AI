
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,pages,App,hooks,context}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-gold': '#D4AF37',
        'secondary-gold': '#F1C40F',
        'dark-bg': '#050505',
        'card-bg': 'rgba(255, 255, 255, 0.03)',
        'border-color': 'rgba(212, 175, 55, 0.25)',
        'text-light': '#ffffff',
        'text-muted': '#aaaaaa',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
