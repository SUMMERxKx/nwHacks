/**
 * Firestore (Admin): getCheckInsByDateRange(userId, start, end).
 * Path: users/{userId}/checkIns; filters by date in memory.
 */
import { db } from './admin';
import type { CheckInData } from './types';

export async function getCheckInsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CheckInData[]> {
  const snap = await db.collection('users').doc(userId).collection('checkIns').get();
  return snap.docs
    .map((d) => {
      const c = d.data() as CheckInData | undefined;
      if (!c) return null;
      const date = c.date || d.id;
      return { ...c, date } as CheckInData;
    })
    .filter((c): c is CheckInData => !!c && c.date >= startDate && c.date <= endDate);
}
