/**
 * Cloud Functions entry. Loads OPENROUTER_API_KEY from functions/.env or project .env,
 * then exports callables: buddyChat, generatePatterns, generateWins.
 * Each: auth, fetch check-ins (Firestore), build MemorySnapshot, call OpenRouter, return JSON.
 */
import dotenv from 'dotenv';
import path from 'path';

// Load OPENROUTER_API_KEY: try functions/.env, then project root .env (for emulator or any .env)
dotenv.config({ path: path.resolve(process.cwd(), 'functions', '.env') });
if (!process.env.OPENROUTER_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

import * as functions from 'firebase-functions';
import { createOpenRouterClient, chat } from './lib/openrouter';
import { getCheckInsByDateRange } from './lib/firestore';
import { buildMemorySnapshot } from './lib/memory';
import { getStartEndForContextDays, getStartEndForPeriod } from './lib/dates';
import type { CheckInData, PatternInsight, Win, GrowthNote } from './lib/types';

const BUDDY_FALLBACK = "I'm having a moment — try again in a bit. Your check-ins are saved and I'll be here.";
const PATTERNS_FALLBACK: PatternInsight[] = [];
const WINS_FALLBACK = { wins: [] as Win[], growthNotes: [] as GrowthNote[] };

/** Turn check-ins into a readable block for the LLM. */
function serializeCheckIns(checkIns: CheckInData[]): string {
  if (checkIns.length === 0) return 'No check-ins in this period.';
  return checkIns
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c) => {
      const r = c.ratings || {};
      const p = c.prompts || {};
      return [
        `[${c.date}]`,
        `ratings: stress=${r.stress} energy=${r.energy} mood=${r.mood} focus=${r.focus}`,
        `proud: ${p.proud || '-'}`,
        `stressed: ${p.stressed || '-'}`,
        `challenge: ${p.challenge || '-'}`,
        `grateful: ${p.grateful || '-'}`,
        `intention: ${p.intention || '-'}`,
      ].join('\n');
    })
    .join('\n\n---\n\n');
}

// ---------- buddyChat ----------
export const buddyChat = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  const contextDays = data?.contextDays === 7 ? 7 : 30;
  if (!message) {
    throw new functions.https.HttpsError('invalid-argument', 'message is required');
  }

  try {
    const { start, end } = getStartEndForContextDays(contextDays);
    const checkIns = await getCheckInsByDateRange(context.auth.uid, start, end);
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
    return { content };
  } catch (e) {
    functions.logger.error('buddyChat error', e);
    return { content: BUDDY_FALLBACK };
  }
});

// ---------- generatePatterns ----------
export const generatePatterns = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  const period = data?.period === 7 ? 7 : 30;

  try {
    const { start, end } = getStartEndForPeriod(period);
    const checkIns = await getCheckInsByDateRange(context.auth.uid, start, end);
    if (checkIns.length < 3) {
      return PATTERNS_FALLBACK;
    }
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
    return out;
  } catch (e) {
    functions.logger.error('generatePatterns error', e);
    return PATTERNS_FALLBACK;
  }
});

// ---------- generateWins ----------
export const generateWins = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }
  const period = data?.period === 'week' ? 'week' : '30';

  try {
    const { start, end } = getStartEndForPeriod(period);
    const checkIns = await getCheckInsByDateRange(context.auth.uid, start, end);
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
    return { wins, growthNotes };
  } catch (e) {
    functions.logger.error('generateWins error', e);
    return WINS_FALLBACK;
  }
});
