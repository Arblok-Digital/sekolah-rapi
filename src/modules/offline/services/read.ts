import { isOfflineError } from './network';

/**
 * Baca network-first dengan fallback lokal.
 *
 * - Sukses jaringan → hasil jaringan (caller wajib mirror dulu, lihat mirror.ts).
 * - Gagal karena jaringan mati → baca mirror lokal.
 * - Gagal karena alasan bisnis (RLS, validasi, duplikat) → LEMPAR — jangan
 *   pernah menutupi error nyata dengan data basi.
 */
export async function withOfflineFallback<T>(
  network: () => Promise<T>,
  local: () => Promise<T>
): Promise<T> {
  try {
    return await network();
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    return local();
  }
}
