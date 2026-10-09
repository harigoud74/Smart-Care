import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfigData);

// Initialize Firebase Authentication
export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Cloud Firestore with provisioned database ID
export const db: Firestore = getFirestore(
  firebaseApp,
  firebaseConfigData.firestoreDatabaseId || '(default)'
);

/**
 * Validate connection to Firestore by testing server connection.
 * Required by Firebase integration skill.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase] Firestore connected and verified with cloud server.');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or database is provisioning.');
    } else {
      console.log('[Firebase] Ping test completed:', error?.message || 'ready');
    }
    return false;
  }
}

// Execute initial connection verification
testFirestoreConnection().catch(() => {});

export { signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { FirebaseUser };
