import { describe, it, expect } from 'vitest';
import {
  PULL_TABLES,
  TOMBSTONE_TABLES,
  PULL_OVERLAP_MS,
  mapEntityToTable,
  normalizeIso,
  pullSinceIso,
  nextCursor,
} from '@/modules/offline/services/sync-core';

describe('mapEntityToTable', () => {
  it('maps queue entity aliases to postgres table names', () => {
    expect(mapEntityToTable('student')).toBe('students');
    expect(mapEntityToTable('spp_payment')).toBe('spp_payments');
    expect(mapEntityToTable('transaction')).toBe('transactions');
    expect(mapEntityToTable('category')).toBe('categories');
  });

  it('passes through names that are already table names', () => {
    expect(mapEntityToTable('students')).toBe('students');
    expect(mapEntityToTable('unknown_entity')).toBe('unknown_entity');
  });
});

describe('pull table sets', () => {
  it('covers exactly the four mirrored core tables', () => {
    expect([...PULL_TABLES].sort()).toEqual(
      ['categories', 'spp_payments', 'students', 'transactions'].sort()
    );
    expect([...TOMBSTONE_TABLES].sort()).toEqual([...PULL_TABLES].sort());
  });
});

describe('normalizeIso', () => {
  it('converts valid input to UTC ISO with Z', () => {
    expect(normalizeIso('2026-10-09T07:00:00+07:00')).toBe('2026-10-09T00:00:00.000Z');
    expect(normalizeIso(new Date(Date.UTC(2026, 0, 2, 3, 4, 5)))).toBe('2026-01-02T03:04:05.000Z');
  });

  it('returns null for empty or invalid values', () => {
    expect(normalizeIso(null)).toBeNull();
    expect(normalizeIso(undefined)).toBeNull();
    expect(normalizeIso('')).toBeNull();
    expect(normalizeIso('bukan-tanggal')).toBeNull();
  });
});

describe('pullSinceIso', () => {
  it('returns epoch for missing cursor — full pull is idempotent', () => {
    expect(pullSinceIso(null)).toBe('1970-01-01T00:00:00.000Z');
    expect(pullSinceIso('garbage')).toBe('1970-01-01T00:00:00.000Z');
  });

  it('subtracts the overlap window from a valid cursor', () => {
    const cursor = '2026-10-09T10:00:00.000Z';
    const since = new Date(pullSinceIso(cursor)).getTime();
    expect(since).toBe(new Date(cursor).getTime() - PULL_OVERLAP_MS);
  });
});

describe('nextCursor', () => {
  it('takes the newest updated_at from the page', () => {
    const cursor = nextCursor([
      { updated_at: '2026-10-09T01:00:00.000Z' },
      { updated_at: '2026-10-09T03:00:00.000Z' },
      { updated_at: '2026-10-09T02:00:00.000Z' },
    ]);
    expect(cursor).toBe('2026-10-09T03:00:00.000Z');
  });

  it('ignores null/invalid timestamps and returns null on empty pages', () => {
    expect(nextCursor([])).toBeNull();
    expect(nextCursor([{ updated_at: null }, { updated_at: 'invalid' }])).toBeNull();
    expect(nextCursor([{ updated_at: '2026-10-09T01:00:00.000Z' }, { updated_at: null }])).toBe(
      '2026-10-09T01:00:00.000Z'
    );
  });
});
