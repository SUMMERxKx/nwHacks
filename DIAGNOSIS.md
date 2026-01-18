# Root-Cause: Form Data Not Appearing in Buddy / Patterns / Wins

Form saves to Firestore and auth works, but Buddy (and Patterns, Wins) don’t see the data. Below are the most likely causes and how to check them.

---

## 1. **FIREBASE_SERVICE_ACCOUNT_JSON – Wrong Project (Most Likely)**

**What happens:**  
The API uses **Firebase Admin** and `FIREBASE_SERVICE_ACCOUNT_JSON`. Admin reads Firestore from the **project that the service account belongs to**.  
The **client** writes to the project in `VITE_FIREBASE_PROJECT_ID`.  
If the service account is from a **different** project, the API is reading a **different** Firestore that has no check-ins.

**Check:**
- Open the JSON for `FIREBASE_SERVICE_ACCOUNT_JSON` and find `"project_id"`.
- In `.env.local` (or wherever you set `VITE_FIREBASE_PROJECT_ID`), read that value.
- They must be **equal**. If not, generate a new **service account** from the **same** Firebase project as your app (Firebase Console → Project settings → Service accounts → Generate new private key) and put that JSON into `FIREBASE_SERVICE_ACCOUNT_JSON`.

**Note:** The API **bypasses** Firestore security rules. Rules are not the cause if the only problem is “API sees no data”; a project mismatch is.

---

## 2. **FIREBASE_SERVICE_ACCOUNT_JSON – Not Loaded by the API**

**What happens:**  
If the API (dev-api or Vercel) runs without `FIREBASE_SERVICE_ACCOUNT_JSON` set, Firebase Admin may not initialize correctly. `auth.verifyIdToken` or `db.collection(...).get()` can fail, and the handler returns the Buddy fallback or empty Patterns/Wins.

**Check:**
- **Local (dev-api):** In the terminal where `npm run dev:api` (or `dev:all`) runs, you must **not** see:
  - `[dev-api] FIREBASE_SERVICE_ACCOUNT_JSON not set`
- `dev-api` loads `.env` and `.env.local` from the **project root**. Put `FIREBASE_SERVICE_ACCOUNT_JSON` in `.env` or `.env.local` there.  
  (The client’s `VITE_*` vars can stay in `.env.local`; the API only needs `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON`.)
- **Vercel:** Project → Settings → Environment Variables. `FIREBASE_SERVICE_ACCOUNT_JSON` must be set (you can paste the full JSON). Redeploy after changing env.

---

## 3. **Paths – Client vs API**

All of these use the **same** path: `users/{userId}/checkIns` (doc id = `date` YYYY-MM-DD).

| Layer           | Path / usage |
|----------------|--------------|
| Form save      | `users/{auth.currentUser.uid}/checkIns/{date}` via `firebaseService.saveCheckIn` |
| API (Buddy etc.) | `users/{uid from verifyIdToken}/checkIns` in `api/lib/firestore.ts` |
| useCheckInData | `users/{auth.currentUser.uid}/checkIns` via `firebaseService.getAllCheckIns` |

There is no path mismatch in the code. If the **service account’s project** is wrong, the API will read from the wrong DB, not from a different path in the same DB.

---

## 4. **Firestore Security Rules (Client-Only)**

Rules do **not** apply to the API (Admin bypasses them). They **do** apply to:

- `firebaseService.getAllCheckIns` (used by `useCheckInData` in Patterns, Wins)
- `firebaseService.getCheckInByDate` (used on Home to load a check-in)

If **read** is denied, those return `[]` or `null`. You’d see:

- Patterns: “Not enough data” even when you have 3+ check-ins.
- Wins: similar empty/disabled state.
- Home: existing check-in not loading for the selected day.

**Check (Firebase Console → Firestore → Rules):**

