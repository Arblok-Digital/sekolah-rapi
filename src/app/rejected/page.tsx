'use client';

import Link from 'next/link';

export default function RejectedPage() {
  return (
    <div className="min-h-screen bg-[#0a0818] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-glow-lg pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/25">
              SR
            </div>
            <span className="text-xl font-bold text-white">SekolahRapi</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/20">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Akun Ditolak</h1>
          <p className="text-white/70 mb-6">
            Maaf, akun sekolah Anda telah ditolak oleh admin. Silakan hubungi kami di nomor WhatsApp <strong>+6289508053795</strong> untuk informasi lebih lanjut.
          </p>

          <div className="space-y-4">
            <Link
              href="/contact"
              className="block w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/30"
            >
              Hubungi Admin
            </Link>
            <Link
              href="/login"
              className="block w-full text-white/70 hover:text-white py-3 rounded-xl font-medium transition-all duration-200"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}