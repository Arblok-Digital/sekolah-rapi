const NETWORK_ERROR_PATTERNS = [
  'Failed to fetch',
  'fetch failed',
  'NetworkError',
  'Network request failed',
  'Network Error',
  'Load failed',
  'TypeError',
];

/**
 * Returns true only when the error is a genuine network/connectivity failure.
 * Business errors (duplicate key, RLS denial, validation, 4xx/5xx) return false
 * so callers can surface them to the user instead of silently queueing offline.
 */
export function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;

  const status = (error as { status?: number })?.status;
  if (typeof status === 'number' && status === 0) return true;

  const message = error instanceof Error ? error.message : String(error ?? '');
  if (!message) return false;

  return NETWORK_ERROR_PATTERNS.some((pattern) =>
    message.toLowerCase().includes(pattern.toLowerCase())
  );
}
