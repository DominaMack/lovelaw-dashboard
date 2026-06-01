export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a1628', 800: '#0f2044', 700: '#1a3060' },
        gold: { 400: '#f5c842', 500: '#e6b800', 300: '#fad85a' },
        cream: '#faf8f4',
      },
      fontFamily: {
        serif: ['Georgia','Times New Roman','serif'],
        sans: ['Inter','system-ui','sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 60px -10px rgba(10,22,40,0.3)',
        'card': '0 4px 24px rgba(10,22,40,0.08)',
      }
    }
  },
  plugins: []
}
