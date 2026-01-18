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
    focus: number;
  };
  prompts: {
    proud: string;
    stressed: string;
    challenge: string;
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
export async function buddyChat(userMessage: string, conversationHistory: Message[], checkInData?: CheckInData[]) {
  let systemContent = `You are a positive, supportive memory buddy. You help users reflect on their mood, plan ahead, and notice patterns in a warm and encouraging way. Always be positive and uplifting. Focus on:
- Reflecting on their current mood and feelings
- Helping them plan and set intentions
- Noticing positive patterns in their check-ins
- Being encouraging and supportive

Keep responses concise (2-3 sentences) and always end on a positive note.`;

  if (checkInData && checkInData.length > 0) {
    const recentCheckIns = checkInData.slice(-7).map(c => 
      `${c.date}: Mood ${c.ratings.mood}/10, Stress ${c.ratings.stress}/10, Energy ${c.ratings.energy}/10, Focus ${c.ratings.focus}/10. Proud: ${c.prompts.proud}, Grateful: ${c.prompts.grateful}, Intention: ${c.prompts.intention}`
    ).join('\n');
    
    systemContent += `\n\nUser's recent check-ins for context (focus on positive aspects):\n${recentCheckIns}`;
  }

  const systemPrompt = {
    role: 'system' as const,
    content: systemContent
  };

  const messages = [
    systemPrompt,
    ...conversationHistory,
    { role: 'user' as const, content: userMessage }
  ];

  return callOpenAI(messages);
}

// Generate Patterns
export async function generatePatterns(checkInData: CheckInData[], period: '7' | '30' = '30') {
  const dataStr = checkInData.map(c => 
    `Date: ${c.date}\n  Mood: ${c.ratings.mood}/10\n  Stress: ${c.ratings.stress}/10\n  Energy: ${c.ratings.energy}/10\n  Focus: ${c.ratings.focus}/10\n  Proud of: ${c.prompts.proud}\n  Stressed by: ${c.prompts.stressed}\n  Challenge: ${c.prompts.challenge}`
  ).join('\n\n');

  const systemPrompt = {
    role: 'system' as const,
    content: `You are a data analyst specializing in personal wellness patterns. Your task is to identify clear, evidence-based patterns from check-in data.

CRITICAL RULES:
1. ONLY extract patterns that are clearly supported by the data
2. Generate exactly 3 patterns (no more, no less)
3. Each pattern must have specific evidence from the check-ins
4. No speculation or hallucination - stick strictly to the data
5. Format as JSON array only, no other text

For each pattern, provide:
- title: 2-4 words describing the pattern
- meaning: 1 sentence explaining what this pattern means
- evidence: array of 2-3 exact quotes or specific data points from check-ins
- experiment: 1 specific, actionable recommendation (8-15 words)
- confidence: 0.6-1.0 based on data consistency

Return ONLY valid JSON, no markdown code blocks or explanation.`
  };

  const userPrompt = `Analyze these check-ins from the last ${period} days and identify 3 clear, evidence-based patterns:

${dataStr}

Remember: Only patterns clearly supported by the data. Generate exactly 3. Return ONLY JSON array.`;

  const response = await callOpenAI([
    systemPrompt,
    { role: 'user' as const, content: userPrompt }
  ]);

  try {
    // Handle both direct JSON and markdown-wrapped JSON
    const jsonStr = response.includes('```json') 
      ? response.split('```json')[1].split('```')[0].trim()
      : response.includes('```')
      ? response.split('```')[1].trim()
      : response.trim();
    
    const patterns = JSON.parse(jsonStr);
    
    // Validate and ensure exactly 3 patterns
    return Array.isArray(patterns) ? patterns.slice(0, 3) : [];
  } catch (error) {
    console.error('Pattern parsing error:', error);
    return [];
  }
}

// Generate Wins
export async function generateWins(checkInData: CheckInData[], period: 'week' | '30' = '30') {
  const dataStr = checkInData.map(c => 
    `${c.date}: Proud of - ${c.prompts.proud}`
  ).join('\n');

  const systemPrompt = {
    role: 'system' as const,
    content: `You are a positive achievement analyst focused ONLY on finding and celebrating good things. Your task is to extract positive wins and encouraging messages from reflection data.

CRITICAL RULES:
1. ONLY extract wins that are explicitly mentioned in the check-ins
2. Generate exactly 3 wins (no more, no less) - focus on positive achievements
3. Each win must have direct evidence from the "proud of" or "grateful" reflections
4. Use their words but frame everything positively
5. Generate 2-3 growth notes that are ENCOURAGING and POSITIVE (always uplifting)
6. Never focus on negatives - only highlight what they did well
7. Format as JSON only, no other text

For wins array, provide:
- title: The positive achievement (extract from their words, make it sound great, 4-8 words)
- evidence: Quote from their reflection that shows the win
- category: Type of win (personal, professional, health, relationship, learning)

For growth notes array, provide:
- content: ENCOURAGING, positive observation (8-15 words) like "You're showing amazing consistency!" or "Your reflections show real growth!"

Return ONLY valid JSON, no markdown code blocks or explanation. Always focus on the positive.`
  };

  const userPrompt = `Extract 3 positive wins from these reflections from the last ${period === 'week' ? '7 days' : '30 days'}. Focus on the good things they mentioned. Also generate 2-3 ENCOURAGING, POSITIVE growth observations:

${dataStr}

Return JSON with this structure:
{
  "wins": [{"title": "...", "evidence": "...", "category": "..."}],
  "growthNotes": [{"content": "..."}]
}

Remember: Only positive wins. Always frame things positively. Growth notes should be uplifting and encouraging.`;

  const response = await callOpenAI([
    systemPrompt,
    { role: 'user' as const, content: userPrompt }
  ]);

  try {
    // Handle both direct JSON and markdown-wrapped JSON
    const jsonStr = response.includes('```json') 
      ? response.split('```json')[1].split('```')[0].trim()
      : response.includes('```')
      ? response.split('```')[1].trim()
      : response.trim();
    
    const result = JSON.parse(jsonStr);
    
    return {
      wins: Array.isArray(result.wins) ? result.wins.slice(0, 3) : [],
      growthNotes: Array.isArray(result.growthNotes) ? result.growthNotes.slice(0, 3) : []
    };
  } catch (error) {
    console.error('Wins parsing error:', error);
    return { wins: [], growthNotes: [] };
  }
}
