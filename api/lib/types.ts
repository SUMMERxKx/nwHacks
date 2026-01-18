/**
 * Types for the Vercel API. Aligned with frontend and functions.
 */
export interface CheckInData {
  id?: string;
  userId: string;
  date: string;
  ratings: { stress: number; energy: number; mood: number; focus: number };
  prompts: { proud: string; stressed: string; challenge: string; grateful: string; intention: string };
  createdAt?: unknown;
  updatedAt?: unknown;
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
