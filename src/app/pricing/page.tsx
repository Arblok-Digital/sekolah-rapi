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
    <div className="min-h-screen bg-[#f7f4ed] text-[#17211b] overflow-x-hidden">
      {/* Background mesh */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_60%_20%,_rgba(184,212,75,0.14)_0%,_transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,_rgba(23,63,53,0.035)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgba(23,63,53,0.035)_1px,_transparent_1px)] bg-[size:40px_40px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#17211b]/10 bg-[#f7f4ed]/90 backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f35] text-sm font-black text-white shadow-[0_5px_0_#b8d44b]">
              SR
            </div>
            <span className="text-lg font-black">{APP_NAME}</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#59645d] hover:text-[#26735d] transition-colors">
            Login
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Harga <span className="text-[#26735d]">Transparan</span>
          </h1>
          <p className="text-lg text-[#59645d]">
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
                    ? 'bg-[#173f35] text-white ring-2 ring-[#173f35] shadow-[0_8px_0_#b8d44b] scale-[1.02]'
                    : 'bg-white/75 border border-[#17211b]/10 shadow-lg shadow-[#173f35]/5'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#b8d44b] text-[#17211b] text-xs font-black shadow-lg">
                      <Zap className="w-3 h-3" /> PALING DIREKOMENDASIKAN
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.highlight ? 'bg-[#b8d44b] text-[#17211b]' : 'bg-[#173f35] text-white'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl font-bold">{tier.priceLabel}</span>
                  <span className={tier.highlight ? 'text-white/70' : 'text-[#59645d]'}>{tier.billingLabel}</span>
                </div>
                <p className={`text-sm mb-6 ${tier.highlight ? 'text-white/70' : 'text-[#59645d]'}`}>{tier.description}</p>

                {/* CTA */}
                <Link
                  href={tier.href}
                  target={tier.plan === 'free' ? undefined : '_blank'}
                  rel={tier.plan === 'free' ? undefined : 'noopener noreferrer'}
                  className={`inline-flex items-center justify-center gap-1.5 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-6 ${
                    tier.highlight
                      ? 'bg-[#b8d44b] hover:bg-[#dfe99a] text-[#17211b]'
                      : 'bg-[#173f35] text-white hover:bg-[#205546] shadow-[0_5px_0_#b8d44b]'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Included features */}
                <div className="space-y-3 mb-6 flex-1">
                  <p className={`text-xs uppercase tracking-wider font-semibold ${tier.highlight ? 'text-white/60' : 'text-[#6f7972]'}`}>Termasuk</p>
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-[#b8d44b]' : 'text-[#26735d]'}`} />
                      <span className={tier.highlight ? 'text-sm text-white/85' : 'text-sm text-[#526158]'}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Excluded features */}
                {tier.missing.length > 0 && (
                  <div className={`space-y-3 pt-4 border-t ${tier.highlight ? 'border-white/15' : 'border-[#17211b]/10'}`}>
                    <p className={`text-xs uppercase tracking-wider font-semibold ${tier.highlight ? 'text-white/60' : 'text-[#6f7972]'}`}>Tidak termasuk</p>
                    {tier.missing.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-white/25' : 'text-[#17211b]/20'}`} />
                        <span className={`text-xs line-through ${tier.highlight ? 'text-white/45' : 'text-[#6f7972]'}`}>{f}</span>
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
            <details key={i} className="bg-white/75 rounded-2xl border border-[#17211b]/10 group">
              <summary className="px-6 py-4 cursor-pointer flex justify-between items-center font-medium">
                {faq.q}
                <span className="text-[#6f7972] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-6 pb-4 text-sm text-[#59645d]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <p className="text-[#59645d] text-sm mb-4">
          Masih bingung pilih paket yang sesuai? DM kami di WhatsApp untuk konsultasi gratis.
        </p>
        <a
          href="https://wa.me/6289508053795"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#173f35] hover:bg-[#205546] text-white px-6 py-3 rounded-full text-sm font-black shadow-[0_5px_0_#b8d44b] transition-all duration-200"
        >
          Tanya via WhatsApp
        </a>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#17211b]/10 bg-white/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Link href="/" className="text-sm font-semibold text-[#59645d] hover:text-[#26735d] transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </footer>
    </div>
  );
}