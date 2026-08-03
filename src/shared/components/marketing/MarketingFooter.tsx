import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { APP_NAME, POWERED_BY } from '@/shared/constants';

const productLinks = [
  { label: 'Fitur', href: '/fitur' },
  { label: 'Harga', href: '/pricing' },
  { label: 'Daftar', href: '/register' },
];

const guideLinks = [{ label: 'Panduan', href: '/panduan' }];

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} beranda`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7c5cff]/20">
              SR
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </Link>
          <p className="text-sm text-white/70 max-w-xs leading-relaxed">
            Administrasi operasional sekolah dalam satu dashboard. Data siswa, SPP, kas, pendaftaran, inventaris, dan penggajian tetap rapi.
          </p>
        </div>

        <div>
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Produk</h3>
          <ul className="space-y-3">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Panduan</h3>
          <ul className="space-y-3">
            {guideLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-4">Kontak</h3>
          <a
            href="https://wa.me/6289508053795"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#7c5cff]" />
            WhatsApp
          </a>
          <p className="mt-3 text-xs text-white/50 leading-relaxed">
            Hubungi kami untuk demo atau aktivasi akun.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>Powered by {POWERED_BY}</p>
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
