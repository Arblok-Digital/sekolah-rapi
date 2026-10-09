import { describe, it, expect } from 'vitest';
import { computeDashboard } from '@/modules/dashboard/services/dashboard.service';

const NOW = new Date('2026-10-09T10:00:00Z');

function tx(over: Partial<{ id: string; type: string; amount: number; source_type: string | null; source_id: string | null }> = {}) {
  return {
    id: 'tx-1',
    type: 'income',
    amount: 100_000,
    source_type: null,
    source_id: null,
    ...over,
  };
}

describe('computeDashboard', () => {
  it('returns zeros and the empty-school alert on empty input', () => {
    const out = computeDashboard({
      monthTx: [],
      allTx: [],
      students: [],
      sppMonth: [],
      sppCategoryId: null,
      now: NOW,
    });
    expect(out).toMatchObject({
      saldo: 0,
      incomeBulanIni: 0,
      expenseBulanIni: 0,
      totalSiswa: 0,
      outstandingSiswa: 0,
      collectionRate: 0,
    });
    expect(out.alerts.map((a) => a.title)).toContain('Belum ada siswa');
  });

  it('computes saldo and monthly figures from real (non-reversed) money', () => {
    const out = computeDashboard({
      monthTx: [
        tx({ id: 'a', type: 'income', amount: 500_000 }),
        tx({ id: 'b', type: 'expense', amount: 200_000 }),
      ],
      allTx: [
        tx({ id: 'a', type: 'income', amount: 500_000 }),
        tx({ id: 'b', type: 'expense', amount: 200_000 }),
        tx({ id: 'c', type: 'income', amount: 1_000_000 }),
      ],
      students: [{ status: 'active' }, { status: 'active' }, { status: 'inactive' }],
      sppMonth: [
        { student_id: 's1', status: 'paid', category_id: 'k-spp' },
        { student_id: 's2', status: 'unpaid', category_id: 'k-spp' },
      ],
      sppCategoryId: 'k-spp',
      now: NOW,
    });

    expect(out.saldo).toBe(1_300_000);
    expect(out.incomeBulanIni).toBe(500_000);
    expect(out.expenseBulanIni).toBe(200_000);
    expect(out.totalSiswa).toBe(2);
    expect(out.outstandingSiswa).toBe(1);
    expect(out.collectionRate).toBe(50);
  });

  it('excludes reversal pairs from every aggregate', () => {
    const out = computeDashboard({
      monthTx: [
        tx({ id: 'orig', type: 'income', amount: 300_000 }),
        tx({ id: 'rev', type: 'expense', amount: 300_000, source_type: 'reversal', source_id: 'orig' }),
      ],
      allTx: [
        tx({ id: 'orig', type: 'income', amount: 300_000 }),
        tx({ id: 'rev', type: 'expense', amount: 300_000, source_type: 'reversal', source_id: 'orig' }),
      ],
      students: [{ status: 'active' }],
      sppMonth: [],
      sppCategoryId: null,
      now: NOW,
    });

    // Pasangan koreksi saling menghapus — bukan income 300k / expense 300k.
    expect(out.saldo).toBe(0);
    expect(out.incomeBulanIni).toBe(0);
    expect(out.expenseBulanIni).toBe(0);
  });

  it('limits SPP health to the SPP category when one exists', () => {
    const out = computeDashboard({
      monthTx: [],
      allTx: [],
      students: [{ status: 'active' }, { status: 'active' }],
      sppMonth: [
        { student_id: 's1', status: 'paid', category_id: 'k-spp' },
        { student_id: 's2', status: 'paid', category_id: 'k-lain' },
      ],
      sppCategoryId: 'k-spp',
      now: NOW,
    });

    // Hanya tagihan kategori SPP yang dihitung → 1 dari 2 lunas = 50%.
    expect(out.collectionRate).toBe(50);
    expect(out.outstandingSiswa).toBe(1);
  });

  it('counts partial payments as collected and flags the overdue alert', () => {
    const out = computeDashboard({
      monthTx: [],
      allTx: [],
      students: [{ status: 'active' }, { status: 'active' }, { status: 'active' }],
      sppMonth: [{ student_id: 's1', status: 'partial', category_id: null }],
      sppCategoryId: null,
      now: NOW,
    });
    expect(out.outstandingSiswa).toBe(2);
    expect(out.alerts.some((a) => a.title.includes('menunggak SPP'))).toBe(true);
  });
});
