export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ll: {
          dark:    '#0a0f1e',
          navy:    '#0f172a',
          blue:    '#3b82f6',
          lblue:   '#60a5fa',
          amber:   '#f59e0b',
          white:   '#ffffff',
          offwhite:'#f8fafc',
          gray:    '#64748b',
          lgray:   '#e2e8f0',
          dgray:   '#94a3b8',
        }
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      boxShadow: {
        'card':      '0 2px 16px rgba(0,0,0,0.07)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
        'blue':      '0 4px 20px rgba(59,130,246,0.3)',
      }
    }
  },
  plugins: []
}
