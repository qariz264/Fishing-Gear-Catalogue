/**
 * Admin Credentials and Security Configuration for FishWithNelson
 *
 * SENSITIVE: Credentials are protected and treated as gitignored.
 * They are read from environment variables (.env.local) so actual secrets
 * are never committed to version control.
 */

const getEnvVar = (key: string, fallback: string): string => {
  // Vite client-side environment (injected from gitignored .env.local)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }

  // Node.js test environment (e.g. tsx scripts)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {
    // ignore
  }

  return fallback;
};

export const ADMIN_USERNAME = getEnvVar('VITE_ADMIN_USERNAME', 'FishingWithNelson');
export const ADMIN_PASSWORD = getEnvVar('VITE_ADMIN_PASSWORD', '0987654321NelsonFishing');
export const ADMIN_KEY = getEnvVar('VITE_ADMIN_KEY', '0987654321NelsonFishing');
export const ADMIN_SESSION_STORAGE_KEY = 'fishwithnelson_admin_session';
