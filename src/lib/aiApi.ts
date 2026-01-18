/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI API wrapper - calls local aiService.ts which uses OpenAI API directly
 * For development with Spark plan (no Cloud Functions)
 */
import { buddyChat as buddyChatAI, generatePatterns as generatePatternsAI, generateWins as generateWinsAI, generateBlindSpots as generateBlindSpotsAI } from './aiService';
import type { PatternInsight, Win, GrowthNote, BlindSpot, AwarenessNote } from './mockData';
import type { CheckInData } from './firebaseService';

export async function buddyChat(params: { message: string; contextDays: 7 | 30; history?: { role: string; content: string }[]; checkInData?: CheckInData[] }): Promise<{ content: string }> {
  try {
    const conversationHistory = params.history || [];
    const content = await buddyChatAI(params.message, conversationHistory as any, params.checkInData);
    return { content };
  } catch (error) {
    console.error('Buddy chat error:', error);
    throw error;
  }
}

export async function generatePatterns(params: { checkInData: CheckInData[]; period: '7' | '30' }): Promise<PatternInsight[]> {
  try {
    const patterns = await generatePatternsAI(params.checkInData, params.period);
    return patterns.map((p: any) => {
      const confidenceValue = Math.min(1, Math.max(0.5, p.confidence || 0.7));
      let confidenceLevel: 'Low' | 'Medium' | 'High' = 'Medium';
      if (confidenceValue < 0.67) {
        confidenceLevel = 'Low';
      } else if (confidenceValue > 0.83) {
        confidenceLevel = 'High';
      }
      return {
        id: Math.random().toString(),
        title: p.title || 'Pattern',
        meaning: p.meaning || '',
        evidence: Array.isArray(p.evidence) ? p.evidence : [],
        experiment: p.experiment || '',
        confidence: confidenceLevel,
      };
    });
  } catch (error) {
    console.error('Generate patterns error:', error);
    return [];
  }
}

export async function generateWins(params: { checkInData?: CheckInData[]; period: 'week' | '30' }): Promise<{ wins: Win[]; growthNotes: GrowthNote[] }> {
  try {
    const result = await generateWinsAI(params.checkInData || [], params.period);
    
    const categoryEmojis: Record<string, string> = {
      personal: '✨',
      professional: '💼',
      health: '🏃',
      relationship: '❤️',
      learning: '📚',
    };

    return {
      wins: (result.wins || []).map((w: any) => ({
        id: Math.random().toString(),
        title: w.title || 'Great progress',
        evidence: w.evidence || '',
        emoji: categoryEmojis[w.category?.toLowerCase()] || '⭐',
        date: new Date().toISOString(),
      })),
      growthNotes: (result.growthNotes || []).map((g: any) => ({
        id: Math.random().toString(),
        content: g.content || 'Keep celebrating your progress!',
      })),
    };
  } catch (error) {
    console.error('Generate wins error:', error);
    return { wins: [], growthNotes: [] };
  }
}

/**
 * Generate Blind Spots - uses local aiService for development
 * For production, this can be updated to use fetch to /api/generate-blind-spots
 */
export async function generateBlindSpots(params: { checkInData?: CheckInData[]; period: 'week' | '30' }): Promise<{ blindSpots: BlindSpot[]; awarenessNotes: AwarenessNote[] }> {
  try {
    const result = await generateBlindSpotsAI(params.checkInData || [], params.period);
    
    return {
      blindSpots: (result.blindSpots || []).map((b: any) => ({
        id: String(b.id || Math.random().toString()),
        title: b.title || 'Awareness opportunity',
        observation: b.observation || '',
        suggestion: b.suggestion || '',
        date: b.date || new Date().toISOString().split('T')[0],
      })),
      awarenessNotes: (result.awarenessNotes || []).map((a: any) => ({
        id: String(a.id || Math.random().toString()),
        content: a.content || '',
      })),
    };
  } catch (error) {
    console.error('Generate blind spots error:', error);
    return { blindSpots: [], awarenessNotes: [] };
  }
}
