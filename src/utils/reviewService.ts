import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview, SiteReview } from '../types/admin';

const COLLECTION_NAME = 'reviews';
const LOCAL_STORAGE_KEY = 'fishing_with_nelson_real_reviews';

// Helper to get locally saved user-submitted reviews
function getLocalRealReviews(): SiteReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse local real reviews:', e);
    return [];
  }
}

// Helper to persist user-submitted reviews locally
function saveLocalRealReview(review: SiteReview): void {
  try {
    const current = getLocalRealReviews();
    const updated = [review, ...current.filter((r) => r.id !== review.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save real review locally:', e);
  }
}

// Helper to remove a deleted review locally
function removeLocalRealReview(reviewId: string): void {
  try {
    const current = getLocalRealReviews();
    const updated = current.filter((r) => r.id !== reviewId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete local real review:', e);
  }
}

/**
 * Real-time listener for overall site reviews across the store.
 * Returns only real user reviews (empty array if no real reviews have been submitted).
 * Generic reviews are strictly excluded.
 */
export function subscribeToSiteReviews(
  onUpdate: (reviews: SiteReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const remoteList: SiteReview[] = [];
      snapshot.forEach((d) => {
        remoteList.push({ ...d.data(), id: d.id } as SiteReview);
      });

      // Merge with any real user reviews stored locally
      const localList = getLocalRealReviews();
      const map = new Map<string, SiteReview>();

      remoteList.forEach((r) => map.set(r.id, r));
      localList.forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        }
      });

      const combined = Array.from(map.values());
      // Sort client-side by date descending
      combined.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Return real reviews only (blank / empty if none exist)
      onUpdate(combined);
    },
    (err) => {
      console.warn('Firestore reviews listener notice (e.g. quota/offline):', err);
      // Fallback only to real reviews submitted by users on this device, never generic reviews
      const localList = getLocalRealReviews();
      localList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(localList);
    }
  );
}

/**
 * Add a new overall site review from a real user
 */
export async function addSiteReview(
  review: {
    authorName: string;
    rating: number;
    comment: string;
    location?: string;
    topic?: string;
    fishCaught?: string;
  }
): Promise<string> {
  const generatedId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const payload: SiteReview = {
    id: generatedId,
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: review.authorName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    comment: review.comment.trim(),
    location: (review.location || '').trim(),
    topic: (review.topic || 'Store & Equipment Experience').trim(),
    fishCaught: (review.fishCaught || '').trim(),
    verified: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately store in local state so the review is visible to the user
  saveLocalRealReview(payload);

  // 2. Persist to Firestore
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, {
      productId: payload.productId,
      productName: payload.productName,
      authorName: payload.authorName,
      rating: payload.rating,
      comment: payload.comment,
      location: payload.location,
      topic: payload.topic,
      fishCaught: payload.fishCaught,
      verified: payload.verified,
      createdAt: payload.createdAt,
    });

    // Update with Firestore document ID
    if (docRef.id) {
      removeLocalRealReview(generatedId);
      const withFirestoreId = { ...payload, id: docRef.id };
      saveLocalRealReview(withFirestoreId);
      return docRef.id;
    }
  } catch (firestoreErr) {
    console.warn('Firestore addDoc note (local review saved):', firestoreErr);
  }

  return generatedId;
}

/**
 * Real-time listener for all reviews across the store (for admin moderation & stats).
 * Blank if no real reviews have been submitted.
 */
export function subscribeToAllReviews(
  onUpdate: (reviews: ProductReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const remoteList: ProductReview[] = [];
      snapshot.forEach((d) => {
        remoteList.push({ ...d.data(), id: d.id } as ProductReview);
      });

      const localList = getLocalRealReviews();
      const map = new Map<string, ProductReview>();

      remoteList.forEach((r) => map.set(r.id, r));
      localList.forEach((r) => {
        if (!map.has(r.id)) {
          map.set(r.id, r as ProductReview);
        }
      });

      const combined = Array.from(map.values());
      combined.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(combined);
    },
    (err) => {
      console.warn('Error reading all reviews (using local real reviews):', err);
      const localList = getLocalRealReviews();
      localList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(localList as ProductReview[]);
    }
  );
}

/**
 * Admin delete review
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  removeLocalRealReview(reviewId);
  try {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }
}

/**
 * Compute average rating and distribution based strictly on real reviews
 */
export function calculateReviewStats(reviews: ProductReview[]) {
  if (!reviews || reviews.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const count = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    sum += star;
  });

  const average = Number((sum / count).toFixed(1));

  return { average, count, distribution };
}
