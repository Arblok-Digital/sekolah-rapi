export type Timeframe = 'today' | '7d' | 'month' | 'lastmonth' | 'year' | 'all' | 'custom';

export const TIMEFRAME_LABELS: Record<Exclude<Timeframe, 'custom'>, string> = {
  today: 'Hari Ini',
  '7d': '7 Hari',
  month: 'Bulan Ini',
  lastmonth: 'Bulan Lalu',
  year: 'Tahun Ini',
  all: 'Semua',
};

export function localIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function timeframeRange(tf: Exclude<Timeframe, 'custom'>): { start: string; end: string } {
  const now = new Date();
  switch (tf) {
    case 'today':
      return { start: localIso(now), end: localIso(now) };
    case '7d': {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      return { start: localIso(s), end: localIso(now) };
    }
    case 'month':
      return { start: localIso(new Date(now.getFullYear(), now.getMonth(), 1)), end: localIso(now) };
    case 'lastmonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const e = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: localIso(s), end: localIso(e) };
    }
    case 'year':
      return { start: `${now.getFullYear()}-01-01`, end: localIso(now) };
    case 'all':
      return { start: '', end: '' };
  }
}

export function inTimeframe(
  referenceDate: string,
  tf: Timeframe,
  startDate: string,
  endDate: string
): boolean {
  const d = (referenceDate || '').slice(0, 10);
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}
