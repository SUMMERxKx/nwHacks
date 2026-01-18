/**
 * Local API server for /api/*. Run: npm run dev:api
 * No Vercel CLI needed. Loads .env then .env.local; requires OPENROUTER_API_KEY and FIREBASE_SERVICE_ACCOUNT_JSON.
 */
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true }); // FIREBASE_SERVICE_ACCOUNT_JSON, OPENROUTER_API_KEY
import express from "express";
import type { Request, Response } from "express";
// @ts-expect-error — default export; req/res match Vercel shape for our handlers
import buddyChatHandler from "../api/buddy-chat";
// @ts-expect-error
import generatePatternsHandler from "../api/generate-patterns";
// @ts-expect-error
import generateWinsHandler from "../api/generate-wins";

function adaptReq(r: Request) {
  return { method: r.method, headers: r.headers, body: r.body };
}
function adaptRes(r: Response) {
  return {
    setHeader: (a: string, b: string) => r.setHeader(a, b),
    status: (c: number) => ({
      json: (o: unknown) => r.status(c).json(o),
      end: () => r.status(c).end(),
    }),
  };
}

const app = express();
app.use(express.json());

const run = (h: (a: unknown, b: unknown) => Promise<void>, req: Request, res: Response) =>
  h(adaptReq(req), adaptRes(res)).catch((e) => {
    console.error("[dev-api]", e);
    if (!res.headersSent) res.status(500).json({ error: "Internal error" });
  });

app.all("/api/buddy-chat", (req, res) => run(buddyChatHandler, req, res));
app.all("/api/generate-patterns", (req, res) => run(generatePatternsHandler, req, res));
app.all("/api/generate-wins", (req, res) => run(generateWinsHandler, req, res));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[dev-api] http://127.0.0.1:${PORT} — /api/buddy-chat, /api/generate-patterns, /api/generate-wins`);
  if (!process.env.OPENROUTER_API_KEY) console.warn("[dev-api] OPENROUTER_API_KEY not set");
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) console.warn("[dev-api] FIREBASE_SERVICE_ACCOUNT_JSON not set");
});
