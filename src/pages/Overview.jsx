import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

function StatCard({ icon, value, label, delta, deltaUp, color }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {delta && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${deltaUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {delta}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold" style={color ? {color} : {color:"#0f172a"}}>{value}</div>
      <div className="text-sm text-ll-gray">{label}</div>
    </div>
  );
}

export default function Overview({ user }) {
  const [msgs, setMsgs] = useState({approved:0, pending:0, total:0});
  const [subs, setSubs] = useState({active:0, total:0});
  const [flags, setFlags] = useState({open:0});
  const [codes, setCodes] = useState({active:0});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listEntity("Message", {}, 500, 0),
      listEntity("Subscriber", {}, 500, 0),
      listEntity("DistrессFlag", {}, 100, 0),
      listEntity("AccessCode", {}, 100, 0),
    ]).then(([m, s, f, c]) => {
      const mr = m.records || [];
      const sr = s.records || [];
      const fr = f.records || [];
      const cr = c.records || [];
      setMsgs({
        approved: mr.filter(x=>x.approval_status==="approved").length,
        pending:  mr.filter(x=>x.approval_status==="pending").length,
        total:    mr.length,
      });
      setSubs({
        active: sr.filter(x=>x.subscription_status==="active").length,
        total:  sr.length,
      });
      setFlags({ open: fr.filter(x=>x.status==="open").length });
      setCodes({ active: cr.filter(x=>x.status==="active").length });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs text-ll-gray uppercase tracking-widest font-semibold mb-1">
          {now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        </div>
        <h1 className="text-3xl font-bold text-ll-navy">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-ll-gray mt-1">Here's your Love Law™ system at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="✉️" value={loading?"—":msgs.total.toLocaleString()} label="Total Messages" color="#3b82f6" />
        <StatCard icon="✅" value={loading?"—":msgs.approved.toLocaleString()} label="Approved" deltaUp delta={msgs.pending>0?`${msgs.pending} pending`:null} />
        <StatCard icon="👥" value={loading?"—":subs.active.toLocaleString()} label="Active Subscribers" />
        <StatCard icon="🚨" value={loading?"—":flags.open} label="Open Distress Flags" color={flags.open>0?"#ef4444":undefined} />
      </div>

      {/* System health */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card col-span-2">
          <h2 className="font-bold text-ll-navy mb-4">System Status</h2>
          <div className="space-y-3">
            {[
              { label:"Daily Send Automation", status:"Live", ok:true },
              { label:"GHL SMS Integration", status:"Connected — The Domina Agency", ok:true },
              { label:"A2P 10DLC Compliance", status:"Approved", ok:true },
              { label:"Distress Monitoring", status:"Active 24/7", ok:true },
              { label:"Message Library", status:`${msgs.total} messages · ${msgs.approved} approved`, ok:msgs.approved>0 },
            ].map(s=>(
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-ll-lgray/50 last:border-0">
                <span className="text-sm text-ll-navy font-medium">{s.label}</span>
                <span className={`flex items-center gap-2 text-xs font-semibold ${s.ok?"text-green-600":"text-amber-600"}`}>
                  <span className={`w-2 h-2 rounded-full ${s.ok?"bg-green-500":"bg-amber-400"}`}/>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{background:"#0a0f1e",color:"white"}}>
          <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-4">Quick Actions</div>
          <div className="space-y-2">
            {[
              ["✉️","Review Messages","/messages"],
              ["👥","View Subscribers","/subscribers"],
              ["🚨","Check Flags","/flags"],
              ["🔑","Access Codes","/codes"],
              ["🏛️","Enterprise","/enterprise"],
            ].map(([icon,label,href])=>(
              <a key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300 hover:text-white">
                <span>{icon}</span>{label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing reference */}
      <div className="card border border-ll-lgray/50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-ll-navy">Individual Pricing</h2>
            <p className="text-xs text-ll-gray mt-0.5">Current rates from shoplovelaw.com</p>
          </div>
          <a href="https://shoplovelaw.com" target="_blank" className="text-xs text-ll-blue hover:underline">View live site ↗</a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { segment:"Law Students", mo:"$7.99/mo", quarter:"$21.99/90-day", year:"$59/year" },
            { segment:"Bar Prep", mo:"$12.99/mo", quarter:"$36.99/90-day", year:"$99/year", popular:true },
            { segment:"Attorneys", mo:"$9.99/mo", quarter:"$29.99/90-day", year:"$79/year" },
          ].map(p=>(
            <div key={p.segment} className={`rounded-xl p-4 border ${p.popular?"border-ll-blue bg-blue-50":"border-ll-lgray bg-ll-offwhite"}`}>
              {p.popular && <div className="text-xs text-ll-blue font-bold mb-1">★ Most Popular</div>}
              <div className="font-semibold text-ll-navy text-sm mb-2">{p.segment}</div>
              <div className="text-xl font-bold text-ll-navy">{p.mo}</div>
              <div className="text-xs text-ll-gray mt-1">{p.quarter} · {p.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
