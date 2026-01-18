/**
 * POST /api/generate-blind-spots — Body: { period: 'week'|'30' }. Header: Authorization: Bearer <idToken>.
 * Returns { blindSpots, awarenessNotes }. Fallback { blindSpots: [], awarenessNotes: [] } on error.
 * 
 * SAFETY CONSTRAINTS:
 * - Constructive, neutral, and supportive analysis only
 * - No suicidal, self-harm, or hopeless language
 * - Avoid harsh judgments, blame, or negative character statements
 * - Frame insights as observations and possibilities, not diagnoses or conclusions
 * - Focus on actionable, growth-oriented suggestions
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from './lib/admin';
import { getCheckInsByDateRange } from './lib/firestore';
import { buildMemorySnapshot } from './lib/memory';
import { getStartEndForPeriod } from './lib/dates';
import { createOpenRouterClient, chat } from './lib/openrouter';
import { serializeCheckIns } from './lib/serialize';
import type { CheckInData, BlindSpot, AwarenessNote } from './lib/types';

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

    const system = `You are a thoughtful reflection analyst helping users build self-awareness. You identify potential blind spots—patterns, habits, or perspectives they might not notice themselves—that could be limiting their progress or causing unintended friction.

CRITICAL SAFETY RULES:
1. Use CONSTRUCTIVE, NEUTRAL, and SUPPORTIVE language only
2. NEVER include language about suicide, self-harm, hopelessness, or despair
3. NEVER use harsh judgments, blame, or negative character statements
4. Frame insights as OBSERVATIONS and POSSIBILITIES, not diagnoses or conclusions
5. Focus on ACTIONABLE, GROWTH-ORIENTED suggestions rather than problems
6. Help build awareness and self-understanding without causing distress
7. Always maintain a tone of curiosity and possibility, never judgment
8. If no clear blind spots emerge, return empty arrays rather than forcing observations

Your goal is gentle awareness-building that empowers growth.`;

    const userBlock = [
      '## Memory',
      JSON.stringify(memory),
      '',
      '## Check-ins',
      serialized,
      '',
      'Analyze these check-ins for potential blind spots or overlooked patterns that may be limiting progress. Look for:',
      '- Patterns in stress responses that might benefit from awareness',
      '- Energy drains that could be addressed with small adjustments',
      '- Opportunities for perspective shifts that could reduce friction',
      '- Habits or routines that might be creating unintended obstacles',
      '',
      'Return JSON: { "blindSpots": [ { "id":"1","title":"...","observation":"...","suggestion":"...","date":"YYYY-MM-DD" } ], "awarenessNotes": [ { "id":"1","content":"..." } ] }. 1 to 4 blind spots, 1 to 3 awareness notes. Dates from check-ins. Be gentle, constructive, and supportive. No other text.',
    ].join('\n');

    const client = createOpenRouterClient();
    const raw = await chat(client, system, userBlock);
    const cleaned = raw.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
    const parsed = JSON.parse(cleaned) as { blindSpots?: unknown[]; awarenessNotes?: unknown[] };
    const blindSpots: BlindSpot[] = [];
    const awarenessNotes: AwarenessNote[] = [];
    for (const b of parsed.blindSpots || []) {
      const x = b as Record<string, unknown>;
      if (x && typeof x.title === 'string' && typeof x.observation === 'string' && typeof x.suggestion === 'string') {
        blindSpots.push({ 
          id: String(x.id ?? blindSpots.length + 1), 
          title: x.title, 
          observation: x.observation,
          suggestion: x.suggestion,
          date: typeof x.date === 'string' ? x.date : start 
        });
      }
    }
    for (const a of parsed.awarenessNotes || []) {
      const x = a as Record<string, unknown>;
      if (x && typeof x.content === 'string') {
        awarenessNotes.push({ id: String(x.id ?? awarenessNotes.length + 1), content: x.content });
      }
    }
    return res.status(200).json({ blindSpots, awarenessNotes });
  } catch (e) {
    console.error('generate-blind-spots error', e);
    return res.status(200).json({ blindSpots: [], awarenessNotes: [] });
  }
}
