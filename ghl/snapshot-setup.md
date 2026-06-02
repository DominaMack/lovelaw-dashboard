# GHL Snapshot Setup Guide
## Love Law™ · Daily Dose of Justice™

This guide covers everything needed to install this system into a new GoHighLevel subaccount.

---

## Step 1 — Create the Subaccount
- Name: `Love Law™ · Daily Dose of Justice™`
- Business type: SaaS / Coaching / Membership

---

## Step 2 — A2P SMS Registration
Before ANY messages can be sent:
1. Complete A2P 10DLC brand registration
2. Register the Love Law™ campaign (motivational/educational content)
3. Assign a dedicated vanity number to the subaccount
4. Confirm delivery before going live

---

## Step 3 — Custom Fields (Contact Level)
Go to: **Settings → Custom Fields → Contact**

Create the following fields (all type: Single Line Text unless noted):

| Field Label | Field Key | Type |
|---|---|---|
| Audience Segment | `audience_segment` | Single Line Text |
| Focus Track | `focus_track` | Single Line Text |
| Emotional State | `emotional_state` | Single Line Text |
| Current Day Number | `current_day_number` | Single Line Text |
| Subscription Status | `subscription_status` | Single Line Text |
| Subscription Tier | `subscription_tier` | Single Line Text |
| Add-Ons | `add_ons` | Single Line Text |

> These keys must match exactly — they are referenced by the syncSubscriberToGHL function.

---

## Step 4 — Tags
The system auto-applies these tag formats on every subscriber sync:

| Tag Format | Example |
|---|---|
| `segment:<value>` | `segment:bar-prep` |
| `track:<value>` | `track:focus-faith-based` |
| `status:<value>` | `status:active` |
| `tier:<value>` | `tier:premium` |

No manual tag creation needed — GHL creates them automatically on first use.

---

## Step 5 — SMS Workflows (GHL Automations)
The Base44 backend handles **sending** via API.  
In GHL, create these workflows for inbound handling:

### Workflow 1: Inbound Keyword — STRESSED
- Trigger: SMS contains keyword "stressed" OR "stress" OR "I'm stressed"
- Action: Add tag `emotional:stressed`
- Action: Webhook to Base44 → update subscriber `emotional_state` = "stressed"
- Action: Reply with calming message from the two-way response library

### Workflow 2: Inbound Keyword — PASSED
- Trigger: SMS contains "I passed" OR "passed the bar"
- Action: Add tag `emotional:celebrating`
- Action: Webhook to Base44 → update subscriber `emotional_state` = "celebrating"
- Action: Reply with celebratory message

### Workflow 3: Inbound Keyword — QUIT / GIVE UP
- Trigger: SMS contains "I want to quit" OR "I quit" OR "giving up"
- Action: Add tag `emotional:needs-support`
- Action: Webhook to Base44 → update subscriber `emotional_state` = "needs-support"
- Action: Reply with resilience + support message

### Workflow 4: Inbound Keyword — TIRED / EXHAUSTED
- Trigger: SMS contains "I'm tired" OR "exhausted" OR "I'm done"
- Action: Add tag `emotional:needs-support`
- Action: Reply with rest + encouragement message

### Workflow 5: Inbound Keyword — STOP
- Trigger: SMS = "STOP"
- Action: Tag `status:unsubscribed`
- Action: Update Base44 subscriber → `subscription_status` = "cancelled"

---

## Step 6 — Pipeline (Optional)
Create a pipeline called **"Daily Dose Subscribers"** with stages:
1. Trial
2. Active
3. Paused
4. Cancelled / Churned

---

## Step 7 — Update Base44 Secrets
After the new subaccount is ready:
1. In the Base44 Superagent, ask to update `GHL_API_KEY` and `GHL_LOCATION_ID`
2. Provide the new subaccount's API key and Location ID
3. No code changes needed — the functions read these from environment variables

---

## Segment → GHL Tag Reference

| Segment | GHL Tag |
|---|---|
| Bar Prep | `segment:bar-prep` |
| Bar Retaker | `segment:bar-retaker` |
| Attorney | `segment:attorney` |
| 1L | `segment:law-student-1L` |
| 2L | `segment:law-student-2L` |
| 3L | `segment:law-student-3L` |
| Evening Student | `segment:law-student-evening` |
| Part-Time Student | `segment:law-student-parttime` |
| Pre-Law | `segment:pre-law` |
| Judge | `segment:judge` |
| Paralegal | `segment:paralegal` |
| Legal Assistant | `segment:legal-assistant` |
| Police Officer | `segment:police-officer` |
| Government Legal | `segment:government-legal` |
| Public Interest | `segment:public-interest` |

---

## Focus Track → GHL Tag Reference

| Focus Track | GHL Tag |
|---|---|
| Standard | `track:focus-standard` |
| Faith-Based | `track:focus-faith-based` |
| First Generation | `track:focus-first-generation` |
| Repeat Taker | `track:focus-repeat-taker` |
| Working Parent | `track:focus-working-parent` |
| Women in Law | `track:focus-women-in-law` |
| Minority Students | `track:focus-minority-students` |
| Burnout Support | `track:focus-burnout-support` |

---

## Daily Send Automation (Base44 → GHL)

The daily message send is triggered by a Base44 scheduled automation (set separately).  
It calls `ghlSendSMS` with:
- The subscriber's `ghl_contact_id`
- The correct day's `message_text` from the Message entity
- The `message_id` so it gets marked `sent` after delivery

The flow:
```
Base44 Automation fires (daily, 9:00 AM CT)
  → Fetch all active subscribers
  → For each subscriber, find message matching their current_day_number + segment + track
  → Call ghlSendSMS
  → Increment subscriber's current_day_number by 1
  → Message marked "sent"
```
