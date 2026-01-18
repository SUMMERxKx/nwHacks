/**
 * Firebase Admin: init from FIREBASE_SERVICE_ACCOUNT_JSON, export auth and db.
 * Used to verify ID tokens and read Firestore (users/{uid}/checkIns).
 */
import type { ServiceAccount } from 'firebase-admin';
import * as adminNS from 'firebase-admin';

// ESM interop: firebase-admin may be namespace or default
const admin = (adminNS as { default?: typeof adminNS }).default ?? adminNS;

if (!admin.apps?.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(json) as ServiceAccount) });
    } catch (e) {
      console.error('Firebase Admin init failed:', e);
    }
  } else {
    admin.initializeApp();
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