```txt
match /users/{userId}/checkIns/{checkInId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

(or the equivalent with `{document=**}` if you use that). Both **read** and **write** must be allowed for `request.auth.uid == userId`. A “write-only” rule would explain client reads failing; it would **not** explain the API seeing no data (API ignores rules).

---

## 5. **API Not Running or Not Reachable**

**What happens:**  
If `/api/buddy-chat` (and the other `/api/*` routes) are not running or the frontend can’t reach them, you get:

- Buddy: “I’m having a moment…” (from the frontend `catch` or from the API’s fallback).
- Patterns / Wins: empty or “Not enough data” (depending on how the error is handled).

**Check:**
- **Local:**  
  - Run `npm run dev:api` (or `npm run dev:all`).  
  - In the browser: DevTools → Network. Send a Buddy message and confirm a `POST /api/buddy-chat` with status **200**.  
  - If you see 404 or 502, the API is not up or the proxy is wrong.
- **Vercel:**  
  - Confirm the project is deployed and `/api/*` are part of that deployment.  
  - If the app is on another host, `VITE_AI_API_URL` must point to the Vercel base URL so `fetch(\`${BASE}/api/buddy-chat\`, …)` hits the right origin.

---

## 6. **Env Variable Scope (Vite, Not Next.js)**

- **Client (browser):** Only `VITE_*` vars are available. `VITE_FIREBASE_*` and `VITE_AI_API_URL` are correct.
- **API (Node: dev-api or Vercel):**  
  - `OPENROUTER_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` are **server-only**.  
  - Do **not** prefix them with `VITE_` or `NEXT_PUBLIC_`.  
  - They should be in `.env` / `.env.local` for dev-api, and in Vercel Environment Variables for production.

There is no `NEXT_PUBLIC_` in this project; the app uses Vite.

---

## 7. **Listeners / Queries**

- **Buddy:** Does **not** read Firestore in the client. It calls `POST /api/buddy-chat` once per message. The API does a **one-shot** `get()` on `users/{uid}/checkIns` and then filters by date. No `onSnapshot` or long-lived listener.
- **Patterns / Wins:**  
  - **Client:** `useCheckInData` → `getAllCheckIns` → `getDocs(collection(db, 'users', userId, 'checkIns'))` (one-shot, no `where`).  
  - **AI:** Same as Buddy: API does a one-shot read.

So the problem is not “listener not subscribed” or a mismatched `onSnapshot`. It’s either:

- API reading from the **wrong project** (see §1), or  
- API not running / not receiving the request (see §5), or  
- Client reads blocked by **rules** (see §4).

---

## 8. **UID Mismatch**

- **Client:** `auth.currentUser.uid` for save and for `getIdToken()` sent to the API.
- **API:** `uid` from `auth.verifyIdToken(token)` (Admin, same project as the Id token).

If the **service account’s project** does **not** match the project that issued the token, `verifyIdToken` fails with 401, and you’d get “Invalid token” / Buddy fallback, not “data from another user.”  
So “wrong user’s data” is unlikely; **wrong project** (and thus empty data) is the main risk.

---

## 9. **Composite Index (Client-Only)**

`firebaseService.getCheckInsByDateRange` uses:

```ts
where('date', '>=', startDate), where('date', '<=', endDate)
```

That needs a **composite index** in Firestore. If it’s missing, `getDocs` **throws**; you would see an error in the console, not “silent empty.”  
The **API** does **not** use `where` on `date`; it loads all check-ins and filters in memory, so it does **not** depend on this index.  
If you never call `getCheckInsByDateRange` from the client in the flow that’s broken, the index is unlikely to be the cause. If you do and see a clear index error, create the index as suggested in the error message.

---

## 10. **Date Format and Range**

- **Form:** `dateKey = selectedDate.toISOString().split('T')[0]` → `YYYY-MM-DD` (UTC).
- **API:** `getStartEndForContextDays(7|30)` uses `toISOString().slice(0, 10)` → `YYYY-MM-DD` (UTC).  
  Filter: `c.date >= start && c.date <= end`.

If `date` in the document is missing or in another format, the API’s filter could drop those docs. In your `firebaseService.saveCheckIn` you do `date: checkInData.date`, so `date` should be present and in `YYYY-MM-DD`.  
The only edge case is timezone: `toISOString()` is UTC, so in some timezones the stored `date` can shift by a day. That usually doesn’t cause “no data at all” if you have recent check-ins.

---

## Checklist (In Order)

1. **Service account project:**  
   `project_id` in `FIREBASE_SERVICE_ACCOUNT_JSON` **===** `VITE_FIREBASE_PROJECT_ID`.

2. **API sees the env:**  
   - Local: no `[dev-api] FIREBASE_SERVICE_ACCOUNT_JSON not set`; vars in `.env` or `.env.local` in project root.  
   - Vercel: `FIREBASE_SERVICE_ACCOUNT_JSON` and `OPENROUTER_API_KEY` in project env; redeploy after changes.

3. **API is up and reachable:**  
   - Local: `npm run dev:api` (or `dev:all`); Network tab shows `POST /api/buddy-chat` 200.  
   - Vercel: `/api/buddy-chat` returns 200 when called with a valid `Authorization: Bearer <idToken>`.

4. **Firestore rules:**  
   - `read` (and `write`) allowed for `users/{userId}/checkIns/{checkInId}` when `request.auth.uid == userId`.  
   - This affects client `getAllCheckIns` / `getCheckInByDate`; it does **not** affect the API.

5. **Paths:**  
   - No code changes needed; all use `users/{userId}/checkIns`.  
   - If 1–4 are correct and data still doesn’t show, then re-check that the **Firestore database** you’re inspecting in the console is the one for `VITE_FIREBASE_PROJECT_ID` (and for the service account’s `project_id`).

---

## Quick Sanity Check in Firestore Console

1. Open [Firebase Console](https://console.firebase.google.com) and select the project that matches `VITE_FIREBASE_PROJECT_ID`.
2. Firestore Database → `users` → `<your-uid>` → `checkIns`.  
   - You should see documents with IDs like `2025-01-15` and fields `date`, `ratings`, `prompts`, etc.
3. In `FIREBASE_SERVICE_ACCOUNT_JSON`, confirm `project_id` is exactly this project.  
   If the API’s `project_id` points to another project, you’ll be reading an empty `users` collection there, which matches “form data not appearing in Buddy.”
