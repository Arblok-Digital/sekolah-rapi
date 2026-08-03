'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { APP_NAME } from '@/shared/constants';

const navLinks = [
  { label: 'Fitur', href: '/fitur' },
  { label: 'Solusi', href: '/solusi' },
  { label: 'Panduan', href: '/panduan' },
  { label: 'Harga', href: '/pricing' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-10">
      <nav aria-label="Navigasi utama" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${APP_NAME} beranda`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#3a1fb8] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#7c5cff]/20">
            SR
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] hover:from-[#6a4aff] hover:to-[#4a2df0] text-white shadow-lg shadow-[#7c5cff]/25 transition-all duration-200"
          >
            Coba Gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-[#12102b] border border-white/10 rounded-2xl p-4 space-y-1 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-center text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-[#7c5cff] to-[#5b3df0] text-white shadow-lg shadow-[#7c5cff]/25"
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
