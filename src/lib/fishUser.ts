import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export async function getOrCreateStableFishUserId(): Promise<string> {
  const authUser = auth.currentUser;
  let uniqueId = '';

  if (authUser?.uid) {
    uniqueId = authUser.uid;
  } else {
    uniqueId = localStorage.getItem('fish_permanent_uuid') || '';
    if (!uniqueId) {
      uniqueId = 'usr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('fish_permanent_uuid', uniqueId);
    }
  }

  const stableUserId = `fish_user_${uniqueId}`;
  localStorage.setItem('fish_stable_user_id', stableUserId);

  // Sync with Firestore only if authenticated and rules allow
  if (authUser?.uid) {
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      await setDoc(userDocRef, {
        uid: authUser.uid,
        email: authUser.email || '',
        displayName: authUser.displayName || '',
        stableUserId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      // Suppress permission errors silently for unverified or unauthenticated users
    }
  }

  return stableUserId;
}

