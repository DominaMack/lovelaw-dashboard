import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

// Real pricing from shoplovelaw.com + Pilot tier (sales tool, not public)
const TIERS = [
  {
    key:"pilot",
    name:"Pilot", users:"Up to 50 users", price:"$250/month", setup:"$0",
    period:"90-day commitment, then converts to Small",
    features:["Daily SMS messages","Standard message tracks","Email support","Basic engagement report","Converts to Small after 90 days"],
    badge:"Best to Start",
    badgeColor:"bg-amber-400 text-amber-900",
    border:"border-amber-300",
    cta:"Start a Pilot",
    note:"Not listed publicly — offered directly during demos",
    highlight: false,
  },
  {
    key:"small",
    name:"Small", users:"Up to 250 users", price:"$499/month", setup:"$500",
    features:["Daily SMS messages","Basic customization","Email support","Monthly reports"],
    border:"border-ll-lgray", badge:null, cta:"Get Started", highlight:false,
  },
  {
    key:"mid-size",
    name:"Mid-Size", users:"Up to 1,000 users", price:"$1,499/month", setup:"$1,000",
    features:["Everything in Small","Custom message tracks","Priority support","Role-based messaging","Quarterly reviews"],
    border:"border-ll-blue", badge:"Most Popular",
    badgeColor:"bg-ll-blue text-white",
    cta:"Get Started", highlight:true,
  },
  {
    key:"enterprise",
    name:"Enterprise", users:"Up to 5,000+ users", price:"$3,500/month", setup:"$2,500",
    features:["Full customization","Dedicated support","Analytics dashboard","Multi-campus support","Custom integrations","White-label available"],
    border:"border-ll-lgray", badge:null, cta:"Contact Us", highlight:false,
  },
];

const WHO = [
  { icon:"🎓", title:"Law Schools",        items:["1L onboarding","Academic support","Bar prep reinforcement"] },
  { icon:"📚", title:"Bar Prep Programs",  items:["Daily accountability","Motivation during study"] },
  { icon:"⚖️", title:"Law Firms",          items:["Associate wellness","Burnout prevention","Culture building"] },
  { icon:"🤝", title:"Legal Organizations",items:["Member engagement","Professional development"] },
];

export default function Enterprise({ user }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEntity("Institution",{},100,0)
      .then(d => { setInstitutions(d.records||[]); setLoading(false); })
      .catch(() => setLoading(false));
  },[]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl p-6 md:p-8 mb-8 text-white" style={{background:"#0a0f1e"}}>
        <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-2">Enterprise Solutions</div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Increase Bar Pass Rates.<br/>
          <span style={{color:"#3b82f6"}}>Reduce Burnout. Improve Retention.</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-5 max-w-2xl">
          Love Law™ Enterprise delivers daily motivation and engagement through SMS to improve student success, retention, and bar readiness.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-ll-blue text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition text-sm">Schedule a Demo</button>
          <button className="border-2 border-ll-blue/50 text-blue-300 font-semibold px-5 py-2.5 rounded-xl hover:border-ll-blue hover:text-white transition text-sm">Request Pricing</button>
        </div>
        <div className="mt-5 text-sm text-blue-300 font-semibold">📲 90%+ open rates with SMS engagement</div>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[["+35%","Engagement increase"],["92%","Average open rate"],["4.8/5","Satisfaction score"],["48hrs","Time to launch"]].map(([v,l])=>(
          <div key={l} className="bg-white rounded-2xl shadow-card text-center py-5">
            <div className="text-2xl font-bold" style={{color:"#3b82f6"}}>{v}</div>
            <div className="text-xs text-ll-gray mt-1">{l}</div>
          </div>
        ))}
      </div>

      {/* Who */}
      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6 mb-8">
        <h2 className="font-bold text-ll-navy text-lg mb-4">Who It's For</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHO.map(w => (
            <div key={w.title} className="bg-ll-offwhite rounded-xl p-4 border border-ll-lgray">
              <div className="text-2xl mb-2">{w.icon}</div>
              <div className="font-semibold text-ll-navy text-sm mb-2">{w.title}</div>
              <ul className="space-y-1">
                {w.items.map(i=><li key={i} className="text-xs text-ll-gray flex gap-1.5"><span style={{color:"#3b82f6"}}>✓</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING — 4 tiers */}
      <div className="mb-8">
        <div className="mb-5">
          <h2 className="font-bold text-ll-navy text-xl">Enterprise Pricing</h2>
          <p className="text-ll-gray text-sm mt-1">Starting at $1–$2 per student/month. The Pilot tier is offered exclusively during sales demos — not listed publicly.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TIERS.map(t => (
            <div key={t.key} className={`bg-white rounded-2xl border-2 ${t.border} p-5 relative flex flex-col ${t.highlight?"ring-2 ring-ll-blue/20":""}`}>
              {t.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${t.badgeColor||"bg-ll-blue text-white"}`}>
                  {t.badge}
                </div>
              )}
              <div className="font-bold text-ll-navy text-lg mb-0.5">{t.name}</div>
              <div className="text-xs text-ll-gray mb-3">{t.users}</div>
              <div className="text-2xl font-bold text-ll-navy">{t.price}</div>
              <div className="text-xs text-ll-gray mb-1">Setup: {t.setup}</div>
              {t.period && <div className="text-xs text-amber-600 font-medium mb-3">{t.period}</div>}
              <ul className="space-y-1.5 mb-5 flex-1">
                {t.features.map(f=>(
                  <li key={f} className="text-xs text-ll-gray flex gap-2 items-start">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              {t.note && <div className="text-xs text-amber-600 italic mb-3">{t.note}</div>}
              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${t.highlight?"bg-ll-blue text-white hover:bg-blue-600":"border-2 border-ll-blue text-ll-blue hover:bg-ll-blue hover:text-white"}`}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active institutions table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 md:px-6 py-4 border-b border-ll-lgray flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h2 className="font-bold text-ll-navy">Active Institutions</h2>
            <p className="text-xs text-ll-gray mt-0.5">Enrolled enterprise clients</p>
          </div>
          <button className="bg-ll-blue text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition">+ Onboard Institution</button>
        </div>
        {loading ? (
          <div className="text-center py-16 text-ll-gray">Loading...</div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 text-ll-gray">
            <div className="text-4xl mb-3">🏛️</div>
            <div className="font-semibold text-ll-navy mb-1">No institutions enrolled yet</div>
            <div className="text-sm">Start by scheduling a demo or onboarding your first pilot client.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ll-offwhite border-b border-ll-lgray">
                <tr>{["Institution","Type","Tier","Seats","Bar Exam","Status"].map(h=>(
                  <th key={h} className="text-left text-xs font-semibold text-ll-gray uppercase tracking-wide px-5 py-3 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {institutions.map(inst=>(
                  <tr key={inst.id} className="border-b border-ll-lgray/50 hover:bg-ll-offwhite cursor-pointer transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ll-navy text-sm">{inst.name}</div>
                      <div className="text-xs text-ll-gray">{inst.admin_email}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-ll-gray capitalize">{inst.type}</td>
                    <td className="px-5 py-4 text-xs text-ll-gray capitalize">{inst.tier}</td>
                    <td className="px-5 py-4 text-xs text-ll-gray">{inst.seats_used||0}/{inst.seat_limit||0}</td>
                    <td className="px-5 py-4 text-xs text-ll-gray">{inst.bar_exam_date||"—"}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${inst.status==="active"?"bg-green-100 text-green-700":"bg-slate-100 text-slate-500"}`}>
                        {inst.status||"active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
