# Wellness Buddy – Cloud Functions (Blaze only)

**For Spark (free) plan:** use **`api/`** (Vercel serverless) instead — see **api/README.md**.  
Cloud Functions require the **Blaze** plan.

---

## File structure

```
functions/
├── README.md           # This file
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts        # Dotenv load; callables: buddyChat, generatePatterns, generateWins
    └── lib/
        ├── types.ts    # CheckInData, MemorySnapshot, PatternInsight, Win, GrowthNote
        ├── openrouter.ts   # OpenRouter client + chat()
        ├── firestore.ts    # getCheckInsByDateRange (Admin SDK)
        ├── memory.ts       # buildMemorySnapshot(checkIns)
        └── dates.ts        # getStartEndForPeriod, getStartEndForContextDays
```

---

## 1. Install and build

```bash
cd functions && npm install && npm run build
```

---

## 2. Option A: Deploy (use real Cloud Functions)

Your frontend calls **deployed** functions. The OpenRouter key must be set in the **Cloud** (not in a local `.env`).

1. **Deploy**
   ```bash
   firebase deploy --only functions
   ```

2. **Set `OPENROUTER_API_KEY` in Firebase**
   - Firebase Console → Build → Functions → select `buddyChat` (or any of the three) → Edit → Runtime environment variables
   - Add: `OPENROUTER_API_KEY` = `sk-or-v1-...`
   - Do the same for `generatePatterns` and `generateWins`, or set it at project level if your setup allows.

3. **Run the app**
   - `npm run dev` (from project root).  
   - Do **not** set `VITE_USE_FUNCTIONS_EMULATOR`. The app will use the deployed functions.

---

## 3. Option B: Local emulator (no deploy)

Your frontend calls the **Functions emulator** on your machine. The emulator loads the key from a local `.env`.

1. **Put the key in a local `.env`**
   - Either **`functions/.env`**:
     ```
     OPENROUTER_API_KEY=sk-or-v1-...
     ```
   - Or the **project root `.env`** (same file as `VITE_FIREBASE_*`). The code will use it if `functions/.env` doesn’t define `OPENROUTER_API_KEY`.

2. **Point the frontend at the emulator**
   - In the **project root** `.env`, add:
     ```
     VITE_USE_FUNCTIONS_EMULATOR=true
     ```

3. **Start the emulator and the app**
   - Terminal 1 (from project root):
     ```bash
     firebase emulators:start --only functions
     ```
   - Terminal 2 (from project root):
     ```bash
     npm run dev
     ```

4. **Use the app**
   - Buddy, Patterns, and Wins will call `localhost:5001` (Functions emulator), which reads `OPENROUTER_API_KEY from your `.env` and calls OpenRouter.

---

## Summary

| Mode    | OPENROUTER_API_KEY location     | `VITE_USE_FUNCTIONS_EMULATOR` | Commands                                                                 |
|---------|----------------------------------|-------------------------------|---------------------------------------------------------------------------|
| Deploy  | Firebase Console (env vars)     | not set                       | `firebase deploy --only functions` then `npm run dev`                     |
| Emulator| `functions/.env` or root `.env` | `true`                        | `firebase emulators:start --only functions` and `npm run dev` (2 terminals)|

---

## Callable functions

- `buddyChat({ message, contextDays })` → `{ content }`
- `generatePatterns({ period: 7|30 })` → `PatternInsight[]`
- `generateWins({ period: 'week'|'30' })` → `{ wins, growthNotes }`
