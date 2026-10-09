/** Nama event yang dipicu setelah runSync (push → reconcile → pull) berhasil. */
export const SYNCED_EVENT = 'sekolah-rapi:synced';

/** Notifikasi lintas-komponen bahwa data lokal (Dexie) sudah diperbarui. */
export function emitSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SYNCED_EVENT));
}
