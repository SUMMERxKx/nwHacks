import { useState, useEffect } from 'react';
import { getAllCheckIns, CheckInData } from '@/lib/firebaseService';

export function useCheckInData() {
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCheckIns();
        setCheckIns(data);
        setError(null);
      } catch (err) {
        console.error('Error loading check-ins:', err);
        setError(err instanceof Error ? err.message : 'Failed to load check-ins');
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckIns();
  }, []);

  // Helper functions to analyze the data
  const getLastNCheckIns = (n: number) => {
    return checkIns.slice(-n);
  };

  const getAverageRating = (ratingKey: 'stress' | 'energy' | 'mood' | 'focus') => {
    if (checkIns.length === 0) return 0;
    const sum = checkIns.reduce((acc, check) => acc + check.ratings[ratingKey], 0);
    return Math.round(sum / checkIns.length);
  };

  const getCheckInsByDateRange = (startDate: string, endDate: string) => {
    return checkIns.filter(check => check.date >= startDate && check.date <= endDate);
  };

  const getStreakCount = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (checkIns.some(check => check.date === dateStr)) {
        streak++;
      } else if (i === 0) {
        break; // Streak broken if no check-in today
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };

  return {
    checkIns,
    isLoading,
    error,
    getLastNCheckIns,
    getAverageRating,
    getCheckInsByDateRange,
    getStreakCount,
  };
}
