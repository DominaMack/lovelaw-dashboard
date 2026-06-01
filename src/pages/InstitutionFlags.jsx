// Institution-facing distress flags — shows ONLY their cohort's flags
// No internal tooling, vendor names, or Love Law admin data visible
import { useState } from "react";

export default function InstitutionFlags({ user }) {
  const [flags] = useState([]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ll-navy">Distress Flags</h1>
        <p className="text-ll-gray text-sm mt-1">Subscriber wellbeing alerts for your cohort only</p>
      </div>

      {/* Privacy notice */}
      <div className="rounded-2xl p-4 mb-6 border border-blue-200 bg-blue-50">
        <div className="text-sm font-semibold text-blue-800 mb-1">🔒 Privacy Notice</div>
        <p className="text-xs text-blue-700">
          You can see when a student in your cohort triggers a distress keyword, but you cannot see the full message content. Love Law™ handles all crisis response. You are notified so you can follow up through your own student support channels.
        </p>
      </div>

      {flags.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card text-center py-16">
          <div className="text-5xl mb-3">✅</div>
          <div className="font-semibold text-ll-navy">No open distress flags</div>
          <div className="text-sm text-ll-gray mt-1">Your cohort is doing well. We're monitoring 24/7.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map(flag => (
            <div key={flag.id} className="bg-white rounded-2xl shadow-card p-5 border-l-4 border-amber-400">
              <div className="font-semibold text-ll-navy text-sm">Student Alert</div>
              <div className="text-xs text-ll-gray mt-1">Tier: {flag.tier} · Status: {flag.status}</div>
              <div className="text-xs text-ll-gray mt-0.5">Logged: {new Date(flag.created_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl shadow-card p-5">
        <div className="font-semibold text-ll-navy mb-1">Need to escalate?</div>
        <p className="text-sm text-ll-gray mb-3">If you believe a student is in immediate danger, contact your campus crisis team and reach out to Love Law™ directly.</p>
        <a href="mailto:hello@shoplovelaw.com" className="inline-flex items-center gap-2 bg-ll-blue text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition">
          📧 Contact Love Law™ Support
        </a>
      </div>
    </div>
  );
}
