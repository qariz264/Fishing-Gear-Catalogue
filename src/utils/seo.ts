/**
 * Canonical SEO and Metadata Manager for Fishing With Nelson
 * Enforces strictly non-www https://fishingwithnelson.co.ke/ across all views
 */

export const CANONICAL_BASE_URL = 'https://fishingwithnelson.co.ke';

export interface SeoMetadataOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Updates DOM head tags for canonical URL, title, meta description, and OpenGraph
 */
export function setPageSeo({
  title,
  description,
  canonicalPath,
  ogImage,
  noindex = false,
}: SeoMetadataOptions): void {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  if (title) {
    document.title = title;
  }

  // 2. Update Meta Description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }

  // 3. Update Robots Directive (prevent accidental noindex on public pages, protect admin)
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  if (noindex) {
    metaRobots.setAttribute('content', 'noindex, nofollow');
  } else {
    metaRobots.setAttribute(
      'content',
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
  }

  // 4. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }

  let finalCanonicalUrl = CANONICAL_BASE_URL;
  if (canonicalPath) {
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    finalCanonicalUrl = `${CANONICAL_BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
  } else if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const search = window.location.search;
    finalCanonicalUrl = `${CANONICAL_BASE_URL}${path === '/' && !search ? '/' : `${path}${search}`}`;
  }

  canonicalLink.setAttribute('href', finalCanonicalUrl);

  // 5. Sync OpenGraph & Twitter Meta
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    ogUrl.setAttribute('content', finalCanonicalUrl);
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

  let defaultOgImage = `${CANONICAL_BASE_URL}/og-image.jpg`;
  if (typeof localStorage !== 'undefined') {
    const custom = localStorage.getItem('fwn_custom_og_image');
    if (custom) defaultOgImage = custom;
  }
  const finalOgImage = ogImage || defaultOgImage;
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', finalOgImage);
  const twImg = document.querySelector('meta[name="twitter:image"]');
  if (twImg) twImg.setAttribute('content', finalOgImage);
}
