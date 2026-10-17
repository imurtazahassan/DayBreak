# DAYBREAK 🌅
> **A world of news, shaped around you.**  
> *NaSCon '26 Hackathon (Eynvision) · Category: Build a Personal Morning Paper*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)](https://tailwindcss.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🗞️ What is DAYBREAK?

DAYBREAK transforms the firehose of modern digital news into a focused, beautifully typeset daily newspaper—delivered every morning both as an editorial web experience and as a downloadable, print-ready PDF.

Inspired by the editorial authority of the *Financial Times* and the design discipline of classic print broadsheets, DAYBREAK uses an **explainable scoring engine** that balances your stated interests, recency decay, and publisher preferences, while intentionally reserving space for **serendipitous discovery** beyond your bubble.

---

## ✨ Key Features

1. **Editorial Onboarding (`/onboarding`)**:
   - Captures topics, geographic focus (Pakistan, South Asia, Global), reading depth (briefing, standard, deep read), and content exclusions.
   - Zero login friction: judges can jump in immediately with seamless anonymous sessions.

2. **Personalized Web Edition (`/`)**:
   - True newspaper visual hierarchy: prominent masthead with edition number, estimated reading time, banner Lead Story, *"3 Things to Know"* briefing, and categorized multi-column section grids.
   - Clean, light-theme palette: warm paper ivory (`#F7F4ED`), deep ink (`#202722`), forest green (`#25483D`), terracotta (`#B84B37`), and brass (`#D9B66F`).
   - Restrained animations using Motion (`motion/react`) with full `prefers-reduced-motion` compliance.

3. **Daily Newspaper PDF (`/api/pdf/[date]`)**:
   - Rendered server-side using `@react-pdf/renderer` from the **exact same immutable edition snapshot** as the web interface.
   - A4 layout with custom masthead, multi-column sections, photo integration, page numbering, and orphan protection (`wrap={false}`).

4. **Transparent, Explainable Ranking Engine**:
   - No opaque AI black-boxes determining your worldview.
   - Mathematical heuristic:
     $$\text{Score} = (\text{Interest} \times \text{Recency} \times \text{Source}) - \text{Diversity Penalty} + \text{Exploration Bonus}$$
   - Verified by unit tests (`npm test`).

5. **Learning Feedback Loop (`/preferences`)**:
   - Readers can vote *More Like This*, *Less Like This*, *Save*, or *Skip*.
   - Exponential time decay: learned preferences adjust dynamically and drift back to neutral over ~7 days of inactivity.
   - Dedicated *"What DAYBREAK Has Learned About You"* transparent inspection dashboard.

6. **Room to Explore (`/explore`)**:
   - *"Beyond Your Bubble"* spotlight awards an exploration bonus to worthwhile stories outside your usual reading habits.

7. **Past Editions Archive (`/archive`)**:
   - Preserves immutable daily editions. Reopening an archived edition displays that day's news exactly as it was snapshotted.

---

## 🏗️ Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router with Turbopack) & React 19 Canary
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Motion**: Motion (`motion/react`)
- **PDF Generation**: `@react-pdf/renderer`
- **RSS Ingestion**: `rss-parser` across 8 verified public feeds (BBC, Dawn, Reuters, TechCrunch, Ars Technica, Carbon Brief, NASA, The Guardian)
- **Persistence**: Abstracted storage service (`/lib/services/storage.ts`) with local JSON fallback and ready Supabase bindings.
- **Scheduling**: Automated via `vercel.json` Cron calling `/api/cron/build-edition` at 5:00 AM PKT daily, plus an interactive manual build trigger for live demos.

For full architectural diagrams and data flows, see [Architecture Documentation](/docs/architecture.md).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (v24 LTS tested)
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/imurtazahassan/DayBreak.git
   cd DayBreak
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (optional, defaults run locally out of the box):
   ```bash
   cp .env.example .env.local
   ```

4. **Run Ranking Unit Tests**:
   ```bash
   npm test
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view your morning paper.

6. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing

Run the automated unit test suite verifying the transparent scoring algorithm:
```bash
npm test
```
The test verifies:
- Recency exponential decay curve
- Topic and region interest multipliers
- Diversity penalty triggering on $\ge 3$ articles in one topic
- Exploration bonus calculation for unfamiliar subjects
- Presentation assignment (Lead story, Featured, Standard, Brief)
- Dynamic section ordering

---

## Architecture

daybreak-architecture.png

## 📋 Hackathon Evaluation Checklist

| Criteria | Implementation Status | Notes |
|---|---|---|
| **1. Personalized Onboarding** | ✅ Live | 5-step flow capturing topics, regions, depth, exclusions |
| **2. Fresh Daily PDF** | ✅ Live | `@react-pdf/renderer` broadsheet rendered from same snapshot |
| **3. Web Reading Experience** | ✅ Live | Masthead, Lead story, 3 Things to Know, multi-column sections |
| **4. Learning from Reading** | ✅ Live | Feedback events update weights with 7-day time decay |
| **5. Room to Explore** | ✅ Live | `/explore` with *Beyond Your Bubble* bonus |
| **6. Archival Preservation** | ✅ Live | `/archive` with immutable past edition snapshots |
| **7. Public Git Commits** | ✅ Live | Clean conventional commits pushed to GitHub |
| **8. Architecture Docs** | ✅ Live | Detailed Mermaid diagrams in `/docs/architecture.md` |
| **9. 5-Min Video Script** | ✅ Live | Full timed script in `/docs/loom-script.md` |

---

## ⚖️ Editorial Ethics & Fair Use
DAYBREAK never scrapes or stores full copyrighted article bodies. We index publicly syndicated RSS feeds, presenting headlines, short descriptions, and metadata with direct attribution and links to the original publishers.

---

## 👨‍💻 Author & Submission
Created for **NaSCon '26 (Eynvision)**  
*Lead Engineer & Designer: Murtaza Hassan*
