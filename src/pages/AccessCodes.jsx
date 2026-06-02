import { useState, useEffect } from "react";
import { AccessCode } from "@/api/entities";

const CHANNELS = ["amazon", "etsy", "walmart", "bookstore", "event", "institution", "direct", "other"];
const SEGMENTS = ["bar-prep", "bar-retaker", "law-student-1L", "law-student-2L", "law-student-3L", "attorney", "any"];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `LL-${seg(4)}-${seg(4)}-${seg(4)}`;
}

function generateBatch(count, config) {
  return Array.from({ length: count }, () => ({
    code: generateCode(),
    batch_name: config.batch_name,
    channel: config.channel,
    audience_segment: config.audience_segment,
    focus_track: config.focus_track,
    days_of_access: config.days_of_access,
    subscription_tier: config.subscription_tier,
    status: "unused",
    price_paid: config.price_paid,
    expires_at: config.expires_at,
    notes: config.notes,
  }));
}

export default function AccessCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [batchConfig, setBatchConfig] = useState({
    batch_name: "", channel: "bookstore", audience_segment: "any",
    focus_track: "any", days_of_access: 90, subscription_tier: "standard",
    price_paid: 29.99, expires_at: "", notes: "", count: 50,
  });

  useEffect(() => { loadCodes(); }, []);

  async function loadCodes() {
    setLoading(true);
    const all = await AccessCode.list();
    setCodes(all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  }

  async function generateAndSave() {
    setGenerating(true);
    const batch = generateBatch(batchConfig.count, batchConfig);
    setGeneratedCodes(batch);
    // Save in chunks
    const chunkSize = 25;
    for (let i = 0; i < batch.length; i += chunkSize) {
      const chunk = batch.slice(i, i + chunkSize);
      await Promise.all(chunk.map(c => AccessCode.create(c)));
    }
    await loadCodes();
    setGenerating(false);
  }

  async function voidCode(id) {
    await AccessCode.update(id, { status: "voided" });
    setCodes(prev => prev.map(c => c.id === id ? { ...c, status: "voided" } : c));
  }

  function exportCSV() {
    const filtered = getFiltered();
    const headers = ["Code", "Batch", "Channel", "Segment", "Track", "Days", "Tier", "Status", "Price", "Redeemed At", "Redeemed By Phone", "Expires"];
    const rows = filtered.map(c => [
      c.code, c.batch_name, c.channel, c.audience_segment, c.focus_track,
      c.days_of_access, c.subscription_tier, c.status, c.price_paid,
      c.redeemed_at || "", c.redeemed_phone || "", c.expires_at || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `access-codes-${Date.now()}.csv`; a.click();
  }

  function getFiltered() {
    return codes.filter(c => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterChannel && c.channel !== filterChannel) return false;
      if (filterBatch && !c.batch_name?.toLowerCase().includes(filterBatch.toLowerCase())) return false;
      return true;
    });
  }

  const filtered = getFiltered();
  const batches = [...new Set(codes.map(c => c.batch_name).filter(Boolean))];

  const stats = {
    total: codes.length,
    unused: codes.filter(c => c.status === "unused").length,
    redeemed: codes.filter(c => c.status === "redeemed").length,
    revenue: codes.filter(c => c.status === "redeemed").reduce((s, c) => s + (c.price_paid || 0), 0),
  };

  const statusBadge = (status) => {
    const map = {
      unused: "bg-blue-100 text-blue-700",
      redeemed: "bg-green-100 text-green-700",
      expired: "bg-gray-100 text-gray-500",
      voided: "bg-red-100 text-red-600",
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
  };

  const channelIcon = (ch) => ({ amazon: "🛒", etsy: "🧵", walmart: "🏪", bookstore: "📚", event: "🎟️", institution: "🏛️", direct: "✉️", other: "📦" }[ch] || "📦");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Access Codes</h1>
            <p className="text-sm text-gray-500">Generate, track, and manage subscription access codes</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="border border-gray-200 bg-white text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition">
              ⬇️ Export CSV
            </button>
            <button onClick={() => setShowGenerate(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
              ✨ Generate Batch
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Codes", value: stats.total, icon: "🔑", color: "text-gray-900" },
            { label: "Unused", value: stats.unused, icon: "📦", color: "text-blue-600" },
            { label: "Redeemed", value: stats.redeemed, icon: "✅", color: "text-green-600" },
            { label: "Est. Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: "💰", color: "text-indigo-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">{s.label}</span>
                <span>{s.icon}</span>
              </div>
              <span className={`text-3xl font-bold ${s.color}`}>{loading ? "—" : s.value}</span>
            </div>
          ))}
        </div>

        {/* How it Works Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🎟️</span>
            <div>
              <div className="font-semibold text-indigo-900 mb-1">How Access Codes Work</div>
              <div className="text-sm text-indigo-700 leading-relaxed">
                Generate a batch of unique codes → distribute via Amazon, Etsy, Walmart, bookstores, events, or institutions → 
                subscribers enter their code at <strong>shoplovelaw.com/redeem</strong> → 
                their account is activated automatically → Daily Dose of Justice begins Day 1.
                No physical product needed — the code IS the product.
              </div>
              <div className="flex gap-4 mt-3 flex-wrap">
                {["🛒 Amazon", "🧵 Etsy", "🏪 Walmart", "📚 Bookstores", "🎟️ Events", "🏛️ Institutions"].map(c => (
                  <span key={c} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
          <input className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-40"
            placeholder="🔍 Search batch name..."
            value={filterBatch} onChange={e => setFilterBatch(e.target.value)} />
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="unused">Unused</option>
            <option value="redeemed">Redeemed</option>
            <option value="expired">Expired</option>
            <option value="voided">Voided</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
            value={filterChannel} onChange={e => setFilterChannel(e.target.value)}>
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c} value={c}>{channelIcon(c)} {c}</option>)}
          </select>
        </div>

        {/* Batch Summaries */}
        {batches.length > 0 && (
          <div className="mb-5">
            <div className="text-sm font-semibold text-gray-700 mb-3">Batches</div>
            <div className="flex flex-wrap gap-3">
              {batches.map(batch => {
                const batchCodes = codes.filter(c => c.batch_name === batch);
                const redeemed = batchCodes.filter(c => c.status === "redeemed").length;
                const pct = batchCodes.length ? Math.round((redeemed / batchCodes.length) * 100) : 0;
                const ch = batchCodes[0]?.channel;
                return (
                  <div key={batch} onClick={() => setFilterBatch(batch)}
                    className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition min-w-40">
                    <div className="text-sm font-medium text-gray-900">{channelIcon(ch)} {batch}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{batchCodes.length} codes · {pct}% redeemed</div>
                    <div className="bg-gray-100 rounded-full h-1 mt-2">
                      <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Codes Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading codes...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔑</div>
              <div className="text-sm font-medium text-gray-600 mb-1">No access codes yet</div>
              <div className="text-xs text-gray-400 mb-4">Generate your first batch to start distributing access.</div>
              <button onClick={() => setShowGenerate(true)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                ✨ Generate Batch
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Channel</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Segment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Redeemed</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.slice(0, 100).map(code => (
                  <tr key={code.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-800">{code.code}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{code.batch_name || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm">{channelIcon(code.channel)} <span className="text-xs text-gray-600 capitalize">{code.channel}</span></span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{code.audience_segment === "any" ? "Any" : code.audience_segment}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{code.days_of_access}d</td>
                    <td className="px-5 py-3">{statusBadge(code.status)}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {code.redeemed_at ? new Date(code.redeemed_at).toLocaleDateString() : "—"}
                      {code.redeemed_phone && <div className="text-gray-400">{code.redeemed_phone}</div>}
                    </td>
                    <td className="px-5 py-3">
                      {code.status === "unused" && (
                        <button onClick={() => voidCode(code.id)}
                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">Void</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filtered.length > 100 && (
            <div className="text-center py-3 text-xs text-gray-400 border-t border-gray-100">
              Showing 100 of {filtered.length} codes. Export CSV to see all.
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">✨ Generate Access Code Batch</h2>
              <button onClick={() => { setShowGenerate(false); setGeneratedCodes([]); }} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {generatedCodes.length > 0 ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="font-semibold text-green-800 mb-1">✅ {generatedCodes.length} codes generated!</div>
                  <div className="text-sm text-green-700">Batch: <strong>{batchConfig.batch_name}</strong> · Channel: {batchConfig.channel}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 max-h-48 overflow-y-auto mb-4">
                  {generatedCodes.slice(0, 10).map(c => (
                    <div key={c.code} className="font-mono text-xs text-gray-700 py-0.5">{c.code}</div>
                  ))}
                  {generatedCodes.length > 10 && <div className="text-xs text-gray-400 mt-1">...and {generatedCodes.length - 10} more</div>}
                </div>
                <div className="text-xs text-gray-500 mb-4">All codes saved. Export CSV from the main view to download the full list.</div>
                <button onClick={() => { setShowGenerate(false); setGeneratedCodes([]); }}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Done</button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Batch Name</label>
                    <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      placeholder="e.g. Howard Law Fall 2026, Amazon Q3"
                      value={batchConfig.batch_name} onChange={e => setBatchConfig(c => ({ ...c, batch_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Distribution Channel</label>
                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                      value={batchConfig.channel} onChange={e => setBatchConfig(c => ({ ...c, channel: e.target.value }))}>
                      {CHANNELS.map(ch => <option key={ch} value={ch}>{channelIcon(ch)} {ch}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Number of Codes</label>
                    <input type="number" min={1} max={5000} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      value={batchConfig.count} onChange={e => setBatchConfig(c => ({ ...c, count: parseInt(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Audience Segment</label>
                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                      value={batchConfig.audience_segment} onChange={e => setBatchConfig(c => ({ ...c, audience_segment: e.target.value }))}>
                      {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Days of Access</label>
                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                      value={batchConfig.days_of_access} onChange={e => setBatchConfig(c => ({ ...c, days_of_access: parseInt(e.target.value) }))}>
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>365 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price Per Code ($)</label>
                    <input type="number" step={0.01} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      value={batchConfig.price_paid} onChange={e => setBatchConfig(c => ({ ...c, price_paid: parseFloat(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Code Expiry Date</label>
                    <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                      value={batchConfig.expires_at} onChange={e => setBatchConfig(c => ({ ...c, expires_at: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tier</label>
                    <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                      value={batchConfig.subscription_tier} onChange={e => setBatchConfig(c => ({ ...c, subscription_tier: e.target.value }))}>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-indigo-50 rounded-xl p-3 mb-4">
                  <div className="text-xs font-semibold text-indigo-700 mb-1">Batch Preview</div>
                  <div className="text-xs text-indigo-600">
                    <strong>{batchConfig.count}</strong> codes · <strong>{batchConfig.days_of_access} days</strong> access · 
                    <strong> ${batchConfig.price_paid}/code</strong> · 
                    Est. revenue: <strong>${(batchConfig.count * batchConfig.price_paid).toFixed(2)}</strong>
                  </div>
                  <div className="font-mono text-xs text-indigo-500 mt-1">e.g. LL-KRTX-7MQP-2NWB</div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowGenerate(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={generateAndSave} disabled={generating || !batchConfig.batch_name || !batchConfig.count}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                    {generating ? `Generating ${batchConfig.count} codes...` : `✨ Generate ${batchConfig.count} Codes`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
