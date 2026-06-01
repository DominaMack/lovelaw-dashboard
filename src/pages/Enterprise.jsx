import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

const TYPE_COLORS = {
  "law-school":"bg-blue-50 text-blue-700","law-firm":"bg-purple-50 text-purple-700",
  "bar-prep-company":"bg-red-50 text-red-700","solo-firm":"bg-green-50 text-green-700",
  "student-org":"bg-amber-50 text-amber-700","legal-association":"bg-indigo-50 text-indigo-700",
};

export default function Enterprise() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    listEntity("Institution",{},50,0)
      .then(d => { setInstitutions(d.records||[]); setLoading(false); })
      .catch(() => setLoading(false));
  },[]);

  const seats = (inst) => {
    const pct = inst.seat_limit ? Math.round((inst.seats_used||0)/inst.seat_limit*100) : 0;
    return pct;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">Enterprise</div>
          <h1 className="text-3xl font-bold text-navy-900">Institutions & Firms</h1>
          <p className="text-gray-400 mt-1">Law schools, firms, bar prep companies, and organizations.</p>
        </div>
        <button className="btn-primary">+ Add Institution</button>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { tier:"Basic", price:"$299/mo", seats:"Up to 50 seats", features:["Daily SMS","Basic reporting","Email support"], color:"border-gray-200" },
          { tier:"Professional", price:"$799/mo", seats:"Up to 250 seats", features:["Daily SMS","Bar exam sync","Distress flags","Priority support"], color:"border-gold-400/40 bg-navy-900/2", badge:"Most Popular" },
          { tier:"Elite", price:"Custom", seats:"Unlimited seats", features:["White-label","Custom tracks","Dedicated manager","Full analytics"], color:"border-navy-900/20" },
        ].map(p => (
          <div key={p.tier} className={`card border-2 ${p.color} relative`}>
            {p.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-navy-900 text-xs px-3 py-0.5 rounded-full font-bold">{p.badge}</span>}
            <div className="font-bold text-navy-900 text-lg mb-1">{p.tier}</div>
            <div className="text-2xl font-bold text-navy-900 mb-0.5">{p.price}</div>
            <div className="text-xs text-gray-400 mb-4">{p.seats}</div>
            <ul className="space-y-1.5">
              {p.features.map(f => <li key={f} className="text-xs text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Institutions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-navy-900">Active Institutions</h2>
          <span className="text-sm text-gray-400">{institutions.length} total</span>
        </div>
        {loading ? (
          <div className="text-center py-16 text-gray-300">Loading...</div>
        ) : institutions.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <div className="text-3xl mb-2">🏛️</div>
            <div className="font-medium mb-1">No institutions yet</div>
            <div className="text-sm">Your enterprise clients will appear here once enrolled.</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Institution","Type","Tier","Seats","Bar Exam","Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => {
                const pct = seats(inst);
                return (
                  <tr key={inst.id} onClick={() => setSelected(inst)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy-900 text-sm">{inst.name}</div>
                      <div className="text-xs text-gray-400">{inst.admin_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${TYPE_COLORS[inst.type]||"bg-gray-100 text-gray-600"}`}>{inst.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{inst.tier}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 mb-1">{inst.seats_used||0}/{inst.seat_limit||0}</div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                        <div className={`h-1.5 rounded-full ${pct>90?"bg-red-400":pct>70?"bg-amber-400":"bg-green-400"}`} style={{width:`${Math.min(pct,100)}%`}}/>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{inst.bar_exam_date||"—"}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${inst.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{inst.status||"active"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-luxury w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-5">
              <h2 className="font-bold text-navy-900 text-xl">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Type",selected.type],["Tier",selected.tier],["Admin",selected.admin_name],["Email",selected.admin_email],
                ["Seats",`${selected.seats_used||0}/${selected.seat_limit||0}`],["Bar Exam",selected.bar_exam_date||"—"],
                ["Contract Start",selected.contract_start||"—"],["Contract End",selected.contract_end||"—"],
              ].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{k}</div>
                  <div className="font-semibold text-navy-900 capitalize text-sm">{v}</div>
                </div>
              ))}
            </div>
            {selected.notes && <div className="mt-4 bg-amber-50 rounded-xl p-3 text-sm text-amber-700">{selected.notes}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
