# DAYBREAK — 5-Minute Video Pitch & Demo Script
**NaSCon '26 Hackathon (Eynvision) · Category: Personal Morning Paper**

---

## ⏱️ Video Breakdown (Total: 5:00)

| Time | Segment | Screen Focus | Key Narrative |
|---|---|---|---|
| **0:00 - 0:45** | **The Problem & Vision** | Camera / Landing Masthead | In an age of endless scrolling feeds and clickbait algorithms, we lost the calm authority and serendipity of a daily morning paper. Introducing DAYBREAK. |
| **0:45 - 1:45** | **Onboarding UX** | `/onboarding` | 5-step intuitive onboarding tailored to our persona: Pakistani university student curious about AI, climate finance, and regional tech startups. |
| **1:45 - 2:45** | **Today's Paper & Layout** | `/` (Desktop & Mobile view) | Editorial aesthetic (Warm paper ivory, DM Serif Display). Live RSS ingestion. Lead story, "3 Things to Know", multi-column sections. Real live data vs. clearly labeled demo fallbacks. |
| **2:45 - 3:30** | **Downloadable Daily PDF** | Click "Download PDF Edition" | Generated server-side with `@react-pdf/renderer` from the exact same snapshot as the web page. A4 format, custom masthead, columns, page numbers. |
| **3:30 - 4:15** | **Learning Engine & Discovery** | `/preferences` & `/explore` | Click "More like this" / "Skip" on stories. Show "What DAYBREAK Has Learned About You" panel. Show "Beyond Your Bubble" discovery in `/explore`. |
| **4:15 - 5:00** | **Architecture & Wrap Up** | `/docs/architecture.md` / Vercel Cron | Explainable scoring equation, Next.js 16 App Router on Vercel, automated daily cron at 5 AM PKT, ready for scale. |

---

## 🎙️ Spoken Script

### [0:00 - 0:45] The Problem & Vision
*"Hello judges! My name is Murtaza Hassan, and this is **DAYBREAK**, my entry for NaSCon '26.

Today's internet gives us an infinity pool of anxiety: endless doomscrolling, attention-grabbing algorithms, and filter bubbles. But remember the feeling of holding a morning newspaper? It had an editorial hierarchy. It had a finish line. And it made you smarter in 15 minutes.

DAYBREAK brings that ritual into 2026. It is an intelligent morning paper created fresh every single day, uniquely personalized to your mind, available both as a fluid web edition and as a beautiful, printable daily PDF."*

---

### [0:45 - 1:45] Onboarding Flow
*(Navigate to `/onboarding`)*
*"Let's walk through onboarding. Notice the restrained design tokens: warm paper ivory `#F7F4ED`, deep ink `#202722`, and forest green `#25483D` with DM Serif typography. No dark mode, no generic SaaS card clutter.

We select our persona: a student in Pakistan passionate about Technology & AI, Business, and Climate Change. We can select geographic priorities like Pakistan and South Asia, choose our reading depth—from a 5-minute briefing to a deep read—and specify content to exclude like celebrity gossip. 

When we click 'Create My Paper', our background engine immediately ingests live feeds and runs our transparent ranking heuristic."*

---

### [1:45 - 2:45] The Morning Paper Web Experience
*(Arrive at `/`)*
*"Here is today's paper! Notice the authentic newspaper masthead with publication date, edition number, and estimated reading time.

Look at the layout intelligence:
1. **The Lead Story**: Our top-scored article claims the banner position with a compelling hero image and full summary.
2. **'3 Things to Know'**: An executive briefing right below the masthead.
3. **Curated Sections**: Technology, Climate, and Business arranged according to reader interest. Notice how we strictly display verified article summaries with attribution and link back to the original publishers. Zero invented facts or fake quotes."*

---

### [2:45 - 3:30] Daily Newspaper PDF
*(Click 'Download PDF Edition')*
*"A key requirement of the brief: a real, downloadable daily newspaper PDF made fresh every day.

Let's click 'Download PDF Edition'. This is generated on-demand server-side using `@react-pdf/renderer` directly from the exact same immutable edition snapshot that powers the web page.

Look at this PDF: custom masthead, publication date, multi-column editorial grid, graceful image embedding, and automated page breaks where headlines never orphan from their text. You can read it on your tablet or print it for your breakfast table."*

---

### [3:30 - 4:15] Learning Loop & Exploration
*(Click 'More like this' on a tech story, then navigate to `/preferences`)*
*"DAYBREAK is not static; it learns as you read. If I click 'More like this' or save an article, our learning service adjusts topic and source weights.

Let's check `/preferences`. Here is the **'What DAYBREAK Has Learned About You'** panel. It transparently shows that Technology now has a positive bias, while unused topics decay with a 7-day half-life.

And notice `/explore`: great newspapers don't trap you in an echo chamber. Our **'Beyond Your Bubble'** feature specifically awards an exploration bonus to stories outside your stated interests, opening windows to new ideas."*

---

### [4:15 - 5:00] Architecture & Conclusion
*(Show `/docs/architecture.md`)*
*"Under the hood, DAYBREAK runs on Next.js 16 App Router on Vercel. Ingestion pulls from 8 verified public RSS feeds, with instant fallback so judges never see a broken screen. Editions are snapshotted daily via Vercel Cron at midnight UTC, with an explainable scoring function that balances interest, recency, source credibility, and diversity.

DAYBREAK proves that news doesn't have to be noisy to be timely. Thank you for your time, and enjoy your morning paper!"*
