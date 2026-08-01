'use client';

import Link from 'next/link';
import { APP_NAME } from '@/shared/constants';
import { ArrowRight, CheckCircle, Zap, Star } from 'lucide-react';
import { PRICING_PLANS } from '@/shared/entitlements';

export const dynamic = 'force-dynamic';

const tiers = PRICING_PLANS.map((pricing) => ({
  ...pricing,
  highlight: pricing.plan === 'pro',
  icon: pricing.plan === 'pro' ? Zap : pricing.plan === 'basic' ? Star : CheckCircle,
}));

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0818] text-white overflow-x-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_60%_20%,_rgba(124,92,255,0.06)_0%,_transparent_60%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,_rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7c5cff]/20">
              SR
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Login
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Harga <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c5cff] to-[#22c98e]">Transparan</span>
          </h1>
          <p className="text-lg text-white/70">
            Mulai gratis. Upgrade saat sekolah Anda butuh lebih. Tidak ada biaya tersembunyi — bayar 1x per tahun penuh akses.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.plan}
                className={`relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-white/5 to-transparent ring-2 ring-[#7c5cff]/40 shadow-xl shadow-[#7c5cff]/10 scale-[1.02]'
                    : 'bg-[#12102b] border border-white/5'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] text-white text-xs font-semibold shadow-lg">
                      <Zap className="w-3 h-3" /> PALING DIREKOMENDASIKAN
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl font-bold">{tier.priceLabel}</span>
                  <span className="text-white/70">{tier.billingLabel}</span>
                </div>
                <p className="text-sm text-white/70 mb-6">{tier.description}</p>

                {/* CTA */}
                <Link
                  href={tier.href}
                  target={tier.plan === 'free' ? undefined : '_blank'}
                  rel={tier.plan === 'free' ? undefined : 'noopener noreferrer'}
                  className={`inline-flex items-center justify-center gap-1.5 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-6 ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white shadow-xl shadow-[#7c5cff]/25'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Included features */}
                <div className="space-y-3 mb-6 flex-1">
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Termasuk</p>
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-[#22c98e] shrink-0" />
                      <span className="text-sm text-white/80">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Excluded features */}
                {tier.missing.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Tidak termasuk</p>
                    {tier.missing.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-white/15 shrink-0" />
                        <span className="text-xs text-white/40 line-through">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ light */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">Pertanyaan Umum</h2>
        <div className="space-y-4">
          {[
            { q: 'Kenapa pendaftaran online dan dashboard realtime ada di Pro?', a: 'Keduanya menyelesaikan bottleneck lintas pihak: orang tua mendaftar dari luar sekolah, operator memproses data, dan owner memantau hasil dari mana saja. Karena membutuhkan alur publik, kontrol akses, serta sinkronisasi realtime, fitur ini ditempatkan sebagai nilai utama Pro.' },
            { q: 'Bagaimana cara upgrade?', a: 'Klik tombol Upgrade di dashboard atau hubungi kami via WA di +6289508053795. Kami akan proses dan aktifkan plan dalam 1x24 jam.' },
            { q: 'Apakah ada biaya tersembunyi?', a: 'Tidak ada. Harga yang tertera adalah langganan per tahun penuh. Tidak ada biaya setup, biaya per pengguna, atau biaya tambahan lainnya.' },
            { q: 'Bisa ganti plan setelah bayar?', a: 'Ya. Bisa upgrade kapan saja dengan bayar selisih. Misalnya dari Basic ke Pro bayar Rp 500.000 di tengah tahun.' },
            { q: 'Apakah database harus disimpan di komputer sekolah?', a: 'Tidak. Database cloud Supabase membuat dashboard bisa dipantau owner dari HP di mana saja. Data dipisahkan per sekolah dengan school_id dan Row Level Security; backup lokal berkala dapat ditambahkan untuk kebutuhan operasional, tetapi bukan database utama.' },
          ].map((faq, i) => (
            <details key={i} className="bg-[#12102b] rounded-2xl border border-white/5 group">
              <summary className="px-6 py-4 cursor-pointer flex justify-between items-center font-medium">
                {faq.q}
                <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-white/70">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <p className="text-white/70 text-sm mb-4">
          Masih bingung pilih paket yang sesuai? DM kami di WhatsApp untuk konsultasi gratis.
        </p>
        <a
          href="https://wa.me/6289508053795"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
        >
          Tanya via WhatsApp
        </a>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </footer>
    </div>
  );
}