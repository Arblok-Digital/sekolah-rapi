export interface ReceiptSchool {
  name: string;
  address?: string;
  phone?: string;
}

export interface ReceiptLine {
  label: string;
  detail?: string;
  amount: number;
}

export type ReceiptDirection = 'in' | 'out';

export interface ReceiptData {
  /** Judul kop, mis. "KUITANSI PEMBAYARAN SPP" */
  title: string;
  /** Nomor kuitansi stabil, mis. "1234/KW/IX/2026" */
  number: string;
  /** Tanggal transaksi (ISO yyyy-mm-dd) */
  date: string;
  direction: ReceiptDirection;
  /** Nama pembayar (in) / penerima (out) */
  counterparty: string;
  /** Label kustom pengganti "Telah terima dari" / "Dibayarkan kepada" */
  counterpartyLabel?: string;
  /** Baris rincian */
  lines: ReceiptLine[];
  total: number;
  /** Tunai / Transfer / dst (opsional) */
  method?: string;
  /** Nama bendahara/kasir penanda tangan */
  cashierName?: string;
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Nomor kuitansi deterministik dari id record — stabil di setiap render,
 * tanpa perlu kolom tambahan di database.
 */
export function receiptNumber(id: string, dateISO: string): string {
  const hex = id.replace(/-/g, '').slice(0, 8);
  const parsed = parseInt(hex, 16);
  const seq = (Number.isNaN(parsed) ? Math.abs(hash(id)) : parsed) % 9000 + 1000;
  const d = new Date(dateISO || new Date().toISOString());
  const month = Number.isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
  const year = Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  return `${seq}/KW/${ROMAN[month]}/${year}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function schoolInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'SR';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
