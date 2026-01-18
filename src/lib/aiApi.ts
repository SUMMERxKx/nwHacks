/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI API wrapper - calls local aiService.ts which uses OpenAI API directly
 * For development with Spark plan (no Cloud Functions)
 */
import { buddyChat as buddyChatAI, generatePatterns as generatePatternsAI, generateWins as generateWinsAI } from './aiService';
import type { PatternInsight, Win, GrowthNote } from './mockData';
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
