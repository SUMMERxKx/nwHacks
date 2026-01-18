/**
 * GET /api/health — 200 + { ok, api: true, env: { hasOpenRouter, hasFirebase } }.
 * Use to verify production env vars without exposing secrets.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
  const hasFirebase = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    ok: true,
    api: true,
    env: { hasOpenRouter, hasFirebase },
  });
}
