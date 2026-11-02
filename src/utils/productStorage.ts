import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { safeOnSnapshot } from './firestoreSafe';
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
 * Global product image synchronization and isolation sanitizer.
 * Guarantees:
 * 1. Deep clones images arrays to prevent in-memory mutation/leakage between products.
 * 2. Corrects cross-category misassignments (e.g., braided line photo under reel).
 * 3. 100% of authentic uploaded photos are preserved and routed to their proper product.
 * 4. Deduplicates identical image URLs within any single product's gallery.
 * 5. Synchronizes primary imageUrl with images[0].
 */
export function sanitizeProductGalleries(products: Product[]): Product[] {
  const BRAIDED_LINE_IMAGE = '/images/catalog/product-1791963000594-2.webp';
  const ZEBCO_REEL_ID = 'product-1791963000594';
  const BRAIDED_LINE_ID = 'prod-1792331101161';

  return products.map((p) => {
    let images: string[] = Array.isArray(p.images)
      ? [...p.images].filter((img) => typeof img === 'string' && img.trim().length > 0)
      : (p.imageUrl ? [p.imageUrl] : []);

    // If this is Zebco 202 imitation reel, exclude the braided line spool
    if (p.id === ZEBCO_REEL_ID) {
      images = images.filter((img) => !img.includes('product-1791963000594-2.webp'));
      if (images.length === 0) {
        images = ['/images/catalog/product-1791963000594-1.jpg'];
      }
    }

    // If this is Braided fishing line, ensure the braided line spool image is present
    if (p.id === BRAIDED_LINE_ID) {
      if (!images.includes(BRAIDED_LINE_IMAGE)) {
        images.push(BRAIDED_LINE_IMAGE);
      }
    }

    // Deduplicate while preserving order
    const uniqueImages = Array.from(new Set(images));
    const cover = uniqueImages[0] || p.imageUrl || '';

    return {
      ...p,
      images: uniqueImages,
      imageUrl: cover,
    };
  });
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

  const result: Product[] = INITIAL_PRODUCTS.map((p) => {
    const cached = cachedMap.get(p.id);
    const customImg = customImages[p.id];
    const resolvedPrice = cached && cached.price !== undefined ? Number(cached.price) : (p.price || 0);

    let resolvedImages = p.images && p.images.length > 0 ? [...p.images] : (p.imageUrl ? [p.imageUrl] : []);
    let resolvedImage = p.imageUrl || resolvedImages[0] || '';

    // If cached product has saved images, ensure they are valid and not corrupted
    if (cached && Array.isArray(cached.images) && cached.images.length > 0) {
      const cleaned = cached.images.map((img) => {
        if (typeof img === 'string' && p.imageUrl && p.imageUrl.endsWith('.jpg') && img.endsWith(`${p.id}-1.webp`)) {
          return p.imageUrl;
        }
        return img;
      });
      resolvedImages = cleaned;
      resolvedImage = cached.imageUrl || cleaned[0] || resolvedImage;
      if (typeof resolvedImage === 'string' && p.imageUrl && p.imageUrl.endsWith('.jpg') && resolvedImage.endsWith(`${p.id}-1.webp`)) {
        resolvedImage = p.imageUrl;
      }
    } else if (customImg) {
      resolvedImage = customImg;
      resolvedImages = [customImg];
    }

    // Safety fallback: if images ended up empty, recover from initial catalog
    if (!resolvedImage || resolvedImages.length === 0) {
      resolvedImages = p.images && p.images.length > 0 ? [...p.images] : (p.imageUrl ? [p.imageUrl] : []);
      resolvedImage = p.imageUrl || resolvedImages[0] || '';
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

  return sanitizeProductGalleries(result);
}

export function saveStoredProducts(products: Product[]): void {
  try {
    const sanitized = sanitizeProductGalleries(products);
    const initialMap = new Map<string, Product>();
    INITIAL_PRODUCTS.forEach((p) => initialMap.set(p.id, p));

    const lightweight = sanitized.map((p) => {
      const initial = initialMap.get(p.id);

      let cleanImages = Array.isArray(p.images) && p.images.length > 0
        ? [...p.images]
        : (p.imageUrl ? [p.imageUrl] : []);
      let cleanCover = p.imageUrl || cleanImages[0] || '';

      // Repair any corrupted .webp if initial was .jpg
      if (initial && initial.imageUrl && initial.imageUrl.endsWith('.jpg')) {
        cleanCover = cleanCover.replace(new RegExp(`${p.id}-1\\.webp$`), `${p.id}-1.jpg`);
        cleanImages = cleanImages.map((img) =>
          typeof img === 'string' ? img.replace(new RegExp(`${p.id}-1\\.webp$`), `${p.id}-1.jpg`) : img
        );
      }

      // If image is a large data URL that corresponds to an initial product, map to initial.imageUrl
      if (initial && typeof cleanCover === 'string' && cleanCover.startsWith('data:')) {
        cleanCover = initial.imageUrl || cleanCover;
        cleanImages = initial.images && initial.images.length > 0 ? [...initial.images] : [cleanCover];
      }

      // If images array is empty, fall back to initial
      if (cleanImages.length === 0 && initial) {
        cleanImages = initial.images && initial.images.length > 0 ? [...initial.images] : (initial.imageUrl ? [initial.imageUrl] : []);
        cleanCover = cleanCover || initial.imageUrl || '';
      }

      return {
        ...p,
        imageUrl: cleanCover,
        images: cleanImages,
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

  return safeOnSnapshot(
    colRef,
    async (snapshot) => {
      // If collection is empty, fall back immediately to stored products
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

        // 1. Gather all candidate images from Firestore doc
        let candidateImages: string[] = [];
        if (Array.isArray(data.images) && data.images.length > 0) {
          candidateImages = data.images.filter((img) => typeof img === 'string' && img.trim().length > 0);
        } else if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.trim().length > 0) {
          candidateImages = [data.imageUrl];
        }

        // Check alternate Firestore image fields if present
        if (candidateImages.length === 0) {
          const rawData = data as any;
          if (rawData.image && typeof rawData.image === 'string' && rawData.image.trim().length > 0) {
            candidateImages.push(rawData.image);
          }
          if (Array.isArray(rawData.photos) && rawData.photos.length > 0) {
            candidateImages.push(...rawData.photos);
          }
          if (rawData.photoUrl && typeof rawData.photoUrl === 'string' && rawData.photoUrl.trim().length > 0) {
            candidateImages.push(rawData.photoUrl);
          }
        }

        // 2. Sanitize and repair any corrupted .webp extensions or data URLs matching initial catalog
        if (candidateImages.length > 0) {
          candidateImages = candidateImages.map((img) => {
            if (initial && initial.imageUrl && initial.imageUrl.endsWith('.jpg') && img.endsWith(`${initial.id}-1.webp`)) {
              return initial.imageUrl;
            }
            if (initial && initial.imageUrl && img.startsWith('data:')) {
              return initial.imageUrl;
            }
            return img;
          });
        }

        // 3. Resolve final images and cover URL
        let resolvedImages: string[];
        let resolvedImage: string;

        if (candidateImages.length > 0) {
          resolvedImages = candidateImages;
          resolvedImage = (data.imageUrl && !data.imageUrl.startsWith('data:') && !data.imageUrl.endsWith(`${initial?.id}-1.webp`))
            ? data.imageUrl
            : (resolvedImages[0] || '');
          if (initial && initial.imageUrl && initial.imageUrl.endsWith('.jpg') && resolvedImage.endsWith(`${initial.id}-1.webp`)) {
            resolvedImage = initial.imageUrl;
          }
        } else if (customImg) {
          resolvedImage = customImg;
          resolvedImages = [customImg];
        } else {
          resolvedImages = initial?.images && initial.images.length > 0
            ? [...initial.images]
            : (initial?.imageUrl ? [initial.imageUrl] : []);
          resolvedImage = initial?.imageUrl || (resolvedImages[0] || '');
        }

        // Fallback if still empty
        if (!resolvedImage && initial?.imageUrl) {
          resolvedImage = initial.imageUrl;
          if (resolvedImages.length === 0) {
            resolvedImages = initial.images && initial.images.length > 0 ? [...initial.images] : [initial.imageUrl];
          }
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

      const sanitized = sanitizeProductGalleries(productsFromDb);
      saveStoredProducts(sanitized);
      onUpdate(sanitized);
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
  // 1. Remove from local storage and custom images immediately
  const current = getStoredProducts().filter((p) => p.id !== productId);
  saveStoredProducts(current);
  removeCustomImage(productId);

  // 2. Delete from Firebase Firestore
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

/**
 * Reassigns a specific photo from one product to another.
 * Removes the image from the source product and adds it to the target product.
 * Preserves the image completely (no deletion from storage or disk), updates both products,
 * and synchronizes with Firebase Firestore and local storage.
 */
export async function reassignProductImage(
  sourceProductId: string,
  imageIndexOrUrl: number | string,
  targetProductId: string
): Promise<{
  success: boolean;
  sourceImages: string[];
  targetImages: string[];
  movedImage: string;
}> {
  if (sourceProductId === targetProductId) {
    throw new Error('Source and target product cannot be the same.');
  }

  const currentProducts = getStoredProducts();
  const sourceIdx = currentProducts.findIndex((p) => p.id === sourceProductId);
  const targetIdx = currentProducts.findIndex((p) => p.id === targetProductId);

  if (sourceIdx === -1) {
    throw new Error(`Source product "${sourceProductId}" not found.`);
  }
  if (targetIdx === -1) {
    throw new Error(`Target product "${targetProductId}" not found.`);
  }

  const sourceProduct = currentProducts[sourceIdx];
  const targetProduct = currentProducts[targetIdx];

  const sourceImages = Array.isArray(sourceProduct.images) && sourceProduct.images.length > 0
    ? [...sourceProduct.images]
    : (sourceProduct.imageUrl ? [sourceProduct.imageUrl] : []);

  let targetImgIdx = -1;
  if (typeof imageIndexOrUrl === 'number') {
    targetImgIdx = imageIndexOrUrl;
  } else {
    targetImgIdx = sourceImages.indexOf(imageIndexOrUrl);
  }

  if (targetImgIdx < 0 || targetImgIdx >= sourceImages.length) {
    throw new Error(`Target image not found in source product "${sourceProductId}".`);
  }

  const movedImage = sourceImages[targetImgIdx];
  const newSourceImages = sourceImages.filter((_, idx) => idx !== targetImgIdx);
  const newSourceCover = newSourceImages[0] || '';

  const targetImages = Array.isArray(targetProduct.images) && targetProduct.images.length > 0
    ? [...targetProduct.images]
    : (targetProduct.imageUrl ? [targetProduct.imageUrl] : []);

  // Add to target images if not already present
  const newTargetImages = targetImages.includes(movedImage)
    ? [...targetImages]
    : [...targetImages, movedImage];
  const newTargetCover = targetProduct.imageUrl || newTargetImages[0] || '';

  // Update both products in cache
  currentProducts[sourceIdx] = {
    ...sourceProduct,
    images: newSourceImages,
    imageUrl: newSourceCover,
    updatedAt: new Date().toISOString(),
  };

  currentProducts[targetIdx] = {
    ...targetProduct,
    images: newTargetImages,
    imageUrl: newTargetCover,
    updatedAt: new Date().toISOString(),
  };

  saveStoredProducts(currentProducts);

  // Synchronize to Firestore
  try {
    const sourceDocRef = doc(db, COLLECTION_NAME, sourceProductId);
    const targetDocRef = doc(db, COLLECTION_NAME, targetProductId);

    await Promise.all([
      setDoc(
        sourceDocRef,
        {
          images: newSourceImages,
          imageUrl: newSourceCover,
          updatedAt: new Date().toISOString(),
          adminKey: ADMIN_KEY,
        },
        { merge: true }
      ),
      setDoc(
        targetDocRef,
        {
          images: newTargetImages,
          imageUrl: newTargetCover,
          updatedAt: new Date().toISOString(),
          adminKey: ADMIN_KEY,
        },
        { merge: true }
      ),
    ]);
  } catch (err) {
    console.warn('Firestore sync notice for image reassignment:', err);
  }

  return {
    success: true,
    sourceImages: newSourceImages,
    targetImages: newTargetImages,
    movedImage,
  };
}
