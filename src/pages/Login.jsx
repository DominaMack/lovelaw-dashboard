import { useState } from "react";
import { auth } from "../api/base44.js";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const user = auth.login(email, password, remember);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex" style={{background:"#0a0f1e"}}>
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{background:"linear-gradient(135deg,#0a0f1e 0%,#0f172a 100%)"}}>
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#3b82f6" fillOpacity=".15"/>
            <path d="M20 8 L20 32 M12 16 L20 12 L28 16 M10 28 L30 28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="text-white font-bold text-xl">Love Law™</span>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-4">Daily Dose of Justice™</div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            From 1L to Esq.<br/>
            <span style={{color:"#3b82f6"}}>Stay Motivated</span><br/>
            Every Step.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Welcome, DC. Your platform is live.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[["1,037","Messages Ready"],["921","Approved"],["6","Segments"]].map(([n,l])=>(
            <div key={l} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-xs text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-ll-offwhite">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#3b82f6" fillOpacity=".15"/>
              <path d="M20 8 L20 32 M12 16 L20 12 L28 16 M10 28 L30 28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="font-bold text-ll-navy text-lg">Love Law™</span>
          </div>

          <h2 className="text-2xl font-bold text-ll-navy mb-1">Welcome back</h2>
          <p className="text-ll-gray text-sm mb-8">Sign in to your Love Law™ dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ll-gray uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="dc@shoplovelaw.com"
                className="w-full border border-ll-lgray rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ll-blue/30 focus:border-ll-blue bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ll-gray uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border border-ll-lgray rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ll-blue/30 focus:border-ll-blue bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-ll-gray cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-ll-blue" />
                Stay signed in
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ll-lgray">
            <p className="text-xs text-ll-gray text-center mb-3 font-medium">Quick access</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label:"Founder (DC)", email:"dc@shoplovelaw.com", color:"bg-blue-50 text-blue-700 hover:bg-blue-100" },
                { label:"Employee", email:"employee@shoplovelaw.com", color:"bg-slate-50 text-slate-700 hover:bg-slate-100" },
                { label:"Institution Admin", email:"admin@lawschool.edu", color:"bg-purple-50 text-purple-700 hover:bg-purple-100" },
              ].map(u=>(
                <button key={u.email} onClick={()=>{ setEmail(u.email); setPassword("LoveLaw2026!"); }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${u.color}`}>
                  {u.label} — {u.email}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-ll-gray mt-6">Love Law Collective, LLC · Confidential</p>
        </div>
      </div>
    </div>
  );
}

