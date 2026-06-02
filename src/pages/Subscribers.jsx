import { useState, useEffect } from "react";
import { Subscriber } from "@/api/entities";
import { Institution } from "@/api/entities";

const SEGMENTS = [
  { value: "", label: "All Segments" },
  { value: "bar-prep", label: "Bar Prep" },
  { value: "bar-retaker", label: "Bar Retaker" },
  { value: "law-student-1L", label: "1L" },
  { value: "law-student-2L", label: "2L" },
  { value: "law-student-3L", label: "3L" },
  { value: "attorney", label: "Attorney" },
];

const SEG_LABEL = {
  "bar-prep": "Bar Prep", "bar-retaker": "Bar Retaker",
  "law-student-1L": "1L", "law-student-2L": "2L", "law-student-3L": "3L", "attorney": "Attorney",
};

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("consumer"); // consumer | enterprise
  const [filters, setFilters] = useState({ segment: "", status: "", search: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newSub, setNewSub] = useState({
    first_name: "", last_name: "", phone_number: "", email: "",
    audience_segment: "bar-prep", focus_track: "focus-standard",
    language: "en", subscription_status: "active", subscription_tier: "standard",
    subscriber_type: "consumer", current_day_number: 1, institution_id: ""
  });

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    let f = subscribers.filter(s => s.subscriber_type === tab || (!s.subscriber_type && tab === "consumer"));
    if (filters.segment) f = f.filter(s => s.audience_segment === filters.segment);
    if (filters.status) f = f.filter(s => s.subscription_status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      f = f.filter(s => `${s.first_name} ${s.last_name} ${s.email} ${s.phone_number}`.toLowerCase().includes(q));
    }
    setFiltered(f);
  }, [subscribers, filters, tab]);

  async function loadAll() {
    setLoading(true);
    const [subs, insts] = await Promise.all([Subscriber.list(), Institution.list()]);
    setSubscribers(subs);
    setInstitutions(insts);
    setLoading(false);
  }

  async function addSubscriber() {
    setSaving(true);
    await Subscriber.create(newSub);
    await loadAll();
    setShowAdd(false);
    setNewSub({ first_name: "", last_name: "", phone_number: "", email: "", audience_segment: "bar-prep", focus_track: "focus-standard", language: "en", subscription_status: "active", subscription_tier: "standard", subscriber_type: "consumer", current_day_number: 1, institution_id: "" });
    setSaving(false);
  }

  async function updateSubscriberStatus(id, status) {
    await Subscriber.update(id, { subscription_status: status });
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, subscription_status: status } : s));
  }

  const instName = (id) => institutions.find(i => i.id === id)?.name || "—";

  const statusBadge = (status) => {
    const map = { active: "bg-green-100 text-green-700", trial: "bg-amber-100 text-amber-700", paused: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-600" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
  };

  const emotionBadge = (state) => {
    if (!state || state === "standard") return null;
    const map = { stressed: "🟡", overwhelmed: "🔴", "needs-support": "🆘", celebrating: "🎉" };
    return <span title={state}>{map[state] || "•"}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Subscribers</h1>
            <p className="text-sm text-gray-500">{filtered.length} {tab} subscribers</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            ➕ Add Subscriber
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {["consumer", "enterprise"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition capitalize ${tab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {t === "consumer" ? "👤 Consumer" : "🏛️ Enterprise"}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-48"
            placeholder="🔍 Search name, email, phone..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filters.segment} onChange={e => setFilters(f => ({ ...f, segment: e.target.value }))}>
            {SEGMENTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading subscribers...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-2">👤</div>
              <div className="text-sm">No {tab} subscribers yet.</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Segment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Track</th>
                  {tab === "enterprise" && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Institution</th>}
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Day</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelected(selected?.id === sub.id ? null : sub)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                          {(sub.first_name?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{sub.first_name} {sub.last_name}</div>
                          {emotionBadge(sub.emotional_state)}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-gray-700">{sub.phone_number}</div>
                      <div className="text-xs text-gray-400">{sub.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{SEG_LABEL[sub.audience_segment] || sub.audience_segment || "—"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sub.focus_track === "focus-faith-based" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                        {sub.focus_track?.replace("focus-", "") || "—"}
                      </span>
                    </td>
                    {tab === "enterprise" && <td className="px-5 py-3 text-gray-600 text-xs">{instName(sub.institution_id)}</td>}
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono text-gray-600">Day {sub.current_day_number || 1}</span>
                    </td>
                    <td className="px-5 py-3">{statusBadge(sub.subscription_status)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {sub.subscription_status === "active" ? (
                          <button onClick={() => updateSubscriberStatus(sub.id, "paused")}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-200">⏸ Pause</button>
                        ) : (
                          <button onClick={() => updateSubscriberStatus(sub.id, "active")}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">▶ Resume</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Subscriber Detail Panel */}
        {selected && (
          <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selected.first_name} {selected.last_name}</h3>
                <p className="text-sm text-gray-500">{selected.email} · {selected.phone_number}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Segment", SEG_LABEL[selected.audience_segment] || selected.audience_segment],
                ["Track", selected.focus_track?.replace("focus-", "")],
                ["Current Day", `Day ${selected.current_day_number || 1}`],
                ["Status", selected.subscription_status],
                ["Tier", selected.subscription_tier],
                ["Language", selected.language?.toUpperCase()],
                ["Emotional State", selected.emotional_state || "standard"],
                ["Last Reply", selected.last_reply || "None"],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-gray-900 capitalize">{value || "—"}</div>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="mt-4 bg-amber-50 rounded-xl p-3">
                <div className="text-xs text-amber-600 font-medium mb-1">Notes</div>
                <div className="text-sm text-amber-900">{selected.notes}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">➕ Add Subscriber</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Subscriber Type Toggle */}
            <div className="flex gap-2 mb-5">
              {["consumer", "enterprise"].map(t => (
                <button key={t} onClick={() => setNewSub(n => ({ ...n, subscriber_type: t }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition capitalize ${newSub.subscriber_type === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {t === "consumer" ? "👤 Consumer" : "🏛️ Enterprise"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["first_name","First Name"],["last_name","Last Name"],["phone_number","Phone Number"],["email","Email"]].map(([key,label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    value={newSub[key]} onChange={e => setNewSub(n => ({ ...n, [key]: e.target.value }))} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Segment</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newSub.audience_segment} onChange={e => setNewSub(n => ({ ...n, audience_segment: e.target.value }))}>
                  {SEGMENTS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Track</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newSub.focus_track} onChange={e => setNewSub(n => ({ ...n, focus_track: e.target.value }))}>
                  <option value="focus-standard">Standard</option>
                  <option value="focus-faith-based">Faith-Based</option>
                  <option value="focus-first-generation">First Generation</option>
                  <option value="focus-burnout-support">Burnout Support</option>
                  <option value="focus-working-parent">Working Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newSub.subscription_status} onChange={e => setNewSub(n => ({ ...n, subscription_status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newSub.language} onChange={e => setNewSub(n => ({ ...n, language: e.target.value }))}>
                  {[["en","English"],["es","Spanish"],["zh","Chinese"],["tl","Tagalog"],["fr","French"],["ht","Haitian Creole"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {newSub.subscriber_type === "enterprise" && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Institution</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newSub.institution_id} onChange={e => setNewSub(n => ({ ...n, institution_id: e.target.value }))}>
                  <option value="">Select institution...</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={addSubscriber} disabled={saving || !newSub.first_name || !newSub.phone_number}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? "Adding..." : "Add Subscriber"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
