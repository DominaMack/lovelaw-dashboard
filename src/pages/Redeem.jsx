import { useState } from "react";

const SEGMENTS = [
  { value:"1L",          label:"1L Law Student" },
  { value:"2L",          label:"2L Law Student" },
  { value:"3L",          label:"3L Law Student" },
  { value:"Bar Prep",    label:"Bar Prep Candidate" },
  { value:"Bar Retaker", label:"Bar Retaker" },
  { value:"Attorney",    label:"Practicing Attorney" },
];

const TRACKS = [
  { value:"standard",          label:"Standard" },
  { value:"faith-based",       label:"Faith-Based" },
  { value:"first-generation",  label:"First Generation" },
  { value:"burnout-support",   label:"Burnout Support" },
  { value:"women-in-law",      label:"Women in Law" },
  { value:"black-in-law",      label:"Black in Law" },
];

const STEPS = ["Your Code","Your Info","Choose Track","Done"];

export default function Redeem() {
  const [step, setStep] = useState(0);
  const [code, setCode]         = useState("");
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const [codeData, setCodeData] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");

  const [segment, setSegment] = useState("1L");
  const [track, setTrack]     = useState("standard");
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — validate code
  async function checkCode(e) {
    e.preventDefault();
    setCodeError(""); setChecking(true);
    try {
      const res = await fetch(
        "https://api.base44.com/api/apps/6a0a1851e19edca1b6fa628f/functions/redeemAccessCode",
        { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ code: code.trim().toUpperCase(), validate_only: true }) }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        setCodeError(data.error || "Invalid or expired code. Please check and try again.");
      } else {
        setCodeData(data);
        setStep(1);
      }
    } catch {
      setCodeError("Connection error. Please try again.");
    }
    setChecking(false);
  }

  // Step 3 — final submit
  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(
        "https://api.base44.com/api/apps/6a0a1851e19edca1b6fa628f/functions/redeemAccessCode",
        { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ code: code.trim().toUpperCase(), first_name: firstName, phone_number: phone, email, segment, track }) }
      );
      const data = await res.json();
      if (!res.ok || data.error) {
        setCodeError(data.error || "Something went wrong. Contact hello@shoplovelaw.com");
        setStep(0);
      } else {
        setStep(3);
      }
    } catch {
      setCodeError("Connection error. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background:"#0a0f1e"}}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <a href="https://shoplovelaw.com" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L20 36M10 14L20 8L30 14M8 32L32 32" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white font-bold">Love Law™</span>
        </a>
        <a href="https://shoplovelaw.com" className="text-xs text-slate-400 hover:text-white transition">← Back to site</a>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Progress */}
          {step < 3 && (
            <div className="flex items-center gap-2 mb-8">
              {STEPS.slice(0,3).map((s,i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                    i < step ? "bg-green-500 text-white" : i === step ? "bg-ll-blue text-white" : "bg-white/10 text-slate-500"
                  }`}>
                    {i < step ? "✓" : i+1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i===step?"text-white":"text-slate-500"}`}>{s}</span>
                  {i < 2 && <div className="flex-1 h-px bg-white/10 hidden sm:block"/>}
                </div>
              ))}
            </div>
          )}

          {/* STEP 0 — Enter code */}
          {step === 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎟️</div>
                <h1 className="text-2xl font-bold text-ll-navy">Redeem Your Code</h1>
                <p className="text-ll-gray text-sm mt-2">Enter the access code from your card, PDF, or gift.</p>
              </div>
              <form onSubmit={checkCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-1.5">Access Code</label>
                  <input
                    type="text" required value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LLBP-2024-XXXX"
                    className="w-full border-2 border-ll-lgray rounded-xl px-4 py-3 text-base font-mono tracking-widest text-center focus:outline-none focus:border-ll-blue uppercase"
                  />
                  {codeError && <p className="text-red-500 text-xs mt-2">{codeError}</p>}
                </div>
                <button type="submit" disabled={checking || !code}
                  className="w-full bg-ll-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 text-sm">
                  {checking ? "Checking code…" : "Continue →"}
                </button>
              </form>
              <p className="text-center text-xs text-ll-gray mt-6">
                Need help? <a href="mailto:hello@shoplovelaw.com" className="text-ll-blue hover:underline">hello@shoplovelaw.com</a>
              </p>
            </div>
          )}

          {/* STEP 1 — Your info */}
          {step === 1 && (
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <div className="mb-1">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  ✓ Code valid — {codeData?.days_of_access || 30} days of access
                </div>
              </div>
              <h2 className="text-xl font-bold text-ll-navy mb-1">Your Information</h2>
              <p className="text-ll-gray text-sm mb-5">We'll send your daily messages to this phone number.</p>
              <form onSubmit={e=>{ e.preventDefault(); setStep(2); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-1.5">First Name *</label>
                    <input required value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Jane"
                      className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ll-blue"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-1.5">Last Name</label>
                    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Smith"
                      className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ll-blue"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-1.5">Phone Number *</label>
                  <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
                    className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ll-blue"/>
                  <p className="text-xs text-ll-gray mt-1">US numbers only. Standard messaging rates apply.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-1.5">Email (optional)</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com"
                    className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-ll-blue"/>
                </div>
                <button type="submit" disabled={!firstName||!phone}
                  className="w-full bg-ll-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 text-sm">
                  Continue →
                </button>
              </form>
            </div>
          )}

          {/* STEP 2 — Choose track */}
          {step === 2 && (
            <div className="bg-white rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-ll-navy mb-1">Choose Your Track</h2>
              <p className="text-ll-gray text-sm mb-5">Tell us where you are in your legal journey.</p>
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-2">I am a…</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEGMENTS.map(s=>(
                      <button type="button" key={s.value} onClick={()=>setSegment(s.value)}
                        className={`px-3 py-3 rounded-xl text-sm font-semibold border-2 transition text-left ${
                          segment===s.value ? "border-ll-blue text-ll-blue" : "border-ll-lgray text-ll-gray hover:border-ll-blue/40"
                        }`}
                        style={segment===s.value?{background:"rgba(59,130,246,0.06)"}:{}}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ll-gray uppercase tracking-wide mb-2">Message style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRACKS.map(t=>(
                      <button type="button" key={t.value} onClick={()=>setTrack(t.value)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition text-left ${
                          track===t.value ? "border-ll-blue text-ll-blue" : "border-ll-lgray text-ll-gray hover:border-ll-blue/40"
                        }`}
                        style={track===t.value?{background:"rgba(59,130,246,0.06)"}:{}}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TCPA consent */}
                <div className="bg-ll-offwhite rounded-xl p-3 text-xs text-ll-gray leading-relaxed">
                  By tapping "Activate", you agree to receive recurring automated motivational, educational, and promotional text messages from Love Law Collective, LLC. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe. Reply HELP for help. SMS opt-in data will not be shared or sold.
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full bg-ll-blue text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 text-sm">
                  {submitting ? "Activating…" : "Activate My Subscription ⚖️"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3 — Done */}
          {step === 3 && (
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">⚖️</div>
              <h2 className="text-2xl font-bold text-ll-navy mb-2">You're In!</h2>
              <p className="text-ll-gray mb-2">
                Welcome to the Daily Dose of Justice™, {firstName}.
              </p>
              <p className="text-ll-gray text-sm mb-6">
                Your first message arrives <strong>tomorrow morning</strong>. Keep an eye on your phone.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mb-6">
                📱 <strong>{phone}</strong> is now enrolled.<br/>
                <span className="text-xs text-blue-600">Reply STOP at any time to unsubscribe.</span>
              </div>
              <a href="https://shoplovelaw.com" className="inline-block bg-ll-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-600 transition text-sm">
                Shop Love Law™ Merch →
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-600 border-t border-white/10">
        © 2026 Love Law Collective, LLC ·
        <a href="https://shoplovelaw.com/terms" className="hover:text-slate-400 ml-1">Terms</a> ·
        <a href="https://shoplovelaw.com/privacy" className="hover:text-slate-400 ml-1">Privacy</a> ·
        <a href="https://shoplovelaw.com/sms-terms" className="hover:text-slate-400 ml-1">SMS Terms</a>
      </footer>
    </div>
  );
}
