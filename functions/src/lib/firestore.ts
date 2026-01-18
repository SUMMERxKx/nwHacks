/**
 * Firestore (Admin SDK): getCheckInsByDateRange(userId, start, end).
 * Path: users/{userId}/checkIns; filters by date in memory to avoid composite index.
 */
import * as admin from 'firebase-admin';
import type { CheckInData } from './types';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export async function getCheckInsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CheckInData[]> {
  const snap = await db.collection('users').doc(userId).collection('checkIns').get();
  return snap.docs
    .map((d) => d.data() as CheckInData)
    .filter((c) => c && c.date && c.date >= startDate && c.date <= endDate);
}
