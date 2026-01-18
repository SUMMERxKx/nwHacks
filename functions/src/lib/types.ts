/**
 * Types used by callables; aligned with frontend (mockData, firebaseService).
 * CheckInData: Firestore; MemorySnapshot: derived; PatternInsight, Win, GrowthNote: AI outputs.
 */

export type PromptId = 'proud' | 'stressed' | 'challenge' | 'grateful' | 'intention';

export interface PromptResponse {
  id: PromptId;
  question: string;
  answer: string;
}

type LegacyPrompts = { proud?: string; stressed?: string; challenge?: string; grateful?: string; intention?: string };

export interface CheckInData {
  id?: string;
  userId: string;
  date: string;
  ratings: { stress: number; energy: number; mood: number; focus: number };
  prompts: PromptResponse[] | LegacyPrompts;
  createdAt: unknown;
  updatedAt: unknown;
}

const DEFAULT_QUESTIONS: Record<PromptId, string> = {
  proud: 'What are you proud of today?',
  stressed: 'Did you feel stressed? Why?',
  challenge: 'What was the biggest challenge?',
  grateful: "One thing you're grateful for",
  intention: 'One intention for tomorrow',
};

export const PROMPT_ORDER: PromptId[] = ['proud', 'stressed', 'challenge', 'grateful', 'intention'];

export const DEFAULT_PROMPTS: PromptResponse[] = PROMPT_ORDER.map((id) => ({
  id,
  question: DEFAULT_QUESTIONS[id],
  answer: '',
}));

export function normalizePrompts(input?: PromptResponse[] | LegacyPrompts | null): PromptResponse[] {
  if (Array.isArray(input)) {
    return PROMPT_ORDER.map((id) => {
      const found = input.find((p) => p.id === id);
      const question = found?.question?.trim() ? found.question : DEFAULT_QUESTIONS[id];
      const answer = typeof found?.answer === 'string' ? found.answer : '';
      return { id, question, answer };
    });
  }

  if (input && typeof input === 'object') {
    return PROMPT_ORDER.map((id) => ({
      id,
      question: DEFAULT_QUESTIONS[id],
      answer: typeof (input as LegacyPrompts)[id] === 'string' ? ((input as LegacyPrompts)[id] as string) : '',
    }));
  }

  return DEFAULT_PROMPTS.map((p) => ({ ...p }));
}

export function promptAnswer(prompts: PromptResponse[] | LegacyPrompts | undefined, id: PromptId): string {
  if (Array.isArray(prompts)) {
    const found = prompts.find((p) => p.id === id);
    if (found?.answer) return found.answer;
  } else if (prompts && typeof prompts === 'object') {
    const val = (prompts as LegacyPrompts)[id];
    if (typeof val === 'string') return val;
  }
  return '';
}

export interface MemorySnapshot {
  commonStressors: string[];
  restoresEnergy: string[];
  peakProductivity: string;
  recentWins: string[];
}

export interface PatternInsight {
  id: string;
  title: string;
  meaning: string;
  evidence: string[];
  experiment: string;
  confidence: 'Low' | 'Medium' | 'High';
}

export interface Win {
  id: string;
  title: string;
  evidence: string;
  date: string;
}

export interface GrowthNote {
  id: string;
  content: string;
}
