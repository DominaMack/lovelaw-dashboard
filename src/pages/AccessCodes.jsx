import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

export default function AccessCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const f = statusFilter ? { status: statusFilter } : {};
    listEntity("AccessCode", f, 50, 0)
      .then(d => { setCodes(d.records||[]); setTotal(d.count||0); setLoading(false); })
      .catch(() => setLoading(false));
  },[statusFilter]);

  const filtered = search ? codes.filter(c =>
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.batch_name?.toLowerCase().includes(search.toLowerCase())
  ) : codes;

  const stats = {
    total: total,
    active: codes.filter(c=>c.status==="active").length,
    redeemed: codes.filter(c=>c.status==="redeemed").length,
    expired: codes.filter(c=>c.status==="expired").length,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">Access Management</div>
          <h1 className="text-3xl font-bold text-navy-900">Access Codes</h1>
          <p className="text-gray-400 mt-1">Gift codes, Etsy prepaid access, enterprise batch codes.</p>
        </div>
        <button className="btn-primary">Generate Codes</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[["Total",stats.total,"🔑"],["Active",stats.active,"✅"],["Redeemed",stats.redeemed,"🎉"],["Expired",stats.expired,"⏰"]].map(([l,v,i]) => (
          <div key={l} className="card text-center py-5">
            <div className="text-xl mb-1">{i}</div>
            <div className="text-2xl font-bold text-navy-900">{loading?"—":v}</div>
            <div className="text-xs text-gray-400 mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Channel breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { channel:"Etsy", desc:"Prepaid access listings", color:"bg-orange-50 border-orange-100" },
          { channel:"Amazon", desc:"Digital gift cards", color:"bg-blue-50 border-blue-100" },
          { channel:"Enterprise", desc:"Bulk institutional codes", color:"bg-purple-50 border-purple-100" },
          { channel:"Event / Bookstore", desc:"Scratch-off cards", color:"bg-green-50 border-green-100" },
          { channel:"GHL Funnel", desc:"SMS opt-in rewards", color:"bg-indigo-50 border-indigo-100" },
          { channel:"Gift Card", desc:"Gifted subscriptions", color:"bg-gold-400/10 border-gold-400/20" },
        ].map(c => (
          <div key={c.channel} className={`border rounded-2xl p-4 ${c.color}`}>
            <div className="font-semibold text-navy-900 text-sm mb-1">{c.channel}</div>
            <div className="text-xs text-gray-500">{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="card mb-4 flex gap-3">
        <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          placeholder="Search code or batch name..." value={search} onChange={e => setSearch(e.target.value)} />
        {["","active","redeemed","expired"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${statusFilter===s?"bg-navy-900 text-gold-400":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s||"All"}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Code","Batch","Channel","Segment","Days","Status","Redeemed By"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-16 text-gray-300">Loading codes...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-16 text-gray-300">
                <div className="text-3xl mb-2">🔑</div>
                <div>No access codes yet. Generate a batch to get started.</div>
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3.5">
                  <code className="text-sm font-mono font-bold text-navy-900 bg-gray-100 px-2 py-0.5 rounded">{c.code}</code>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{c.batch_name||"—"}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{c.channel||"—"}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{c.audience_segment||"—"}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-navy-900">{c.days_of_access}d</td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${c.status==="active"?"bg-green-100 text-green-700":c.status==="redeemed"?"bg-blue-100 text-blue-700":"bg-gray-100 text-gray-500"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400">{c.redeemed_phone||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
