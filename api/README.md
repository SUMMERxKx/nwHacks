# API (Vercel serverless) — for Spark plan

Replaces Firebase Cloud Functions so the project can stay on the **Spark** plan. Deploy the app to **Vercel**; the `api/` folder becomes `/api/*` routes.

## Routes

- **POST /api/buddy-chat** — Body: `{ message, contextDays: 7|30 }`, Header: `Authorization: Bearer <idToken>`. Returns `{ content }`.
- **POST /api/generate-patterns** — Body: `{ period: 7|30 }`, Header: `Authorization: Bearer <idToken>`. Returns `PatternInsight[]`.
- **POST /api/generate-wins** — Body: `{ period: 'week'|'30' }`, Header: `Authorization: Bearer <idToken>`. Returns `{ wins, growthNotes }`.

## Env (Vercel project)

Set in Vercel → Project → Settings → Environment Variables:

- **OPENROUTER_API_KEY** — OpenRouter API key.
- **FIREBASE_SERVICE_ACCOUNT_JSON** — Full JSON string of the Firebase service account key (Project settings → Service accounts → Generate new private key). Used to read Firestore and verify ID tokens.

## Local

- **`vercel dev`** — Serves the Vite app and `/api/*`. Set the same env in `.env` (Vercel loads it).
- **`npm run dev`** — Vite only; `/api` is not available, so Buddy / Patterns / Wins will fail.

## See also

- `PROJECT_OVERVIEW.md` — Architecture and file structure.
- `functions/` — Cloud Functions version for **Blaze**; use that if you move off Spark.
