import { useState, useEffect, useRef } from "react";
import { CardTemplate, Institution } from "@/api/entities";
import { UploadFile } from "@/api/integrations";

// ── Card size definitions — DC's spec ─────────────────────────────────────
const CARD_SIZES = [
  {
    value: "letter",
    label: "Letter",
    dims: "8.5\" × 11\"",
    px: "2550 × 3300px",
    perPage: "1 per page",
    desc: "Full letter-size card. One card per printed page.",
    defaultLayout: "1_per_page",
    layouts: ["1_per_page"],
  },
  {
    value: "half_letter",
    label: "Half Letter",
    dims: "5.5\" × 4.25\"",
    px: "1650 × 1275px",
    perPage: "4 per page",
    desc: "2×2 grid on a single 8.5×11 sheet.",
    defaultLayout: "4_per_page",
    layouts: ["4_per_page", "1_per_page"],
  },
  {
    value: "business_card",
    label: "Business Card",
    dims: "3.5\" × 2.0\"",
    px: "1050 × 600px",
    perPage: "10 per page",
    desc: "2×5 grid on a single 8.5×11 sheet (Avery 5371).",
    defaultLayout: "10_per_page",
    layouts: ["10_per_page", "1_per_page"],
  },
];

const PDF_LAYOUTS = {
  "1_per_page":  { label: "1 Per Page",  desc: "One card centered on 8.5×11 — digital use or single proof" },
  "4_per_page":  { label: "4 Per Page",  desc: "2×2 grid on 8.5×11 — standard layout for half-letter cards" },
  "10_per_page": { label: "10 Per Page", desc: "2×5 grid on 8.5×11 — standard Avery 5371 business card sheet" },
};

const OUTPUT_FORMATS = [
  { value: "both",     label: "PNG + PDF" },
  { value: "png_only", label: "PNG Only"  },
  { value: "pdf_only", label: "PDF Only"  },
];

// ── StatusBadge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    active:   "bg-emerald-900/40 text-emerald-300 border border-emerald-700/40",
    draft:    "bg-amber-900/40 text-amber-300 border border-amber-700/40",
    archived: "bg-gray-700/40 text-gray-400 border border-gray-600/40",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

