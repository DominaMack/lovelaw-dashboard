# Love Law™ GHL Snapshot Blueprint
## Daily Dose of Justice™ — Complete Automation Architecture
## Version 1.0 · June 2026

This document is the complete build guide for the Love Law™ GoHighLevel snapshot.
Everything in this file goes in one folder called **"Love Law™ — Daily Dose of Justice™"**.
When migrating to a new subaccount, export as snapshot and import. Update API key + Location ID in Base44 secrets only.

---

## FOLDER STRUCTURE IN GHL
```
📁 Love Law™ — Daily Dose of Justice™
  ├── 📁 Opt-In & Onboarding
  │     ├── WF-01  Keyword Opt-In (LAW)
  │     ├── WF-02  Welcome Sequence (Days 1–7 Trial)
  │     └── WF-03  Segment Selection (post opt-in)
  ├── 📁 Trial Conversion
  │     ├── WF-04  Trial Day 7 — Soft Conversion
  │     ├── WF-05  Trial Day 9 — Social Proof
  │     ├── WF-06  Trial Day 12 — Discount Offer
  │     └── WF-07  Trial Day 14 — Final Goodbye
  ├── 📁 Daily Send (Active Subscribers)
  │     └── WF-08  Daily Morning Send (Base44-triggered)
  ├── 📁 Emotional Keywords
  │     ├── WF-09  STRESSED / OVERWHELMED / TIRED
  │     ├── WF-10  QUIT / CRISIS (Escalation)
  │     └── WF-11  PASSED / GRADUATED (Celebration)
  ├── 📁 Track Management
  │     ├── WF-12  FAITH keyword → faith track tag
  │     ├── WF-13  STANDARD keyword → standard track tag
  │     ├── WF-14  BURNOUT → burnout support offer
  │     └── WF-15  PAUSE / RESUME / RESTART
  ├── 📁 Commerce
  │     ├── WF-16  MERCH / SHOP / APPAREL keyword
  │     ├── WF-17  GIFT keyword
  │     └── WF-18  Milestone Merch Upsell (Day 30, 60, 90)
  └── 📁 Compliance
        ├── WF-19  STOP (TCPA unsubscribe)
        └── WF-20  HELP keyword
```

---

## WORKFLOW BLUEPRINTS

### WF-01 · Keyword Opt-In (LAW)
**Trigger:** Inbound SMS contains keyword = "LAW" (or "START" or "JOIN")
**Phone number:** 551-368-5683

**Steps:**
1. Webhook → Base44 `inboundSMS` endpoint
   - Body: `{ "message": "{{message.body}}", "phone": "{{contact.phone}}", "contactId": "{{contact.id}}" }`
2. Add tag: `status:trial`
3. Add tag: `segment:bar-prep` *(default — updated by segment selection flow)*
4. Add tag: `track:focus-standard` *(default)*
5. Update custom field: `subscription_status` = `trial`
6. Update custom field: `current_day_number` = `0`
7. Send SMS: *(Base44 returns the reply text — use the reply from webhook response OR hardcode the welcome message below)*

```
Welcome to Love Law™ Daily Dose of Justice! ⚖️

You're about to receive daily motivation built specifically for the legal journey.

Your 7-day free trial starts tomorrow morning.

Reply FAITH for faith-based track or STANDARD for standard track.

Msg & data rates may apply. Reply STOP to unsubscribe.
```

8. Wait: 2 minutes
9. Send SMS (segment selection):
```
One quick question — which best describes you?

Reply:
1 — Bar Prep / Bar Retaker
2 — Law Student (1L/2L/3L)
3 — Attorney
4 — Paralegal / Legal Professional
```
10. → Branch to WF-03 (segment selection)

---

### WF-02 · Welcome Sequence (Trial Days 1–7)
**Trigger:** Tag added = `status:trial`
**Note:** Actual daily messages sent by Base44 daily send automation. This workflow handles the structural welcome experience only.

