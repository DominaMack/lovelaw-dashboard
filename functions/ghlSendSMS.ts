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
    const { ghl_contact_id, message_text, message_id, from_number } = body;

    if (!ghl_contact_id || !message_text) {
      return Response.json({ error: "ghl_contact_id and message_text are required" }, { status: 400 });
    }

    // Search for existing conversation
    const convoRes = await fetch(
      `${GHL_API_BASE}/conversations/search?locationId=${GHL_LOCATION_ID}&contactId=${ghl_contact_id}`,
      { headers: hdrs }
    );
    const convoData = await convoRes.json();
    let conversationId = convoData?.conversations?.[0]?.id;

    // Create conversation if none exists
    if (!conversationId) {
      const newConvoRes = await fetch(`${GHL_API_BASE}/conversations/`, {
        method: "POST", headers: hdrs,
        body: JSON.stringify({ locationId: GHL_LOCATION_ID, contactId: ghl_contact_id }),
      });
      const newConvo = await newConvoRes.json();
      conversationId = newConvo?.conversation?.id || newConvo?.id;
    }

    if (!conversationId) {
      return Response.json({ error: "Could not find or create GHL conversation" }, { status: 500 });
    }

    // Send SMS
    const msgPayload: any = {
      type: "SMS",
      message: message_text,
      conversationId,
    };
    if (from_number) msgPayload.fromNumber = from_number;

    const sendRes = await fetch(`${GHL_API_BASE}/conversations/messages`, {
      method: "POST", headers: hdrs, body: JSON.stringify(msgPayload),
    });
    const sendResult = await sendRes.json();

    // Mark message as sent in our DB
    if (message_id) {
      await base44.asServiceRole.entities.Message.update(message_id, {
        approval_status: "sent"
      });
    }

    return Response.json({
      success: true,
      conversationId,
      messageId: sendResult?.messageId || sendResult?.id,
      result: sendResult,
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
