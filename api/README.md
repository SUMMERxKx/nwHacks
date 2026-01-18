# API (Vercel serverless) — for Spark plan

Replaces Firebase Cloud Functions so the project can stay on the **Spark** plan. Deploy the app to **Vercel**; the `api/` folder becomes `/api/*` routes.

## Routes

- **GET /api/health** — No auth. Returns `{ ok, api: true, env: { hasOpenRouter, hasFirebase } }`. Use in production to verify env vars.
- **POST /api/buddy-chat** — Body: `{ message, contextDays: 7|30 }`, Header: `Authorization: Bearer <idToken>`. Returns `{ content }`.
- **POST /api/generate-patterns** — Body: `{ period: 7|30 }`, Header: `Authorization: Bearer <idToken>`. Returns `PatternInsight[]`.
- **POST /api/generate-wins** — Body: `{ period: 'week'|'30' }`, Header: `Authorization: Bearer <idToken>`. Returns `{ wins, growthNotes }`.

## Env

### Local (`.env` or `.env.local` in project root)

Create or edit `.env` or `.env.local` (both are gitignored). `dev-api` loads both; `.env.local` overrides `.env`.

- **OPENROUTER_API_KEY** — From [OpenRouter keys](https://openrouter.ai/keys). Example: `sk-or-v1-...`
- **FIREBASE_SERVICE_ACCOUNT_JSON** — Full JSON of the **service account** (Firebase Console → Project settings → **Service accounts** → **Generate new private key**). Must be the same project as your app.  
  - In `.env` put it on **one line** (minified, no real line breaks). Example:  
    `FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"my-app",...}`

See **env.example** in the project root for a template.

### Vercel (deployed)

Vercel → Project → Settings → **Environment Variables**: add `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` (you can paste the JSON with line breaks in the Vercel UI).

## Local

- **`npm run dev:api`** — Express server for `/api/*` on port 3000. No Vercel CLI. Put `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env`.
- **`npm run dev:all`** — Runs `dev:api` and `npm run dev` together; Vite proxies `/api` to the dev-api.
- **`vercel dev`** — Alternative (requires `npx vercel login`).

## See also

- `PROJECT_OVERVIEW.md` — Architecture and file structure.
- `functions/` — Cloud Functions version for **Blaze**; use that if you move off Spark.
