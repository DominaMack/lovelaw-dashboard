import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

const TIER_COLORS = { critical:"bg-red-100 text-red-700", high:"bg-orange-100 text-orange-700", medium:"bg-amber-100 text-amber-700", low:"bg-gray-100 text-gray-600" };

export default function DistressFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const f = statusFilter ? { status: statusFilter } : {};
    listEntity("DistrессFlag", f, 50, 0)
      .then(d => { setFlags(d.records||[]); setLoading(false); })
      .catch(() => setLoading(false));
  },[statusFilter]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">Wellness Monitoring</div>
        <h1 className="text-3xl font-bold text-navy-900">Distress Flags</h1>
        <p className="text-gray-400 mt-1">Subscribers who have sent distress signals. Monitored 24/7 by Lexington.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[["🚨","Open Flags",flags.filter(f=>f.status==="open").length],
          ["✅","Resolved",flags.filter(f=>f.status==="resolved").length],
          ["⏳","Pending Response",flags.filter(f=>!f.response_sent).length]
        ].map(([icon,label,val]) => (
          <div key={label} className="card text-center py-5">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-navy-900">{loading?"—":val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="card mb-5 flex gap-3">
        {["open","resolved","all"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s==="all"?"":s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${statusFilter===(s==="all"?"":s) ? "bg-navy-900 text-gold-400" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-300">Loading flags...</div>
        ) : flags.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-medium">No distress flags</div>
            <div className="text-sm mt-1">All subscribers are doing well.</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {flags.map(flag => (
              <div key={flag.id} onClick={() => setSelected(flag)}
                className="px-6 py-5 hover:bg-gray-50 cursor-pointer transition flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${flag.tier==="critical"?"bg-red-500":flag.tier==="high"?"bg-orange-500":"bg-amber-400"}`}/>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${TIER_COLORS[flag.tier]||"bg-gray-100"}`}>{flag.tier}</span>
                    <span className={`badge ${flag.status==="open"?"bg-red-50 text-red-600":"bg-green-50 text-green-600"}`}>{flag.status}</span>
                    {!flag.response_sent && <span className="badge bg-amber-50 text-amber-600">⏳ No response sent</span>}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{flag.full_message}</p>
                  <p className="text-xs text-gray-400 mt-1">Trigger: "{flag.trigger_keyword}"</p>
                </div>
                <span className="text-gray-200 text-lg">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-luxury w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <div className="flex gap-2">
                <span className={`badge ${TIER_COLORS[selected.tier]||""}`}>{selected.tier}</span>
                <span className={`badge ${selected.status==="open"?"bg-red-50 text-red-600":"bg-green-50 text-green-600"}`}>{selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <div className="text-xs text-red-400 mb-1">Subscriber message</div>
              <p className="text-sm text-red-800">{selected.full_message}</p>
            </div>
            {selected.response_text && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <div className="text-xs text-green-400 mb-1">Response sent</div>
                <p className="text-sm text-green-800">{selected.response_text}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button className="py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Mark Resolved</button>
              <button className="py-2.5 bg-navy-900 text-gold-400 rounded-xl text-sm font-semibold hover:bg-navy-800 transition">Send Response</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
