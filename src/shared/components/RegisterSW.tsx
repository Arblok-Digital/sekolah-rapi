'use client';

import { useEffect } from 'react';

/**
 * Daftarkan service worker PWA.
 * next-pwa (register: true) hanya menyuntik skrip registrasi ke bundle Pages Router,
 * sedangkan app ini murni App Router — jadi registrasi dipasang manual di sini.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Gagal daftar tidak boleh mengganggu aplikasi.
    });
  }, []);

  return null;
}
