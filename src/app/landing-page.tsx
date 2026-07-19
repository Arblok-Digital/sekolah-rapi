'use client';

export const dynamic = 'force-dynamic'; // Disable prerendering for this page

import Link from 'next/link';
import { APP_NAME, POWERED_BY } from '@/shared/constants';
import { ArrowRight, BarChart2, BookOpen, CreditCard, Users, Zap } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0818] text-white overflow-x-hidden">
      {/* Background: subtle mesh gradient + faint grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.05)_0%,_transparent_70%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.03)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7c5cff]/20">
              SR
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#7c5cff]/30 hover:shadow-[#6a4aff]/40"
            >
              Daftar Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline + CTA */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Administrasi Keuangan Sekolah
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cff] to-[#22c98e]">Lebih Rapi, Lebih Cepat</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                Kelola SPP, kas, inventaris, dan laporan keuangan sekolah dengan mudah — offline-ready, real-time, dan aman.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/register"
                className="bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-xl shadow-[#7c5cff]/30 hover:shadow-[#6a4aff]/50 active:scale-[0.98]"
              >
                Mulai Gratis Sekarang
              </Link>
              <Link
                href="/login"
                className="text-white/70 hover:text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                Sudah punya akun? Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative hidden lg:block">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-[#7c5cff]/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-[#12102b] p-2 flex items-center gap-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="bg-[#0a0818] p-6 h-[400px] flex flex-col gap-4">
                {/* Mock dashboard content */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-xs">
                      SR
                    </div>
                    <div>
                      <p className="text-sm font-semibold">SMP Harapan Bangsa</p>
                      <p className="text-xs text-white/70">Dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#22c98e] flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-white/70">Online</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#12102b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-white/70">Saldo Kas</p>
                    <p className="text-xl font-bold text-[#22c98e]">Rp 48.750.000</p>
                  </div>
                  <div className="bg-[#12102b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-white/70">Pemasukan Bulan Ini</p>
                    <p className="text-xl font-bold text-[#7c5cff]">Rp 12.300.000</p>
                  </div>
                  <div className="bg-[#12102b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-white/70">Pengeluaran Bulan Ini</p>
                    <p className="text-xl font-bold text-red-400">Rp 8.500.000</p>
                  </div>
                </div>
                <div className="bg-[#12102b] p-4 rounded-xl border border-white/5 flex-1">
                  <p className="text-sm font-semibold mb-2">Transaksi Terbaru</p>
                  <div className="space-y-2">
                    {['SPP Bulan Juli', 'Pembelian ATK', 'Gaji Guru'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{item}</span>
                        <span className="font-semibold">{i % 2 === 0 ? '+Rp 2.500.000' : '-Rp 1.200.000'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#7c5cff]/10 to-transparent rounded-2xl blur-xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: <Zap className="w-6 h-6" />, value: '100%', label: 'Offline Support' },
            { icon: <Users className="w-6 h-6" />, value: 'Multi', label: 'Sekolah & Cabang' },
            { icon: <CreditCard className="w-6 h-6" />, value: '5 Role', label: 'Akses Terpisah' },
            { icon: <BookOpen className="w-6 h-6" />, value: 'Gratis', label: 'Tanpa Biaya Lisensi' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#12102b] p-6 rounded-2xl border border-white/5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c5cff]/20 to-[#3a1fb8]/20 flex items-center justify-center mx-auto mb-4 border border-[#7c5cff]/10">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <CreditCard className="w-6 h-6" />,
              title: 'Manajemen SPP',
              desc: 'Catat pembayaran SPP per siswa, tracking tunggakan, dan cetak laporan otomatis.',
            },
            {
              icon: <BarChart2 className="w-6 h-6" />,
              title: 'Kas Digital',
              desc: 'Pencatatan pemasukan & pengeluaran dengan kategori rapih dan riwayat lengkap.',
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: 'Manajemen Siswa',
              desc: 'Daftar siswa, kelas, dan data akademik — impor dari Excel atau input manual.',
            },
            {
              icon: <BookOpen className="w-6 h-6" />,
              title: 'Laporan Keuangan',
              desc: 'Laporan laba rugi, neraca, dan arus kas — siap untuk audit atau presentasi yayasan.',
            },
            {
              icon: <Zap className="w-6 h-6" />,
              title: 'Realtime & Offline',
              desc: 'Data tersinkronisasi otomatis saat online, tetap bisa input saat offline.',
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: 'Multi-Tenant Aman',
              desc: 'Setiap sekolah punya data terpisah dan aman — sesuai standar privasi pendidikan.',
            },
          ].map((feature, i) => (
            <div key={i} className="bg-[#12102b] p-6 rounded-2xl border border-white/5 hover:border-[#7c5cff]/20 transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#12102b] rounded-3xl p-12 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,92,255,0.1)_0%,_transparent_80%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Siap Rapiin Keuangan Sekolah?</h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Gratis selamanya untuk fitur dasar. Upgrade kapan saja saat sekolah Anda berkembang.
            </p>
            <Link
              href="/register"
              className="inline-block bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-xl shadow-[#7c5cff]/25"
            >
              Mulai Gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7c5cff]/20">
                  SR
                </div>
                <span className="text-lg font-bold">{APP_NAME}</span>
              </Link>
              <p className="text-sm text-white/70">Administrasi keuangan sekolah yang modern dan mudah digunakan.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Produk</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/features" className="hover:text-white transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Harga</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Dokumentasi</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Karir</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Syarat</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/70">© {new Date().getFullYear()} {APP_NAME}. Hak cipta dilindungi.</p>
            <p className="text-sm text-white/70">Powered by {POWERED_BY}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}