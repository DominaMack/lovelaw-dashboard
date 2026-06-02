import { useState, useEffect } from "react";
import { Institution } from "@/api/entities";
import { Subscriber } from "@/api/entities";

const TIER_COLORS = {
  basic: "bg-gray-100 text-gray-700",
  professional: "bg-blue-100 text-blue-700",
  elite: "bg-purple-100 text-purple-700",
};

const TIER_FEATURES = {
  basic: ["View approved message sequences", "Enroll students", "Basic delivery reports", "Email support"],
  professional: ["All Basic features", "Reorder/suppress messages", "Custom start dates", "Monthly PDF reports", "Distress flag alerts", "Priority support"],
  elite: ["All Professional features", "Custom message tracks", "Roster CSV upload", "Multi-cohort support", "White-label SMS", "Analytics dashboard", "Dedicated support", "Quarterly reviews", "API access"],
};

export default function Enterprise() {
  const [institutions, setInstitutions] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newInst, setNewInst] = useState({
    name: "", type: "law-school", tier: "basic", status: "trial",
    admin_name: "", admin_email: "", admin_phone: "",
    seat_limit: 50, seats_used: 0,
    contract_start: "", contract_end: "",
    bar_exam_date: "", bar_exam_sync: false,
    allowed_segments: "bar-prep,bar-retaker",
    allowed_tracks: "focus-standard,focus-faith-based",
    custom_tracks_enabled: false, white_label_enabled: false,
    white_label_name: "", notes: ""
  });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [insts, subs] = await Promise.all([Institution.list(), Subscriber.list()]);
    setInstitutions(insts);
    setSubscribers(subs);
    setLoading(false);
  }

  async function addInstitution() {
    setSaving(true);
    await Institution.create(newInst);
    await loadAll();
    setShowAdd(false);
    setSaving(false);
  }

  async function updateInstitutionStatus(id, status) {
    await Institution.update(id, { status });
    setInstitutions(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  const instSubscribers = (instId) => subscribers.filter(s => s.institution_id === instId);
  const seatUsage = (inst) => {
    const used = instSubscribers(inst.id).length;
    const pct = inst.seat_limit ? Math.round((used / inst.seat_limit) * 100) : 0;
    return { used, pct };
  };

  const daysToExpiry = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const statusBadge = (status) => {
    const map = { active: "bg-green-100 text-green-700", trial: "bg-amber-100 text-amber-700", suspended: "bg-red-100 text-red-600", cancelled: "bg-gray-100 text-gray-500" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enterprise</h1>
            <p className="text-sm text-gray-500">{institutions.length} institutions · {subscribers.filter(s => s.subscriber_type === "enterprise").length} enterprise subscribers</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            🏛️ Onboard Institution
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Tier Overview Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {["basic", "professional", "elite"].map(tier => {
            const count = institutions.filter(i => i.tier === tier && i.status === "active").length;
            return (
              <div key={tier} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${TIER_COLORS[tier]}`}>{tier}</span>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">active institutions</div>
                <div className="space-y-1">
                  {TIER_FEATURES[tier].slice(0, 3).map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </div>
                  ))}
                  {TIER_FEATURES[tier].length > 3 && (
                    <div className="text-xs text-gray-400">+{TIER_FEATURES[tier].length - 3} more features</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Institution List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading institutions...</div>
        ) : institutions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <div className="text-5xl mb-3">🏛️</div>
            <div className="text-gray-700 font-medium mb-1">No institutions yet</div>
            <div className="text-sm text-gray-400 mb-4">Onboard your first law school or firm to get started.</div>
            <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
              Onboard Institution
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {institutions.map(inst => {
              const { used, pct } = seatUsage(inst);
              const expiry = daysToExpiry(inst.contract_end);
              const isSelected = selected?.id === inst.id;
              return (
                <div key={inst.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 cursor-pointer" onClick={() => setSelected(isSelected ? null : inst)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
                          {inst.type === "law-school" ? "🎓" : inst.type === "law-firm" ? "⚖️" : "📚"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{inst.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{inst.type?.replace("-", " ")} · {inst.admin_email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${TIER_COLORS[inst.tier]}`}>{inst.tier}</span>
                        {statusBadge(inst.status)}
                        {expiry !== null && expiry <= 30 && expiry > 0 && (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">⚠ {expiry}d left</span>
                        )}
                      </div>
                    </div>

                    {/* Seat Usage Bar */}
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Seats</span>
                          <span>{used} / {inst.seat_limit || "∞"}</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${pct >= 80 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-green-400"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                      {inst.bar_exam_sync && inst.bar_exam_date && (
                        <div className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          📅 Bar: {new Date(inst.bar_exam_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isSelected && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                        {[
                          ["Admin", inst.admin_name],
                          ["Phone", inst.admin_phone || "—"],
                          ["Contract Start", inst.contract_start ? new Date(inst.contract_start).toLocaleDateString() : "—"],
                          ["Contract End", inst.contract_end ? new Date(inst.contract_end).toLocaleDateString() : "—"],
                          ["Allowed Segments", inst.allowed_segments || "—"],
                          ["Allowed Tracks", inst.allowed_tracks?.replace(/focus-/g, "") || "—"],
                          ["Custom Tracks", inst.custom_tracks_enabled ? "✅ Enabled" : "❌ Disabled"],
                          ["White Label", inst.white_label_enabled ? `✅ ${inst.white_label_name || "Enabled"}` : "❌ Disabled"],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-white rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
                          </div>
                        ))}
                      </div>

                      {/* Enrolled Students */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Enrolled Subscribers ({instSubscribers(inst.id).length})</h4>
                        {instSubscribers(inst.id).length === 0 ? (
                          <div className="text-sm text-gray-400">No subscribers enrolled yet.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {instSubscribers(inst.id).slice(0, 10).map(s => (
                              <div key={s.id} className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700">
                                {s.first_name} {s.last_name} · Day {s.current_day_number || 1}
                              </div>
                            ))}
                            {instSubscribers(inst.id).length > 10 && (
                              <div className="text-xs text-gray-400 px-2 py-1.5">+{instSubscribers(inst.id).length - 10} more</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {inst.status !== "active" && (
                          <button onClick={() => updateInstitutionStatus(inst.id, "active")}
                            className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">✅ Activate</button>
                        )}
                        {inst.status === "active" && (
                          <button onClick={() => updateInstitutionStatus(inst.id, "suspended")}
                            className="text-sm bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-200">⏸ Suspend</button>
                        )}
                        {inst.notes && (
                          <div className="ml-4 text-xs text-gray-500 italic self-center">{inst.notes}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">🏛️ Onboard Institution</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Institution Name</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  placeholder="e.g. Howard University School of Law"
                  value={newInst.name} onChange={e => setNewInst(n => ({ ...n, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newInst.type} onChange={e => setNewInst(n => ({ ...n, type: e.target.value }))}>
                  <option value="law-school">Law School</option>
                  <option value="law-firm">Law Firm</option>
                  <option value="bar-prep-company">Bar Prep Company</option>
                  <option value="bar-association">Bar Association</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newInst.tier} onChange={e => setNewInst(n => ({ ...n, tier: e.target.value }))}>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Admin Name</label>
                <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newInst.admin_name} onChange={e => setNewInst(n => ({ ...n, admin_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Admin Email</label>
                <input type="email" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newInst.admin_email} onChange={e => setNewInst(n => ({ ...n, admin_email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Seat Limit</label>
                <input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newInst.seat_limit} onChange={e => setNewInst(n => ({ ...n, seat_limit: parseInt(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newInst.status} onChange={e => setNewInst(n => ({ ...n, status: e.target.value }))}>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contract Start</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newInst.contract_start} onChange={e => setNewInst(n => ({ ...n, contract_start: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contract End</label>
                <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  value={newInst.contract_end} onChange={e => setNewInst(n => ({ ...n, contract_end: e.target.value }))} />
              </div>
            </div>

            {/* Bar Exam Sync */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-indigo-900">Bar Exam Date Sync</div>
                  <div className="text-xs text-indigo-600">Aligns cohort messaging to the bar exam date</div>
                </div>
                <button onClick={() => setNewInst(n => ({ ...n, bar_exam_sync: !n.bar_exam_sync }))}
                  className={`w-11 h-6 rounded-full transition-colors ${newInst.bar_exam_sync ? "bg-indigo-600" : "bg-gray-300"} relative`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${newInst.bar_exam_sync ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              {newInst.bar_exam_sync && (
                <input type="date" className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm bg-white"
                  value={newInst.bar_exam_date} onChange={e => setNewInst(n => ({ ...n, bar_exam_date: e.target.value }))} />
              )}
            </div>

            {/* Tier Features Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {newInst.tier} Tier Includes:
              </div>
              <div className="grid grid-cols-2 gap-1">
                {TIER_FEATURES[newInst.tier].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <span className="text-green-500">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={addInstitution} disabled={saving || !newInst.name || !newInst.admin_email}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {saving ? "Saving..." : "Onboard Institution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
