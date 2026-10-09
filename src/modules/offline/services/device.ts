const DEVICE_ID_KEY = 'sekolah_rapi_device_id';

/**
 * ID perangkat yang persist di localStorage — dikirim sebagai kolom
 * `device_id` supaya konflik sync bisa ditelusuri perangkat mana yang
 * menulis baris terakhir. Dibuat sekali, tidak pernah berubah.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage bisa gagal (private mode) — id per sesi tetap lebih baik
    // daripada tidak ada sama sekali.
    return 'session';
  }
}
