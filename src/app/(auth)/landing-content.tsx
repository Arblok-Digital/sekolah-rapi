'use client';

import Link from 'next/link';
import { APP_NAME, POWERED_BY } from '@/shared/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* ── Animated background ── */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 bg-glow-lg pointer-events-none" />

      {/* ── Nav ── */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25">
              SR
            </div>
            <span className="text-lg font-bold text-white">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost-modern text-sm">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
            Offline-ready · Multi-sekolah · PWA
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Administrasi Keuangan
            <br />
            <span className="text-gradient">Sekolah yang Rapi</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Kelola SPP, kas masuk/keluar, dan pantau keuangan sekolah{' '}
            <span className="text-white/70">dari mana saja.</span>
            <br />
            Offline-ready, real-time, dan{' '}
            <span className="text-white/70">super mudah digunakan.</span>
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
            >
              Mulai Gratis Sekarang
            </Link>
            <Link
              href="/login"
              className="text-white/60 hover:text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200"
            >
              Sudah punya akun? Login →
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              ['100%', 'Offline Support'],
              ['Multi', 'Sekolah & Cabang'],
              ['5 Role', 'Akses Terpisah'],
              ['Gratis', 'Tanpa Biaya Lisensi'],
            ].map(([stat, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">{stat}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📱',
              title: 'Input dari HP',
              desc: 'Bendahara bisa input transaksi dari HP, bahkan offline. Auto-sync ke cloud pas online.',
            },
            {
              icon: '📊',
              title: 'Dashboard Owner',
              desc: 'Owner/yayasan pantau keuangan sekolah secara real-time dari mana saja.',
            },
            {
              icon: '🔒',
              title: 'Multi-Tenant Aman',
              desc: 'Setiap sekolah punya data terpisah. Aman, private, sesuai standar.',
            },
            {
              icon: '📋',
              title: 'Manajemen SPP',
              desc: 'Catat pembayaran per bulan, tracking tunggakan, cetak laporan otomatis.',
            },
            {
              icon: '💳',
              title: 'Kas Digital',
              desc: 'Pencatatan pemasukan & pengeluaran otomatis. Kategori rapih, riwayat lengkap.',
            },
            {
              icon: '📈',
              title: 'Laporan Keuangan',
              desc: 'Laporan laba rugi, neraca, AR/AP aging — siap audit kapan aja.',
            },
          ].map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="card-premium p-6 sm:p-7 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-2xl mb-4">{icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="glass rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-glow pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Siap Rapiin Keuangan Sekolah?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Gratis selamanya untuk fitur dasar. Upgrade kapan aja kalau sekolah udah makin besar.
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-xl shadow-indigo-600/25"
            >
              Mulai Gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <span className="text-[7px] text-white font-bold">AD</span>
              </div>
              <span>© 2026 {APP_NAME} — Powered by {POWERED_BY}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
