// PromptId is flexible to allow user-added questions while keeping backward compatibility.
export type PromptId = 'proud' | 'stressed' | 'challenge' | 'grateful' | 'intention' | 'journal' | string;

export interface PromptResponse {
  id: PromptId;
  question: string;
  answer: string;
}

const BASE_DEFAULT_QUESTIONS: Record<string, string> = {
  proud: 'What are you proud of today?',
  stressed: 'Did you feel stressed? Why?',
  challenge: 'What was the biggest challenge?',
  grateful: "One thing you're grateful for",
  intention: 'One intention for tomorrow',
  journal: 'Free journal space for anything on your mind',
};

export const PROMPT_ORDER: PromptId[] = ['proud', 'stressed', 'challenge', 'grateful', 'intention', 'journal'];

export const DEFAULT_PROMPTS: PromptResponse[] = PROMPT_ORDER.map((id) => ({
  id,
  question: BASE_DEFAULT_QUESTIONS[id] ?? 'Journal',
  answer: '',
}));

export function buildPromptsFromTemplate(template: PromptResponse[]): PromptResponse[] {
  return template.map((p) => ({
    id: p.id,
    question: p.question.trim() || 'Journal',
    answer: '',
  }));
}

export function normalizePrompts(input?: unknown): PromptResponse[] {
  if (Array.isArray(input)) {
    return PROMPT_ORDER.map((id) => {
      const found = (input as unknown[]).find((p) => (p as Record<string, unknown>)?.id === id) as Partial<PromptResponse> | undefined;
      const question = typeof found?.question === 'string' && found.question.trim() ? found.question : (BASE_DEFAULT_QUESTIONS[id] ?? 'Journal');
      const answer = typeof found?.answer === 'string' ? found.answer : '';
      return { id, question, answer };
    });
  }

  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    return PROMPT_ORDER.map((id) => ({
      id,
      question: BASE_DEFAULT_QUESTIONS[id] ?? 'Journal',
      answer: typeof obj[id] === 'string' ? (obj[id] as string) : '',
    }));
  }

  return DEFAULT_PROMPTS.map((p) => ({ ...p }));
}

export function getPromptAnswer(prompts: PromptResponse[] | Record<string, unknown> | undefined, id: PromptId): string {
  if (Array.isArray(prompts)) {
    const found = prompts.find((p) => p.id === id);
    if (found && typeof found.answer === 'string') return found.answer;
  } else if (prompts && typeof prompts === 'object') {
    const val = (prompts as Record<string, unknown>)[id];
    if (typeof val === 'string') return val;
  }
  return '';
}
