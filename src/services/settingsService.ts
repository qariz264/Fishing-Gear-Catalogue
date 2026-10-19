import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SocialShareSettings } from '../types/admin';
import { ADMIN_KEY } from '../utils/adminConstants';
import { CANONICAL_BASE_URL } from '../utils/seo';

export const DEFAULT_SHARE_IMAGE = `${CANONICAL_BASE_URL}/og-image.jpg`;
export const DEFAULT_SHARE_TITLE = 'Fishing With Nelson - Premium Fishing Gear, Spots & Training Kenya';
export const DEFAULT_SHARE_DESCRIPTION =
  'Browse quality rods, reels, lures, hooks, fishing spots, and training clinics. Order via WhatsApp with countrywide delivery across Kenya.';

export const LOCAL_STORAGE_SHARE_IMAGE_KEY = 'fwn_custom_og_image';
export const LOCAL_STORAGE_SHARE_TITLE_KEY = 'fwn_custom_og_title';
export const LOCAL_STORAGE_SHARE_DESC_KEY = 'fwn_custom_og_desc';

/**
 * Retrieves the current social share card settings from Firestore with local fallback
 */
export async function getSocialShareSettings(): Promise<SocialShareSettings> {
  const storedImage = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_SHARE_IMAGE_KEY) : null;
  const fallbackSettings: SocialShareSettings = {
    id: 'socialShare',
    shareImageUrl: storedImage !== null ? storedImage : DEFAULT_SHARE_IMAGE,
    shareTitle:
      (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_SHARE_TITLE_KEY)) ||
      DEFAULT_SHARE_TITLE,
    shareDescription:
      (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_SHARE_DESC_KEY)) ||
      DEFAULT_SHARE_DESCRIPTION,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'settings', 'socialShare');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<SocialShareSettings>;
      const merged: SocialShareSettings = {
        id: 'socialShare',
        shareImageUrl: typeof data.shareImageUrl === 'string' ? data.shareImageUrl : fallbackSettings.shareImageUrl,
        shareImageStoragePath: data.shareImageStoragePath || '',
        shareTitle: data.shareTitle || fallbackSettings.shareTitle,
        shareDescription: data.shareDescription || fallbackSettings.shareDescription,
        updatedAt: data.updatedAt || fallbackSettings.updatedAt,
        updatedBy: data.updatedBy,
      };

      // Keep localStorage in sync
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SHARE_IMAGE_KEY, merged.shareImageUrl);
        localStorage.setItem(LOCAL_STORAGE_SHARE_TITLE_KEY, merged.shareTitle);
        localStorage.setItem(LOCAL_STORAGE_SHARE_DESC_KEY, merged.shareDescription);
      }

      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch social share settings from Firestore, using cached/default:', err);
  }

  return fallbackSettings;
}

/**
 * Saves updated social share settings to Firestore and syncs DOM meta tags
 */
export async function saveSocialShareSettings(
  settings: Partial<SocialShareSettings>
): Promise<SocialShareSettings> {
  const updated: SocialShareSettings = {
    id: 'socialShare',
    shareImageUrl: typeof settings.shareImageUrl === 'string' ? settings.shareImageUrl : '',
    shareImageStoragePath: settings.shareImageStoragePath || '',
    shareTitle: settings.shareTitle || DEFAULT_SHARE_TITLE,
    shareDescription: settings.shareDescription || DEFAULT_SHARE_DESCRIPTION,
    updatedAt: new Date().toISOString(),
    updatedBy: settings.updatedBy || 'admin',
    adminKey: ADMIN_KEY,
  };

  try {
    const docRef = doc(db, 'settings', 'socialShare');
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Could not write to Firestore settings (may be offline), saving locally:', err);
  }

  // Always update localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_SHARE_IMAGE_KEY, updated.shareImageUrl);
    localStorage.setItem(LOCAL_STORAGE_SHARE_TITLE_KEY, updated.shareTitle);
    localStorage.setItem(LOCAL_STORAGE_SHARE_DESC_KEY, updated.shareDescription);
  }

  // Immediately update active DOM meta tags
  applySocialMetaToDOM(updated.shareImageUrl, updated.shareTitle, updated.shareDescription);

  return updated;
}

/**
 * Dynamically updates DOM meta tags for OpenGraph and Twitter cards
 */
export function applySocialMetaToDOM(imageUrl: string, title?: string, description?: string) {
  if (typeof document === 'undefined') return;

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) {
    if (imageUrl) {
      ogImg.setAttribute('content', imageUrl);
    } else {
      ogImg.removeAttribute('content');
    }
  }
  const ogImgSec = document.querySelector('meta[property="og:image:secure_url"]');
  if (ogImgSec) {
    if (imageUrl) {
      ogImgSec.setAttribute('content', imageUrl);
    } else {
      ogImgSec.removeAttribute('content');
    }
  }
  const twImg = document.querySelector('meta[name="twitter:image"]');
  if (twImg) {
    if (imageUrl) {
      twImg.setAttribute('content', imageUrl);
    } else {
      twImg.removeAttribute('content');
    }
  }

  if (title) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
  }

  if (description) {
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);
  }
}

/**
 * Listens for real-time updates to social share settings
 */
export function subscribeToSocialShareSettings(
  callback: (settings: SocialShareSettings) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'socialShare');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SocialShareSettings>;
          const settings: SocialShareSettings = {
            id: 'socialShare',
            shareImageUrl: typeof data.shareImageUrl === 'string' ? data.shareImageUrl : '',
            shareImageStoragePath: data.shareImageStoragePath,
            shareTitle: data.shareTitle || DEFAULT_SHARE_TITLE,
            shareDescription: data.shareDescription || DEFAULT_SHARE_DESCRIPTION,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_SHARE_IMAGE_KEY, settings.shareImageUrl);
            localStorage.setItem(LOCAL_STORAGE_SHARE_TITLE_KEY, settings.shareTitle);
            localStorage.setItem(LOCAL_STORAGE_SHARE_DESC_KEY, settings.shareDescription);
          }
          applySocialMetaToDOM(settings.shareImageUrl, settings.shareTitle, settings.shareDescription);
          callback(settings);
        }
      },
      (err) => {
        console.warn('Social share subscription notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Could not initialize social share settings listener:', err);
    return () => {};
  }
}
