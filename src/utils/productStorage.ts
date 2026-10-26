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
 * Gets cached products from local storage for instant render
 */
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }

  return INITIAL_PRODUCTS.map((p) => ({
    ...p,
    price: p.price !== undefined ? Number(p.price) : 0,
    imageUrl: '',
  }));
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
 * Syncs changes across all users and updates.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      // If collection is completely empty in Firestore, seed with initial template products
      if (snapshot.empty) {
        const local = getStoredProducts();
        onUpdate(local);
        return;
      }

      const productsFromDb: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Product;
        const imgs = data.images && Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : (data.imageUrl ? [data.imageUrl] : []);
        productsFromDb.push({
          ...data,
          id: d.id,
          price: data.price !== undefined ? Number(data.price) : 0,
          imageUrl: data.imageUrl || imgs[0] || '',
          images: imgs,
        });
      });

      // Sort by name or category
      saveStoredProducts(productsFromDb);
      onUpdate(productsFromDb);
    },
    (error) => {
      console.warn('Firestore onSnapshot subscription notice:', error);
      // Fallback gracefully to cached products so the catalogue always renders
      const local = getStoredProducts();
      onUpdate(local);
    }
  );
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const docPath = `${COLLECTION_NAME}/${product.id}`;
  try {
    const primaryImg = product.images && product.images.length > 0 ? product.images[0] : (product.imageUrl || '');
    const payload = {
      ...product,
      imageUrl: primaryImg,
      images: product.images || (primaryImg ? [primaryImg] : []),
      adminKey: ADMIN_KEY,
    };

    const docRef = doc(db, COLLECTION_NAME, product.id);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
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
