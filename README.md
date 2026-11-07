# 🕵️‍♂️ AI Detective: Mystery Solver

A production-ready criminal investigation web dashboard built with **React**, **Next.js (App Router)**, **Google Gemini 2.5**, and **Firebase (Auth & Firestore)**.

Amateur sleuths and digital investigators analyze multi-document case files (witness statements, keycard logs, Slack chats, CCTV memos, and forensic spectroscopy), track suspects, detect lies and contradictions, cross-examine evidence with an AI forensic assistant, and generate evidence-grounded investigation reports.

---

## 🌟 Primary Features

1. **Pre-Loaded Mystery Cases**:
   - **Case 1 (Easy): The Missing Laptop** — Flagship Aegis-9 AI prototype vanishes from the locked CEO penthouse at NexusLabs. 4 suspects, straightforward badge and Slack contradictions.
   - **Case 2 (Twisted): The Corporate Leak** — Vanguard Genomics' Project Lazarus molecular blueprint is exfiltrated to Zurich 45 minutes prior to patent filing. Contradictory testimonies, deceptive red herrings, and an IP-spoofing hardware implant.
   - **Case 3 (Impossible): The Art Gallery Heist** — The 45-carat "Celestial Sapphire" ($18M) stolen during a 4-minute blackout at the Obsidian Gala. Overlapping timelines, laser grid telemetry paradox, and a pre-planned replica swap.

2. **Evidence Extraction Engine (`/api/gemini/extract-entities`)**:
   - Ingests evidentiary documents and invokes the Gemini API (`gemini-2.5-flash` via `@google/genai`) using **Structured Outputs (JSON Schema)**.
   - Automatically parses **People**, **Locations**, **Timestamps**, **Key Actions**, and extracts chronological event nodes.

3. **Firebase Firestore Database Schema**:
   - `cases`: Incident details, difficulty, briefing dossiers, victim, scene.
   - `evidence_docs`: Exhibits, timestamps, source attribution, entity tags.
   - `suspects`: Motives, opportunity, alibis, blame meters, claim credibility.
   - `timelines`: Chronologically arranged event nodes.
   - `contradictions`: Clashing assertions between documents with Gemini AI reasoning.
   - `investigation_progress`: User notes, suspect blame ratings, and solved status.
   - *One-click database seeding via `/api/firestore/seed` or the `Seed DB` navbar button.*

4. **Firebase Authentication & Investigator Clearance**:
   - Email / Password authentication.
   - Google Social Auth.
   - Built-in **Demo Guest Clearance** for instant testing without mandatory setup.

5. **Interactive Timeline & Contradiction Board**:
   - Chronological event trail with verified markers and key clue indicators.
   - Contradiction Radar highlighting conflicting statements with severity ratings (`critical`, `high`, `moderate`).
   - Side-by-side document clash preview with Gemini reasoning breakdown and resolution toggles.

6. **Suspect Matrix & Confidence Tracker**:
   - Dynamic Motive, Physical Opportunity, and Alibi Solidness meters.
   - Interactive Investigator Accusation Blame Slider (0–100%).
   - Claim Credibility Tracker categorizing statements into **Facts**, **Assumptions**, and **Speculation**.

7. **Investigator Assistant & Final Report Generator**:
   - **Sherlock AI Terminal (`/api/gemini/investigate-chat`)**: Answers sleuth queries with **strict document source citations** (e.g. `[DOC-01]`, `[DOC-03]`) that can be clicked to jump directly to the relevant evidence file.
   - **Official Indictment Report (`/api/gemini/generate-report`)**: Assesses user deductions against the ground truth, computes accuracy scores, outputs an official prosecution dossier, and triggers celebration confetti upon cracking the mystery.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (Custom Noir / Cyber-Detective Palette)
- **Icons**: Lucide React
- **AI SDK**: `@google/genai` (Official Google Gen AI SDK)
- **Database & Auth**: Firebase Web SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`) & `firebase-admin`
- **Effects**: `canvas-confetti`

```
├── .env.local.example          # Environment variables template
├── .env.local                  # Local secrets (never committed to git)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── firestore/seed/route.ts        # Database seeding endpoint
│   │   │   ├── gemini/extract-entities/route.ts  # Structured output extraction
│   │   │   ├── gemini/generate-report/route.ts   # Case report synthesizer
│   │   │   └── gemini/investigate-chat/route.ts  # Detective AI with citations
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main app shell & view controller
│   ├── components/
│   │   ├── AuthModal.tsx       # Firebase Auth modal (Email/Google/Guest)
│   │   ├── CaseSelectionView.tsx # Screen 1: Mystery case grid & briefings
│   │   ├── EvidenceBrowser.tsx # Screen 2 (Left): Filterable exhibits & entities
│   │   ├── FinalReportModal.tsx # Report generator & verdict celebration
│   │   ├── InvestigatorTerminal.tsx # Screen 3: Interactive Sherlock AI chat
│   │   ├── Navbar.tsx          # Top bar, status, case switcher, auth badge
│   │   ├── SuspectMatrix.tsx   # Screen 2 (Right): Suspect meters & blame slider
│   │   └── TimelineContradictionBoard.tsx # Screen 2 (Center): Timeline & radar
│   ├── context/
│   │   ├── AuthContext.tsx     # Firebase Auth state & guest session
│   │   └── CaseContext.tsx     # Case, evidence, suspect, and timeline state
│   ├── data/
│   │   └── mockCases.ts        # Deep pre-loaded mystery case knowledge base
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── admin.ts        # Server-side Firebase Admin SDK
│   │   │   └── client.ts       # Client-side Firebase SDK
│   │   └── gemini/
│   │       └── client.ts       # Gemini 2.5 SDK integration & schemas
│   └── types/
│       └── detective.ts        # TypeScript interfaces & domain models
```

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in your API keys in `.env.local`:

```env
# Google Gemini API Key (Get at: https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Client SDK Configuration (Firebase Console -> Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Configuration (Server-Side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Note**: If you run the app before configuring keys, the application automatically runs in **Local Forensic Sandbox Mode** with complete built-in simulation and local persistence, so you can test all 3 mysteries immediately!

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm start
```

