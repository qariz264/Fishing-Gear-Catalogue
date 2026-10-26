import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview } from '../types/admin';

const COLLECTION_NAME = 'reviews';

/**
 * Real-time listener for overall site reviews (for the footer review section).
 * Does NOT inject any fake or generic placeholder reviews.
 */
export function subscribeToOverallReviews(
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

      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore reviews listener error:', err);
      onUpdate([]);
    }
  );
}

/**
 * Real-time listener for reviews of a specific product (kept for backwards compatibility).
 */
export function subscribeToProductReviews(
  productId: string,
  onUpdate: (reviews: ProductReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where('productId', '==', productId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ProductReview[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as ProductReview);
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore product reviews listener error:', err);
      onUpdate([]);
    }
  );
}

/**
 * Real-time listener for all reviews across the store (for admin moderation & stats).
 */
export function subscribeToAllReviews(
  onUpdate: (reviews: ProductReview[]) => void
): Unsubscribe {
  return subscribeToOverallReviews(onUpdate);
}

/**
 * Add an overall site review from the footer.
 * Sets productId: 'site' to satisfy Firestore security rules.
 */
export async function addOverallReview(review: {
  authorName: string;
  rating: number;
  comment: string;
  location?: string;
  fishCaught?: string;
}): Promise<string> {
  const colRef = collection(db, COLLECTION_NAME);
  const payload = {
    productId: 'site',
    productName: 'Fishing With Nelson (Overall Service & Tackle)',
    authorName: review.authorName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    comment: review.comment.trim(),
    location: (review.location || '').trim(),
    fishCaught: (review.fishCaught || '').trim(),
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

/**
 * Add a review (generic/backwards-compatible).
 */
export async function addProductReview(
  review: Omit<ProductReview, 'id' | 'createdAt'>
): Promise<string> {
  const colRef = collection(db, COLLECTION_NAME);
  const payload = {
    ...review,
    productId: review.productId || 'site',
    rating: Math.max(1, Math.min(5, Math.round(review.rating))),
    authorName: review.authorName.trim(),
    comment: review.comment.trim(),
    location: (review.location || '').trim(),
    fishCaught: (review.fishCaught || '').trim(),
    verified: Boolean(review.verified ?? true),
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

/**
 * Admin delete review
 */
export async function deleteProductReview(reviewId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, reviewId);
  await deleteDoc(docRef);
}

/**
 * Compute average rating and distribution
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
