# Love Law™ Dashboard
**Daily Dose of Justice™ — Internal Operations Platform**

Built by Lexington for DC McCraney, J.D. — Love Law Collective, LLC

## Stack
- React 18 + Vite
- Tailwind CSS (custom navy/gold brand theme)
- React Router v6
- Base44 Backend API (entities + functions)

## Pages
- `/` — Overview Dashboard (stats, quick actions, system status)
- `/messages` — Full message library (1,037+ GSM-7 messages, approve/reject)
- `/subscribers` — Subscriber management (bar exam countdown, tracks, status)
- `/enterprise` — Institution & firm management (law schools, firms, bar prep)
- `/flags` — Distress flag monitoring (24/7 wellness alerts)
- `/codes` — Access code generation & tracking (Etsy, Amazon, enterprise, events)

## Roles
| Role | Access |
|---|---|
| Founder | Full access to everything |
| Employee | Messages, Subscribers, Flags, Codes |
| Institution Admin | Their cohort only |

## Login
- Email/Password
- Google OAuth (coming soon)

## Deploy to Vercel
1. Import `DominaMack/lovelaw-dashboard` on vercel.com
2. Framework: Vite | Build: `npm run build` | Output: `dist`
3. Deploy — auto-deploys on every push to `main`
4. Add custom domain: `dashboard.shoplovelaw.com`

## DNS (Network Solutions)
Add CNAME record: `dashboard` → `cname.vercel-dns.com`

## Backend
All data in Base44 (App ID: `6a0a1851e19edca1b6fa628f`)
