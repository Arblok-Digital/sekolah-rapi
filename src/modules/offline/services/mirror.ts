import { db } from '@/modules/offline/db';

type MirrorTable = 'students' | 'spp_payments' | 'transactions' | 'categories' | 'schools';

function tableFor(table: MirrorTable) {
  switch (table) {
    case 'students':
      return db.students;
    case 'spp_payments':
      return db.spp_payments;
    case 'transactions':
      return db.transactions;
    case 'categories':
      return db.categories;
    case 'schools':
      return db.schools;
  }
}

async function safe(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    // Mirror adalah lapisan bonus (baca offline). Kegagalan (quota penuh,
    // dsb) tidak boleh menjatuhkan read yang sudah sukses dari jaringan.
    console.warn('[mirror] gagal menulis mirror lokal:', err);
  }
}

/**
 * Write-through mirror: panggil SETELAH read jaringan sukses dengan baris
 * hasil select KOLOM PENUH (tanpa join). Menjamin mirror lokal tidak pernah
 * lebih basi dari data server untuk tabel yang memang dibaca utuh.
 */
export async function mirrorFull(
  table: MirrorTable,
  rows: Array<Record<string, unknown> & { id: string }>
): Promise<void> {
  if (rows.length === 0) return;
  // Cast minimal: union antar-tabel Dexie bikin overload bulkPut tidak bisa
  // disimpulkan (signature antar anggota tidak kompatibel).
  const target = tableFor(table) as unknown as {
    bulkPut(items: Array<Record<string, unknown>>): Promise<unknown>;
  };
  await safe(() => target.bulkPut(rows).then(() => undefined));
}

/**
 * Mirror parsial (select hanya sebagian kolom): MERGE ke baris yang sudah
 * ada, jangan pernah membuat baris baru dari potongan kolom — baris parsial
 * bisa merusak read offline. Baris yang belum ada lokal dibiarkan (pull yang
 * akan melengkapinya).
 */
export async function mirrorPatch(
  table: MirrorTable,
  rows: Array<Record<string, unknown> & { id: string }>
): Promise<void> {
  if (rows.length === 0) return;
  await safe(async () => {
    const target = tableFor(table);
    for (const row of rows) {
      await target.update(row.id, row as never);
    }
  });
}
