import { useState, useEffect } from "react";
import { Message } from "@/api/entities";

const SEGMENTS = [
  { value: "", label: "All Segments" },
  { value: "bar-prep", label: "Bar Prep" },
  { value: "bar-retaker", label: "Bar Retaker" },
  { value: "law-student-1L", label: "1L" },
  { value: "law-student-2L", label: "2L" },
  { value: "law-student-3L", label: "3L" },
  { value: "attorney", label: "Attorney" },
];

const TRACKS = [
  { value: "", label: "All Tracks" },
  { value: "focus-standard", label: "Standard" },
  { value: "focus-faith-based", label: "Faith-Based" },
  { value: "focus-first-generation", label: "First Generation" },
  { value: "focus-burnout-support", label: "Burnout Support" },
  { value: "focus-working-parent", label: "Working Parent" },
];

const STATUS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const TONES = [
  { value: "", label: "All Tones" },
  { value: "motivational", label: "Motivational" },
  { value: "calming", label: "Calming" },
  { value: "accountability", label: "Accountability" },
  { value: "resilience", label: "Resilience" },
  { value: "hope", label: "Hope" },
  { value: "faith", label: "Faith" },
];

function countChars(text) {
  return (text || "").length;
}

function isGSM7(text) {
  const gsm7 = /^[\x20-\x7E\n\r\t]*$/;
  return gsm7.test(text);
}

