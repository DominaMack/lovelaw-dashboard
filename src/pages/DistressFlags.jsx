import { useState, useEffect } from "react";
import { Subscriber } from "@/api/entities";
import { Institution } from "@/api/entities";

// We reference the entity by its actual name in the database
const DISTRESS_ENTITY = "DistrессFlag";

const TIER_CONFIG = {
  "tier-1": {
    label: "Tier 1 — Soft Distress",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "🟡",
    description: "Emotional frustration or burnout signal",
    response: "Hey — we hear you. This season is genuinely hard. You don't have to be okay right now. Take a breath. We're here. - Love Law",
  },
  "tier-2": {
    label: "Tier 2 — Mental Health",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🔴",
    description: "Mental health distress — immediate warm response + resources",
    response: "We see you and we care. If you need to talk to someone right now, you can call or text 988. You are not alone. - Love Law",
  },
  "tier-3": {
    label: "Tier 3 — Crisis",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "🆘",
    description: "Immediate crisis — requires urgent response",
    response: "Please reach out for support right now. Call or text 988 (free, 24/7). You matter and help is available. - Love Law",
  },
};

const KEYWORDS = {
  "tier-1": ["I can't do this", "I want to quit", "I give up", "I'm done", "overwhelmed", "breaking down", "falling apart", "I hate this", "I can't anymore"],
  "tier-2": ["I want to die", "I don't want to be here", "can't go on", "hopeless", "nobody cares", "what's the point", "end it", "hurt myself"],
  "tier-3": ["suicide", "kill myself", "I'm going to hurt myself", "I need help now", "emergency"],
};

