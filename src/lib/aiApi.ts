/**
 * AI API: calls /api/buddy-chat, /api/generate-patterns, /api/generate-wins (Vercel serverless).
 * For Spark plan: no Cloud Functions; use these APIs. Auth: Bearer <idToken>.
 * Base: VITE_AI_API_URL (optional; '' = same-origin /api).
 */
import { auth } from './firebase';
import type { PatternInsight, Win, GrowthNote } from './mockData';

const BASE = (import.meta.env.VITE_AI_API_URL as string) || '';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function buddyChat(params: { message: string; contextDays: 7 | 30 }): Promise<{ content: string }> {
  const res = await fetch(`${BASE}/api/buddy-chat`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ message: params.message, contextDays: params.contextDays }),
  });
  if (!res.ok) throw new Error(res.statusText || 'buddy-chat failed');
  const data = (await res.json()) as { content?: string };
  return { content: typeof data?.content === 'string' ? data.content : '' };
}

export async function generatePatterns(params: { period: 7 | 30 }): Promise<PatternInsight[]> {
  const res = await fetch(`${BASE}/api/generate-patterns`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ period: params.period }),
  });
  if (!res.ok) throw new Error(res.statusText || 'generate-patterns failed');
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? data : [];
}

export async function generateWins(params: { period: 'week' | '30' }): Promise<{ wins: Win[]; growthNotes: GrowthNote[] }> {
  const res = await fetch(`${BASE}/api/generate-wins`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ period: params.period }),
  });
  if (!res.ok) throw new Error(res.statusText || 'generate-wins failed');
  const d = (await res.json()) as { wins?: Win[]; growthNotes?: GrowthNote[] };
  return { wins: Array.isArray(d?.wins) ? d.wins : [], growthNotes: Array.isArray(d?.growthNotes) ? d.growthNotes : [] };
}
