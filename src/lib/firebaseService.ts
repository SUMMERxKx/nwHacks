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
import { DEFAULT_PROMPTS, type PromptResponse, buildPromptsFromTemplate } from './prompts';

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
  prompts: PromptResponse[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function sanitizePrompts(input?: unknown): PromptResponse[] {
  if (!Array.isArray(input)) {
    return DEFAULT_PROMPTS.map((p) => ({ ...p, answer: '' }));
  }

  const seen = new Set<string>();
  return input
    .filter((p) => p && typeof p === 'object')
    .map((p) => ({
      id: typeof p.id === 'string' && p.id.trim() ? p.id.trim() : `custom-${Math.random().toString(36).slice(2, 8)}`,
      question:
        typeof (p as PromptResponse).question === 'string' && (p as PromptResponse).question.trim()
          ? (p as PromptResponse).question.trim()
          : 'Journal',
      answer: typeof (p as PromptResponse).answer === 'string' ? (p as PromptResponse).answer : '',
    }))
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
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
      prompts: sanitizePrompts(checkInData.prompts),
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
    if (!docSnap.exists()) return null;
    const data = docSnap.data() as CheckInData;
    return {
      ...data,
      prompts: sanitizePrompts(data.prompts),
    };
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as CheckInData;
      return {
        ...data,
        prompts: sanitizePrompts(data.prompts),
      };
    });
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as CheckInData;
      return {
        ...data,
        prompts: sanitizePrompts(data.prompts),
      };
    });
  } catch (error) {
    console.error('Error fetching all check-ins:', error);
    return [];
  }
}

export function getDefaultPrompts(template?: PromptResponse[]): PromptResponse[] {
  if (template && Array.isArray(template) && template.length > 0) {
    return buildPromptsFromTemplate(template);
  }
  return DEFAULT_PROMPTS.map((p) => ({ ...p }));
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
