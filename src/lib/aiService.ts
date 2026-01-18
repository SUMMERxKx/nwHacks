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
  let systemContent = `You are a thoughtful reflection buddy. You help users reflect on their day, understand patterns, and grow. 
Be warm, supportive, and insightful. Keep responses concise (2-3 sentences).`;

  if (checkInData && checkInData.length > 0) {
    const recentCheckIns = checkInData.slice(-7).map(c => 
      `${c.date}: Mood ${c.ratings.mood}/10, Stress ${c.ratings.stress}/10, Energy ${c.ratings.energy}/10, Focus ${c.ratings.focus}/10. Proud: ${c.prompts.proud}`
    ).join('\n');
    
    systemContent += `\n\nUser's recent check-ins for context:\n${recentCheckIns}`;
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
    content: `You are a personal achievement analyst. Your task is to extract and celebrate real wins from reflection data.

CRITICAL RULES:
1. ONLY extract wins that are explicitly mentioned in the check-ins
2. Generate exactly 3 wins (no more, no less)
3. Each win must have direct evidence from the "proud of" reflections
4. No embellishment or interpretation - use their exact words
5. Generate 2-3 growth notes that are encouraging but grounded
6. Format as JSON only, no other text

For wins array, provide:
- title: The achievement (extract from their words, 4-8 words)
- evidence: Exact quote from their reflection
- category: Type of win (personal, professional, health, relationship, learning)

For growth notes array, provide:
- content: Encouraging observation based on their data (8-15 words)

Return ONLY valid JSON, no markdown code blocks or explanation.`
  };

  const userPrompt = `Extract 3 real wins from these reflections from the last ${period === 'week' ? '7 days' : '30 days'}. Use their exact words. Also generate 2-3 encouraging growth observations:

${dataStr}

Return JSON with this structure:
{
  "wins": [{"title": "...", "evidence": "...", "category": "..."}],
  "growthNotes": [{"content": "..."}]
}

Remember: Only real wins from their words. No interpretation.`;

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

// Generate Blind Spots
export async function generateBlindSpots(checkInData: CheckInData[], period: 'week' | '30' = '30') {
  const dataStr = checkInData.map(c => {
    const prompts = c.prompts as any; // Access all prompt fields (proud, stressed, challenge, grateful, intention)
    return `Date: ${c.date}\n  Mood: ${c.ratings.mood}/10\n  Stress: ${c.ratings.stress}/10\n  Energy: ${c.ratings.energy}/10\n  Focus: ${c.ratings.focus}/10\n  Proud of: ${prompts.proud || '-'}\n  Stressed by: ${prompts.stressed || '-'}\n  Challenge: ${prompts.challenge || '-'}\n  Grateful: ${prompts.grateful || '-'}\n  Intention: ${prompts.intention || '-'}`;
  }).join('\n\n');

  const systemPrompt = {
    role: 'system' as const,
    content: `You are a thoughtful reflection analyst helping users build self-awareness. You identify potential blind spots—patterns, habits, or perspectives they might not notice themselves—that could be limiting their progress or causing unintended friction.

CRITICAL SAFETY RULES:
1. Use CONSTRUCTIVE, NEUTRAL, and SUPPORTIVE language only
2. NEVER include language about suicide, self-harm, hopelessness, or despair
3. NEVER use harsh judgments, blame, or negative character statements
4. Frame insights as OBSERVATIONS and POSSIBILITIES, not diagnoses or conclusions
5. Focus on ACTIONABLE, GROWTH-ORIENTED suggestions rather than problems
6. Help build awareness and self-understanding without causing distress
7. Always maintain a tone of curiosity and possibility, never judgment
8. If no clear blind spots emerge, return empty arrays rather than forcing observations

Your goal is gentle awareness-building that empowers growth.

CRITICAL RULES:
1. Generate 1 to 4 blind spots (no more, no less)
2. Each blind spot must be evidence-based from the check-ins
3. Be gentle, constructive, and supportive
4. Format as JSON only, no other text

For blindSpots array, provide:
- id: "1", "2", etc.
- title: Brief title (4-8 words)
- observation: What pattern or habit you notice (1-2 sentences)
- suggestion: Actionable, growth-oriented suggestion (1 sentence)
- date: Date from check-ins (YYYY-MM-DD)

For awarenessNotes array, provide:
- id: "1", "2", etc.
- content: Supportive awareness note (1-2 sentences)

Return ONLY valid JSON, no markdown code blocks or explanation.`
  };

  const userPrompt = `Analyze these check-ins from the last ${period === 'week' ? '7 days' : '30 days'} for potential blind spots or overlooked patterns that may be limiting progress. Look for:
- Patterns in stress responses that might benefit from awareness
- Energy drains that could be addressed with small adjustments
- Opportunities for perspective shifts that could reduce friction
- Habits or routines that might be creating unintended obstacles

${dataStr}

Return JSON with this structure:
{
  "blindSpots": [{"id":"1","title":"...","observation":"...","suggestion":"...","date":"YYYY-MM-DD"}],
  "awarenessNotes": [{"id":"1","content":"..."}]
}

Be gentle, constructive, and supportive. No other text.`;

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
      blindSpots: Array.isArray(result.blindSpots) ? result.blindSpots.slice(0, 4) : [],
      awarenessNotes: Array.isArray(result.awarenessNotes) ? result.awarenessNotes.slice(0, 3) : []
    };
  } catch (error) {
    console.error('Blind spots parsing error:', error);
    return { blindSpots: [], awarenessNotes: [] };
  }
}
