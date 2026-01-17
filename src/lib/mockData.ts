// Mock data for the Buddy app
// TODO: Replace with Firebase Firestore integration

export interface CheckInEntry {
  id: string;
  date: string; // ISO date string
  ratings: {
    stress: number;
    energy: number;
    mood: number;
    focus: number;
  };
  prompts: {
    proud: string;
    stressed: string;
    challenge: string;
    grateful: string;
    intention: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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

export interface MemorySnapshot {
  commonStressors: string[];
  restoresEnergy: string[];
  peakProductivity: string;
  recentWins: string[];
}

// Mock check-in entries
export const mockCheckIns: CheckInEntry[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    ratings: { stress: 4, energy: 7, mood: 8, focus: 6 },
    prompts: {
      proud: "Completed the project presentation ahead of schedule.",
      stressed: "Tight deadline made the morning hectic, but I managed.",
      challenge: "Staying focused during back-to-back meetings.",
      grateful: "Supportive team members who helped with review.",
      intention: "Start the day with 30 minutes of deep work before checking emails."
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    ratings: { stress: 6, energy: 5, mood: 6, focus: 5 },
    prompts: {
      proud: "Took a proper lunch break and went for a walk.",
      stressed: "Too many context switches throughout the day.",
      challenge: "Saying no to an additional meeting request.",
      grateful: "Good weather for the walk.",
      intention: "Block 2 hours for focused coding tomorrow."
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    ratings: { stress: 3, energy: 8, mood: 9, focus: 8 },
    prompts: {
      proud: "Finally fixed that bug that's been haunting me for days.",
      stressed: "Not really stressed today, which was a nice change.",
      challenge: "Resisting the urge to check Slack constantly.",
      grateful: "Morning coffee ritual that sets a calm tone.",
      intention: "Continue the momentum with another focused morning."
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Mock chat messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Good morning! I noticed you've been checking in consistently this week. Your energy levels have been trending up. Would you like to explore what's contributing to that?",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    role: 'user',
    content: "Yes, I think the morning walks are helping. I've been more intentional about stepping away from my desk.",
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: '3',
    role: 'assistant',
    content: "That's a great observation! Your check-ins support this — on days you mentioned walking, your mood and focus scores were 20% higher on average. Would you like to set a reminder to protect this habit?",
    timestamp: new Date(Date.now() - 3400000).toISOString()
  }
];

// Mock memory snapshot
export const mockMemorySnapshot: MemorySnapshot = {
  commonStressors: ["Deadlines", "Back-to-back meetings", "Context switching"],
  restoresEnergy: ["Walking", "Morning routines", "Deep work blocks"],
  peakProductivity: "Early morning (8-11 AM)",
  recentWins: ["Completed presentation early", "Fixed long-standing bug"]
};

// Mock patterns
export const mockPatterns: PatternInsight[] = [
  {
    id: '1',
    title: "Morning Energy Peak",
    meaning: "Your focus and mood scores are consistently higher when you start work before checking emails. This protected time seems to set a positive tone for your entire day.",
    evidence: [
      "\"Start the day with deep work before emails\" — led to focus score of 8",
      "\"Morning coffee ritual sets a calm tone\" — mood score of 9"
    ],
    experiment: "Try a 'phone-free first hour' for the next 3 days and note how it affects your mid-day energy.",
    confidence: "High"
  },
  {
    id: '2',
    title: "Meeting Overload Impact",
    meaning: "Days with 4+ meetings show a pattern of lower focus scores and higher stress. The context-switching appears to drain your cognitive resources.",
    evidence: [
      "\"Too many context switches throughout the day\" — stress: 6, focus: 5",
      "\"Staying focused during back-to-back meetings\" was noted as a challenge"
    ],
    experiment: "Request a 'meeting-free afternoon' once this week and compare your evening energy levels.",
    confidence: "Medium"
  },
  {
    id: '3',
    title: "Physical Movement Correlation",
    meaning: "Your entries show a clear link between physical activity (especially walking) and improved mood. This pattern has been consistent over the past two weeks.",
    evidence: [
      "\"Took a proper lunch break and went for a walk\" — despite stress, grateful for the weather",
      "Morning walks mentioned as energy restorer"
    ],
    experiment: "Schedule a 10-minute walk after your longest meeting tomorrow.",
    confidence: "High"
  }
];

// Mock wins
export const mockWins: Win[] = [
  {
    id: '1',
    title: "Delivered ahead of schedule",
    evidence: "Completed the project presentation early, showing improved planning.",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: '2',
    title: "Protected your boundaries",
    evidence: "Said no to an additional meeting — a challenge you identified and overcame.",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: '3',
    title: "Solved a persistent problem",
    evidence: "Fixed a bug that had been challenging you for days — persistence paid off.",
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
  },
  {
    id: '4',
    title: "Built a restorative habit",
    evidence: "Consistent mention of walks and morning routines — you're investing in your wellbeing.",
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
  }
];

// Mock growth notes
export const mockGrowthNotes: GrowthNote[] = [
  {
    id: '1',
    content: "You followed through on your deep work intention even when energy was moderate."
  },
  {
    id: '2',
    content: "You recognized stress patterns and actively took restorative breaks."
  },
  {
    id: '3',
    content: "Your gratitude practice is becoming more specific and meaningful over time."
  }
];

// Helper functions
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

export function getStreakCount(checkIns: CheckInEntry[]): number {
  if (checkIns.length === 0) return 0;
  
  const sortedDates = checkIns
    .map(c => new Date(c.date).getTime())
    .sort((a, b) => b - a);
  
  let streak = 1;
  const today = new Date().setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Check if there's an entry for today or yesterday
  const latestDate = new Date(sortedDates[0]).setHours(0, 0, 0, 0);
  if (today - latestDate > msPerDay) return 0;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1]).setHours(0, 0, 0, 0);
    const prev = new Date(sortedDates[i]).setHours(0, 0, 0, 0);
    
    if (current - prev === msPerDay) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}