**Steps:**
1. Wait until 9:00 AM subscriber timezone (Day 1)
2. *(Base44 automation sends Day 1 message)*
3. Day 7: trigger WF-04 (trial conversion)

---

### WF-03 · Segment Selection (Reply Routing)
**Trigger:** Inbound SMS reply to segment question (within 1 hour of WF-01 step 9)

**Branch on reply:**
- "1" or contains "BAR" → Remove tag `segment:bar-prep` if wrong, add correct tag, webhook to Base44 to update `audience_segment`
- "2" or contains "LAW STUDENT" or "1L" or "2L" or "3L" → Add tag `segment:law-student-1L`, webhook to Base44
- "3" or contains "ATTORNEY" → Add tag `segment:attorney`, webhook to Base44
- "4" or contains "PARALEGAL" → Add tag `segment:paralegal`, webhook to Base44

**Webhook to Base44:** `syncSubscriberToGHL` with updated segment

---

### WF-04 · Trial Day 7 — Soft Conversion
**Trigger:** Contact tag = `status:trial` AND custom field `current_day_number` = `7`
*(OR: triggered by Base44 trialConversion function directly via GHL API)*

**SMS:**
```
Your 7-day trial is almost up — and you've been showing up every morning. That matters. ⚖️

Don't lose your streak. Keep the Daily Dose of Justice coming for just $7.99/month.

Continue your journey: https://shoplovelaw.com/subscribe

Reply STOP to unsubscribe anytime.
```

---

### WF-05 · Trial Day 9 — Social Proof
**Trigger:** Tag = `status:trial` AND `current_day_number` = `9`

**SMS:**
```
Hundreds of law students and attorneys start every morning with Love Law™. 🏛️

"I almost quit. Then my Daily Dose of Justice showed up."

Your subscription: https://shoplovelaw.com/subscribe

$7.99/month. Cancel anytime.
```

---

### WF-06 · Trial Day 12 — Discount Offer
**Trigger:** Tag = `status:trial` AND `current_day_number` = `12`

**SMS:**
```
Last chance to lock in your Daily Dose. 💙

Use code LOVELAW10 for 10% off your first month.

https://shoplovelaw.com/subscribe

You've already built the habit. Don't let it go.
```

---

### WF-07 · Trial Day 14 — Final Goodbye
**Trigger:** Tag = `status:trial` AND `current_day_number` = `14`

**Steps:**
1. Send SMS:
```
Your trial has ended. 🤍

Whenever you're ready to continue your legal journey with daily motivation, we'll be here.

Restart anytime: https://shoplovelaw.com/subscribe

Reply LAW to start a new free trial.
```
2. Remove tag `status:trial`
3. Add tag `status:cancelled`
4. Update custom field `subscription_status` = `cancelled`
5. Webhook → Base44 to update subscriber record

---

### WF-08 · Daily Morning Send
**Trigger:** Base44 scheduled automation fires at 9:00 AM ET
**Note:** Handled entirely by Base44. GHL receives individual SMS send API calls per subscriber.
No GHL workflow needed — Base44 calls `ghlSendSMS` for each subscriber.

---

### WF-09 · STRESSED / OVERWHELMED / TIRED
**Trigger:** Inbound SMS contains any of:
- "STRESSED", "STRESS", "I'M STRESSED", "SO STRESSED"
- "OVERWHELMED", "TOO MUCH"
- "TIRED", "EXHAUSTED", "SO TIRED"
- "ANXIOUS", "ANXIETY"

**Steps:**
1. Add tag: `emotional:stressed`
2. Webhook → Base44 `inboundSMS`
   - Base44 updates emotional_state and returns reply text
3. Send SMS reply (returned by Base44 webhook OR hardcode per keyword — see Base44 `inboundSMS` function for full text)
4. Remove tag after 48 hours (emotional state resets)

---

### WF-10 · QUIT / CRISIS (Escalation)
**Trigger:** Inbound SMS contains:
- "QUIT", "I QUIT", "WANT TO QUIT", "GIVING UP", "CANT DO THIS"
- "CRISIS", "EMERGENCY"

