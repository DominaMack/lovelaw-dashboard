import { useState } from "react";
import { NavLink } from "react-router-dom";
import { auth, DEMO_USERS, can } from "../api/base44.js";

const NAV_ADMIN = [
  { to:"/",            icon:"📊", label:"Overview"       },
  { to:"/messages",    icon:"✉️",  label:"Messages"       },
  { to:"/subscribers", icon:"👥", label:"Subscribers"    },
  { to:"/enterprise",  icon:"🏛️", label:"Enterprise"     },
  { to:"/flags",       icon:"🚨", label:"Flags"          },
  { to:"/codes",       icon:"🔑", label:"Codes"          },
];

const NAV_INSTITUTION = [
  { to:"/",        icon:"📊", label:"Overview" },
  { to:"/roster",  icon:"👥", label:"Roster"   },
  { to:"/flags",   icon:"🚨", label:"Flags"    },
];

export default function MobileNav({ user, realUser, onImpersonate }) {
  const [open, setOpen] = useState(false);
  const isInstitution = user?.role === "institution";
  const navItems = isInstitution ? NAV_INSTITUTION : NAV_ADMIN;

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{background:"#0a0f1e"}}>
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L20 36M10 14L20 8L30 14M8 32L32 32" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white font-bold text-sm">Love Law™</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-white p-1">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
        </button>
      </div>

      {/* Slide-out drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
          <div className="w-72 h-full flex flex-col" style={{background:"#0a0f1e"}}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <div className="text-white font-bold text-sm">Love Law™</div>
                <div className="text-xs" style={{color:"#3b82f6"}}>Daily Dose of Justice™</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Impersonate banner */}
            {user?._impersonating && (
              <div className="mx-3 mt-3 bg-amber-400/20 border border-amber-400/40 rounded-xl px-3 py-2 text-xs text-amber-300">
                <div className="font-bold">Viewing as: {user.name}</div>
                <button onClick={() => { onImpersonate(null); setOpen(false); }} className="text-amber-200 underline mt-1">Exit view</button>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                  <span>{item.icon}</span>{item.label}
                </NavLink>
              ))}
            </nav>

            {/* View As (founder only) */}
            {can.impersonate(realUser) && !user?._impersonating && (
              <div className="px-3 pb-3">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold px-2 mb-2">View As</div>
                {DEMO_USERS.filter(u => u.role !== "founder").map(u => (
                  <button key={u.email}
                    onClick={() => { onImpersonate({...u, _impersonating:true}); setOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-white/10 transition mb-1">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-slate-500">{u.role}</div>
                  </button>
                ))}
              </div>
            )}

            {/* User + logout */}
            <div className="px-4 py-4 border-t border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{background:"#3b82f6"}}>
                  {user?.avatar || user?.name?.charAt(0) || "?"}
                </div>
                <div>
                  <div className="text-white text-xs font-semibold">{user?.name}</div>
                  <div className="text-slate-500 text-xs capitalize">{user?.role}</div>
                </div>
              </div>
              <button onClick={auth.logout} className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition px-2 py-1.5 rounded-lg">
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
