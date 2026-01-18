# Wellness Buddy — Project Overview

## Where We Are

- **Check-ins**: Form saves to **Firestore** (`users/{userId}/checkIns/{date}`). Working.
- **Auth**: **Firebase Auth**; Login at `/login`; `ProtectedRoute` guards Home, Buddy, Patterns, Wins. Working.
- **Buddy, Patterns, Wins**: AI runs via **Vercel serverless** (`/api/*`) so the project can stay on the **Firebase Spark (free)** plan. No Cloud Functions.
  - **api/**: `buddy-chat`, `generate-patterns`, `generate-wins`. Verify ID token, read Firestore (Admin), call OpenRouter, return JSON.
  - **functions/**: Cloud Functions version for **Blaze**; use that if you switch plans.

---

## What We're Doing

1. **Frontend (Vite + React)**: SPA with Home, Buddy, Patterns, Wins. Check-ins via `firebaseService`; AI via `aiApi` → `fetch('/api/...')` with `Authorization: Bearer <idToken>`.
2. **Backend (Vercel `api/`)**: Three POST routes. They verify the Firebase ID token, read `users/{uid}/checkIns` from Firestore (Admin), build `MemorySnapshot`, call OpenRouter, return JSON.
3. **Data flow**:
   - Check-in form → `saveCheckIn()` → Firestore.
   - Buddy → `POST /api/buddy-chat` → Firestore + OpenRouter → `{ content }`.
   - Patterns → `POST /api/generate-patterns` → Firestore + OpenRouter → `PatternInsight[]`.
   - Wins → `POST /api/generate-wins` → Firestore + OpenRouter → `{ wins, growthNotes }`.

---

## File Structure

```
nwHacks/
├── PROJECT_OVERVIEW.md     # This file
├── README.md               # Intro, quick start, links
├── vercel.json             # Vite build, SPA rewrite; api/ auto-mounted at /api
├── firebase.json           # Firebase (functions/ for Blaze only)
├── api/                    # Vercel serverless — for Spark plan
│   ├── README.md           # Env, routes, local (vercel dev)
│   ├── buddy-chat.ts       # POST /api/buddy-chat
│   ├── generate-patterns.ts
│   ├── generate-wins.ts
│   └── lib/
│       ├── admin.ts        # Firebase Admin init, auth, db
│       ├── types.ts
│       ├── openrouter.ts   # OpenRouter client, chat()
│       ├── firestore.ts    # getCheckInsByDateRange
│       ├── memory.ts       # buildMemorySnapshot
│       ├── dates.ts        # getStartEndForPeriod, getStartEndForContextDays
│       └── serialize.ts    # serializeCheckIns
│
├── src/                    # Frontend (Vite + React)
│   ├── main.tsx, App.tsx, index.css
│   ├── pages/              # Login, Home, Buddy, Patterns, Wins, NotFound, CheckIn
│   ├── components/         # ProtectedRoute, layout, settings, ui
│   ├── hooks/              # useCheckInData
│   └── lib/
│       ├── firebase.ts     # app, auth, db, analytics (no functions)
│       ├── firebaseService.ts
│       ├── aiApi.ts        # fetch /api/buddy-chat, /api/generate-patterns, /api/generate-wins
│       ├── mockData.ts
│       └── utils.ts
│
└── functions/              # Firebase Cloud Functions — for Blaze plan only
    └── ...                 # See functions/README.md
```

---

## How to Run (Spark + Vercel)

| Where | Command | Env |
|-------|---------|-----|
| **Local** | `vercel dev` | Root `.env`: `VITE_FIREBASE_*`, `OPENROUTER_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON` (or in Vercel env) |
| **Prod** | Deploy to Vercel | Vercel: `OPENROUTER_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON` |

- `npm run dev` runs only Vite; `/api` is not available, so Buddy/Patterns/Wins will fail. Use `vercel dev` for full stack.
- If the frontend is on another host (e.g. Firebase Hosting), set `VITE_AI_API_URL` to the Vercel app URL so `aiApi` calls that origin.

---

## Key Types and Firestore

- **CheckInData**: `date`, `ratings`, `prompts`, `createdAt`, `updatedAt`. Path: `users/{userId}/checkIns/{date}`.
- **ChatMessage**, **MemorySnapshot**, **PatternInsight**, **Win**, **GrowthNote**: in `mockData.ts` and `api/lib/types.ts`.

---

## Docs

- **README.md** — Intro, quick start, AI (Vercel).
- **PROJECT_OVERVIEW.md** — This file.
- **api/README.md** — API routes, env, local.
- **functions/README.md** — Cloud Functions (Blaze).
- **FIREBASE_SETUP.md**, **FIRESTORE_SETUP.md** — Firebase.
