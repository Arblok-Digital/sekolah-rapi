import type { ReceiptData } from './types';
import { receiptNumber } from './types';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Kuitansi untuk satu baris Kas (pemasukan / pengeluaran = uang sudah bergerak). */
export function kasReceipt(opts: {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description?: string;
  categoryName?: string;
  method?: string;
  cashierName?: string;
}): ReceiptData {
  const label = opts.description?.trim() || opts.categoryName || 'Transaksi kas';
  return {
    title: opts.type === 'income' ? 'KUITANSI PENERIMAAN KAS' : 'KUITANSI PENGELUARAN KAS',
    number: receiptNumber(opts.id, opts.date),
    date: opts.date || todayISO(),
    direction: opts.type === 'income' ? 'in' : 'out',
    counterparty: label,
    lines: [{ label, detail: opts.categoryName ? `Kategori: ${opts.categoryName}` : undefined, amount: opts.amount }],
    total: opts.amount,
    method: opts.method,
    cashierName: opts.cashierName,
  };
}

/** Kuitansi SPP — hanya untuk status lunas / angsuran. */
export function sppReceipt(opts: {
  id: string;
  studentName: string;
  studentDetail?: string;
  month: number;
  year: number;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'partial';
  date?: string;
  method?: string;
  existingNumber?: string;
  cashierName?: string;
}): ReceiptData {
  const period = `${MONTHS_ID[opts.month - 1] || opts.month} ${opts.year}`;
  const paid = opts.paidAmount > 0 ? opts.paidAmount : opts.amount;
  return {
    title: opts.status === 'paid' ? 'KUITANSI PEMBAYARAN SPP' : 'KUITANSI ANGSURAN SPP',
    number: opts.existingNumber?.trim() || receiptNumber(opts.id, opts.date || todayISO()),
    date: opts.date || todayISO(),
    direction: 'in',
    counterparty: opts.studentName,
    lines: [
      {
        label: `SPP ${period}`,
        detail: [opts.studentDetail, opts.status === 'partial' ? `Total dibayar s/d kuitansi ini (tagihan ${opts.amount.toLocaleString('id-ID')})` : undefined].filter(Boolean).join(' • ') || undefined,
        amount: paid,
      },
    ],
    total: paid,
    method: opts.method,
    cashierName: opts.cashierName,
  };
}

/** Kuitansi slip gaji — hanya untuk slip yang sudah dibayar (paid). */
export function payrollReceipt(opts: {
  id: string;
  employeeName: string;
  position?: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deduction: number;
  total: number;
  date?: string;
  cashierName?: string;
  /** Rincian per kategori (BPJS, Kasbon, Insentif, ...) — bila ada, gantikan baris bonus/potongan. */
  breakdown?: { label: string; amount: number }[];
}): ReceiptData {
  const period = `${MONTHS_ID[opts.month - 1] || opts.month} ${opts.year}`;
  const lines: ReceiptData['lines'] =
    opts.breakdown && opts.breakdown.length > 0
      ? [{ label: `Gaji pokok ${period}`, amount: opts.baseSalary }, ...opts.breakdown]
      : [{ label: `Gaji pokok ${period}`, amount: opts.baseSalary }];
  if ((!opts.breakdown || opts.breakdown.length === 0) && opts.bonus > 0) lines.push({ label: 'Bonus / tunjangan', amount: opts.bonus });
  if ((!opts.breakdown || opts.breakdown.length === 0) && opts.deduction > 0) lines.push({ label: 'Potongan', amount: -opts.deduction });
  return {
    title: 'KUITANSI PEMBAYARAN GAJI',
    number: receiptNumber(opts.id, opts.date || todayISO()),
    date: opts.date || todayISO(),
    direction: 'out',
    counterparty: opts.position ? `${opts.employeeName} (${opts.position})` : opts.employeeName,
    lines,
    total: opts.total,
    cashierName: opts.cashierName,
  };
}

/** Kuitansi pembelian inventaris — hanya untuk item dengan harga beli > 0. */
export function inventoryReceipt(opts: {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  location?: string;
  date?: string;
  cashierName?: string;
}): ReceiptData {
  const total = opts.unitPrice * opts.quantity;
  return {
    title: 'KUITANSI PEMBELIAN BARANG',
    number: receiptNumber(opts.id, opts.date || todayISO()),
    date: opts.date || todayISO(),
    direction: 'out',
    counterpartyLabel: 'Dibayar untuk',
    counterparty: `${opts.quantity} × ${opts.itemName}`,
    lines: [
      {
        label: opts.itemName,
        detail: [`Jumlah: ${opts.quantity}`, opts.category ? `Kategori: ${opts.category}` : undefined, opts.location ? `Lokasi: ${opts.location}` : undefined].filter(Boolean).join(' • ') || undefined,
        amount: total,
      },
    ],
    total,
    cashierName: opts.cashierName,
  };
}
