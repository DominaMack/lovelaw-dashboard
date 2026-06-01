// Love Law™ — Base44 API
const APP_ID = "6a0a1851e19edca1b6fa628f";
const BASE = `https://api.base44.com/api/apps/${APP_ID}`;

export async function listEntity(entity, filters = {}, limit = 50, skip = 0) {
  const body = { limit, skip, ...filters };
  const res = await fetch(`${BASE}/entities/${entity}/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function callFunction(name, payload = {}) {
  const res = await fetch(`${BASE}/functions/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Auth helpers (localStorage-based session)
export const auth = {
  getUser: () => {
    try { return JSON.parse(localStorage.getItem("ll_user") || "null"); } catch { return null; }
  },
  setUser: (user) => localStorage.setItem("ll_user", JSON.stringify(user)),
  logout: () => { localStorage.removeItem("ll_user"); window.location.href = "/login"; },
  isLoggedIn: () => !!auth.getUser(),
};

// Demo credentials (replace with real backend auth)
export const DEMO_USERS = [
  { email: "dc@shoplovelaw.com",    password: "LoveLaw2026!", role: "founder",   name: "DC McCraney" },
  { email: "employee@shoplovelaw.com", password: "LoveLaw2026!", role: "employee", name: "Team Member" },
  { email: "admin@lawschool.edu",   password: "LoveLaw2026!", role: "institution", name: "Institution Admin", institution: "Demo Law School" },
];
