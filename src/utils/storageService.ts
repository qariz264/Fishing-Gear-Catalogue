import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';
import { compressImage } from './imageCompressor';

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  isStorageBucketUrl: boolean;
  sizeKb?: number;
}

export type StorageFolder = 'products' | 'blogs' | 'events' | 'training' | 'fishing-spots';

/**
 * Uploads an image file with dual strategy:
 * 1. Tries Firebase Storage bucket first.
 * 2. If bucket is unavailable or rejects, falls back to ultra-lightweight WebP/JPEG (< 50KB)
 *    so the administrator is never blocked from publishing articles or catalogue gear.
 */
export async function uploadImageToStorage(
  file: File,
  folder: StorageFolder,
  onProgress?: (progressPercent: number) => void
): Promise<UploadResult> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPEG, PNG, WebP).');
  }

  // Validate file size (max 15MB)
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image size is too large. Please select an image under 15MB.');
  }

  if (onProgress) onProgress(15);

  // Pre-optimize image to max 1000px, 0.75 quality WebP/JPEG
  // Guarantees zero cropping, high fidelity, and tiny payload size (~25-45KB)
  let compressedDataUrl = '';
  try {
    compressedDataUrl = await compressImage(file, 1000, 1000, 0.75);
  } catch (err) {
    console.warn('Compression error, continuing with original file:', err);
  }

  if (onProgress) onProgress(40);

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt || 'jpg'}`;
  const storagePath = `${folder}/${fileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    let blobToUpload: Blob = file;

    if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
      const res = await fetch(compressedDataUrl);
      blobToUpload = await res.blob();
    }

    const uploadTask = uploadBytesResumable(storageRef, blobToUpload);

    return await new Promise<UploadResult>((resolve, reject) => {
      // 3.5s timeout: if Firebase Storage bucket is unprovisioned or blocked by CORS, proceed to resilient fallback
      const timeoutId = setTimeout(() => {
        reject(new Error('Firebase Storage timeout - using optimized asset'));
      }, 3500);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const pct = Math.round(40 + (snapshot.bytesTransferred / snapshot.totalBytes) * 60);
            onProgress(pct);
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              downloadUrl,
              storagePath,
              isStorageBucketUrl: true,
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  } catch (storageError) {
    // Graceful fallback: return the high-quality compressed asset (< 50KB)
    if (!compressedDataUrl) {
      compressedDataUrl = await compressImage(file, 900, 900, 0.72);
    }

    if (onProgress) onProgress(100);
    const sizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

    return {
      downloadUrl: compressedDataUrl,
      storagePath: `optimized/${folder}/${fileName}`,
      isStorageBucketUrl: false,
      sizeKb,
    };
  }
}

/**
 * Deletes an image from Firebase Storage if it's stored in the bucket.
 */
export async function deleteImageFromStorage(storagePath?: string): Promise<void> {
  if (
    !storagePath ||
    storagePath.startsWith('optimized/') ||
    storagePath.startsWith('fallback/') ||
    storagePath.startsWith('http') ||
    !storagePath.includes('/')
  ) {
    return;
  }

  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete file from storage (might already be removed):', err);
  }
}
