import { NavLink } from "react-router-dom";
import { auth, DEMO_USERS, can } from "../api/base44.js";
import { useState } from "react";

const NAV_ADMIN = [
  { to:"/",               icon:"📊", label:"Overview"       },
  { to:"/messages",       icon:"✉️",  label:"Messages"       },
  { to:"/subscribers",    icon:"👥", label:"Subscribers"    },
  { to:"/enterprise",     icon:"🏛️", label:"Enterprise"     },
  { to:"/flags",          icon:"🚨", label:"Distress Flags" },
  { to:"/codes",          icon:"🔑", label:"Access Codes"   },
  { to:"/card-templates", icon:"🎨", label:"Card Templates" },
];

const NAV_INSTITUTION = [
  { to:"/",       icon:"📊", label:"Overview"      },
  { to:"/roster", icon:"👥", label:"My Roster"     },
  { to:"/flags",  icon:"🚨", label:"Distress Flags"},
];

export default function Sidebar({ user, realUser, onImpersonate }) {
  const [showViewAs, setShowViewAs] = useState(false);
  const isInstitution = user?.role === "institution";
  const navItems = isInstitution ? NAV_INSTITUTION : NAV_ADMIN;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-30 shadow-2xl" style={{background:"#0a0f1e"}}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)"}}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L20 36M10 14L20 8L30 14M8 32L32 32" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Love Law™</div>
            <div className="text-xs mt-0.5" style={{color:"#3b82f6"}}>Daily Dose of Justice™</div>
          </div>
        </div>

        {/* Institution badge — shows tier, NO internal infrastructure info */}
        {isInstitution && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs text-blue-200 border border-blue-500/20" style={{background:"rgba(59,130,246,0.1)"}}>
            <div className="font-semibold">{user?.institution || "Your Institution"}</div>
            <div className="text-blue-400 capitalize">{user?.tier || "Small"} Plan</div>
          </div>
        )}
      </div>

      {/* Impersonate banner */}
      {user?._impersonating && (
        <div className="mx-3 mt-3 rounded-xl px-3 py-2 text-xs text-amber-300 border border-amber-400/40" style={{background:"rgba(251,191,36,0.1)"}}>
          <div className="font-bold mb-0.5">👁 Viewing as:</div>
          <div>{user.name} ({user.role})</div>
          <button onClick={() => onImpersonate(null)} className="text-amber-300 underline mt-1 hover:text-amber-100">← Exit view</button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}
            className={({isActive}) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/8"
              }`
            }
            style={({isActive}) => isActive ? {background:"rgba(59,130,246,0.15)"} : {}}>
            <span className="text-base w-5 text-center leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* View As (founder only, not while impersonating) */}
      {can.impersonate(realUser) && !user?._impersonating && (
        <div className="px-3 pb-3">
          <div className="border-t border-white/10 pt-3 mb-2"/>
          <button onClick={() => setShowViewAs(s=>!s)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 transition border border-white/10">
            <span>👤</span> View as User
            <span className="ml-auto">{showViewAs?"▲":"▼"}</span>
          </button>
          {showViewAs && (
            <div className="mt-1 rounded-xl border border-white/10 overflow-hidden" style={{background:"rgba(255,255,255,0.04)"}}>
              {DEMO_USERS.filter(u => u.role !== "founder").map(u => (
                <button key={u.email}
                  onClick={() => { onImpersonate({...u, _impersonating:true}); setShowViewAs(false); }}
                  className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-white/10 transition border-b border-white/5 last:border-0">
                  <div className="font-semibold text-white">{u.name}</div>
                  <div className="text-slate-500 mt-0.5 capitalize">{u.role}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{background:"#3b82f6"}}>
            {user?.avatar || user?.name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs capitalize">{user?.role === "institution" ? "Institution Admin" : user?.role}</div>
          </div>
        </div>
        <button onClick={auth.logout}
          className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition px-2 py-1.5 rounded-lg hover:bg-white/5">
          Sign out
        </button>
      </div>
    </aside>
  );
}
