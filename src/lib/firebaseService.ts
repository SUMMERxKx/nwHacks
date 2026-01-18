/**
 * Firestore CRUD for check-ins. Path: users/{userId}/checkIns/{date}.
 * All functions require auth.currentUser. Dates are YYYY-MM-DD.
 */
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs, 
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { DEFAULT_PROMPTS, type PromptResponse, normalizePrompts } from './prompts';

// Support both old format (Record<string, string>) and new format (PromptResponse[])
export type CheckInPrompts = PromptResponse[] | Record<string, string>;

export interface CheckInData {
  id?: string;
  userId: string;
  date: string;
  ratings: {
    stress: number;
    energy: number;
    mood: number;
    focus: number;
  };
  prompts: CheckInPrompts;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper to get default prompts from template
export function getDefaultPrompts(template: PromptResponse[]): PromptResponse[] {
  return template.map((p) => ({ ...p, answer: '' }));
}
// Save check-in data
export async function saveCheckIn(checkInData: Omit<CheckInData, 'userId' | 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      'users',
      userId,
      'checkIns',
      checkInData.date
    );

    const now = Timestamp.now();
    const docSnap = await getDoc(docRef);

    await setDoc(docRef, {
      ...checkInData,
      userId,
      createdAt: docSnap.exists() ? docSnap.data().createdAt : now,
      updatedAt: now,
    });

    return { success: true, date: checkInData.date };
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
}

// Get check-in for specific date
export async function getCheckInByDate(date: string) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      'users',
      userId,
      'checkIns',
      date
    );

    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as CheckInData) : null;
  } catch (error) {
    console.error('Error fetching check-in:', error);
    return null;
  }
}

// Get all check-ins for a date range
export async function getCheckInsByDateRange(startDate: string, endDate: string) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'users', userId, 'checkIns'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CheckInData);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
}

// Get all check-ins
export async function getAllCheckIns() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(collection(db, 'users', userId, 'checkIns'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CheckInData);
  } catch (error) {
    console.error('Error fetching all check-ins:', error);
    return [];
  }
}

// Delete check-in
export async function deleteCheckIn(date: string) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(
      db,
      'users',
      userId,
      'checkIns',
      date
    );

    await setDoc(docRef, { deletedAt: Timestamp.now() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error deleting check-in:', error);
    throw error;
  }
}
