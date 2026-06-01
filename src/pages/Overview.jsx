import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";
import { Link } from "react-router-dom";

function StatCard({ icon, value, label, color, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 md:p-5 flex flex-col gap-2">
      <span className="text-2xl">{icon}</span>
      <div className="text-2xl md:text-3xl font-bold" style={color?{color}:{color:"#0f172a"}}>{value}</div>
      <div className="text-sm text-ll-gray">{label}</div>
      {sub && <div className="text-xs text-ll-gray">{sub}</div>}
    </div>
  );
}

export default function Overview({ user }) {
  const [msgs, setMsgs] = useState({approved:0, pending:0, total:0});
  const [subs, setSubs] = useState({active:0, total:0});
  const [flags, setFlags] = useState({open:0});
  const [codes, setCodes] = useState({active:0});
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0];

  useEffect(() => {
    Promise.all([
      listEntity("Message",{},500,0),
      listEntity("Subscriber",{},500,0),
      listEntity("DistrессFlag",{},200,0),
      listEntity("AccessCode",{},200,0),
    ]).then(([m,s,f,c]) => {
      const mr=m.records||[], sr=s.records||[], fr=f.records||[], cr=c.records||[];
      setMsgs({ approved:mr.filter(x=>x.approval_status==="approved").length, pending:mr.filter(x=>x.approval_status==="pending").length, total:mr.length });
      setSubs({ active:sr.filter(x=>x.subscription_status==="active").length, total:sr.length });
      setFlags({ open:fr.filter(x=>x.status==="new"||x.status==="acknowledged").length });
      setCodes({ active:cr.filter(x=>x.status==="active").length });
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-6 md:mb-8">
        <div className="text-xs text-ll-gray uppercase tracking-widest font-semibold mb-1">
          {now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ll-navy">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-ll-gray text-sm mt-1">Here's your Love Law™ platform at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard icon="✉️" value={loading?"—":msgs.total.toLocaleString()} label="Total Messages" color="#3b82f6" sub={loading?"":msgs.pending>0?`${msgs.pending} pending review`:undefined} />
        <StatCard icon="✅" value={loading?"—":msgs.approved.toLocaleString()} label="Approved" />
        <StatCard icon="👥" value={loading?"—":subs.active.toLocaleString()} label="Active Subscribers" sub={loading?"":subs.total>0?`${subs.total} total`:undefined} />
        <StatCard icon="🚨" value={loading?"—":flags.open} label="Open Distress Flags" color={flags.open>0?"#ef4444":undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* System Status — Love Law admin only */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5 md:p-6">
          <h2 className="font-bold text-ll-navy mb-4">System Status</h2>
          <div className="space-y-3">
            {[
              { label:"Daily Send Automation", status:"Live — 8:00 AM ET", ok:true },
              { label:"GHL SMS Integration",   status:"Connected", ok:true },
              { label:"A2P 10DLC Compliance",  status:"Approved", ok:true },
              { label:"Distress Monitoring",   status:"Active 24/7", ok:true },
              { label:"Message Library",
                status: loading ? "Loading..." : msgs.total>0 ? `${msgs.total.toLocaleString()} messages · ${msgs.approved.toLocaleString()} approved` : "No messages loaded",
                ok: msgs.approved > 0 },
              { label:"Access Codes Active",   status: loading?"Loading...":`${codes.active} active codes`, ok:true },
            ].map(s=>(
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-ll-lgray/50 last:border-0">
                <span className="text-sm text-ll-navy font-medium">{s.label}</span>
                <span className={`flex items-center gap-2 text-xs font-semibold ${s.ok?"text-green-600":"text-amber-600"}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.ok?"bg-green-500":"bg-amber-400"}`}/>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl p-5 text-white" style={{background:"#0a0f1e"}}>
          <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-4">Quick Actions</div>
          <div className="space-y-1">
            {[
              { icon:"✉️", label:"Review Messages",   to:"/messages" },
              { icon:"👥", label:"View Subscribers",  to:"/subscribers" },
              { icon:"🚨", label:"Check Flags",        to:"/flags" },
              { icon:"🔑", label:"Access Codes",       to:"/codes" },
              { icon:"🏛️", label:"Enterprise",         to:"/enterprise" },
            ].map(a=>(
              <Link key={a.to} to={a.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition text-sm text-slate-300 hover:text-white">
                <span>{a.icon}</span>{a.label}
              </Link>
            ))}
          </div>

          {/* Alerts */}
          {flags.open > 0 && (
            <div className="mt-4 rounded-xl p-3 border border-red-400/40" style={{background:"rgba(239,68,68,0.1)"}}>
              <div className="text-xs text-red-300 font-bold mb-0.5">🚨 {flags.open} open distress flag{flags.open>1?"s":""}</div>
              <Link to="/flags" className="text-xs text-red-200 underline">Review now →</Link>
            </div>
          )}
          {msgs.pending > 0 && (
            <div className="mt-2 rounded-xl p-3 border border-amber-400/40" style={{background:"rgba(251,191,36,0.08)"}}>
              <div className="text-xs text-amber-300 font-bold mb-0.5">⏳ {msgs.pending} messages need approval</div>
              <Link to="/messages" className="text-xs text-amber-200 underline">Review now →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Pricing reference — admin only, not institution */}
      <div className="mt-5 bg-white rounded-2xl shadow-card p-5 md:p-6 border border-ll-lgray/50">
        <div className="flex flex-wrap gap-2 justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-ll-navy">Live Pricing Reference</h2>
            <p className="text-xs text-ll-gray mt-0.5">From shoplovelaw.com — for internal reference only</p>
          </div>
          <a href="https://shoplovelaw.com" target="_blank" rel="noreferrer" className="text-xs text-ll-blue hover:underline">View live site ↗</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { seg:"Law Students",  mo:"$7.99/mo", q:"$21.99/90-day", yr:"$59/yr" },
            { seg:"Bar Prep",      mo:"$12.99/mo",q:"$36.99/90-day", yr:"$99/yr", pop:true },
            { seg:"Attorneys",     mo:"$9.99/mo", q:"$29.99/90-day", yr:"$79/yr" },
          ].map(p=>(
            <div key={p.seg} className={`rounded-xl p-4 border ${p.pop?"border-ll-blue bg-blue-50":"border-ll-lgray bg-ll-offwhite"}`}>
              {p.pop && <div className="text-xs text-ll-blue font-bold mb-1">★ Most Popular</div>}
              <div className="font-semibold text-ll-navy text-sm mb-2">{p.seg}</div>
              <div className="text-xl font-bold text-ll-navy">{p.mo}</div>
              <div className="text-xs text-ll-gray mt-1">{p.q} · {p.yr}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
