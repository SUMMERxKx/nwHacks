/**
 * Local AI API service for development
 * Calls OpenRouter API directly from React (development only)
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CheckInData {
  date: string;
  ratings: {
    mood: number;
    stress: number;
    energy: number;
  };
  prompts: {
    proud: string;
  };
}

async function callOpenAI(messages: Message[], model = 'gpt-3.5-turbo') {
  if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY is not set');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Buddy Chat
export async function buddyChat(userMessage: string, conversationHistory: Message[]) {
  const systemPrompt = {
    role: 'system' as const,
    content: `You are a thoughtful reflection buddy. You help users reflect on their day, understand patterns, and grow. 
Be warm, supportive, and insightful. Keep responses concise (2-3 sentences).`
  };

  const messages = [
    systemPrompt,
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  return callOpenAI(messages);
}

// Generate Patterns
export async function generatePatterns(checkInData: CheckInData[]) {
  const dataStr = checkInData.map(c => 
    `Date: ${c.date}, Mood: ${c.ratings.mood}, Stress: ${c.ratings.stress}, Energy: ${c.ratings.energy}, Notes: ${c.prompts.proud}`
  ).join('\n');

  const prompt = `Analyze these daily check-ins and identify 3 key patterns or insights:
${dataStr}

Respond with a JSON array of 3 objects with: {"pattern": "...", "insight": "...", "confidence": 0-1}`;

  const response = await callOpenAI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch {
    return [{ pattern: 'Reflection needed', insight: response, confidence: 0.8 }];
  }
}

// Generate Wins
export async function generateWins(checkInData: CheckInData[]) {
  const dataStr = checkInData.map(c => 
    `${c.date}: Proud of: ${c.prompts.proud}`
  ).join('\n');

  const prompt = `Based on these daily reflections, extract and celebrate 3 key wins or achievements:
${dataStr}

Respond with a JSON array of 3 objects with: {"win": "...", "impact": "...", "category": ""}`;

  const response = await callOpenAI([
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(response);
  } catch {
    return [{ win: 'Keep reflecting!', impact: response, category: 'progress' }];
  }
}
