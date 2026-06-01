export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Exact colors from shoplovelaw.com
        ll: {
          dark:    '#0a0f1e',   // very dark navy background (hero, footer)
          navy:    '#0f172a',   // dark navy
          blue:    '#3b82f6',   // primary electric blue (CTAs, highlights)
          lblue:   '#60a5fa',   // lighter blue (accents)
          amber:   '#f59e0b',   // "Shop Merch" amber/gold
          white:   '#ffffff',
          offwhite:'#f8fafc',   // light section backgrounds
          gray:    '#64748b',   // body text on light
          lgray:   '#e2e8f0',   // borders on light
          dgray:   '#94a3b8',   // muted text on dark
        }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
      },
      boxShadow: {
        'card':    '0 4px 24px rgba(0,0,0,0.08)',
        'card-dark':'0 4px 24px rgba(0,0,0,0.4)',
        'blue':    '0 4px 20px rgba(59,130,246,0.3)',
      }
    }
  },
  plugins: []
}
