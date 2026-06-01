import { NavLink, useNavigate } from "react-router-dom";
import { auth, DEMO_USERS, can } from "../api/base44.js";
import { useState } from "react";

const NAV = [
  { to:"/",         icon:"📊", label:"Overview",       roles:["founder","employee","institution"] },
  { to:"/messages", icon:"✉️",  label:"Messages",       roles:["founder","employee"] },
  { to:"/subscribers",icon:"👥",label:"Subscribers",    roles:["founder","employee"] },
  { to:"/enterprise",icon:"🏛️", label:"Enterprise",     roles:["founder"] },
  { to:"/flags",    icon:"🚨", label:"Distress Flags",  roles:["founder","employee"] },
  { to:"/codes",    icon:"🔑", label:"Access Codes",    roles:["founder","employee"] },
];

export default function Sidebar({ user, onImpersonate }) {
  const navigate = useNavigate();
  const [showImpersonate, setShowImpersonate] = useState(false);

  const visibleNav = NAV.filter(n => n.roles.includes(user?.role));

  function handleLogout() {
    auth.logout();
  }

  return (
    <aside className="sidebar shadow-card-dark">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"rgba(59,130,246,0.2)"}}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <path d="M20 4 L20 36 M10 14 L20 8 L30 14 M8 32 L32 32" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Love Law™</div>
            <div className="text-xs mt-0.5" style={{color:"#3b82f6"}}>Daily Dose of Justice™</div>
          </div>
        </div>
      </div>

      {/* Impersonate banner */}
      {user?._impersonating && (
        <div className="mx-3 mt-3 bg-amber-400/20 border border-amber-400/40 rounded-xl px-3 py-2 text-xs text-amber-300">
          <div className="font-bold mb-0.5">Viewing as:</div>
          <div>{user.name}</div>
          <button onClick={() => onImpersonate(null)} className="text-amber-200 underline mt-1">Exit view</button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}
            className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* View As User (founder only) */}
      {can.impersonate(user) && !user._impersonating && (
        <div className="px-3 pb-2">
          <button onClick={() => setShowImpersonate(s=>!s)}
            className="w-full text-left nav-link text-xs border border-white/10">
            <span>👤</span> View as User
          </button>
          {showImpersonate && (
            <div className="mt-1 bg-ll-navy rounded-xl border border-white/10 overflow-hidden">
              {DEMO_USERS.filter(u=>u.role !== "founder").map(u => (
                <button key={u.email} onClick={() => { onImpersonate({...u, _impersonating: true}); setShowImpersonate(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/10 transition border-b border-white/5 last:border-0">
                  <div className="font-semibold text-white">{u.name}</div>
                  <div className="text-slate-500">{u.role} · {u.email}</div>
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
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
            <div className="text-slate-500 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full text-xs text-slate-500 hover:text-red-400 transition text-left px-2 py-1.5 rounded-lg hover:bg-white/5">
          Sign out
        </button>
      </div>
    </aside>
  );
}
