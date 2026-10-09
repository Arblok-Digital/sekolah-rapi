/*
 * Dimuat ke dalam sw.js via workbox importScripts (lihat next.config.mjs).
 * Pemanasan cache start_url saat service worker terpasang, supaya membuka app
 * dari ikon layar utama saat offline langsung punya isi walaupun halaman
 * tersebut belum pernah dikunjungi dalam keadaan terkendali SW.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open('start-url')
      .then((cache) => cache.add('/'))
      .catch(() => {
        // Offline saat install? Biar dilewati — cache terisi di kunjungan berikutnya.
      }),
  );
});
