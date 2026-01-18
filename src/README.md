# Frontend (src/)

- **main.tsx** — Entry; mounts `App`.
- **App.tsx** — Providers (Query, Tooltip, Toaster, Router), routing, `AppLayout`. `/login` → `Login`; `/`, `/buddy`, `/patterns`, `/wins` → `ProtectedRoute` + page; `*` → `NotFound`.
- **pages/** — `Login`, `Home` (check-in), `Buddy`, `Patterns`, `Wins`, `NotFound`.
- **components/** — `ProtectedRoute`, `layout/AppLayout` + `TabNavigation`, `settings/SettingsModal`, `ui/*` (shadcn).
- **hooks/** — `useCheckInData` (Firestore check-ins, getStreakCount, getCheckInsByDateRange).
- **lib/** — `firebase` (app, auth, db, analytics), `firebaseService` (CRUD check-ins), `aiApi` (fetch /api/buddy-chat, /api/generate-patterns, /api/generate-wins), `mockData` (types + mocks), `utils`.

See **PROJECT_OVERVIEW.md** at the repo root for the full tree and data flow.
