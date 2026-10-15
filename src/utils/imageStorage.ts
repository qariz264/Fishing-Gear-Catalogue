// Persistent storage for custom uploaded product images using localStorage

const STORAGE_KEY = 'fishwithnelson_custom_images';

export function getCustomImages(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCustomImage(productId: string, dataUrl: string): void {
  try {
    const current = getCustomImages();
    current[productId] = dataUrl;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save to localStorage (quota or disabled):', e);
  }
}

export function removeCustomImage(productId: string): void {
  try {
    const current = getCustomImages();
    delete current[productId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to remove custom image:', e);
  }
}
