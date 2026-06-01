// Love Law™ — Base44 API Client
// Routes all entity reads through the deployed getData backend function
// which has full service-role access to the database.

const FUNCTION_BASE = "https://api.base44.com/api/apps/6a0a1851e19edca1b6fa628f/functions";

async function callFunction(name, payload = {}) {
  const res = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Function ${name} failed: ${res.status} — ${err}`);
  }
  return res.json();
}

export async function listEntity(entity, filters = {}, limit = 50, skip = 0) {
  return callFunction("getData", { entity, filters, limit, skip });
}

export async function updateEntity(name, id, data) {
  return callFunction("updateMessage", { message_id: id, ...data });
}

export { callFunction };

// ─── Auth (persistent localStorage session) ────────────────────────────────
const SESSION_KEY = "ll_session_v2";

export const DEMO_USERS = [
  {
    email: "dc@shoplovelaw.com",
    password: "LoveLaw2026!",
    role: "founder",
    name: "DC McCraney, J.D.",
    title: "Founder & CEO",
    avatar: "DC",
  },
  {
    email: "employee@shoplovelaw.com",
    password: "LoveLaw2026!",
    role: "employee",
    name: "Team Member",
    title: "Operations",
    avatar: "TM",
  },
  {
    email: "admin@lawschool.edu",
    password: "LoveLaw2026!",
    role: "institution",
    name: "Institution Admin",
    title: "Law School Admin",
    institution: "Demo Law School",
    avatar: "IA",
  },
];

export const auth = {
  getUser: () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser: (user, remember = true) => {
    const data = JSON.stringify(user);
    sessionStorage.setItem(SESSION_KEY, data); // always set session
    if (remember) localStorage.setItem(SESSION_KEY, data); // persist across tabs/refresh
  },
  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/";
  },
  login: (email, password, remember = true) => {
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password");
    const session = { ...user };
    delete session.password;
    auth.setUser(session, remember);
    return session;
  },
};

// Role checks
export const can = {
  viewAll:       (u) => u?.role === "founder",
  manageMessages:(u) => ["founder","employee"].includes(u?.role),
  viewSubs:      (u) => ["founder","employee"].includes(u?.role),
  viewEnterprise:(u) => u?.role === "founder",
  impersonate:   (u) => u?.role === "founder",
};
