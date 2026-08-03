import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '@/shared/services/rate-limit';

// rateLimit is backed by a module-level Map; reset between tests by using
// unique client keys per test case.
describe('rateLimit', () => {
  beforeEach(() => {
    // no-op: buckets are keyed by ip, each test uses unique ips
  });

  it('allows requests under the limit', () => {
    const ip = '1.1.1.1';
    expect(rateLimit(ip, 5, 60_000).ok).toBe(true);
    expect(rateLimit(ip, 5, 60_000).ok).toBe(true);
    expect(rateLimit(ip, 5, 60_000).ok).toBe(true);
  });

  it('blocks requests once the limit is reached', () => {
    const ip = '2.2.2.2';
    for (let i = 0; i < 3; i++) expect(rateLimit(ip, 3, 60_000).ok).toBe(true);
    const blocked = rateLimit(ip, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it('tracks different clients independently', () => {
    expect(rateLimit('3.3.3.3', 1, 60_000).ok).toBe(true);
    expect(rateLimit('3.3.3.4', 1, 60_000).ok).toBe(true);
    expect(rateLimit('3.3.3.3', 1, 60_000).ok).toBe(false);
  });

  it('resets the window after it expires', () => {
    const ip = '4.4.4.4';
    rateLimit(ip, 1, 10);
    expect(rateLimit(ip, 1, 10).ok).toBe(false);
    // After the 10ms window passes, the bucket resets
    return new Promise((resolve) => setTimeout(resolve, 30)).then(() => {
      expect(rateLimit(ip, 1, 10).ok).toBe(true);
    });
  });
});
