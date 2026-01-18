/**
 * POST /api/buddy-chat — Body: { message, contextDays: 7|30 }. Header: Authorization: Bearer <idToken>.
 * Returns { content }. Uses OpenRouter; fallback on error.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { auth } from './lib/admin';
import { getCheckInsByDateRange } from './lib/firestore';
import { buildMemorySnapshot } from './lib/memory';
import { getStartEndForContextDays } from './lib/dates';
import { createOpenRouterClient, chat } from './lib/openrouter';
import { serializeCheckIns } from './lib/serialize';
import type { CheckInData } from './lib/types';

const BUDDY_FALLBACK = "I'm having a moment — try again in a bit. Your check-ins are saved and I'll be here.";

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

  const body = (req.body || {}) as { message?: string; contextDays?: number };
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const contextDays = body.contextDays === 7 ? 7 : 30;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const { start, end } = getStartEndForContextDays(contextDays);
    const checkIns = await getCheckInsByDateRange(uid, start, end) as CheckInData[];
    const memory = buildMemorySnapshot(checkIns);
    const serialized = serializeCheckIns(checkIns);

    const system = `You are "Buddy", a reflective wellness companion. Use ONLY the provided check-ins and memory. Be calm, concise, and supportive. Ask reflective questions. Suggest at most ONE small experiment. No diagnosis. No medical or therapy advice. Do NOT invent facts or dates.`;
    const userBlock = [
      '## Memory (about this user)',
      `commonStressors: ${memory.commonStressors.join('; ')}`,
      `restoresEnergy: ${memory.restoresEnergy.join('; ')}`,
      `peakProductivity: ${memory.peakProductivity}`,
      `recentWins: ${memory.recentWins.join('; ')}`,
      '',
      '## Check-ins (last ' + contextDays + ' days)',
      serialized,
      '',
      '## User message',
      message,
    ].join('\n');

    const client = createOpenRouterClient();
    const content = await chat(client, system, userBlock);
    return res.status(200).json({ content });
  } catch (e) {
    console.error('buddy-chat error', e);
    return res.status(200).json({ content: BUDDY_FALLBACK });
  }
}
