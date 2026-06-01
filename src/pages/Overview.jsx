import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

const STAT = ({ label, value, icon, sub, accent }) => (
  <div className={`bg-white rounded-2xl border p-6 shadow-card relative overflow-hidden ${accent ? "border-gold-400/30 bg-gradient-to-br from-navy-900 to-navy-800" : "border-gray-100"}`}>
    {accent && <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 80% 20%, #f5c842, transparent 60%)"}}/>}
    <div className="flex items-start justify-between mb-4 relative">
      <span className="text-2xl">{icon}</span>
      {accent && <span className="text-xs text-gold-400/60 uppercase tracking-widest font-medium">Live</span>}
    </div>
    <div className={`text-3xl font-bold mb-1 relative ${accent ? "text-gold-400" : "text-navy-900"}`}>{value}</div>
    <div className={`text-sm font-medium ${accent ? "text-white/70" : "text-gray-600"}`}>{label}</div>
    {sub && <div className={`text-xs mt-1 ${accent ? "text-white/40" : "text-gray-400"}`}>{sub}</div>}
  </div>
);

const STATUS = ({ label, status, ok }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`badge ${ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{status}</span>
  </div>
);

export default function Overview({ user }) {
  const [counts, setCounts] = useState({ subscribers: 0, messages: 0, flags: 0, codes: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subs, msgs, flags, codes, pending] = await Promise.all([
          listEntity("Subscriber", { subscription_status: "active" }, 1),
          listEntity("Message", {}, 1),
          listEntity("DistrессFlag", { status: "open" }, 1),
          listEntity("AccessCode", {}, 1),
          listEntity("Message", { approval_status: "pending" }, 1),
        ]);
        setCounts({
          subscribers: subs.count || 0,
          messages: msgs.count || 0,
          flags: flags.count || 0,
          codes: codes.count || 0,
          pending: pending.count || 0,
        });
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const v = (n) => loading ? "—" : n.toLocaleString();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">
          {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
        </div>
        <h1 className="text-3xl font-bold text-navy-900">
          Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. ⚖️
        </h1>
        <p className="text-gray-400 mt-1">Here's what's happening at Love Law™ today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <STAT label="Active Subscribers" value={v(counts.subscribers)} icon="👥" sub="Daily Dose of Justice™" accent={true} />
        <STAT label="Messages in Library" value={v(counts.messages)} icon="📚" sub="Standard + Faith-Based" />
        <STAT label="Pending Approval" value={v(counts.pending)} icon="⏳" sub="Awaiting your review" />
        <STAT label="Open Distress Flags" value={v(counts.flags)} icon="🚨" sub="Needs attention" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-navy-900 text-lg mb-5">Quick Actions</h2>
          <div className="space-y-2.5">
            {[
              { label:"Review Pending Messages", href:"/messages", color:"bg-navy-900 text-gold-400 hover:bg-navy-800", count: counts.pending },
              { label:"Add Subscriber", href:"/subscribers", color:"bg-green-600 text-white hover:bg-green-700" },
              { label:"Generate Access Codes", href:"/codes", color:"bg-gold-400 text-navy-900 hover:bg-gold-300" },
              { label:"Check Distress Flags", href:"/flags", color:"bg-red-50 text-red-700 hover:bg-red-100", count: counts.flags },
              { label:"Enterprise Management", href:"/enterprise", color:"bg-purple-50 text-purple-700 hover:bg-purple-100" },
            ].map(a => (
              <a key={a.href} href={a.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition ${a.color}`}>
                <span>{a.label}</span>
                <span>{a.count !== undefined ? a.count : "→"}</span>
              </a>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h2 className="font-bold text-navy-900 text-lg mb-5">System Status</h2>
          <STATUS label="Daily Send Automation" status="● Live" ok={true} />
          <STATUS label="GHL SMS Integration" status="● Connected" ok={true} />
          <STATUS label="Distress Monitoring" status="● Active 24/7" ok={true} />
          <STATUS label="A2P 10DLC Compliance" status="✓ Approved" ok={true} />
          <STATUS label="Access Code Redemption" status="● Live" ok={true} />
          <STATUS label="GHL Drip Workflows" status="⚠ Setup Pending" ok={false} />
          <div className="mt-5 bg-navy-900/5 rounded-xl p-4 border border-navy-900/10">
            <div className="text-xs font-bold text-navy-900 mb-1">🤖 Lexington is on</div>
            <div className="text-xs text-gray-500">Monitoring distress flags, managing content pipeline, and sending your Monday briefing every week.</div>
          </div>
        </div>
      </div>

      {/* Pricing Snapshot */}
      <div className="card mt-6">
        <h2 className="font-bold text-navy-900 text-lg mb-5">Subscription Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier:"Law Students", mo:"$7.99", q:"$21.99", yr:"$59", color:"bg-blue-50 text-blue-700 border-blue-100" },
            { tier:"Bar Prep", mo:"$12.99", q:"$36.99", yr:"$99", color:"bg-gold-400/10 text-navy-900 border-gold-400/20", badge:"Most Popular" },
            { tier:"Attorneys", mo:"$9.99", q:"$29.99", yr:"$79", color:"bg-purple-50 text-purple-700 border-purple-100" },
          ].map(p => (
            <div key={p.tier} className={`border rounded-2xl p-4 ${p.color}`}>
              {p.badge && <span className="text-xs bg-gold-400 text-navy-900 px-2 py-0.5 rounded-full font-bold mb-2 inline-block">{p.badge}</span>}
              <div className="font-bold text-base mb-3">{p.tier}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="opacity-60">Monthly</span><span className="font-semibold">{p.mo}</span></div>
                <div className="flex justify-between"><span className="opacity-60">90-Day</span><span className="font-semibold">{p.q}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Annual</span><span className="font-semibold">{p.yr}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
