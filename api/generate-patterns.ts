/**
 * POST /api/generate-patterns — Body: { period: 7|30 }. Header: Authorization: Bearer <idToken>.
 * Returns PatternInsight[]. Needs ≥3 check-ins; fallback [] on error.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from './lib/admin';
import { getCheckInsByDateRange } from './lib/firestore';
import { buildMemorySnapshot } from './lib/memory';
import { getStartEndForPeriod } from './lib/dates';
import { createOpenRouterClient, chat } from './lib/openrouter';
import { serializeCheckIns } from './lib/serialize';
import type { CheckInData, PatternInsight } from './lib/types';

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  let uid: string;
  try {
    const d = await auth.verifyIdToken(token);
    uid = d.uid;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const body = (req.body || {}) as { period?: number | string };
  const period = body.period === 7 || body.period === "7" ? 7 : 30;

  try {
    const { start, end } = getStartEndForPeriod(period);
    const checkIns = (await getCheckInsByDateRange(uid, start, end)) as CheckInData[];
    if (checkIns.length < 3) return res.status(200).json([]);

    const memory = buildMemorySnapshot(checkIns);
    const serialized = serializeCheckIns(checkIns);
    const system = `You analyze wellness check-ins and produce pattern insights. Evidence MUST reference the provided check-ins. No exaggeration. No clinical language.`;
    const userBlock = [
      '## Memory',
      JSON.stringify(memory),
      '',
      '## Check-ins',
      serialized,
      '',
      'Return a JSON array of 1 to 3 pattern objects. Each: { "id": "1", "title": "...", "meaning": "...", "evidence": ["quote or fact from check-ins"], "experiment": "one small testable action", "confidence": "Low" or "Medium" or "High" }. Only those confidence values. No other text.',
    ].join('\n');

    const client = createOpenRouterClient();
    const raw = await chat(client, system, userBlock);
    const cleaned = raw.replace(/^[\s\S]*?\[/, '[').replace(/]\s*[\s\S]*$/, ']');
    const arr = JSON.parse(cleaned) as unknown[];
    const out: PatternInsight[] = [];
    const valid: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High'];
    for (let i = 0; i < Math.min(3, arr.length); i++) {
      const o = arr[i] as Record<string, unknown>;
      if (o && typeof o.title === 'string' && typeof o.meaning === 'string' && Array.isArray(o.evidence)) {
        out.push({
          id: String(o.id ?? i + 1),
          title: o.title,
          meaning: o.meaning,
          evidence: (o.evidence as unknown[]).map((e) => String(e)).filter(Boolean),
          experiment: typeof o.experiment === 'string' ? o.experiment : '',
          confidence: valid.includes(o.confidence as 'Low' | 'Medium' | 'High') ? (o.confidence as 'Low' | 'Medium' | 'High') : 'Medium',
        });
      }
    }
    return res.status(200).json(out);
  } catch (e) {
    console.error('generate-patterns error', e);
    return res.status(200).json([]);
  }
}
