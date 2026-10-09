import Dexie, { Table } from 'dexie';
import type {
  Student,
  SPPPayment,
  Transaction,
  SyncQueueItem,
  Category,
  School,
  Profile,
} from '@/shared/types';

/**
 * Cursor sinkronisasi per tabel + per sekolah.
 * Key composite `${table}:${school_id}` — ganti sekolah = mulai dari awal.
 * Nilai `cursor` = ISO timestamp updated_at terakhir yang SUDAH diterapkan
 * ke mirror lokal (pull selalu pakai overlap beberapa detik, idempoten).
 */
export interface SyncCursor {
  /** Contoh: "transactions:uuid-sekolah" */
  id: string;
  table: string;
  school_id: string;
  cursor: string;
}

/** Baris tombstone dari server — dipakai saat pull, tidak disimpan lokal. */
export interface RemoteTombstone {
  table_name: 'students' | 'spp_payments' | 'transactions' | 'categories';
  row_id: string;
  school_id: string;
  deleted_at: string;
}

export class SekolahRapiDB extends Dexie {
  sync_queue!: Table<SyncQueueItem>;
  students!: Table<Student>;
  spp_payments!: Table<SPPPayment>;
  transactions!: Table<Transaction>;
  sync_cursors!: Table<SyncCursor, string>;
  // v2 — mirror penuh untuk read offline + plan-guard
  categories!: Table<Category>;
  schools!: Table<School, string>;
  profiles!: Table<Profile, string>;

  constructor() {
    super('SekolahRapiDB');
    this.version(1).stores({
      sync_queue: '++id, entity, entity_id, status, created_at',
      students: 'id, school_id, nis, class, status',
      spp_payments: 'id, school_id, student_id, month, year',
      transactions: 'id, school_id, type, category_id, reference_date',
    });
    // v2: tabel bacaan offline + state sync. Tabel v1 tidak diubah agar
    // instalasi yang sudah jalan upgrade mulus tanpa data hilang.
    this.version(2).stores({
      sync_cursors: 'id, table, school_id',
      categories: 'id, school_id, type, name',
      schools: 'id, plan, status',
      profiles: 'id, school_id',
    });
  }
}
