/**
 * inboundSMS
 * ══════════════════════════════════════════════════════════════════════════
 * Receives inbound SMS webhooks from GoHighLevel.
 * GHL sends a POST to this endpoint whenever a subscriber texts in.
 *
 * This function:
 *   1. Parses the inbound message + phone number
 *   2. Looks up the subscriber in Base44
 *   3. Routes to the correct keyword handler
 *   4. Updates subscriber record as needed
 *   5. Returns the response SMS text (GHL sends it)
 *      OR triggers an outbound via ghlSendSMS for complex flows
 *
 * GHL Webhook Setup (do once in GHL UI):
 *   Settings → Integrations → Webhooks
 *   Event: InboundMessage
 *   URL:   https://<your-base44-function-url>/inboundSMS
 *
 * Keyword Architecture:
 * ─────────────────────
 * TIER 1 — Opt-in / Navigation
 *   LAW, START, JOIN         → opt-in / restart
 *   STOP                     → unsubscribe (TCPA)
 *   PAUSE                    → pause subscription
 *   RESUME                   → resume subscription
 *   FAITH                    → switch to faith track
 *   STANDARD                 → switch to standard track
 *   RESTART                  → reset day counter to day 1
 *
 * TIER 2 — Emotional Support
 *   STRESSED, STRESS         → calming + resources
 *   OVERWHELMED              → breathing + grounding
 *   TIRED, EXHAUSTED         → rest permission + encouragement
 *   ANXIOUS, ANXIETY         → mindfulness prompt
 *   BURNT OUT, BURNOUT       → burnout support track switch offer
 *
 * TIER 3 — Escalation / Crisis
 *   QUIT, GIVING UP          → resilience intervention + flag
 *   HELP                     → menu of resources
 *   CRISIS, EMERGENCY        → crisis line + immediate flag to DC
 *
 * TIER 4 — Celebration
 *   PASSED, I PASSED         → celebration sequence
 *   GRADUATED                → graduation celebration
 *   GOT THE JOB              → career win celebration
 *
 * TIER 5 — Commerce
 *   MERCH, SHOP, APPAREL     → apparel link + current drop
 *   GIFT                     → gift card info
 *
 * TIER 6 — Info
 *   INFO, ABOUT              → what is Love Law
 *   LEGAL                    → legal disclaimer
 *   UPGRADE                  → subscription upgrade info
 */

import { createClient } from "npm:@base44/sdk@0.8.25";

const GHL_API_BASE    = "https://services.leadconnectorhq.com";
const SHOP_URL        = "https://shoplovelaw.com";
const REDEEM_URL      = "https://shoplovelaw.com/redeem";
const SUBSCRIBE_URL   = "https://shoplovelaw.com/subscribe";
const MERCH_URL       = "https://shoplovelaw.com/shop";
const CRISIS_LINE     = "988";  // Suicide & Crisis Lifeline
const CRISIS_TEXT     = "Text HOME to 741741";  // Crisis Text Line

