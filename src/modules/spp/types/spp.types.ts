import type { SPPPayment as SharedSPPPayment } from '@/shared/types';

/** SPP payment status enum */
export type SPPStatus = 'paid' | 'partial' | 'unpaid';

/** Extended SPP payment with student info for display */
export interface SPPPayment extends SharedSPPPayment {
  student_name?: string;
  student_nis?: string;
  student_class?: string;
  /** Nama kategori Kas (join dari tabel categories). */
  category_name?: string;
  /** True when the bulan-payment (tagihan) belum dibuat — siswa dianggap belum bayar (konsisten dengan Overview). */
  no_bill?: boolean;
}

/** SPP payment summary record */
export interface SPSSummary {
  total_siswa: number;
  total_bulan_ini: number;
  terkumpul: number;
  outstanding: number;
  collection_rate: number;
}

/** SPP filter params */
export interface SPPFilter {
  month?: number;
  year?: number;
  status?: SPPStatus;
  student_id?: string;
  class?: string;
  /** Filter kategori Kas (categories.id). */
  category?: string;
}

/** Form input for creating a new SPP payment */
export interface SPPFormInput {
  student_id: string;
  /** Kategori Kas — kosong = kategori 'SPP' (fallback). */
  category_id?: string;
  /** null/undefined = pembayaran sekali jadi tanpa periode. */
  month?: number | null;
  year?: number | null;
  amount: number;
  paid_amount: number;
  payment_date?: string;
  method?: string;
  receipt_number?: string;
  status: SPPStatus;
}

/** Month names in Indonesian */
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Helper: get month name */
export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || `Bulan ${month}`;
}

/** Label periode untuk baris/tabel: "Oktober 2026", "2026", atau "-" (tanpa periode). */
export function formatPeriodLabel(month?: number | null, year?: number | null): string {
  if (month && year) return `${getMonthName(month)} ${year}`;
  if (year) return String(year);
  if (month) return getMonthName(month);
  return '-';
}

/** Helper: format currency in IDR */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
