import { NavLink } from "react-router-dom";
import { auth } from "../api/base44.js";
import Logo from "./Logo.jsx";

const NAV = {
  founder:     ["overview","messages","subscribers","enterprise","flags","codes"],
  employee:    ["overview","messages","subscribers","flags","codes"],
  institution: ["overview","subscribers","flags"],
};

const ITEMS = [
  { id:"overview",     to:"/",         icon:"⊞",  label:"Overview"       },
  { id:"messages",     to:"/messages", icon:"📚", label:"Messages"       },
  { id:"subscribers",  to:"/subscribers", icon:"👥", label:"Subscribers" },
  { id:"enterprise",   to:"/enterprise",  icon:"🏛️", label:"Enterprise"  },
  { id:"flags",        to:"/flags",    icon:"🚨", label:"Distress Flags" },
  { id:"codes",        to:"/codes",    icon:"🔑", label:"Access Codes"   },
];

export default function Sidebar({ user }) {
  const allowed = NAV[user?.role] || [];
  const visible = ITEMS.filter(i => allowed.includes(i.id));

  return (
    <aside className="w-64 bg-navy-900 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Logo size="md" dark={false} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {visible.map(item => (
          <NavLink key={item.id} to={item.to} end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold-400/15 text-gold-400 border border-gold-400/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 font-bold text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-white/40 text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button onClick={auth.logout}
          className="w-full text-white/40 hover:text-red-400 text-xs py-2 hover:bg-red-400/10 rounded-lg transition text-left px-2">
          → Sign Out
        </button>
      </div>
    </aside>
  );
}
