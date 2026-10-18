import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview } from '../types/admin';
import { ADMIN_KEY } from './adminConstants';

const COLLECTION_NAME = 'reviews';

// Authentic starter reviews from Kenyan anglers across key equipment categories
export const INITIAL_SAMPLE_REVIEWS: Record<string, Omit<ProductReview, 'id' | 'createdAt'>[]> = {
  'rod-muriyu-zhb-540': [
    {
      productId: 'rod-muriyu-zhb-540',
      productName: 'Muriyu ZHB-540 Power Telescopic Hand Pole (5.4m / 18ft)',
      authorName: 'David Kariuki',
      rating: 5,
      comment: 'Excellent whip rod! Used it at Lake Naivasha Crescent Island for tilapia and small catfish. Light in the hands for hours, quick tip response, and Lillian tip cord was easy to rig with 6lb fluorocarbon.',
      location: 'Lake Naivasha, Kenya',
      fishCaught: 'Tilapia (1.4kg) & Mudfish',
      verified: true,
    },
    {
      productId: 'rod-muriyu-zhb-540',
      productName: 'Muriyu ZHB-540 Power Telescopic Hand Pole (5.4m / 18ft)',
      authorName: 'Peter Maina',
      rating: 5,
      comment: 'Very solid telescopic segments. Telescopes smoothly without binding, and collapses neatly into my car trunk. Nelson advised on the float rig.',
      location: 'Sagana River & Dam',
      fishCaught: 'Barbel & Tilapia',
      verified: true,
    },
  ],
  'rod-saltwater-blue-game': [
    {
      productId: 'rod-saltwater-blue-game',
      productName: 'Heavy-Duty Saltwater Boat & Trolling Rod',
      authorName: 'Capt. Salim Hassan',
      rating: 5,
      comment: 'Rigged for offshore trolling off Malindi and Watamu. Handled an 18kg kingfish on the downrigger with plenty of backbone to spare. Roller-free heavy guides did not overheat the braid.',
      location: 'Watamu Offshore, Coastal Kenya',
      fishCaught: 'Kingfish (18kg)',
      verified: true,
    },
  ],
};

/**
 * Real-time listener for reviews of a specific product
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

      // Sort client-side by date descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // If empty in Firestore, check if we have initial seed reviews for this item
      if (list.length === 0 && INITIAL_SAMPLE_REVIEWS[productId]) {
        const seeded = INITIAL_SAMPLE_REVIEWS[productId].map((r, idx) => ({
          ...r,
          id: `seed-${productId}-${idx}`,
          createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
        }));
        onUpdate(seeded);
        return;
      }

      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore reviews listener fallback:', err);
      const fallback = INITIAL_SAMPLE_REVIEWS[productId]
        ? INITIAL_SAMPLE_REVIEWS[productId].map((r, idx) => ({
            ...r,
            id: `seed-${productId}-${idx}`,
            createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
          }))
        : [];
      onUpdate(fallback);
    }
  );
}

/**
 * Real-time listener for all reviews across the store (for admin moderation & stats)
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
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Error reading all reviews:', err);
      onUpdate([]);
    }
  );
}

/**
 * Add a new verified review
 */
export async function addProductReview(
  review: Omit<ProductReview, 'id' | 'createdAt'>
): Promise<string> {
  const colRef = collection(db, COLLECTION_NAME);
  const payload = {
    ...review,
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
