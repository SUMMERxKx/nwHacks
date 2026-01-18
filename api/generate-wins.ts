/**
 * POST /api/generate-wins — Body: { period: 'week'|'30' }. Header: Authorization: Bearer <idToken>.
 * Returns { wins, growthNotes }. Fallback { wins: [], growthNotes: [] } on error.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from './lib/admin';
import { getCheckInsByDateRange } from './lib/firestore';
import { buildMemorySnapshot } from './lib/memory';
import { getStartEndForPeriod } from './lib/dates';
import { createOpenRouterClient, chat } from './lib/openrouter';
import { serializeCheckIns } from './lib/serialize';
import type { CheckInData, Win, GrowthNote } from './lib/types';

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

  const body = (req.body || {}) as { period?: string };
  const period = body.period === 'week' ? 'week' : '30';

  try {
    const { start, end } = getStartEndForPeriod(period);
    const checkIns = (await getCheckInsByDateRange(uid, start, end)) as CheckInData[];
    const memory = buildMemorySnapshot(checkIns);
    const serialized = serializeCheckIns(checkIns);

    const system = `You extract wins (effort, consistency, emotional regulation) and growth notes (positive trends) from check-ins. Be specific and evidence-based.`;
    const userBlock = [
      '## Memory',
      JSON.stringify(memory),
      '',
      '## Check-ins',
      serialized,
      '',
      'Return JSON: { "wins": [ { "id":"1","title":"...","evidence":"...","date":"YYYY-MM-DD" } ], "growthNotes": [ { "id":"1","content":"..." } ] }. 1 to 5 wins, 1 to 4 growth notes. Dates from check-ins. No other text.',
    ].join('\n');

    const client = createOpenRouterClient();
    const raw = await chat(client, system, userBlock);
    const cleaned = raw.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
    const parsed = JSON.parse(cleaned) as { wins?: unknown[]; growthNotes?: unknown[] };
    const wins: Win[] = [];
    const growthNotes: GrowthNote[] = [];
    for (const w of parsed.wins || []) {
      const x = w as Record<string, unknown>;
      if (x && typeof x.title === 'string' && typeof x.evidence === 'string') {
        wins.push({ id: String(x.id ?? wins.length + 1), title: x.title, evidence: x.evidence, date: typeof x.date === 'string' ? x.date : start });
      }
    }
    for (const g of parsed.growthNotes || []) {
      const x = g as Record<string, unknown>;
      if (x && typeof x.content === 'string') {
        growthNotes.push({ id: String(x.id ?? growthNotes.length + 1), content: x.content });
      }
    }
    return res.status(200).json({ wins, growthNotes });
  } catch (e) {
    console.error('generate-wins error', e);
    return res.status(200).json({ wins: [], growthNotes: [] });
  }
}
