/**
 * Pasangan koreksi (reversal) — baris koreksi DAN transaksi aslinya saling
 * menghapus secara aritmetika.
 *
 * Aturan main:
 * - ANGKA ringkasan (Overview, Laporan, total audit) → pasangan DIKECUALKAN
 *   supaya pemasukan/pengeluaran tetap jujur sesuai uang yang benar-benar
 *   bergerak.
 * - RIWAYAT (tabel Kas, audit) → pasangan TETAP tampil (jejak audit), tapi
 *   diberi label "Koreksi" / "Diganti".
 */

/** Kumpulkan ID transaksi asli yang pernah dikoreksi (dari baris reversal). */
export function collectReversedSourceIds(
  rows: Array<{ source_type?: string | null; source_id?: string | null }>
): Set<string> {
  const ids = new Set<string>();
  rows.forEach((r) => {
    if (r.source_type === 'reversal' && r.source_id) ids.add(r.source_id);
  });
  return ids;
}

/** True bila baris ini anggota pasangan koreksi (baris koreksi, atau aslinya). */
export function isReversalPairMember(
  row: { id: string; source_type?: string | null },
  reversedIds: Set<string>
): boolean {
  return row.source_type === 'reversal' || reversedIds.has(row.id);
}

/** Filter untuk agregat: buang seluruh pasangan koreksi. */
export function excludeReversalPairs<T extends { id: string; source_type?: string | null }>(
  rows: T[],
  reversedIds: Set<string>
): T[] {
  return rows.filter((r) => !isReversalPairMember(r, reversedIds));
}
