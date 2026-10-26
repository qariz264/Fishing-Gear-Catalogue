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
const LOCAL_STORAGE_REVIEWS_KEY = 'fishwithnelson_customer_reviews';

/**
 * Retrieves genuine customer-submitted reviews stored locally
 */
export function getLocalCustomerReviews(): SiteReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse customer reviews from localStorage:', err);
  }
  return [];
}

/**
 * Saves genuine customer reviews to local storage cache
 */
export function saveLocalCustomerReviews(reviews: SiteReview[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Failed to save customer reviews to localStorage:', err);
  }
}

/**
 * Real-time listener for customer reviews.
 * Remains completely empty until real customers write reviews.
 */
export function subscribeToSiteReviews(
  onUpdate: (reviews: SiteReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: SiteReview[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as SiteReview);
      });

      // Merge with locally submitted customer reviews if any are still syncing
      const local = getLocalCustomerReviews();
      const existingIds = new Set(list.map((r) => r.id));
      for (const item of local) {
        if (!existingIds.has(item.id)) {
          list.push(item);
        }
      }

      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Save latest real customer reviews
      saveLocalCustomerReviews(list);

      // Return real reviews only (empty list if no customer has submitted yet)
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore site reviews listener notification:', err);
      // Fallback only to authentic customer reviews saved locally, never to hardcoded developer reviews
      const local = getLocalCustomerReviews();
      onUpdate(local);
    }
  );
}

/**
 * Submit a customer review.
 * Written directly by the customer and saved to Firestore.
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
  const colRef = collection(db, COLLECTION_NAME);
  const now = new Date().toISOString();
  const tempId = `cust-rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const payload = {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: review.authorName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    comment: review.comment.trim(),
    location: (review.location || '').trim(),
    topic: (review.topic || 'Store & Equipment Experience').trim(),
    fishCaught: (review.fishCaught || '').trim(),
    verified: true,
    createdAt: now,
  };

  // Immediate local optimistic save so customer sees their review instantly
  const localReview: SiteReview = {
    ...payload,
    id: tempId,
  };
  const currentLocal = getLocalCustomerReviews();
  saveLocalCustomerReviews([localReview, ...currentLocal.filter((r) => r.id !== tempId)]);

  try {
    const docRef = await addDoc(colRef, payload);
    // Replace temp ID with Firestore document ID in local cache
    const updatedLocal = getLocalCustomerReviews().map((r) =>
      r.id === tempId ? { ...r, id: docRef.id } : r
    );
    saveLocalCustomerReviews(updatedLocal);
    return docRef.id;
  } catch (err) {
    console.warn('Review saved locally; Firestore sync notice:', err);
    return tempId;
  }
}

/**
 * Real-time listener for all reviews for admin portal.
 * Only contains reviews written by customers.
 */
export function subscribeToAllReviews(
  onUpdate: (reviews: ProductReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ProductReview[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as ProductReview);
      });

      const local = getLocalCustomerReviews();
      const existingIds = new Set(list.map((r) => r.id));
      for (const item of local) {
        if (!existingIds.has(item.id)) {
          list.push(item);
        }
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalCustomerReviews(list);
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore all reviews listener notification:', err);
      const local = getLocalCustomerReviews();
      onUpdate(local);
    }
  );
}

/**
 * Admin delete review
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  // Remove from local cache
  const local = getLocalCustomerReviews().filter((r) => r.id !== reviewId);
  saveLocalCustomerReviews(local);

  // Try delete in Firestore if document ID exists
  try {
    const docRef = doc(db, COLLECTION_NAME, reviewId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }
}

/**
 * Compute average rating and distribution from real customer reviews.
 * Returns 0 average and 0 count if no customer reviews exist.
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
