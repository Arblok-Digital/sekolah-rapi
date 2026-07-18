import Dexie, { Table } from 'dexie';
import type { Student, SPPPayment, Transaction, SyncQueueItem } from '@/shared/types';

export class SekolahRapiDB extends Dexie {
  sync_queue!: Table<SyncQueueItem>;
  students!: Table<Student>;
  spp_payments!: Table<SPPPayment>;
  transactions!: Table<Transaction>;

  constructor() {
    super('SekolahRapiDB');
    this.version(1).stores({
      sync_queue: '++id, entity, entity_id, status, created_at',
      students: 'id, school_id, nis, class, status',
      spp_payments: 'id, school_id, student_id, month, year',
      transactions: 'id, school_id, type, category_id, reference_date',
    });
  }
}