// ── UploadZone ─────────────────────────────────────────────────────────────
function UploadZone({ onUploaded }) {
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName,  setFileName]  = useState("");
  const inputRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    try {
      const { file_url } = await UploadFile({ file });
      const ext = file.name.split(".").pop().toLowerCase();
      onUploaded({ url: file_url, type: ext === "pdf" ? "pdf" : ext === "jpg" || ext === "jpeg" ? "jpg" : "png" });
    } catch (e) {
      alert("Upload failed: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all min-h-[150px]
        ${dragging ? "border-blue-400 bg-blue-900/20" : "border-gray-600 hover:border-blue-500/60 bg-white/3"}`}
    >
      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
        onChange={e => handleFile(e.target.files[0])} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-blue-300">Uploading {fileName}…</span>
        </div>
      ) : fileName ? (
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl">✅</div>
          <span className="text-sm text-emerald-300 font-medium">{fileName}</span>
          <span className="text-xs text-gray-400">Click to replace</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          <div className="text-4xl opacity-40">📁</div>
          <p className="text-sm text-gray-300">Drag & drop your Adobe or Canva export here</p>
          <p className="text-xs text-gray-500">PNG, JPG, or PDF · Flatten layers before export</p>
        </div>
      )}
    </div>
  );
}

// ── CardSizePicker ─────────────────────────────────────────────────────────
function CardSizePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CARD_SIZES.map(s => (
        <div key={s.value} onClick={() => onChange(s.value)}
          className={`rounded-2xl border-2 p-4 cursor-pointer transition-all flex flex-col gap-2 ${
            value === s.value
              ? "border-blue-500 bg-blue-900/20"
              : "border-white/10 hover:border-blue-500/40 bg-white/3"
          }`}>
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-white">{s.label}</span>
            <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-all ${
              value === s.value ? "border-blue-400 bg-blue-400" : "border-gray-500"
            }`} />
          </div>
          <p className="text-sm font-mono text-blue-300 leading-tight">{s.dims}</p>
          <p className="text-xs text-gray-400">{s.px} @ 300 DPI</p>
          <p className="text-xs font-semibold text-amber-300">{s.perPage}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ── PdfLayoutPicker ────────────────────────────────────────────────────────
function PdfLayoutPicker({ cardSize, value, onChange }) {
  const spec      = CARD_SIZES.find(s => s.value === cardSize);
  const available = spec ? spec.layouts : Object.keys(PDF_LAYOUTS);
  return (
    <div className="flex flex-col gap-2">
      {available.map(k => (
        <label key={k} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
          value === k ? "border-blue-500 bg-blue-900/15" : "border-white/8 hover:border-blue-500/30"
        }`}>
          <input type="radio" name="pdf_layout" value={k}
            checked={value === k} onChange={() => onChange(k)}
            className="accent-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">{PDF_LAYOUTS[k].label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{PDF_LAYOUTS[k].desc}</p>
          </div>
        </label>
      ))}
    </div>
  );
}

// ── TemplateCard (grid card) ───────────────────────────────────────────────
function TemplateCard({ tmpl, institutions, onEdit, onDelete, onActivate }) {
  const inst     = institutions.find(i => i.id === tmpl.institution_id);
  const sizeSpec = CARD_SIZES.find(s => s.value === tmpl.card_size);
  const layout   = PDF_LAYOUTS[tmpl.pdf_layout];

  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 hover:bg-white/6 transition-all overflow-hidden flex flex-col">
      {/* Preview */}
      <div className="h-40 bg-gray-900/60 flex items-center justify-center overflow-hidden relative shrink-0">
        {(tmpl.preview_url || tmpl.template_file_url) && tmpl.template_file_type !== "pdf" ? (
          <img src={tmpl.preview_url || tmpl.template_file_url} alt={tmpl.name}
            className="w-full h-full object-cover opacity-80"
            onError={e => { e.target.style.display = "none"; }} />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <div className="text-5xl">{tmpl.template_file_type === "pdf" ? "📄" : "🎨"}</div>
            <span className="text-xs text-gray-400 uppercase font-mono">{tmpl.template_file_type || "no file"}</span>
          </div>
        )}
        {tmpl.template_file_url && (
          <a href={tmpl.template_file_url} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg hover:bg-black/80 transition">
            ↗ Open
          </a>
        )}
        <div className="absolute top-2 left-2"><StatusBadge status={tmpl.status} /></div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-semibold text-white text-sm">{tmpl.name}</p>
          {inst && <p className="text-xs text-blue-300 mt-0.5">🏛 {inst.name}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {sizeSpec && (
            <span className="px-2.5 py-1 rounded-xl text-xs bg-blue-900/30 border border-blue-700/40 text-blue-300 font-medium">
              {sizeSpec.label} · {sizeSpec.dims}
            </span>
          )}
          {sizeSpec && (
            <span className="px-2.5 py-1 rounded-xl text-xs bg-amber-900/30 border border-amber-700/40 text-amber-300">
              {sizeSpec.perPage}
            </span>
          )}
          {tmpl.output_formats && (
            <span className="px-2.5 py-1 rounded-xl text-xs bg-gray-700/40 border border-gray-600/40 text-gray-300">
              {tmpl.output_formats.replace("_", " ")}
            </span>
          )}
          {tmpl.print_ready && (
            <span className="px-2.5 py-1 rounded-xl text-xs bg-emerald-900/30 border border-emerald-700/40 text-emerald-300">
              ✓ print-ready
            </span>
          )}
        </div>

        {/* Placeholders */}
        <div className="bg-black/30 rounded-xl p-2.5 flex flex-wrap gap-1.5">
          {[
            tmpl.code_placeholder || "{{CODE}}",
            tmpl.segment_placeholder || "{{SEGMENT}}",
            tmpl.duration_placeholder || "{{DURATION}}",
            tmpl.institution_name_placeholder || "{{INSTITUTION}}",
          ].map(ph => (
            <span key={ph} className="font-mono text-xs bg-blue-900/40 text-blue-200 px-1.5 py-0.5 rounded">{ph}</span>
          ))}
        </div>

        {tmpl.audience_segments && (
          <p className="text-xs text-gray-500">Segments: {tmpl.audience_segments}</p>
        )}

        <div className="flex gap-2 mt-auto pt-1">
          {tmpl.status !== "active" && (
            <button onClick={() => onActivate(tmpl)}
              className="flex-1 text-xs py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-700/40 transition">
              Activate
            </button>
          )}
          <button onClick={() => onEdit(tmpl)}
            className="flex-1 text-xs py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-700/40 transition">
            Edit
          </button>
          <button onClick={() => onDelete(tmpl)}
            className="px-3 text-xs py-1.5 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-700/30 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TemplateModal ──────────────────────────────────────────────────────────
function TemplateModal({ template, institutions, onClose, onSaved }) {
  const isEdit = !!template?.id;
  const [form, setForm] = useState({
    name: "",
    template_type: "standard",
    institution_id: "",
    template_file_url: "",
    template_file_type: "png",
    card_size: "half_letter",
    code_placeholder: "{{CODE}}",
    segment_placeholder: "{{SEGMENT}}",
    duration_placeholder: "{{DURATION}}",
    institution_name_placeholder: "{{INSTITUTION}}",
    audience_segments: "",
    output_formats: "both",
    pdf_layout: "4_per_page",
    print_ready: false,
    status: "draft",
    notes: "",
    ...template,
  });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleCardSizeChange(val) {
    const spec = CARD_SIZES.find(s => s.value === val);
    setForm(f => ({ ...f, card_size: val, pdf_layout: spec?.defaultLayout ?? "1_per_page" }));
  }

  async function save() {
    if (!form.name.trim()) { alert("Template name is required."); return; }
    setSaving(true);
    try {
      isEdit ? await CardTemplate.update(template.id, form) : await CardTemplate.create(form);
      onSaved();
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8 sticky top-0 bg-[#0d1117] z-10 rounded-t-3xl">
          <h2 className="text-lg font-bold text-white">{isEdit ? "Edit Template" : "New Card Template"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center">×</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Template Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)}
              placeholder="e.g. Love Law Standard · Howard University Fall 2026"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" />
          </div>

          {/* Type + institution */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Template Type</label>
              <select value={form.template_type} onChange={e => set("template_type", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                <option value="standard">Standard (Love Law brand)</option>
                <option value="institution">Institution (custom branding)</option>
              </select>
            </div>
            {form.template_type === "institution" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Institution</label>
                <select value={form.institution_id} onChange={e => set("institution_id", e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                  <option value="">— select —</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Template File
              <span className="ml-2 text-gray-500 normal-case font-normal">Flatten all layers before exporting from Adobe or Canva</span>
            </label>
            <UploadZone onUploaded={({ url, type }) => { set("template_file_url", url); set("template_file_type", type); }} />
            {form.template_file_url && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-emerald-400">✓ File uploaded</span>
                <a href={form.template_file_url} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline">View file ↗</a>
              </div>
            )}
          </div>

          {/* Card size */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Card Size</label>
            <CardSizePicker value={form.card_size} onChange={handleCardSizeChange} />
          </div>

          {/* PDF layout */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              PDF Layout
              <span className="ml-2 text-gray-500 normal-case font-normal">How cards are arranged on the printed 8.5×11 page</span>
            </label>
            <PdfLayoutPicker cardSize={form.card_size} value={form.pdf_layout}
              onChange={v => set("pdf_layout", v)} />
          </div>

          {/* Output format */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Output Formats</label>
            <div className="flex gap-3 flex-wrap">
              {OUTPUT_FORMATS.map(o => (
                <label key={o.value} className={`flex items-center gap-2 rounded-xl border px-4 py-2 cursor-pointer transition-all ${
                  form.output_formats === o.value
                    ? "border-blue-500 bg-blue-900/20 text-white"
                    : "border-white/10 text-gray-400 hover:border-blue-500/30"
                }`}>
                  <input type="radio" name="output_formats" value={o.value}
                    checked={form.output_formats === o.value}
                    onChange={() => set("output_formats", o.value)}
                    className="accent-blue-500" />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Placeholders */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Placeholders
              <span className="ml-2 text-gray-500 normal-case font-normal">Must match exactly what's typed in your design file</span>
            </label>
            <div className="bg-black/30 rounded-2xl p-4 grid grid-cols-2 gap-3">
              {[
                ["code_placeholder",             "Code",        "{{CODE}}"],
                ["segment_placeholder",          "Segment",     "{{SEGMENT}}"],
                ["duration_placeholder",         "Duration",    "{{DURATION}}"],
                ["institution_name_placeholder", "Institution", "{{INSTITUTION}}"],
              ].map(([key, lbl, def]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{lbl}</label>
                  <input value={form[key] || def} onChange={e => set(key, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-blue-200 focus:outline-none focus:border-blue-500 transition" />
                </div>
              ))}
            </div>
          </div>

          {/* Segments + status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Audience Segments</label>
              <input value={form.audience_segments} onChange={e => set("audience_segments", e.target.value)}
                placeholder="bar-prep, attorney, 1L"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Print-ready toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.print_ready ? "bg-blue-600" : "bg-gray-700"}`}
              onClick={() => set("print_ready", !form.print_ready)}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.print_ready ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <div>
              <p className="text-sm text-gray-200 font-medium">Include bleed + crop marks</p>
              <p className="text-xs text-gray-500">Required when sending files to a professional print shop</p>
            </div>
          </label>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              rows={2} placeholder="Internal notes about this template…"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none transition" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/8 sticky bottom-0 bg-[#0d1117] rounded-b-3xl">
          <button onClick={onClose} className="px-5 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-6 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Designer Guide ─────────────────────────────────────────────────────────
function DesignerGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-blue-700/30 bg-blue-900/10 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-900/15 transition text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎨</span>
          <div>
            <p className="font-semibold text-white text-sm">Designer Setup Guide</p>
            <p className="text-xs text-gray-400">Card sizes, export settings, and placeholder instructions</p>
          </div>
        </div>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-blue-700/20 flex flex-col gap-4 mt-0 pt-4">

          {/* Size table */}
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/4">
                  <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-semibold uppercase">Size</th>
                  <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-semibold uppercase">Dimensions</th>
                  <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-semibold uppercase">Pixels @ 300 DPI</th>
                  <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-semibold uppercase">Per Page</th>
                  <th className="text-left px-4 py-2.5 text-xs text-gray-400 font-semibold uppercase">Layout</th>
                </tr>
              </thead>
              <tbody>
                {CARD_SIZES.map((s, i) => (
                  <tr key={s.value} className={i < CARD_SIZES.length - 1 ? "border-b border-white/5" : ""}>
                    <td className="px-4 py-3 text-white font-medium">{s.label}</td>
                    <td className="px-4 py-3 font-mono text-blue-300">{s.dims}</td>
                    <td className="px-4 py-3 font-mono text-gray-300 text-xs">{s.px}</td>
                    <td className="px-4 py-3 text-amber-300 font-semibold">{s.perPage}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">Export Format</p>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Adobe:</strong> Export as PNG @ 300 DPI, or Save as PDF (flatten all layers).
              </p>
              <p className="text-sm text-gray-300 mt-1.5">
                <strong className="text-white">Canva:</strong> Download → PDF Print or PNG at highest quality.
              </p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">Institution Templates</p>
              <p className="text-xs text-gray-400">
                Select "Institution" type and link it to an institution record.
                Their logo and accent color (set on the Enterprise page) apply automatically at generation time.
              </p>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-3">
              Placeholders — type these exactly in your design
            </p>
            <div className="flex flex-wrap gap-2">
              {["{{CODE}}", "{{SEGMENT}}", "{{DURATION}}", "{{INSTITUTION}}"].map(ph => (
                <span key={ph} className="font-mono text-sm bg-blue-900/50 text-blue-200 border border-blue-700/50 px-3 py-1.5 rounded-lg">
                  {ph}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Place each one as a text element in your design where you want that value to appear.
              The generator finds and replaces them at card generation time.
            </p>
            <p className="text-xs text-amber-300 mt-1.5">
              Tip: Put <span className="font-mono">{"{{CODE}}"}</span> in a monospace font on a dark or solid background — that's where the real access code renders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FilterGroup ────────────────────────────────────────────────────────────
function FilterGroup({ options, value, onChange, labels = {} }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-4 py-1.5 text-xs font-medium capitalize transition ${
            value === o ? "bg-blue-600 text-white" : "bg-white/4 text-gray-400 hover:bg-white/8"
          }`}>
          {labels[o] || o}
        </button>
      ))}
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function CardTemplates() {
  const [templates,    setTemplates]    = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [filterType,   setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSize,   setFilterSize]   = useState("all");

  async function load() {
    setLoading(true);
    const [t, i] = await Promise.all([CardTemplate.list(), Institution.list()]);
    setTemplates(t);
    setInstitutions(i);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(tmpl) {
    if (!confirm(`Delete "${tmpl.name}"? This cannot be undone.`)) return;
    await CardTemplate.delete(tmpl.id);
    load();
  }

  async function handleActivate(tmpl) {
    await CardTemplate.update(tmpl.id, { status: "active" });
    load();
  }

  const filtered = templates.filter(t => {
    if (filterType   !== "all" && t.template_type !== filterType)   return false;
    if (filterStatus !== "all" && t.status        !== filterStatus) return false;
    if (filterSize   !== "all" && t.card_size     !== filterSize)   return false;
    return true;
  });

  const counts = {
    total:       templates.length,
    active:      templates.filter(t => t.status === "active").length,
    draft:       templates.filter(t => t.status === "draft").length,
    institution: templates.filter(t => t.template_type === "institution").length,
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "linear-gradient(135deg, #0A0F1E 0%, #0d1a2e 100%)" }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Card Templates</h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload designed templates · 3 sizes · configure PDF layout · assign to institutions
            </p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg">
            <span className="text-lg leading-none">+</span> New Template
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Templates", value: counts.total,       color: "text-white" },
            { label: "Active",          value: counts.active,      color: "text-emerald-400" },
            { label: "Drafts",          value: counts.draft,       color: "text-amber-400" },
            { label: "Institution",     value: counts.institution, color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl bg-white/4 border border-white/8 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Designer guide */}
        <DesignerGuide />

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <FilterGroup options={["all","standard","institution"]} value={filterType}   onChange={setFilterType} />
          <FilterGroup options={["all","active","draft","archived"]} value={filterStatus} onChange={setFilterStatus} />
          <FilterGroup
            options={["all","letter","half_letter","business_card"]}
            value={filterSize} onChange={setFilterSize}
            labels={{ letter: "Letter", half_letter: "Half Letter", business_card: "Business Card" }}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl opacity-30">🎨</div>
            <p className="text-gray-300 text-base font-medium">No templates yet</p>
            <p className="text-gray-500 text-sm max-w-md">
              Design your card in Adobe or Canva, export as PNG or PDF, then upload it here.
              The generator stamps the real codes in at generation time.
            </p>
            <button onClick={() => { setEditing(null); setShowModal(true); }}
              className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition">
              Upload First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(t => (
              <TemplateCard key={t.id} tmpl={t} institutions={institutions}
                onEdit={tmpl => { setEditing(tmpl); setShowModal(true); }}
                onDelete={handleDelete}
                onActivate={handleActivate} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TemplateModal
          template={editing}
          institutions={institutions}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={() => { setShowModal(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