// ── Keyword response library ───────────────────────────────────────────────
const KEYWORD_RESPONSES: Record<string, string> = {

  // ── Opt-in / Navigation ────────────────────────────────────────────────
  LAW: `Welcome to Love Law™ Daily Dose of Justice! 🏛️\n\nYou're about to receive daily motivation built specifically for the legal journey.\n\nYour 7-day free trial starts tomorrow morning.\n\nReply:\nFAITH — faith-based track\nSTANDARD — standard track\n\nMsg & data rates may apply. Reply STOP to unsubscribe.`,

  START: `You're back — and that matters. 🏛️\n\nYour Daily Dose of Justice starts again tomorrow morning.\n\nStay in it. The law needs you.`,

  PAUSE: `Got it. Your messages are paused. 🤝\n\nWhenever you're ready, reply RESUME and we'll pick right back up where you left off.\n\nThe journey is still yours.`,

  RESUME: `Welcome back. Your messages resume tomorrow morning. 💙\n\nYou didn't quit — you rested. That's different.`,

  RESTART: `Starting fresh from Day 1 tomorrow morning. 🏛️\n\nSometimes a reset is exactly what the journey needs.`,

  FAITH: `Switched to the faith-based track. ✝️🕌✡️\n\nYour messages will now carry a spiritual foundation.\n\nThe law and your faith were made to walk together.`,

  STANDARD: `Switched to the standard track. 🏛️\n\nBack to the core Daily Dose of Justice sequence starting tomorrow.`,

  // ── Emotional support ──────────────────────────────────────────────────
  STRESSED: `That feeling is real — and you're not alone in it. 💙\n\nTake 5 deep breaths right now. In for 4, hold for 4, out for 4.\n\nYou do not have to solve everything today. One step. One hour. One page.\n\nWe've got you. Your message drops tomorrow morning as scheduled.`,

  OVERWHELMED: `Stop. Breathe. You're still here — that's enough for right now. 🤍\n\nWrite down the ONE thing that has to get done today. Just one.\n\nEverything else can wait. You are not behind. You are exactly where you need to be.\n\nYour message drops tomorrow morning.`,

  TIRED: `Tired means you've been working hard. That's not failure — that's evidence. 💙\n\nRest is not surrender. Rest is strategy.\n\nGive yourself permission to stop today. The bar will still be there tomorrow. So will you.`,

  EXHAUSTED: `Tired means you've been working hard. That's not failure — that's evidence. 💙\n\nRest is not surrender. Rest is strategy.\n\nGive yourself permission to stop today. The bar will still be there tomorrow. So will you.`,

  ANXIOUS: `Anxiety is just your brain preparing you for something important. 🧠💙\n\nRight now: name 5 things you can see. 4 you can touch. 3 you can hear.\n\nYou're grounded. You're capable. You've gotten this far.\n\nYour message drops tomorrow morning.`,

  ANXIETY: `Anxiety is just your brain preparing you for something important. 🧠💙\n\nRight now: name 5 things you can see. 4 you can touch. 3 you can hear.\n\nYou're grounded. You're capable. You've gotten this far.`,

  BURNOUT: `Burnout is your body asking for what it needs. Listen to it. 🤍\n\nWould you like us to switch you to the Burnout Support track? These messages are specifically designed for when you're running on empty.\n\nReply YES to switch, or just rest — we'll keep showing up either way.`,

  // ── Crisis / Escalation ────────────────────────────────────────────────
  QUIT: `Please don't — not today. 💙\n\nEvery person who passed the bar almost quit first. That feeling you're having right now? It's normal. It's not the truth.\n\nIf you need to talk to someone right now, please reach out:\n📞 ${CRISIS_LINE} (call or text)\n📱 ${CRISIS_TEXT}\n\nWe're flagging this so a real person can follow up with you. You matter far beyond any exam.`,

  HELP: `Here's what Love Law™ can do for you right now:\n\nSTRESSED — stress support message\nQUIT — crisis resources\nPAUSE — pause your messages\nFAITH — switch to faith track\nSHOP — browse our apparel\nINFO — learn about Love Law\nSTOP — unsubscribe\n\nYou can also reply with anything on your mind — we read every message.`,

  CRISIS: `You matter more than any exam or career. 💙\n\nPlease reach out right now:\n📞 Crisis Line: ${CRISIS_LINE} (call or text)\n📱 Crisis Text: ${CRISIS_TEXT}\n\nA Love Law team member is being notified. You are not alone.`,

  // ── Celebration ────────────────────────────────────────────────────────
  PASSED: `YOU PASSED!!! 🎉🏛️⚖️\n\nThis is what we've been showing up for every single morning. YOU DID IT.\n\nEsquire. Counselor. Attorney at Law.\n\nCelebrate yourself — you earned every bit of this.\n\nNow go celebrate. The apparel that matches this moment: ${MERCH_URL}`,

  GRADUATED: `CONGRATULATIONS COUNSELOR! 🎓⚖️\n\nLaw school is done. You showed up every day and you made it through.\n\nThe next chapter starts now — and we'll be right here with you.\n\nCheck out the graduation collection: ${MERCH_URL}`,

  // ── Commerce ───────────────────────────────────────────────────────────
  MERCH: `The Love Law™ collection — built for the legal journey. 👔⚖️\n\nShop now: ${MERCH_URL}\n\nFrom bar prep to bar admission — wear the journey.`,

  SHOP: `Shop Love Law™: ${MERCH_URL} 🛍️\n\nBuilt for lawyers, by someone who lived it. Every piece tells the story.`,

  APPAREL: `Shop Love Law™: ${MERCH_URL} 🛍️\n\nBuilt for lawyers, by someone who lived it. Every piece tells the story.`,

  GIFT: `Give the gift of daily motivation. 🎁\n\nLove Law™ gift subscriptions:\n• 7-day trial\n• 30-day\n• 90-day\n• Annual\n\nPerfect for law students, bar preppers, and new attorneys.\n\nGet a gift card: ${SHOP_URL}/gift`,

  // ── Info ───────────────────────────────────────────────────────────────
  INFO: `Love Law™ Daily Dose of Justice™ 🏛️\n\nA daily SMS motivation subscription built specifically for the legal journey.\n\n$7.99/month · Cancel anytime\n\nFor bar prep students, law students, and attorneys who need a daily reminder that they belong in this profession.\n\nLearn more: ${SHOP_URL}`,

  UPGRADE: `Ready to go premium? 💙\n\nUpgrade your Love Law™ subscription for additional tracks, weekly planning messages, and Friday reflections.\n\nLearn more: ${SUBSCRIBE_URL}\n\nOr reply with questions — we'll help you find the right fit.`,

  LEGAL: `Love Law™ is a motivational content service. We are not a law firm and do not provide legal advice.\n\nFor legal emergencies, contact an attorney or your local bar association.\n\nMsg & data rates may apply. Reply STOP to unsubscribe. Reply HELP for help.`,
};