export default function DistrессFlags() {
  const [flags, setFlags] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [selected, setSelected] = useState(null);
  const [showKeywords, setShowKeywords] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [subs, insts] = await Promise.all([
        Subscriber.list(),
        Institution.list(),
      ]);
      setSubscribers(subs);
      setInstitutions(insts);
      // Load distress flags via the entity
      const { DistrессFlag } = await import("@/api/entities");
      const f = await DistrессFlag.list();
      setFlags(f.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function updateFlag(id, data) {
    const { DistrессFlag } = await import("@/api/entities");
    await DistrессFlag.update(id, data);
    setFlags(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    if (selected?.id === id) setSelected(f => ({ ...f, ...data }));
  }

  const subName = (id) => {
    const s = subscribers.find(s => s.id === id);
    return s ? `${s.first_name || ""} ${s.last_name || ""}`.trim() : "Unknown";
  };
  const instName = (id) => institutions.find(i => i.id === id)?.name || null;

  const filtered = flags.filter(f => {
    if (filterStatus && f.status !== filterStatus) return false;
    if (filterTier && f.tier !== filterTier) return false;
    return true;
  });

  const counts = {
    new: flags.filter(f => f.status === "new").length,
    acknowledged: flags.filter(f => f.status === "acknowledged").length,
    resolved: flags.filter(f => f.status === "resolved").length,
    tier3: flags.filter(f => f.tier === "tier-3" && f.status !== "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Distress Flags</h1>
            <p className="text-sm text-gray-500">Subscriber emotional distress monitoring</p>
          </div>
          <button onClick={() => setShowKeywords(!showKeywords)}
            className="text-sm border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
            📋 View Trigger Keywords
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Crisis Alert Banner */}
        {counts.tier3 > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🆘</span>
            <div>
              <div className="font-semibold text-red-800">Urgent: {counts.tier3} unresolved Tier 3 crisis flag{counts.tier3 > 1 ? "s" : ""}</div>
              <div className="text-sm text-red-600">Immediate attention required. Review and acknowledge below.</div>
            </div>
            <button onClick={() => setFilterTier("tier-3")} className="ml-auto text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
              View Now
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "New Flags", value: counts.new, color: "text-amber-600", icon: "🆕" },
            { label: "Acknowledged", value: counts.acknowledged, color: "text-blue-600", icon: "👁️" },
            { label: "Resolved", value: counts.resolved, color: "text-green-600", icon: "✅" },
            { label: "Total Flags", value: flags.length, color: "text-gray-900", icon: "📊" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span>{s.icon}</span>
              </div>
              <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex gap-3 flex-wrap">
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filterTier} onChange={e => setFilterTier(e.target.value)}>
            <option value="">All Tiers</option>
            <option value="tier-1">Tier 1 — Soft Distress</option>
            <option value="tier-2">Tier 2 — Mental Health</option>
            <option value="tier-3">Tier 3 — Crisis</option>
          </select>
          {(filterStatus || filterTier) && (
            <button onClick={() => { setFilterStatus(""); setFilterTier(""); }}
              className="text-sm text-gray-400 hover:text-gray-600 px-2">Clear filters</button>
          )}
        </div>

        {/* Flags List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading distress flags...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <div className="text-gray-700 font-medium">No distress flags</div>
            <div className="text-sm text-gray-400 mt-1">
              {flags.length === 0 ? "System is monitoring all subscriber replies." : "All flags match your current filters."}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(flag => {
              const tier = TIER_CONFIG[flag.tier] || TIER_CONFIG["tier-1"];
              const isSelected = selected?.id === flag.id;
              return (
                <div key={flag.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${flag.tier === "tier-3" ? "border-red-200" : flag.tier === "tier-2" ? "border-orange-200" : "border-gray-100"}`}>
                  <div className="p-5 cursor-pointer" onClick={() => setSelected(isSelected ? null : flag)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{tier.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{subName(flag.subscriber_id)}</span>
                            {flag.institution_id && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{instName(flag.institution_id)}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tier.color}`}>{tier.label}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Triggered by: <span className="font-medium">"{flag.trigger_keyword}"</span>
                          </div>
                          {flag.full_message && (
                            <div className="text-sm text-gray-500 mt-0.5 italic">"{flag.full_message}"</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {flag.created_date ? new Date(flag.created_date).toLocaleString() : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          flag.status === "new" ? "bg-amber-100 text-amber-700" :
                          flag.status === "acknowledged" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>{flag.status}</span>
                        {flag.response_sent && (
                          <span className="text-xs text-green-600">✓ Response sent</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isSelected && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      {/* Suggested Response */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Suggested Response</div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-800">
                          {tier.response}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Internal Notes</div>
                        <textarea
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
                          rows={2}
                          placeholder="Add notes..."
                          defaultValue={flag.notes || ""}
                          onBlur={e => updateFlag(flag.id, { notes: e.target.value })}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {flag.status === "new" && (
                          <button onClick={() => updateFlag(flag.id, { status: "acknowledged" })}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">
                            👁️ Acknowledge
                          </button>
                        )}
                        {flag.status !== "resolved" && (
                          <button onClick={() => updateFlag(flag.id, { status: "resolved" })}
                            className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200">
                            ✅ Mark Resolved
                          </button>
                        )}
                        {!flag.response_sent && (
                          <button onClick={() => updateFlag(flag.id, { response_sent: true, response_text: tier.response })}
                            className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200">
                            📤 Log Response Sent
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Keyword Reference Modal */}
        {showKeywords && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">📋 Distress Trigger Keywords</h2>
                <button onClick={() => setShowKeywords(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <p className="text-sm text-gray-500 mb-5">When a subscriber replies with any of these phrases, the system logs a distress flag automatically.</p>
              {Object.entries(KEYWORDS).map(([tier, words]) => {
                const config = TIER_CONFIG[tier];
                return (
                  <div key={tier} className="mb-5">
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-3 ${config.color} border`}>
                      {config.icon} {config.label}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{config.description}</div>
                    <div className="flex flex-wrap gap-2">
                      {words.map(w => (
                        <span key={w} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">"{w}"</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="bg-amber-50 rounded-xl p-3 mt-2">
                <div className="text-xs text-amber-700 font-medium mb-1">Note</div>
                <div className="text-xs text-amber-600">For GHL voice/chat agent integration — these same keywords should be added to your GHL workflow triggers when ready.</div>
              </div>
              <button onClick={() => setShowKeywords(false)} className="mt-4 w-full py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
