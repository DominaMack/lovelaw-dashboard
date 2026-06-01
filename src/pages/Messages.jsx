import { useState, useEffect } from "react";
import { listEntity } from "../api/base44.js";

const SEGMENTS = ["bar-prep","bar-retaker","law-student-1L","law-student-2L","law-student-3L","attorney"];
const TRACKS = ["focus-standard","focus-faith-based"];
const SEG_LABELS = { "bar-prep":"Bar Prep","bar-retaker":"Bar Retaker","law-student-1L":"1L","law-student-2L":"2L","law-student-3L":"3L","attorney":"Attorney" };
const TRK_LABELS = { "focus-standard":"Standard","focus-faith-based":"Faith-Based" };

const StatusBadge = ({ s }) => {
  const map = { approved:"bg-green-100 text-green-700", pending:"bg-amber-100 text-amber-700", rejected:"bg-red-100 text-red-600" };
  return <span className={`badge ${map[s] || "bg-gray-100 text-gray-600"}`}>{s}</span>;
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seg, setSeg] = useState("");
  const [track, setTrack] = useState("");
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const PAGE = 30;

  useEffect(() => { load(); }, [seg, track, status, page]);

  async function load() {
    setLoading(true);
    const filters = {};
    if (seg) filters.audience_segment = seg;
    if (track) filters.focus_track = track;
    if (status) filters.approval_status = status;
    try {
      const data = await listEntity("Message", filters, PAGE, page * PAGE);
      setMessages(data.records || []);
      setTotal(data.count || 0);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  const filtered = search ? messages.filter(m => m.message_text?.toLowerCase().includes(search.toLowerCase())) : messages;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-xs text-gold-500 uppercase tracking-widest font-semibold mb-1">Content Library</div>
        <h1 className="text-3xl font-bold text-navy-900">Messages</h1>
        <p className="text-gray-400 mt-1">Review, approve, and manage your Daily Dose of Justice™ content.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Messages", val: total },
          { label:"Pending Review", val: status === "pending" ? total : "—" },
          { label:"Segments", val: 6 },
        ].map(s => (
          <div key={s.label} className="card py-4 text-center">
            <div className="text-2xl font-bold text-navy-900">{s.val?.toLocaleString?.() ?? s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <input className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/10"
          placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"
          value={seg} onChange={e => { setSeg(e.target.value); setPage(0); }}>
          <option value="">All Segments</option>
          {SEGMENTS.map(s => <option key={s} value={s}>{SEG_LABELS[s]}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"
          value={track} onChange={e => { setTrack(e.target.value); setPage(0); }}>
          <option value="">All Tracks</option>
          {TRACKS.map(t => <option key={t} value={t}>{TRK_LABELS[t]}</option>)}
        </select>
        <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none"
          value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="text-center py-20 text-gray-300">
          <div className="text-4xl mb-3">⚖️</div>
          <div>Loading messages...</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div key={msg.id} onClick={() => setSelected(msg)}
              className="card py-4 cursor-pointer hover:border-gold-400/30 hover:shadow-luxury/10 transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="badge bg-navy-900/10 text-navy-900">{SEG_LABELS[msg.audience_segment] || msg.audience_segment}</span>
                    <span className="badge bg-gold-400/15 text-navy-700">{TRK_LABELS[msg.focus_track] || msg.focus_track}</span>
                    {msg.day_number && <span className="text-xs text-gray-400">Day {msg.day_number}</span>}
                    <StatusBadge s={msg.approval_status} />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{msg.message_text}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs ${msg.message_text?.length > 280 ? "text-red-400" : "text-gray-300"} mb-1`}>
                    {msg.message_text?.length}/306
                  </div>
                  <span className="text-gray-200 group-hover:text-gold-400 transition text-lg">→</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-300">
              <div className="text-3xl mb-2">📭</div>
              <div>No messages match this filter.</div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
          className="btn-primary disabled:opacity-30 text-sm px-4 py-2">← Previous</button>
        <span className="text-sm text-gray-400">Page {page+1} · {total.toLocaleString()} total</span>
        <button onClick={() => setPage(p => p+1)} disabled={filtered.length < PAGE}
          className="btn-primary disabled:opacity-30 text-sm px-4 py-2">Next →</button>
      </div>

      {/* Message Modal */}
      {selected && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-luxury w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex gap-2 flex-wrap mb-2">
                  <span className="badge bg-navy-900/10 text-navy-900">{SEG_LABELS[selected.audience_segment]}</span>
                  <span className="badge bg-gold-400/15 text-navy-700">{TRK_LABELS[selected.focus_track]}</span>
                  {selected.day_number && <span className="badge bg-gray-100 text-gray-500">Day {selected.day_number}</span>}
                </div>
                <StatusBadge s={selected.approval_status} />
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
              {selected.message_text}
            </div>
            <div className={`text-xs mb-5 ${selected.message_text?.length > 306 ? "text-red-500" : "text-gray-400"}`}>
              {selected.message_text?.length}/306 characters · GSM-7
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                Reject
              </button>
              <button className="py-2.5 bg-navy-900 text-gold-400 rounded-xl text-sm font-semibold hover:bg-navy-800 transition">
                ✓ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
