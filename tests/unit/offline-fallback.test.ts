import { describe, it, expect, vi } from 'vitest';
import { withOfflineFallback } from '@/modules/offline/services/read';
import { isOfflineError } from '@/modules/offline/services/network';

describe('isOfflineError', () => {
  it('detects genuine network failures', () => {
    expect(isOfflineError(new Error('Failed to fetch'))).toBe(true);
    expect(isOfflineError(new TypeError('Load failed'))).toBe(true);
    expect(isOfflineError({ status: 0, message: 'boom' })).toBe(true);
  });

  it('does not mask business errors', () => {
    expect(isOfflineError(new Error('duplicate key value violates unique constraint'))).toBe(false);
    expect(isOfflineError({ status: 42501, message: 'RLS denial' })).toBe(false);
    expect(isOfflineError(new Error(''))).toBe(false);
  });
});

describe('withOfflineFallback', () => {
  it('returns network result and never touches local on success', async () => {
    const local = vi.fn();
    const result = await withOfflineFallback(async () => 'dari-jaringan', local);
    expect(result).toBe('dari-jaringan');
    expect(local).not.toHaveBeenCalled();
  });

  it('falls back to local when the network is down', async () => {
    const local = vi.fn().mockResolvedValue('dari-mirror');
    const result = await withOfflineFallback(
      async () => {
        throw new Error('Failed to fetch');
      },
      local
    );
    expect(result).toBe('dari-mirror');
    expect(local).toHaveBeenCalledTimes(1);
  });

  it('rethrows business errors instead of hiding them behind stale data', async () => {
    const local = vi.fn();
    const business = new Error('duplicate key value violates unique constraint');
    await expect(
      withOfflineFallback(
        async () => {
          throw business;
        },
        local
      )
    ).rejects.toThrow('duplicate key');
    expect(local).not.toHaveBeenCalled();
  });

  it('propagates local failures untouched', async () => {
    await expect(
      withOfflineFallback(
        async () => {
          throw new Error('Failed to fetch');
        },
        async () => {
          throw new Error('mirror korup');
        }
      )
    ).rejects.toThrow('mirror korup');
  });
});
