import { useState } from "react";

const CSV_TEMPLATE = `first_name,last_name,phone_number,email,segment,track
Jane,Smith,+15551234567,jane@lawschool.edu,1L,standard
Marcus,Johnson,+15559876543,marcus@lawschool.edu,Bar Prep,faith-based
Aisha,Williams,+15554445555,aisha@lawschool.edu,2L,standard`;

const SEGMENTS = ["1L","2L","3L","Bar Prep","Bar Retaker","Attorney"];
const TRACKS   = ["standard","faith-based","first-generation","burnout-support","women-in-law","black-in-law"];

export default function InstitutionRoster({ user }) {
  const [tab, setTab] = useState("upload"); // upload | manual | list
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Manual entry form
  const blank = { first_name:"", last_name:"", phone_number:"", email:"", segment:"1L", track:"standard" };
  const [form, setForm] = useState(blank);

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "lovelaw_roster_template.csv"; a.click();
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split("\n");
      const headers = lines[0].split(",").map(h=>h.trim());
      const parsed = lines.slice(1).map(line => {
        const vals = line.split(",").map(v=>v.trim());
        return headers.reduce((obj,h,i) => ({...obj,[h]:vals[i]||""}), {});
      }).filter(r => r.first_name && r.phone_number);
      setPreview(parsed);
      setError("");
    };
    reader.readAsText(file);
  }

  function submitCSV() {
    if (!preview.length) return;
    setUploading(true);
    // In production this would call a backend function to create Subscriber records
    setTimeout(() => {
      setRows(prev => [...prev, ...preview]);
      setPreview([]);
      setSuccess(`${preview.length} students added to your roster.`);
      setUploading(false);
      setTab("list");
    }, 1200);
  }

  function submitManual(e) {
    e.preventDefault();
    if (!form.first_name || !form.phone_number) { setError("First name and phone are required."); return; }
    setRows(prev => [...prev, {...form, id: Date.now()}]);
    setForm(blank);
    setSuccess("Student added.");
    setError("");
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ll-navy">My Roster</h1>
        <p className="text-ll-gray text-sm mt-1">Manage your institution's enrolled students</p>
      </div>

      {/* Seat count */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 flex items-center justify-between">
        <div className="text-sm text-ll-navy">
          <span className="font-bold text-2xl text-ll-blue">{rows.length}</span>
          <span className="text-ll-gray ml-2">students enrolled</span>
        </div>
        <div className="text-xs text-ll-gray">Seat limit: {user?.seat_limit || 50}</div>
      </div>

      {/* Success/error */}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
      {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl shadow-card p-1 mb-6">
        {[["upload","📁 Upload CSV"],["manual","✏️ Add Manually"],["list","👥 View Roster"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${tab===k?"text-white shadow-blue":"text-ll-gray hover:text-ll-navy"}`}
            style={tab===k?{background:"#3b82f6"}:{}}>
            {l}
          </button>
        ))}
      </div>

      {/* UPLOAD TAB */}
      {tab === "upload" && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-bold text-ll-navy">Upload Student Roster</h2>
              <p className="text-sm text-ll-gray mt-1">Upload a CSV file with your students' information.</p>
            </div>
            <button onClick={downloadTemplate} className="text-xs bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition shrink-0">
              ⬇ Download Template
            </button>
          </div>

          {/* Format guide */}
          <div className="bg-ll-offwhite rounded-xl p-4 mb-5 border border-ll-lgray">
            <div className="text-xs font-bold text-ll-navy uppercase tracking-wide mb-2">Required CSV Format</div>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr>
                    {["first_name","last_name","phone_number","email","segment","track"].map(h=>(
                      <th key={h} className="text-left text-blue-700 font-bold py-1 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {["Jane","Smith","+15551234567","jane@law.edu","1L","standard"].map((v,i)=>(
                      <td key={i} className="text-ll-gray py-1 pr-4 whitespace-nowrap">{v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-ll-gray">
              <strong>segment options:</strong> 1L, 2L, 3L, Bar Prep, Bar Retaker, Attorney<br/>
              <strong>track options:</strong> standard, faith-based, first-generation, burnout-support, women-in-law, black-in-law
            </div>
          </div>

          {/* File input */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-ll-lgray rounded-xl p-8 cursor-pointer hover:border-ll-blue hover:bg-blue-50/30 transition mb-4">
            <div className="text-3xl mb-2">📁</div>
            <div className="text-sm font-semibold text-ll-navy">Click to upload CSV or Excel file</div>
            <div className="text-xs text-ll-gray mt-1">.csv or .xlsx, max 5MB</div>
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleCSV}/>
          </label>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-ll-navy">{preview.length} students ready to import</div>
                <button onClick={submitCSV} disabled={uploading}
                  className="bg-ll-blue text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-600 transition disabled:opacity-60">
                  {uploading ? "Importing..." : `Import ${preview.length} Students`}
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-ll-lgray">
                <table className="w-full text-xs">
                  <thead className="bg-ll-offwhite">
                    <tr>{["Name","Phone","Email","Segment","Track"].map(h=>(
                      <th key={h} className="text-left text-ll-gray font-semibold px-3 py-2">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {preview.slice(0,5).map((r,i)=>(
                      <tr key={i} className="border-t border-ll-lgray/50">
                        <td className="px-3 py-2 text-ll-navy font-medium">{r.first_name} {r.last_name}</td>
                        <td className="px-3 py-2 text-ll-gray">{r.phone_number}</td>
                        <td className="px-3 py-2 text-ll-gray">{r.email}</td>
                        <td className="px-3 py-2"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.segment}</span></td>
                        <td className="px-3 py-2 text-ll-gray">{r.track}</td>
                      </tr>
                    ))}
                    {preview.length > 5 && <tr><td colSpan={5} className="px-3 py-2 text-ll-gray text-center">+{preview.length-5} more...</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL TAB */}
      {tab === "manual" && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-ll-navy mb-5">Add Student Manually</h2>
          <form onSubmit={submitManual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key:"first_name", label:"First Name", placeholder:"Jane", required:true },
              { key:"last_name",  label:"Last Name",  placeholder:"Smith" },
              { key:"phone_number",label:"Phone Number",placeholder:"+15551234567",required:true,hint:"Include country code" },
              { key:"email",      label:"Email",      placeholder:"jane@lawschool.edu" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-ll-gray uppercase tracking-wide mb-1.5">
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="text" value={form[f.key]} placeholder={f.placeholder}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ll-blue/30 focus:border-ll-blue"
                />
                {f.hint && <div className="text-xs text-ll-gray mt-1">{f.hint}</div>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-ll-gray uppercase tracking-wide mb-1.5">Segment</label>
              <select value={form.segment} onChange={e=>setForm(p=>({...p,segment:e.target.value}))}
                className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ll-blue/30">
                {SEGMENTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ll-gray uppercase tracking-wide mb-1.5">Track</label>
              <select value={form.track} onChange={e=>setForm(p=>({...p,track:e.target.value}))}
                className="w-full border border-ll-lgray rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ll-blue/30">
                {TRACKS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="bg-ll-blue text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition text-sm">
                Add Student
              </button>
              <button type="button" onClick={()=>setForm(blank)} className="border border-ll-lgray text-ll-gray px-5 py-2.5 rounded-xl hover:bg-ll-offwhite transition text-sm">
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST TAB */}
      {tab === "list" && (
        <div className="bg-white rounded-2xl shadow-card p-0 overflow-hidden">
          {rows.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-semibold text-ll-navy mb-1">No students enrolled yet</div>
              <div className="text-sm text-ll-gray mb-4">Upload a CSV or add students manually.</div>
              <button onClick={()=>setTab("upload")} className="bg-ll-blue text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-600 transition">
                Upload Roster
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ll-offwhite border-b border-ll-lgray">
                  <tr>{["Name","Phone","Segment","Track","Status"].map(h=>(
                    <th key={h} className="text-left text-xs font-semibold text-ll-gray uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {rows.map((r,i)=>(
                    <tr key={r.id||i} className="border-b border-ll-lgray/50 hover:bg-ll-offwhite transition">
                      <td className="px-5 py-3.5 font-medium text-ll-navy text-sm">{r.first_name} {r.last_name}</td>
                      <td className="px-5 py-3.5 text-sm text-ll-gray">{r.phone_number}</td>
                      <td className="px-5 py-3.5"><span className="badge bg-blue-100 text-blue-700">{r.segment}</span></td>
                      <td className="px-5 py-3.5 text-sm text-ll-gray capitalize">{r.track}</td>
                      <td className="px-5 py-3.5"><span className="badge bg-green-100 text-green-700">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
