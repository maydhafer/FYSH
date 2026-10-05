import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  collection, 
  addDoc, 
  setDoc,
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';

import firebaseAppletConfig from '../../firebase-applet-config.json';

// Use firebaseAppletConfig directly for clean configuration
export const firebaseConfig = {
  projectId: firebaseAppletConfig.projectId,
  appId: firebaseAppletConfig.appId,
  apiKey: firebaseAppletConfig.apiKey,
  authDomain: firebaseAppletConfig.authDomain,
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId,
  storageBucket: firebaseAppletConfig.storageBucket,
  messagingSenderId: firebaseAppletConfig.messagingSenderId,
  measurementId: firebaseAppletConfig.measurementId,
  oAuthClientId: firebaseAppletConfig.oAuthClientId,
};

// Initialize Firebase safely handling clean/unconfigured state
let app: any;
try {
  if (firebaseConfig.projectId && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    app = initializeApp({
      projectId: "unconfigured-project",
      appId: "unconfigured-app-id",
      apiKey: "unconfigured-api-key",
      authDomain: "unconfigured.firebaseapp.com",
    });
  }
} catch (e) {
  console.warn("Firebase initialization waiting for clean configuration:", e);
}

let firestoreInstance;
try {
  if (app && firebaseConfig.projectId && firebaseConfig.projectId !== "unconfigured-project") {
    try {
      firestoreInstance = initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      });
    } catch (e) {
      firestoreInstance = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    }
  } else {
    firestoreInstance = {} as any;
  }
} catch (e) {
  firestoreInstance = {} as any;
}

export const db = firestoreInstance;
export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth helpers
export async function signInWithGoogle() {
  console.log("=== FIREBASE AUTH DIAGNOSTICS ===");
  console.log("window.location.origin:", typeof window !== 'undefined' ? window.location.origin : 'N/A');
  console.log("window.location.hostname:", typeof window !== 'undefined' ? window.location.hostname : 'N/A');
  console.log("Firebase projectId:", firebaseConfig.projectId);
  console.log("auth.app.options.authDomain:", auth.app.options.authDomain);
  console.log("=================================");

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          provider: 'google.com',
          lastLoginAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Failed to save user profile in Firestore:", err);
      }
    }
    return user;
  } catch (error: any) {
    console.error("=== FIREBASE AUTH ERROR DIAGNOSTICS ===");
    console.error("error.code:", error?.code);
    console.error("error.message:", error?.message);
    console.error("window.location.hostname:", typeof window !== 'undefined' ? window.location.hostname : 'N/A');
    console.error("auth.app.options.authDomain:", auth.app.options.authDomain);
    console.error("=======================================");

    if (error?.code === 'auth/unauthorized-domain' || error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
      console.warn("Popup sign-in encountered domain or popup issue, falling back to redirect:", error?.code);
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.error("=== FIREBASE REDIRECT ERROR DIAGNOSTICS ===");
        console.error("redirectErr.code:", redirectErr?.code);
        console.error("redirectErr.message:", redirectErr?.message);
        console.error("==========================================");
        throw redirectErr;
      }
    }
    if (error?.code !== 'auth/popup-closed-by-user') {
      console.warn("Google signIn note:", error?.message || error?.code);
    }
    throw error;
  }
}

export async function signInWithGoogleRedirect() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Google redirect signIn error:", error);
    throw error;
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        provider: 'google.com',
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
      return user;
    }
  } catch (err) {
    console.warn("Redirect result check note:", err);
  }
  return null;
}

export async function logOut() {
  try {
    await fbSignOut(auth);
  } catch (error) {
    throw error;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  if (user?.uid) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || '',
      photoURL: user.photoURL || '',
      provider: 'password',
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  }
  return user;
}

export async function signUpWithEmail(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const user = result.user;
  if (user?.uid) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || '',
      photoURL: user.photoURL || '',
      provider: 'password',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  }
  return user;
}
