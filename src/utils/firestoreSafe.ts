import {
  onSnapshot,
  DocumentReference,
  Query,
  QuerySnapshot,
  DocumentSnapshot,
  FirestoreError,
  Unsubscribe,
} from 'firebase/firestore';

// Tracks whether Firestore daily read quota has been exhausted
let isQuotaExhausted = false;

export function isFirestoreQuotaExhausted(): boolean {
  return isQuotaExhausted;
}

export function setFirestoreQuotaExhausted(val = true): void {
  isQuotaExhausted = val;
}

/**
 * Resilient wrapper around Firestore onSnapshot with proper TypeScript overloads.
 * Guarantees that:
 * 1. Every snapshot listener has a safe error callback.
 * 2. If quota is exhausted ([code=resource-exhausted]), it marks the quota as exhausted,
 *    logs a single graceful warning, and avoids throwing uncaught listener exceptions.
 * 3. Preserves full QuerySnapshot and DocumentSnapshot typing for callers.
 */
export function safeOnSnapshot<T>(
  target: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: FirestoreError | any) => void
): Unsubscribe;
export function safeOnSnapshot<T>(
  target: DocumentReference<T>,
  onNext: (snapshot: DocumentSnapshot<T>) => void,
  onError?: (error: FirestoreError | any) => void
): Unsubscribe;
export function safeOnSnapshot(
  target: any,
  onNext: (snapshot: any) => void,
  onError?: (error: any) => void
): Unsubscribe {
  // If quota was already marked exhausted in this session, trigger fallback immediately and avoid hitting Firestore
  if (isQuotaExhausted) {
    if (onError) {
      try {
        onError({ code: 'resource-exhausted', message: 'Quota limit exceeded' });
      } catch (err) {
        console.warn('Notice in safeOnSnapshot error callback:', err);
      }
    }
    return () => {};
  }

  try {
    return onSnapshot(
      target,
      (snapshot: any) => {
        try {
          onNext(snapshot);
        } catch (err) {
          console.warn('Notice in safeOnSnapshot next callback:', err);
        }
      },
      (error: FirestoreError) => {
        if (
          error?.code === 'resource-exhausted' ||
          (typeof error?.message === 'string' && error.message.includes('Quota limit exceeded'))
        ) {
          isQuotaExhausted = true;
          console.warn('Firestore daily read quota limit reached. Using resilient local cache and offline fallbacks.');
        } else {
          console.warn('Firestore snapshot notification:', error?.message || error);
        }

        if (onError) {
          try {
            onError(error);
          } catch (err) {
            console.warn('Notice in safeOnSnapshot error callback:', err);
          }
        }
      }
    );
  } catch (syncError: any) {
    console.warn('Notice attaching Firestore listener:', syncError?.message || syncError);
    if (onError) {
      try {
        onError(syncError);
      } catch (e) {
        // safe fallback
      }
    }
    return () => {};
  }
}
