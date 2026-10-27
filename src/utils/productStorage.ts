import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { ADMIN_KEY } from './adminConstants';
import { getCustomImages, saveCustomImage } from './imageStorage';

const LOCAL_STORAGE_KEY = 'fishwithnelson_catalog_products';
const COLLECTION_NAME = 'products';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Gets cached products with custom uploaded images and verified prices
 */
export function getStoredProducts(): Product[] {
  const customImages = getCustomImages();
  let cachedProducts: Product[] = [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProducts = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  // Merge initial catalog with local cached edits and custom images
  const cachedMap = new Map<string, Product>();
  cachedProducts.forEach((p) => cachedMap.set(p.id, p));

  return INITIAL_PRODUCTS.map((p) => {
    const cached = cachedMap.get(p.id);
    const customImg = customImages[p.id];
    const resolvedPrice = cached && cached.price !== undefined && cached.price > 0 ? Number(cached.price) : (p.price || 0);
    const resolvedImage = customImg || (cached && cached.imageUrl ? cached.imageUrl : (p.imageUrl || `/images/products/${p.id}.jpg`));
    const resolvedImages = customImg ? [customImg] : (cached && cached.images && cached.images.length > 0 ? cached.images : [resolvedImage]);

    return {
      ...p,
      ...(cached || {}),
      price: resolvedPrice,
      imageUrl: resolvedImage,
      images: resolvedImages,
    };
  });
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

/**
 * Subscribes in real-time to Firestore products collection.
 * Syncs changes across all users and updates, with robust fallback to default prices and images.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  const customImages = getCustomImages();

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // If collection is completely empty in Firestore, seed with initial template products
      if (snapshot.empty) {
        const local = getStoredProducts();
        onUpdate(local);
        return;
      }

      const initialMap = new Map<string, Product>();
      INITIAL_PRODUCTS.forEach((p) => initialMap.set(p.id, p));

      const productsFromDb: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Product;
        const initial = initialMap.get(d.id);
        const customImg = customImages[d.id];

        const resolvedPrice = data.price !== undefined && Number(data.price) > 0 
          ? Number(data.price) 
          : (initial?.price || 0);

        const resolvedImage = customImg || data.imageUrl || (initial?.imageUrl || `/images/products/${d.id}.jpg`);

        const imgs = customImg 
          ? [customImg] 
          : (data.images && Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : [resolvedImage]);

        productsFromDb.push({
          ...(initial || {}),
          ...data,
          id: d.id,
          price: resolvedPrice,
          imageUrl: resolvedImage,
          images: imgs,
        });
      });

      saveStoredProducts(productsFromDb);
      onUpdate(productsFromDb);
    },
    (error) => {
      console.warn('Firestore onSnapshot subscription notice:', error);
      // Fallback gracefully to cached products with verified prices and images
      const local = getStoredProducts();
      onUpdate(local);
    }
  );
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${product.id}`;
  const primaryImg = product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || '');

  // Preserve in localStorage immediately
  try {
    const current = getStoredProducts();
    const idx = current.findIndex((p) => p.id === product.id);
    const updated = {
      ...product,
      imageUrl: primaryImg,
      images: product.images || (primaryImg ? [primaryImg] : []),
    };
    if (idx >= 0) {
      current[idx] = updated;
    } else {
      current.push(updated);
    }
    saveStoredProducts(current);
    if (primaryImg) {
      saveCustomImage(product.id, primaryImg);
    }
  } catch (e) {
    console.warn('Local save failed:', e);
  }

  try {
    const payload = {
      ...product,
      imageUrl: primaryImg,
      images: product.images || (primaryImg ? [primaryImg] : []),
      adminKey: ADMIN_KEY,
    };

    const docRef = doc(db, COLLECTION_NAME, product.id);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Firestore write warning:', error);
    // Don't throw fatal error if local save already succeeded
  }
}

/**
 * Deletes a product from Firebase Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${productId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