// ── Normalize inbound message to keyword ──────────────────────────────────
function parseKeyword(rawMessage: string): string | null {
  const clean = rawMessage.trim().toUpperCase();

  // Exact matches first
  if (KEYWORD_RESPONSES[clean]) return clean;

  // Multi-word / phrase detection
  if (clean.includes("GIVING UP") || clean.includes("WANT TO QUIT") || clean.includes("CANT DO THIS"))
    return "QUIT";
  if (clean.includes("I PASSED") || clean.includes("I JUST PASSED") || clean.includes("PASSED THE BAR"))
    return "PASSED";
  if (clean.includes("BURNT OUT") || clean.includes("BURNED OUT"))
    return "BURNOUT";
  if (clean.includes("GOT THE JOB") || clean.includes("I GOT THE JOB") || clean.includes("HIRED"))
    return "GRADUATED";
  if (clean.includes("SO TIRED") || clean.includes("REALLY TIRED"))
    return "TIRED";
  if (clean.includes("SO STRESSED") || clean.includes("REALLY STRESSED") || clean.includes("IM STRESSED"))
    return "STRESSED";
  if (clean.includes("OVERWHELMED") || clean.includes("TOO MUCH"))
    return "OVERWHELMED";

  return null;
}

// ── Emotional state mapping ───────────────────────────────────────────────
const KEYWORD_TO_EMOTIONAL_STATE: Record<string, string> = {
  STRESSED:     "stressed",
  OVERWHELMED:  "overwhelmed",
  TIRED:        "stressed",
  EXHAUSTED:    "stressed",
  ANXIOUS:      "stressed",
  ANXIETY:      "stressed",
  BURNOUT:      "overwhelmed",
  QUIT:         "needs-support",
  CRISIS:       "needs-support",
  PASSED:       "celebrating",
  GRADUATED:    "celebrating",
};

