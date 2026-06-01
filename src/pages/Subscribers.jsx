import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

const SEG_COLORS = {
  "bar-prep":"bg-red-50 text-red-700","bar-retaker":"bg-orange-50 text-orange-700",
  "law-student-1L":"bg-blue-50 text-blue-700","law-student-2L":"bg-indigo-50 text-indigo-700",
  "law-student-3L":"bg-violet-50 text-violet-700","attorney":"bg-purple-50 text-purple-700",
};

export default function Subscribers({ user }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const PAGE = 25;

  useEffect(() => { load(); }, [segFilter, statusFilter, page]);

  async function load() {
    setLoading(true);
    const f = {};
    if (segFilter) f.audience_segment = segFilter;
    if (statusFilter) f.subscription_status = statusFilter;
    try {
      const data = await listEntity("Subscriber", f, PAGE, page * PAGE);
      setSubs(data.records || []);
      setTotal(data.count || 0);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = search ? subs.filter(s =>
    `${s.first_name} ${s.last_name} ${s.phone_number} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  ) : subs;

  function daysToExam(dateStr) {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">Subscriber Management</div>
          <h1 className="text-3xl font-bold text-navy-900">Subscribers</h1>
          <p className="text-gray-400 mt-1">{total.toLocaleString()} total · Daily Dose of Justice™</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Subscriber</button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <input className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/10"
          placeholder="Search by name, phone, or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white"
          value={segFilter} onChange={e => { setSegFilter(e.target.value); setPage(0); }}>
          <option value="">All Segments</option>
          {["bar-prep","bar-retaker","law-student-1L","law-student-2L","law-student-3L","attorney"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white"
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Subscriber</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Segment</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Track</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Day</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Exam</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-300">Loading subscribers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-300">
                  <div className="text-3xl mb-2">👥</div>
                  <div>No subscribers yet. They'll appear here once someone subscribes.</div>
                </td></tr>
              ) : filtered.map(sub => {
                const days = daysToExam(sub.bar_exam_date);
                const initials = `${sub.first_name?.charAt(0)||""}${sub.last_name?.charAt(0)||""}`.toUpperCase() || "?";
                return (
                  <tr key={sub.id} onClick={() => setSelected(sub)}
                    className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-900/10 flex items-center justify-center text-navy-900 font-bold text-xs">{initials}</div>
                        <div>
                          <div className="text-sm font-semibold text-navy-900">{sub.first_name} {sub.last_name}</div>
                          <div className="text-xs text-gray-400">{sub.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${SEG_COLORS[sub.audience_segment] || "bg-gray-100 text-gray-600"}`}>
                        {sub.audience_segment}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">{sub.focus_track?.replace("focus-","")}</td>
                    <td className="px-4 py-4 text-sm font-medium text-navy-900">#{sub.current_day_number || 1}</td>
                    <td className="px-4 py-4">
                      {days !== null ? (
                        <span className={`text-xs font-semibold ${days < 30 ? "text-red-500" : days < 60 ? "text-amber-500" : "text-green-600"}`}>
                          {days}d left
                        </span>
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge ${sub.subscription_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {sub.subscription_status || "active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0} className="btn-primary text-sm px-4 py-2 disabled:opacity-30">← Prev</button>
        <span className="text-sm text-gray-400">Page {page+1}</span>
        <button onClick={() => setPage(p => p+1)} disabled={filtered.length < PAGE} className="btn-primary text-sm px-4 py-2 disabled:opacity-30">Next →</button>
      </div>

      {/* Subscriber Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-luxury w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-navy-900 flex items-center justify-center text-gold-400 font-bold text-lg">
                  {`${selected.first_name?.charAt(0)||""}${selected.last_name?.charAt(0)||""}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-navy-900 text-lg">{selected.first_name} {selected.last_name}</h2>
                  <div className="text-gray-400 text-sm">{selected.phone_number} · {selected.email}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Segment", selected.audience_segment],
                ["Track", selected.focus_track?.replace("focus-","")],
                ["Current Day", `#${selected.current_day_number || 1}`],
                ["Status", selected.subscription_status || "active"],
                ["Tier", selected.subscription_tier || "standard"],
                ["Bar Exam Date", selected.bar_exam_date || "—"],
                ["Language", selected.language || "en"],
                ["Distress Flags", selected.distress_flag_count || 0],
              ].map(([k,v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-0.5">{k}</div>
                  <div className="font-semibold text-navy-900 capitalize">{v}</div>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="mt-4 bg-amber-50 rounded-xl p-3 text-sm text-amber-700 border border-amber-100">{selected.notes}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
