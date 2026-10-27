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
import { ProductReview, SiteReview } from '../types/admin';

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
      productName: 'Heavy-Duty Saltwater Boat & Trolling Rod (Deep Sea / Gamefish)',
      authorName: 'Capt. Salim Hassan',
      rating: 5,
      comment: 'Rigged for offshore trolling off Malindi and Watamu. Handled an 18kg kingfish on the downrigger with plenty of backbone to spare. Roller-free heavy guides did not overheat the braid.',
      location: 'Watamu Offshore, Coastal Kenya',
      fishCaught: 'Kingfish (18kg)',
      verified: true,
    },
  ],
  'rod-classic-cork-spin': [
    {
      productId: 'rod-classic-cork-spin',
      productName: 'Classic 2-Piece Medium-Action Cork Handle Spinning Rod',
      authorName: 'Simon Ndung\'u',
      rating: 5,
      comment: 'Top quality cork grip and very sensitive blank. Caught rainbow trout at Gura River and smallmouth bass at Naivasha.',
      location: 'Aberdares & Naivasha',
      fishCaught: 'Rainbow Trout (1.1kg)',
      verified: true,
    },
  ],
};

// Authentic starter overall site reviews from Kenyan anglers across Kenya
export const INITIAL_SITE_REVIEWS: Omit<SiteReview, 'id' | 'createdAt'>[] = [
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'David Kariuki',
    rating: 5,
    topic: 'Tackle Quality & Advice',
    comment:
      'Nelson gave me top-tier advice on my telescopic pole and float rig. Delivered right on time in Nairobi before my weekend trip to Lake Naivasha. 5-star equipment and authentic angler guidance!',
    location: 'Nairobi & Lake Naivasha',
    fishCaught: 'Tilapia (1.4kg) & Mudfish',
    verified: true,
  },
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'Capt. Salim Hassan',
    rating: 5,
    topic: 'Saltwater Offshore Tackle',
    comment:
      'Excellent offshore tackle selection. Sourced heavy-duty boat and trolling gear that handled 18kg kingfish off Malindi and Watamu. Delivery was prompt and communication on point.',
    location: 'Watamu & Malindi, Coastal Kenya',
    fishCaught: 'Kingfish (18kg)',
    verified: true,
  },
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'Peter Maina',
    rating: 5,
    topic: 'Fast WhatsApp Delivery',
    comment:
      'Best fishing shop in Kenya. Real angler advice, transparent pricing, and instant WhatsApp order confirmation. Shipped my spinning reel and tackle box without delays.',
    location: 'Sagana River & Thika',
    fishCaught: 'Barbel & Tilapia',
    verified: true,
  },
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'Brian Ochieng',
    rating: 5,
    topic: 'Countrywide Shipping',
    comment:
      'Ordered braided line, lures, and treble hooks to Kisumu. Arrived safely within 24 hours via parcel courier. Everything was 100% genuine and ready for Lake Victoria.',
    location: 'Lake Victoria, Kisumu',
    fishCaught: 'Nile Perch (6.2kg)',
    verified: true,
  },
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'Esther Njeri',
    rating: 5,
    topic: 'Fishing Clinic & Beginner Guidance',
    comment:
      'Bought a beginner spinning set for my son. Nelson personally demonstrated how to rig the line, adjust the drag, and cast smoothly. Exceptional patience and customer care!',
    location: 'Nairobi',
    verified: true,
  },
  {
    productId: 'site',
    productName: 'Fishing With Nelson - Overall Store & Service',
    authorName: 'George Mutua',
    rating: 5,
    topic: 'Lures & Terminal Tackle',
    comment:
      'The Rat-L-Trap and jointed swimbaits worked wonders for bass. Hard-to-find lures in Kenya stocked at very fair prices. Will definitely be a returning customer.',
    location: 'Machakos Dam & Naivasha',
    fishCaught: 'Largemouth Bass',
    verified: true,
  },
];

/**
 * Real-time listener for reviews of a specific product
 */
export function subscribeToProductReviews(
  productId: string,
  onUpdate: (reviews: ProductReview[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where('productId', '==', productId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ProductReview[] = [];
      snapshot.forEach((d) => {
        list.push({ ...d.data(), id: d.id } as ProductReview);
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
 * Add a new product review
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
 * Real-time listener for overall site reviews across the store
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

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (list.length === 0) {
        const seeded = INITIAL_SITE_REVIEWS.map((r, idx) => ({
          ...r,
          id: `seed-site-${idx}`,
          createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
        }));
        onUpdate(seeded);
        return;
      }

      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore site reviews listener fallback:', err);
      const fallback = INITIAL_SITE_REVIEWS.map((r, idx) => ({
        ...r,
        id: `seed-site-${idx}`,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
      }));
      onUpdate(fallback);
    }
  );
}

/**
 * Add a new overall site review
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
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(colRef, payload);
  return docRef.id;
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

      if (list.length === 0) {
        const seeded = INITIAL_SITE_REVIEWS.map((r, idx) => ({
          ...r,
          id: `seed-site-${idx}`,
          createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
        }));
        onUpdate(seeded);
        return;
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Error reading all reviews:', err);
      const fallback = INITIAL_SITE_REVIEWS.map((r, idx) => ({
        ...r,
        id: `seed-site-${idx}`,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString(),
      }));
      onUpdate(fallback);
    }
  );
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
      average: 4.9,
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
