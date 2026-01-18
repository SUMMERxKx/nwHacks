/**
 * Firebase Admin: init from FIREBASE_SERVICE_ACCOUNT_JSON, export auth and db.
 * Used to verify ID tokens and read Firestore (users/{uid}/checkIns).
 */
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json) as admin.ServiceAccount) });
    } catch (e) {
      console.error('Firebase Admin init failed:', e);
    }
  } else {
    admin.initializeApp();
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