**Steps:**
1. Add tag: `emotional:needs-support`
2. Webhook → Base44 `inboundSMS` (creates DistressFlag record, alerts DC via iMessage)
3. Send SMS:
```
Please don't — not today. 💙

Every person who passed the bar almost quit first. That feeling? It's normal. It's not the truth.

If you need to talk to someone right now:
📞 988 (call or text)
📱 Text HOME to 741741

You matter far beyond any exam.
```
4. Internal notification to DC (GHL notification or email)
5. Add task: "Follow up with [contact name] — distress flag"

---

### WF-11 · PASSED / GRADUATED (Celebration)
**Trigger:** Inbound SMS contains:
- "PASSED", "I PASSED", "PASSED THE BAR"
- "GRADUATED", "I GRADUATED"
- "GOT THE JOB", "I GOT THE JOB"

**Steps:**
1. Add tag: `emotional:celebrating`
2. Webhook → Base44 `inboundSMS`
3. Send celebration SMS (Base44 returns full text)
4. Wait 2 hours
5. Send merch follow-up:
```
Wear the moment — the Love Law™ collection was built for exactly this. 🏆⚖️

Shop: https://shoplovelaw.com/shop
```
6. Add to pipeline stage: "Success Story / Alumni"

---

### WF-12 · FAITH keyword
**Trigger:** Inbound SMS = "FAITH"
**Steps:**
1. Remove all `track:*` tags
2. Add tag: `track:focus-faith-based`
3. Webhook → Base44 to update `focus_track`
4. Send SMS reply (returned by Base44)

---

### WF-13 · STANDARD keyword
**Trigger:** Inbound SMS = "STANDARD"
**Steps:**
1. Remove all `track:*` tags
2. Add tag: `track:focus-standard`
3. Webhook → Base44 to update `focus_track`
4. Send SMS reply

---

### WF-14 · BURNOUT keyword
**Trigger:** Inbound SMS contains "BURNOUT", "BURNT OUT", "BURNED OUT"
**Steps:**
1. Add tag: `emotional:overwhelmed`
2. Webhook → Base44 `inboundSMS`
3. Send SMS:
```
Burnout is your body asking for what it needs. Listen to it. 🤍

Reply YES to switch to the Burnout Support track — built for when you're running on empty.
```
4. Wait for "YES" reply → trigger WF-12 variant with burnout track

---

### WF-15 · PAUSE / RESUME / RESTART
**PAUSE trigger:** Inbound SMS = "PAUSE"
- Add tag: `status:paused`
- Remove tag: `status:active`
- Webhook → Base44 to update `subscription_status` = `paused`
- Send SMS reply

**RESUME trigger:** Inbound SMS = "RESUME"
- Add tag: `status:active`
- Remove tag: `status:paused`
- Webhook → Base44 to update `subscription_status` = `active`
- Send SMS reply

**RESTART trigger:** Inbound SMS = "RESTART"
- Webhook → Base44 to reset `current_day_number` = `0`
- Send SMS reply

---

### WF-16 · MERCH / SHOP / APPAREL
**Trigger:** Inbound SMS = "MERCH" or "SHOP" or "APPAREL"
**Steps:**
1. Webhook → Base44 `inboundSMS`
2. Send SMS:
```
The Love Law™ collection — built for the legal journey. 👔⚖️

Shop: https://shoplovelaw.com/shop

From bar prep to bar admission — wear the journey.
```
3. Add tag: `interest:merch`

---

### WF-17 · GIFT keyword
**Trigger:** Inbound SMS = "GIFT"
**Steps:**
1. Webhook → Base44
2. Send SMS:
```
Give the gift of daily motivation. 🎁

Love Law™ gift subscriptions: 7-day, 30-day, 90-day, Annual.

Perfect for law students, bar preppers, and new attorneys.

Gift cards: https://shoplovelaw.com/gift
```

---

