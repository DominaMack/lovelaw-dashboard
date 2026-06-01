import { useState, useEffect } from "react";

// Institution-facing overview — shows ONLY their cohort data
// No GHL, no A2P, no internal tooling visible
export default function InstitutionOverview({ user }) {
  const inst = user?.institution || "Your Institution";
  const tier = user?.tier || "small";

  const TIER_LIMITS = { pilot:50, small:250, "mid-size":1000, enterprise:5000 };
  const TIER_PRICES = { pilot:"$250/mo", small:"$499/mo", "mid-size":"$1,499/mo", enterprise:"$3,500/mo" };
  const NEXT_TIER   = { pilot:"small", small:"mid-size", "mid-size":"enterprise" };
  const NEXT_PRICE  = { pilot:"$499/mo", small:"$1,499/mo", "mid-size":"$3,500/mo" };

  const tierKey = tier.toLowerCase().replace(" ","-");
  const seatLimit = TIER_LIMITS[tierKey] || 250;
  const seatsUsed = user?.seats_used || 0;
  const pct = Math.round((seatsUsed/seatLimit)*100);
  const nextTier = NEXT_TIER[tierKey];

  const barExam = user?.bar_exam_date;
  const daysToExam = barExam
    ? Math.max(0, Math.ceil((new Date(barExam) - new Date()) / 86400000))
    : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-blue-500 uppercase tracking-widest font-semibold mb-1">Institution Dashboard</div>
        <h1 className="text-2xl md:text-3xl font-bold text-ll-navy">{inst}</h1>
        <p className="text-ll-gray text-sm mt-1">Daily Dose of Justice™ — cohort engagement overview</p>
      </div>

      {/* Bar exam countdown */}
      {daysToExam !== null && (
        <div className="rounded-2xl p-5 mb-6 text-white flex items-center justify-between" style={{background:"#0a0f1e"}}>
          <div>
            <div className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-1">Bar Exam Countdown</div>
            <div className="text-3xl font-bold">{daysToExam} days</div>
            <div className="text-slate-400 text-sm mt-1">Keep your students locked in every morning.</div>
          </div>
          <div className="text-6xl opacity-20">⚖️</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon:"👥", label:"Active Students", value:seatsUsed, color:"#3b82f6" },
          { icon:"📩", label:"Msgs Delivered Today", value: seatsUsed, color:"#10b981" },
          { icon:"📈", label:"Avg Open Rate", value:"92%", color:"#3b82f6" },
          { icon:"🚨", label:"Open Flags", value:0, color:"#ef4444" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-4 md:p-5">
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl md:text-3xl font-bold" style={{color:s.color}}>{s.value}</div>
            <div className="text-xs text-ll-gray mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Seat usage */}
      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-bold text-ll-navy">Seat Usage</div>
            <div className="text-xs text-ll-gray mt-0.5 capitalize">{tier} Plan · {TIER_PRICES[tierKey]}</div>
          </div>
          <span className="text-sm font-bold text-ll-navy">{seatsUsed} / {seatLimit}</span>
        </div>
        <div className="w-full rounded-full h-3" style={{background:"#e2e8f0"}}>
          <div className="h-3 rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`, background:pct>85?"#ef4444":"#3b82f6"}}/>
        </div>
        <div className="flex justify-between text-xs text-ll-gray mt-2">
          <span>{pct}% used</span>
          <span>{seatLimit - seatsUsed} seats available</span>
        </div>

        {/* Upgrade CTA */}
        {nextTier && pct >= 70 && (
          <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-blue-800">You're approaching your seat limit</div>
              <div className="text-xs text-blue-600 mt-0.5">
                Upgrade to <span className="font-bold capitalize">{nextTier}</span> for more capacity — {NEXT_PRICE[tierKey]}
              </div>
            </div>
            <button className="shrink-0 bg-ll-blue text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition">
              Upgrade Plan →
            </button>
          </div>
        )}
      </div>

      {/* Cohort breakdown */}
      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6 mb-6">
        <div className="font-bold text-ll-navy mb-4">Cohort Engagement</div>
        <div className="space-y-3">
          {[
            { label:"1L Students", pct:92, color:"#3b82f6" },
            { label:"2L Students", pct:87, color:"#3b82f6" },
            { label:"3L Students", pct:78, color:"#3b82f6" },
            { label:"Bar Prep",    pct:95, color:"#10b981" },
          ].map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-ll-navy font-medium">{r.label}</span>
                <span className="text-ll-gray">{r.pct}%</span>
              </div>
              <div className="w-full rounded-full h-2" style={{background:"#e2e8f0"}}>
                <div className="h-2 rounded-full" style={{width:`${r.pct}%`, background:r.color}}/>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ll-gray mt-4">Sample data — live engagement stats update daily.</p>
      </div>

      {/* Support */}
      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6">
        <div className="font-bold text-ll-navy mb-1">Need help?</div>
        <p className="text-sm text-ll-gray mb-3">Contact your Love Law™ account manager or visit our support docs.</p>
        <a href="mailto:hello@shoplovelaw.com" className="inline-flex items-center gap-2 bg-ll-blue text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-600 transition">
          📧 Contact Support
        </a>
      </div>
    </div>
  );
}
