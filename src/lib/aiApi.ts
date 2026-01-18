/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI API wrapper - calls local aiService.ts which uses OpenAI API directly
 * For development with Spark plan (no Cloud Functions)
 */
import { buddyChat as buddyChatAI, generatePatterns as generatePatternsAI, generateWins as generateWinsAI } from './aiService';
import type { PatternInsight, Win, GrowthNote } from './mockData';
import type { CheckInData } from './firebaseService';

export async function buddyChat(params: { message: string; contextDays: 7 | 30; history?: { role: string; content: string }[] }): Promise<{ content: string }> {
  try {
    const conversationHistory = params.history || [];
    const content = await buddyChatAI(params.message, conversationHistory as any);
    return { content };
  } catch (error) {
    console.error('Buddy chat error:', error);
    throw error;
  }
}

export async function generatePatterns(checkInData: CheckInData[]): Promise<PatternInsight[]> {
  try {
    const patterns = await generatePatternsAI(checkInData);
    return patterns.map((p: any) => ({
      pattern: p.pattern || '',
      insight: p.insight || '',
      confidence: p.confidence || 0.5,
      quote: p.quote || '',
    }));
  } catch (error) {
    console.error('Generate patterns error:', error);
    return [];
  }
}

export async function generateWins(checkInData: CheckInData[]): Promise<{ wins: Win[]; growthNotes: GrowthNote[] }> {
  try {
    const wins = await generateWinsAI(checkInData);
    return {
      wins: wins.map((w: any) => ({
        title: w.win || 'Great progress',
        description: w.impact || '',
        emoji: w.emoji || '⭐',
        date: new Date().toISOString(),
      })),
      growthNotes: [
        {
          id: Date.now().toString(),
          content: 'Keep celebrating your progress!',
        },
      ],
    };
  } catch (error) {
    console.error('Generate wins error:', error);
    return { wins: [], growthNotes: [] };
  }
}
