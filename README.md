# Wellness Buddy

Daily check-ins (Firestore), AI Buddy, Patterns, Wins. **Firebase Spark (free)** + **Vercel** for AI — no Cloud Functions.

---

## Quick start

```bash
npm i && npm run dev
```

- **Root `.env`**: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.  
- See **FIREBASE_SETUP.md** / **FIRESTORE_SETUP.md**.

---

## AI (Buddy, Patterns, Wins) — Spark + Vercel

AI runs in **Vercel serverless** (`/api/*`), so you can keep Firebase on **Spark**.

1. **Deploy to Vercel** (connects to your Git or `vercel` CLI).
2. **Env in Vercel**:
   - `OPENROUTER_API_KEY` — OpenRouter key.
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — Full JSON of the Firebase service account (Project settings → Service accounts → Generate new private key).
3. **Local with API**: `vercel dev` (not `npm run dev`). Put the same env in `.env`.

→ **api/README.md** for routes and details.

---

## Docs

| File | Purpose |
|------|--------|
| **PROJECT_OVERVIEW.md** | Status, structure, data flow |
| **README.md** | This file |
| **api/README.md** | /api routes, env, local |
| **functions/README.md** | Cloud Functions (Blaze only) |
| **FIREBASE_SETUP.md**, **FIRESTORE_SETUP.md** | Firebase |
