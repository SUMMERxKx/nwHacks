/**
 * OpenRouter (OpenAI-compatible) client. OPENROUTER_API_KEY from env.
 */
import OpenAI from 'openai';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4.1-mini';
const TEMPERATURE = 0.4;

export function createOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  return new OpenAI({ apiKey, baseURL: OPENROUTER_BASE });
}

export async function chat(client: OpenAI, system: string, userContent: string): Promise<string> {
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const res = await client.chat.completions.create({
    model,
    temperature: TEMPERATURE,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent },
    ],
  });
  const text = res.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenRouter returned empty content');
  return text;
}
