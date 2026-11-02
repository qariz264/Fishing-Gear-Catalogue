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
import { getCustomImages, saveCustomImage, removeCustomImage } from './imageStorage';

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

  const result: Product[] = INITIAL_PRODUCTS.map((p) => {
    const cached = cachedMap.get(p.id);
    const customImg = customImages[p.id];
    const resolvedPrice = cached && cached.price !== undefined ? Number(cached.price) : (p.price || 0);

    // If admin explicitly modified or deleted images in cached product, honor cached images
    let resolvedImages: string[];
    let resolvedImage: string;

    if (cached && Array.isArray(cached.images)) {
      resolvedImages = cached.images;
      resolvedImage = cached.imageUrl !== undefined ? cached.imageUrl : (resolvedImages[0] || '');
    } else if (customImg) {
      resolvedImage = customImg;
      resolvedImages = [customImg];
    } else {
      resolvedImages = p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []);
      resolvedImage = p.imageUrl || (resolvedImages[0] || '');
    }

    return {
      ...p,
      ...(cached || {}),
      price: resolvedPrice,
      imageUrl: resolvedImage,
      images: resolvedImages,
    };
  });

  // Include any newly created products that aren't in INITIAL_PRODUCTS
  const initialIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
  for (const c of cachedProducts) {
    if (!initialIds.has(c.id)) {
      result.push(c);
    }
  }

  return result;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    // To protect against browser 5MB localStorage quota, sanitize payload
    // If an image is an excessively large data URL, don't store megabytes in localStorage
    const lightweight = products.map((p) => {
      const isHugeDataUrl = typeof p.imageUrl === 'string' && p.imageUrl.startsWith('data:') && p.imageUrl.length > 50000;
      const imagesClean = Array.isArray(p.images)
        ? p.images.map((img) => (typeof img === 'string' && img.startsWith('data:') && img.length > 50000 ? `/images/catalog/${p.id}-1.webp` : img))
        : p.images;

      return {
        ...p,
        imageUrl: isHugeDataUrl ? (imagesClean?.[0] || `/images/catalog/${p.id}-1.webp`) : p.imageUrl,
        images: imagesClean,
      };
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight));
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

        const resolvedPrice = data.price !== undefined && Number(data.price) >= 0 
          ? Number(data.price) 
          : (initial?.price || 0);

        // If admin has saved or modified images array in Firestore, honor Firestore data
        let resolvedImages: string[];
        let resolvedImage: string;

        if (Array.isArray(data.images)) {
          resolvedImages = data.images;
          resolvedImage = data.imageUrl !== undefined ? data.imageUrl : (resolvedImages[0] || '');
        } else if (customImg) {
          resolvedImage = customImg;
          resolvedImages = [customImg];
        } else if (data.imageUrl) {
          resolvedImage = data.imageUrl;
          resolvedImages = [data.imageUrl];
        } else {
          resolvedImages = initial?.images && initial.images.length > 0 ? initial.images : (initial?.imageUrl ? [initial.imageUrl] : []);
          resolvedImage = initial?.imageUrl || (resolvedImages[0] || '');
        }

        productsFromDb.push({
          ...(initial || {}),
          ...data,
          id: d.id,
          price: resolvedPrice,
          imageUrl: resolvedImage,
          images: resolvedImages,
        });
      });

      // Guarantee any initial products not yet in this query snapshot remain intact
      const dbIds = new Set(productsFromDb.map((p) => p.id));
      for (const p of INITIAL_PRODUCTS) {
        if (!dbIds.has(p.id)) {
          productsFromDb.push(p);
        }
      }

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

/**
 * Deletes a specific image from a product's gallery as requested by the administrator.
 * Removes the image from the images array, updates primary cover image if necessary,
 * and synchronizes with Firebase Firestore and local storage.
 */
export async function deleteProductImage(
  productId: string,
  imageIndexOrUrl: number | string
): Promise<{ success: boolean; remainingImages: string[]; newCoverUrl: string }> {
  const currentProducts = getStoredProducts();
  const productIdx = currentProducts.findIndex((p) => p.id === productId);
  if (productIdx === -1) {
    throw new Error(`Product with ID "${productId}" not found.`);
  }

  const product = currentProducts[productIdx];
  const currentImages = Array.isArray(product.images) && product.images.length > 0
    ? [...product.images]
    : (product.imageUrl ? [product.imageUrl] : []);

  let targetIndex = -1;
  if (typeof imageIndexOrUrl === 'number') {
    targetIndex = imageIndexOrUrl;
  } else {
    targetIndex = currentImages.indexOf(imageIndexOrUrl);
  }

  if (targetIndex < 0 || targetIndex >= currentImages.length) {
    throw new Error(`Target image not found or index ${targetIndex} is out of bounds for product "${productId}".`);
  }

  const deletedImage = currentImages[targetIndex];
  const remainingImages = currentImages.filter((_, idx) => idx !== targetIndex);
  const newCoverUrl = remainingImages[0] || '';

  // Clean up custom image cache if it matches the deleted image
  const customImages = getCustomImages();
  if (customImages[productId] === deletedImage) {
    removeCustomImage(productId);
  }

  // Update in local cache immediately
  const updatedProduct: Product = {
    ...product,
    images: remainingImages,
    imageUrl: newCoverUrl,
    updatedAt: new Date().toISOString(),
  };
  currentProducts[productIdx] = updatedProduct;
  saveStoredProducts(currentProducts);

  // Synchronize update to Firebase Firestore
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await setDoc(
      docRef,
      {
        images: remainingImages,
        imageUrl: newCoverUrl,
        updatedAt: new Date().toISOString(),
        adminKey: ADMIN_KEY,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore sync notice for image deletion:', err);
  }

  return {
    success: true,
    remainingImages,
    newCoverUrl,
  };
}
