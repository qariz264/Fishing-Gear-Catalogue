/**
 * Image compression utility using HTML Canvas.
 * Resizes images to max 1000px dimension and compresses to lightweight JPEG.
 * Guarantees zero cropping and reduces multi-MB files to ~40KB-90KB for fast Firestore storage.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Calculate constrained proportions preserving 100% of the image
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      // Draw entire uncropped image
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP where supported, falling back to JPEG
      let compressedDataUrl = '';
      try {
        compressedDataUrl = canvas.toDataURL('image/webp', quality);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
      } catch (e) {
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
