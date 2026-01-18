# Vercel production: get Buddy / Patterns / Wins working

On Vercel, the `/api` routes run as serverless. They **do not** use `.env` or `.env.local`; they use **Environment Variables** in the Vercel project.

---

## 1. Set env vars in Vercel

**Vercel Dashboard → Your project → Settings → Environment Variables**

Add these. Enable **Production** (and Preview if you use it).

| Name | Value | Notes |
|------|--------|-------|
| `VITE_FIREBASE_API_KEY` | (from your Firebase config) | So the frontend build gets it |
| `VITE_FIREBASE_AUTH_DOMAIN` | ... | |
| `VITE_FIREBASE_PROJECT_ID` | ... | Must match the service account’s `project_id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | ... | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ... | |
| `VITE_FIREBASE_APP_ID` | ... | |
| `VITE_FIREBASE_MEASUREMENT_ID` | (optional) | |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | From [OpenRouter](https://openrouter.ai/keys) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Full JSON** of the service account | Firebase Console → Project settings → Service accounts → Generate new private key. Paste the **entire** JSON. Multi-line is fine in Vercel. |

`FIREBASE_SERVICE_ACCOUNT_JSON` must be from the **same** Firebase project as `VITE_FIREBASE_PROJECT_ID`.

---

## 2. Redeploy

Env vars are applied only on the **next** deploy.

- **Deployments** → open the latest deployment → **⋮** → **Redeploy** (no need to clear cache if you only changed env),  
  or  
- Push a new commit.

---

## 3. Check that the API and env are OK

Open:

```
https://<your-vercel-app>.vercel.app/api/health
```

You should see JSON like:

```json
{ "ok": true, "api": true, "env": { "hasOpenRouter": true, "hasFirebase": true } }
```

- If `hasOpenRouter` or `hasFirebase` is `false`, that var is missing or not applied. Add/fix it in Vercel and **redeploy**.
- If you get 404, the `api/` routes are not deployed (check that the `api/` folder is in the repo and that Vercel is building from the right root).

---

## 4. Try Buddy in the app

Log in, open Buddy, send a message. If it still shows the fallback:

- In the browser: **DevTools → Network**. Find `POST .../api/buddy-chat`.  
  - **401** → token or Firebase project mismatch (e.g. `FIREBASE_SERVICE_ACCOUNT_JSON` from another project).  
  - **500** → check **Vercel → Project → Logs** (or the deployment’s **Functions** logs) for the real error.

---

## Checklist

- [ ] `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` set in Vercel (Production)
- [ ] All `VITE_FIREBASE_*` set so the frontend build works
- [ ] `project_id` in the service account JSON **equals** `VITE_FIREBASE_PROJECT_ID`
- [ ] Redeploy after changing env
- [ ] `/api/health` returns `hasOpenRouter: true`, `hasFirebase: true`
