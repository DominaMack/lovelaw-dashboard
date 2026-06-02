import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { code, first_name, last_name, phone_number, email, audience_segment, focus_track, language } = body;

    if (!code || !phone_number || !first_name) {
      return Response.json({ success: false, error: "Code, first name, and phone number are required." }, { status: 400, headers: corsHeaders });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Look up the access code
    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode });

    if (!codes || codes.length === 0) {
      return Response.json({ success: false, error: "Invalid access code. Please check and try again." }, { status: 404, headers: corsHeaders });
    }

    const accessCode = codes[0];

    if (accessCode.status === "redeemed") {
      return Response.json({ success: false, error: "This code has already been redeemed." }, { status: 409, headers: corsHeaders });
    }

    if (accessCode.status === "voided") {
      return Response.json({ success: false, error: "This code has been voided and is no longer valid." }, { status: 410, headers: corsHeaders });
    }

    if (accessCode.status === "expired" || (accessCode.expires_at && new Date(accessCode.expires_at) < new Date())) {
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, { status: "expired" });
      return Response.json({ success: false, error: "This code has expired. Please contact support at hello@shoplovelaw.com." }, { status: 410, headers: corsHeaders });
    }

    // Resolve final segment and track
    const finalSegment = (accessCode.audience_segment === "any" ? audience_segment : accessCode.audience_segment) || "bar-prep";
    const finalTrack = (accessCode.focus_track === "any" ? focus_track : accessCode.focus_track) || "focus-standard";
    const finalLanguage = language || "en";
    const daysOfAccess = accessCode.days_of_access || 90;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysOfAccess);

    // Check for existing subscriber with same phone
    const existingList = await base44.asServiceRole.entities.Subscriber.filter({ phone_number: phone_number.trim() });

    let subscriberId: string;

    if (existingList && existingList.length > 0) {
      const existing = existingList[0];
      await base44.asServiceRole.entities.Subscriber.update(existing.id, {
        subscription_status: "active",
        subscription_tier: accessCode.subscription_tier || "standard",
        audience_segment: finalSegment,
        focus_track: finalTrack,
        language: finalLanguage,
        current_day_number: 1,
        notes: `Reactivated via access code ${normalizedCode} on ${new Date().toISOString()}`,
      });
      subscriberId = existing.id;
    } else {
      const newSub = await base44.asServiceRole.entities.Subscriber.create({
        first_name: first_name.trim(),
        last_name: (last_name || "").trim(),
        phone_number: phone_number.trim(),
        email: (email || "").trim(),
        audience_segment: finalSegment,
        focus_track: finalTrack,
        language: finalLanguage,
        subscription_status: "active",
        subscription_tier: accessCode.subscription_tier || "standard",
        subscriber_type: "consumer",
        current_day_number: 1,
        emotional_state: "standard",
        distress_flag_count: 0,
        notes: `Activated via access code ${normalizedCode} on ${new Date().toISOString()}`,
      });
      subscriberId = newSub.id;
    }

    // Mark code as redeemed
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      status: "redeemed",
      redeemed_by: subscriberId,
      redeemed_at: new Date().toISOString(),
      redeemed_phone: phone_number.trim(),
    });

    return Response.json({
      success: true,
      message: "Your access has been activated! Welcome to Daily Dose of Justice™. Your first message arrives tomorrow morning.",
      subscriber_id: subscriberId,
      segment: finalSegment,
      track: finalTrack,
      days_of_access: daysOfAccess,
      access_ends: endDate.toISOString().split("T")[0],
    }, { status: 200, headers: corsHeaders });

  } catch (err) {
    console.error("Redemption error:", err);
    return Response.json({ success: false, error: "Something went wrong. Please try again or contact hello@shoplovelaw.com." }, { status: 500, headers: corsHeaders });
  }
});
