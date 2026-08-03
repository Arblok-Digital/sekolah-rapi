'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { APP_NAME } from '@/shared/constants';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Fitur', href: '/fitur' },
  { label: 'Solusi', href: '/solusi' },
  { label: 'Panduan', href: '/panduan' },
  { label: 'Harga', href: '/pricing' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="relative z-20 border-b border-[#17211b]/10 bg-[#f7f4ed]/90 backdrop-blur-xl">
      <nav aria-label="Navigasi utama" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} beranda`}>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#173f35] text-sm font-black text-white shadow-[0_5px_0_#b8d44b]">
            SR
          </div>
          <span className="text-lg font-black text-[#17211b]">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative py-2 text-sm font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#26735d] after:transition-transform ${
                  active
                    ? 'text-[#173f35] after:scale-x-100'
                    : 'text-[#526158] hover:text-[#26735d] after:scale-x-0 hover:after:scale-x-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-[#526158] hover:text-[#26735d] transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-black text-white shadow-[0_5px_0_#b8d44b] transition hover:-translate-y-0.5 hover:bg-[#205546]"
          >
            Coba Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/70 border border-[#17211b]/15 text-[#173f35] hover:bg-white transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-[#fffdf7] border border-[#17211b]/10 rounded-2xl p-4 space-y-1 shadow-xl shadow-[#173f35]/10">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#dfe99a]/45 text-[#173f35]'
                      : 'text-[#526158] hover:bg-[#dfe99a]/35 hover:text-[#173f35]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 mt-3 border-t border-[#17211b]/10 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-center text-sm font-semibold text-[#526158] hover:text-[#173f35] hover:bg-[#dfe99a]/35 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-full text-center text-sm font-black bg-[#173f35] text-white shadow-[0_5px_0_#b8d44b]"
              >
                Coba Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
