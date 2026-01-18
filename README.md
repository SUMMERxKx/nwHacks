# Wellness Buddy

Daily check-ins (Firestore), AI Buddy, Patterns, Wins. Built with React, Firebase, and OpenAI.

---

## Quick start

```bash
bun install && bun run dev
```

- **`.env.local`**: Add Firebase and OpenAI keys (see `.env.example`)
- See **FIREBASE_SETUP.md** / **FIRESTORE_SETUP.md** for setup

---

## AI Integration (Buddy, Patterns, Wins)

AI runs locally in React using OpenAI API directly (development only):

1. **Get OpenAI API Key**: https://platform.openai.com/api-keys
2. **Add to `.env.local`**:
   ```
   VITE_OPENAI_API_KEY=sk-...your-key...
   ```
3. **Run locally**: `bun run dev` (localhost only)

The Buddy chat, Patterns, and Wins features use OpenAI's GPT models directly from your React app.

---

## Docs

| File | Purpose |
|------|--------|
| **PROJECT_OVERVIEW.md** | Status, structure, data flow |
| **README.md** | This file |
| **api/README.md** | /api routes, env, local |
| **functions/README.md** | Cloud Functions (Blaze only) |
| **FIREBASE_SETUP.md**, **FIRESTORE_SETUP.md** | Firebase |