### WF-18 · Milestone Merch Upsell (Day 30 / 60 / 90)
**Trigger:** Custom field `current_day_number` = `30` (or 60 or 90) AND tag = `status:active`

**Day 30 SMS** (woven naturally into message — NOT a hard sell):
```
30 days in. You've shown up every single morning. ⚖️

That's not nothing. That's who you are.

The collection that matches this moment: https://shoplovelaw.com/shop
```

**Day 60 SMS:**
```
60 days of Daily Doses. Two months of showing up. 💙

This legal journey is your story — wear it.

Love Law™ collection: https://shoplovelaw.com/shop
```

**Day 90 SMS:**
```
90 days. You made it through the full sequence. 🏛️

You are exactly the kind of person this brand was built for.

The full collection: https://shoplovelaw.com/shop

Reply RESTART to begin again, or UPGRADE for more content.
```

---

### WF-19 · STOP (TCPA)
**Trigger:** Inbound SMS = "STOP"
**Note:** GHL handles STOP natively (required by carriers). Do NOT override this.
**Additional steps:**
1. Webhook → Base44 `inboundSMS` to update `subscription_status` = `cancelled`
2. Remove all `status:*` tags
3. Add tag: `status:unsubscribed`
4. GHL auto-sends required TCPA confirmation

---

### WF-20 · HELP keyword
**Trigger:** Inbound SMS = "HELP"
**Steps:**
1. Webhook → Base44 `inboundSMS`
2. Send SMS:
```
Love Law™ keywords:

STRESSED • OVERWHELMED • TIRED
QUIT • CRISIS • PAUSE • RESUME
FAITH • STANDARD • RESTART
SHOP • GIFT • INFO
STOP — unsubscribe
```

---

## PIPELINE: Daily Dose Subscribers
```
Stage 1: Trial (Days 1–7)
Stage 2: Converting (Days 8–14)
Stage 3: Active Subscriber
Stage 4: Paused
Stage 5: Alumni / Passed the Bar
Stage 6: Churned
```

---

## WEBHOOK ENDPOINT REFERENCE
All webhooks point to Base44 backend functions:

| Function | URL | Purpose |
|---|---|---|
| inboundSMS | /api/functions/inboundSMS | All inbound keyword routing |
| trialConversion | /api/functions/trialConversion | Trial drip (also called by Base44 automation) |
| syncSubscriberToGHL | /api/functions/syncSubscriberToGHL | Sync contact data back to GHL |

**To get your function URLs:** In Base44 dashboard → Functions → click function name → copy URL.

---

## MIGRATION CHECKLIST (moving to Love Law™ subaccount)
- [ ] Export this folder as a GHL Snapshot
- [ ] Create new Love Law™ subaccount
- [ ] Complete A2P 10DLC registration on new subaccount
- [ ] Assign phone numbers (551-368-5683 + 217-568-3529)
- [ ] Import snapshot
- [ ] Update webhook URLs if Base44 function URLs changed
- [ ] Update Base44 secrets: `GHL_API_KEY` + `GHL_LOCATION_ID`
- [ ] Test opt-in flow with a test number
- [ ] Enable daily send automation in Base44
- [ ] Confirm pilot message delivery

---

## SMART LISTS (create in GHL → Contacts → Smart Lists)

| List Name | Filter |
|---|---|
| All Active | tag = `status:active` |
| All Trial | tag = `status:trial` |
| Bar Prep | tag = `segment:bar-prep` |
| Law Students | tag contains `segment:law-student` |
| Attorneys | tag = `segment:attorney` |
| Faith Track | tag = `track:focus-faith-based` |
| Needs Support | tag = `emotional:needs-support` OR `emotional:stressed` |
| Celebrating | tag = `emotional:celebrating` |
| Merch Interest | tag = `interest:merch` |
| Churned — Win Back | tag = `status:unsubscribed` OR `status:cancelled` |
| Spanish Speakers | tag = `lang:es` |
| Enterprise | tag contains `institution:` |
