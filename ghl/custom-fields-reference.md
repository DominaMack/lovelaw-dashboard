# GHL Custom Fields Reference
## Love Law™ · Daily Dose of Justice™

All custom fields are set at the **Contact** level in GoHighLevel.

---

## Required Custom Fields

These 8 fields must exist in the GHL subaccount before running `syncSubscriberToGHL`.

| # | Label | Key | Type | Notes |
|---|---|---|---|---|
| 1 | Audience Segment | `audience_segment` | Text | Legal journey stage |
| 2 | Focus Track | `focus_track` | Text | Identity/emotional personalization layer |
| 3 | Emotional State | `emotional_state` | Text | Set by two-way SMS detection |
| 4 | Current Day Number | `current_day_number` | Text | 1–365 in the message sequence |
| 5 | Subscription Status | `subscription_status` | Text | active, trial, paused, cancelled |
| 6 | Subscription Tier | `subscription_tier` | Text | standard, premium |
| 7 | Add-Ons | `add_ons` | Text | Comma-separated active add-ons |
| 8 | Language | `language` | Text | en, es, zh, tl, pt, fr, ht |

---

## Tag Conventions

All tags follow a `key:value` format for GHL smart lists and workflow filtering.

### Segment Tags
```
segment:pre-law
segment:law-student-1L
segment:law-student-2L
segment:law-student-3L
segment:law-student-evening
segment:law-student-parttime
segment:bar-prep
segment:bar-retaker
segment:attorney
segment:judge
segment:paralegal
segment:legal-assistant
segment:police-officer
segment:government-legal
segment:public-interest
segment:other-legal
```

### Focus Track Tags
```
track:focus-standard
track:focus-faith-based
track:focus-first-generation
track:focus-repeat-taker
track:focus-working-parent
track:focus-women-in-law
track:focus-men-in-law
track:focus-black-in-law
track:focus-asian-american
track:focus-latino-hispanic
track:focus-lgbtq-in-law
track:focus-indigenous-in-law
track:focus-immigrant-professional
track:focus-burnout-support
```

### Subscription Tags
```
status:active
status:trial
status:paused
status:cancelled

tier:standard
tier:premium
```

### Language Tags
```
lang:en
lang:es
lang:zh
lang:tl
lang:pt
lang:fr
lang:ht
```

### Emotional State Tags (set by two-way SMS workflows)
```
emotional:standard
emotional:stressed
emotional:overwhelmed
emotional:celebrating
emotional:needs-support
```

### Add-On Tags
```
addon:weekly-planning
addon:friday-reflection
addon:faith-weekly
addon:digital-journal
```

---

## Smart List Suggestions

| Smart List Name | Filter |
|---|---|
| All Active Subscribers | tag contains `status:active` |
| Bar Prep — All | tag contains `segment:bar-prep` |
| Faith Track | tag contains `track:focus-faith-based` |
| Latino/Hispanic | tag contains `track:focus-latino-hispanic` |
| Asian American | tag contains `track:focus-asian-american` |
| Black in Law | tag contains `track:focus-black-in-law` |
| Women in Law | tag contains `track:focus-women-in-law` |
| Men in Law | tag contains `track:focus-men-in-law` |
| LGBTQ+ | tag contains `track:focus-lgbtq-in-law` |
| Indigenous | tag contains `track:focus-indigenous-in-law` |
| Immigrant / DACA | tag contains `track:focus-immigrant-professional` |
| Burnout Support | tag contains `track:focus-burnout-support` |
| Needs Support Now | tag contains `emotional:needs-support` OR `emotional:stressed` |
| Spanish Speakers | tag contains `lang:es` |
| Premium Tier | tag contains `tier:premium` |
| Add-On: Friday Reflection | tag contains `addon:friday-reflection` |
| Bar Retakers | tag contains `segment:bar-retaker` |
