import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

// Real pricing from shoplovelaw.com/enterprise
const TIERS = [
  {
    name:"Small", users:"Up to 250 users", price:"$499/month", setup:"$500",
    features:["Daily SMS messages","Basic customization","Email support","Monthly reports"],
    color:"border-ll-lgray", badge:null,
  },
  {
    name:"Mid-Size", users:"Up to 1,000 users", price:"$1,499/month", setup:"$1,000",
    features:["Everything in Small","Custom message tracks","Priority support","Role-based messaging","Quarterly reviews"],
    color:"border-ll-blue", badge:"Most Popular",
  },
  {
    name:"Enterprise", users:"Up to 5,000+ users", price:"$3,500/month", setup:"$2,500",
    features:["Full customization","Dedicated support","Analytics dashboard","Multi-campus support","Custom integrations","White-label option"],
    color:"border-ll-lgray", badge:null,
  },
];

const WHO = [
  { icon:"🎓", title:"Law Schools", items:["1L onboarding","Academic support","Bar prep reinforcement"] },
  { icon:"📚", title:"Bar Prep Programs", items:["Daily accountability","Motivation during study period"] },
  { icon:"⚖️", title:"Law Firms", items:["Associate wellness","Burnout prevention","Culture building"] },
  { icon:"🤝", title:"Legal Organizations", items:["Member engagement","Professional development"] },
];

export default function Enterprise({ user }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listEntity("Institution",{},50,0)
      .then(d => { setInstitutions(d.records||[]); setLoading(false); })
      .catch(() => setLoading(false));
  },[]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-8 mb-8 text-white" style={{background:"#0a0f1e"}}>
        <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-2">Enterprise Solutions</div>
        <h1 className="text-3xl font-bold mb-2">
          Increase Bar Pass Rates.<br/>
          <span style={{color:"#3b82f6"}}>Reduce Burnout. Improve Retention.</span>
        </h1>
        <p className="text-slate-400 mb-6 max-w-2xl">
          Love Law™ Enterprise delivers daily motivation and engagement through SMS to improve student success, retention, and bar readiness.
        </p>
        <div className="flex gap-3">
          <button className="btn-primary">Schedule a Demo</button>
          <button className="btn-outline" style={{borderColor:"#3b82f6",color:"#3b82f6",background:"transparent"}}>Request Pricing</button>
        </div>
        <div className="mt-6 text-sm text-blue-300 font-semibold">📲 90%+ open rates with SMS engagement</div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[["+35%","Engagement increase"],["92%","Average open rate"],["4.8/5","Satisfaction score"],["48hrs","Time to launch"]].map(([v,l])=>(
          <div key={l} className="card text-center py-5">
            <div className="text-2xl font-bold" style={{color:"#3b82f6"}}>{v}</div>
            <div className="text-xs text-ll-gray mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Who It's For */}
      <div className="card mb-8">
        <h2 className="font-bold text-ll-navy text-lg mb-4">Who It's For</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHO.map(w => (
            <div key={w.title} className="bg-ll-offwhite rounded-xl p-4 border border-ll-lgray">
              <div className="text-2xl mb-2">{w.icon}</div>
              <div className="font-semibold text-ll-navy text-sm mb-2">{w.title}</div>
              <ul className="space-y-1">
                {w.items.map(i => <li key={i} className="text-xs text-ll-gray flex gap-1.5"><span style={{color:"#3b82f6"}}>✓</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* REAL Pricing from shoplovelaw.com */}
      <div className="mb-8">
        <h2 className="font-bold text-ll-navy text-xl mb-1">Enterprise Pricing</h2>
        <p className="text-ll-gray text-sm mb-6">Simple, transparent pricing for institutions. Starting at just $1–$2 per student/month.</p>
        <div className="grid grid-cols-3 gap-5">
          {TIERS.map(t => (
            <div key={t.name} className={`card border-2 ${t.color} relative`}>
              {t.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{background:"#3b82f6"}}>
                  {t.badge}
                </div>
              )}
              <div className="font-bold text-ll-navy text-lg mb-0.5">{t.name}</div>
              <div className="text-xs text-ll-gray mb-3">{t.users}</div>
              <div className="text-3xl font-bold text-ll-navy mb-0.5">{t.price}</div>
              <div className="text-xs text-ll-gray mb-4">Setup: {t.setup}</div>
              <ul className="space-y-2 mb-5">
                {t.features.map(f => (
                  <li key={f} className="text-sm text-ll-gray flex gap-2 items-start">
                    <span className="text-green-500 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button className={t.badge ? "btn-primary w-full" : "btn-outline w-full"}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Institutions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ll-lgray flex justify-between items-center">
          <div>
            <h2 className="font-bold text-ll-navy">Active Institutions</h2>
            <p className="text-xs text-ll-gray mt-0.5">Enrolled enterprise clients</p>
          </div>
          <button className="btn-primary text-xs">+ Add Institution</button>
        </div>
        {loading ? (
          <div className="text-center py-16 text-ll-gray">Loading...</div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 text-ll-gray">
            <div className="text-4xl mb-3">🏛️</div>
            <div className="font-semibold text-ll-navy mb-1">No institutions enrolled yet</div>
            <div className="text-sm">Your first enterprise clients will appear here once onboarded.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-ll-offwhite border-b border-ll-lgray">
                {["Institution","Type","Tier","Seats","Bar Exam","Status"].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-ll-gray uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst=>(
                <tr key={inst.id} onClick={()=>setSelected(inst)}
                  className="border-b border-ll-lgray/50 hover:bg-ll-offwhite cursor-pointer transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-ll-navy text-sm">{inst.name}</div>
                    <div className="text-xs text-ll-gray">{inst.admin_email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-ll-gray capitalize">{inst.type}</td>
                  <td className="px-6 py-4 text-xs text-ll-gray capitalize">{inst.tier}</td>
                  <td className="px-6 py-4 text-xs text-ll-gray">{inst.seats_used||0}/{inst.seat_limit||0}</td>
                  <td className="px-6 py-4 text-xs text-ll-gray">{inst.bar_exam_date||"—"}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${inst.status==="active"?"bg-green-100 text-green-700":"bg-slate-100 text-slate-500"}`}>
                      {inst.status||"active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
