import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_API_BASE = "https://services.leadconnectorhq.com";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const GHL_API_KEY = Deno.env.get("GHL_API_KEY");
    const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID");

    const hdrs = {
      "Authorization": `Bearer ${GHL_API_KEY}`,
      "Content-Type": "application/json",
      "Version": "2021-07-28",
    };

    const body = await req.json().catch(() => ({}));
    const { subscriber } = body;

    if (!subscriber) {
      return Response.json({ error: "subscriber object is required" }, { status: 400 });
    }

    const {
      first_name, last_name, email, phone_number,
      audience_segment, focus_track, identity_track,
      emotional_state, current_day_number,
      subscription_status, subscription_tier,
      add_ons, language, ghl_contact_id, id: subscriberId
    } = subscriber;

    const lang = language || "en";

    const payload: any = {
      locationId: GHL_LOCATION_ID,
      firstName: first_name || "",
      lastName: last_name || "",
      email: email || "",
      phone: phone_number || "",
      tags: [
        audience_segment  ? `segment:${audience_segment}`   : null,
        focus_track       ? `track:${focus_track}`          : null,
        identity_track    ? `identity:${identity_track}`    : null,  // optional
        subscription_status ? `status:${subscription_status}` : null,
        subscription_tier   ? `tier:${subscription_tier}`   : null,
        `lang:${lang}`,
      ].filter(Boolean),
      customFields: [
        { key: "audience_segment",   field_value: audience_segment   || "" },
        { key: "focus_track",        field_value: focus_track        || "" },
        { key: "identity_track",     field_value: identity_track     || "" },  // blank if not selected
        { key: "emotional_state",    field_value: emotional_state    || "standard" },
        { key: "current_day_number", field_value: String(current_day_number || 1) },
        { key: "subscription_status",field_value: subscription_status || "" },
        { key: "subscription_tier",  field_value: subscription_tier  || "" },
        { key: "add_ons",            field_value: add_ons            || "" },
        { key: "language",           field_value: lang },
      ],
    };

    let result: any;
    let action: string;

    if (ghl_contact_id) {
      const r = await fetch(`${GHL_API_BASE}/contacts/${ghl_contact_id}`, {
        method: "PUT", headers: hdrs, body: JSON.stringify(payload),
      });
      result = await r.json();
      action = "updated";
      await fetch(`${GHL_API_BASE}/contacts/${ghl_contact_id}/tags`, {
        method: "POST", headers: hdrs, body: JSON.stringify({ tags: payload.tags }),
      });
    } else {
      const r = await fetch(`${GHL_API_BASE}/contacts/`, {
        method: "POST", headers: hdrs, body: JSON.stringify(payload),
      });
      result = await r.json();
      action = "created";
    }

    const newGhlId = result?.contact?.id || result?.id || ghl_contact_id || null;

    if (newGhlId && subscriberId && action === "created") {
      await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
        ghl_contact_id: newGhlId
      });
    }

    return Response.json({ success: true, action, ghl_contact_id: newGhlId, result });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
