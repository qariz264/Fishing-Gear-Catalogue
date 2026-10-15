/**
 * Recursively removes undefined values from objects before writing to Firestore.
 * Firestore throws a runtime error if any field in a document is explicitly undefined.
 */
export function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): T {
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue;
    }
    if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      result[key] = sanitizeFirestorePayload(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
