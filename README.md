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
2. **Env in Vercel** (and in `.env` for local):
   - `OPENROUTER_API_KEY` — OpenRouter key.
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — Full JSON of the Firebase service account (Project settings → Service accounts → Generate new private key). Must be the **same** Firebase project as your app.

**Local with API (no Vercel CLI needed):**
- **`npm run dev:all`** — runs the local API (port 3000) and the app (port 8080). Easiest.
- Or: **`npm run dev:api`** in one terminal, **`npm run dev`** in another. Vite proxies `/api` to the dev-api.

Put `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env`.

**Alternatively,** `vercel dev` works if you’re logged in (`npx vercel login`).

→ **api/README.md** for routes and details.

### Buddy shows “I’m having a moment” / Patterns stay empty

- **Local:** Run **`npm run dev:all`** (or `dev:api` + `dev` in two terminals). Put `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env`.
- **Vercel:** In the project’s env, add `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` (same Firebase project as the app).
- **Patterns:** Needs at least **3 check-ins** in the chosen period. If you have fewer, you’ll see “Not enough data yet”.
- **Console:** In the browser dev tools (F12 → Console), look for `Buddy API error:` or `Patterns API error:` to see the real error (e.g. 404 = no API, 401 = auth/config).

---

## Docs

| File | Purpose |
|------|--------|
| **PROJECT_OVERVIEW.md** | Status, structure, data flow |
| **README.md** | This file |
| **VERCEL_PROD.md** | **Production on Vercel** — env vars, redeploy, /api/health |
| **DIAGNOSIS.md** | Form data not in Buddy/Patterns/Wins — root causes and checks |
| **api/README.md** | /api routes, env, local |
| **functions/README.md** | Cloud Functions (Blaze only) |
| **FIREBASE_SETUP.md**, **FIRESTORE_SETUP.md** | Firebase |