function smsSegments(len) {
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

export default function MessageLibrary() {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ segment: "", track: "", status: "", tone: "", search: "" });
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newMsg, setNewMsg] = useState({
    message_text: "", audience_segment: "bar-prep", focus_track: "focus-standard",
    emotional_tone: "motivational", day_number: 1, language: "en", season: "evergreen",
    approval_status: "pending", message_type: "sms_daily", notes: ""
  });
  const [page, setPage] = useState(1);
  const PER_PAGE = 25;

  useEffect(() => { loadMessages(); }, []);

  useEffect(() => {
    let f = [...messages];
    if (filters.segment) f = f.filter(m => m.audience_segment === filters.segment);
    if (filters.track) f = f.filter(m => m.focus_track === filters.track);
    if (filters.status) f = f.filter(m => m.approval_status === filters.status);
    if (filters.tone) f = f.filter(m => m.emotional_tone === filters.tone);
    if (filters.search) f = f.filter(m => m.message_text?.toLowerCase().includes(filters.search.toLowerCase()));
    f.sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
    setFiltered(f);
    setPage(1);
    setSelected([]);
  }, [filters, messages]);

  async function loadMessages() {
    setLoading(true);
    const all = await Message.list();
    setMessages(all);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await Message.update(id, { approval_status: status });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, approval_status: status } : m));
  }

  async function bulkUpdateStatus(status) {
    setSaving(true);
    await Promise.all(selected.map(id => Message.update(id, { approval_status: status })));
    setMessages(prev => prev.map(m => selected.includes(m.id) ? { ...m, approval_status: status } : m));
    setSelected([]);
    setSaving(false);
  }

  async function saveEdit(id) {
    setSaving(true);
    await Message.update(id, { message_text: editText });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, message_text: editText } : m));
    setEditingId(null);
    setSaving(false);
  }

  async function createMessage() {
    setSaving(true);
    await Message.create(newMsg);
    setShowCreate(false);
    setNewMsg({ message_text: "", audience_segment: "bar-prep", focus_track: "focus-standard", emotional_tone: "motivational", day_number: 1, language: "en", season: "evergreen", approval_status: "pending", message_type: "sms_daily", notes: "" });
    await loadMessages();
    setSaving(false);
  }

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(m => m.id));

  const statusBadge = (status) => {
    const map = {
      approved: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Message Library</h1>
            <p className="text-sm text-gray-500">{filtered.length} messages{filters.segment || filters.track || filters.status ? " (filtered)" : ""}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            ✍️ Create Message
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-48"
            placeholder="🔍 Search message text..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
          {[["segment", SEGMENTS], ["track", TRACKS], ["status", STATUS], ["tone", TONES]].map(([key, opts]) => (
            <select key={key} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
              value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}>
              {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <button onClick={() => setFilters({ segment: "", track: "", status: "", tone: "", search: "" })}
            className="text-sm text-gray-400 hover:text-gray-600 px-2">Clear</button>
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-3 mb-4 flex items-center gap-4">
            <span className="text-sm font-medium text-indigo-800">{selected.length} selected</span>
            <button onClick={() => bulkUpdateStatus("approved")} disabled={saving}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
              ✅ Approve All
            </button>
            <button onClick={() => bulkUpdateStatus("rejected")} disabled={saving}
              className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-600 transition">
              ❌ Reject All
            </button>
            <button onClick={() => setSelected([])} className="text-sm text-indigo-600 hover:underline ml-auto">Cancel</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading messages...</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No messages found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Track</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-96">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Chars</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(msg => {
                  const charCount = countChars(msg.message_text);
                  const gsm7ok = isGSM7(msg.message_text);
                  const segments = smsSegments(charCount);
                  const isEditing = editingId === msg.id;

                  return (
                    <tr key={msg.id} className={`hover:bg-gray-50 transition ${selected.includes(msg.id) ? "bg-indigo-50" : ""}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(msg.id)} onChange={() => toggleSelect(msg.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{msg.day_number || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {msg.audience_segment?.replace("law-student-", "") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${msg.focus_track === "focus-faith-based" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                          {msg.focus_track?.replace("focus-", "") || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        {isEditing ? (
                          <textarea
                            className="w-full border border-indigo-300 rounded-lg p-2 text-sm resize-none"
                            rows={3}
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                          />
                        ) : (
                          <p className="text-gray-800 text-sm leading-relaxed line-clamp-2">{msg.message_text}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className={`text-xs font-medium ${charCount > 306 ? "text-red-600" : charCount > 160 ? "text-amber-600" : "text-green-600"}`}>
                            {charCount}/306
                          </span>
                          <span className="text-xs text-gray-400">{segments} seg</span>
                          {!gsm7ok && <span className="text-xs text-red-500 font-bold">⚠ GSM-7</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">{statusBadge(msg.approval_status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(msg.id)} disabled={saving}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700">Save</button>
                              <button onClick={() => setEditingId(null)}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingId(msg.id); setEditText(msg.message_text); }}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-200">✏️</button>
                              {msg.approval_status !== "approved" && (
                                <button onClick={() => updateStatus(msg.id, "approved")}
                                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">✅</button>
                              )}
                              {msg.approval_status !== "rejected" && (
                                <button onClick={() => updateStatus(msg.id, "rejected")}
                                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200">❌</button>
                              )}
                              {msg.approval_status !== "pending" && (
                                <button onClick={() => updateStatus(msg.id, "pending")}
                                  className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-200">⏳</button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">Page {page} of {totalPages} · {filtered.length} total</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">← Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Message Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">✍️ Create New Message</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Message Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                rows={5}
                placeholder="Write your message here... Remember to end with - Love Law"
                value={newMsg.message_text}
                onChange={e => setNewMsg(n => ({ ...n, message_text: e.target.value }))}
              />
              {/* Live validator */}
              <div className="flex gap-4 mt-2">
                <span className={`text-xs font-medium ${countChars(newMsg.message_text) > 306 ? "text-red-600" : countChars(newMsg.message_text) > 160 ? "text-amber-600" : "text-green-600"}`}>
                  {countChars(newMsg.message_text)}/306 chars
                </span>
                <span className="text-xs text-gray-400">{smsSegments(countChars(newMsg.message_text))} SMS segment(s)</span>
                <span className={`text-xs font-medium ${isGSM7(newMsg.message_text) ? "text-green-600" : "text-red-600"}`}>
                  {isGSM7(newMsg.message_text) ? "✅ GSM-7 compliant" : "⚠️ Contains non-GSM-7 characters"}
                </span>
              </div>
              {/* Phone preview */}
              {newMsg.message_text && (
                <div className="mt-3 bg-gray-900 rounded-2xl p-4 max-w-xs">
                  <div className="bg-indigo-500 text-white text-xs px-3 py-2 rounded-2xl rounded-bl-sm leading-relaxed">
                    {newMsg.message_text}
                  </div>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Segment</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newMsg.audience_segment} onChange={e => setNewMsg(n => ({ ...n, audience_segment: e.target.value }))}>
                  {SEGMENTS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Track</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newMsg.focus_track} onChange={e => setNewMsg(n => ({ ...n, focus_track: e.target.value }))}>
                  {TRACKS.filter(t => t.value).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Day Number</label>
                <input type="number" min={1} max={365} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newMsg.day_number} onChange={e => setNewMsg(n => ({ ...n, day_number: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emotional Tone</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newMsg.emotional_tone} onChange={e => setNewMsg(n => ({ ...n, emotional_tone: e.target.value }))}>
                  {TONES.filter(t => t.value).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newMsg.language} onChange={e => setNewMsg(n => ({ ...n, language: e.target.value }))}>
                  {[["en","English"],["es","Spanish"],["zh","Chinese"],["tl","Tagalog"],["pt","Portuguese"],["fr","French"],["ht","Haitian Creole"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Approval Status</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newMsg.approval_status} onChange={e => setNewMsg(n => ({ ...n, approval_status: e.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                placeholder="Optional notes..."
                value={newMsg.notes} onChange={e => setNewMsg(n => ({ ...n, notes: e.target.value }))} />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={createMessage} disabled={saving || !newMsg.message_text || countChars(newMsg.message_text) > 306}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? "Saving..." : "Create Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
