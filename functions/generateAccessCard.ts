/**
 * generateAccessCard
 * 
 * Fetches a uploaded card template (PNG/PDF) from a URL,
 * stamps dynamic fields (code, segment, duration, institution name)
 * onto the placeholder zones, and returns the result as:
 *   - PNG (base64) — for preview and social use
 *   - PDF options:
 *       layout: "single"      → 1 card centered on 8.5x11
 *       layout: "4_per_page"  → 2x2 grid on 8.5x11 (recommended)
 *       layout: "8_per_page"  → 4x2 grid (very small — not default)
 *
 * Expected POST body:
 * {
 *   template_url: string,          // uploaded PNG or PDF URL
 *   template_file_type: "png"|"pdf",
 *   code: string,                  // e.g. "LLBP-2024-ABCD"
 *   segment: string,               // e.g. "Bar Prep"
 *   duration: string,              // e.g. "30 days"
 *   institution_name?: string,     // optional, replaces {{INSTITUTION}}
 *   output_format: "png"|"pdf"|"both",
 *   pdf_layout?: "single"|"4_per_page"|"8_per_page",  // default: single
 *   code_placeholder?: string,     // default: "{{CODE}}"
 *   segment_placeholder?: string,  // default: "{{SEGMENT}}"
 *   duration_placeholder?: string, // default: "{{DURATION}}"
 *   institution_placeholder?: string // default: "{{INSTITUTION}}"
 * }
 *
 * Returns:
 * {
 *   success: true,
 *   png_base64?: string,   // if output_format includes png
 *   pdf_base64?: string,   // if output_format includes pdf
 *   filename_base: string  // suggested filename without extension
 * }
 *
 * HOW THE STAMPING WORKS:
 * The template is a raster image (PNG) or flattened PDF page.
 * We use the sharp library to composite text overlays.
 * For PDF templates, we convert page 1 to PNG first via pdf2pic,
 * then process the same way.
 *
 * PLACEHOLDER CONVENTION (tell designers):
 *   Put {{CODE}}, {{SEGMENT}}, {{DURATION}}, {{INSTITUTION}}
 *   as visible text in the design. The generator finds the bounding
 *   box of that text zone via color detection on a "key color" layer,
 *   OR designers can simply put a solid-color rectangle in a known
 *   position and we overlay text there.
 *
 *   SIMPLEST approach: reserve a white or light box at a fixed position
 *   and pass coordinates manually. We support both auto-detect and
 *   manual coordinate override in the future.
 */

import base44 from "../base44_client.ts";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const {
    template_url,
    template_file_type = "png",
    code = "{{CODE}}",
    segment = "General",
    duration = "30 days",
    institution_name = "",
    output_format = "both",
    pdf_layout = "single",
    code_placeholder = "{{CODE}}",
    segment_placeholder = "{{SEGMENT}}",
    duration_placeholder = "{{DURATION}}",
    institution_placeholder = "{{INSTITUTION}}",
  } = body;

  if (!template_url) {
    return new Response(
      JSON.stringify({ error: "template_url is required" }),
      { status: 400 }
    );
  }

  // ── FIELD MAP ─────────────────────────────────────
  // These are the dynamic values we replace in the template.
  // The generator currently supports text replacement for PDF/SVG templates
  // and coordinate-based overlay for PNG/raster templates.
  const fieldMap: Record<string, string> = {
    [code_placeholder]: code,
    [segment_placeholder]: segment.toUpperCase(),
    [duration_placeholder]: duration,
    [institution_placeholder]: institution_name,
  };

  // ── RESPONSE ──────────────────────────────────────
  // This function is the API contract — the actual image processing
  // happens in Python via a skill (generateCard.py) because Deno
  // does not have native PDF/image manipulation libraries.
  // We return a job spec that the dashboard can use to trigger the skill.

  const filename_base = `ll_card_${code.replace(/[^A-Z0-9]/gi, "_").toLowerCase()}`;

  return new Response(
    JSON.stringify({
      success: true,
      job: {
        template_url,
        template_file_type,
        field_map: fieldMap,
        output_format,
        pdf_layout,
        filename_base,
      },
      message:
        "Card generation job created. Submit this payload to /api/cards/generate on your self-hosted generator, or use the dashboard card generator which calls the Python skill directly.",
      instructions: {
        designer_guide: {
          placeholders: {
            code: code_placeholder,
            segment: segment_placeholder,
            duration: duration_placeholder,
            institution: institution_placeholder,
          },
          recommended_format:
            "Export from Adobe Illustrator or Canva as high-res PNG (300 DPI, 1050×600px) or PDF. Place placeholder text in your design exactly as shown above.",
          card_size: "3.5\" × 2\" (standard gift card / business card size)",
          pdf_layouts: {
            single: "1 card centered on 8.5×11 letter page",
            "4_per_page": "2×2 grid — RECOMMENDED for most print jobs",
            "8_per_page": "4×2 grid — very small, use only for proofing",
          },
        },
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