// ── Distress flag tier ────────────────────────────────────────────────────
const KEYWORD_TO_DISTRESS_TIER: Record<string, string> = {
  QUIT:   "tier-2",
  CRISIS: "tier-3",
  HELP:   "tier-1",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const base44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") || "" });
  const GHL_API_KEY     = Deno.env.get("GHL_API_KEY")     || "";
  const GHL_LOCATION_ID = Deno.env.get("GHL_LOCATION_ID") || "";

  let body: any;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 }); }

  // GHL webhook payload fields
  const rawMessage   = (body.message || body.body || body.text || "").trim();
  const phoneNumber  = (body.phone   || body.from || body.contact?.phone || "").replace(/\s/g, "");
  const ghlContactId = body.contactId || body.contact?.id || "";

  if (!rawMessage || !phoneNumber) {
    return new Response(JSON.stringify({ ok: true, skipped: "no message or phone" }), { status: 200 });
  }

  // Look up subscriber
  const subscribers = await base44.asServiceRole.entities.Subscriber.filter({
    phone_number: phoneNumber
  });
  const subscriber = subscribers?.[0] || null;
  const subscriberId = subscriber?.id || null;

  const keyword = parseKeyword(rawMessage);

  // ── Handle STOP (TCPA — must honor) ──────────────────────────────────
  if (rawMessage.toUpperCase() === "STOP") {
    if (subscriberId) {
      await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
        subscription_status: "cancelled",
        notes: `Unsubscribed via STOP on ${new Date().toISOString()}`
      });
    }
    // GHL handles STOP natively — just ack
    return new Response(JSON.stringify({ ok: true, action: "unsubscribed" }), { status: 200 });
  }

  // ── Handle LAW / START / JOIN (opt-in) ───────────────────────────────
  if (["LAW", "START", "JOIN"].includes(rawMessage.toUpperCase())) {
    if (!subscriber) {
      // New subscriber — create record
      await base44.asServiceRole.entities.Subscriber.create({
        phone_number:        phoneNumber,
        ghl_contact_id:      ghlContactId,
        subscription_status: "trial",
        subscription_tier:   "standard",
        subscriber_type:     "consumer",
        current_day_number:  0,
        language:            "en",
        audience_segment:    "bar-prep",   // default — they can update via web form
        focus_track:         "focus-standard",
        emotional_state:     "standard",
        distress_flag_count: 0,
        notes:               `Opted in via SMS keyword on ${new Date().toISOString()}`
      });
    } else if (subscriber.subscription_status === "cancelled") {
      // Re-opt-in
      await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
        subscription_status: "trial",
        current_day_number:  0,
        notes: `Re-opted in via SMS keyword on ${new Date().toISOString()}`
      });
    }
    const response = KEYWORD_RESPONSES["LAW"];
    return new Response(JSON.stringify({ ok: true, reply: response, action: "optin" }), { status: 200 });
  }

  // ── Handle PAUSE ──────────────────────────────────────────────────────
  if (rawMessage.toUpperCase() === "PAUSE" && subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      subscription_status: "paused"
    });
    return new Response(JSON.stringify({ ok: true, reply: KEYWORD_RESPONSES["PAUSE"], action: "paused" }), { status: 200 });
  }

  // ── Handle RESUME ─────────────────────────────────────────────────────
  if (rawMessage.toUpperCase() === "RESUME" && subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      subscription_status: "active"
    });
    return new Response(JSON.stringify({ ok: true, reply: KEYWORD_RESPONSES["RESUME"], action: "resumed" }), { status: 200 });
  }

  // ── Handle RESTART ────────────────────────────────────────────────────
  if (rawMessage.toUpperCase() === "RESTART" && subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      current_day_number: 0
    });
    return new Response(JSON.stringify({ ok: true, reply: KEYWORD_RESPONSES["RESTART"], action: "restarted" }), { status: 200 });
  }

  // ── Handle FAITH / STANDARD track switch ─────────────────────────────
  if (rawMessage.toUpperCase() === "FAITH" && subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      focus_track: "focus-faith-based"
    });
    return new Response(JSON.stringify({ ok: true, reply: KEYWORD_RESPONSES["FAITH"], action: "track_switch" }), { status: 200 });
  }
  if (rawMessage.toUpperCase() === "STANDARD" && subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      focus_track: "focus-standard"
    });
    return new Response(JSON.stringify({ ok: true, reply: KEYWORD_RESPONSES["STANDARD"], action: "track_switch" }), { status: 200 });
  }

  // ── Handle BURNOUT YES ────────────────────────────────────────────────
  if (rawMessage.toUpperCase() === "YES" && subscriberId &&
      subscriber?.emotional_state === "overwhelmed") {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      focus_track: "focus-burnout-support"
    });
    return new Response(JSON.stringify({
      ok: true,
      reply: "Switched to Burnout Support track. 🤍 Your messages will meet you exactly where you are. Rest is part of the journey.",
      action: "track_switch"
    }), { status: 200 });
  }

  // ── Handle emotional keywords ─────────────────────────────────────────
  if (keyword) {
    const emotionalState = KEYWORD_TO_EMOTIONAL_STATE[keyword];
    const distressTier   = KEYWORD_TO_DISTRESS_TIER[keyword];
    const replyText      = KEYWORD_RESPONSES[keyword] || "";

    // Update subscriber emotional state
    if (subscriberId && emotionalState) {
      await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
        emotional_state:     emotionalState,
        last_reply:          rawMessage,
        distress_flag_count: (subscriber?.distress_flag_count || 0) + (distressTier ? 1 : 0),
      });
    }

    // Create distress flag for escalation keywords
    if (distressTier && subscriberId) {
      await base44.asServiceRole.entities.DistressFlag.create({
        subscriber_id:    subscriberId,
        institution_id:   subscriber?.institution_id || "",
        trigger_keyword:  keyword,
        full_message:     rawMessage,
        tier:             distressTier,
        status:           "new",
        response_sent:    true,
        response_text:    replyText,
        notes:            `Auto-detected via inbound SMS keyword on ${new Date().toISOString()}`
      });
    }

    return new Response(JSON.stringify({ ok: true, reply: replyText, action: "keyword", keyword }), { status: 200 });
  }

  // ── No keyword matched — log last reply ──────────────────────────────
  if (subscriberId) {
    await base44.asServiceRole.entities.Subscriber.update(subscriberId, {
      last_reply: rawMessage
    });
  }

  // Default: no auto-reply for unrecognized messages
  return new Response(JSON.stringify({ ok: true, action: "logged", reply: null }), { status: 200 });
}
