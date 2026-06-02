import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "POST only" }, { status: 405, headers: corsHeaders });

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) return Response.json({ error: "id is required" }, { status: 400, headers: corsHeaders });

    // Whitelist of updatable fields
    const allowed = [
      "first_name","last_name","phone_number","email",
      "audience_segment","focus_track","identity_track","language",
      "subscription_status","subscription_tier","subscriber_type",
      "institution_id","add_ons","current_day_number","bar_exam_date",
      "emotional_state","distress_flag_count","last_reply","ghl_contact_id","notes"
    ];

    const update: Record<string, any> = {};
    for (const key of allowed) {
      if (fields[key] !== undefined) update[key] = fields[key];
    }

    if (Object.keys(update).length === 0) {
      return Response.json({ error: "No valid fields to update" }, { status: 400, headers: corsHeaders });
    }

    const result = await base44.asServiceRole.entities.Subscriber.update(id, update);
    return Response.json({ success: true, record: result }, { headers: corsHeaders });

  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
  }
});
