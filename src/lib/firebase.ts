/**
 * Firebase app, Auth, Firestore, Analytics.
 * Uses VITE_FIREBASE_* from .env.local
 * AI API calls go through aiService.ts (local OpenAI integration)
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;
// Avoid analytics init in unsupported environments (e.g., localhost without config or SSR).
isSupported()
  .then((supported) => {
    if (supported) analyticsInstance = getAnalytics(app);
  })
  .catch(() => {
    analyticsInstance = null;
  });

export const analytics = analyticsInstance;
