/**
 * trialConversion
 * ══════════════════════════════════════════════════════════════════════════
 * Handles the trial → paid conversion drip sequence.
 * Called by a scheduled automation that runs daily alongside the morning send.
 *
 * Trial Flow:
 *   Days 1–7:   trial messages send normally (picked up by daily send)
 *   Day 7 EOD:  this function detects day=7, status=trial → sends conversion msg 1
 *   Day 9:      conversion msg 2 (social proof)
 *   Day 12:     conversion msg 3 (final + discount code)
 *   Day 14:     if still trial → send final "last chance" + pause sequence
 *
 * If subscriber converts (status changes to "active") at any point:
 *   → Resets current_day_number to 1
 *   → Sends welcome-to-full-membership message
 *   → Full 90-day sequence begins
 */

import { createClient } from "npm:@base44/sdk@0.8.25";

const GHL_API_BASE  = "https://services.leadconnectorhq.com";
const SUBSCRIBE_URL = "https://shoplovelaw.com/subscribe";

const CONVERSION_MESSAGES: Record<number, { text: string; discount?: string }> = {
  7: {
    text: `Your 7-day trial is almost up — and you've been showing up every morning. That matters. ⚖️\n\nDon't lose your streak. Keep the Daily Dose of Justice coming for just $7.99/month.\n\nContinue your journey: ${SUBSCRIBE_URL}\n\nReply STOP to unsubscribe anytime.`,
  },
  9: {
    text: `"I almost quit. Then my Daily Dose of Justice showed up." — That's a real subscriber.\n\nHundreds of law students and attorneys start every morning with Love Law™. 🏛️\n\nYour subscription: ${SUBSCRIBE_URL}\n\n$7.99/month. Cancel anytime.`,
  },
  12: {
    text: `Last chance to lock in your Daily Dose. 💙\n\nUse code LOVELAW10 for 10% off your first month.\n\n${SUBSCRIBE_URL}\n\nYou've already built the habit. Don't let it go.`,
    discount: "LOVELAW10",
  },
  14: {
    text: `Your trial has ended. 🤍\n\nWe'll miss showing up in your mornings. Whenever you're ready to continue your legal journey with daily motivation, we'll be here.\n\nRestart anytime: ${SUBSCRIBE_URL}\n\nReply LAW to restart your trial.`,
  },
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const base44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") || "" });
  const GHL_API_KEY     = Deno.env.get("GHL_API_KEY")     || "";
  const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID") || "";

  const hdrs = {
    "Authorization": `Bearer ${GHL_API_KEY}`,
    "Content-Type":  "application/json",
    "Version":       "2021-07-28",
  };

  // Fetch all trial subscribers
  const trials = await base44.asServiceRole.entities.Subscriber.filter({
    subscription_status: "trial"
  });

  const results: any[] = [];

  for (const sub of trials) {
    const day = sub.current_day_number || 0;

    // Check if this day has a conversion message
    const convMsg = CONVERSION_MESSAGES[day];
    if (!convMsg) continue;

    // Day 14 — end trial
    if (day >= 14) {
      await base44.asServiceRole.entities.Subscriber.update(sub.id, {
        subscription_status: "cancelled",
        notes: `Trial ended at day ${day} on ${new Date().toISOString()}`
      });
    }

    // Send via GHL if contact is synced
    if (sub.ghl_contact_id) {
      try {
        // Find or create conversation
        const convoRes = await fetch(
          `${GHL_API_BASE}/conversations/search?locationId=${GHL_LOCATION_ID}&contactId=${sub.ghl_contact_id}`,
          { headers: hdrs }
        );
        const convoData = await convoRes.json();
        let conversationId = convoData?.conversations?.[0]?.id;

        if (!conversationId) {
          const newConvo = await fetch(`${GHL_API_BASE}/conversations/`, {
            method: "POST", headers: hdrs,
            body: JSON.stringify({ locationId: GHL_LOCATION_ID, contactId: sub.ghl_contact_id }),
          });
          const nc = await newConvo.json();
          conversationId = nc?.conversation?.id || nc?.id;
        }

        if (conversationId) {
          await fetch(`${GHL_API_BASE}/conversations/messages`, {
            method: "POST", headers: hdrs,
            body: JSON.stringify({
              type: "SMS",
              message: convMsg.text,
              conversationId,
            }),
          });
          results.push({ subscriber_id: sub.id, day, status: "sent" });
        }
      } catch (e: any) {
        results.push({ subscriber_id: sub.id, day, status: "error", error: e.message });
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { status: 200 });
}
